// app/api/auth/confirm-account/[token]/route.ts
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

    // Validar token
    const validation = await validateToken(token, 'EMAIL_CONFIRMATION');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Solicite um novo link de confirmação.';
        errorCode = 'EXPIRED_TOKEN';
      } else if (validation.used) {
        errorMessage = 'Este link de confirmação já foi utilizado.';
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
    const userId = tokenRecord.userId;

    // Verificar se usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se já foi confirmado
    if (user.emailVerified) {
      // Marcar token como usado mesmo assim
      await markTokenAsUsed(token);

      return NextResponse.json({
        success: true,
        message: 'Email já confirmado anteriormente',
        alreadyConfirmed: true,
        user: {
          firstName: user.firstName,
          email: user.email,
          onboardingCompleted: user.onboardingCompleted,
        },
      });
    }

    // Confirmar email do usuário
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
      },
    });

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Log de segurança
    logSecurityEvent('EMAIL_CONFIRMED', userId, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Email confirmado com sucesso!',
      user: {
        firstName: user.firstName,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (error) {
    console.error('Erro na confirmação de conta:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST method para reenviar confirmação
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
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: 'Token não encontrado' },
        { status: 404 }
      );
    }

    const user = tokenRecord.user;

    // Verificar se já foi confirmado
    if (user?.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email já foi confirmado' },
        { status: 400 }
      );
    }

    // Verificar rate limiting

    if (!user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: `Usuario não encontrado`,
        },
        { status: 429 }
      );
    }
    const rateLimit = await checkTokenRateLimit(
      user.id,
      'EMAIL_CONFIRMATION',
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

    // Criar novo token
    const newToken = await createToken({
      userId: user.id,
      type: 'EMAIL_CONFIRMATION',
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Enviar email de confirmação

    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'confirm-account',
      newToken
    );

    const emailResult = await sendTemplateEmail(user.email, {
      type: 'ACCOUNT_CONFIRMATION',
      variables: {
        firstName: user.firstName || 'Usuário',
        confirmationUrl,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email de confirmação' },
        { status: 500 }
      );
    }

    // Log de segurança
    logSecurityEvent('CONFIRMATION_RESENT', user.id, {
      email: user.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Novo email de confirmação enviado!',
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error('Erro ao reenviar confirmação:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
