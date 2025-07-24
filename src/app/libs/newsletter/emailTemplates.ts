// app/libs/emailTemplates.ts - VERSÃO UNIFICADA

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
 * Obter layout base para emails (versão moderna)
 */
function getModernBaseLayout(
  content: string,
  headerGradient: string = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  headerIcon: string = '🎼'
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
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .header { 
            background: ${headerGradient};
            color: white; 
            padding: 40px 30px; 
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="20">🎵</text></svg>') repeat;
            opacity: 0.1;
        }
        .header-content { position: relative; z-index: 1; }
        .header-icon { font-size: 48px; margin-bottom: 15px; }
        .header h1 { 
            font-size: 32px; 
            margin-bottom: 10px; 
            font-weight: bold;
        }
        .header p { 
            font-size: 16px; 
            margin: 0;
            opacity: 0.9;
        }
        .content { 
            padding: 40px 30px; 
        }
        .footer { 
            background-color: #1f2937; 
            color: #d1d5db; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px;
        }
        .footer h3 { color: white; margin: 0 0 15px 0; }
        .footer a { color: #60a5fa; text-decoration: none; }
        .footer a:hover { color: #93c5fd; }
        .btn { 
            display: inline-block; 
            padding: 16px 32px; 
            background: ${headerGradient}; 
            color: white; 
            text-decoration: none; 
            border-radius: 8px; 
            margin: 20px 0;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
            transition: all 0.3s ease;
        }
        .btn:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); 
        }
        .card { 
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); 
            border-left: 4px solid #3b82f6; 
            padding: 25px; 
            margin: 25px 0; 
            border-radius: 8px;
        }
        .welcome-message {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            padding: 30px;
            border-radius: 16px;
            border-left: 5px solid #3b82f6;
            margin: 30px 0;
        }
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .feature-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            border: 1px solid #e2e8f0;
        }
        .feature-icon { font-size: 32px; margin-bottom: 10px; }
        .feature-title { color: #1f2937; font-weight: bold; margin: 10px 0 5px 0; }
        .feature-desc { color: #6b7280; font-size: 14px; line-height: 1.5; }
        .security-note, .warning-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
        }
        .security-icon, .warning-icon { font-size: 24px; margin-right: 12px; color: #d97706; }
        .security-text, .warning-text { color: #92400e; line-height: 1.6; }
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
            .header h1 { font-size: 28px; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="header-icon">${headerIcon}</div>
                <h1>🎼 Classical Hub</h1>
                <p>Descobrindo a beleza da música clássica</p>
            </div>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <h3>Opus Atlas</h3>
            <p>A maior plataforma de música clássica do Brasil</p>
            <p style="margin-top: 20px;">
                {{#if unsubscribeUrl}}
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a>
                {{/if}}
                {{#if preferencesUrl}}
                | <a href="{{preferencesUrl}}">Gerenciar preferências</a>
                {{/if}}
            </p>
            <p style="margin-top: 10px; font-size: 12px;">
                <a href="{{siteUrl}}">Visitar Classical Hub</a><br>
                São Paulo, Brasil | <a href="mailto:contato@classicalhub.com">contato@classicalhub.com</a>
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
    htmlContent: getModernBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Bem-vindo(a), {{firstName}}!</h2>
      
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">É com grande alegria que recebemos você na comunidade Classical Hub! Agora você faz parte de uma plataforma dedicada aos amantes da música clássica.</p>
      
      <div class="welcome-message">
        <h3 style="color: #1e40af; margin-bottom: 15px;">O que você pode esperar:</h3>
        <ul style="margin-left: 20px; color: #3730a3;">
          <li style="margin-bottom: 8px;">📧 Newsletter semanal com novidades e conteúdo exclusivo</li>
          <li style="margin-bottom: 8px;">🎵 Descobertas sobre compositores e obras clássicas</li>
          <li style="margin-bottom: 8px;">📚 Dicas de estudo e prática musical</li>
          <li style="margin-bottom: 8px;">🎹 Partituras e recursos para músicos</li>
        </ul>
      </div>
      
      <div class="text-center" style="margin: 30px 0;">
        <a href="{{siteUrl}}" class="btn">Explorar Classical Hub</a>
      </div>
      
      <p style="margin-top: 30px;">Fique atento(a) à sua caixa de entrada - em breve você receberá conteúdos incríveis sobre o fascinante mundo da música clássica!</p>
      
      <p style="margin-top: 30px;">
        <strong>Harmoniosamente,</strong><br>
        Equipe Classical Hub
      </p>
    `
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

  ACCOUNT_CONFIRMATION: {
    subject: '🎼 Confirme sua conta na Opus Atlas',
    htmlContent: getModernBaseLayout(
      `
      <p style="font-size: 20px; color: #1f2937; margin-bottom: 15px;">
        Olá {{firstName}}! 👋
      </p>
      
      <p style="color: #4b5563; line-height: 1.7; font-size: 16px; margin-bottom: 30px;">
        Que alegria ter você conosco! Sua conta foi criada com sucesso, mas precisamos confirmar seu email para garantir a segurança da sua conta e liberar todas as funcionalidades.
      </p>
      
      <div class="welcome-message">
        <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">
          🚀 Sua jornada musical começa agora!
        </h3>
        <p style="color: #3730a3; margin: 0; line-height: 1.6;">
          Após confirmar sua conta, você terá acesso completo à nossa enciclopédia de música clássica, poderá criar listas de estudos, fazer anotações em partituras e muito mais.
        </p>
      </div>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="{{confirmationUrl}}" class="btn">
          ✨ Confirmar Minha Conta
        </a>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📚</div>
          <div class="feature-title">Enciclopédia Completa</div>
          <div class="feature-desc">Milhares de compositores, obras e informações detalhadas</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎵</div>
          <div class="feature-title">Partituras Gratuitas</div>
          <div class="feature-desc">Acesso a uma vasta biblioteca de partituras</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <div class="feature-title">Ferramentas de Estudo</div>
          <div class="feature-desc">Anotações, bookmarks e listas personalizadas</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎓</div>
          <div class="feature-title">Acompanhe seu Progresso</div>
          <div class="feature-desc">Monitore seu desenvolvimento musical</div>
        </div>
      </div>
      
      <div class="security-note">
        <div class="security-icon">🔒</div>
        <div class="security-text">
          <strong>Segurança:</strong> Este link de confirmação é válido por 24 horas e pode ser usado apenas uma vez. Se você não criou esta conta, pode ignorar este email com segurança.
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 40px; text-align: center;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="{{confirmationUrl}}" style="color: #3b82f6; word-break: break-all;">{{confirmationUrl}}</a>
      </p>
    `,
      'linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #dc2626 100%)'
    ),
    textContent: `🎼 CONFIRME SUA CONTA - Opus Atlas

Olá {{firstName}},

Que alegria ter você conosco! Sua conta foi criada com sucesso.

Para confirmar sua conta e liberar todas as funcionalidades, acesse:
{{confirmationUrl}}

APÓS CONFIRMAR VOCÊ TERÁ ACESSO A:
📚 Enciclopédia Completa de Música Clássica
🎵 Milhares de Partituras Gratuitas  
📝 Ferramentas de Estudo e Anotações
🎓 Acompanhamento de Progresso Musical

SEGURANÇA: Este link é válido por 24 horas e pode ser usado apenas uma vez.

Se você não criou esta conta, pode ignorar este email com segurança.

Opus Atlas - A maior plataforma de música clássica do Brasil
São Paulo, Brasil
contato@classicalhub.com`,
    variables: ['firstName', 'confirmationUrl', 'unsubscribeUrl'],
    description: 'Email de confirmação para criação de conta (double opt-in)',
  },

  CONFIRMATION: {
    subject: 'Confirme sua inscrição na newsletter do Classical Hub',
    htmlContent: getModernBaseLayout(
      `
      <h2 style="color: #333; margin-bottom: 20px;">Confirme sua inscrição</h2>
      
      <p>Olá! Obrigado pelo interesse em receber nossa newsletter.</p>
      
      <p>Para completar sua inscrição e começar a receber conteúdo exclusivo sobre música clássica, clique no botão abaixo:</p>
      
      <div class="text-center" style="margin: 30px 0;">
        <a href="{{confirmationUrl}}" class="btn" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
          Confirmar Inscrição
        </a>
      </div>
      
      <div class="security-note">
        <div class="security-icon">⚠️</div>
        <div class="security-text">
          <strong>Importante:</strong> Este link expira em 24 horas. Se você não se inscreveu em nossa newsletter, pode ignorar este email com segurança.
        </div>
      </div>
      
      <p style="margin-top: 30px;">
        <strong>Atenciosamente,</strong><br>
        Equipe Classical Hub
      </p>
    `,
      'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
      '📧'
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
    description: 'Email de confirmação para double opt-in da newsletter',
  },

  PASSWORD_RESET: {
    subject: '🔒 Redefinir senha - Opus Atlas',
    htmlContent: getModernBaseLayout(
      `
      <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
        Olá {{firstName}},
      </p>
      
      <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
        Recebemos uma solicitação para redefinir a senha da sua conta na Opus Atlas.
      </p>
      
      <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 25px; border-radius: 8px; margin: 25px 0;">
        <h3 style="color: #7f1d1d; margin: 0 0 15px 0; font-size: 18px;">
          📧 Solicitação de Reset
        </h3>
        <p style="color: #991b1b; margin: 0 0 10px 0;">
          <strong>Email:</strong> {{email}}
        </p>
        <p style="color: #991b1b; margin: 0 0 10px 0;">
          <strong>Data:</strong> {{requestDate}}
        </p>
        <p style="color: #991b1b; margin: 0;">
          <strong>IP:</strong> {{ipAddress}}
        </p>
      </div>
      
      <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
        Se foi você quem solicitou esta mudança, clique no botão abaixo para criar uma nova senha:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{resetUrl}}" class="btn" style="background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);">
          🔑 Redefinir Minha Senha
        </a>
      </div>
      
      <div style="background: #fffbeb; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
        <h4 style="color: #92400e; margin: 0 0 15px 0;">💡 Dicas de Segurança para sua Nova Senha:</h4>
        <ul style="color: #78350f; margin: 0; padding-left: 20px;">
          <li style="margin-bottom: 8px; line-height: 1.5;">Use pelo menos 8 caracteres</li>
          <li style="margin-bottom: 8px; line-height: 1.5;">Combine letras maiúsculas e minúsculas</li>
          <li style="margin-bottom: 8px; line-height: 1.5;">Inclua números e símbolos especiais</li>
          <li style="margin-bottom: 8px; line-height: 1.5;">Evite informações pessoais óbvias</li>
          <li style="line-height: 1.5;">Não reutilize senhas de outros sites</li>
        </ul>
      </div>
      
      <div class="warning-box">
        <div class="warning-icon">⚠️</div>
        <div class="warning-text">
          <strong>Importante:</strong> Este link é válido por apenas 1 hora e pode ser usado uma única vez. Se você não solicitou esta mudança, ignore este email e sua senha permanecerá inalterada.
        </div>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
        Se o botão não funcionar, copie e cole este link no seu navegador:<br>
        <a href="{{resetUrl}}" style="color: #dc2626; word-break: break-all;">{{resetUrl}}</a>
      </p>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
        Se você está tendo problemas com sua conta ou não solicitou esta mudança, entre em contato conosco imediatamente em 
        <a href="mailto:suporte@classicalhub.com" style="color: #dc2626;">suporte@classicalhub.com</a>
      </p>
    `,
      'linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%)',
      '🔒'
    ),
    textContent: `🔒 REDEFINIR SENHA - Opus Atlas

Olá {{firstName}},

Recebemos uma solicitação para redefinir a senha da sua conta.

DETALHES DA SOLICITAÇÃO:
Email: {{email}}
Data: {{requestDate}}
IP: {{ipAddress}}

Para criar uma nova senha, acesse:
{{resetUrl}}

DICAS DE SEGURANÇA:
• Use pelo menos 8 caracteres
• Combine letras, números e símbolos
• Evite informações pessoais
• Não reutilize senhas

IMPORTANTE: Este link é válido por apenas 1 hora.

Se você não solicitou esta mudança, ignore este email.

Problemas? Contate: suporte@classicalhub.com

Opus Atlas - Sua segurança é nossa prioridade
São Paulo, Brasil`,
    variables: ['firstName', 'email', 'resetUrl', 'requestDate', 'ipAddress'],
    description: 'Email para redefinição de senha',
  },

  WEEKLY_DIGEST: {
    subject: '🎼 Digest Semanal - Novas descobertas em Classical Hub',
    htmlContent: getModernBaseLayout(
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
    `
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
    htmlContent: getModernBaseLayout(
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
      'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #ea580c 100%)',
      '🎭'
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
    htmlContent: getModernBaseLayout(`{{customContent}}`),
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
    preferencesUrl: 'https://classicalhub.com/preferences?token=sample',
    confirmationUrl: 'https://classicalhub.com/confirm?token=sample',
    resetUrl: 'https://classicalhub.com/reset?token=sample',
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
      '<h3>Conteúdo personalizado da campanha</h3><p>Este é um exemplo de conteúdo customizado.</p>',
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
    htmlContent: getModernBaseLayout(htmlContent),
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
