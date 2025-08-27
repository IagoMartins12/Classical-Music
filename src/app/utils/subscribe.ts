import { sendEmail } from '../libs/newsletter/email';
import prisma from '../libs/prismadb';

// Funções auxiliares
export async function sendWelcomeEmail(subscriber: any) {
  try {
    const template = await getEmailTemplate('WELCOME');

    const emailData = {
      to: subscriber.email,
      subject: 'Bem-vindo à Opus Atlas! 🎼',
      html: replaceTemplateVariables(template.htmlContent, {
        firstName: subscriber.firstName || 'Amante da música',
        email: subscriber.email,
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`,
      }),
      text: replaceTemplateVariables(template.textContent, {
        firstName: subscriber.firstName || 'Amante da música',
        email: subscriber.email,
        unsubscribeUrl: `${process.env.NEXTAUTH_URL}/api/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`,
      }),
    };

    await sendEmail(emailData);
  } catch (error) {
    console.error('Erro ao enviar email de boas-vindas:', error);
  }
}

export async function sendUnsubscribeConfirmationEmail(subscriber: any) {
  try {
    const emailData = {
      to: subscriber.email,
      subject: 'Inscrição cancelada - Opus Atlas',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Inscrição cancelada</h2>
          <p>Olá ${subscriber.firstName || ''},</p>
          <p>Sua inscrição na newsletter da Opus Atlas foi cancelada com sucesso.</p>
          <p>Sentimos muito em vê-lo partir! Se mudar de ideia, sempre pode se inscrever novamente em nosso site.</p>
          <p>Obrigado por ter sido parte da nossa comunidade de música clássica.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Opus Atlas - Sua plataforma de música clássica
          </p>
        </div>
      `,
      text: `
Inscrição cancelada

Olá ${subscriber.firstName || ''},

Sua inscrição na newsletter da Opus Atlas foi cancelada com sucesso.

Sentimos muito em vê-lo partir! Se mudar de ideia, sempre pode se inscrever novamente em nosso site.

Obrigado por ter sido parte da nossa comunidade de música clássica.

Opus Atlas - Sua plataforma de música clássica
      `,
    };

    await sendEmail(emailData);
  } catch (error) {
    console.error(
      'Erro ao enviar email de confirmação de cancelamento:',
      error
    );
  }
}

export async function getEmailTemplate(type: string) {
  const template = await prisma.newsletterTemplate.findFirst({
    where: {
      type: type as any,
      isActive: true,
      isDefault: true,
    },
  });

  if (!template) {
    return {
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Bem-vindo à Opus Atlas, {{firstName}}!</h1>
          <p>Obrigado por se inscrever na nossa newsletter de música clássica.</p>
          <p>Para confirmar sua inscrição, clique no botão abaixo:</p>
          <a href="{{confirmationUrl}}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0;">
            Confirmar Inscrição
          </a>
          <p>Se você não solicitou esta inscrição, pode ignorar este email.</p>
        </div>
      `,
      textContent: `
Bem-vindo à Opus Atlas, {{firstName}}!

Para confirmar sua inscrição, acesse: {{confirmationUrl}}

Se você não solicitou esta inscrição, pode ignorar este email.
      `,
    };
  }

  return template;
}

export function replaceTemplateVariables(
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
