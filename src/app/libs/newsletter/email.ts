// app/libs/email.ts - VERSÃO ATUALIZADA com customHtmlContent
import nodemailer from 'nodemailer';
import { emailTemplates, processTemplate } from './emailTemplates';
import { getServerLanguageStatic } from '@/app/utils/translations/serverTranslations';
import { getBillingPeriodName, getPlanName } from '../subscriptionConstants';

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
    from: process.env.EMAIL_FROM || 'Opus Atlas <noreply@opusatlas.com>',
    replyTo: process.env.EMAIL_REPLY_TO || 'contato@opusatlas.com',
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

      const language = await getServerLanguageStatic();
      // Processar template com variáveis
      htmlContent = processTemplate(
        template[language].htmlContent,
        templateData.variables
      );
      textContent = processTemplate(
        template[language].textContent,
        templateData.variables
      );
      subject = processTemplate(
        templateData.customSubject || template[language].subject,
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

/**
 * Envia email de mudança de plano (upgrade/downgrade)
 */
export async function sendPlanChangedEmail(data: {
  userEmail: string;
  userName: string;
  fromPlan: string;
  toPlan: string;
  changeType: 'UPGRADE' | 'DOWNGRADE';
  language?: 'pt' | 'en';
}): Promise<boolean> {
  const {
    userEmail,
    userName,
    fromPlan,
    toPlan,
    changeType,
    language = 'pt',
  } = data;

  const isUpgrade = changeType === 'UPGRADE';
  const emoji = isUpgrade ? '⬆️' : '⬇️';
  const color = isUpgrade ? '#10b981' : '#f59e0b';
  const action = isUpgrade
    ? language === 'pt'
      ? 'Upgrade'
      : 'Upgrade'
    : language === 'pt'
      ? 'Downgrade'
      : 'Downgrade';

  // Conteúdo HTML premium integrado ao layout do Opus Atlas
  const htmlContent = `
    <h2 style="color: ${color}; margin-bottom: 25px; text-align: center;">
      ${emoji} ${action} ${language === 'pt' ? 'Confirmado!' : 'Confirmed!'}
    </h2>

    <p style="text-align: center;">
      ${
        language === 'pt'
          ? `Olá <strong>${userName}</strong>, seu plano foi alterado com sucesso!`
          : `Hello <strong>${userName}</strong>, your plan has been changed successfully!`
      }
    </p>

    <div class="premium-card" style="background: #1a1a1a; padding: 25px; border-radius: 12px; border: 1px solid rgba(212,175,55,0.3); margin: 25px 0;">
      <p style="margin: 0; color: #b0b0b0; text-align: center;">
        ${language === 'pt' ? 'De:' : 'From:'} 
        <strong style="color: #fff;">${getPlanName(fromPlan as any)}</strong>
      </p>
      <p style="font-size: 24px; text-align: center;">↓</p>
      <p style="margin: 0; color: ${color}; text-align: center;">
        ${language === 'pt' ? 'Para:' : 'To:'} 
        <strong>${getPlanName(toPlan as any)}</strong>
      </p>
    </div>

    ${
      isUpgrade
        ? `<p style="text-align: center;">${
            language === 'pt'
              ? 'Agora você tem acesso a ainda mais funcionalidades! 🎉'
              : 'You now have access to even more features! 🎉'
          }</p>`
        : `<p style="text-align: center;">${
            language === 'pt'
              ? 'Sua mudança foi processada. Você pode fazer upgrade novamente a qualquer momento.'
              : 'Your downgrade has been processed. You can upgrade again anytime.'
          }</p>`
    }

    <div class="text-center" style="text-align:center; margin:40px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
        class="btn-premium" 
        style="background:#d4af37; color:#000001; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold;">
        🎵 ${language === 'pt' ? 'Acessar Dashboard' : 'Go to Dashboard'}
      </a>
    </div>
  `;

  const textContent =
    language === 'pt'
      ? `${emoji} ${action} confirmado!

Olá ${userName},

Seu plano foi alterado com sucesso:
De: ${getPlanName(fromPlan as any)}
Para: ${getPlanName(toPlan as any)}

${isUpgrade ? 'Agora você tem acesso a ainda mais funcionalidades!' : 'Sua mudança foi processada. Você pode fazer upgrade novamente a qualquer momento.'}

Acesse: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
      : `${emoji} ${action} confirmed!

Hello ${userName},

Your plan has been successfully changed:
From: ${getPlanName(fromPlan as any)}
To: ${getPlanName(toPlan as any)}

${isUpgrade ? 'You now have access to even more features!' : 'Your downgrade has been processed. You can upgrade again anytime.'}

Access: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;

  const subject = `${emoji} ${
    language === 'pt'
      ? `${action} Confirmado - Opus Atlas`
      : `${action} Confirmed - Opus Atlas`
  }`;

  const result = await sendTemplateEmail(userEmail, {
    type: 'CAMPAIGN_CUSTOM', // usa o layout premium
    variables: {
      customSubject: subject,
      customContent: htmlContent,
      customTextContent: textContent,
      siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`,
    },
    customSubject: subject,
    customHtmlContent: htmlContent,
    customTextContent: textContent,
  });

  return result.success;
}
/**
 * Envia email de cancelamento de assinatura
 */
export async function sendSubscriptionCancelledEmail(data: {
  userEmail: string;
  userName: string;
  planType: string;
  cancelReason?: string;

  language?: 'pt' | 'en';
}): Promise<boolean> {
  const { userEmail, userName, planType, cancelReason, language = 'pt' } = data;

  const emoji = '💔';
  const color = '#ef4444';
  const planLabel = getPlanName(planType as any);

  const reasonText =
    cancelReason && cancelReason.trim().length > 0
      ? `<p style="color:#aaa; text-align:center; font-size:14px;">
          ${language === 'pt' ? 'Motivo:' : 'Reason:'} 
          <em>${cancelReason}</em>
        </p>`
      : '';

  const htmlContent = `
    <h2 style="color: ${color}; margin-bottom: 25px; text-align: center;">
      ${emoji} ${language === 'pt' ? 'Assinatura Cancelada' : 'Subscription Cancelled'}
    </h2>

    <p style="text-align: center;">
      ${
        language === 'pt'
          ? `Olá <strong>${userName}</strong>, lamentamos saber que você cancelou sua assinatura do plano <strong>${planLabel}</strong>.`
          : `Hello <strong>${userName}</strong>, we're sorry to hear you cancelled your <strong>${planLabel}</strong> subscription.`
      }
    </p>

    ${reasonText}

    <div style="background:#1a1a1a; border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:24px; margin:24px 0;">
      <p style="text-align:center; color:#b0b0b0; margin:0;">
        ${
          language === 'pt'
            ? 'Seu acesso permanecerá ativo até o final do período atual.'
            : 'Your access will remain active until the end of your billing period.'
        }
      </p>
    </div>

    <p style="text-align:center; margin-top:25px;">
      ${
        language === 'pt'
          ? 'Você pode reativar sua assinatura a qualquer momento e continuar sua jornada musical.'
          : 'You can reactivate your subscription anytime and continue your musical journey.'
      }
    </p>

    <div class="text-center" style="text-align:center; margin:40px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/subscription"
        class="btn-premium"
        style="background:#d4af37; color:#000001; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold;">
        ${language === 'pt' ? 'Reativar Assinatura' : 'Reactivate Subscription'}
      </a>
    </div>

    <p style="text-align:center; color:#aaa; font-size:13px; margin-top:30px;">
      ${
        language === 'pt'
          ? 'Agradecemos por fazer parte do Opus Atlas. Esperamos vê-lo novamente em breve! 🎶'
          : 'Thank you for being part of Opus Atlas. We hope to see you again soon! 🎶'
      }
    </p>
  `;

  const textContent =
    language === 'pt'
      ? `${emoji} Assinatura Cancelada

Olá ${userName},

Sua assinatura do plano ${planLabel} foi cancelada.

${cancelReason ? `Motivo: ${cancelReason}` : ''}

Seu acesso permanecerá ativo até o final do período atual.

Você pode reativar sua assinatura a qualquer momento:
${process.env.NEXT_PUBLIC_BASE_URL}/subscription`
      : `${emoji} Subscription Cancelled

Hello ${userName},

Your ${planLabel} subscription has been cancelled.

${cancelReason ? `Reason: ${cancelReason}` : ''}

Your access will remain active until the end of your billing period.

You can reactivate your subscription anytime:
${process.env.NEXT_PUBLIC_BASE_URL}/subscription`;

  const subject =
    language === 'pt'
      ? `${emoji} Assinatura Cancelada - Opus Atlas`
      : `${emoji} Subscription Cancelled - Opus Atlas`;

  const result = await sendTemplateEmail(userEmail, {
    type: 'CAMPAIGN_CUSTOM',
    variables: {
      customSubject: subject,
      customContent: htmlContent,
      customTextContent: textContent,
      siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`,
    },
    customSubject: subject,
    customHtmlContent: htmlContent,
    customTextContent: textContent,
  });

  return result.success;
}

export async function sendPaymentApprovedEmail(data: {
  userEmail: string;
  userName: string;
  planType: string;
  billingPeriod?: string;
  amount: number;
  invoiceUrl?: string;
  language?: 'pt' | 'en';
}): Promise<boolean> {
  const {
    userEmail,
    userName,
    planType,
    billingPeriod,
    amount,
    invoiceUrl,
    language = 'pt',
  } = data;

  const planLabel = getPlanName(planType as any);
  const periodLabel = billingPeriod
    ? getBillingPeriodName(billingPeriod as any)
    : '';
  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const emoji = '✅';
  const color = '#10b981';

  // 🎨 HTML formatado
  const htmlContent = `
    <h2 style="color: ${color}; margin-bottom: 25px; text-align: center;">
      ${emoji} ${language === 'pt' ? 'Pagamento Confirmado' : 'Payment Confirmed'}
    </h2>

    <p style="text-align: center;">
      ${
        language === 'pt'
          ? `Olá <strong>${userName}</strong>, seu pagamento foi aprovado com sucesso!`
          : `Hello <strong>${userName}</strong>, your payment has been successfully approved!`
      }
    </p>

    <div style="background:#1a1a1a; border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:24px; margin:28px 0;">
      <p style="text-align:center; color:#b0b0b0; margin:0;">
        <strong>${planLabel}</strong> ${periodLabel ? `• ${periodLabel}` : ''}
      </p>
      <p style="font-size:24px; text-align:center; color:#fff; margin:10px 0;">${formattedAmount}</p>
      <p style="text-align:center; color:#aaa; margin:0;">
        ${language === 'pt' ? 'Status:' : 'Status:'} 
        <strong style="color:${color};">${language === 'pt' ? 'Aprovado' : 'Approved'}</strong>
      </p>
    </div>

    ${
      invoiceUrl
        ? `<div style="text-align:center; margin-top:25px;">
             <a href="${invoiceUrl}" 
                style="background:#d4af37; color:#000; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold;">
                🧾 ${language === 'pt' ? 'Ver Fatura' : 'View Invoice'}
             </a>
           </div>`
        : ''
    }

    <p style="text-align:center; margin-top:40px;">
      ${
        language === 'pt'
          ? 'Sua assinatura foi ativada. Aproveite todo o conteúdo do Opus Atlas e continue sua jornada musical! 🎶'
          : 'Your subscription is now active. Enjoy all Opus Atlas content and continue your musical journey! 🎶'
      }
    </p>

    <div style="text-align:center; margin:40px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" 
        style="background:#d4af37; color:#000; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold;">
        🎵 ${language === 'pt' ? 'Acessar Dashboard' : 'Go to Dashboard'}
      </a>
    </div>
  `;

  const textContent =
    language === 'pt'
      ? `${emoji} Pagamento Confirmado

Olá ${userName},

Seu pagamento de ${formattedAmount} para o plano ${planLabel} ${periodLabel} foi aprovado com sucesso.

Sua assinatura foi ativada. Você pode acessar sua conta e aproveitar todos os recursos do Opus Atlas.

${invoiceUrl ? `Visualizar fatura: ${invoiceUrl}` : ''}
Acesse: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
      : `${emoji} Payment Confirmed

Hello ${userName},

Your payment of ${formattedAmount} for the ${planLabel} ${periodLabel} plan has been successfully approved.

Your subscription is now active. You can access your account and enjoy all Opus Atlas features.

${invoiceUrl ? `View invoice: ${invoiceUrl}` : ''}
Access: ${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`;

  const subject =
    language === 'pt'
      ? `${emoji} Pagamento Confirmado - Opus Atlas`
      : `${emoji} Payment Confirmed - Opus Atlas`;

  const result = await sendTemplateEmail(userEmail, {
    type: 'CAMPAIGN_CUSTOM',
    variables: {
      customSubject: subject,
      customContent: htmlContent,
      customTextContent: textContent,
      siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`,
    },
    customSubject: subject,
    customHtmlContent: htmlContent,
    customTextContent: textContent,
  });

  return result.success;
}

