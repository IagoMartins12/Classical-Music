// app/api/newsletter/subscribe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import prisma from '@/app/libs/prismadb';
import { getClientIpAddress, getUserAgent } from '../../contact/route';
import { sendEmail } from '@/app/libs/newsletter/email';
import { getSession } from 'next-auth/react';
import { authOptions } from '@/app/libs/auth';
import { getServerSession } from 'next-auth';

// Validação de entrada
const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  interests: z.array(z.string()).optional(),
  experienceLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  sourceUrl: z.string().optional(),
  utmSource: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = subscribeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      email,
      firstName,
      lastName,
      interests = [],
      experienceLevel,
      frequency = 'weekly',
      sourceUrl,
      utmSource,
    } = validation.data;

    // Verificar se já existe subscriber
    const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'ACTIVE') {
        return NextResponse.json(
          {
            success: false,
            error: 'Este email já está inscrito na nossa newsletter',
            status: 'already_subscribed',
          },
          { status: 409 }
        );
      }

      if (existingSubscriber.status === 'PENDING') {
        // Reenviar email de confirmação
        await sendConfirmationEmail(existingSubscriber);
        return NextResponse.json({
          success: true,
          message: 'Email de confirmação reenviado',
          status: 'confirmation_resent',
        });
      }

      // Se estava unsubscribed, reativar
      if (existingSubscriber.status === 'UNSUBSCRIBED') {
        const confirmationToken = crypto.randomBytes(32).toString('hex');

        const updated = await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            status: 'PENDING',
            firstName: firstName || existingSubscriber.firstName,
            lastName: lastName || existingSubscriber.lastName,
            interests:
              interests.length > 0 ? interests : existingSubscriber.interests,
            experienceLevel:
              experienceLevel || existingSubscriber.experienceLevel,
            frequency,
            confirmationToken,
            confirmedAt: null,
            unsubscribedAt: null,
            subscribedAt: new Date(),
            sourceUrl: sourceUrl || existingSubscriber.sourceUrl,
            referralSource: utmSource || existingSubscriber.referralSource,
            ipAddress: getClientIpAddress(request),
            userAgent: getUserAgent(request),
          },
        });

        await sendConfirmationEmail(updated);

        return NextResponse.json({
          success: true,
          message: 'Inscrição reativada! Verifique seu email para confirmar.',
          status: 'resubscribed',
        });
      }
    }

    // Verificar se é usuário logado
    let userId = null;
    try {
      // Verificar se tem session cookie/token
      const user = await getServerSession(authOptions);
      userId = user?.user.id || null;
    } catch (error) {
      // Não logado, continuar sem userId
    }

    // Criar novo subscriber
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const unsubscribeToken = crypto.randomBytes(32).toString('hex');

    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName,
        lastName,
        userId,
        interests,
        experienceLevel,
        frequency,
        confirmationToken,
        unsubscribeToken,
        sourceUrl,
        referralSource: utmSource,
        ipAddress: getClientIpAddress(request),
        userAgent: getUserAgent(request),
        preferences: {
          weekly_digest: true,
          new_composers: true,
          new_works: true,
          study_reminders: false,
          marketing: false,
        },
      },
    });

    // Enviar email de confirmação
    await sendConfirmationEmail(subscriber);

    // Log do evento
    await logNewsletterEvent('SUBSCRIBE_ATTEMPT', {
      email,
      subscriberId: subscriber.id,
      source: utmSource || 'direct',
      ipAddress: getClientIpAddress(request),
    });

    return NextResponse.json({
      success: true,
      message: 'Inscrição realizada! Verifique seu email para confirmar.',
      status: 'pending_confirmation',
    });
  } catch (error) {
    console.error('Erro na inscrição da newsletter:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}

// Função para enviar email de confirmação
async function sendConfirmationEmail(subscriber: any) {
  const confirmationUrl = `${process.env.NEXTAUTH_URL}/newsletter/confirm?token=${subscriber.confirmationToken}`;

  const template = await getEmailTemplate('WELCOME');

  const emailData = {
    to: subscriber.email,
    subject: 'Confirme sua inscrição na Classical Hub',
    html: replaceTemplateVariables(template.htmlContent, {
      firstName: subscriber.firstName || 'Música',
      confirmationUrl,
      email: subscriber.email,
    }),
    text: replaceTemplateVariables(template.textContent, {
      firstName: subscriber.firstName || 'Música',
      confirmationUrl,
      email: subscriber.email,
    }),
  };

  await sendEmail(emailData);
}

// Função para buscar template de email
async function getEmailTemplate(type: string) {
  const template = await prisma.newsletterTemplate.findFirst({
    where: {
      type: type as any,
      isActive: true,
      isDefault: true,
    },
  });

  if (!template) {
    // Template padrão fallback
    return {
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Bem-vindo à Classical Hub, {{firstName}}!</h1>
          <p>Obrigado por se inscrever na nossa newsletter de música clássica.</p>
          <p>Para confirmar sua inscrição, clique no botão abaixo:</p>
          <a href="{{confirmationUrl}}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
            Confirmar Inscrição
          </a>
          <p>Se você não solicitou esta inscrição, pode ignorar este email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Classical Hub - Sua plataforma de música clássica<br>
            Email: {{email}}
          </p>
        </div>
      `,
      textContent: `
Bem-vindo à Classical Hub, {{firstName}}!

Obrigado por se inscrever na nossa newsletter de música clássica.

Para confirmar sua inscrição, acesse o link: {{confirmationUrl}}

Se você não solicitou esta inscrição, pode ignorar este email.

Classical Hub - Sua plataforma de música clássica
Email: {{email}}
      `,
    };
  }

  return template;
}

// Função para substituir variáveis no template
function replaceTemplateVariables(
  content: string,
  variables: Record<string, string>
) {
  let result = content;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  });

  return result;
}

// Função para obter usuário atual (simplificada)
async function getCurrentUser(request: NextRequest) {
  // Implementar lógica de autenticação baseada em session/token
  // Por enquanto retorna null
  return null;
}

// Função para log de eventos
async function logNewsletterEvent(eventType: string, data: any) {
  try {
    // Implementar logging se necessário
    console.log(`Newsletter Event: ${eventType}`, data);
  } catch (error) {
    console.error('Erro ao fazer log do evento:', error);
  }
}
