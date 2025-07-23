// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  validatePasswordStrength,
  logSecurityEvent,
  revokeAllUserTokens,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validações básicas
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token, senha e confirmação são obrigatórios',
        },
        { status: 400 }
      );
    }

    // Verificar se senhas coincidem
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Senhas não coincidem' },
        { status: 400 }
      );
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Senha não atende aos critérios de segurança',
          passwordErrors: passwordValidation.errors,
          passwordScore: passwordValidation.score,
        },
        { status: 400 }
      );
    }

    // Obter informações do usuário
    const userIP =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Validar token
    const validation = await validateToken(token, 'PASSWORD_RESET');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Solicite um novo reset de senha.';
        errorCode = 'EXPIRED_TOKEN';
      } else if (validation.used) {
        errorMessage = 'Este link de reset já foi utilizado. Solicite um novo.';
        errorCode = 'USED_TOKEN';
      }

      // Log da tentativa inválida
      logSecurityEvent('INVALID_RESET_TOKEN_ATTEMPT', '', {
        token: token.substring(0, 8) + '...', // Log parcial do token
        error: errorCode,
        ip: userIP,
        userAgent,
      });

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
    const user = tokenRecord.user;

    // Verificar se usuário ainda existe e tem senha
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        hashedPassword: true,
      },
    });

    if (!currentUser) {
      logSecurityEvent('RESET_ATTEMPT_DELETED_USER', userId, {
        ip: userIP,
      });

      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se não é conta Google (sem senha)
    if (!currentUser.hashedPassword) {
      logSecurityEvent('RESET_ATTEMPT_GOOGLE_ACCOUNT', userId, {
        email: currentUser.email,
        ip: userIP,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Esta conta está vinculada ao Google. Use o login do Google.',
          errorCode: 'GOOGLE_ACCOUNT',
        },
        { status: 400 }
      );
    }

    // Verificar se nova senha é diferente da atual
    const samePassword = await bcrypt.compare(
      password,
      currentUser.hashedPassword
    );
    if (samePassword) {
      logSecurityEvent('RESET_SAME_PASSWORD_ATTEMPT', userId, {
        email: currentUser.email,
        ip: userIP,
      });

      return NextResponse.json(
        { success: false, error: 'A nova senha deve ser diferente da atual' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const saltRounds = 12; // Aumentar segurança
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Atualizar senha no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: {
        hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Revogar todos os outros tokens de reset do usuário (segurança)
    await revokeAllUserTokens(userId, 'PASSWORD_RESET');

    // Log de segurança (sucesso)
    logSecurityEvent('PASSWORD_RESET_SUCCESS', userId, {
      email: currentUser.email,
      ip: userIP,
      userAgent,
      passwordScore: passwordValidation.score,
      timestamp: new Date().toISOString(),
    });

    // Opcionalmente, enviar email de notificação sobre mudança de senha
    try {
      // Criar um template simples de notificação
      await sendTemplateEmail(currentUser.email, {
        type: 'PASSWORD_RESET', // Reutilizar template mas customizar
        variables: {
          firstName: currentUser.firstName || 'Usuário',
          email: currentUser.email,
          requestDate: new Date().toLocaleString('pt-BR'),
          ipAddress: userIP,
          resetUrl: '#', // Não é usado neste caso
        },
        customSubject: '🔒 Senha alterada com sucesso - Classical Hub',
        customHtmlContent: `
        <div style="padding: 20px; background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 8px;">
          <h3 style="color: #166534; margin: 0 0 10px 0;">✅ Senha Alterada</h3>
          <p style="color: #15803d; margin: 0;">
            Sua senha foi alterada com sucesso em ${new Date().toLocaleString(
              'pt-BR'
            )} 
            a partir do IP ${userIP}.
          </p>
          <p style="color: #15803d; margin: 10px 0 0 0; font-size: 14px;">
            Se você não fez esta alteração, entre em contato conosco imediatamente.
          </p>
        </div>
        `,
      });
    } catch (emailError) {
      // Se falhar o envio do email, não falhar a operação
      console.warn(
        'Falha ao enviar email de notificação de senha alterada:',
        emailError
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Senha alterada com sucesso! Você já pode fazer login com sua nova senha.',
      user: {
        firstName: currentUser.firstName,
        email: currentUser.email,
      },
    });
  } catch (error) {
    console.error('Erro em reset-password:', error);

    // Log do erro
    logSecurityEvent('RESET_PASSWORD_ERROR', '', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { success: false, error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Método GET para verificar validade do token
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

    // Validar token
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

    // Calcular tempo restante
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expiresAt);
    const timeLeft = Math.max(0, expiresAt.getTime() - now.getTime());
    const minutesLeft = Math.floor(timeLeft / (1000 * 60));

    return NextResponse.json({
      valid: true,
      user: {
        email: tokenRecord.user.email,
        firstName: tokenRecord.user.firstName,
      },
      expiresAt: tokenRecord.expiresAt,
      minutesLeft,
      createdAt: tokenRecord.createdAt,
    });
  } catch (error) {
    console.error('Erro ao verificar token de reset:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno' },
      { status: 500 }
    );
  }
}
