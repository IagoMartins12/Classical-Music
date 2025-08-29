// app/api/student/progress/[reportId]/route.ts - API para buscar relatório compartilhado

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// GET - Buscar relatório compartilhado
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Acesso negado - Login necessário' },
        { status: 401 }
      );
    }

    const { reportId } = await params;

    console.log(
      `📊 [GET-SHARED-REPORT] Buscando relatório ${reportId} para usuário ${session.user.id}`
    );

    // Buscar relatório compartilhado
    const sharedReport = await prisma.sharedProgressReport.findUnique({
      where: { id: reportId },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                id: true,

                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        studentComments: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!sharedReport) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário tem acesso ao relatório
    // Apenas o próprio aluno pode acessar
    if (sharedReport.student.user.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Acesso negado - Este relatório não pertence a você' },
        { status: 403 }
      );
    }

    // Verificar se o relatório não expirou
    if (sharedReport.expiresAt && sharedReport.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Este relatório expirou' },
        { status: 410 }
      );
    }

    // Verificar se o relatório está ativo
    if (!sharedReport.isActive) {
      return NextResponse.json(
        { error: 'Este relatório não está mais disponível' },
        { status: 410 }
      );
    }

    // Atualizar contadores de visualização
    await prisma.sharedProgressReport.update({
      where: { id: reportId },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    });

    // Formatear resposta
    const response = {
      id: sharedReport.id,
      title: sharedReport.title,
      description: sharedReport.description,
      teacherMessage: sharedReport.teacherMessage,
      selectedSections: sharedReport.selectedSections,
      allowComments: sharedReport.allowComments,
      reportData: sharedReport.reportData,
      metadata: {
        periodStart: sharedReport.periodStart,
        periodEnd: sharedReport.periodEnd,
        periodLabel: sharedReport.periodLabel,
        createdAt: sharedReport.createdAt,
        expiresAt: sharedReport.expiresAt,
        viewCount: sharedReport.viewCount + 1, // Include the increment
        lastViewedAt: new Date(),
      },
      teacher: {
        id: sharedReport.teacher.user.id,
        name: `${sharedReport.teacher.user.firstName} ${sharedReport.teacher.user.lastName}`.trim(),
        image: sharedReport.teacher.user.image,
        specialties: sharedReport.teacher.specialties || [],
      },
      student: {
        id: sharedReport.student.user.id,
        name: `${sharedReport.student.user.firstName} ${sharedReport.student.user.lastName}`.trim(),
        image: sharedReport.student.user.image,
        level: sharedReport.student.level,
      },
      comments:
        sharedReport.studentComments?.map((comment) => ({
          id: comment.id,
          content: comment.content,
          section: comment.section,
          isRead: comment.isRead,
          createdAt: comment.createdAt,
          student: {
            name: `${comment.student.user.firstName} ${comment.student.user.lastName}`.trim(),
            image: comment.student.user.image,
          },
        })) || [],
    };

    console.log(
      `✅ [GET-SHARED-REPORT] Relatório ${reportId} carregado com sucesso`
    );

    return NextResponse.json({
      success: true,
      report: response,
    });
  } catch (error) {
    console.error('❌ [GET-SHARED-REPORT] Erro ao buscar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Adicionar comentário ao relatório
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Acesso negado - Login necessário' },
        { status: 401 }
      );
    }

    const { reportId } = await params;
    const body = await request.json();
    const { content, section } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Comentário não pode estar vazio' },
        { status: 400 }
      );
    }

    console.log(
      `💬 [ADD-COMMENT] Adicionando comentário ao relatório ${reportId}`
    );

    // Verificar se o relatório existe e permite comentários
    const sharedReport = await prisma.sharedProgressReport.findUnique({
      where: { id: reportId },
      include: {
        student: {
          include: { user: true },
        },
        teacher: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!sharedReport) {
      return NextResponse.json(
        { error: 'Relatório não encontrado' },
        { status: 404 }
      );
    }

    // Verificar acesso
    if (sharedReport.student.user.id !== session.user.id) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    if (!sharedReport.allowComments) {
      return NextResponse.json(
        { error: 'Comentários não são permitidos neste relatório' },
        { status: 403 }
      );
    }

    if (!sharedReport.isActive) {
      return NextResponse.json(
        { error: 'Relatório não está mais ativo' },
        { status: 410 }
      );
    }

    if (sharedReport.expiresAt && sharedReport.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Relatório expirou' }, { status: 410 });
    }

    // Buscar perfil do aluno
    const studentProfile = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    // Criar comentário
    const comment = await prisma.sharedReportComment.create({
      data: {
        reportId,
        studentId: studentProfile.id,
        content: content.trim(),
        section,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Criar notificação para o professor
    try {
      const studentName =
        `${sharedReport.student.user.firstName} ${sharedReport.student.user.lastName}`.trim();

      await prisma.notification.create({
        data: {
          userId: sharedReport.teacher.userId,
          type: 'STUDENT_GAVE_LESSON_FEEDBACK',
          priority: 'MEDIUM',
          title: `💬 Novo comentário em relatório`,
          message: `${studentName} comentou no relatório de progresso "${sharedReport.title}"`,
          actionText: 'Ver Comentário',
          actionUrl: `/teacher/students/${sharedReport.student.userId}/progress`,
          relatedEntityType: 'shared-report-comment',
          relatedEntityId: comment.id,
          metadata: {
            studentName,
            reportTitle: sharedReport.title,
            commentId: comment.id,
            sharedReportId: reportId,
            section: section || 'general',
          },
        },
      });
    } catch (notificationError) {
      console.error('Erro ao criar notificação:', notificationError);
    }

    console.log(
      `✅ [ADD-COMMENT] Comentário adicionado com sucesso ao relatório ${reportId}`
    );

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        section: comment.section,
        createdAt: comment.createdAt,
        student: {
          name: `${comment.student.user.firstName} ${comment.student.user.lastName}`.trim(),
          image: comment.student.user.image,
        },
      },
    });
  } catch (error) {
    console.error('❌ [ADD-COMMENT] Erro ao adicionar comentário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
