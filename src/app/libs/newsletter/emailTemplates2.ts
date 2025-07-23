// app/libs/emailTemplates.ts

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
 * Obter layout base para emails
 */
function getBaseLayout(
  content: string,
  variables: Record<string, any>
): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{subject}}</title>
    <style>
        /* Reset styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { 
            font-size: 28px; 
            margin-bottom: 10px; 
            font-weight: 300;
        }
        .content { 
            padding: 40px 30px; 
        }
        .footer { 
            background-color: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666;
            border-top: 1px solid #eee;
        }
        .btn { 
            display: inline-block; 
            padding: 12px 24px; 
            background-color: #667eea; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 10px 0;
            font-weight: 500;
        }
        .btn:hover { background-color: #5a6fd8; }
        .card { 
            background: #f8f9fa; 
            border-left: 4px solid #667eea; 
            padding: 20px; 
            margin: 20px 0; 
            border-radius: 6px;
        }
        .text-center { text-align: center; }
        .text-muted { color: #666; }
        .mb-2 { margin-bottom: 16px; }
        .mb-3 { margin-bottom: 24px; }
        .composer-card {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
            background: #fff;
        }
        .work-item {
            padding: 15px;
            border-bottom: 1px solid #f0f0f0;
        }
        .work-item:last-child {
            border-bottom: none;
        }
        @media only screen and (max-width: 600px) {
            .container { margin: 0; }
            .header, .content, .footer { padding: 20px; }
            .header h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎼 Classical Hub</h1>
            <p>Descobrindo a beleza da música clássica</p>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p><strong>Classical Hub</strong></p>
            <p>Sua plataforma de estudos de música clássica</p>
            <p style="margin-top: 20px;">
                {{#if unsubscribeUrl}}
                <a href="{{unsubscribeUrl}}" style="color: #666; text-decoration: none;">
                    Cancelar inscrição
                </a>
                {{/if}}
            </p>
            <p style="margin-top: 10px; font-size: 12px;">
                <a href="{{siteUrl}}" style="color: #667eea;">Visitar Classical Hub</a>
            </p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Templates de email disponíveis
 */
