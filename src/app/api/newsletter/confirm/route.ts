// app/api/newsletter/confirm/route.ts
import prisma from '@/app/libs/prismadb';
import { sendWelcomeEmail } from '@/app/utils/subscribe';
import { NextRequest, NextResponse } from 'next/server';

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

    // Buscar subscriber pelo token
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { confirmationToken: token },
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 404 }
      );
    }

    if (subscriber.status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Email já confirmado anteriormente',
        status: 'already_confirmed',
      });
    }

    // Confirmar inscrição
    const confirmed = await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'ACTIVE',
        confirmedAt: new Date(),
        confirmationToken: null, // Remover token após uso
      },
    });

    // Enviar email de boas-vindas
    await sendWelcomeEmail(confirmed);

    // Log do evento
    await prisma.newsletterEmailEvent.create({
      data: {
        eventType: 'DELIVERED', // Confirmação = entrega confirmada
        subscriberId: confirmed.id,
        timestamp: new Date(),
        eventData: { action: 'email_confirmed' },
      },
    });

    // Redirecionar para página de sucesso
    const redirectUrl = `${process.env.NEXTAUTH_URL}/newsletter/success?type=confirmed`;
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Erro na confirmação:', error);

    const redirectUrl = `${process.env.NEXTAUTH_URL}/newsletter/error?type=confirmation`;
    return NextResponse.redirect(redirectUrl);
  }
}
