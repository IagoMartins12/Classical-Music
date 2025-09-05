// app/libs/newsletter/emailTemplates.ts - VERSÃO COMPLETA CORRIGIDA PARA iOS DARK MODE

export type Language = 'pt' | 'en';

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description: string;
}

interface MultiLanguageEmailTemplate {
  pt: EmailTemplate;
  en: EmailTemplate;
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
 * Configurações globais do Opus Atlas - MULTI-LANGUAGE
 */
const OPUS_ATLAS_CONFIG = {
  pt: {
    FROM_EMAIL: 'noreply@opusatlas.com',
    CONTACT_EMAIL: 'contato@opusatlas.com',
    SUPPORT_EMAIL: 'suporte@opusatlas.com',
    SITE_URL: 'https://opusatlas.com',
    BRAND_NAME: 'Opus Atlas',
    TAGLINE: 'A música clássica em suas mãos',
    DESCRIPTION: 'A plataforma completa de música clássica',
    LOCATION: 'Brasil',
    LOGO_PLACEHOLDER: '🎼',
  },
  en: {
    FROM_EMAIL: 'noreply@opusatlas.com',
    CONTACT_EMAIL: 'contact@opusatlas.com',
    SUPPORT_EMAIL: 'support@opusatlas.com',
    SITE_URL: 'https://opusatlas.com',
    BRAND_NAME: 'Opus Atlas',
    TAGLINE: 'Classical music at your fingertips',
    DESCRIPTION: 'The complete classical music platform',
    LOCATION: 'Brazil',
    LOGO_PLACEHOLDER: '🎼',
  },
};

/**
 * Layout premium CORRIGIDO DEFINITIVAMENTE para iOS Mail dark mode
 */
function getPremiumOpusAtlasLayout(
  content: string,
  language: Language = 'pt'
): string {
  const config = OPUS_ATLAS_CONFIG[language];

  return `<!DOCTYPE html>
<html lang="${language === 'pt' ? 'pt-BR' : 'en-US'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- META TAGS CORRETAS PARA iOS DARK MODE -->
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>{{subject}} - ${config?.BRAND_NAME}</title>
    
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    
    <style>
        /* RESET BÁSICO */
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        /* BASE STYLES - EVITA CORES PURAS QUE O iOS INVERTE */
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif !important;
            line-height: 1.6 !important;
            color: #fffffe !important; /* Evita #ffffff puro */
            background: #000001 !important; /* Evita #000000 puro */
            margin: 0 !important;
            padding: 0 !important;
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
            -webkit-text-fill-color: #fffffe !important; /* FORÇA TEXTO BRANCO NO iOS */
        }
        
        /* FORÇA TEXTO BRANCO EM TODOS OS ELEMENTOS */
        body *,
        p, div, span, h1, h2, h3, h4, h5, h6, td, th, li, a, strong, em, i, b {
            -webkit-text-fill-color: #fffffe !important;
            color: #fffffe !important;
        }
        
        /* Container Principal */
        .email-container { 
            max-width: 600px !important; 
            margin: 0 auto !important; 
            background: #000001 !important;
            border: 1px solid #d4af37 !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8) !important;
        }

        /* Header */
        .email-header { 
            background: #000001 !important;
            padding: 40px 30px !important; 
            text-align: center !important;
            border-bottom: 2px solid #d4af37 !important;
        }

        /* Logo */
        .logo-space { 
            width: 60px !important; 
            height: 60px !important; 
            background: linear-gradient(135deg, #d4af37 0%, #fbbf24 100%) !important;
            border-radius: 50% !important; 
            display: inline-block !important;
            text-align: center !important;
            line-height: 60px !important;
            margin: 0 auto 20px !important;
            box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4) !important;
        }

        .logo-placeholder { 
            font-size: 28px !important; 
            color: #000001 !important;
            font-weight: bold !important;
        }

        /* TÍTULOS COM CORES DOURADAS FORÇADAS */
        .brand-title { 
            font-size: 32px !important; 
            margin: 0 0 8px 0 !important; 
            font-weight: bold !important;
            color: #d4af37 !important;
            -webkit-text-fill-color: #d4af37 !important;
            letter-spacing: 1px !important;
        }

        .brand-subtitle { 
            font-size: 16px !important; 
            margin: 0 !important;
            color: #d4af37 !important;
            -webkit-text-fill-color: #d4af37 !important;
            font-style: italic !important;
        }

        /* Content Area */
        .email-content { 
            padding: 40px 30px !important; 
            background: #000001 !important;
        }

        /* Cards */
        .premium-card,
        .welcome-message,
        .feature-card,
        .composer-card,
        .security-note,
        .warning-box { 
            background: #1a1a1a !important; 
            border: 1px solid rgba(212, 175, 55, 0.3) !important; 
            padding: 25px !important; 
            margin: 25px 0 !important; 
            border-radius: 12px !important;
        }

        /* Features Grid */
        .features-grid {
            display: block !important;
            margin: 40px 0 !important;
        }

        .feature-card {
            margin: 20px 0 !important;
            background: #1a1a1a !important;
            padding: 25px !important;
            border-radius: 12px !important;
            text-align: center !important;
            border: 1px solid rgba(212, 175, 55, 0.2) !important;
        }

        .feature-icon { 
            font-size: 32px !important; 
            margin-bottom: 15px !important; 
            color: #d4af37 !important;
            -webkit-text-fill-color: #d4af37 !important;
        }

        .feature-title { 
            color: #fffffe !important; 
            -webkit-text-fill-color: #fffffe !important;
            font-weight: bold !important; 
            margin: 15px 0 10px 0 !important; 
            font-size: 18px !important;
        }

        .feature-desc { 
            color: #b0b0b0 !important; 
            -webkit-text-fill-color: #b0b0b0 !important;
            font-size: 14px !important; 
            line-height: 1.6 !important; 
        }

        /* Buttons */
        .btn-premium { 
            display: inline-block !important; 
            padding: 16px 32px !important; 
            background: #d4af37 !important; 
            color: #000001 !important; 
            -webkit-text-fill-color: #000001 !important;
            text-decoration: none !important; 
            border-radius: 8px !important; 
            margin: 20px 0 !important;
            font-weight: bold !important;
            font-size: 16px !important;
            text-transform: uppercase !important;
            letter-spacing: 1px !important;
        }

        .btn-secondary {
            background: #2a2a2a !important;
            color: #d4af37 !important;
            -webkit-text-fill-color: #d4af37 !important;
            border: 2px solid #d4af37 !important;
        }

        /* Footer */
        .email-footer { 
            background: #000001 !important; 
            padding: 40px 30px !important; 
            text-align: center !important; 
            font-size: 14px !important;
            border-top: 2px solid #d4af37 !important;
        }

        .email-footer h3 { 
            color: #d4af37 !important; 
            -webkit-text-fill-color: #d4af37 !important;
            margin: 0 0 15px 0 !important; 
            font-size: 24px !important;
            font-weight: bold !important;
        }

        .email-footer a { 
            color: #d4af37 !important; 
            -webkit-text-fill-color: #d4af37 !important;
            text-decoration: none !important; 
        }

        .footer-divider {
            width: 60px !important;
            height: 2px !important;
            background: #d4af37 !important;
            margin: 20px auto !important;
        }

        /* Classes utilitárias */
        .text-center { text-align: center !important; }
        .text-gold { 
            color: #d4af37 !important; 
            -webkit-text-fill-color: #d4af37 !important;
        }
        .text-muted { 
            color: #b0b0b0 !important;
            -webkit-text-fill-color: #b0b0b0 !important;
        }

        /* Media Queries para Dark Mode */
        @media (prefers-color-scheme: dark) {
            body {
                background: #000001 !important;
                color: #fffffe !important;
                -webkit-text-fill-color: #fffffe !important;
            }
            
            .email-container,
            .email-header,
            .email-content,
            .email-footer {
                background: #000001 !important;
            }
            
            .brand-title,
            .brand-subtitle,
            .text-gold,
            .email-footer h3,
            h1, h2, h3 {
                color: #d4af37 !important;
                -webkit-text-fill-color: #d4af37 !important;
            }
        }

        /* Responsive */
        @media only screen and (max-width: 600px) {
            .email-container { 
                margin: 0 !important; 
                width: 100% !important;
            }
            
            .email-header, 
            .email-content, 
            .email-footer { 
                padding: 20px !important; 
            }
            
            .brand-title { 
                font-size: 26px !important; 
            }
            
            .btn-premium {
                display: block !important;
                text-align: center !important;
                margin: 15px 0 !important;
            }
        }
    </style>
</head>
<body style="background: #000001 !important; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
    <div class="email-container" style="background: #000001 !important;">
        <!-- Header Premium -->
        <div class="email-header" style="background: #000001 !important;">
            <div class="logo-space" style="background: linear-gradient(135deg, #d4af37 0%, #fbbf24 100%) !important;">
                <span class="logo-placeholder" style="color: #000001 !important;">${
                  config.LOGO_PLACEHOLDER
                }</span>
            </div>
            
            <h1 class="brand-title" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${
              config.BRAND_NAME
            }</h1>
            <p class="brand-subtitle" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${
              config.TAGLINE
            }</p>
        </div>
        
        <!-- Content -->
        <div class="email-content" style="background: #000001 !important; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            ${content}
        </div>
        
        <!-- Footer Premium -->
        <div class="email-footer" style="background: #000001 !important; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${
              config.BRAND_NAME
            }</h3>
            <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">${
              config.DESCRIPTION
            }</p>
            
            <div class="footer-divider"></div>
            
            <p style="margin-top: 20px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
                {{#if unsubscribeUrl}}
                <a href="{{unsubscribeUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${
                  language === 'pt' ? 'Cancelar inscrição' : 'Unsubscribe'
                }</a>
                {{/if}}
                {{#if preferencesUrl}}
                | <a href="{{preferencesUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${
                  language === 'pt'
                    ? 'Gerenciar preferências'
                    : 'Manage preferences'
                }</a>
                {{/if}}
            </p>
            
            <p style="margin-top: 15px; font-size: 12px; color: #888 !important; -webkit-text-fill-color: #888 !important;">
                <a href="{{siteUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${config?.SITE_URL.replace(
                  'https://',
                  ''
                )}</a><br>
                ${config?.LOCATION} | <a href="mailto:${
    config.CONTACT_EMAIL
  }" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${
    config.CONTACT_EMAIL
  }</a>
            </p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Templates multi-linguagem COMPLETOS do Opus Atlas
 */
export const emailTemplates: Record<string, MultiLanguageEmailTemplate> = {
  WELCOME: {
    pt: {
      subject: `Bem-vindo(a) ao ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}, {{firstName}}!`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Bem-vindo(a), {{firstName}}!</h2>
        
        <p style="font-size: 18px; line-height: 1.8; margin-bottom: 25px; text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          É com grande alegria que recebemos você na comunidade <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}</strong>! 
          Agora você faz parte da melhor plataforma de música clássica.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; font-size: 22px; text-align: center;">
            Sua jornada musical começa agora!
          </h3>
          <div style="text-align: left; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">✨ Newsletter exclusiva com conteúdo premium</div>
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">🎵 Descobertas sobre compositores e obras clássicas</div>
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">📚 Recursos avançados de estudo musical</div>
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">🎹 Acesso a partituras premium e análises detalhadas</div>
          </div>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{siteUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">Explorar ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}</a>
        </div>
        
        <p style="margin-top: 30px; font-style: italic; text-align: center; color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">
          Prepare-se para uma experiência única no universo da música clássica.
        </p>
        
        <p style="margin-top: 30px; text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">Harmoniosamente,</strong><br>
          <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Equipe ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}</span>
        </p>
      `,
        'pt'
      ),
      textContent: `Bem-vindo(a) ao ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}, {{firstName}}!

É com grande alegria que recebemos você na comunidade ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}!

VOCÊ AGORA TEM ACESSO A:
- Newsletter exclusiva com conteúdo premium
- Descobertas sobre compositores e obras clássicas
- Recursos avançados de estudo musical
- Partituras premium e análises detalhadas

Visite: {{siteUrl}}

Harmoniosamente,
Equipe ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Para cancelar: {{unsubscribeUrl}}`,
      variables: ['firstName', 'siteUrl', 'unsubscribeUrl'],
      description: 'Email de boas-vindas para novos usuários',
    },
    en: {
      subject: `Welcome to ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}, {{firstName}}!`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Welcome, {{firstName}}!</h2>
        
        <p style="font-size: 18px; line-height: 1.8; margin-bottom: 25px; text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          We're thrilled to welcome you to the <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${OPUS_ATLAS_CONFIG.en.BRAND_NAME}</strong> community! 
          You're now part of the premier classical music platform.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; font-size: 22px; text-align: center;">
            Your musical journey begins now!
          </h3>
          <div style="text-align: left; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">✨ Exclusive newsletter with premium content</div>
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">🎵 Discoveries about composers and classical works</div>
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">📚 Advanced music study resources</div>
            <div style="margin-bottom: 12px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">🎹 Access to premium sheet music and detailed analyses</div>
          </div>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{siteUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">Explore ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}</a>
        </div>
        
        <p style="margin-top: 30px; font-style: italic; text-align: center; color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">
          Get ready for a unique experience in the world of classical music.
        </p>
        
        <p style="margin-top: 30px; text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">Harmoniously,</strong><br>
          <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">${OPUS_ATLAS_CONFIG.en.BRAND_NAME} Team</span>
        </p>
      `,
        'en'
      ),
      textContent: `Welcome to ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}, {{firstName}}!

We're thrilled to welcome you to the ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} community!

YOU NOW HAVE ACCESS TO:
- Exclusive newsletter with premium content
- Discoveries about composers and classical works
- Advanced music study resources
- Premium sheet music and detailed analyses

Visit: {{siteUrl}}

Harmoniously,
${OPUS_ATLAS_CONFIG.en.BRAND_NAME} Team

To unsubscribe: {{unsubscribeUrl}}`,
      variables: ['firstName', 'siteUrl', 'unsubscribeUrl'],
      description: 'Welcome email for new users',
    },
  },

  ACCOUNT_CONFIRMATION: {
    pt: {
      subject: `Confirme sua conta no ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">
          Olá {{firstName}}! 👋
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          Que alegria ter você conosco! Sua conta foi criada com sucesso, mas precisamos confirmar 
          seu email para garantir a segurança e liberar todas as funcionalidades.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🚀 Sua jornada começa agora!
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            Após confirmar sua conta, você terá acesso completo à nossa plataforma 
            de música clássica, com recursos exclusivos e conteúdo de alta qualidade.
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{confirmationUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">
            Confirmar Minha Conta
          </a>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">📚</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Biblioteca Completa</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Acesso completo a compositores, obras e análises exclusivas</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">🎵</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Partituras Premium</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Coleção curada de partituras em alta resolução</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">📝</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Ferramentas Avançadas</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Anotações, marcadores e listas personalizadas</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">🎓</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Análises Detalhadas</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Insights profundos sobre técnicas e estilos</div>
          </div>
        </div>
        
        <div class="security-note" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">🔒</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Segurança:</strong> Este link de confirmação é válido por 24 horas e pode ser usado apenas uma vez. 
            Se você não criou esta conta, pode ignorar este email com segurança.
          </p>
        </div>
        
        <p style="color: #888 !important; -webkit-text-fill-color: #888 !important; font-size: 14px; line-height: 1.6; margin-top: 40px; text-align: center;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          <a href="{{confirmationUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; word-break: break-all;">{{confirmationUrl}}</a>
        </p>
      `,
        'pt'
      ),
      textContent: `CONFIRME SUA CONTA - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Olá {{firstName}},

Que alegria ter você conosco! Sua conta foi criada com sucesso.

Para confirmar sua conta e liberar todas as funcionalidades, acesse:
{{confirmationUrl}}

APÓS CONFIRMAR VOCÊ TERÁ ACESSO A:
📚 Biblioteca Completa
🎵 Partituras Premium
📝 Ferramentas Avançadas de Estudo
🎓 Análises Musicais Detalhadas

SEGURANÇA: Este link é válido por 24 horas e pode ser usado apenas uma vez.

Se você não criou esta conta, pode ignorar este email com segurança.

${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} - ${OPUS_ATLAS_CONFIG.pt.DESCRIPTION}
${OPUS_ATLAS_CONFIG.pt.LOCATION}
${OPUS_ATLAS_CONFIG.pt.CONTACT_EMAIL}`,
      variables: ['firstName', 'confirmationUrl', 'unsubscribeUrl'],
      description: 'Email de confirmação para criação de conta',
    },
    en: {
      subject: `Confirm your ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} account`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">
          Hello {{firstName}}! 👋
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          We're excited to have you with us! Your account has been successfully created, but we need to confirm 
          your email to ensure security and unlock all features.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🚀 Your journey begins now!
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            After confirming your account, you'll have full access to our 
            classical music platform, with exclusive features and high-quality content.
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{confirmationUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">
            Confirm My Account
          </a>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">📚</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Complete Library</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Full access to composers, works and exclusive analyses</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">🎵</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Premium Sheet Music</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Curated collection of high-resolution sheet music</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">📝</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Advanced Tools</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Notes, bookmarks and personalized lists</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">🎓</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Detailed Analysis</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Deep insights into techniques and styles</div>
          </div>
        </div>
        
        <div class="security-note" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">🔒</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Security:</strong> This confirmation link is valid for 24 hours and can only be used once. 
            If you didn't create this account, you can safely ignore this email.
          </p>
        </div>
        
        <p style="color: #888 !important; -webkit-text-fill-color: #888 !important; font-size: 14px; line-height: 1.6; margin-top: 40px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{confirmationUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; word-break: break-all;">{{confirmationUrl}}</a>
        </p>
      `,
        'en'
      ),
      textContent: `CONFIRM YOUR ACCOUNT - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

We're excited to have you with us! Your account has been successfully created.

To confirm your account and unlock all features, visit:
{{confirmationUrl}}

AFTER CONFIRMING YOU'LL HAVE ACCESS TO:
📚 Complete Library
🎵 Premium Sheet Music
📝 Advanced Study Tools
🎓 Detailed Musical Analysis

SECURITY: This link is valid for 24 hours and can only be used once.

If you didn't create this account, you can safely ignore this email.

${OPUS_ATLAS_CONFIG.en.BRAND_NAME} - ${OPUS_ATLAS_CONFIG.en.DESCRIPTION}
${OPUS_ATLAS_CONFIG.en.LOCATION}
${OPUS_ATLAS_CONFIG.en.CONTACT_EMAIL}`,
      variables: ['firstName', 'confirmationUrl', 'unsubscribeUrl'],
      description: 'Account confirmation email',
    },
  },

  PASSWORD_RESET: {
    pt: {
      subject: `Redefinir senha - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; text-align: center;">
          Olá {{firstName}},
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin-bottom: 25px; text-align: center;">
          Recebemos uma solicitação para redefinir a senha da sua conta no ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; border: 1px solid rgba(212, 175, 55, 0.3) !important; padding: 25px !important; margin: 25px 0 !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
            📧 Detalhes da Solicitação
          </h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Email:</strong> {{email}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Data:</strong> {{requestDate}}
            </p>
          </div>
        </div>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin: 25px 0; text-align: center;">
          Se foi você quem solicitou esta mudança, clique no botão abaixo para criar uma nova senha:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{resetUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">
            🔑 Redefinir Senha
          </a>
        </div>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h4 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">💡 Dicas para uma Senha Segura:</h4>
          <div style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: left;">
            <div style="margin-bottom: 8px;">• Use pelo menos 8 caracteres</div>
            <div style="margin-bottom: 8px;">• Combine letras maiúsculas e minúsculas</div>
            <div style="margin-bottom: 8px;">• Inclua números e símbolos especiais</div>
            <div style="margin-bottom: 8px;">• Evite informações pessoais óbvias</div>
            <div>• Não reutilize senhas de outros sites</div>
          </div>
        </div>
        
        <div class="warning-box" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">⚠️</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Importante:</strong> Este link é válido por apenas 1 hora e pode ser usado uma única vez. 
            Se você não solicitou esta mudança, ignore este email e sua senha permanecerá inalterada.
          </p>
        </div>
        
        <p style="color: #888 !important; -webkit-text-fill-color: #888 !important; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
          Se o botão não funcionar, copie e cole este link no seu navegador:<br>
          <a href="{{resetUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; word-break: break-all;">{{resetUrl}}</a>
        </p>
        
        <p style="color: #888 !important; -webkit-text-fill-color: #888 !important; font-size: 14px; line-height: 1.6; margin-top: 20px; text-align: center;">
          Problemas com sua conta? Entre em contato conosco em 
          <a href="mailto:${OPUS_ATLAS_CONFIG.pt.SUPPORT_EMAIL}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${OPUS_ATLAS_CONFIG.pt.SUPPORT_EMAIL}</a>
        </p>
      `,
        'pt'
      ),
      textContent: `🔒 REDEFINIR SENHA - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

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

Problemas? Contate: ${OPUS_ATLAS_CONFIG.pt.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} - Sua segurança é nossa prioridade
${OPUS_ATLAS_CONFIG.pt.LOCATION}`,
      variables: ['firstName', 'email', 'resetUrl', 'requestDate'],
      description: 'Email para redefinição de senha',
    },
    en: {
      subject: `Reset password - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; text-align: center;">
          Hello {{firstName}},
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin-bottom: 25px; text-align: center;">
          We received a request to reset the password for your ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} account.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; border: 1px solid rgba(212, 175, 55, 0.3) !important; padding: 25px !important; margin: 25px 0 !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
            📧 Request Details
          </h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Email:</strong> {{email}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Date:</strong> {{requestDate}}
            </p>
          </div>
        </div>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin: 25px 0; text-align: center;">
          If you requested this change, click the button below to create a new password:
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{resetUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">
            🔑 Reset Password
          </a>
        </div>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h4 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">💡 Tips for a Secure Password:</h4>
          <div style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: left;">
            <div style="margin-bottom: 8px;">• Use at least 8 characters</div>
            <div style="margin-bottom: 8px;">• Combine uppercase and lowercase letters</div>
            <div style="margin-bottom: 8px;">• Include numbers and special symbols</div>
            <div style="margin-bottom: 8px;">• Avoid obvious personal information</div>
            <div>• Don't reuse passwords from other sites</div>
          </div>
        </div>
        
        <div class="warning-box" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">⚠️</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Important:</strong> This link is valid for only 1 hour and can be used once. 
            If you didn't request this change, ignore this email and your password will remain unchanged.
          </p>
        </div>
        
        <p style="color: #888 !important; -webkit-text-fill-color: #888 !important; font-size: 14px; line-height: 1.6; margin-top: 30px; text-align: center;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{resetUrl}}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; word-break: break-all;">{{resetUrl}}</a>
        </p>
        
        <p style="color: #888 !important; -webkit-text-fill-color: #888 !important; font-size: 14px; line-height: 1.6; margin-top: 20px; text-align: center;">
          Problems with your account? Contact us at 
          <a href="mailto:${OPUS_ATLAS_CONFIG.en.SUPPORT_EMAIL}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">${OPUS_ATLAS_CONFIG.en.SUPPORT_EMAIL}</a>
        </p>
      `,
        'en'
      ),
      textContent: `🔒 RESET PASSWORD - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

We received a request to reset your account password.

REQUEST DETAILS:
Email: {{email}}
Date: {{requestDate}}

To create a new password, visit:
{{resetUrl}}

SECURITY TIPS:
• Use at least 8 characters
• Combine letters, numbers and symbols
• Avoid personal information
• Don't reuse passwords

IMPORTANT: This link is valid for only 1 hour.

If you didn't request this change, ignore this email.

Problems? Contact: ${OPUS_ATLAS_CONFIG.en.SUPPORT_EMAIL}

${OPUS_ATLAS_CONFIG.en.BRAND_NAME} - Your security is our priority
${OPUS_ATLAS_CONFIG.en.LOCATION}`,
      variables: ['firstName', 'email', 'resetUrl', 'requestDate'],
      description: 'Password reset email',
    },
  },

  WEEKLY_DIGEST: {
    pt: {
      subject: `🎼 Digest Semanal - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Sua dose semanal de música</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Olá, {{firstName}}! Aqui estão as novidades desta semana no ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; text-align: center;">📊 Estatísticas da Semana</h3>
          <div style="text-align: center;">
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 28px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; display: block;">{{newComposers}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">Novos Compositores</span>
            </div>
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 28px; color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; display: block;">{{newWorks}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">Novas Obras</span>
            </div>
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 28px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; display: block;">{{newScores}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">Partituras</span>
            </div>
            <div>
              <strong style="font-size: 28px; color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; display: block;">{{activeUsers}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">Usuários Ativos</span>
            </div>
          </div>
        </div>
        
        {{#if featuredComposer}}
        <div class="composer-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">🎭 Compositor em Destaque</h3>
          <h4 style="margin-bottom: 10px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: center; font-size: 22px;">{{featuredComposer.name}}</h4>
          <p style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important; margin-bottom: 15px; text-align: center;">{{featuredComposer.period}}</p>
          <p style="margin-bottom: 20px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: center;">{{featuredComposer.description}}</p>
          <div style="text-align: center;">
            <a href="{{featuredComposer.url}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">Conhecer Compositor</a>
          </div>
        </div>
        {{/if}}
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{siteUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">Explorar Mais Conteúdo</a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important; font-style: italic;">
          Continue sua jornada musical com o ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}!
        </p>
      `,
        'pt'
      ),
      textContent: `Digest Semanal - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

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

Visite: {{siteUrl}}
Cancelar: {{unsubscribeUrl}}`,
      variables: [
        'firstName',
        'newComposers',
        'newWorks',
        'newScores',
        'activeUsers',
        'featuredComposer',
        'siteUrl',
        'unsubscribeUrl',
      ],
      description: 'Newsletter semanal com resumo de atividades',
    },
    en: {
      subject: `🎼 Weekly Digest - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Your weekly dose of music</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Hello, {{firstName}}! Here are this week's highlights from ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; text-align: center;">📊 Week's Statistics</h3>
          <div style="text-align: center;">
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 28px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; display: block;">{{newComposers}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">New Composers</span>
            </div>
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 28px; color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; display: block;">{{newWorks}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">New Works</span>
            </div>
            <div style="margin-bottom: 20px;">
              <strong style="font-size: 28px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; display: block;">{{newScores}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">Sheet Music</span>
            </div>
            <div>
              <strong style="font-size: 28px; color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; display: block;">{{activeUsers}}</strong>
              <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 14px;">Active Users</span>
            </div>
          </div>
        </div>
        
        {{#if featuredComposer}}
        <div class="composer-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">🎭 Featured Composer</h3>
          <h4 style="margin-bottom: 10px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: center; font-size: 22px;">{{featuredComposer.name}}</h4>
          <p style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important; margin-bottom: 15px; text-align: center;">{{featuredComposer.period}}</p>
          <p style="margin-bottom: 20px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: center;">{{featuredComposer.description}}</p>
          <div style="text-align: center;">
            <a href="{{featuredComposer.url}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">Discover Composer</a>
          </div>
        </div>
        {{/if}}
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{siteUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important; display: inline-block; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; text-transform: uppercase;">Explore More Content</a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important; font-style: italic;">
          Continue your musical journey with ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}!
        </p>
      `,
        'en'
      ),
      textContent: `Weekly Digest - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello, {{firstName}}!

WEEK'S STATISTICS:
- {{newComposers}} new composers
- {{newWorks}} new works
- {{newScores}} sheet music
- {{activeUsers}} active users

{{#if featuredComposer}}
FEATURED COMPOSER:
{{featuredComposer.name}} ({{featuredComposer.period}})
{{featuredComposer.description}}
Learn more: {{featuredComposer.url}}
{{/if}}

Visit: {{siteUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
      variables: [
        'firstName',
        'newComposers',
        'newWorks',
        'newScores',
        'activeUsers',
        'featuredComposer',
        'siteUrl',
        'unsubscribeUrl',
      ],
      description: 'Weekly newsletter with activity summary',
    },
  },

  UNSUBSCRIBE_CONFIRMATION: {
    pt: {
      subject: `Inscrição cancelada - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ff9a8b 0%, #a8edea 100%); border-radius: 50%; line-height: 80px; font-size: 32px; margin-bottom: 20px;">
            👋
          </div>
        </div>

        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Inscrição Cancelada</h2>

        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 18px; line-height: 1.8; margin-bottom: 25px; text-align: center;">
          Olá {{firstName}},
        </p>

        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
          Sua inscrição na newsletter do ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} foi <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">cancelada com sucesso</strong>. 
          Você não receberá mais nossos emails sobre música clássica.
        </p>

        <div style="background: #1a1a1a !important; border: 2px solid #d4af37; border-radius: 12px; padding: 30px; margin: 40px 0; box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; font-size: 22px; margin-bottom: 20px; margin-top: 0; text-align: center;">
            Mudou de ideia?
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
            Se cancelou por engano ou mudou de ideia, pode se reinscrever facilmente. 
            Estaremos sempre aqui para recebê-lo de volta!
          </p>
          
          <div style="text-align: center;">
            <a href="{{resubscribeUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
              Quero me reinscrever
            </a>
          </div>
        </div>

        <p style="margin-top: 40px; text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">Harmoniosamente,</strong><br>
          <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Equipe ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}</span>
        </p>
      `,
        'pt'
      ),
      textContent: `INSCRIÇÃO CANCELADA - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Olá {{firstName}},

