// app/api/newsletter/resubscribe/route.ts - VERSÃO CORRIGIDA
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  createToken,
  createTokenUrl,
  logSecurityEvent,
  checkTokenRateLimit,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email obrigatório' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Buscar subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalizedEmail },
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Email não encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Este email já está ativo na newsletter',
          status: 'already_active',
          subscriber: {
            email: subscriber.email,
            firstName: subscriber.firstName,
            confirmedAt: subscriber.confirmedAt,
          },
        },
        { status: 409 }
      );
    }

    if (subscriber.status === 'PENDING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Este email já está pendente de confirmação',
          status: 'pending_confirmation',
          message: 'Verifique sua caixa de entrada ou solicite um novo link.',
        },
        { status: 409 }
      );
    }

    // Verificar rate limit para reinscrições
    const userIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimit = await checkTokenRateLimit(
      subscriber.userId || 'anonymous',
      'NEWSLETTER_CONFIRMATION',
      3 // Máximo 3 tentativas por hora
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Muitas tentativas de reinscrição. Tente novamente em 1 hora.',
          remainingAttempts: rateLimit.remainingAttempts,
        },
        { status: 429 }
      );
    }

    // Verificar se é usuário registrado
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Criar novo token de confirmação usando sistema novo
    const confirmationToken = await createToken({
      userId: existingUser?.id || subscriber.userId || undefined,
      type: 'NEWSLETTER_CONFIRMATION',
      ipAddress: userIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      anonymousEmail:
        !existingUser && !subscriber.userId ? normalizedEmail : undefined,
      expiresInHours: 48, // Token válido por 48h
    });

    const confirmationUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/confirm',
      confirmationToken
    );

    // Criar token de unsubscribe
    const unsubscribeToken = await createToken({
      userId: existingUser?.id || subscriber.userId || undefined,
      type: 'NEWSLETTER_UNSUBSCRIBE',
      ipAddress: userIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      anonymousEmail:
        !existingUser && !subscriber.userId ? normalizedEmail : undefined,
      expiresInHours: 24 * 365, // Token de unsubscribe válido por 1 ano
    });

    const unsubscribeUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/unsubscribe',
      unsubscribeToken
    );

    // Reativar subscriber e atualizar dados
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'PENDING',
        subscribedAt: new Date(), // Nova data de inscrição
        confirmedAt: null, // Reset confirmação
        unsubscribedAt: null, // Limpar cancelamento
        unsubscribeReason: null, // Limpar razão
        // Atualizar dados do usuário se necessário
        firstName: existingUser?.firstName || subscriber.firstName,
        lastName: existingUser?.lastName || subscriber.lastName,
        userId: existingUser?.id || subscriber.userId,
      },
    });

    // Enviar novo email de confirmação
    const emailResult = await sendTemplateEmail(normalizedEmail, {
      type: 'WELCOME',
      variables: {
        firstName: existingUser?.firstName || subscriber.firstName || 'Usuário',
        confirmationUrl,
        unsubscribeUrl,
      },
    });

    if (!emailResult.success) {
      console.error('Erro ao enviar email de confirmação:', emailResult.error);
      return NextResponse.json(
        { success: false, error: 'Erro ao enviar email de confirmação' },
        { status: 500 }
      );
    }

    // Log de segurança
    logSecurityEvent(
      'NEWSLETTER_RESUBSCRIBED',
      existingUser?.id || subscriber.userId || 'anonymous',
      {
        email: normalizedEmail,
        ip: userIP,
        subscriberId: subscriber.id,
        hasUserAccount: !!existingUser,
      }
    );

    return NextResponse.json({
      success: true,
      message:
        'Bem-vindo de volta! Enviamos um email de confirmação para reativar sua inscrição.',
      status: 'resubscribed',
      subscriber: {
        email: normalizedEmail,
        firstName: existingUser?.firstName || subscriber.firstName,
        subscribedAt: new Date(),
      },
      remainingAttempts: rateLimit.remainingAttempts - 1,
    });
  } catch (error) {
    console.error('Erro na reinscrição:', error);

    logSecurityEvent('NEWSLETTER_RESUBSCRIPTION_ERROR', '', {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