export const emailTemplates: Record<string, EmailTemplate> = {
  WELCOME: {
    subject: 'Bem-vindo(a) ao Classical Hub, {{firstName}}! 🎼',
    htmlContent: getBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Bem-vindo(a), {{firstName}}!</h2>
      
      <p>É com grande alegria que recebemos você na comunidade Classical Hub! Agora você faz parte de uma plataforma dedicada aos amantes da música clássica.</p>
      
      <div class="card">
        <h3 style="color: #667eea; margin-bottom: 15px;">O que você pode esperar:</h3>
        <ul style="margin-left: 20px;">
          <li>📧 Newsletter semanal com novidades e conteúdo exclusivo</li>
          <li>🎵 Descobertas sobre compositores e obras clássicas</li>
          <li>📚 Dicas de estudo e prática musical</li>
          <li>🎹 Partituras e recursos para músicos</li>
        </ul>
      </div>
      
      <div class="text-center" style="margin: 30px 0;">
        <a href="{{siteUrl}}" class="btn">Explorar Classical Hub</a>
      </div>
      
      <p>Fique atento(a) à sua caixa de entrada - em breve você receberá conteúdos incríveis sobre o fascinante mundo da música clássica!</p>
      
      <p style="margin-top: 30px;">
        <strong>Harmoniosamente,</strong><br>
        Equipe Classical Hub
      </p>
    `,
      {}
    ),
    textContent: `Bem-vindo(a) ao Classical Hub, {{firstName}}!

É com grande alegria que recebemos você na comunidade Classical Hub!

O que você pode esperar:
- Newsletter semanal com novidades
- Descobertas sobre compositores e obras
- Dicas de estudo e prática musical
- Partituras e recursos para músicos

Visite: {{siteUrl}}

Harmoniosamente,
Equipe Classical Hub

Para cancelar: {{unsubscribeUrl}}`,
    variables: ['firstName', 'siteUrl', 'unsubscribeUrl'],
    description: 'Email de boas-vindas para novos subscribers',
  },

  WEEKLY_DIGEST: {
    subject: '🎼 Digest Semanal - Novas descobertas em Classical Hub',
    htmlContent: getBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Sua dose semanal de música clássica</h2>
      
      <p>Olá, {{firstName}}! Aqui está o resumo das novidades desta semana no Classical Hub.</p>
      
      <div class="card">
        <h3 style="color: #667eea; margin-bottom: 15px;">📊 Estatísticas da Semana</h3>
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap;">
          <div style="margin: 10px; text-align: center;">
            <strong style="font-size: 24px; color: #667eea;">{{newComposers}}</strong>
            <br><span style="color: #666;">Novos Compositores</span>
          </div>
          <div style="margin: 10px; text-align: center;">
            <strong style="font-size: 24px; color: #28a745;">{{newWorks}}</strong>
            <br><span style="color: #666;">Novas Obras</span>
          </div>
          <div style="margin: 10px; text-align: center;">
            <strong style="font-size: 24px; color: #ffc107;">{{newScores}}</strong>
            <br><span style="color: #666;">Partituras Adicionadas</span>
          </div>
          <div style="margin: 10px; text-align: center;">
            <strong style="font-size: 24px; color: #17a2b8;">{{activeUsers}}</strong>
            <br><span style="color: #666;">Usuários Ativos</span>
          </div>
        </div>
      </div>
      
      {{#if featuredComposer}}
      <div class="composer-card">
        <h3 style="color: #667eea; margin-bottom: 15px;">🎭 Compositor em Destaque</h3>
        <h4 style="margin-bottom: 10px;">{{featuredComposer.name}}</h4>
        <p style="color: #666; margin-bottom: 10px;">{{featuredComposer.period}}</p>
        <p style="margin-bottom: 15px;">{{featuredComposer.description}}</p>
        <a href="{{featuredComposer.url}}" class="btn">Conhecer Compositor</a>
      </div>
      {{/if}}
      
      {{#if popularWorks}}
      <h3 style="color: #333; margin: 30px 0 20px 0;">🎵 Obras Populares da Semana</h3>
      {{#each popularWorks}}
      <div class="work-item">
        <h4 style="margin-bottom: 5px;">{{title}}</h4>
        <p style="color: #667eea; margin-bottom: 5px;">{{composer}} - {{instrument}}</p>
        <p style="color: #666; margin-bottom: 10px;">{{description}}</p>
        <a href="{{url}}" style="color: #667eea; text-decoration: none;">Estudar obra →</a>
      </div>
      {{/each}}
      {{/if}}
      
      {{#if studyTip}}
      <div class="card">
        <h3 style="color: #667eea; margin-bottom: 15px;">💡 Dica de Estudo da Semana</h3>
        <h4 style="margin-bottom: 10px;">{{studyTip.title}}</h4>
        <p>{{studyTip.content}}</p>
      </div>
      {{/if}}
      
      <div class="text-center" style="margin: 30px 0;">
        <a href="{{siteUrl}}" class="btn">Explorar Mais Conteúdo</a>
      </div>
      
      <p style="margin-top: 30px; text-align: center; color: #666;">
        Continue praticando e descobrindo a magia da música clássica!
      </p>
    `,
      {}
    ),
    textContent: `Digest Semanal - Classical Hub

Olá, {{firstName}}!

ESTATÍSTICAS DA SEMANA:
- {{newComposers}} novos compositores
- {{newWorks}} novas obras
- {{newScores}} partituras adicionadas
- {{activeUsers}} usuários ativos

{{#if featuredComposer}}
COMPOSITOR EM DESTAQUE:
{{featuredComposer.name}} ({{featuredComposer.period}})
{{featuredComposer.description}}
Saiba mais: {{featuredComposer.url}}
{{/if}}

{{#if studyTip}}
DICA DE ESTUDO:
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
    subject: '🎭 Novo compositor adicionado: {{composerName}}',
    htmlContent: getBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Novo compositor descoberto!</h2>
      
      <p>Olá, {{firstName}}! Temos uma novidade emocionante para compartilhar com você.</p>
      
      <div class="composer-card">
        <h3 style="color: #667eea; margin-bottom: 15px;">🎭 {{composerName}}</h3>
        <p style="color: #666; margin-bottom: 10px;"><strong>Período:</strong> {{composerPeriod}}</p>
        <p style="color: #666; margin-bottom: 15px;"><strong>Nacionalidade:</strong> {{composerNationality}}</p>
        <p style="margin-bottom: 20px;">{{composerBio}}</p>
        
        {{#if works}}
        <h4 style="color: #333; margin-bottom: 15px;">Principais Obras:</h4>
        {{#each works}}
        <div style="margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
          <strong>{{title}}</strong> - {{instrument}}
          {{#if year}}<span style="color: #666;">({{year}})</span>{{/if}}
        </div>
        {{/each}}
        {{/if}}
        
        <div class="text-center" style="margin-top: 20px;">
          <a href="{{composerUrl}}" class="btn">Explorar Compositor</a>
        </div>
      </div>
      
      <div class="card">
        <h3 style="color: #667eea; margin-bottom: 15px;">🎵 Curiosidade Musical</h3>
        <p>{{musicalFact}}</p>
      </div>
      
      <p style="margin-top: 30px;">
        Continue explorando nosso catálogo e descobrindo novos compositores que enriquecerão sua jornada musical!
      </p>
    `,
      {}
    ),
    textContent: `Novo compositor: {{composerName}}

Olá, {{firstName}}!

NOVO COMPOSITOR ADICIONADO:
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
Cancelar: {{unsubscribeUrl}}`,
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

  CONFIRMATION: {
    subject: 'Confirme sua inscrição na newsletter do Classical Hub',
    htmlContent: getBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Confirme sua inscrição</h2>
      
      <p>Olá! Obrigado pelo interesse em receber nossa newsletter.</p>
      
      <p>Para completar sua inscrição e começar a receber conteúdo exclusivo sobre música clássica, clique no botão abaixo:</p>
      
      <div class="text-center" style="margin: 30px 0;">
        <a href="{{confirmationUrl}}" class="btn" style="background-color: #28a745;">
          Confirmar Inscrição
        </a>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #856404;">
          <strong>Importante:</strong> Este link expira em 24 horas. Se você não clicou no link, pode ignorar este email.
        </p>
      </div>
      
      <p>Se você não se inscreveu em nossa newsletter, pode ignorar este email com segurança.</p>
      
      <p style="margin-top: 30px;">
        <strong>Atenciosamente,</strong><br>
        Equipe Classical Hub
      </p>
    `,
      {}
    ),
    textContent: `Confirme sua inscrição - Classical Hub

Olá! Obrigado pelo interesse em nossa newsletter.

Para completar sua inscrição, acesse:
{{confirmationUrl}}

Este link expira em 24 horas.

Se você não se inscreveu, ignore este email.

Atenciosamente,
Equipe Classical Hub`,
    variables: ['confirmationUrl'],
    description: 'Email de confirmação para double opt-in',
  },

  PASSWORD_RESET: {
    subject: 'Redefinição de senha - Classical Hub',
    htmlContent: getBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Redefinir sua senha</h2>
      
      <p>Olá, {{firstName}}!</p>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no Classical Hub.</p>
      
      <p>Se você fez esta solicitação, clique no botão abaixo para criar uma nova senha:</p>
      
      <div class="text-center" style="margin: 30px 0;">
        <a href="{{resetUrl}}" class="btn" style="background-color: #dc3545;">
          Redefinir Senha
        </a>
      </div>
      
      <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0; color: #721c24;">
          <strong>Segurança:</strong> Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.
        </p>
      </div>
      
      <p>Se você não solicitou a redefinição de senha, sua conta permanece segura e você pode ignorar este email.</p>
      
      <p style="margin-top: 30px;">
        <strong>Atenciosamente,</strong><br>
        Equipe Classical Hub
      </p>
    `,
      {}
    ),
    textContent: `Redefinição de senha - Classical Hub

Olá, {{firstName}}!

Recebemos uma solicitação para redefinir sua senha.

Para redefinir, acesse:
{{resetUrl}}

Este link expira em 1 hora.

Se você não fez esta solicitação, ignore este email.

Atenciosamente,
Equipe Classical Hub`,
    variables: ['firstName', 'resetUrl'],
    description: 'Email para redefinição de senha',
  },

  CAMPAIGN_CUSTOM: {
    subject: '{{customSubject}}',
    htmlContent: getBaseLayout(`{{customContent}}`, {}),
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
    siteUrl: 'https://classicalhub.com',
    unsubscribeUrl: 'https://classicalhub.com/unsubscribe?token=sample',
    confirmationUrl: 'https://classicalhub.com/confirm?token=sample',
    resetUrl: 'https://classicalhub.com/reset?token=sample',
    newComposers: 5,
    newWorks: 12,
    newScores: 8,
    activeUsers: 150,
    featuredComposer: {
      name: 'Ludwig van Beethoven',
      period: '1770-1827',
      description: 'Compositor alemão considerado um dos maiores da história.',
      url: 'https://classicalhub.com/composers/beethoven',
    },
    popularWorks: [
      {
        title: 'Sonata ao Luar',
        composer: 'Beethoven',
        instrument: 'Piano',
        description: 'Uma das sonatas mais conhecidas para piano.',
        url: 'https://classicalhub.com/works/moonlight-sonata',
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
    composerUrl: 'https://classicalhub.com/composers/mozart',
    musicalFact: 'Mozart compôs mais de 600 obras durante sua curta vida.',
    customSubject: 'Assunto Personalizado',
    customContent:
      '<h3>Conteúdo personalizado da campanha</h3><p>Este é um exemplo de conteúdo customizado.</p>',
    customTextContent: 'Conteúdo personalizado da campanha em texto simples.',
  };

  return {
    html: processTemplate(template.htmlContent, sampleData),
    text: processTemplate(template.textContent, sampleData),
    subject: processTemplate(template.subject, sampleData),
  };
}
