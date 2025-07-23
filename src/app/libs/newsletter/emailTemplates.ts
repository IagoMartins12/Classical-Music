// app/libs/emailTemplates.ts - VERSÃO ATUALIZADA com novos templates

export const emailTemplates = {
  // Template existente de Newsletter
  WELCOME: {
    subject: 'Confirme sua inscrição na Opus Atlas 🎼',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme sua inscrição - Opus Atlas</title>
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
            <div class="music-note">🎼</div>
            <h1>Bem-vindo à Opus Atlas!</h1>
            <p>Sua jornada musical começa aqui</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                Olá {{firstName}},
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
                Para confirmar sua inscrição na newsletter, clique no botão abaixo:
            </p>
            
            <div style="text-align: center;">
                <a href="{{confirmationUrl}}" class="cta-button">
                    ✨ Confirmar Inscrição
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Opus Atlas</strong> - Sua plataforma de música clássica</p>
            <p>
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a> | 
                <a href="https://classicalhub.com/privacy">Política de Privacidade</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
Bem-vindo à Opus Atlas!

Olá {{firstName}},

Para confirmar sua inscrição na newsletter, acesse: {{confirmationUrl}}

Opus Atlas - Sua plataforma de música clássica
Cancelar inscrição: {{unsubscribeUrl}}
`,
  },

  // 🆕 NOVO: Template de Confirmação de Conta
  ACCOUNT_CONFIRMATION: {
    subject: '🎼 Confirme sua conta na Opus Atlas',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirme sua conta - Opus Atlas</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #dc2626 100%); 
            padding: 50px 30px; 
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
        .music-icon { font-size: 64px; margin-bottom: 20px; }
        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; }
        .content { padding: 50px 40px; }
        .welcome-message {
            background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
            padding: 30px;
            border-radius: 16px;
            border-left: 5px solid #3b82f6;
            margin: 30px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); 
            color: white; 
            padding: 18px 36px; 
            text-decoration: none; 
            border-radius: 12px; 
            font-weight: bold; 
            margin: 25px 0;
            font-size: 18px;
            box-shadow: 0 4px 15px rgba(30, 64, 175, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(30, 64, 175, 0.4); }
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
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
        }
        .security-icon { font-size: 24px; margin-right: 12px; color: #d97706; }
        .security-text { color: #92400e; line-height: 1.6; }
        .footer { 
            background: #1f2937; 
            color: #d1d5db; 
            padding: 40px 30px; 
            text-align: center;
        }
        .footer h3 { color: white; margin: 0 0 15px 0; }
        .footer a { color: #60a5fa; text-decoration: none; }
        .footer a:hover { color: #93c5fd; }
        .social-links { margin: 20px 0; }
        .social-links a { 
            color: #60a5fa; 
            text-decoration: none; 
            margin: 0 15px; 
            font-size: 16px; 
        }
        @media (max-width: 600px) {
            .content { padding: 30px 20px; }
            .header { padding: 40px 20px; }
            .header h1 { font-size: 28px; }
            .features-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-content">
                <div class="music-icon">🎼</div>
                <h1>Confirme sua Conta</h1>
                <p>Bem-vindo à maior plataforma de música clássica do Brasil!</p>
            </div>
        </div>
        
        <div class="content">
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
                <a href="{{confirmationUrl}}" class="cta-button">
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
        </div>
        
        <div class="footer">
            <h3>Opus Atlas</h3>
            <p>A maior plataforma de música clássica do Brasil</p>
            
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">YouTube</a>
                <a href="#">Spotify</a>
            </div>
            
            <p style="font-size: 13px; margin-top: 30px;">
                São Paulo, Brasil<br>
                <a href="mailto:contato@classicalhub.com">contato@classicalhub.com</a><br>
                <a href="https://classicalhub.com/privacy">Política de Privacidade</a> | 
                <a href="https://classicalhub.com/terms">Termos de Uso</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
🎼 CONFIRME SUA CONTA - Opus Atlas

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
contato@classicalhub.com
`,
  },

  // 🆕 NOVO: Template de Reset de Senha
  PASSWORD_RESET: {
    subject: '🔒 Redefinir senha - Opus Atlas',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redefinir Senha - Opus Atlas</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .header { 
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #f59e0b 100%); 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .lock-icon { font-size: 48px; margin-bottom: 20px; }
        .reset-info {
            background: #fef2f2;
            border-left: 4px solid #dc2626;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); 
            color: white; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            margin: 25px 0;
            font-size: 16px;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }
        .cta-button:hover { box-shadow: 0 6px 16px rgba(220, 38, 38, 0.4); }
        .security-tips {
            background: #fffbeb;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .security-tips h4 { color: #92400e; margin: 0 0 15px 0; }
        .security-tips ul { color: #78350f; margin: 0; padding-left: 20px; }
        .security-tips li { margin-bottom: 8px; line-height: 1.5; }
        .warning-box {
            background: #fef2f2;
            border: 1px solid #f87171;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
            display: flex;
            align-items: flex-start;
        }
        .warning-icon { font-size: 24px; margin-right: 12px; color: #dc2626; }
        .warning-text { color: #7f1d1d; line-height: 1.6; }
        .footer { 
            background: #1f2937; 
            color: #d1d5db; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px; 
        }
        .footer a { color: #60a5fa; text-decoration: none; }
        @media (max-width: 600px) {
            .content { padding: 20px; }
            .header { padding: 30px 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="lock-icon">🔒</div>
            <h1>Redefinir Senha</h1>
            <p>Solicitação de nova senha recebida</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                Olá {{firstName}},
            </p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
                Recebemos uma solicitação para redefinir a senha da sua conta na Opus Atlas.
            </p>
            
            <div class="reset-info">
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
                <a href="{{resetUrl}}" class="cta-button">
                    🔑 Redefinir Minha Senha
                </a>
            </div>
            
            <div class="security-tips">
                <h4>💡 Dicas de Segurança para sua Nova Senha:</h4>
                <ul>
                    <li>Use pelo menos 8 caracteres</li>
                    <li>Combine letras maiúsculas e minúsculas</li>
                    <li>Inclua números e símbolos especiais</li>
                    <li>Evite informações pessoais óbvias</li>
                    <li>Não reutilize senhas de outros sites</li>
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
        </div>
        
        <div class="footer">
            <p><strong>Opus Atlas</strong> - Sua segurança é nossa prioridade</p>
            <p>
                São Paulo, Brasil<br>
                <a href="mailto:suporte@classicalhub.com">suporte@classicalhub.com</a><br>
                <a href="https://classicalhub.com/privacy">Política de Privacidade</a> | 
                <a href="https://classicalhub.com/security">Segurança</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
🔒 REDEFINIR SENHA - Opus Atlas

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
São Paulo, Brasil
`,
  },

  // Template existente da Newsletter Semanal (mantido)
  WEEKLY_DIGEST: {
    subject: '🎼 Opus Atlas Weekly - Suas descobertas musicais da semana',
    htmlContent: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Opus Atlas Weekly</title>
    <style>
        body { font-family: 'Georgia', serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 650px; margin: 0 auto; background: white; }
        .header { 
            background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #dc2626 100%); 
            padding: 40px 30px; 
            text-align: center; 
        }
        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; }
        .content { padding: 40px 30px; }
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Opus Atlas Weekly</h1>
            <p>Suas descobertas musicais da semana</p>
        </div>
        
        <div class="content">
            <p>Olá {{firstName}}, 👋</p>
            <p>Mais uma semana cheia de descobertas musicais!</p>
            
            <!-- Conteúdo da newsletter semanal -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{siteUrl}}/composers" class="cta-button">Explorar Compositores</a>
                <a href="{{siteUrl}}/works" class="cta-button">Ver Obras</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Opus Atlas</strong> - Sua plataforma de música clássica</p>
            <p>
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a> | 
                <a href="{{preferencesUrl}}">Gerenciar preferências</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
Opus Atlas WEEKLY

Olá {{firstName}},

Mais uma semana cheia de descobertas musicais!

Continue explorando em: {{siteUrl}}
Cancelar inscrição: {{unsubscribeUrl}}
`,
  },

  // Template existente de Novo Compositor (mantido)
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
        .content { padding: 40px 30px; }
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="font-size: 48px; margin-bottom: 10px;">🎭</div>
            <h1>Novo Compositor Descoberto!</h1>
        </div>
        
        <div class="content">
            <p>Olá {{firstName}},</p>
            <p>Acabamos de adicionar {{composerName}} à nossa coleção.</p>
            
            <div style="text-align: center;">
                <a href="{{composerUrl}}" class="cta-button">
                    🎼 Explorar {{composerName}}
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Opus Atlas</strong> - Sempre descobrindo novos talentos</p>
            <p>
                <a href="{{unsubscribeUrl}}">Cancelar inscrição</a>
            </p>
        </div>
    </div>
</body>
</html>`,
    textContent: `
🎭 NOVO COMPOSITOR DESCOBERTO!

Olá {{firstName}},

Acabamos de adicionar {{composerName}} à nossa coleção.

Explorar: {{composerUrl}}
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
