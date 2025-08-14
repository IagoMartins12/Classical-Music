// app/api/teacher/students/route.ts - ATUALIZADO para processar plano de estudos

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';
import { createToken } from '@/app/libs/tokenUtils';

// Função auxiliar para revalidar cache de teacher students
async function revalidateTeacherStudentsData(
  teacherUserId: string,
  studentUserId?: string
) {
  console.log(`🔄 [CACHE] Revalidating teacher students data`);

  // Tags específicas de teacher students
  revalidateTag('teacher-students');
  revalidateTag('teacher-students-data');
  revalidateTag('teacher-student-detail');
  revalidateTag('teacher-student-detail-data');
  revalidateTag('teacher-dashboard');
  revalidateTag('teacher-dashboard-data');
  revalidateTag('teacher-calendar');
  revalidateTag('teacher-calendar-data');

  // Tag específica do professor
  revalidateTag(`teacher-${teacherUserId}`);

  // Se tiver studentUserId, revalidar tags do aluno também
  if (studentUserId) {
    revalidateTag('student-dashboard');
    revalidateTag('student-lessons');
    revalidateTag(`student-${studentUserId}`);
  }

  console.log(
    `✅ [CACHE] Teacher students cache revalidated for teacher ${teacherUserId}${
      studentUserId ? ` and student ${studentUserId}` : ''
    }`
  );
}

