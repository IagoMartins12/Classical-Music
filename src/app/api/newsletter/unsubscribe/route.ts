// app/api/newsletter/unsubscribe/route.ts - VERSÃO CORRIGIDA
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  logSecurityEvent,
} from '@/app/libs/tokenUtils';
import { sendTemplateEmail } from '@/app/libs/newsletter/email';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token ou email obrigatório' },
        { status: 400 }
      );
    }

    let subscriber;

    if (token) {
      // Validar token usando sistema novo
      const validation = await validateToken(token, 'NEWSLETTER_UNSUBSCRIBE');

      if (!validation.valid) {
        let errorMessage = 'Token inválido';
        if (validation.expired) {
          errorMessage = 'Token expirado';
        } else if (validation.used) {
          errorMessage = 'Token já foi utilizado';
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 400 }
        );
      }

      const tokenRecord = validation.token;

      // Buscar subscriber pelo token metadata ou userId
      if (tokenRecord.userId && tokenRecord.userId !== 'anonymous') {
        subscriber = await prisma.newsletterSubscriber.findFirst({
          where: { userId: tokenRecord.userId },
        });
      } else {
        // Para tokens anônimos, usar o email do metadata
        const tokenEmail = tokenRecord.anonymousEmail;
        if (tokenEmail) {
          subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: tokenEmail },
          });
        }
      }
    } else if (email) {
      // Buscar diretamente por email
      subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber não encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.json({
        success: false,
        error: 'Esta inscrição já foi cancelada',
        status: 'already_unsubscribed',
        subscriber: {
          email: subscriber.email,
          unsubscribedAt: subscriber.unsubscribedAt,
        },
      });
    }

    // Retornar dados para página de unsubscribe
    return NextResponse.json({
      success: true,
      subscriber: {
        email: subscriber.email,
        firstName: subscriber.firstName,
        status: subscriber.status,
        subscribedAt: subscriber.subscribedAt,
      },
      token: token || null,
    });
  } catch (error) {
    console.error('Erro no unsubscribe GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, reason, feedback } = body;

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token ou email obrigatório' },
        { status: 400 }
      );
    }

    let subscriber;

    if (token) {
      // Validar token
      const validation = await validateToken(token, 'NEWSLETTER_UNSUBSCRIBE');

      if (!validation.valid) {
        let errorMessage = 'Token inválido';
        if (validation.expired) {
          errorMessage = 'Token expirado';
        } else if (validation.used) {
          errorMessage = 'Token já foi utilizado';
        }

        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 400 }
        );
      }

      const tokenRecord = validation.token;

      // Buscar subscriber
      if (tokenRecord.userId && tokenRecord.userId !== 'anonymous') {
        subscriber = await prisma.newsletterSubscriber.findFirst({
          where: { userId: tokenRecord.userId },
        });
      } else {
        const tokenEmail = tokenRecord.anonymousEmail;
        if (tokenEmail) {
          subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: tokenEmail },
          });
        }
      }

      // Marcar token como usado após validação bem-sucedida
      await markTokenAsUsed(token);
    } else if (email) {
      subscriber = await prisma.newsletterSubscriber.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
    }

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber não encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'UNSUBSCRIBED') {
      return NextResponse.json({
        success: false,
        error: 'Esta inscrição já foi cancelada anteriormente',
        status: 'already_unsubscribed',
      });
    }

    // Cancelar inscrição
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        unsubscribeReason: reason || 'not_specified',
      },
    });

    // Log do evento
    await prisma.newsletterEmailEvent.create({
      data: {
        eventType: 'UNSUBSCRIBED',
        subscriberId: subscriber.id,
        eventData: {
          reason,
          feedback,
        },
      },
    });

    // Log de segurança
    logSecurityEvent(
      'NEWSLETTER_UNSUBSCRIBED',
      subscriber.userId || 'anonymous',
      {
        email: subscriber.email,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        reason,
        subscriberId: subscriber.id,
      }
    );

    // 🆕 CRIAR URL DE REINSCRIÇÃO - usando página existente
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resubscribeUrl = `${baseUrl}/newsletter/confirm?email=${encodeURIComponent(
      subscriber.email
    )}`;

    // 🆕 USAR O TEMPLATE NOVO
    try {
      const emailResult = await sendTemplateEmail(subscriber.email, {
        type: 'UNSUBSCRIBE_CONFIRMATION',
        variables: {
          firstName: subscriber.firstName || 'Usuário',
          reason: reason || 'Não especificado',
          feedback: feedback || '',
          resubscribeUrl, // 🆕 URL para reinscrição
        },
      });

      if (!emailResult.success) {
        console.error(
          'Erro ao enviar email de confirmação:',
          emailResult.error
        );
      }
    } catch (emailError) {
      console.error('Erro ao enviar email de confirmação:', emailError);
      // Não falhar a operação por causa do email
    }

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso',
      subscriber: {
        email: subscriber.email,
        unsubscribedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
