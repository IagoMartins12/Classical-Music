// app/libs/emailTemplates.ts - OPUS ATLAS PREMIUM EDITION

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description: string;
}

/**
 * Processar template substituindo variáveis
 */
export function processTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let processed = template;

  // Substituir variáveis simples {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, String(value || ''));
  });

  // Substituir variáveis condicionais {{#if condition}}...{{/if}}
  processed = processed.replace(
    /{{#if\s+(\w+)}}(.*?){{\/if}}/gs,
    (match, condition, content) => {
      return variables[condition] ? content : '';
    }
  );

  // Substituir loops {{#each array}}...{{/each}}
  processed = processed.replace(
    /{{#each\s+(\w+)}}(.*?){{\/each}}/gs,
    (match, arrayName, itemTemplate) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';

      return array
        .map((item) => {
          let itemContent = itemTemplate;
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            itemContent = itemContent.replace(regex, String(value || ''));
          });
          return itemContent;
        })
        .join('');
    }
  );

  return processed;
}

/**
 * Configurações globais do Opus Atlas - FÁCIL DE ALTERAR
 */
const OPUS_ATLAS_CONFIG = {
  // 📧 EMAILS - Altere aqui quando tiver os definitivos
  FROM_EMAIL: 'noreply@opusatlas.com',
  CONTACT_EMAIL: 'contato@opusatlas.com',
  SUPPORT_EMAIL: 'suporte@opusatlas.com',

  // 🌐 URLS - Altere aqui quando tiver o domínio
  SITE_URL: 'https://opusatlas.com',

  // 🎨 BRANDING
  BRAND_NAME: 'Opus Atlas',
  TAGLINE: 'A música clássica em suas mãos',
  DESCRIPTION: 'A plataforma  de música clássica',

  // 📍 LOCALIZAÇÃO
  LOCATION: 'Brasil',

  // 🎭 LOGO - Reserve espaço para quando tiver
  LOGO_PLACEHOLDER: '', // Emoji temporário, fácil de substituir
};

/**
 * Layout premium preto/dourado para o Opus Atlas
 */
function getPremiumOpusAtlasLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}} - ${OPUS_ATLAS_CONFIG.BRAND_NAME}</title>
    <style>
        /* Reset e Base */
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: 'Georgia', 'Times New Roman', serif;
            line-height: 1.7;
            color: #ffffff !important;
            background: linear-gradient(135deg, #000000 0%, #0a0a0a 50%, #1a1a1a 100%);
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Container Principal */
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #000000;
            border: 1px solid #d4af37;
            border-radius: 0;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(212, 175, 55, 0.3);
        }

        /* Header Premium */
        .header { 
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%);
            color: #ffffff; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
            border-bottom: 2px solid #d4af37;
        }

        .header::before {
            content: '';
            position: absolute;
            top: 0; 
            left: 0; 
            right: 0; 
            bottom: 0;
            background: linear-gradient(45deg, transparent 49%, rgba(212, 175, 55, 0.1) 50%, transparent 51%);
            background-size: 20px 20px;
            opacity: 0.3;
        }

        .header-content { 
            position: relative; 
            z-index: 2; 
        }

        /* Logo Space - PRONTO PARA SEU LOGO */
        .logo-space { 
            width: 60px; 
            height: 60px; 
            background: linear-gradient(135deg, #d4af37 0%, #fbbf24 100%);
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin: 0 auto 20px;
            box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
            border: 3px solid rgba(212, 175, 55, 0.5);
        }

        .logo-space .logo-placeholder { 
            font-size: 28px; 
            color: #000000;
            font-weight: bold;
        }

        .brand-title { 
            font-size: 32px; 
            margin: 0 0 8px 0; 
            font-weight: bold;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
            letter-spacing: 1px;
        }

        .brand-subtitle { 
            font-size: 16px; 
            margin: 0;
            color: #d4af37;
            font-style: italic;
            font-weight: 300;
            letter-spacing: 0.5px;
        }

        /* Content Area */
        .content { 
            padding: 40px 30px; 
            background: linear-gradient(180deg, #0a0a0a 0%, #000000 100%);
            color: #ffffff !important;
        }

        /* Premium Cards */
        .premium-card { 
            background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); 
            border: 1px solid rgba(212, 175, 55, 0.3); 
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(212, 175, 55, 0.2);
            position: relative;
        }

        .premium-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
        }

        /* Welcome Message Especial */
        .welcome-message {
            background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
            padding: 30px;
            border-radius: 16px;
            border: 2px solid #d4af37;
            margin: 30px 0;
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
            position: relative;
        }

        .welcome-message::after {
            content: '';
            position: absolute;
            top: -1px;
            left: -1px;
            right: -1px;
            bottom: -1px;
            background: linear-gradient(45deg, #d4af37, #fbbf24, #d4af37);
            border-radius: 16px;
            z-index: -1;
            opacity: 0.6;
        }

        /* Buttons Premium */
        .btn-premium { 
            display: inline-block; 
            padding: 16px 32px; 
            background: linear-gradient(135deg, #d4af37 0%, #fbbf24 50%, #d4af37 100%); 
            color: #FFFFFF; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-family: 'Arial', sans-serif;
        }

        .btn-premium:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 12px 32px rgba(212, 175, 55, 0.6);
            background: linear-gradient(135deg, #fbbf24 0%, #d4af37 50%, #fbbf24 100%);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            color: #d4af37;
            border: 2px solid #d4af37;
        }

        .btn-secondary:hover {
            background: linear-gradient(135deg, #d4af37 0%, #fbbf24 100%);
            color: #000000;
        }

        /* Grid de Features */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }

        .feature-card {
            margin: 20px 0;
            background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid rgba(212, 175, 55, 0.2);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            transition: all 0.3s ease;
        }

        .feature-card:hover {
            border-color: #d4af37;
            box-shadow: 0 8px 32px rgba(212, 175, 55, 0.3);
            transform: translateY(-4px);
        }

        .feature-icon { 
            font-size: 32px; 
            margin-bottom: 15px; 
            color: #d4af37;
            text-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
        }

        .feature-title { 
            color: #ffffff; 
            font-weight: bold; 
            margin: 15px 0 10px 0; 
            font-size: 18px;
        }

        .feature-desc { 
            color: #b0b0b0; 
            font-size: 14px; 
            line-height: 1.6; 
        }

        /* Security/Warning Boxes */
        .security-note, .warning-box {
            background: linear-gradient(135deg, #2a1810 0%, #1a1208 100%);
            border: 1px solid #d4af37;
            padding: 20px;
            border-radius: 12px;
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
        }

        .security-icon, .warning-icon { 
            font-size: 24px; 
            margin-right: 15px; 
            color: #fbbf24;
            text-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
        }

        .security-text, .warning-text { 
            color: #ffffff !important; 
            line-height: 1.7; 
        }

        /* Footer Premium */
        .footer { 
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); 
            color: #b0b0b0; 
            padding: 40px 30px; 
            text-align: center; 
            font-size: 14px;
            border-top: 2px solid #d4af37;
        }

        .footer h3 { 
            color: #d4af37; 
            margin: 0 0 15px 0; 
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
        }

        .footer a { 
            color: #d4af37; 
            text-decoration: none; 
            transition: all 0.3s ease;
        }

        .footer a:hover { 
            color: #fbbf24;
            text-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
        }

        .footer-divider {
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #d4af37, transparent);
            margin: 20px auto;
        }

        /* Utility Classes */
        .text-center { text-align: center; }
        .text-gold { color: #d4af37; }
        .text-light-gold { color: #fbbf24; }
        .text-muted { color: #888; }
        .mb-2 { margin-bottom: 16px; }
        .mb-3 { margin-bottom: 24px; }
        .mt-4 { margin-top: 32px; }

        /* Composer/Work specific styles */
        .composer-card, .work-item {
            background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%);
            border: 1px solid rgba(212, 175, 55, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
        }

        .work-item {
            padding: 15px;
            border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .work-item:last-child {
            border-bottom: none;
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .container { 
                margin: 0; 
                border-radius: 0;
            }
            .header, .content, .footer { 
                padding: 20px; 
            }
            .brand-title { 
                font-size: 26px; 
            }
            .features-grid { 
                grid-template-columns: 1fr; 
            }
            .btn-premium {
                display: block;
                text-align: center;
                margin: 15px 0;
                
            }
        }

        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
            .container {
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(212, 175, 55, 0.4);
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Premium -->
        <div class="header">
            <div class="header-content">
                <!-- Logo Space - PRONTO PARA SEU LOGO -->
                <div class="logo-space">
                    <span class="logo-placeholder">${
                      OPUS_ATLAS_CONFIG.LOGO_PLACEHOLDER
                    }</span>
                </div>
                
                <h1 class="brand-title">${OPUS_ATLAS_CONFIG.BRAND_NAME}</h1>
                <p class="brand-subtitle">${OPUS_ATLAS_CONFIG.TAGLINE}</p>
            </div>
        </div>
        
        <!-- Content -->
        <div class="content">
            ${content}
        </div>
        
        <!-- Footer Premium -->
        <div class="footer">
            <h3>${OPUS_ATLAS_CONFIG.BRAND_NAME}</h3>
            <p>${OPUS_ATLAS_CONFIG.DESCRIPTION}</p>
            
            <div class="footer-divider"></div>
            
            <p style="margin-top: 20px;">
                {{#if unsubscribeUrl}}
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a>
                {{/if}}
                {{#if preferencesUrl}}
                | <a href="{{preferencesUrl}}">Gerenciar preferências</a>
                {{/if}}
            </p>
            
            <p style="margin-top: 15px; font-size: 12px; color: #666;">
                <a href="{{siteUrl}}">${OPUS_ATLAS_CONFIG.SITE_URL.replace(
                  'https://',
                  ''
                )}</a><br>
                ${OPUS_ATLAS_CONFIG.LOCATION} | <a href="mailto:${
    OPUS_ATLAS_CONFIG.CONTACT_EMAIL
  }">${OPUS_ATLAS_CONFIG.CONTACT_EMAIL}</a>
            </p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Templates premium do Opus Atlas
 */
export const emailTemplates: Record<string, EmailTemplate> = {
  WELCOME: {
    subject: `Bem-vindo(a) ao ${OPUS_ATLAS_CONFIG.BRAND_NAME}, {{firstName}}!`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <h2 style="color: #d4af37; margin-bottom: 25px; font-size: 28px; text-align: center;">Bem-vindo(a), {{firstName}}!</h2>
      <p style="font-size: 18px; line-height: 1.8; margin-bottom: 25px; text-align: center;">
        É com grande alegria que recebemos você na comunidade <strong class="text-gold">${OPUS_ATLAS_CONFIG.BRAND_NAME}</strong>! 
        Agora você faz parte da plataforma de música clássica.
      </p>
      
      <div class="welcome-message">
        <h3 style="color: #d4af37; margin-bottom: 20px; font-size: 22px; text-align: center;">
          Sua jornada musical começa agora!
        </h3>
        <div style="text-align: left; color: #ffffff !important;">
          <div style="margin-bottom: 12px;">✨ Newsletter  com conteúdo exclusivo</div>
          <div style="margin-bottom: 12px;">🎵 Descobertas sobre compositores e obras clássicas</div>
          <div style="margin-bottom: 12px;">📚 Recursos avançados de estudo musical</div>
          <div style="margin-bottom: 12px;">🎹 Acesso a partituras  e análises detalhadas</div>
        </div>
      </div>
      
      <div class="text-center" style="margin: 40px 0;">
        <a href="{{siteUrl}}" class="btn-premium">Explorar ${OPUS_ATLAS_CONFIG.BRAND_NAME}</a>
      </div>
      
      <p style="margin-top: 30px; font-style: italic; text-align: center; color: #b0b0b0;">
        Prepare-se para uma experiência única no universo da música clássica.
      </p>
      
      <p style="margin-top: 30px; text-align: center;">
        <strong style="color: #d4af37;">Harmoniosamente,</strong><br>
        <span style="color: #ffffff !important;">Equipe ${OPUS_ATLAS_CONFIG.BRAND_NAME}</span>
      </p>
    `
    ),
    textContent: `Bem-vindo(a) ao ${OPUS_ATLAS_CONFIG.BRAND_NAME}, {{firstName}}!

É com grande alegria que recebemos você na comunidade ${OPUS_ATLAS_CONFIG.BRAND_NAME}!

VOCÊ AGORA TEM ACESSO A:
- Newsletter com conteúdo exclusivo
- Descobertas sobre compositores e obras clássicas
- Recursos avançados de estudo musical
- Partituras e análises detalhadas

Visite: {{siteUrl}}

Harmoniosamente,
Equipe ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Para cancelar: {{unsubscribeUrl}}`,
    variables: ['firstName', 'siteUrl', 'unsubscribeUrl'],
    description: 'Email de boas-vindas para novos usuários',
  },
  UNSUBSCRIBE_CONFIRMATION: {
    subject: `Inscrição cancelada - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ff9a8b 0%, #a8edea 100%); border-radius: 50%; line-height: 80px; font-size: 32px; margin-bottom: 20px;">
        👋
      </div>
    </div>

    <h2 style="color: #d4af37; margin-bottom: 25px; font-size: 28px; text-align: center;">Inscrição Cancelada</h2>

    <p style="color: #ffffff !important; font-size: 18px; line-height: 1.8; margin-bottom: 25px; text-align: center;">
      Olá {{firstName}},
    </p>

    <p style="color: #ffffff !important; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
      Sua inscrição na newsletter da ${OPUS_ATLAS_CONFIG.BRAND_NAME} foi <strong style="color: #d4af37;">cancelada com sucesso</strong>. 
      Você não receberá mais nossos emails sobre música clássica.
    </p>

    <p style="color: #ffffff !important; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
      Sentimos muito em vê-lo partir! Foi um prazer ter você em nossa comunidade de amantes da música clássica. 
      Esperamos que tenha aproveitado o conteúdo que compartilhamos sobre compositores, obras e descobertas musicais.
    </p>

    <!-- Seção de convite para retorno -->
    <div style="background: linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%); border: 2px solid #d4af37; border-radius: 12px; padding: 30px; margin: 40px 0; box-shadow: 0 0 30px rgba(212, 175, 55, 0.2); position: relative;">
      <h3 style="color: #d4af37; font-size: 22px; margin-bottom: 20px; margin-top: 0; text-align: center;">
        Mudou de ideia?
      </h3>
      <p style="color: #ffffff !important; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
        Se você cancelou por engano ou mudou de ideia, pode se reinscrever facilmente na nossa newsletter. 
        Estaremos sempre aqui para recebê-lo de volta!
      </p>
      
      <!-- Botão de reinscrição -->
      <div style="text-align: center;">
        <a href="{{resubscribeUrl}}" class="btn-premium">
          Quero me reinscrever
        </a>
      </div>
    </div>


    <!-- Mensagem de agradecimento -->
    <div style="text-align: center; margin: 40px 0;">
      <p style="color: #ffffff !important; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Obrigado por ter sido parte da nossa comunidade. Desejamos tudo de melhor em sua jornada musical!
      </p>
      <p style="color: #b0b0b0; font-size: 14px; font-style: italic;">
        "A música é a linguagem universal da humanidade" - Longfellow
      </p>
    </div>

    <!-- Benefícios que estava recebendo -->
    <div class="premium-card">
      <h4 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">O que você estava recebendo:</h4>
      <div style="color: #ffffff !important; text-align: left;">
        <div style="margin-bottom: 8px;">📧 Newsletter semanal com conteúdo exclusivo</div>
        <div style="margin-bottom: 8px;">🎵 Descobertas sobre compositores e obras clássicas</div>
        <div style="margin-bottom: 8px;">📚 Recursos avançados de estudo musical</div>
        <div style="margin-bottom: 8px;">🎹 Análises musicais detalhadas</div>
        <div>💡 Dicas e insights sobre música clássica</div>
      </div>
    </div>

    <p style="margin-top: 40px; text-align: center;">
      <strong style="color: #d4af37;">Harmoniosamente,</strong><br>
      <span style="color: #ffffff !important;">Equipe ${OPUS_ATLAS_CONFIG.BRAND_NAME}</span>
    </p>
    `
    ),
    textContent: `INSCRIÇÃO CANCELADA - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

Sua inscrição na newsletter da ${OPUS_ATLAS_CONFIG.BRAND_NAME} foi cancelada com sucesso. Você não receberá mais nossos emails sobre música clássica.

Sentimos muito em vê-lo partir! Foi um prazer ter você em nossa comunidade de amantes da música clássica. Esperamos que tenha aproveitado o conteúdo que compartilhamos sobre compositores, obras e descobertas musicais.

MUDOU DE IDEIA?
===============

Se você cancelou por engano ou mudou de ideia, pode se reinscrever facilmente na nossa newsletter. Estaremos sempre aqui para recebê-lo de volta!

Para se reinscrever, acesse: {{resubscribeUrl}}

{{#if reason}}
MOTIVO DO CANCELAMENTO: {{reason}}
{{#if feedback}}
SEU FEEDBACK: {{feedback}}
{{/if}}
{{/if}}

O QUE VOCÊ ESTAVA RECEBENDO:
📧 Newsletter semanal com conteúdo exclusivo
🎵 Descobertas sobre compositores e obras clássicas
📚 Recursos avançados de estudo musical
🎹 Análises musicais detalhadas
💡 Dicas e insights sobre música clássica

Obrigado por ter sido parte da nossa comunidade. Desejamos tudo de melhor em sua jornada musical!

"A música é a linguagem universal da humanidade" - Longfellow

Harmoniosamente,
Equipe ${OPUS_ATLAS_CONFIG.BRAND_NAME}

---
${OPUS_ATLAS_CONFIG.BRAND_NAME} - Descobrindo a beleza da música clássica
Este email foi enviado porque você cancelou sua inscrição na nossa newsletter.`,
    variables: ['firstName', 'reason', 'feedback', 'resubscribeUrl'],
    description:
      'Email de confirmação de cancelamento de inscrição com opção de retorno',
  },
  ACCOUNT_CONFIRMATION: {
    subject: `Confirme sua conta no ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <p style="font-size: 20px; color: #d4af37; margin-bottom: 20px; text-align: center;">
        Olá {{firstName}}! 👋
      </p>
      
      <p style="color: #ffffff !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
        Que alegria ter você conosco! Sua conta foi criada com sucesso, mas precisamos confirmar 
        seu email para garantir a segurança e liberar todas as funcionalidades.
      </p>
      
      <div class="welcome-message">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
          🚀 Sua jornada começa agora!
        </h3>
        <p style="color: #ffffff !important; margin: 0; line-height: 1.7; text-align: center;">
          Após confirmar sua conta, você terá acesso completo à nossa plataforma 
          de música clássica, com recursos exclusivos e conteúdo de alta qualidade.
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{confirmationUrl}}" class="btn-premium">
          Confirmar Minha Conta
        </a>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📚</div>
          <div class="feature-title">Biblioteca</div>
          <div class="feature-desc">Acesso completo a compositores, obras e análises exclusivas</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <div class="feature-title">Partituras de Qualidade</div>
          <div class="feature-desc">Coleção curada de partituras em alta resolução</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <div class="feature-title">Ferramentas Avançadas</div>
          <div class="feature-desc">Anotações, marcadores e listas personalizadas</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎓</div>
          <div class="feature-title">Análises Detalhadas</div>
          <div class="feature-desc">Insights profundos sobre técnicas e estilos</div>
        </div>
      </div>
      
      <div class="security-note">
        <div class="security-icon">🔒</div>
        <div class="security-text">
          <strong>Segurança:</strong> Este link de confirmação é válido por 24 horas e pode ser usado apenas uma vez. 
          Se você não criou esta conta, pode ignorar este email com segurança.
        </div>
      </div>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 40px; text-align: center;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="{{confirmationUrl}}" style="color: #d4af37; word-break: break-all;">{{confirmationUrl}}</a>
      </p>
    `
    ),
    textContent: `CONFIRME SUA CONTA - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

Que alegria ter você conosco! Sua conta foi criada com sucesso.

Para confirmar sua conta e liberar todas as funcionalidades, acesse:
{{confirmationUrl}}

APÓS CONFIRMAR VOCÊ TERÁ ACESSO A:
📚 Biblioteca Completa
🎵 Partituras de Alta Qualidade  
📝 Ferramentas Avançadas de Estudo
🎓 Análises Musicais Detalhadas

SEGURANÇA: Este link é válido por 24 horas e pode ser usado apenas uma vez.

Se você não criou esta conta, pode ignorar este email com segurança.

${OPUS_ATLAS_CONFIG.BRAND_NAME} - ${OPUS_ATLAS_CONFIG.DESCRIPTION}
${OPUS_ATLAS_CONFIG.LOCATION}
${OPUS_ATLAS_CONFIG.CONTACT_EMAIL}`,
    variables: ['firstName', 'confirmationUrl', 'unsubscribeUrl'],
    description: 'Email de confirmação para criação de conta',
  },

  PASSWORD_RESET: {
    subject: `Redefinir senha - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <p style="font-size: 20px; color: #d4af37; margin-bottom: 25px; text-align: center;">
        Olá {{firstName}},
      </p>
      
      <p style="color: #ffffff !important; line-height: 1.7; margin-bottom: 25px; text-align: center;">
        Recebemos uma solicitação para redefinir a senha da sua conta no ${OPUS_ATLAS_CONFIG.BRAND_NAME}.
      </p>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
          📧 Detalhes da Solicitação
        </h3>
        <div style="text-align: center; color: #ffffff !important;">
          <p style="margin: 0 0 10px 0;">
            <strong>Email:</strong> {{email}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Data:</strong> {{requestDate}}
          </p>
          
        </div>
      </div>
      
      <p style="color: #ffffff !important; line-height: 1.7; margin: 25px 0; text-align: center;">
        Se foi você quem solicitou esta mudança, clique no botão abaixo para criar uma nova senha:
      </p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{resetUrl}}" class="btn-premium">
          🔑 Redefinir Senha
        </a>
      </div>
      
      <div class="premium-card">
        <h4 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">💡 Dicas para uma Senha Segura:</h4>
        <div style="color: #ffffff !important; text-align: left;">
          <div style="margin-bottom: 8px;">• Use pelo menos 8 caracteres</div>
          <div style="margin-bottom: 8px;">• Combine letras maiúsculas e minúsculas</div>
          <div style="margin-bottom: 8px;">• Inclua números e símbolos especiais</div>
          <div style="margin-bottom: 8px;">• Evite informações pessoais óbvias</div>
          <div>• Não reutilize senhas de outros sites</div>
        </div>
      </div>
      
      <div class="warning-box">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Importante:</strong> Este link é válido por apenas 1 hora e pode ser usado uma única vez. 
          Se você não solicitou esta mudança, ignore este email e sua senha permanecerá inalterada.
        </div>
      </div>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="{{resetUrl}}" style="color: #d4af37; word-break: break-all;">{{resetUrl}}</a>
      </p>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 20px; text-align: center;">
        Problemas com sua conta? Entre em contato conosco em 
        <a href="mailto:${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}" style="color: #d4af37;">${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}</a>
      </p>
    `
    ),
    textContent: `🔒 REDEFINIR SENHA - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

Recebemos uma solicitação para redefinir a senha da sua conta.

DETALHES DA SOLICITAÇÃO:
Email: {{email}}
Data: {{requestDate}}

Para criar uma nova senha, acesse:
{{resetUrl}}

DICAS DE SEGURANÇA:
• Use pelo menos 8 caracteres
• Combine letras, números e símbolos
• Evite informações pessoais
• Não reutilize senhas

IMPORTANTE: Este link é válido por apenas 1 hora.

Se você não solicitou esta mudança, ignore este email.

Problemas? Contate: ${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Sua segurança é nossa prioridade
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: ['firstName', 'email', 'resetUrl', 'requestDate', 'ipAddress'],
    description: 'Email para redefinição de senha',
  },

  WEEKLY_DIGEST: {
    subject: `🎼 Digest Semanal - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <h2 style="color: #d4af37; margin-bottom: 25px; font-size: 28px; text-align: center;">Sua dose semanal</h2>
      
      <p style="font-size: 18px; text-align: center; margin-bottom: 30px;">
        Olá, {{firstName}}! Aqui estão as novidades desta semana no ${OPUS_ATLAS_CONFIG.BRAND_NAME}.
      </p>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin-bottom: 25px; text-align: center;">📊 Estatísticas da Semana</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 20px; text-align: center;">
          <div>
            <strong style="font-size: 28px; color: #d4af37; display: block;">{{newComposers}}</strong>
            <span style="color: #ffffff !important; font-size: 14px;">Novos Compositores</span>
          </div>
          <div>
            <strong style="font-size: 28px; color: #fbbf24; display: block;">{{newWorks}}</strong>
            <span style="color: #ffffff !important; font-size: 14px;">Novas Obras</span>
          </div>
          <div>
            <strong style="font-size: 28px; color: #d4af37; display: block;">{{newScores}}</strong>
            <span style="color: #ffffff !important; font-size: 14px;">Partituras</span>
          </div>
          <div>
            <strong style="font-size: 28px; color: #fbbf24; display: block;">{{activeUsers}}</strong>
            <span style="color: #ffffff !important; font-size: 14px;">Usuários Ativos</span>
          </div>
        </div>
      </div>
      
      {{#if featuredComposer}}
      <div class="composer-card">
        <h3 style="color: #d4af37; margin-bottom: 20px; text-align: center;">🎭 Compositor em Destaque</h3>
        <h4 style="margin-bottom: 10px; color: #ffffff !important; text-align: center; font-size: 22px;">{{featuredComposer.name}}</h4>
        <p style="color: #b0b0b0; margin-bottom: 15px; text-align: center;">{{featuredComposer.period}}</p>
        <p style="margin-bottom: 20px; color: #ffffff !important; text-align: center;">{{featuredComposer.description}}</p>
        <div style="text-align: center;">
          <a href="{{featuredComposer.url}}" class="btn-premium">Conhecer Compositor</a>
        </div>
      </div>
      {{/if}}
      
      {{#if popularWorks}}
      <h3 style="color: #d4af37; margin: 40px 0 25px 0; text-align: center;">🎵 Obras Populares da Semana</h3>
      {{#each popularWorks}}
      <div class="work-item">
        <h4 style="margin-bottom: 8px; color: #ffffff !important;">{{title}}</h4>
        <p style="color: #d4af37; margin-bottom: 8px; font-weight: bold;">{{composer}} - {{instrument}}</p>
        <p style="color: #b0b0b0; margin-bottom: 12px;">{{description}}</p>
        <a href="{{url}}" style="color: #fbbf24; text-decoration: none; font-weight: bold;">Estudar obra →</a>
      </div>
      {{/each}}
      {{/if}}
      
      {{#if studyTip}}
      <div class="premium-card">
        <h3 style="color: #d4af37; margin-bottom: 20px; text-align: center;">💡 Dica da Semana</h3>
        <h4 style="margin-bottom: 15px; color: #ffffff !important; text-align: center;">{{studyTip.title}}</h4>
        <p style="color: #ffffff !important; text-align: center;">{{studyTip.content}}</p>
      </div>
      {{/if}}
      
      <div class="text-center" style="margin: 40px 0;">
        <a href="{{siteUrl}}" class="btn-premium">Explorar Mais Conteúdo</a>
      </div>
      
      <p style="margin-top: 30px; text-align: center; color: #b0b0b0; font-style: italic;">
        Continue sua jornada musical com o ${OPUS_ATLAS_CONFIG.BRAND_NAME}!
      </p>
    `
    ),
    textContent: `Digest Semanal - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá, {{firstName}}!

ESTATÍSTICAS DA SEMANA:
- {{newComposers}} novos compositores
- {{newWorks}} novas obras
- {{newScores}} partituras
- {{activeUsers}} usuários ativos

{{#if featuredComposer}}
COMPOSITOR EM DESTAQUE:
{{featuredComposer.name}} ({{featuredComposer.period}})
{{featuredComposer.description}}
Saiba mais: {{featuredComposer.url}}
{{/if}}

{{#if studyTip}}
DICA:
{{studyTip.title}}
{{studyTip.content}}
{{/if}}

Visite: {{siteUrl}}
Cancelar: {{unsubscribeUrl}}`,
    variables: [
      'firstName',
      'newComposers',
      'newWorks',
      'newScores',
      'activeUsers',
      'featuredComposer',
      'popularWorks',
      'studyTip',
      'siteUrl',
      'unsubscribeUrl',
    ],
    description: 'Newsletter semanal com resumo de atividades',
  },

  NEW_COMPOSER: {
    subject: `🎭 Novo compositor adicionado: {{composerName}} - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <h2 style="color: #d4af37; margin-bottom: 25px; text-align: center;">Novo compositor descoberto!</h2>
      
      <p style="font-size: 18px; text-align: center; margin-bottom: 30px;">
        Olá, {{firstName}}! Temos uma novidade emocionante para compartilhar com você.
      </p>
      
      <div class="composer-card">
        <h3 style="color: #d4af37; margin-bottom: 20px; text-align: center; font-size: 24px;">🎭 {{composerName}}</h3>
        <div style="text-align: center; margin-bottom: 20px;">
          <p style="color: #ffffff !important; margin-bottom: 8px;"><strong>Período:</strong> {{composerPeriod}}</p>
          <p style="color: #ffffff !important; margin-bottom: 20px;"><strong>Nacionalidade:</strong> {{composerNationality}}</p>
        </div>
        <p style="margin-bottom: 25px; color: #ffffff !important; text-align: center; line-height: 1.7;">{{composerBio}}</p>
        
        {{#if works}}
        <h4 style="color: #d4af37; margin-bottom: 20px; text-align: center;">Principais Obras:</h4>
        {{#each works}}
        <div style="margin-bottom: 15px; padding: 15px; background: linear-gradient(135deg, #1a1a1a, #0a0a0a); border-radius: 8px; border: 1px solid rgba(212, 175, 55, 0.2);">
          <strong style="color: #ffffff !important;">{{title}}</strong> - <span style="color: #d4af37;">{{instrument}}</span>
          {{#if year}}<span style="color: #b0b0b0;"> ({{year}})</span>{{/if}}
        </div>
        {{/each}}
        {{/if}}
        
        <div class="text-center" style="margin-top: 30px;">
          <a href="{{composerUrl}}" class="btn-premium">Explorar Compositor</a>
        </div>
      </div>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin-bottom: 20px; text-align: center;">🎵 Curiosidade Musical</h3>
        <p style="color: #ffffff !important; text-align: center;">{{musicalFact}}</p>
      </div>
      
      <p style="margin-top: 30px; text-align: center; color: #b0b0b0;">
        Continue explorando nosso catálogo e descobrindo novos compositores que enriquecerão sua jornada musical!
      </p>
    `
    ),
    textContent: `🎭 NOVO COMPOSITOR DESCOBERTO!

Olá {{firstName}},

Acabamos de adicionar {{composerName}} à nossa coleção.

DETALHES DO COMPOSITOR:
Nome: {{composerName}}
Período: {{composerPeriod}}
Nacionalidade: {{composerNationality}}

{{composerBio}}

{{#if works}}
PRINCIPAIS OBRAS:
{{#each works}}
- {{title}} ({{instrument}})
{{/each}}
{{/if}}

CURIOSIDADE: {{musicalFact}}

Explore: {{composerUrl}}
Cancelar inscrição: {{unsubscribeUrl}}`,
    variables: [
      'firstName',
      'composerName',
      'composerPeriod',
      'composerNationality',
      'composerBio',
      'composerUrl',
      'works',
      'musicalFact',
      'unsubscribeUrl',
    ],
    description: 'Notificação sobre novo compositor adicionado',
  },

  CAMPAIGN_CUSTOM: {
    subject: '{{customSubject}}',
    htmlContent: getPremiumOpusAtlasLayout(`{{customContent}}`),
    textContent: `{{customTextContent}}

Visite: {{siteUrl}}
Cancelar: {{unsubscribeUrl}}`,
    variables: [
      'customSubject',
      'customContent',
      'customTextContent',
      'siteUrl',
      'unsubscribeUrl',
    ],
    description: 'Template customizável para campanhas específicas',
  },

  EMAIL_CHANGE_CONFIRMATION: {
    subject: `Confirme sua mudança de email - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <p style="font-size: 20px; color: #d4af37; margin-bottom: 20px; text-align: center;">
        Olá {{firstName}}! 📧
      </p>
      
      <p style="color: #ffffff !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
        Você solicitou a alteração do email da sua conta no ${OPUS_ATLAS_CONFIG.BRAND_NAME}.
      </p>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
          📧 Detalhes da Mudança
        </h3>
        <div style="text-align: center; color: #ffffff !important;">
          <p style="margin: 0 0 10px 0;">
            <strong>Email atual:</strong> {{oldEmail}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Novo email:</strong> {{newEmail}}
          </p>
          
        </div>
      </div>
      
      <p style="color: #ffffff !important; line-height: 1.7; margin: 25px 0; text-align: center;">
        Para confirmar esta mudança e ativar seu novo email, clique no botão abaixo:
      </p>
      
      <div class="text-center" style="margin: 40px 0;">
        <a href="{{confirmationUrl}}" class="btn-premium">
          ✅ Confirmar Mudança de Email
        </a>
      </div>
      
      <div class="warning-box">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Importante:</strong>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Este link é válido por 24 horas</li>
            <li>Após a confirmação, você perderá temporariamente algumas funcionalidades até verificar o novo email</li>
            <li>Você receberá notificações em ambos os emails durante a transição</li>
            <li>Se você não solicitou esta mudança, ignore este email</li>
          </ul>
        </div>
      </div>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="{{confirmationUrl}}" style="color: #d4af37; word-break: break-all;">{{confirmationUrl}}</a>
      </p>
    `
    ),
    textContent: `CONFIRME SUA MUDANÇA DE EMAIL - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

Você solicitou a alteração do email da sua conta.

DETALHES DA MUDANÇA:
Email atual: {{oldEmail}}
Novo email: {{newEmail}}
Data: {{requestDate}}

Para confirmar a mudança, acesse:
{{confirmationUrl}}

IMPORTANTE:
- Link válido por 24 horas
- Você perderá temporariamente algumas funcionalidades até verificar o novo email
- Se não solicitou esta mudança, ignore este email

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Sua segurança é nossa prioridade
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: [
      'firstName',
      'oldEmail',
      'newEmail',
      'confirmationUrl',
      'requestDate',
      'ipAddress',
    ],
    description: 'Email de confirmação para mudança de email',
  },

  EMAIL_CHANGE_SUCCESS: {
    subject: `Email alterado com sucesso - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <p style="font-size: 20px; color: #d4af37; margin-bottom: 20px; text-align: center;">
        Olá {{firstName}}! ✅
      </p>
      
      <div class="welcome-message">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
          🎉 Email alterado com sucesso!
        </h3>
        <p style="color: #ffffff !important; margin: 0; line-height: 1.7; text-align: center;">
          Seu email foi alterado com sucesso e sua conta está totalmente funcional novamente.
        </p>
      </div>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">📧 Resumo da Alteração</h3>
        <div style="text-align: center; color: #ffffff !important;">
          <p style="margin: 0 0 10px 0;">
            <strong>Email anterior:</strong> {{oldEmail}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Novo email:</strong> {{newEmail}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Data da alteração:</strong> {{changeDate}}
          </p>
        </div>
      </div>
      
      <div class="premium-card">
        <h4 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">✨ Funcionalidades Restauradas:</h4>
        <div style="color: #ffffff !important; text-align: left;">
          <div style="margin-bottom: 8px;">✅ Upload de compositores e obras</div>
          <div style="margin-bottom: 8px;">✅ Upload de partituras</div>
          <div style="margin-bottom: 8px;">✅ Acesso completo à plataforma</div>
          <div style="margin-bottom: 8px;">✅ Recebimento de notificações</div>
          <div>✅ Todas as funcionalidades premium</div>
        </div>
      </div>
      
      <div class="text-center" style="margin: 40px 0;">
        <a href="{{siteUrl}}" class="btn-premium">Acessar Minha Conta</a>
      </div>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 20px; text-align: center;">
        Problemas com sua conta? Entre em contato conosco em 
        <a href="mailto:${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}" style="color: #d4af37;">${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}</a>
      </p>
    `
    ),
    textContent: `EMAIL ALTERADO COM SUCESSO - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

✅ Seu email foi alterado com sucesso!

RESUMO DA ALTERAÇÃO:
Email anterior: {{oldEmail}}
Novo email: {{newEmail}}
Data: {{changeDate}}

FUNCIONALIDADES RESTAURADAS:
✅ Upload de compositores e obras
✅ Upload de partituras  
✅ Acesso completo à plataforma
✅ Recebimento de notificações
✅ Todas as funcionalidades premium

Acesse sua conta: {{siteUrl}}

Problemas? Contate: ${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Bem-vindo de volta!
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: ['firstName', 'oldEmail', 'newEmail', 'changeDate', 'siteUrl'],
    description: 'Email de confirmação após mudança bem-sucedida',
  },

  EMAIL_CHANGED_NOTIFICATION: {
    subject: `Seu email foi alterado - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <p style="font-size: 20px; color: #d4af37; margin-bottom: 20px; text-align: center;">
        Olá {{firstName}}! 📧
      </p>
      
      <p style="color: #ffffff !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
        Este é um aviso de que o email da sua conta ${OPUS_ATLAS_CONFIG.BRAND_NAME} foi alterado.
      </p>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">📧 Detalhes da Alteração</h3>
        <div style="text-align: center; color: #ffffff !important;">
          <p style="margin: 0 0 10px 0;">
            <strong>Email anterior:</strong> {{oldEmail}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Novo email:</strong> {{newEmail}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>Data da alteração:</strong> {{changeDate}}
          </p>
          <p style="margin: 0 0 10px 0;">
            <strong>IP:</strong> {{ipAddress}}
          </p>
        </div>
      </div>
      
      <div class="warning-box">
        <div class="warning-icon">🔒</div>
        <div class="warning-text">
          <strong>Não foi você?</strong><br>
          Se você não solicitou esta mudança, sua conta pode ter sido comprometida. 
          Entre em contato conosco imediatamente em 
          <a href="mailto:${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}" style="color: #d4af37;">
            ${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}
          </a>
        </div>
      </div>
      
      <p style="color: #ffffff !important; text-align: center; margin-top: 30px;">
        A partir de agora, todas as comunicações serão enviadas para o novo email.
      </p>
    `
    ),
    textContent: `EMAIL ALTERADO - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

Este é um aviso de que o email da sua conta foi alterado.

DETALHES:
Email anterior: {{oldEmail}}
Novo email: {{newEmail}}
Data: {{changeDate}}

NÃO FOI VOCÊ?
Se não solicitou esta mudança, sua conta pode ter sido comprometida.
Contate imediatamente: ${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Sua segurança é nossa prioridade
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: ['firstName', 'oldEmail', 'newEmail', 'changeDate', 'ipAddress'],
    description: 'Notificação para o email antigo sobre mudança',
  },

  ACCOUNT_FAREWELL: {
    subject: `Sentiremos sua falta - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <p style="font-size: 20px; color: #d4af37; margin-bottom: 20px; text-align: center;">
        Adeus, {{firstName}} 💔
      </p>
      
      <p style="color: #ffffff !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
        Sua conta ${OPUS_ATLAS_CONFIG.BRAND_NAME} foi excluída conforme solicitado. 
        Sentiremos muito sua falta em nossa comunidade musical.
      </p>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">📊 Sua Jornada Musical</h3>
        <div style="text-align: center; color: #ffffff !important;">
          <p style="margin: 0 0 15px 0;">
            <strong>Tempo na comunidade:</strong> {{accountAge}} dias
          </p>
          <p style="margin: 0 0 15px 0;">
            <strong>Compositores adicionados:</strong> {{composersCount}}
          </p>
          <p style="margin: 0 0 15px 0;">
            <strong>Obras contribuídas:</strong> {{worksCount}}
          </p>
         
          <p style="margin: 0 0 15px 0;">
            <strong>Horas de prática registradas:</strong> {{totalStudyHours}}h
          </p>
        </div>
      </div>
      
      <p style="color: #ffffff !important; line-height: 1.7; margin: 25px 0; text-align: center;">
        Obrigado por fazer parte da nossa comunidade e por contribuir para tornar 
        a música clássica mais acessível a todos.
      </p>
      
      <div class="premium-card">
        <h4 style="color: #d4af37; margin: 0 0 20px 0; text-align: center;">🗑️ Dados Removidos</h4>
        <p style="color: #ffffff !important; text-align: center; margin-bottom: 20px;">
          Conforme solicitado, todos os seus dados foram permanentemente removidos:
        </p>
        <div style="color: #ffffff !important; text-align: left;">
          <div style="margin-bottom: 8px;">🗂️ Informações pessoais e de perfil</div>
          <div style="margin-bottom: 8px;">🎼 Compositores e obras criados</div>
          <div style="margin-bottom: 8px;">📝 Anotações e comentários</div>
          <div style="margin-bottom: 8px;">❤️ Favoritos e listas pessoais</div>
          <div style="margin-bottom: 8px;">📊 Estatísticas e progresso</div>
          <div style="margin-bottom: 8px;">⚙️ Configurações e preferências</div>
          <div>🔐 Tokens e dados de sessão</div>
        </div>
      </div>
      
      <p style="color: #ffffff !important; line-height: 1.7; margin: 30px 0; text-align: center; font-style: italic;">
        "A música é a revelação mais alta que toda filosofia" - Beethoven
      </p>
      
      <p style="color: #ffffff !important; text-align: center; margin-top: 30px;">
        Se um dia quiser retornar, estaremos aqui. A música clássica sempre tem um lugar 
        para os que a amam.
      </p>
      
      <div class="text-center" style="margin: 40px 0;">
        <a href="{{siteUrl}}" class="btn-secondary">Visitar ${OPUS_ATLAS_CONFIG.BRAND_NAME}</a>
      </div>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
        Exclusão confirmada em {{deletionDate}}<br>
        Este email foi enviado para: {{email}}
      </p>
    `
    ),
    textContent: `SENTIREMOS SUA FALTA - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Adeus, {{firstName}}

Sua conta foi excluída conforme solicitado. Sentiremos muito sua falta.

SUA JORNADA MUSICAL:
- Tempo na comunidade: {{accountAge}} dias
- Compositores adicionados: {{composersCount}}
- Obras contribuídas: {{worksCount}}
- Horas de prática: {{totalStudyHours}}h

DADOS REMOVIDOS:
🗂️ Informações pessoais e de perfil
🎼 Compositores e obras criados
📝 Anotações e comentários
❤️ Favoritos e listas pessoais
📊 Estatísticas e progresso
⚙️ Configurações e preferências
🔐 Tokens e dados de sessão

"A música é a revelação mais alta que toda filosofia" - Beethoven

Se um dia quiser retornar, estaremos aqui.

Visite: {{siteUrl}}
Exclusão: {{deletionDate}}

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Obrigado por tudo
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: [
      'firstName',
      'email',
      'accountAge',
      'composersCount',
      'worksCount',
      'totalStudyHours',
      'deletionDate',
      'siteUrl',
    ],
    description: 'Email de despedida após exclusão da conta',
  },
  TEACHER_INVITATION: {
    subject: `🎓 Convite para ser Professor - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
      <h2 style="color: #d4af37; margin-bottom: 25px; font-size: 28px; text-align: center;">Você foi convidado para ser Professor!</h2>
      
      <p style="font-size: 18px; text-align: center; margin-bottom: 30px;">
        Olá, {{firstName}}! Temos uma oportunidade especial para você.
      </p>
      
      <div class="welcome-message">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
          🎼 Convite para Ensinar no ${OPUS_ATLAS_CONFIG.BRAND_NAME}
        </h3>
        <p style="color: #ffffff !important; margin: 0; line-height: 1.7; text-align: center;">
          Você foi selecionado para se tornar professor em nossa plataforma! 
          Agora você pode compartilhar seu conhecimento musical e guiar alunos 
          em sua jornada na música clássica.
        </p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">👨‍🎓</div>
          <div class="feature-title">Ensine Alunos</div>
          <div class="feature-desc">Adicione e gerencie seus alunos, criando planos de estudo personalizados</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📅</div>
          <div class="feature-title">Agende Aulas</div>
          <div class="feature-desc">Sistema completo de agendamento com recorrência e controle de presença</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📊</div>
          <div class="feature-title">Acompanhe Progresso</div>
          <div class="feature-desc">Relatórios detalhados do desenvolvimento de cada aluno</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💼</div>
          <div class="feature-title">Perfil Profissional</div>
          <div class="feature-desc">Crie seu perfil público e seja encontrado por novos alunos</div>
        </div>
      </div>
      
      <div class="premium-card">
        <h3 style="color: #d4af37; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
          🚀 Próximos Passos
        </h3>
        <div style="text-align: center; color: #ffffff !important;">
          <p style="margin: 0 0 20px 0; line-height: 1.6;">
            Para ativar sua conta de professor, você precisa:
          </p>
          <div style="text-align: left; margin: 0 auto; display: inline-block;">
            <div style="margin-bottom: 10px;">1️⃣ Aceitar este convite</div>
            <div style="margin-bottom: 10px;">2️⃣ Completar seu perfil de professor</div>
            <div style="margin-bottom: 10px;">3️⃣ Definir suas especialidades e instrumentos</div>
            <div>4️⃣ Começar a ensinar! 🎉</div>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{acceptUrl}}" class="btn-premium">
          ✅ Aceitar Convite
        </a>
        <br><br>
        <a href="{{declineUrl}}" class="">
          ❌ Recusar Convite
        </a>
      </div>
      
      <div class="warning-box">
        <div class="warning-icon">⏰</div>
        <div class="warning-text">
          <strong>Importante:</strong> Este convite é válido por 7 dias. 
          Após aceitar, você terá acesso completo às ferramentas de ensino 
          e poderá começar a adicionar seus alunos imediatamente.
        </div>
      </div>
      
      <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
        Se você não esperava este convite ou tem dúvidas, entre em contato conosco em 
        <a href="mailto:${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}" style="color: #d4af37;">${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}</a>
      </p>
    `
    ),
    textContent: `CONVITE PARA SER PROFESSOR - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

🎓 Você foi convidado para se tornar professor no ${OPUS_ATLAS_CONFIG.BRAND_NAME}!

COMO PROFESSOR VOCÊ PODERÁ:
👨‍🎓 Ensinar e gerenciar alunos
📅 Agendar aulas com sistema avançado
📊 Acompanhar progresso dos alunos
💼 Ter um perfil profissional público

PRÓXIMOS PASSOS:
1️⃣ Aceitar este convite
2️⃣ Completar seu perfil de professor
3️⃣ Definir especialidades e instrumentos
4️⃣ Começar a ensinar!

ACEITAR CONVITE: {{acceptUrl}}
RECUSAR CONVITE: {{declineUrl}}

⏰ Convite válido por 7 dias.

Dúvidas? ${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Compartilhe seu conhecimento musical
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: ['firstName', 'acceptUrl', 'declineUrl', 'invitedBy'],
    description: 'Convite para usuário se tornar professor',
  },

  STUDENT_INVITATION: {
    subject: `🎵 Você foi adicionado como aluno - ${OPUS_ATLAS_CONFIG.BRAND_NAME}`,
    htmlContent: getPremiumOpusAtlasLayout(
      `
    <h2 style="color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Você tem um novo professor!</h2>
    
    <p style="font-size: 18px; text-align: center; margin-bottom: 30px;">
      Olá, {{firstName}}! {{teacherName}} adicionou você como aluno.
    </p>
    
    <div class="welcome-message">
      <h3 style="color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
        🎼 Sua Jornada Musical Começa Agora!
      </h3>
      <p style="color: #ffffff !important; margin: 0; line-height: 1.7; text-align: center;">
        Você foi adicionado como aluno de <strong style="color: #d4af37 !important;">{{teacherName}}</strong> 
        no ${OPUS_ATLAS_CONFIG.BRAND_NAME}. Prepare-se para uma experiência de aprendizado 
        musical única e personalizada!
      </p>
    </div>
    
    <div class="premium-card">
      <h3 style="color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">👨‍🏫 Sobre Seu Professor</h3>
      <div style="text-align: center; color: #ffffff !important;">
        <p style="margin: 0 0 10px 0;">
          <strong>Professor:</strong> {{teacherName}}
        </p>
        {{#if teacherSpecialties}}
        <p style="margin: 0 0 10px 0;">
          <strong>Especialidades:</strong> {{teacherSpecialties}}
        </p>
        {{/if}}
        {{#if teacherExperience}}
        <p style="margin: 0 0 10px 0;">
          <strong>Experiência:</strong> {{teacherExperience}}
        </p>
        {{/if}}
      </div>
    </div>
    
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">📚</div>
        <div class="feature-title">Aulas Personalizadas</div>
        <div class="feature-desc">Plano de estudos criado especificamente para você</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📅</div>
        <div class="feature-title">Aulas Agendadas</div>
        <div class="feature-desc">Sistema organizado de horários e lembretes</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <div class="feature-title">Progresso Visível</div>
        <div class="feature-desc">Acompanhe sua evolução musical em tempo real</div>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <div class="feature-title">Tarefas & Metas</div>
        <div class="feature-desc">Exercícios direcionados e objetivos claros</div>
      </div>
    </div>
    
    <div class="premium-card">
      <h3 style="color: #d4af37 !important; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
        🚀 Próximos Passos
      </h3>
      <div style="text-align: center; color: #ffffff !important;">
        <p style="margin: 0 0 20px 0; line-height: 1.6; color: #ffffff !important;">
          Para começar suas aulas, você precisa:
        </p>
        <div style="text-align: left; margin: 0 auto; display: inline-block; color: #ffffff !important;">
          <div style="margin-bottom: 10px; color: #ffffff !important;">1️⃣ Aceitar este convite</div>
          <div style="margin-bottom: 10px; color: #ffffff !important;">2️⃣ Completar seu perfil de aluno</div>
          <div style="margin-bottom: 10px; color: #ffffff !important;">3️⃣ Definir seus objetivos musicais</div>
          <div style="color: #ffffff !important;">4️⃣ Aguardar o agendamento da primeira aula! 🎉</div>
        </div>
      </div>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="{{acceptUrl}}" class="btn-premium">
        ✅ Aceitar Convite
      </a>
      <br><br>
      <a href="{{declineUrl}}" class="">
        ❌ Recusar Convite
      </a>
    </div>
    
    <div class="warning-box">
      <div class="warning-icon">⏰</div>
      <div class="warning-text">
        <strong>Importante:</strong> Este convite é válido por 30 dias. 
        Se você não aceitar dentro deste prazo, será necessário que 
        {{teacherName}} envie um novo convite.
      </div>
    </div>
    
    <p style="color: #888888 !important; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
      Se você não conhece {{teacherName}} ou tem dúvidas sobre este convite, 
      entre em contato conosco em 
      <a href="mailto:${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}" style="color: #d4af37 !important;">${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}</a>
    </p>
  `
    ),
    textContent: `VOCÊ FOI ADICIONADO COMO ALUNO - ${OPUS_ATLAS_CONFIG.BRAND_NAME}

Olá {{firstName}},

🎵 {{teacherName}} adicionou você como aluno no ${OPUS_ATLAS_CONFIG.BRAND_NAME}!

SOBRE SEU PROFESSOR:
👨‍🏫 {{teacherName}}
{{#if teacherSpecialties}}🎼 Especialidades: {{teacherSpecialties}}{{/if}}
{{#if teacherExperience}}📚 Experiência: {{teacherExperience}}{{/if}}

COMO ALUNO VOCÊ TERÁ:
📚 Aulas personalizadas
📅 Sistema de agendamento
📊 Acompanhamento de progresso
🎯 Tarefas e metas direcionadas

PRÓXIMOS PASSOS:
1️⃣ Aceitar este convite
2️⃣ Completar seu perfil de aluno
3️⃣ Definir objetivos musicais
4️⃣ Aguardar primeira aula!

ACEITAR CONVITE: {{acceptUrl}}
RECUSAR CONVITE: {{declineUrl}}

⏰ Convite válido por 30 dias.

Dúvidas? ${OPUS_ATLAS_CONFIG.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.BRAND_NAME} - Sua jornada musical começa agora!
${OPUS_ATLAS_CONFIG.LOCATION}`,
    variables: [
      'firstName',
      'teacherName',
      'teacherSpecialties',
      'teacherExperience',
      'acceptUrl',
      'declineUrl',
    ],
    description: 'Convite para usuário se tornar aluno de um professor',
  },
};

/**
 * Obter template por tipo
 */
export function getEmailTemplate(type: string): EmailTemplate | null {
  return emailTemplates[type] || null;
}

/**
 * Listar todos os templates disponíveis
 */
export function getAllEmailTemplates(): Array<{
  type: string;
  template: EmailTemplate;
}> {
  return Object.entries(emailTemplates).map(([type, template]) => ({
    type,
    template,
  }));
}

/**
 * Validar se todas as variáveis necessárias estão presentes
 */
export function validateTemplateVariables(
  templateType: string,
  variables: Record<string, any>
): { valid: boolean; missing: string[] } {
  const template = getEmailTemplate(templateType);
  if (!template) {
    return { valid: false, missing: ['Template não encontrado'] };
  }

  const requiredVars = template.variables;
  const providedVars = Object.keys(variables);
  const missing = requiredVars.filter(
    (required) => !providedVars.includes(required)
  );

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Preview de template com dados de exemplo
 */
export function previewTemplate(
  templateType: string
): { html: string; text: string; subject: string } | null {
  const template = getEmailTemplate(templateType);
  if (!template) return null;

  // Dados de exemplo para preview
  const sampleData: Record<string, any> = {
    firstName: 'João',
    email: 'joao@exemplo.com',
    siteUrl: OPUS_ATLAS_CONFIG.SITE_URL,
    unsubscribeUrl: `${OPUS_ATLAS_CONFIG.SITE_URL}/unsubscribe?token=sample`,
    preferencesUrl: `${OPUS_ATLAS_CONFIG.SITE_URL}/preferences?token=sample`,
    confirmationUrl: `${OPUS_ATLAS_CONFIG.SITE_URL}/confirm?token=sample`,
    resetUrl: `${OPUS_ATLAS_CONFIG.SITE_URL}/reset?token=sample`,
    requestDate: new Date().toLocaleDateString('pt-BR'),
    ipAddress: '192.168.1.100',
    newComposers: 5,
    newWorks: 12,
    newScores: 8,
    activeUsers: 150,
    featuredComposer: {
      name: 'Ludwig van Beethoven',
      period: '1770-1827',
      description: 'Compositor alemão considerado um dos maiores da história.',
      url: `${OPUS_ATLAS_CONFIG.SITE_URL}/composers/beethoven`,
    },
    popularWorks: [
      {
        title: 'Sonata ao Luar',
        composer: 'Beethoven',
        instrument: 'Piano',
        description: 'Uma das sonatas mais conhecidas para piano.',
        url: `${OPUS_ATLAS_CONFIG.SITE_URL}/works/moonlight-sonata`,
      },
    ],
    studyTip: {
      title: 'Técnica de Dedilhado',
      content:
        'Pratique escalas lentamente para desenvolver força e precisão nos dedos.',
    },
    composerName: 'Wolfgang Amadeus Mozart',
    composerPeriod: '1756-1791',
    composerNationality: 'Austríaco',
    composerBio:
      'Compositor austríaco do período clássico, conhecido por sua genialidade precoce.',
    composerUrl: `${OPUS_ATLAS_CONFIG.SITE_URL}/composers/mozart`,
    works: [
      {
        title: 'Requiem em Ré menor',
        instrument: 'Coro e Orquestra',
        year: '1791',
      },
      { title: 'Sinfonia nº 40', instrument: 'Orquestra', year: '1788' },
    ],
    musicalFact: 'Mozart compôs mais de 600 obras durante sua curta vida.',
    customSubject: 'Assunto Personalizado',
    customContent:
      '<h3 style="color: #d4af37;">Conteúdo personalizado da campanha</h3><p style="color: #ffffff !important;">Este é um exemplo de conteúdo customizado.</p>',
    customTextContent: 'Conteúdo personalizado da campanha em texto simples.',
  };

  return {
    html: processTemplate(template.htmlContent, sampleData),
    text: processTemplate(template.textContent, sampleData),
    subject: processTemplate(template.subject, sampleData),
  };
}

/**
 * Criar template personalizado
 */
export function createCustomTemplate(
  name: string,
  type: string,
  subject: string,
  htmlContent: string,
  textContent: string
): EmailTemplate {
  return {
    subject,
    htmlContent: getPremiumOpusAtlasLayout(htmlContent),
    textContent,
    variables: extractVariables(
      htmlContent + ' ' + textContent + ' ' + subject
    ),
    description: `Template personalizado: ${name}`,
  };
}

/**
 * Extrair variáveis de um template
 */
export function extractVariables(template: string): string[] {
  const matches = template.match(/{{[^}]+}}/g);
  if (!matches) return [];

  return [
    ...new Set(
      matches
        .map((match) => match.replace(/[{}]/g, '').trim())
        .filter(
          (variable) =>
            !variable.startsWith('#') &&
            !variable.startsWith('/') &&
            !variable.includes('.') &&
            variable.length > 0
        )
    ),
  ];
}

/**
 * Validar formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Gerar token único para links
 */
export function generateEmailToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * 🆕 Função para atualizar configurações facilmente
 */
export function updateOpusAtlasConfig(
  newConfig: Partial<typeof OPUS_ATLAS_CONFIG>
) {
  Object.assign(OPUS_ATLAS_CONFIG, newConfig);
}

/**
 * 🆕 Obter configurações atuais
 */
export function getOpusAtlasConfig() {
  return { ...OPUS_ATLAS_CONFIG };
}
