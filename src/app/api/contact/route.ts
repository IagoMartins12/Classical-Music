// app/api/contact/route.ts
import { sendEmail } from '@/app/libs/newsletter/email';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schema de validação
const contactSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  subject: z.string().min(5, 'Assunto deve ter pelo menos 5 caracteres'),
  message: z.string().min(10, 'Mensagem deve ter pelo menos 10 caracteres'),
  category: z.enum(['suporte', 'bug', 'moderacao', 'parceria', 'feedback']),
  priority: z.enum(['baixa', 'normal', 'alta', 'urgente']),
  subscribeNewsletter: z.boolean().optional(),
  sourceUrl: z.string().url().optional(),
  userAgent: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = contactSchema.safeParse(body);

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
      name,
      email,
      subject,
      message,
      category,
      priority,
      subscribeNewsletter = false,
      sourceUrl,
      userAgent,
    } = validation.data;

    // Gerar ID único do ticket
    const ticketId = generateTicketId();

    // Dados do IP e user agent
    const ipAddress = getClientIpAddress(request);
    const clientUserAgent = getUserAgent(request) || userAgent;

    // Se usuário quer se inscrever na newsletter
    if (subscribeNewsletter) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/newsletter/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' '),
            sourceUrl: 'contact_form',
            utmSource: 'contact',
          }),
        });
      } catch (newsletterError) {
        console.warn('Erro ao inscrever na newsletter:', newsletterError);
        // Não bloquear o envio do contato se falhar a newsletter
      }
    }

    // Enviar email para o suporte
    await sendSupportEmail({
      ticketId,
      name,
      email,
      subject,
      message,
      category,
      priority,
      sourceUrl,
      ipAddress,
      userAgent: clientUserAgent,
    });

    // Enviar email de confirmação para o usuário
    await sendConfirmationEmail({
      ticketId,
      name,
      email,
      subject,
      category,
    });

    // Log do contato (opcional - implementar se necessário)
    await logContactSubmission({
      ticketId,
      email,
      category,
      priority,
      ipAddress,
      userAgent: clientUserAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso! Responderemos em breve.',
      ticketId,
    });
  } catch (error) {
    console.error('Erro no formulário de contato:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Erro interno do servidor. Tente novamente mais tarde.',
      },
      { status: 500 }
    );
  }
}

