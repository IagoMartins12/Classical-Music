import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import { sendUnsubscribeConfirmationEmail } from '../resubscribe/route';

// app/api/newsletter/unsubscribe/route.ts
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

    // Buscar subscriber
    const whereCondition: any = {};
    if (token) {
      whereCondition.unsubscribeToken = token;
    } else if (email) {
      whereCondition.email = email;
    }

    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: whereCondition,
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber não encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'UNSUBSCRIBED') {
      const redirectUrl = `${process.env.NEXTAUTH_URL}/newsletter/success?type=already_unsubscribed`;
      return NextResponse.redirect(redirectUrl);
    }

    // Redirecionar para página de unsubscribe com formulário
    const redirectUrl = `${process.env.NEXTAUTH_URL}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}&email=${subscriber.email}`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Erro no unsubscribe:', error);

    const redirectUrl = `${process.env.NEXTAUTH_URL}/newsletter/error?type=unsubscribe`;
    return NextResponse.redirect(redirectUrl);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, email, reason } = body;

    if (!token && !email) {
      return NextResponse.json(
        { success: false, error: 'Token ou email obrigatório' },
        { status: 400 }
      );
    }

    // Buscar subscriber
    const whereCondition: any = {};
    if (token) {
      whereCondition.unsubscribeToken = token;
    } else if (email) {
      whereCondition.email = email;
    }

    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: whereCondition,
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber não encontrado' },
        { status: 404 }
      );
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
      },
    });

    // Enviar email de confirmação de cancelamento (opcional)
    if (subscriber.email) {
      await sendUnsubscribeConfirmationEmail(subscriber);
    }

    return NextResponse.json({
      success: true,
      message: 'Inscrição cancelada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao cancelar inscrição:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
