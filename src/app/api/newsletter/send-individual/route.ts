// app/api/admin/newsletter/send-individual/route.ts
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subscriberId, subject, content, recipientName } = body;

    // Validações
    if (!subscriberId || !subject || !content) {
      return NextResponse.json(
        { success: false, error: 'Dados obrigatórios não fornecidos' },
        { status: 400 }
      );
    }

    // Buscar subscriber
    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { id: subscriberId },
    });

    if (!subscriber) {
      return NextResponse.json(
        { success: false, error: 'Subscriber não encontrado' },
        { status: 404 }
      );
    }

    if (subscriber.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Subscriber não está ativo' },
        { status: 400 }
      );
    }

    // Processar conteúdo com variáveis
    let processedContent = content;
    let processedSubject = subject;

    // Substituir variáveis conhecidas
    const variables = {
      '{{firstName}}': subscriber.firstName || recipientName || 'Usuário',
      '{{lastName}}': subscriber.lastName || '',
      '{{email}}': subscriber.email,
    };

    Object.entries(variables).forEach(([placeholder, value]) => {
      processedContent = processedContent.replace(
        new RegExp(placeholder, 'g'),
        value
      );
      processedSubject = processedSubject.replace(
        new RegExp(placeholder, 'g'),
        value
      );
    });

    // Criar registro de campanha individual
    const individualCampaign = await prisma.newsletterCampaign.create({
      data: {
        name: `Email Individual - ${subscriber.email}`,
        subject: processedSubject,
        customHtmlContent: processedContent,
        customTextContent: processedContent, // Versão simplificada
        status: 'SENDING',
        senderName: 'Opus Atlas',
        senderEmail: 'noreply@opusatlas.com',
        targetSubscriberIds: [subscriberId],
        templateType: 'CUSTOM_CAMPAIGN',
        useCustomTemplate: true,
      },
    });

    // Criar registro de envio
    const campaignSend = await prisma.newsletterCampaignSend.create({
      data: {
        campaignId: individualCampaign.id,
        subscriberId: subscriber.id,
        status: 'sent',
        sentAt: new Date(),
      },
    });

    // Simular envio (aqui você integraria com SendGrid, SES, etc.)
    const emailSent = await sendEmailViaProvider({
      to: subscriber.email,
      subject: processedSubject,
      html: processedContent,
      text: processedContent,
      senderName: 'Opus Atlas',
      senderEmail: 'noreply@opusatlas.com',
    });

    if (!emailSent.success) {
      // Atualizar status para falha
      await prisma.newsletterCampaignSend.update({
        where: { id: campaignSend.id },
        data: { status: 'failed' },
      });

      await prisma.newsletterCampaign.update({
        where: { id: individualCampaign.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { success: false, error: 'Falha no envio do email' },
        { status: 500 }
      );
    }

    // Atualizar estatísticas da campanha
    await prisma.newsletterCampaign.update({
      where: { id: individualCampaign.id },
      data: {
        status: 'SENT',
        emailsSent: 1,
        emailsDelivered: 1, // Assumir entrega por enquanto
        sentAt: new Date(),
      },
    });

    // Registrar evento de envio
    await prisma.newsletterEmailEvent.create({
      data: {
        eventType: 'SENT',
        subscriberId: subscriber.id,
        campaignId: individualCampaign.id,
        timestamp: new Date(),
        eventData: {
          emailId: emailSent.emailId,
          subject: processedSubject,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso!',
      campaign: {
        id: individualCampaign.id,
        name: individualCampaign.name,
      },
      emailId: emailSent.emailId,
    });
  } catch (error) {
    console.error('Erro ao enviar email individual:', error);

    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função simulada para envio via provedor
async function sendEmailViaProvider(emailData: {
  to: string;
  subject: string;
  html: string;
  text: string;
  senderName: string;
  senderEmail: string;
}): Promise<{ success: boolean; emailId?: string; error?: string }> {
  console.log('email', emailData);
  try {
    // Simular chamada para provedor de email (SendGrid, SES, etc.)
    // Por enquanto, apenas simular sucesso

    // Exemplo de integração com SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    //
    // const msg = {
    //   to: emailData.to,
    //   from: { email: emailData.senderEmail, name: emailData.senderName },
    //   subject: emailData.subject,
    //   text: emailData.text,
    //   html: emailData.html,
    // };
    //
    // const [response] = await sgMail.send(msg);
    // return { success: true, emailId: response.headers['x-message-id'] };

    // Simular delay de envio
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simular sucesso (95% de taxa de sucesso)
    const success = Math.random() > 0.05;

    if (success) {
      return {
        success: true,
        emailId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    } else {
      return {
        success: false,
        error: 'Falha simulada no provedor de email',
      };
    }
  } catch (error) {
    console.error('Erro no provedor de email:', error);
    return {
      success: false,
      error: 'Erro na integração com provedor de email',
    };
  }
}
