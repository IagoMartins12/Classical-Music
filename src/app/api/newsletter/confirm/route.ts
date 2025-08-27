// app/api/newsletter/confirm/route.ts - VERSÃO CORRIGIDA
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  logSecurityEvent,
  createToken,
  createTokenUrl,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token de confirmação obrigatório' },
        { status: 400 }
      );
    }

    // Validar token usando sistema novo
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
      // É subscriber anônimo - buscar pelo email no metadata
      const tokenEmail = tokenRecord.anonymousEmail;
      if (tokenEmail) {
        subscriber = await prisma.newsletterSubscriber.findUnique({
          where: { email: tokenEmail },
        });
      }
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
          confirmedAt: subscriber.confirmedAt,
        },
      });
    }

    // Confirmar inscrição na newsletter
    const confirmedSubscriber = await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
      },
    });

    // Marcar token como usado
    await markTokenAsUsed(token);

    // Criar token de unsubscribe para o subscriber confirmado
    const unsubscribeToken = await createToken({
      userId: subscriber.userId || undefined,
      type: 'NEWSLETTER_UNSUBSCRIBE',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      anonymousEmail: !subscriber.userId ? subscriber.email : undefined,
      expiresInHours: 24 * 365, // Token de unsubscribe válido por 1 ano
    });

    // Gerar URLs
    const unsubscribeUrl = createTokenUrl(
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      'newsletter/unsubscribe',
      unsubscribeToken
    );

    // Enviar email de boas-vindas
    try {
      const emailResult = await sendTemplateEmail(subscriber.email, {
        type: 'WELCOME',
        variables: {
          firstName: subscriber.firstName || 'Usuário',
          unsubscribeUrl,
        },
      });

      if (!emailResult.success) {
        console.error(
          'Erro ao enviar email de boas-vindas:',
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
      // Não falhar a confirmação por causa do email
    }

    // Log do evento
    await prisma.newsletterEmailEvent.create({
      data: {
        eventType: 'DELIVERED', // Confirmação = entrega confirmada
        subscriberId: confirmedSubscriber.id,
        eventData: { action: 'email_confirmed' },
      },
    });

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
        email: confirmedSubscriber.email,
        firstName: confirmedSubscriber.firstName,
        confirmedAt: confirmedSubscriber.confirmedAt,
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
