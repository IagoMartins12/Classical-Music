import prisma from '@/app/libs/prismadb';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendConfirmationEmail } from '@/app/utils/subscribe';
// app/api/newsletter/resubscribe/route.ts
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

    // Buscar subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
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
        },
        { status: 409 }
      );
    }

    // Gerar novo token de confirmação
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Reativar subscriber
    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: 'PENDING',
        confirmationToken,
        subscribedAt: new Date(),
        unsubscribedAt: null,
        unsubscribeReason: null,
      },
    });

    // Enviar novo email de confirmação
    await sendConfirmationEmail(subscriber);

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação enviado. Verifique sua caixa de entrada.',
    });
  } catch (error) {
    console.error('Erro na reinscrição:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
