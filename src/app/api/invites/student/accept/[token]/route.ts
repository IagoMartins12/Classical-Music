// app/api/invites/student/accept/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  logSecurityEvent,
  checkTokenRateLimit,
  createToken,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';
import { NotificationFactory } from '@/app/utils/notifications/createNotification';

interface Params {
  token: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    console.log(
      `👨‍🎓 [STUDENT-INVITE] Processando aceitação de convite: ${token}`
    );

    // Validar token
    const validation = await validateToken(token, 'STUDENT_INVITATION_ACCEPT');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Entre em contato com seu professor.';
        errorCode = 'EXPIRED_TOKEN';
      } else if (validation.used) {
        errorMessage = 'Este convite já foi processado anteriormente.';
        errorCode = 'USED_TOKEN';
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          errorCode,
        },
        { status: 400 }
      );
    }

    const tokenRecord = validation.token;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isStudent: true,
        studentProfile: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Buscar informações do relacionamento a partir dos metadados do token
    const metadata = tokenRecord.metadata as any;
    const teacherId = metadata?.teacherId;
    const relationshipId = metadata?.relationshipId;

    if (!teacherId || !relationshipId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Token inválido - informações do relacionamento não encontradas',
          errorCode: 'INVALID_METADATA',
        },
        { status: 400 }
      );
    }

    // Verificar se o relacionamento ainda existe
    const relationship = await prisma.teacherStudent.findFirst({
      where: {
        id: relationshipId,
        studentId: user.studentProfile?.id,
      },
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!relationship) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Relacionamento professor-aluno não encontrado. O professor pode ter cancelado o convite.',
          errorCode: 'RELATIONSHIP_NOT_FOUND',
        },
        { status: 400 }
      );
    }

    // Verificar se já foi aceito (se isStudent já é true)
    if (user.isStudent) {
      // Marcar token como usado mesmo assim
      await markTokenAsUsed(token);

      const teacherName =
        `${relationship.teacher.user.firstName || ''} ${
          relationship.teacher.user.lastName || ''
        }`.trim() || 'Professor';

      return NextResponse.json({
        success: true,
        message: `Convite já foi aceito anteriormente. Você já é aluno de ${teacherName}!`,
        alreadyAccepted: true,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isStudent: true,
        },
        teacher: {
          name: teacherName,
        },
      });
    }

    // Aceitar o convite - marcar como isStudent = true
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isStudent: true, // 🆕 NOVO: Marcar como aluno
      },
    });

    await prisma.teacherStudent.update({
      where: {
        id: relationship.id,
      },
      data: {
        inviteStatus: 'ACCEPTED',
        inviteAcceptedAt: new Date(),
        inviteDeclinedAt: null,
      },
    });

    // Marcar token como usado
    await markTokenAsUsed(token);

    const teacherName =
      `${relationship.teacher.user.firstName || ''} ${
        relationship.teacher.user.lastName || ''
      }`.trim() || 'Professor';

    try {
      await NotificationFactory.welcomeNewStudent(
        user.id,
        teacherName,
        relationship.teacher.userId,
        relationship.teacher.specialties
      );

      console.log(
        `🎉 [CONFIRM-INVITE] Notificação de boas-vindas enviada para aluno ${user.firstName}`
      );
    } catch (notificationError) {
      console.error(
        '❌ [CONFIRM-INVITE] Erro ao criar notificação de boas-vindas:',
        notificationError
      );
    }

    try {
      await NotificationFactory.studentAcceptedInvite(
        teacherId,
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
          'Desconhecido',
        relationship.id,
        user.email
      );

      console.log(
        `📬 [DECLINE-INVITE] Notificação de declínio enviada para professor ${teacherId}`
      );
    } catch (notificationError) {
      console.error(
        '❌ [DECLINE-INVITE] Erro ao criar notificação:',
        notificationError
      );
    }
    // Log de segurança
    logSecurityEvent('STUDENT_INVITE_ACCEPTED', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      teacherId: teacherId,
      relationshipId: relationshipId,
    });

    console.log(
      `✅ [STUDENT-INVITE] Convite aceito com sucesso para usuário ${user.id}`
    );

    return NextResponse.json({
      success: true,
      message: `Convite aceito com sucesso! Você agora é aluno de ${teacherName}.`,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isStudent: true,
      },
      teacher: {
        name: teacherName,
      },
      relationship: {
        id: relationship.id,
        maxLessonsPerWeek: relationship.maxLessonsPerWeek,
        lessonDuration: relationship.lessonDuration,
        preferredDays: relationship.preferredDays,
        preferredTimes: relationship.preferredTimes,
      },
    });
  } catch (error) {
    console.error('❌ [STUDENT-INVITE] Erro ao aceitar convite:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST method para reenviar convite (se necessário)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action !== 'resend') {
      return NextResponse.json(
        { success: false, error: 'Ação inválida' },
        { status: 400 }
      );
    }

    const { token } = await params;

    // Buscar o token original
    const tokenRecord = await prisma.userToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.userId === null) {
      return NextResponse.json(
        { success: false, error: 'Token não encontrado' },
        { status: 404 }
      );
    }

    // Buscar usuário

    const user = await prisma.user.findUnique({
      where: { id: tokenRecord.userId },
      select: {
        id: true,
        firstName: true,
        email: true,
        isStudent: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já foi aceito
    if (user.isStudent) {
      return NextResponse.json(
        { success: false, error: 'Este convite já foi aceito' },
        { status: 400 }
      );
    }

    // Rate limit para reenvio
    const rateLimit = await checkTokenRateLimit(
      user.id,
      'STUDENT_INVITATION_ACCEPT',
      3
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas. Tente novamente em 1 hora.`,
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 429 }
      );
    }

    // Buscar informações do teacher e relationship originais
    const metadata = tokenRecord.metadata as any;
    const teacherId = metadata?.teacherId;
    const relationshipId = metadata?.relationshipId;

    if (!teacherId || !relationshipId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido - não foi possível reenviar' },
        { status: 400 }
      );
    }

    // Buscar teacher para o email
    const teacherUser = await prisma.user.findUnique({
      where: { id: teacherId },
      select: {
        firstName: true,
        lastName: true,
        teacherProfile: {
          select: {
            specialties: true,
            experience: true,
          },
        },
      },
    });

    const teacherName = teacherUser
      ? `${teacherUser.firstName || ''} ${teacherUser.lastName || ''}`.trim() ||
        'Professor'
      : 'Professor';

    // Criar novos tokens
    const newAcceptToken = await createToken({
      userId: user.id,
      type: 'STUDENT_INVITATION_ACCEPT',
      expiresInHours: 24 * 30, // 30 dias
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        teacherId,
        relationshipId,
      },
    });

    const newDeclineToken = await createToken({
      userId: user.id,
      type: 'STUDENT_INVITATION_DECLINE',
      expiresInHours: 24 * 30, // 30 dias
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      metadata: {
        teacherId,
        relationshipId,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const acceptUrl = `${baseUrl}/confirm-student-invite/${newAcceptToken}`;
    const declineUrl = `${baseUrl}/decline-student-invite/${newDeclineToken}`;

    // Enviar novo email de convite
    const emailResult = await sendTemplateEmail(user.email, {
      type: 'STUDENT_INVITATION',
      variables: {
        firstName: user.firstName || 'Estudante',
        teacherName,
        teacherSpecialties:
          teacherUser?.teacherProfile?.specialties?.join(', ') || null,
        teacherExperience: teacherUser?.teacherProfile?.experience || null,
        acceptUrl,
        declineUrl,
        studyPlan: null, // Não temos essas informações no reenvio
        siteUrl: baseUrl,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email de convite' },
        { status: 500 }
      );
    }

    // Log de segurança
    logSecurityEvent('STUDENT_INVITE_RESENT', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      teacherId,
    });

    return NextResponse.json({
      success: true,
      message: 'Novo email de convite enviado!',
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error('❌ [STUDENT-INVITE] Erro ao reenviar convite:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