Sua inscrição na newsletter do ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} foi cancelada com sucesso.

MUDOU DE IDEIA?
Se cancelou por engano, pode se reinscrever em: {{resubscribeUrl}}

Harmoniosamente,
Equipe ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      variables: ['firstName', 'resubscribeUrl'],
      description: 'Email de confirmação de cancelamento de inscrição',
    },
    en: {
      subject: `Subscription cancelled - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ff9a8b 0%, #a8edea 100%); border-radius: 50%; line-height: 80px; font-size: 32px; margin-bottom: 20px;">
            👋
          </div>
        </div>

        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Subscription Cancelled</h2>

        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 18px; line-height: 1.8; margin-bottom: 25px; text-align: center;">
          Hello {{firstName}},
        </p>

        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 16px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
          Your subscription to the ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} newsletter has been <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">successfully cancelled</strong>. 
          You will no longer receive our emails about classical music.
        </p>

        <div style="background: #1a1a1a !important; border: 2px solid #d4af37; border-radius: 12px; padding: 30px; margin: 40px 0; box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; font-size: 22px; margin-bottom: 20px; margin-top: 0; text-align: center;">
            Changed your mind?
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; font-size: 15px; line-height: 1.6; margin-bottom: 25px; text-align: center;">
            If you cancelled by mistake or changed your mind, you can easily resubscribe. 
            We'll always be here to welcome you back!
          </p>
          
          <div style="text-align: center;">
            <a href="{{resubscribeUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
              I want to resubscribe
            </a>
          </div>
        </div>

        <p style="margin-top: 40px; text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">Harmoniously,</strong><br>
          <span style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">${OPUS_ATLAS_CONFIG.en.BRAND_NAME} Team</span>
        </p>
      `,
        'en'
      ),
      textContent: `SUBSCRIPTION CANCELLED - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

Your subscription to the ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} newsletter has been successfully cancelled.

CHANGED YOUR MIND?
If you cancelled by mistake, you can resubscribe at: {{resubscribeUrl}}

Harmoniously,
${OPUS_ATLAS_CONFIG.en.BRAND_NAME} Team`,
      variables: ['firstName', 'resubscribeUrl'],
      description: 'Unsubscribe confirmation email',
    },
  },

  NEW_COMPOSER: {
    pt: {
      subject: `🎭 Novo compositor adicionado: {{composerName}} - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; text-align: center;">Novo compositor descoberto!</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Olá, {{firstName}}! Temos uma novidade emocionante para compartilhar com você.
        </p>
        
        <div class="composer-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center; font-size: 24px;">🎭 {{composerName}}</h3>
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin-bottom: 8px;"><strong>Período:</strong> {{composerPeriod}}</p>
            <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin-bottom: 20px;"><strong>Nacionalidade:</strong> {{composerNationality}}</p>
          </div>
          <p style="margin-bottom: 25px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: center; line-height: 1.7;">{{composerBio}}</p>
          
          <div class="text-center" style="margin-top: 30px;">
            <a href="{{composerUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">Explorar Compositor</a>
          </div>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">
          Continue explorando nosso catálogo e descobrindo novos compositores!
        </p>
      `,
        'pt'
      ),
      textContent: `🎭 NOVO COMPOSITOR DESCOBERTO!

Olá {{firstName}},

Acabamos de adicionar {{composerName}} à nossa coleção.

DETALHES:
Nome: {{composerName}}
Período: {{composerPeriod}}
Nacionalidade: {{composerNationality}}

{{composerBio}}

Explore: {{composerUrl}}
Cancelar: {{unsubscribeUrl}}`,
      variables: [
        'firstName',
        'composerName',
        'composerPeriod',
        'composerNationality',
        'composerBio',
        'composerUrl',
        'unsubscribeUrl',
      ],
      description: 'Notificação sobre novo compositor adicionado',
    },
    en: {
      subject: `🎭 New composer added: {{composerName}} - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; text-align: center;">New composer discovered!</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Hello, {{firstName}}! We have exciting news to share with you.
        </p>
        
        <div class="composer-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center; font-size: 24px;">🎭 {{composerName}}</h3>
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin-bottom: 8px;"><strong>Period:</strong> {{composerPeriod}}</p>
            <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin-bottom: 20px;"><strong>Nationality:</strong> {{composerNationality}}</p>
          </div>
          <p style="margin-bottom: 25px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; text-align: center; line-height: 1.7;">{{composerBio}}</p>
          
          <div class="text-center" style="margin-top: 30px;">
            <a href="{{composerUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">Explore Composer</a>
          </div>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">
          Continue exploring our catalog and discovering new composers!
        </p>
      `,
        'en'
      ),
      textContent: `🎭 NEW COMPOSER DISCOVERED!

Hello {{firstName}},

We just added {{composerName}} to our collection.

DETAILS:
Name: {{composerName}}
Period: {{composerPeriod}}
Nationality: {{composerNationality}}

{{composerBio}}

Explore: {{composerUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
      variables: [
        'firstName',
        'composerName',
        'composerPeriod',
        'composerNationality',
        'composerBio',
        'composerUrl',
        'unsubscribeUrl',
      ],
      description: 'Notification about new composer added',
    },
  },

  TEACHER_INVITATION: {
    pt: {
      subject: `🎓 Convite para ser Professor - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Você foi convidado para ser Professor!</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Olá, {{firstName}}! Temos uma oportunidade especial para você.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🎼 Convite para Ensinar no ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            Você foi selecionado para se tornar professor em nossa plataforma! 
            Agora pode compartilhar seu conhecimento musical e guiar alunos.
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">👨‍🎓</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Ensine Alunos</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Adicione e gerencie seus alunos</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">📅</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Agende Aulas</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Sistema completo de agendamento</div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{acceptUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
            ✅ Aceitar Convite
          </a>
          <br><br>
          <a href="{{declineUrl}}" class="btn-secondary" style="background: #2a2a2a !important; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">
            ❌ Recusar Convite
          </a>
        </div>
      `,
        'pt'
      ),
      textContent: `CONVITE PARA SER PROFESSOR - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Olá {{firstName}},

🎓 Você foi convidado para se tornar professor!

ACEITAR: {{acceptUrl}}
RECUSAR: {{declineUrl}}

${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} - Compartilhe seu conhecimento`,
      variables: ['firstName', 'acceptUrl', 'declineUrl'],
      description: 'Convite para usuário se tornar professor',
    },
    en: {
      subject: `🎓 Teacher Invitation - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">You're invited to become a Teacher!</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Hello, {{firstName}}! We have a special opportunity for you.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🎼 Invitation to Teach at ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            You've been selected to become a teacher on our platform! 
            Now you can share your musical knowledge and guide students.
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">👨‍🎓</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Teach Students</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Add and manage your students</div>
          </div>
          <div class="feature-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important; text-align: center;">
            <div class="feature-icon" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">📅</div>
            <div class="feature-title" style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Schedule Classes</div>
            <div class="feature-desc" style="color: #b0b0b0 !important; -webkit-text-fill-color: #b0b0b0 !important;">Complete scheduling system</div>
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{acceptUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
            ✅ Accept Invitation
          </a>
          <br><br>
          <a href="{{declineUrl}}" class="btn-secondary" style="background: #2a2a2a !important; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">
            ❌ Decline Invitation
          </a>
        </div>
      `,
        'en'
      ),
      textContent: `TEACHER INVITATION - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

🎓 You're invited to become a teacher!

ACCEPT: {{acceptUrl}}
DECLINE: {{declineUrl}}

${OPUS_ATLAS_CONFIG.en.BRAND_NAME} - Share your knowledge`,
      variables: ['firstName', 'acceptUrl', 'declineUrl'],
      description: 'Invitation for user to become teacher',
    },
  },

  STUDENT_INVITATION: {
    pt: {
      subject: `🎵 Você foi adicionado como aluno - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">Você tem um novo professor!</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Olá, {{firstName}}! {{teacherName}} adicionou você como aluno.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🎼 Sua Jornada Musical Começa Agora!
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            Você foi adicionado como aluno de <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">{{teacherName}}</strong> 
            no ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}.
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{acceptUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
            ✅ Aceitar Convite
          </a>
          <br><br>
          <a href="{{declineUrl}}" class="btn-secondary" style="background: #2a2a2a !important; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">
            ❌ Recusar Convite
          </a>
        </div>
      `,
        'pt'
      ),
      textContent: `VOCÊ FOI ADICIONADO COMO ALUNO - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Olá {{firstName}},

🎵 {{teacherName}} adicionou você como aluno!

ACEITAR: {{acceptUrl}}
RECUSAR: {{declineUrl}}

${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} - Sua jornada musical começa agora!`,
      variables: ['firstName', 'teacherName', 'acceptUrl', 'declineUrl'],
      description: 'Convite para usuário se tornar aluno',
    },
    en: {
      subject: `🎵 You've been added as a student - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <h2 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 25px; font-size: 28px; text-align: center;">You have a new teacher!</h2>
        
        <p style="font-size: 18px; text-align: center; margin-bottom: 30px; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
          Hello, {{firstName}}! {{teacherName}} has added you as a student.
        </p>
        
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🎼 Your Musical Journey Begins Now!
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            You've been added as a student of <strong style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">{{teacherName}}</strong> 
            on ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}.
          </p>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{acceptUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
            ✅ Accept Invitation
          </a>
          <br><br>
          <a href="{{declineUrl}}" class="btn-secondary" style="background: #2a2a2a !important; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">
            ❌ Decline Invitation
          </a>
        </div>
      `,
        'en'
      ),
      textContent: `YOU'VE BEEN ADDED AS A STUDENT - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

🎵 {{teacherName}} has added you as a student!

ACCEPT: {{acceptUrl}}
DECLINE: {{declineUrl}}

${OPUS_ATLAS_CONFIG.en.BRAND_NAME} - Your musical journey begins now!`,
      variables: ['firstName', 'teacherName', 'acceptUrl', 'declineUrl'],
      description: 'Invitation for user to become student',
    },
  },

  CAMPAIGN_CUSTOM: {
    pt: {
      subject: '{{customSubject}}',
      htmlContent: getPremiumOpusAtlasLayout(`{{customContent}}`, 'pt'),
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
    en: {
      subject: '{{customSubject}}',
      htmlContent: getPremiumOpusAtlasLayout(`{{customContent}}`, 'en'),
      textContent: `{{customTextContent}}

Visit: {{siteUrl}}
Unsubscribe: {{unsubscribeUrl}}`,
      variables: [
        'customSubject',
        'customContent',
        'customTextContent',
        'siteUrl',
        'unsubscribeUrl',
      ],
      description: 'Customizable template for specific campaigns',
    },
  },

  EMAIL_CHANGE_CONFIRMATION: {
    pt: {
      subject: `Confirme sua mudança de email - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">
          Olá {{firstName}}! 📧
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          Você solicitou a alteração do email da sua conta no ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            📧 Detalhes da Mudança
          </h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Email atual:</strong> {{oldEmail}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Novo email:</strong> {{newEmail}}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{confirmationUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
            ✅ Confirmar Mudança de Email
          </a>
        </div>
        
        <div class="warning-box" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">⚠️</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Importante:</strong> Este link é válido por 24 horas.
            Se não solicitou esta mudança, ignore este email.
          </p>
        </div>
      `,
        'pt'
      ),
      textContent: `CONFIRME SUA MUDANÇA DE EMAIL - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Olá {{firstName}},

Você solicitou a alteração do email da sua conta.

DETALHES:
Email atual: {{oldEmail}}
Novo email: {{newEmail}}

Para confirmar: {{confirmationUrl}}

IMPORTANTE: Link válido por 24 horas.`,
      variables: ['firstName', 'oldEmail', 'newEmail', 'confirmationUrl'],
      description: 'Email de confirmação para mudança de email',
    },
    en: {
      subject: `Confirm your email change - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">
          Hello {{firstName}}! 📧
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          You requested to change your email address for your ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} account.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            📧 Change Details
          </h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Current email:</strong> {{oldEmail}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>New email:</strong> {{newEmail}}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="{{confirmationUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">
            ✅ Confirm Email Change
          </a>
        </div>
        
        <div class="warning-box" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">⚠️</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Important:</strong> This link is valid for 24 hours.
            If you didn't request this change, ignore this email.
          </p>
        </div>
      `,
        'en'
      ),
      textContent: `CONFIRM YOUR EMAIL CHANGE - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

You requested to change your account email address.

DETAILS:
Current email: {{oldEmail}}
New email: {{newEmail}}

To confirm: {{confirmationUrl}}

IMPORTANT: Link valid for 24 hours.`,
      variables: ['firstName', 'oldEmail', 'newEmail', 'confirmationUrl'],
      description: 'Email change confirmation email',
    },
  },

  EMAIL_CHANGE_SUCCESS: {
    pt: {
      subject: `Email alterado com sucesso - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🎉 Email alterado com sucesso!
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            Seu email foi alterado com sucesso e sua conta está totalmente funcional.
          </p>
        </div>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">📧 Resumo</h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Email anterior:</strong> {{oldEmail}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Novo email:</strong> {{newEmail}}
            </p>
          </div>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{siteUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">Acessar Minha Conta</a>
        </div>
      `,
        'pt'
      ),
      textContent: `EMAIL ALTERADO COM SUCESSO - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Olá {{firstName}},

✅ Seu email foi alterado com sucesso!

RESUMO:
Email anterior: {{oldEmail}}
Novo email: {{newEmail}}

Acesse: {{siteUrl}}`,
      variables: ['firstName', 'oldEmail', 'newEmail', 'siteUrl'],
      description: 'Email de confirmação após mudança bem-sucedida',
    },
    en: {
      subject: `Email changed successfully - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <div class="welcome-message" style="background: #1a1a1a !important; padding: 30px !important; border: 2px solid #d4af37 !important; margin: 30px 0 !important; border-radius: 16px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; font-size: 22px; text-align: center;">
            🎉 Email changed successfully!
          </h3>
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0; line-height: 1.7; text-align: center;">
            Your email has been successfully changed and your account is fully functional.
          </p>
        </div>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">📧 Summary</h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Previous email:</strong> {{oldEmail}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>New email:</strong> {{newEmail}}
            </p>
          </div>
        </div>
        
        <div class="text-center" style="margin: 40px 0;">
          <a href="{{siteUrl}}" class="btn-premium" style="background: #d4af37 !important; color: #000001 !important; -webkit-text-fill-color: #000001 !important;">Access My Account</a>
        </div>
      `,
        'en'
      ),
      textContent: `EMAIL CHANGED SUCCESSFULLY - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Hello {{firstName}},

✅ Your email has been successfully changed!

SUMMARY:
Previous email: {{oldEmail}}
New email: {{newEmail}}

Access: {{siteUrl}}`,
      variables: ['firstName', 'oldEmail', 'newEmail', 'siteUrl'],
      description: 'Email confirmation after successful change',
    },
  },

  EMAIL_CHANGED_NOTIFICATION: {
    pt: {
      subject: `Seu email foi alterado - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          Este é um aviso de que o email da sua conta ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} foi alterado.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">📧 Detalhes</h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Email anterior:</strong> {{oldEmail}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Novo email:</strong> {{newEmail}}
            </p>
          </div>
        </div>
        
        <div class="warning-box" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">🔒</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Não foi você?</strong><br>
            Se não solicitou esta mudança, entre em contato conosco em 
            <a href="mailto:${OPUS_ATLAS_CONFIG.pt.SUPPORT_EMAIL}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">
              ${OPUS_ATLAS_CONFIG.pt.SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      `,
        'pt'
      ),
      textContent: `EMAIL ALTERADO - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Este é um aviso de que o email da sua conta foi alterado.

DETALHES:
Email anterior: {{oldEmail}}
Novo email: {{newEmail}}

NÃO FOI VOCÊ? Contate: ${OPUS_ATLAS_CONFIG.pt.SUPPORT_EMAIL}`,
      variables: ['oldEmail', 'newEmail'],
      description: 'Notificação para o email antigo sobre mudança',
    },
    en: {
      subject: `Your email has been changed - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          This is a notification that your ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} account email has been changed.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">📧 Details</h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Previous email:</strong> {{oldEmail}}
            </p>
            <p style="margin: 0 0 10px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>New email:</strong> {{newEmail}}
            </p>
          </div>
        </div>
        
        <div class="warning-box" style="background: #2a1810 !important; border: 1px solid #d4af37 !important; padding: 20px !important; border-radius: 12px !important; margin: 30px 0 !important;">
          <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; margin: 0;">
            <span style="color: #fbbf24 !important; -webkit-text-fill-color: #fbbf24 !important; font-size: 18px;">🔒</span>
            <strong style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">Wasn't you?</strong><br>
            If you didn't request this change, contact us at 
            <a href="mailto:${OPUS_ATLAS_CONFIG.en.SUPPORT_EMAIL}" style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important;">
              ${OPUS_ATLAS_CONFIG.en.SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      `,
        'en'
      ),
      textContent: `EMAIL CHANGED - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

This is a notification that your account email has been changed.

DETAILS:
Previous email: {{oldEmail}}
New email: {{newEmail}}

WASN'T YOU? Contact: ${OPUS_ATLAS_CONFIG.en.SUPPORT_EMAIL}`,
      variables: ['oldEmail', 'newEmail'],
      description: 'Notification to old email about change',
    },
  },

  ACCOUNT_FAREWELL: {
    pt: {
      subject: `Sentiremos sua falta - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">
          Adeus, {{firstName}} 💔
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          Sua conta ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME} foi excluída conforme solicitado. 
          Sentiremos muito sua falta.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">📊 Sua Jornada</h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 15px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Tempo conosco:</strong> {{accountAge}} dias
            </p>
            <p style="margin: 0 0 15px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Compositores adicionados:</strong> {{composersCount}}
            </p>
          </div>
        </div>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin: 25px 0; text-align: center;">
          Obrigado por fazer parte da nossa comunidade.
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin: 30px 0; text-align: center; font-style: italic;">
          "A música é a revelação mais alta que toda filosofia" - Beethoven
        </p>
      `,
        'pt'
      ),
      textContent: `SENTIREMOS SUA FALTA - ${OPUS_ATLAS_CONFIG.pt.BRAND_NAME}

Adeus, {{firstName}}

Sua conta foi excluída conforme solicitado.

SUA JORNADA:
- Tempo conosco: {{accountAge}} dias
- Compositores adicionados: {{composersCount}}

"A música é a revelação mais alta que toda filosofia" - Beethoven

Obrigado por tudo.`,
      variables: ['firstName', 'accountAge', 'composersCount'],
      description: 'Email de despedida após exclusão da conta',
    },
    en: {
      subject: `We'll miss you - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}`,
      htmlContent: getPremiumOpusAtlasLayout(
        `
        <p style="font-size: 20px; color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin-bottom: 20px; text-align: center;">
          Goodbye, {{firstName}} 💔
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.8; font-size: 16px; margin-bottom: 30px; text-align: center;">
          Your ${OPUS_ATLAS_CONFIG.en.BRAND_NAME} account has been deleted as requested. 
          We'll really miss you.
        </p>
        
        <div class="premium-card" style="background: #1a1a1a !important; padding: 25px !important; border-radius: 12px !important;">
          <h3 style="color: #d4af37 !important; -webkit-text-fill-color: #d4af37 !important; margin: 0 0 20px 0; text-align: center;">📊 Your Journey</h3>
          <div style="text-align: center; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
            <p style="margin: 0 0 15px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Time with us:</strong> {{accountAge}} days
            </p>
            <p style="margin: 0 0 15px 0; color: #fffffe !important; -webkit-text-fill-color: #fffffe !important;">
              <strong>Composers added:</strong> {{composersCount}}
            </p>
          </div>
        </div>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin: 25px 0; text-align: center;">
          Thank you for being part of our community.
        </p>
        
        <p style="color: #fffffe !important; -webkit-text-fill-color: #fffffe !important; line-height: 1.7; margin: 30px 0; text-align: center; font-style: italic;">
          "Music is the highest revelation of philosophy" - Beethoven
        </p>
      `,
        'en'
      ),
      textContent: `WE'LL MISS YOU - ${OPUS_ATLAS_CONFIG.en.BRAND_NAME}

Goodbye, {{firstName}}

Your account has been deleted as requested.

YOUR JOURNEY:
- Time with us: {{accountAge}} days
- Composers added: {{composersCount}}

"Music is the highest revelation of philosophy" - Beethoven

Thank you for everything.`,
      variables: ['firstName', 'accountAge', 'composersCount'],
      description: 'Farewell email after account deletion',
    },
  },
};

/**
 * FUNÇÕES CLIENT-SAFE (mantendo todas as funcionalidades)
 */

export function getEmailTemplateSync(
  type: string,
  language: Language
): EmailTemplate | null {
  const templates = emailTemplates[type];
  if (!templates) return null;
  return templates[language] || templates.pt || null;
}

export function getAllEmailTemplates(language: Language = 'pt'): Array<{
  type: string;
  template: EmailTemplate;
}> {
  return Object.entries(emailTemplates).map(([type, templates]) => ({
    type,
    template: templates[language] || templates.pt,
  }));
}

export function validateTemplateVariablesSync(
  templateType: string,
  variables: Record<string, any>,
  language: Language = 'pt'
): { valid: boolean; missing: string[] } {
  const template = getEmailTemplateSync(templateType, language);
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

export function previewTemplateSync(
  templateType: string,
  language: Language = 'pt'
): { html: string; text: string; subject: string } | null {
  const template = getEmailTemplateSync(templateType, language);
  if (!template) return null;

  const config = OPUS_ATLAS_CONFIG[language];
  const sampleData: Record<string, any> = {
    firstName: language === 'pt' ? 'João' : 'John',
    email: language === 'pt' ? 'joao@exemplo.com' : 'john@example.com',
    siteUrl: config.SITE_URL,
    unsubscribeUrl: `${config?.SITE_URL}/unsubscribe?token=sample`,
    preferencesUrl: `${config?.SITE_URL}/preferences?token=sample`,
    confirmationUrl: `${config?.SITE_URL}/confirm?token=sample`,
    resetUrl: `${config?.SITE_URL}/reset?token=sample`,
    requestDate: new Date().toLocaleDateString(
      language === 'pt' ? 'pt-BR' : 'en-US'
    ),
    newComposers: 5,
    newWorks: 12,
    newScores: 8,
    activeUsers: 150,
    teacherName: language === 'pt' ? 'Prof. Silva' : 'Prof. Johnson',
    composerName: language === 'pt' ? 'Villa-Lobos' : 'Bach',
    composerPeriod: language === 'pt' ? 'Século XX' : '18th Century',
    composerNationality: language === 'pt' ? 'Brasileiro' : 'German',
    composerBio:
      language === 'pt'
        ? 'Um dos maiores compositores brasileiros.'
        : 'One of the greatest German composers.',
    composerUrl: `${config?.SITE_URL}/composer/sample`,
    oldEmail: 'old@example.com',
    newEmail: 'new@example.com',
    acceptUrl: `${config?.SITE_URL}/accept?token=sample`,
    declineUrl: `${config?.SITE_URL}/decline?token=sample`,
    resubscribeUrl: `${config?.SITE_URL}/resubscribe?token=sample`,
    accountAge: 365,
    composersCount: 50,
    customSubject:
      language === 'pt' ? 'Assunto Personalizado' : 'Custom Subject',
    customContent:
      language === 'pt'
        ? '<p>Conteúdo personalizado da campanha.</p>'
        : '<p>Custom campaign content.</p>',
    customTextContent:
      language === 'pt'
        ? 'Conteúdo personalizado da campanha.'
        : 'Custom campaign content.',
  };

  return {
    html: processTemplate(template.htmlContent, sampleData),
    text: processTemplate(template.textContent, sampleData),
    subject: processTemplate(template.subject, sampleData),
  };
}

export function processEmailTemplateSync(
  templateType: string,
  variables: Record<string, any>,
  language: Language = 'pt'
): {
  html: string;
  text: string;
  subject: string;
  language: Language;
} | null {
  const template = getEmailTemplateSync(templateType, language);
  if (!template) return null;

  const config = OPUS_ATLAS_CONFIG[language];
  const systemVariables = {
    siteUrl: config.SITE_URL,
    contactEmail: config.CONTACT_EMAIL,
    supportEmail: config.SUPPORT_EMAIL,
    brandName: config.BRAND_NAME,
    ...variables,
  };

  return {
    html: processTemplate(template.htmlContent, systemVariables),
    text: processTemplate(template.textContent, systemVariables),
    subject: processTemplate(template.subject, systemVariables),
    language,
  };
}

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

export const EMAIL_TEMPLATE_TYPES = [
  'WELCOME',
  'ACCOUNT_CONFIRMATION',
  'PASSWORD_RESET',
  'WEEKLY_DIGEST',
  'UNSUBSCRIBE_CONFIRMATION',
  'NEW_COMPOSER',
  'TEACHER_INVITATION',
  'STUDENT_INVITATION',
  'CAMPAIGN_CUSTOM',
  'EMAIL_CHANGE_CONFIRMATION',
  'EMAIL_CHANGE_SUCCESS',
  'EMAIL_CHANGED_NOTIFICATION',
  'ACCOUNT_FAREWELL',
] as const;

export type EmailTemplateType = (typeof EMAIL_TEMPLATE_TYPES)[number];

export function getOpusAtlasConfig(language: Language = 'pt') {
  return { ...OPUS_ATLAS_CONFIG[language] };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateEmailToken(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