// Função para enviar email para o suporte
async function sendSupportEmail(data: {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  sourceUrl?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const priorityLabel = getPriorityLabel(data.priority);
  const categoryLabel = getCategoryLabel(data.category);
  const priorityColor = getPriorityColor(data.priority);

  const emailData = {
    to: 'suporte@classicalhub.com',
    cc:
      data.category === 'moderacao' ? 'moderacao@classicalhub.com' : undefined,
    subject: `[${data.ticketId}] ${priorityLabel} - ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Nova Mensagem de Contato</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Opus Atlas</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Detalhes do Ticket</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Ticket ID:</td>
                <td style="padding: 8px 0; color: #1f2937; font-family: monospace; font-weight: bold;">${
                  data.ticketId
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Categoria:</td>
                <td style="padding: 8px 0; color: #1f2937;">${categoryLabel}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Prioridade:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                    ${priorityLabel}
                  </span>
                </td>
              </tr>
            </table>
          </div>
          
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">Dados do Usuário</h3>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Nome:</strong> ${
            data.name
          }</p>
          <p style="margin: 5px 0; color: #4b5563;"><strong>Email:</strong> ${
            data.email
          }</p>
          
          <h3 style="color: #1f2937; margin: 20px 0 10px 0;">Assunto</h3>
          <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 0; color: #1f2937;">${
            data.subject
          }</p>
          
          <h3 style="color: #1f2937; margin: 20px 0 10px 0;">Mensagem</h3>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #6366f1;">
            <p style="margin: 0; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${
              data.message
            }</p>
          </div>
          
          ${
            data.sourceUrl || data.ipAddress || data.userAgent
              ? `
          <h4 style="color: #6b7280; margin: 20px 0 10px 0; font-size: 14px;">Informações Técnicas</h4>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; font-size: 12px; color: #6b7280;">
            ${
              data.sourceUrl
                ? `<p style="margin: 0 0 5px 0;"><strong>URL de origem:</strong> ${data.sourceUrl}</p>`
                : ''
            }
            ${
              data.ipAddress
                ? `<p style="margin: 0 0 5px 0;"><strong>IP:</strong> ${data.ipAddress}</p>`
                : ''
            }
            ${
              data.userAgent
                ? `<p style="margin: 0;"><strong>User Agent:</strong> ${data.userAgent}</p>`
                : ''
            }
          </div>
          `
              : ''
          }
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Responda este email para entrar em contato diretamente com o usuário
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
Nova Mensagem de Contato - Opus Atlas

Ticket ID: ${data.ticketId}
Categoria: ${categoryLabel}
Prioridade: ${priorityLabel}

===== DADOS DO USUÁRIO =====
Nome: ${data.name}
Email: ${data.email}

===== ASSUNTO =====
${data.subject}

===== MENSAGEM =====
${data.message}

${data.sourceUrl ? `URL de origem: ${data.sourceUrl}` : ''}
${data.ipAddress ? `IP: ${data.ipAddress}` : ''}
${data.userAgent ? `User Agent: ${data.userAgent}` : ''}

Responda este email para entrar em contato diretamente com o usuário.
    `,
    replyTo: data.email,
  };

  await sendEmail(emailData);
}

// Função para enviar email de confirmação
async function sendConfirmationEmail(data: {
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  category: string;
}) {
  const categoryLabel = getCategoryLabel(data.category);

  const emailData = {
    to: data.email,
    subject: `Confirmação de Contato - ${data.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Mensagem Recebida!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Opus Atlas</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="color: #1f2937; font-size: 16px; line-height: 1.6;">Olá ${
            data.name.split(' ')[0]
          },</p>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Recebemos sua mensagem e nossa equipe já foi notificada. Responderemos o mais breve possível!
          </p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1f2937;">Resumo da sua mensagem:</h3>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Ticket ID:</strong> <span style="font-family: monospace; color: #1f2937;">${
              data.ticketId
            }</span></p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Categoria:</strong> ${categoryLabel}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>Assunto:</strong> ${
              data.subject
            }</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1e40af;">⏱️ Tempo de Resposta</h4>
            <p style="margin: 0; color: #1e3a8a;">
              Normalmente respondemos em até <strong>24 horas</strong> durante dias úteis.
              ${
                data.category === 'urgente'
                  ? ' Como sua mensagem foi marcada como urgente, priorizaremos a resposta.'
                  : ''
              }
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.NEXTAUTH_URL
            }/faq" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
              Consultar FAQ
            </a>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          
          <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 0;">
            Se precisar de algo urgente, você pode entrar em contato conosco pelo telefone: <strong>+55 (11) 9999-9999</strong>
          </p>
        </div>
      </div>
    `,
    text: `
Olá ${data.name.split(' ')[0]},

Recebemos sua mensagem e nossa equipe já foi notificada. Responderemos o mais breve possível!

RESUMO DA SUA MENSAGEM:
Ticket ID: ${data.ticketId}
Categoria: ${categoryLabel}
Assunto: ${data.subject}

TEMPO DE RESPOSTA:
Normalmente respondemos em até 24 horas durante dias úteis.
${
  data.category === 'urgente'
    ? 'Como sua mensagem foi marcada como urgente, priorizaremos a resposta.'
    : ''
}

Se precisar de algo urgente, você pode entrar em contato conosco pelo telefone: +55 (11) 9999-9999

Atenciosamente,
Equipe Opus Atlas
    `,
  };

  await sendEmail(emailData);
}

// Funções auxiliares
function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'baixa':
      return 'BAIXA';
    case 'normal':
      return 'NORMAL';
    case 'alta':
      return 'ALTA';
    case 'urgente':
      return 'URGENTE';
    default:
      return 'NORMAL';
  }
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'suporte':
      return 'Suporte Geral';
    case 'bug':
      return 'Relato de Bug';
    case 'moderacao':
      return 'Moderação de Conteúdo';
    case 'parceria':
      return 'Proposta de Parceria';
    case 'feedback':
      return 'Feedback';
    default:
      return 'Geral';
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'baixa':
      return '#10b981';
    case 'normal':
      return '#3b82f6';
    case 'alta':
      return '#f59e0b';
    case 'urgente':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

async function logContactSubmission(data: any) {
  try {
    // Implementar logging se necessário
    console.log('Contact submission:', {
      ticketId: data.ticketId,
      category: data.category,
      priority: data.priority,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erro ao fazer log do contato:', error);
  }
}

// app/utils/helpers.ts (função auxiliar)
export function generateTicketId(): string {
  const prefix = 'CH';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// app/utils/request.ts (funções auxiliares)
export function getClientIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
