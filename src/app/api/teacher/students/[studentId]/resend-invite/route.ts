// app/api/teacher/students/[studentId]/resend-invite/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';
import { createToken } from '@/app/libs/tokenUtils';
import { revalidateTag } from 'next/cache';

// POST - Reenviar convite para aluno
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

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(
      `📧 [RESEND-INVITE] Reenviando convite para aluno ${studentId} pelo professor ${session.user.id}`
    );

    // Verificar se professor existe
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

    // Verificar se usuário/aluno existe
    const studentUser = await prisma.user.findFirst({
      where: {
        id: studentId,
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

    if (!studentUser.email) {
      return NextResponse.json(
        { error: 'Aluno não possui email cadastrado' },
        { status: 400 }
      );
    }

    // Buscar perfil do aluno
    const studentProfile = await prisma.student.findUnique({
      where: { userId: studentId },
      select: { id: true },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: 'Perfil de aluno não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se relacionamento existe
    const existingRelationship = await prisma.teacherStudent.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: teacherProfile.id,
          studentId: studentProfile.id,
        },
      },
      select: {
        id: true,
        isActive: true,
        inviteStatus: true,
      },
    });

    if (!existingRelationship) {
      return NextResponse.json(
        { error: 'Relacionamento professor-aluno não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já foi aceito
    if (existingRelationship.inviteStatus === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Convite já foi aceito pelo aluno' },
        { status: 400 }
      );
    }

    // Criar novos tokens para aceitar/recusar convite
    const acceptToken = await createToken({
      userId: studentId,
      type: 'STUDENT_INVITATION_ACCEPT',
      expiresInHours: 24 * 30, // 30 dias
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        teacherId: session.user.id,
        relationshipId: existingRelationship.id,
      },
    });

    const declineToken = await createToken({
      userId: studentId,
      type: 'STUDENT_INVITATION_DECLINE',
      expiresInHours: 24 * 30, // 30 dias
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        teacherId: session.user.id,
        relationshipId: existingRelationship.id,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const acceptUrl = `${baseUrl}/confirm-student-invite/${acceptToken}`;
    const declineUrl = `${baseUrl}/decline-student-invite/${declineToken}`;

    // Enviar email de convite (sem studyPlan)
    await sendTemplateEmail(studentUser.email, {
      type: 'STUDENT_INVITATION',
      variables: {
        firstName: studentUser.firstName || 'Estudante',
        teacherName,
        teacherSpecialties: teacherProfile.specialties?.join(', ') || null,
        teacherExperience: teacherProfile.experience || null,
        acceptUrl,
        declineUrl,
        studyPlan: null, // ✅ Sem studyPlan conforme solicitado
        siteUrl: baseUrl,
      },
    });

    // Atualizar status do convite para PENDING
    await prisma.teacherStudent.update({
      where: { id: existingRelationship.id },
      data: {
        inviteStatus: 'PENDING',
        inviteAcceptedAt: null,
        inviteDeclinedAt: null,
      },
    });

    // Revalidar cache
    revalidateTag('teacher-students');
    revalidateTag('teacher-students-data');
    revalidateTag(`teacher-${session.user.id}`);
    revalidateTag(`student-${studentId}`);

    console.log(
      `✅ [RESEND-INVITE] Convite reenviado com sucesso para ${studentUser.email}`
    );

    return NextResponse.json({
      success: true,
      message: `Convite reenviado com sucesso para ${studentUser.email}`,
      studentEmail: studentUser.email,
      inviteStatus: 'PENDING',
    });
  } catch (error) {
    console.error('❌ [RESEND-INVITE] Erro ao reenviar convite:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
