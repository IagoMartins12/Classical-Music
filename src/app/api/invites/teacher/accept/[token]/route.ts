// app/api/invites/teacher/accept/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  logSecurityEvent,
  createTokenUrl,
  checkTokenRateLimit,
  createToken,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

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
      `🎓 [TEACHER-INVITE] Processando aceitação de convite: ${token}`
    );

    // Validar token
    const validation = await validateToken(token, 'TEACHER_INVITATION_ACCEPT');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Entre em contato com o administrador.';
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
        isTeacher: true,
        teacherProfile: {
          select: {
            id: true,
            status: true,
            isVerified: true,
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

    // Verificar se o usuário ainda tem role de professor
    if (user.role !== 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Este convite não é mais válido. O usuário não é mais um professor.',
          errorCode: 'ROLE_CHANGED',
        },
        { status: 400 }
      );
    }

    // Verificar se já foi aceito
    if (user.teacherProfile?.isVerified) {
      // Marcar token como usado mesmo assim
      await markTokenAsUsed(token);

      return NextResponse.json({
        success: true,
        message:
          'Convite já foi aceito anteriormente. Você já é um professor verificado!',
        alreadyAccepted: true,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isVerified: true,
        },
      });
    }

    // Aceitar o convite - atualizar Teacher profile
    await prisma.teacher.update({
      where: { userId: user.id },
      data: {
        status: 'ACTIVE',
        isVerified: true,
        verifiedAt: new Date(),
        // verifiedBy: poderia ser o admin que enviou o convite, mas vamos deixar null por ora
      },
    });

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Log de segurança
    logSecurityEvent('TEACHER_INVITE_ACCEPTED', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      teacherProfileId: user.teacherProfile?.id,
    });

    console.log(
      `✅ [TEACHER-INVITE] Convite aceito com sucesso para usuário ${user.id}`
    );

    return NextResponse.json({
      success: true,
      message:
        'Convite aceito com sucesso! Você agora é um professor verificado.',
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error('❌ [TEACHER-INVITE] Erro ao aceitar convite:', error);

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

    // Buscar o token original para pegar informações do usuário
    const tokenRecord = await prisma.userToken.findUnique({
      where: { token },
    });

    if (!tokenRecord || tokenRecord.userId) {
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
        role: true,
        teacherProfile: {
          select: {
            isVerified: true,
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

    // Verificar se já foi aceito
    if (user.teacherProfile?.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Este convite já foi aceito' },
        { status: 400 }
      );
    }

    // Rate limit para reenvio
    const rateLimit = await checkTokenRateLimit(
      user.id,
      'TEACHER_INVITATION_ACCEPT',
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

    // Criar novos tokens
    const newAcceptToken = await createToken({
      userId: user.id,
      type: 'TEACHER_INVITATION_ACCEPT',
      expiresInHours: 24 * 7, // 7 dias
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    const newDeclineToken = await createToken({
      userId: user.id,
      type: 'TEACHER_INVITATION_DECLINE',
      expiresInHours: 24 * 7, // 7 dias
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const acceptUrl = `${baseUrl}/confirm-teacher-invite/${newAcceptToken}`;
    const declineUrl = `${baseUrl}/decline-teacher-invite/${newDeclineToken}`;

    // Enviar novo email de convite
    const emailResult = await sendTemplateEmail(user.email, {
      type: 'TEACHER_INVITATION',
      variables: {
        firstName: user.firstName || 'Usuário',
        acceptUrl,
        declineUrl,
        invitedBy: 'Administrador',
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
    logSecurityEvent('TEACHER_INVITE_RESENT', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Novo email de convite enviado!',
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error('❌ [TEACHER-INVITE] Erro ao reenviar convite:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
