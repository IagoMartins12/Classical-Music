// app/libs/email.ts - VERSÃO ATUALIZADA com customHtmlContent
import nodemailer from 'nodemailer';
import { emailTemplates, processTemplate } from './emailTemplates';

// Configurações de email baseadas em variáveis de ambiente
const EMAIL_CONFIG = {
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // false para 587, true para 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  defaults: {
    from: process.env.EMAIL_FROM || 'Opus Atlas <noreply@classicalhub.com>',
    replyTo: process.env.EMAIL_REPLY_TO || 'contato@classicalhub.com',
  },
};

// Tipos para estrutura de email
export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
  headers?: Record<string, string>;
  priority?: 'high' | 'normal' | 'low';
}

// 🆕 ATUALIZADO: Interface com customHtmlContent e customTextContent
export interface EmailTemplate {
  type: string;
  variables: Record<string, any>;
  customSubject?: string;
  customFrom?: string;
  customReplyTo?: string;
  customHtmlContent?: string; // 🆕 NOVO
  customTextContent?: string; // 🆕 NOVO
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider?: string;
}

// Cache para transporters
let nodeMailerTransporter: nodemailer.Transporter | null = null;

// Provider principal definido por variável de ambiente
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'nodemailer'; // nodemailer, sendgrid, aws

/**
 * Inicializar transporter do NodeMailer
 */
function initNodeMailer(): nodemailer.Transporter {
  if (nodeMailerTransporter) {
    return nodeMailerTransporter;
  }

  nodeMailerTransporter = nodemailer.createTransport(EMAIL_CONFIG.smtp);
  return nodeMailerTransporter;
}

/**
 * Enviar email usando NodeMailer
 */
async function sendWithNodeMailer(emailData: EmailData): Promise<EmailResult> {
  try {
    const transporter = initNodeMailer();

    const mailOptions = {
      from: emailData.from || EMAIL_CONFIG.defaults.from,
      to: Array.isArray(emailData.to) ? emailData.to.join(', ') : emailData.to,
      cc: emailData.cc
        ? Array.isArray(emailData.cc)
          ? emailData.cc.join(', ')
          : emailData.cc
        : undefined,
      bcc: emailData.bcc
        ? Array.isArray(emailData.bcc)
          ? emailData.bcc.join(', ')
          : emailData.bcc
        : undefined,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      replyTo: emailData.replyTo || EMAIL_CONFIG.defaults.replyTo,
      attachments: emailData.attachments,
      headers: emailData.headers,
      priority: emailData.priority || 'normal',
    };

    const result = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: result.messageId,
      provider: 'nodemailer',
    };
  } catch (error: any) {
    console.error('Erro NodeMailer:', error);
    return {
      success: false,
      error: error.message || 'Erro no envio via NodeMailer',
      provider: 'nodemailer',
    };
  }
}

/**
 * Função principal para envio de email
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  // Validações básicas
  if (!emailData.to || !emailData.subject) {
    return {
      success: false,
      error: 'Destinatário e assunto são obrigatórios',
    };
  }

  if (!emailData.html && !emailData.text) {
    return {
      success: false,
      error: 'Conteúdo HTML ou texto é obrigatório',
    };
  }

  // Log do envio (opcional - remover em produção se necessário)
  console.log(`Enviando email para ${emailData.to} via ${EMAIL_PROVIDER}`);

  // Escolher provider baseado na configuração
  switch (EMAIL_PROVIDER) {
    case 'sendgrid':
    // return await sendWithSendGrid(emailData);
    case 'aws':
    // return await sendWithAWSSES(emailData);
    case 'nodemailer':
    default:
      return await sendWithNodeMailer(emailData);
  }
}

/**
 * 🆕 ATUALIZADO: Enviar email usando template pré-definido com suporte a customHtmlContent
 */