// GET - Listar alunos do professor (sem mudanças - sem revalidação)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active'; // active, inactive, all
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log(
      `📋 [TEACHER-STUDENTS] Listando alunos do professor ${session.user.id}`
    );

    // Verificar se professor existe
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    // Montar where clause
    const whereClause: any = {
      teacherId: teacherProfile.id,
    };

    if (status === 'active') {
      whereClause.isActive = true;
    } else if (status === 'inactive') {
      whereClause.isActive = false;
    }
    // 'all' não adiciona filtro

    // Buscar relacionamentos professor-aluno
    const [relationships, totalCount] = await Promise.all([
      prisma.teacherStudent.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  image: true,
                  phone: true,
                  city: true,
                  state: true,
                  experienceLevel: true,
                },
              },
            },
          },
        },
        orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }],
        take: limit,
        skip: offset,
      }),
      prisma.teacherStudent.count({ where: whereClause }),
    ]);

    // Formatar dados dos alunos
    const studentsFormatted = await Promise.all(
      relationships.map(async (rel) => {
        // Buscar estatísticas das aulas
        const lessonStats = await prisma.lesson.groupBy({
          by: ['status'],
          where: {
            teacherId: teacherProfile.id,
            studentId: rel.student.id,
          },
          _count: { id: true },
        });

        const totalLessons = lessonStats.reduce(
          (sum, stat) => sum + stat._count.id,
          0
        );
        const completedLessons =
          lessonStats.find((s) => s.status === 'COMPLETED')?._count.id || 0;
        const scheduledLessons =
          lessonStats.find((s) => s.status === 'SCHEDULED')?._count.id || 0;
        const cancelledLessons =
          lessonStats.find((s) => s.status === 'CANCELLED')?._count.id || 0;

        // Próxima aula agendada
        const nextLesson = await prisma.lesson.findFirst({
          where: {
            teacherId: teacherProfile.id,
            studentId: rel.student.id,
            status: 'SCHEDULED',
            scheduledAt: {
              gte: new Date(),
            },
          },
          orderBy: { scheduledAt: 'asc' },
          select: {
            id: true,
            scheduledAt: true,
            title: true,
            duration: true,
          },
        });
        let inviteStatus = rel.inviteStatus || 'PENDING';

        if (!rel.inviteStatus) {
          const studentUser = await prisma.user.findUnique({
            where: { id: rel.student.userId },
            select: { isStudent: true },
          });

          inviteStatus = studentUser?.isStudent ? 'ACCEPTED' : 'PENDING';
        }

        return {
          relationshipId: rel.id,
          student: {
            id: rel.student.user.id,
            name: `${rel.student.user.firstName || ''} ${
              rel.student.user.lastName || ''
            }`.trim(),
            email: rel.student.user.email,
            image: rel.student.user.image,
            phone: rel.student.user.phone,
            location:
              [rel.student.user.city, rel.student.user.state]
                .filter(Boolean)
                .join(', ') || null,
            experienceLevel: rel.student.user.experienceLevel,
            level: rel.student.level,
            mainInstrument: rel.student.mainInstrument,
            musicalGoals: rel.student.musicalGoals,
            practiceTime: rel.student.practiceTime,

            // 🆕 NOVO: Status do convite
            inviteStatus,
            inviteAcceptedAt: rel.inviteAcceptedAt,
            inviteDeclinedAt: rel.inviteDeclinedAt,
          },
          relationship: {
            isActive: rel.isActive,
            startDate: rel.startDate,
            endDate: rel.endDate,
            pausedAt: rel.pausedAt,
            pauseReason: rel.pauseReason,
            maxLessonsPerWeek: rel.maxLessonsPerWeek,
            lessonDuration: rel.lessonDuration,
            preferredDays: rel.preferredDays,
            preferredTimes: rel.preferredTimes,
            learningPlan: rel.learningPlan,
            currentFocus: rel.currentFocus,
            teacherNotes: rel.teacherNotes,
          },
          stats: {
            totalLessons,
            completedLessons,
            scheduledLessons,
            cancelledLessons,
            completionRate:
              totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
          },
          nextLesson,
        };
      })
    );

    console.log(
      `✅ [TEACHER-STUDENTS] Retornando ${studentsFormatted.length} alunos`
    );

    return NextResponse.json({
      success: true,
      students: studentsFormatted,
      pagination: {
        offset,
        limit,
        total: totalCount,
        hasMore: offset + studentsFormatted.length < totalCount,
      },
      summary: {
        total: totalCount,
        active: studentsFormatted.filter((s) => s.relationship.isActive).length,
        inactive: studentsFormatted.filter((s) => !s.relationship.isActive)
          .length,
      },
    });
  } catch (error) {
    console.error('❌ [TEACHER-STUDENTS] Erro ao listar alunos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Vincular novo aluno COM REVALIDAÇÃO E PLANO DE ESTUDOS COMPLETO
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      studentUserId,
      maxLessonsPerWeek = 1,
      lessonDuration = 60,
      preferredDays = [],
      preferredTimes = [],
      learningPlan,
      currentFocus = [],
      teacherNotes,
      // 🆕 NOVOS CAMPOS DO PLANO DE ESTUDOS
      studyGoals,
      practiceFrequency,
      homeworkExpectation,
      specialInstructions,
    } = body;

    if (!studentUserId) {
      return NextResponse.json(
        { error: 'studentUserId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `🔗 [TEACHER-STUDENTS] Vinculando aluno ${studentUserId} ao professor ${session.user.id} com plano de estudos:`,
      {
        maxLessonsPerWeek,
        lessonDuration,
        preferredDaysCount: preferredDays?.length || 0,
        preferredTimesCount: preferredTimes?.length || 0,
        currentFocusCount: currentFocus?.length || 0,
        hasLearningPlan: !!learningPlan,
        hasStudyGoals: !!studyGoals,
        practiceFrequency,
        homeworkExpectation,
        hasSpecialInstructions: !!specialInstructions,
      }
    );

    // Verificar se professor existe e buscar dados do professor
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        specialties: true,
        experience: true,
      },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se usuário existe e é aluno (role 0)
    const studentUser = await prisma.user.findFirst({
      where: {
        id: studentUserId,
        role: 0, // Apenas alunos
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!studentUser) {
      return NextResponse.json(
        { error: 'Aluno não encontrado ou usuário não é aluno' },
        { status: 404 }
      );
    }

    // Buscar dados do professor atual (user) para o email
    const teacherUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    const teacherName = teacherUser
      ? `${teacherUser.firstName || ''} ${teacherUser.lastName || ''}`.trim() ||
        'Professor'
      : 'Professor';

    // Criar ou buscar perfil de Student
    let studentProfile = await prisma.student.findUnique({
      where: { userId: studentUserId },
      select: { id: true },
    });

    if (!studentProfile) {
      console.log(
        `👨‍🎓 [TEACHER-STUDENTS] Criando perfil de aluno para ${studentUserId}`
      );
      studentProfile = await prisma.student.create({
        data: {
          userId: studentUserId,
          level: 'BEGINNER',
          status: 'ACTIVE',
        },
        select: { id: true },
      });
    }

    // Verificar se relacionamento já existe
    const existingRelationship = await prisma.teacherStudent.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: teacherProfile.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (existingRelationship) {
      if (existingRelationship.isActive) {
        return NextResponse.json(
          { error: 'Aluno já está vinculado a este professor' },
          { status: 409 }
        );
      } else {
        // Reativar relacionamento existente COM NOVOS DADOS DO PLANO
        const reactivatedRelationship = await prisma.teacherStudent.update({
          where: { id: existingRelationship.id },
          data: {
            isActive: true,
            endDate: null,
            pausedAt: null,
            pauseReason: null,
            maxLessonsPerWeek,
            lessonDuration,
            preferredDays,
            preferredTimes,
            learningPlan: learningPlan || null,
            currentFocus,
            teacherNotes: teacherNotes || null,
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        });

        console.log(
          `🔄 [TEACHER-STUDENTS] Relacionamento reativado com plano de estudos atualizado: ${reactivatedRelationship.id}`
        );

        // Revalidar cache
        await revalidateTeacherStudentsData(session.user.id, studentUserId);

        return NextResponse.json({
          success: true,
          relationship: reactivatedRelationship,
          message:
            'Aluno vinculado novamente com sucesso e plano de estudos atualizado!',
          reactivated: true,
        });
      }
    }

    // 🆕 COMPILAR PLANO DE APRENDIZADO DETALHADO
    const detailedLearningPlan = [
      learningPlan || '',
      studyGoals ? `\n\n📋 OBJETIVOS DE ESTUDO:\n${studyGoals}` : '',
      practiceFrequency
        ? `\n\n🎯 FREQUÊNCIA DE PRÁTICA:\n${practiceFrequency}`
        : '',
      homeworkExpectation
        ? `\n\n📚 EXPECTATIVA DE TAREFAS:\n${homeworkExpectation}`
        : '',
      specialInstructions
        ? `\n\n⚠️ INSTRUÇÕES ESPECIAIS:\n${specialInstructions}`
        : '',
    ]
      .filter(Boolean)
      .join('')
      .trim();

    // 🆕 COMPILAR NOTAS DO PROFESSOR COM INFORMAÇÕES EXTRA
    const compiledTeacherNotes = [
      teacherNotes || '',
      practiceFrequency
        ? `\nFrequência de prática preferida: ${practiceFrequency}`
        : '',
      homeworkExpectation
        ? `\nExpectativa de tarefas: ${homeworkExpectation}`
        : '',
      specialInstructions
        ? `\nInstruções especiais: ${specialInstructions}`
        : '',
    ]
      .filter(Boolean)
      .join('')
      .trim();

    // Criar novo relacionamento COM PLANO COMPLETO
    const newRelationship = await prisma.teacherStudent.create({
      data: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
        maxLessonsPerWeek,
        lessonDuration,
        preferredDays,
        preferredTimes,
        learningPlan: detailedLearningPlan || null,
        currentFocus,
        teacherNotes: compiledTeacherNotes || null,
        isActive: true,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    console.log(
      `✅ [TEACHER-STUDENTS] Novo relacionamento criado com plano de estudos completo: ${newRelationship.id}`,
      {
        learningPlanLength: detailedLearningPlan.length,
        teacherNotesLength: compiledTeacherNotes.length,
        preferredDaysCount: preferredDays.length,
        currentFocusCount: currentFocus.length,
      }
    );

    // 🆕 ENVIAR EMAIL DE CONVITE COM DETALHES DO PLANO
    if (studentUser.email) {
      try {
        // Criar tokens para aceitar/recusar convite
        const acceptToken = await createToken({
          userId: studentUserId,
          type: 'STUDENT_INVITATION_ACCEPT',
          expiresInHours: 24 * 30, // 30 dias
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          metadata: {
            teacherId: session.user.id,
            relationshipId: newRelationship.id,
          },
        });

        const declineToken = await createToken({
          userId: studentUserId,
          type: 'STUDENT_INVITATION_DECLINE',
          expiresInHours: 24 * 30, // 30 dias
          ipAddress: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          metadata: {
            teacherId: session.user.id,
            relationshipId: newRelationship.id,
          },
        });

        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

        const acceptUrl = `${baseUrl}/confirm-student-invite/${acceptToken}`;
        const declineUrl = `${baseUrl}/decline-student-invite/${declineToken}`;

        // 🆕 PREPARAR DADOS DETALHADOS DO PLANO PARA O EMAIL
        const studyPlanForEmail: any = {};
        if (maxLessonsPerWeek > 0)
          studyPlanForEmail.maxLessonsPerWeek = maxLessonsPerWeek;
        if (lessonDuration > 0)
          studyPlanForEmail.lessonDuration = lessonDuration;
        if (preferredDays.length > 0) {
          const dayLabels: { [key: string]: string } = {
            monday: 'Segunda-feira',
            tuesday: 'Terça-feira',
            wednesday: 'Quarta-feira',
            thursday: 'Quinta-feira',
            friday: 'Sexta-feira',
            saturday: 'Sábado',
            sunday: 'Domingo',
          };
          studyPlanForEmail.preferredDays = preferredDays
            .map((day: any) => dayLabels[day] || day)
            .join(', ');
        }
        if (currentFocus.length > 0)
          studyPlanForEmail.focus = currentFocus.join(', ');
        if (practiceFrequency)
          studyPlanForEmail.practiceFrequency = practiceFrequency;
        if (homeworkExpectation)
          studyPlanForEmail.homeworkExpectation = homeworkExpectation;

        // Enviar email de convite
        await sendTemplateEmail(studentUser.email, {
          type: 'STUDENT_INVITATION',
          variables: {
            firstName: studentUser.firstName || 'Estudante',
            teacherName,
            teacherSpecialties: teacherProfile.specialties?.join(', ') || null,
            teacherExperience: teacherProfile.experience || null,
            acceptUrl,
            declineUrl,
            studyPlan:
              Object.keys(studyPlanForEmail).length > 0
                ? studyPlanForEmail
                : null,
            siteUrl: baseUrl,
          },
        });

        console.log(
          `📧 [TEACHER-STUDENTS] Email de convite enviado com plano de estudos para ${studentUser.email}`
        );
      } catch (emailError) {
        console.error(
          '❌ [TEACHER-STUDENTS] Erro ao enviar email de convite:',
          emailError
        );
        // Não falhar a operação por causa do email
      }
    }

    // Revalidar cache
    await revalidateTeacherStudentsData(session.user.id, studentUserId);

    console.log(
      `✅ [TEACHER-STUDENTS] Processo completo finalizado com sucesso!`
    );

    return NextResponse.json({
      success: true,
      relationship: newRelationship,
      message:
        'Aluno adicionado com sucesso! Email de convite com plano de estudos enviado!',
      created: true,
      inviteEmailSent: !!studentUser.email,
      studyPlanIncluded: true,
      studyPlanDetails: {
        maxLessonsPerWeek,
        lessonDuration,
        preferredDaysCount: preferredDays.length,
        currentFocusCount: currentFocus.length,
        hasDetailedPlan: !!detailedLearningPlan,
      },
    });
  } catch (error) {
    console.error('❌ [TEACHER-STUDENTS] Erro ao vincular aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar relacionamento COM REVALIDAÇÃO (continua igual)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { relationshipId, ...updateData } = body;

    if (!relationshipId) {
      return NextResponse.json(
        { error: 'relationshipId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `📝 [TEACHER-STUDENTS] Atualizando relacionamento ${relationshipId}`,
      {
        updateFields: Object.keys(updateData),
        hasPreferredDays: !!updateData.preferredDays,
        hasCurrentFocus: !!updateData.currentFocus,
      }
    );

    // Verificar se professor é dono do relacionamento
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const relationship = await prisma.teacherStudent.findFirst({
      where: {
        id: relationshipId,
        teacherId: teacherProfile?.id,
      },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relacionamento não encontrado' },
        { status: 404 }
      );
    }

    // Atualizar relacionamento
    const updatedRelationship = await prisma.teacherStudent.update({
      where: { id: relationshipId },
      data: updateData,
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // 🔥 REVALIDAR CACHE APÓS ATUALIZAR
    const studentUserId = relationship.student.userId;
    await revalidateTeacherStudentsData(session.user.id, studentUserId);

    console.log(
      `✅ [TEACHER-STUDENTS] Relacionamento atualizado e cache revalidado: ${relationshipId}`
    );

    return NextResponse.json({
      success: true,
      relationship: updatedRelationship,
      message: 'Configurações da relação atualizadas com sucesso!',
    });
  } catch (error) {
    console.error(
      '❌ [TEACHER-STUDENTS] Erro ao atualizar relacionamento:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Desativar relacionamento (não deletar) COM REVALIDAÇÃO (continua igual)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const relationshipId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Desvinculado pelo professor';

    if (!relationshipId) {
      return NextResponse.json(
        { error: 'relationshipId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `🔗❌ [TEACHER-STUDENTS] Desvinculando relacionamento ${relationshipId}`
    );

    // Verificar se professor é dono do relacionamento
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    const relationship = await prisma.teacherStudent.findFirst({
      where: {
        id: relationshipId,
        teacherId: teacherProfile?.id,
      },
      include: {
        student: {
          select: { userId: true },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relacionamento não encontrado' },
        { status: 404 }
      );
    }

    // Desativar relacionamento (não deletar)
    await prisma.teacherStudent.update({
      where: { id: relationshipId },
      data: {
        isActive: false,
        endDate: new Date(),
        pauseReason: reason,
      },
    });

    if (!teacherProfile) {
      return NextResponse.json({
        success: false,
        message: 'Não foi encontrado professor.',
        relationshipId,
      });
    }

    // Cancelar aulas futuras
    await prisma.lesson.updateMany({
      where: {
        teacherId: teacherProfile.id,
        studentId: relationship.studentId,
        status: 'SCHEDULED',
        scheduledAt: {
          gte: new Date(),
        },
      },
      data: {
        status: 'CANCELLED',
        cancelReason: 'Relacionamento professor-aluno desativado',
        cancelledBy: 'teacher',
        cancelledAt: new Date(),
      },
    });

    // 🔥 REVALIDAR CACHE APÓS DESATIVAR
    const studentUserId = relationship.student.userId;
    await revalidateTeacherStudentsData(session.user.id, studentUserId);

    console.log(
      `✅ [TEACHER-STUDENTS] Relacionamento desativado e cache revalidado: ${relationshipId}`
    );

    return NextResponse.json({
      success: true,
      message: 'Relacionamento desativado com sucesso',
      relationshipId,
    });
  } catch (error) {
    console.error(
      '❌ [TEACHER-STUDENTS] Erro ao desativar relacionamento:',
      error
    );
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
