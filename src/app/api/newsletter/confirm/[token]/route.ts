// app/api/newsletter/confirm/[token]/route.ts
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

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 400 }
      );
    }

    // Validar token
    const validation = await validateToken(token, 'NEWSLETTER_CONFIRMATION');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Inscreva-se novamente na newsletter.';
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

    // Buscar subscriber pelo token metadata ou pelo userId se for usuário registrado
    let subscriber;

    if (tokenRecord.userId && tokenRecord.userId !== 'anonymous') {
      // É um usuário registrado - buscar pelo userId
      subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { userId: tokenRecord.userId },
      });
    } else {
      // É subscriber anônimo - buscar pelo token
      subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { confirmationToken: token },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já foi confirmado
    if (subscriber.status === 'ACTIVE') {
      // Marcar token como usado mesmo assim
      await markTokenAsUsed(token);

      return NextResponse.json({
        success: true,
        message: 'Esta inscrição já foi confirmada anteriormente',
        alreadyConfirmed: true,
        subscriber: {
          email: subscriber.email,
          firstName: subscriber.firstName,
        },
      });
    }

    // Confirmar inscrição na newsletter
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
        confirmationToken: null, // Limpar token após uso
      },
    });

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Log de segurança
    logSecurityEvent('NEWSLETTER_CONFIRMED', subscriber.userId || 'anonymous', {
      email: subscriber.email,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      subscriberId: subscriber.id,
    });

    return NextResponse.json({
      success: true,
      message: 'Inscrição na newsletter confirmada com sucesso!',
      subscriber: {
        email: subscriber.email,
        firstName: subscriber.firstName,
      },
    });
  } catch (error) {
    console.error('Erro na confirmação de newsletter:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST method para reenviar confirmação (se necessário)
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
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

    const { token } = params;

    // Buscar o token original para pegar informações do subscriber
    const tokenRecord = await prisma.userToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { success: false, error: 'Token não encontrado' },
        { status: 404 }
      );
    }

    // Buscar subscriber
    let subscriber;

    if (tokenRecord.userId && tokenRecord.userId !== 'anonymous') {
      subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { userId: tokenRecord.userId },
      });
    } else {
      subscriber = await prisma.newsletterSubscriber.findFirst({
        where: { confirmationToken: token },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Inscrição não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já foi confirmado
    if (subscriber.status === 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Esta inscrição já foi confirmada' },
        { status: 400 }
      );
    }

    const rateLimit = await checkTokenRateLimit(
      tokenRecord.userId || 'anonymous',
      'NEWSLETTER_CONFIRMATION',
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
      userId: tokenRecord.userId || 'anonymous',
      type: 'NEWSLETTER_CONFIRMATION',
      expiresInHours: 48, // Newsletter tem 48h de validade
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    // Atualizar subscriber com novo token
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        confirmationToken: newToken,
      },
    });

    // Enviar novo email de confirmação

    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/confirm',
      newToken
    );

    const unsubscribeUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/unsubscribe',
      newToken
    );

    const emailResult = await sendTemplateEmail(subscriber.email, {
      type: 'WELCOME',
      variables: {
        firstName: subscriber.firstName || 'Usuário',
        confirmationUrl,
        unsubscribeUrl,
      },
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email de confirmação' },
        { status: 500 }
      );
    }

    // Log de segurança
    logSecurityEvent(
      'NEWSLETTER_CONFIRMATION_RESENT',
      subscriber.userId || 'anonymous',
      {
        email: subscriber.email,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        subscriberId: subscriber.id,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Novo email de confirmação enviado!',
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error('Erro ao reenviar confirmação de newsletter:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