export async function sendTemplateEmail(
  to: string | string[] | null,
  templateData: EmailTemplate
): Promise<EmailResult> {
  if (!to)
    return {
      success: false,
      error: 'Email não informado',
    };

  try {
    let htmlContent: string;
    let textContent: string;
    let subject: string;

    // 🆕 NOVO: Se customHtmlContent for fornecido, usar ele
    if (templateData.customHtmlContent) {
      // Usar HTML customizado
      htmlContent = processTemplate(
        templateData.customHtmlContent,
        templateData.variables
      );

      // Usar texto customizado ou gerar a partir do HTML
      if (templateData.customTextContent) {
        textContent = processTemplate(
          templateData.customTextContent,
          templateData.variables
        );
      } else {
        // Gerar texto simples a partir do HTML (remove tags)
        textContent = htmlContent
          .replace(/<[^>]*>/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      // Usar subject customizado ou padrão
      subject = processTemplate(
        templateData.customSubject || `📧 ${templateData.type} - Opus Atlas`,
        templateData.variables
      );
    } else {
      // 🔄 LÓGICA ORIGINAL: Usar template predefinido
      const template =
        emailTemplates[templateData.type as keyof typeof emailTemplates];

      if (!template) {
        return {
          success: false,
          error: `Template '${templateData.type}' não encontrado`,
        };
      }

      // Processar template com variáveis
      htmlContent = processTemplate(
        template.htmlContent,
        templateData.variables
      );
      textContent = processTemplate(
        template.textContent,
        templateData.variables
      );
      subject = processTemplate(
        templateData.customSubject || template.subject,
        templateData.variables
      );
    }

    const emailData: EmailData = {
      to,
      subject,
      html: htmlContent,
      text: textContent,
      from: templateData.customFrom,
      replyTo: templateData.customReplyTo,
    };

    return await sendEmail(emailData);
  } catch (error: any) {
    console.error('Erro ao enviar template email:', error);
    return {
      success: false,
      error: error.message || 'Erro ao processar template de email',
    };
  }
}

/**
 * Enviar email em lote (para campanhas de newsletter)
 */
export async function sendBulkEmail(
  recipients: Array<{ email: string; variables?: Record<string, any> }>,
  templateData: EmailTemplate,
  options: {
    batchSize?: number;
    delay?: number; // delay entre batches em ms
    onProgress?: (sent: number, total: number) => void;
  } = {}
): Promise<{ success: number; failed: number; errors: string[] }> {
  const { batchSize = 100, delay = 1000, onProgress } = options;
  const results = { success: 0, failed: 0, errors: [] as string[] };

  // Dividir em batches
  const batches = [];
  for (let i = 0; i < recipients.length; i += batchSize) {
    batches.push(recipients.slice(i, i + batchSize));
  }

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Processar batch em paralelo
    const batchPromises = batch.map(async (recipient) => {
      try {
        const variables = { ...templateData.variables, ...recipient.variables };
        const result = await sendTemplateEmail(recipient.email, {
          ...templateData,
          variables,
        });

        if (result.success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push(`${recipient.email}: ${result.error}`);
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`${recipient.email}: ${error.message}`);
      }
    });

    await Promise.all(batchPromises);

    // Callback de progresso
    if (onProgress) {
      onProgress(results.success + results.failed, recipients.length);
    }

    // Delay entre batches (exceto no último)
    if (i < batches.length - 1 && delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return results;
}

/**
 * Verificar se o sistema de email está configurado corretamente
 */
export async function verifyEmailConfig(): Promise<{
  valid: boolean;
  provider: string;
  error?: string;
}> {
  try {
    switch (EMAIL_PROVIDER) {
      case 'nodemailer':
      default:
        if (!EMAIL_CONFIG.smtp.auth.user || !EMAIL_CONFIG.smtp.auth.pass) {
          return {
            valid: false,
            provider: 'nodemailer',
            error: 'Credenciais SMTP não configuradas',
          };
        }

        // Testar conexão SMTP
        const transporter = initNodeMailer();
        await transporter.verify();
        return { valid: true, provider: 'nodemailer' };
    }
  } catch (error: any) {
    return {
      valid: false,
      provider: EMAIL_PROVIDER,
      error: error.message || 'Erro na verificação',
    };
  }
}

/**
 * 🆕 NOVO: Função helper para criar emails completamente customizados
 */
export async function sendCustomEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  textContent?: string,
  options?: {
    from?: string;
    replyTo?: string;
    cc?: string | string[];
    bcc?: string | string[];
    attachments?: Array<{
      filename: string;
      content: Buffer | string;
      contentType?: string;
    }>;
  }
): Promise<EmailResult> {
  const emailData: EmailData = {
    to,
    subject,
    html: htmlContent,
    text:
      textContent ||
      htmlContent
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim(),
    from: options?.from,
    replyTo: options?.replyTo,
    cc: options?.cc,
    bcc: options?.bcc,
    attachments: options?.attachments,
  };

  return await sendEmail(emailData);
}

/**
 * Utilitários para validação de email
 */
export const emailUtils = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  extractEmailFromString: (text: string): string[] => {
    const emailRegex = /[^\s@]+@[^\s@]+\.[^\s@]+/g;
    return text.match(emailRegex) || [];
  },

  normalizeEmail: (email: string): string => {
    return email.toLowerCase().trim();
  },

  getDomainFromEmail: (email: string): string => {
    return email.split('@')[1] || '';
  },

  isDisposableEmail: (email: string): boolean => {
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      // Adicionar mais conforme necessário
    ];

    const domain = emailUtils.getDomainFromEmail(email);
    return disposableDomains.includes(domain);
  },
};

// Exportar configurações para uso em outras partes do sistema
export { EMAIL_CONFIG, EMAIL_PROVIDER };
