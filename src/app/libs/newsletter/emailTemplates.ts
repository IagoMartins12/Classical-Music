// app/libs/emailTemplates.ts
export const emailTemplates = {
  // Template de Confirmação de Inscrição
  WELCOME: {
    subject: 'Confirme sua inscrição na Classical Hub 🎼',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme sua inscrição - Classical Hub</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .music-note { font-size: 48px; margin-bottom: 20px; }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 20px 0;
            font-size: 16px;
        }
        .cta-button:hover { opacity: 0.9; }
        .features { margin: 30px 0; }
        .feature { 
            display: flex; 
            align-items: center; 
            margin: 15px 0; 
            padding: 15px; 
            background: #f8fafc; 
            border-radius: 8px; 
        }
        .feature-icon { 
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
            color: white; 
            width: 40px; 
            height: 40px; 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            margin-right: 15px; 
            flex-shrink: 0;
        }
        .footer { 
            background: #1f2937; 
            color: #d1d5db; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
        }
        .footer a { color: #6366f1; text-decoration: none; }
        .social-links { margin: 20px 0; }
        .social-links a { 
            color: #6366f1; 
            text-decoration: none; 
            margin: 0 10px; 
            font-size: 18px; 
        }
        @media (max-width: 600px) {
            .content { padding: 20px; }
            .header { padding: 30px 20px; }
            .header h1 { font-size: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="music-note">🎼</div>
            <h1>Bem-vindo à Classical Hub!</h1>
            <p>Sua jornada musical começa aqui</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                Olá {{firstName}},
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Que alegria ter você conosco! Você está prestes a fazer parte da maior comunidade de música clássica do Brasil.
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                Para confirmar sua inscrição e começar a receber nossa newsletter com as melhores novidades sobre música clássica, clique no botão abaixo:
            </p>
            
            <div style="text-align: center;">
                <a href="{{confirmationUrl}}" class="cta-button">
                    ✨ Confirmar Inscrição
                </a>
            </div>
            
            <div class="features">
                <h3 style="color: #1f2937; margin-bottom: 20px;">O que você receberá:</h3>
                
                <div class="feature">
                    <div class="feature-icon">🎵</div>
                    <div>
                        <strong style="color: #1f2937;">Novos Compositores</strong><br>
                        <span style="color: #6b7280;">Descubra mestres da música clássica e suas obras</span>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📜</div>
                    <div>
                        <strong style="color: #1f2937;">Partituras Exclusivas</strong><br>
                        <span style="color: #6b7280;">Acesso a nossa biblioteca crescente de partituras</span>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🎓</div>
                    <div>
                        <strong style="color: #1f2937;">Dicas de Estudo</strong><br>
                        <span style="color: #6b7280;">Técnicas e metodologias para aprimorar seus estudos</span>
                    </div>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🎪</div>
                    <div>
                        <strong style="color: #1f2937;">Eventos e Concertos</strong><br>
                        <span style="color: #6b7280;">Fique por dentro dos eventos de música clássica</span>
                    </div>
                </div>
            </div>
            
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 30px 0;">
                <p style="margin: 0; color: #1e3a8a; font-weight: 500;">
                    💡 <strong>Dica:</strong> Adicione nosso email à sua lista de contatos para não perder nenhuma novidade!
                </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                Se você não solicitou esta inscrição, pode ignorar este email com segurança.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Classical Hub</strong> - Sua plataforma de música clássica</p>
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">YouTube</a>
                <a href="#">Spotify</a>
            </div>
            <p>
                São Paulo, Brasil<br>
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a> | 
                <a href="https://classicalhub.com/privacy">Política de Privacidade</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
Bem-vindo à Classical Hub!

Olá {{firstName}},

Que alegria ter você conosco! Você está prestes a fazer parte da maior comunidade de música clássica do Brasil.

Para confirmar sua inscrição e começar a receber nossa newsletter, acesse o link:
{{confirmationUrl}}

O QUE VOCÊ RECEBERÁ:
🎵 Novos Compositores - Descubra mestres da música clássica
📜 Partituras Exclusivas - Acesso a nossa biblioteca crescente
🎓 Dicas de Estudo - Técnicas para aprimorar seus estudos
🎪 Eventos e Concertos - Fique por dentro dos eventos

Se você não solicitou esta inscrição, pode ignorar este email com segurança.

Classical Hub - Sua plataforma de música clássica
São Paulo, Brasil

Cancelar inscrição: {{unsubscribeUrl}}
`,
  },

  // Template de Newsletter Semanal
  WEEKLY_DIGEST: {
    subject: '🎼 Classical Hub Weekly - Suas descobertas musicais da semana',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Classical Hub Weekly</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #dc2626 100%); 
            padding: 40px 30px; 
            text-align: center; 
            position: relative;
            overflow: hidden;
        }
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="50" font-size="20">🎵</text></svg>') repeat;
            opacity: 0.1;
        }
        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; position: relative; z-index: 1; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; position: relative; z-index: 1; }
        .content { padding: 40px 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { 
            color: #1f2937; 
            border-bottom: 3px solid #6366f1; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
            font-size: 24px;
        }
        .composer-card, .work-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #6366f1;
        }
        .composer-card h3, .work-card h3 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 20px;
        }
        .composer-card p, .work-card p {
            margin: 0;
            color: #4b5563;
            line-height: 1.6;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .cta-section {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 10px;
        }
        .footer { 
            background: #1f2937; 
            color: #d1d5db; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
        }
        .footer a { color: #6366f1; text-decoration: none; }
        @media (max-width: 600px) {
            .content { padding: 20px; }
            .header { padding: 30px 20px; }
            .stats-grid { grid-template-columns: 1fr 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Classical Hub Weekly</h1>
            <p>Suas descobertas musicais da semana</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 30px;">
                Olá {{firstName}}, 👋
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                Mais uma semana cheia de descobertas musicais! Aqui estão os destaques que selecionamos especialmente para você.
            </p>
            
            <!-- Estatísticas da Semana -->
            <div class="section">
                <h2>📊 Esta Semana na Classical Hub</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-number">{{newComposers}}</div>
                        <div>Novos Compositores</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{newWorks}}</div>
                        <div>Novas Obras</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{newScores}}</div>
                        <div>Novas Partituras</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">{{activeUsers}}</div>
                        <div>Usuários Ativos</div>
                    </div>
                </div>
            </div>
            
            <!-- Compositor em Destaque -->
            <div class="section">
                <h2>🎭 Compositor em Destaque</h2>
                <div class="composer-card">
                    <h3>{{featuredComposer.name}} ({{featuredComposer.period}})</h3>
                    <p>{{featuredComposer.description}}</p>
                    <br>
                    <a href="{{featuredComposer.url}}" style="color: #6366f1; text-decoration: none; font-weight: bold;">
                        Explorar obras →
                    </a>
                </div>
            </div>
            
            <!-- Obras Populares -->
            <div class="section">
                <h2>🔥 Mais Estudadas da Semana</h2>
                {{#each popularWorks}}
                <div class="work-card">
                    <h3>{{this.title}}</h3>
                    <p><strong>{{this.composer}}</strong> • {{this.instrument}}</p>
                    <p>{{this.description}}</p>
                    <br>
                    <a href="{{this.url}}" style="color: #6366f1; text-decoration: none;">Ver partitura →</a>
                </div>
                {{/each}}
            </div>
            
            <!-- Dica da Semana -->
            <div class="section">
                <h2>💡 Dica de Estudo da Semana</h2>
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px;">
                    <h4 style="color: #92400e; margin: 0 0 10px 0;">{{studyTip.title}}</h4>
                    <p style="color: #78350f; margin: 0; line-height: 1.6;">{{studyTip.content}}</p>
                </div>
            </div>
            
            <!-- Call to Action -->
            <div class="cta-section">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">Continue Explorando!</h3>
                <p style="color: #4b5563; margin: 0 0 20px 0;">
                    Que tal descobrir algo novo hoje? Nossa biblioteca está sempre crescendo.
                </p>
                <a href="{{siteUrl}}/composers" class="cta-button">Explorar Compositores</a>
                <a href="{{siteUrl}}/works" class="cta-button">Ver Obras</a>
            </div>
            
            <!-- Eventos -->
            {{#if events}}
            <div class="section">
                <h2>🎪 Eventos de Música Clássica</h2>
                {{#each events}}
                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                    <h4 style="color: #065f46; margin: 0 0 5px 0;">{{this.title}}</h4>
                    <p style="color: #047857; margin: 0; font-size: 14px;">
                        📅 {{this.date}} • 📍 {{this.location}}
                    </p>
                </div>
                {{/each}}
            </div>
            {{/if}}
        </div>
        
        <div class="footer">
            <p><strong>Classical Hub</strong> - Sua plataforma de música clássica</p>
            <p>
                Você está recebendo este email porque se inscreveu na nossa newsletter.<br>
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a> | 
                <a href="{{preferencesUrl}}">Gerenciar preferências</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
CLASSICAL HUB WEEKLY
Suas descobertas musicais da semana

Olá {{firstName}},

Mais uma semana cheia de descobertas musicais! Aqui estão os destaques que selecionamos especialmente para você.

ESTA SEMANA NA CLASSICAL HUB:
- {{newComposers}} Novos Compositores
- {{newWorks}} Novas Obras  
- {{newScores}} Novas Partituras
- {{activeUsers}} Usuários Ativos

COMPOSITOR EM DESTAQUE:
{{featuredComposer.name}} ({{featuredComposer.period}})
{{featuredComposer.description}}
Explorar: {{featuredComposer.url}}

MAIS ESTUDADAS DA SEMANA:
{{#each popularWorks}}
• {{this.title}} - {{this.composer}}
  {{this.description}}
  Ver: {{this.url}}

{{/each}}

DICA DE ESTUDO:
{{studyTip.title}}
{{studyTip.content}}

Continue explorando em: {{siteUrl}}

Cancelar inscrição: {{unsubscribeUrl}}
`,
  },

  // Template para Novo Compositor
  NEW_COMPOSER: {
    subject: '🎼 Novo compositor adicionado: {{composerName}}',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Novo Compositor - {{composerName}}</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { 
            background: linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #ea580c 100%); 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; }
        .content { padding: 40px 30px; }
        .composer-info {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .composer-portrait {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 20px auto;
            display: block;
            border: 4px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .works-list {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .work-item {
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .work-item:last-child { border-bottom: none; }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
        }
        .footer { 
            background: #1f2937; 
            color: #d1d5db; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
        }
        .footer a { color: #6366f1; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 10px;">🎭</div>
            <h1>Novo Compositor Descoberto!</h1>
            <p>Expanda seus horizontes musicais</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1f2937;">Olá {{firstName}},</p>
            
            <p style="color: #4b5563; line-height: 1.6;">
                Que emoção! Acabamos de adicionar um novo compositor à nossa coleção. 
                Prepare-se para descobrir {{composerName}} e sua magnífica contribuição para a música clássica.
            </p>
            
            <div class="composer-info">
                {{#if composerPortrait}}
                <img src="{{composerPortrait}}" alt="{{composerName}}" class="composer-portrait">
                {{/if}}
                
                <h2 style="text-align: center; color: #7f1d1d; margin: 0 0 15px 0;">
                    {{composerName}}
                </h2>
                
                <p style="text-align: center; color: #991b1b; font-size: 16px; margin: 0 0 20px 0;">
                    {{composerPeriod}} • {{composerNationality}}
                </p>
                
                <p style="color: #7f1d1d; line-height: 1.6; text-align: center;">
                    {{composerBio}}
                </p>
            </div>
            
            {{#if works}}
            <h3 style="color: #1f2937; margin: 30px 0 15px 0;">🎵 Obras Disponíveis:</h3>
            <div class="works-list">
                {{#each works}}
                <div class="work-item">
                    <strong style="color: #1f2937;">{{this.title}}</strong>
                    <br>
                    <span style="color: #6b7280; font-size: 14px;">
                        {{this.instrument}} • {{this.key}} • {{this.year}}
                    </span>
                </div>
                {{/each}}
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{composerUrl}}" class="cta-button">
                    🎼 Explorar {{composerName}}
                </a>
            </div>
            
            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <h4 style="color: #92400e; margin: 0 0 10px 0;">💡 Curiosidade Musical</h4>
                <p style="color: #78350f; margin: 0; line-height: 1.6;">
                    {{musicalFact}}
                </p>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Classical Hub</strong> - Sempre descobrindo novos talentos</p>
            <p>
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a> | 
                <a href="{{siteUrl}}">Visitar site</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
🎭 NOVO COMPOSITOR DESCOBERTO!

Olá {{firstName}},

Que emoção! Acabamos de adicionar {{composerName}} à nossa coleção.

{{composerName}}
{{composerPeriod}} • {{composerNationality}}

{{composerBio}}

OBRAS DISPONÍVEIS:
{{#each works}}
• {{this.title}} ({{this.instrument}}, {{this.year}})
{{/each}}

CURIOSIDADE:
{{musicalFact}}

Explorar: {{composerUrl}}

Classical Hub - Sempre descobrindo novos talentos
Cancelar inscrição: {{unsubscribeUrl}}
`,
  },
};

// Função para buscar template
export function getEmailTemplate(
  type: string
): (typeof emailTemplates)[keyof typeof emailTemplates] | null {
  return emailTemplates[type as keyof typeof emailTemplates] || null;
}

// Função para processar variáveis no template
export function processTemplate(
  template: string,
  variables: Record<string, any>
): string {
  let result = template;

  // Processar variáveis simples {{variable}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, String(value || ''));
  });

  // Processar arrays com {{#each}} (simplificado)
  result = result.replace(
    /{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,
    (match, arrayName, template) => {
      const array = variables[arrayName];
      if (!Array.isArray(array)) return '';

      return array
        .map((item) => {
          let itemTemplate = template;
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{this\\.${key}}}`, 'g');
            itemTemplate = itemTemplate.replace(regex, String(value || ''));
          });
          return itemTemplate;
        })
        .join('');
    }
  );

  // Processar condicionais {{#if}} (simplificado)
  result = result.replace(
    /{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
    (match, varName, template) => {
      const value = variables[varName];
      return value ? template : '';
    }
  );

  // Remover tags não processadas
  result = result.replace(/{{[^}]*}}/g, '');

  return result;
}

// Função para criar template personalizado
export function createCustomTemplate(
  name: string,
  type: string,
  subject: string,
  htmlContent: string,
  textContent: string
) {
  return {
    name,
    type,
    subject,
    htmlContent,
    textContent,
    variables: extractVariables(htmlContent + ' ' + textContent),
    createdAt: new Date().toISOString(),
  };
}

// Função para extrair variáveis de um template
function extractVariables(template: string): string[] {
  const matches = template.match(/{{([^}]+)}}/g);
  if (!matches) return [];

  return [
    ...new Set(
      matches
        .map((match) => match.replace(/[{}]/g, ''))
        .filter(
          (variable) =>
            !variable.startsWith('#') &&
            !variable.startsWith('/') &&
            !variable.includes('.')
        )
    ),
  ];
}
