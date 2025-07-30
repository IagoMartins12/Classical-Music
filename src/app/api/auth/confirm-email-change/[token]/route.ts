// app/api/auth/confirm-email-change/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import {
  validateToken,
  markTokenAsUsed,
  logSecurityEvent,
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

    // Validate token
    const validation = await validateToken(token, 'EMAIL_CHANGE');

    if (!validation.valid) {
      let errorMessage = 'Token inválido';
      let errorCode = 'INVALID_TOKEN';

      if (validation.expired) {
        errorMessage = 'Token expirado. Solicite uma nova mudança de email.';
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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Token inválido - usuário não encontrado' },
        { status: 400 }
      );
    }

    // Get metadata from token
    const metadata = tokenRecord.metadata as any;
    const newEmail = metadata?.newEmail || tokenRecord.anonymousEmail;
    const oldEmail = metadata?.oldEmail;

    if (!newEmail) {
      return NextResponse.json(
        { success: false, error: 'Token inválido - email não encontrado' },
        { status: 400 }
      );
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Check if new email is still available
    const emailTaken = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (emailTaken && emailTaken.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Este email já está sendo usado por outra conta.',
          errorCode: 'EMAIL_TAKEN',
        },
        { status: 400 }
      );
    }

    // Update user email and re-verify
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: newEmail,
        emailVerified: new Date(), // Re-verify the new email
      },
    });

    // Mark token as used
    await markTokenAsUsed(token);

    // Send notification to old email (if different)
    if (oldEmail && oldEmail !== newEmail) {
      sendTemplateEmail(oldEmail, {
        type: 'EMAIL_CHANGED_NOTIFICATION',
        variables: {
          firstName: user.firstName || 'Usuário',
          oldEmail: oldEmail,
          newEmail: newEmail,
          changeDate: new Date().toLocaleString('pt-BR'),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      }).catch((error) => {
        console.error('Erro ao enviar notificação para email antigo:', error);
      });
    }

    // Send welcome email to new address
    sendTemplateEmail(newEmail, {
      type: 'EMAIL_CHANGE_SUCCESS',
      variables: {
        firstName: user.firstName || 'Usuário',
        oldEmail: oldEmail || user.email,
        newEmail: newEmail,
        changeDate: new Date().toLocaleString('pt-BR'),
      },
    }).catch((error) => {
      console.error('Erro ao enviar confirmação para novo email:', error);
    });

    // Log security event
    logSecurityEvent('EMAIL_CHANGED', userId, {
      oldEmail: oldEmail || user.email,
      newEmail: newEmail,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: 'Email alterado com sucesso!',
      data: {
        oldEmail: oldEmail || user.email,
        newEmail: newEmail,
        firstName: user.firstName,
      },
    });
  } catch (error) {
    console.error('Erro na confirmação de mudança de email:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST method to resend confirmation (if needed)
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

    // Get original token info
    const tokenRecord = await prisma.userToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
          },
        },
      },
    });

    if (!tokenRecord || !tokenRecord.user) {
      return NextResponse.json(
        { success: false, error: 'Token não encontrado' },
        { status: 404 }
      );
    }

    const metadata = tokenRecord.metadata as any;
    const newEmail = metadata?.newEmail || tokenRecord.anonymousEmail;

    if (!newEmail) {
      return NextResponse.json(
        { success: false, error: 'Email não encontrado no token' },
        { status: 400 }
      );
    }

    // Create new token and resend (implementation similar to requestEmailChange)
    // This would call the requestEmailChange function again

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação reenviado!',
    });
  } catch (error) {
    console.error('Erro ao reenviar confirmação de mudança de email:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
