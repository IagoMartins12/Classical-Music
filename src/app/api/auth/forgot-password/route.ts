// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  createToken,
  checkTokenRateLimit,
  logSecurityEvent,
} from '@/app/libs/tokenUtils';
import { createTokenUrl } from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validações básicas
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Obter IP do usuário
    const userIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Buscar usuário por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        hashedPassword: true, // Verificar se tem senha (não é conta Google)
      },
    });

    // IMPORTANTE: Sempre retornar sucesso para não revelar se email existe
    // Mas só realmente enviar se o usuário existir
    const baseResponse = {
      success: true,
      message:
        'Se este email estiver cadastrado, você receberá um link para redefinir sua senha.',
    };

    // Se usuário não existe, retornar sucesso mesmo assim (segurança)
    if (!user) {
      logSecurityEvent('RESET_ATTEMPT_NONEXISTENT_EMAIL', '', {
        email,
        ip: userIP,
        userAgent,
      });

      // Delay artificial para não revelar que email não existe
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      return NextResponse.json(baseResponse);
    }

    // Verificar se usuário tem senha (não é conta Google only)
    if (!user.hashedPassword) {
      logSecurityEvent('RESET_ATTEMPT_GOOGLE_ACCOUNT', user.id, {
        email,
        ip: userIP,
        userAgent,
      });

      // Enviar email especial para contas Google
      const emailResult = await sendTemplateEmail(user.email, {
        type: 'PASSWORD_RESET',
        variables: {
          firstName: user.firstName || 'Usuário',
          email: user.email,
          requestDate: new Date().toLocaleString('pt-BR'),
          ipAddress: userIP,
          resetUrl: '#', // URL vazia para contas Google
          isGoogleAccount: true,
        },
        customSubject: '🔒 Tentativa de reset em conta Google - Classical Hub',
        customHtmlContent: `
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e;">ℹ️ Conta vinculada ao Google</h3>
            <p style="color: #78350f;">
              Sua conta está vinculada ao Google. Para alterar sua senha, 
              <a href="https://myaccount.google.com/security" style="color: #d97706;">
                acesse as configurações do Google
              </a>.
            </p>
          </div>
        `,
      });

      return NextResponse.json(baseResponse);
    }

    // Verificar rate limiting
    const rateLimit = await checkTokenRateLimit(user.id, 'PASSWORD_RESET', 5); // 5 tentativas por hora

    if (!rateLimit.allowed) {
      logSecurityEvent('RESET_RATE_LIMIT_EXCEEDED', user.id, {
        email,
        ip: userIP,
        userAgent,
        remainingAttempts: rateLimit.remainingAttempts,
      });

      return NextResponse.json(
        {
          success: false,
          error: `Muitas tentativas de reset. Tente novamente em 1 hora.`,
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 429 }
      );
    }

    // Criar token de reset
    const resetToken = await createToken({
      userId: user.id,
      type: 'PASSWORD_RESET',
      expiresInHours: 1, // Token expira em 1 hora
      metadata: {
        requestedFrom: userIP,
        requestedAt: new Date().toISOString(),
      },
      ipAddress: userIP,
      userAgent,
    });

    // Criar URL de reset
    const resetUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'reset-password',
      resetToken
    );

    // Enviar email de reset
    const emailResult = await sendTemplateEmail(user.email, {
      type: 'PASSWORD_RESET',
      variables: {
        firstName: user.firstName || 'Usuário',
        email: user.email,
        requestDate: new Date().toLocaleString('pt-BR'),
        ipAddress: userIP,
        resetUrl,
      },
    });

    if (!emailResult.success) {
      console.error('Erro ao enviar email de reset:', emailResult.error);

      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email. Tente novamente.' },
        { status: 500 }
      );
    }

    // Log de segurança (sucesso)
    logSecurityEvent('PASSWORD_RESET_REQUESTED', user.id, {
      email: user.email,
      ip: userIP,
      userAgent,
      tokenExpiry: '1 hour',
      emailProvider: emailResult.provider,
    });

    return NextResponse.json({
      ...baseResponse,
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error('Erro em forgot-password:', error);

    // Log do erro mas não revelar detalhes
    logSecurityEvent('RESET_REQUEST_ERROR', '', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { success: false, error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Método GET para verificar status de um token (opcional)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    const { validateToken } = await import('@/app/libs/tokenUtils');
    const validation = await validateToken(token, 'PASSWORD_RESET');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Solicite um novo reset.';
        errorCode = 'EXPIRED_TOKEN';
      } else if (validation.used) {
        errorMessage = 'Este link já foi utilizado.';
        errorCode = 'USED_TOKEN';
      }

      return NextResponse.json({
        valid: false,
        error: errorMessage,
        errorCode,
      });
    }

    const tokenRecord = validation.token;

    return NextResponse.json({
      valid: true,
      user: {
        email: tokenRecord.user.email,
        firstName: tokenRecord.user.firstName,
      },
      expiresAt: tokenRecord.expiresAt,
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
