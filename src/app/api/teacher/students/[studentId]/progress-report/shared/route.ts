// app/api/teacher/students/[studentId]/progress-report/shared/route.ts - API para salvar relatório compartilhado

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';

// POST - Salvar relatório compartilhado
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 1) {
      return NextResponse.json(
        { error: 'Acesso negado - Apenas professores' },
        { status: 403 }
      );
    }

    const { studentId } = await params;
    const body = await request.json();
    const {
      title,
      description,
      teacherMessage,
      selectedSections,
      allowComments,
      expiresInDays,
      reportData,
      periodStart,
      periodEnd,
      periodLabel,
    } = body;

    console.log(
      `📤 [SAVE-SHARED-REPORT] Salvando relatório compartilhado com aluno ${studentId}`
    );

    // Verificar se professor tem acesso ao aluno
    const teacherProfile = await prisma.teacher.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!teacherProfile) {
      return NextResponse.json(
        { error: 'Perfil de professor não encontrado' },
        { status: 404 }
      );
    }

    const studentProfile = await prisma.student.findUnique({
      where: { userId: studentId },
      select: {
        id: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      );
    }

    const relationship = await prisma.teacherStudent.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: teacherProfile.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        { error: 'Relacionamento professor-aluno não encontrado' },
        { status: 404 }
      );
    }

    // Calcular data de expiração
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    // Salvar relatório compartilhado
    const sharedReport = await prisma.sharedProgressReport.create({
      data: {
        teacherId: teacherProfile.id,
        studentId: studentProfile.id,
        title,
        description,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        periodLabel,
        selectedSections,
        reportData,
        allowComments,
        teacherMessage,
        expiresAt,
        isPublic: false, // Sempre requer login
        isActive: true,
      },
    });

    // Preparar dados para a notificação
    const teacherName =
      `${teacherProfile.user.firstName} ${teacherProfile.user.lastName}`.trim();
    const studentName =
      `${studentProfile.user.firstName} ${studentProfile.user.lastName}`.trim();

    // Criar notificação para o aluno
    try {
      await prisma.notification.create({
        data: {
          userId: studentId,
          type: 'GENERAL_ANNOUNCEMENT',
          priority: 'MEDIUM',
          title: `📊 Novo relatório de progresso disponível`,
          message: `${teacherName} gerou um relatório detalhado do seu progresso no período: ${periodLabel}. Veja sua evolução, conquistas e áreas de foco.`,
          actionText: 'Ver Relatório',
          actionUrl: `/student/progress/${sharedReport.id}`,
          relatedEntityType: 'shared-progress-report',
          relatedEntityId: sharedReport.id,
          metadata: {
            teacherName,
            teacherUserId: session.user.id,
            sharedReportId: sharedReport.id,
            periodLabel,
            reportType: 'teacher_shared',
            sharedAt: new Date().toISOString(),
          },
          showInToast: true,
          showInBrowser: false,
          showInPage: true,
          expiresAt: expiresAt,
        },
      });

      console.log(
        `✅ [SAVE-SHARED-REPORT] Notificação criada para aluno ${studentName}`
      );
    } catch (notificationError) {
      console.error(
        '❌ [SAVE-SHARED-REPORT] Erro ao criar notificação:',
        notificationError
      );
    }

    // Registrar atividade escolar
    try {
      await prisma.schoolActivity.create({
        data: {
          userId: session.user.id,
          userType: 'teacher',
          action: 'TEACHER_PROFILE_UPDATED',
          entityType: 'shared-progress-report',
          entityId: sharedReport.id,
          entityName: `Relatório de Progresso - ${studentName}`,
          title: `Compartilhou relatório de progresso`,
          description: `Compartilhou relatório "${title}" com ${studentName} (${periodLabel})`,
          metadata: {
            studentUserId: studentId,
            studentName,
            sharedReportId: sharedReport.id,
            periodLabel,
            actionType: 'report_shared',
          },
        },
      });
    } catch (activityError) {
      console.error(
        '❌ [SAVE-SHARED-REPORT] Erro ao registrar atividade:',
        activityError
      );
    }

    console.log(
      `✅ [SAVE-SHARED-REPORT] Relatório salvo e compartilhado com sucesso`
    );

    return NextResponse.json({
      success: true,
      message: `Relatório compartilhado com ${studentName} com sucesso!`,
      sharedReportId: sharedReport.id,
      reportUrl: `/student/progress/${sharedReport.id}`,
      sharedAt: new Date().toISOString(),
      studentName,
      periodLabel,
      expiresAt: expiresAt?.toISOString(),
    });
  } catch (error) {
    console.error('❌ [SAVE-SHARED-REPORT] Erro ao salvar relatório:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