/**
 * Envia lembrete de renovação próxima
 */
export async function sendRenewalReminderEmail(data: {
  userEmail: string;
  userName: string;
  planType: string;
  billingPeriod?: string;
  renewalDate: Date;
  amount: number;
  language?: 'pt' | 'en';
}): Promise<boolean> {
  const {
    userEmail,
    userName,
    planType,
    billingPeriod,
    renewalDate,
    amount,
    language = 'pt',
  } = data;

  const planLabel = getPlanName(planType as any);
  const periodLabel = billingPeriod
    ? getBillingPeriodName(billingPeriod as any)
    : '';
  const formattedAmount = amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
  const renewalDateStr = renewalDate.toLocaleDateString('pt-BR');
  const emoji = '🔔';
  const color = '#d4af37';

  const htmlContent = `
    <h2 style="color:${color}; text-align:center; margin-bottom:25px;">
      ${emoji} ${language === 'pt' ? 'Renovação Próxima' : 'Upcoming Renewal'}
    </h2>

    <p style="text-align:center;">
      ${
        language === 'pt'
          ? `Olá <strong>${userName}</strong>, sua assinatura será renovada automaticamente em <strong>${renewalDateStr}</strong>.`
          : `Hello <strong>${userName}</strong>, your subscription will renew automatically on <strong>${renewalDateStr}</strong>.`
      }
    </p>

    <div style="background:#1a1a1a; border:1px solid rgba(212,175,55,0.3); border-radius:12px; padding:24px; margin:28px 0;">
      <p style="text-align:center; color:#b0b0b0; margin:0;">
        <strong>${planLabel}</strong> ${periodLabel ? `• ${periodLabel}` : ''}
      </p>
      <p style="font-size:22px; text-align:center; color:#fff; margin:10px 0;">${formattedAmount}</p>
      <p style="text-align:center; color:#aaa; margin:0;">
        ${language === 'pt' ? 'Data de renovação:' : 'Renewal date:'} <strong>${renewalDateStr}</strong>
      </p>
    </div>

    <p style="text-align:center; margin-top:25px;">
      ${
        language === 'pt'
          ? 'Você não precisa fazer nada — sua assinatura continuará ativa automaticamente.'
          : 'You don’t need to do anything — your subscription will remain active automatically.'
      }
    </p>

    <div style="text-align:center; margin:40px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/subscription"
        style="background:#d4af37; color:#000; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold;">
        ⚙️ ${language === 'pt' ? 'Gerenciar Assinatura' : 'Manage Subscription'}
      </a>
    </div>

    <p style="text-align:center; color:#aaa; font-size:13px; margin-top:30px;">
      ${
        language === 'pt'
          ? 'Obrigado por continuar sua jornada musical com o Opus Atlas! 🎶'
          : 'Thank you for continuing your musical journey with Opus Atlas! 🎶'
      }
    </p>
  `;

  const textContent =
    language === 'pt'
      ? `${emoji} Renovação Próxima

Olá ${userName},

Sua assinatura do plano ${planLabel} ${periodLabel} será renovada automaticamente em ${renewalDateStr} no valor de ${formattedAmount}.

Você não precisa fazer nada — sua assinatura continuará ativa automaticamente.

Gerencie sua assinatura em: ${process.env.NEXT_PUBLIC_BASE_URL}/subscription`
      : `${emoji} Upcoming Renewal

Hello ${userName},

Your ${planLabel} ${periodLabel} subscription will renew automatically on ${renewalDateStr} for ${formattedAmount}.

You don’t need to do anything — your subscription will remain active automatically.

Manage your subscription: ${process.env.NEXT_PUBLIC_BASE_URL}/subscription`;

  const subject =
    language === 'pt'
      ? `${emoji} Lembrete de Renovação - Opus Atlas`
      : `${emoji} Renewal Reminder - Opus Atlas`;

  const result = await sendTemplateEmail(userEmail, {
    type: 'CAMPAIGN_CUSTOM',
    variables: {
      customSubject: subject,
      customContent: htmlContent,
      customTextContent: textContent,
      siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`,
    },
    customSubject: subject,
    customHtmlContent: htmlContent,
    customTextContent: textContent,
  });

  return result.success;
}

/**
 * Envia aviso de fim do período de teste
 */
export async function sendTrialExpiringEmail(data: {
  userEmail: string;
  userName: string;
  planType: string;
  trialEndDate?: Date | null;
  language?: 'pt' | 'en';
}): Promise<boolean> {
  const { userEmail, userName, planType, trialEndDate, language = 'pt' } = data;

  const planLabel = getPlanName(planType as any);
  const trialEndStr = trialEndDate?.toLocaleDateString('pt-BR');
  const emoji = '⏰';
  const color = '#f59e0b';

  const htmlContent = `
    <h2 style="color:${color}; text-align:center; margin-bottom:25px;">
      ${emoji} ${language === 'pt' ? 'Seu Teste Está Terminando' : 'Your Trial Is Ending Soon'}
    </h2>

    <p style="text-align:center;">
      ${
        language === 'pt'
          ? `Olá <strong>${userName}</strong>, seu período de teste gratuito do plano <strong>${planLabel}</strong> termina em <strong>${trialEndStr}</strong>.`
          : `Hello <strong>${userName}</strong>, your free trial for the <strong>${planLabel}</strong> plan ends on <strong>${trialEndStr}</strong>.`
      }
    </p>

    <p style="text-align:center; margin:25px 0;">
      ${
        language === 'pt'
          ? 'Não perca o acesso às ferramentas, partituras e recursos premium do Opus Atlas!'
          : 'Don’t lose access to all the premium tools, scores, and resources on Opus Atlas!'
      }
    </p>

    <div style="text-align:center; margin:40px 0;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/subscription"
        style="background:#d4af37; color:#000; text-decoration:none; padding:14px 28px; border-radius:8px; font-weight:bold;">
        💎 ${language === 'pt' ? 'Assinar Agora' : 'Subscribe Now'}
      </a>
    </div>

    <p style="text-align:center; color:#aaa; font-size:13px; margin-top:30px;">
      ${
        language === 'pt'
          ? 'Continue sua jornada musical sem interrupções. A inspiração não pode esperar. 🎶'
          : 'Continue your musical journey without interruptions. Inspiration can’t wait. 🎶'
      }
    </p>
  `;

  const textContent =
    language === 'pt'
      ? `${emoji} Seu Teste Está Terminando

Olá ${userName},

Seu período de teste do plano ${planLabel} termina em ${trialEndStr}.

Não perca o acesso aos recursos premium do Opus Atlas.
Assine agora: ${process.env.NEXT_PUBLIC_BASE_URL}/subscription`
      : `${emoji} Your Trial Is Ending Soon

Hello ${userName},

Your ${planLabel} trial ends on ${trialEndStr}.

Don’t lose access to all premium features of Opus Atlas.
Subscribe now: ${process.env.NEXT_PUBLIC_BASE_URL}/subscription`;

  const subject =
    language === 'pt'
      ? `${emoji} Seu Teste Está Terminando - Opus Atlas`
      : `${emoji} Your Trial Is Ending - Opus Atlas`;

  const result = await sendTemplateEmail(userEmail, {
    type: 'CAMPAIGN_CUSTOM',
    variables: {
      customSubject: subject,
      customContent: htmlContent,
      customTextContent: textContent,
      siteUrl: process.env.NEXT_PUBLIC_BASE_URL,
      unsubscribeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe`,
    },
    customSubject: subject,
    customHtmlContent: htmlContent,
    customTextContent: textContent,
  });

  return result.success;
}

// Exportar configurações para uso em outras partes do sistema
export { EMAIL_CONFIG, EMAIL_PROVIDER };
