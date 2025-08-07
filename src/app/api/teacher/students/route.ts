// app/api/teacher/students/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { revalidateTag } from 'next/cache';

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

// POST - Vincular novo aluno COM REVALIDAÇÃO
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
    } = body;

    if (!studentUserId) {
      return NextResponse.json(
        { error: 'studentUserId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `🔗 [TEACHER-STUDENTS] Vinculando aluno ${studentUserId} ao professor ${session.user.id}`
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

    // Verificar se usuário existe e é aluno (role 0)
    const studentUser = await prisma.user.findFirst({
      where: {
        id: studentUserId,
        role: 0, // Apenas alunos
      },
      select: { id: true, email: true },
    });

    if (!studentUser) {
      return NextResponse.json(
        { error: 'Aluno não encontrado ou usuário não é aluno' },
        { status: 404 }
      );
    }

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
        // Reativar relacionamento existente
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
            learningPlan,
            currentFocus,
            teacherNotes,
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

        // 🔥 REVALIDAR CACHE APÓS REATIVAR
        await revalidateTeacherStudentsData(session.user.id, studentUserId);

        console.log(
          `✅ [TEACHER-STUDENTS] Relacionamento reativado e cache revalidado: ${reactivatedRelationship.id}`
        );

        return NextResponse.json({
          success: true,
          relationship: reactivatedRelationship,
          message: 'Aluno vinculado novamente com sucesso',
          reactivated: true,
        });
      }
    }

    // Criar novo relacionamento
    const newRelationship = await prisma.teacherStudent.create({
      data: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
        maxLessonsPerWeek,
        lessonDuration,
        preferredDays,
        preferredTimes,
        learningPlan,
        currentFocus,
        teacherNotes,
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

    // 🔥 REVALIDAR CACHE APÓS CRIAR
    await revalidateTeacherStudentsData(session.user.id, studentUserId);

    console.log(
      `✅ [TEACHER-STUDENTS] Novo relacionamento criado e cache revalidado: ${newRelationship.id}`
    );

    return NextResponse.json({
      success: true,
      relationship: newRelationship,
      message: 'Aluno vinculado com sucesso',
      created: true,
    });
  } catch (error) {
    console.error('❌ [TEACHER-STUDENTS] Erro ao vincular aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar relacionamento COM REVALIDAÇÃO
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
      `📝 [TEACHER-STUDENTS] Atualizando relacionamento ${relationshipId}`
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
      message: 'Relacionamento atualizado com sucesso',
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

// DELETE - Desativar relacionamento (não deletar) COM REVALIDAÇÃO
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
    const deactivatedRelationship = await prisma.teacherStudent.update({
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
