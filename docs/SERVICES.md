# Configuração de APIs e Serviços Externos - Opus Atlas

Este guia cobre a configuração completa de todas as APIs e serviços externos necessários para o funcionamento do Opus Atlas.

## Visão Geral dos Serviços

### Serviços Obrigatórios

- ✅ **Google OAuth** - Login social
- ✅ **YouTube API** - Busca de performances
- ✅ **Spotify API** - Preview de músicas
- ✅ **Cloudinary** - Upload e otimização de imagens
- ✅ **Gmail SMTP** - Email transacional

### Serviços Opcionais

- 🔶 **OpenAI API** - IA para biografias de compositores
- 🔶 **Groq API** - IA alternativa (mais rápida)
- 🔶 **SendGrid** - Email marketing avançado

---

## 1. Google Cloud Platform

### 1.1 Criar Projeto

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Clique em "Novo Projeto"
3. Nome: `opus-atlas-prod` (ou sua preferência)
4. Confirmar criação

### 1.2 Configurar OAuth 2.0

#### Tela de Consentimento OAuth

1. **APIs & Services** → **OAuth consent screen**
2. **User Type**: External
3. **Informações do app**:
   ```
   Nome do app: Opus Atlas
   Email de suporte: seu-email@gmail.com
   Logo do app: (opcional)
   Domínio da página inicial: https://opusatlas.com.br
   ```
4. **Domínios autorizados**:
   ```
   opusatlas.com.br
   localhost (para desenvolvimento)
   ```
5. **Contatos do desenvolvedor**: seu-email@gmail.com
6. **Escopos**:
   - userinfo.email
   - userinfo.profile
   - openid

#### Credenciais OAuth

1. **APIs & Services** → **Credenciais**
2. **Criar credenciais** → **ID do cliente OAuth 2.0**
3. **Tipo de aplicação**: Aplicação Web
4. **Nome**: `Opus Atlas Web Client`
5. **URIs de redirect autorizados**:

   ```
   # Desenvolvimento
   http://localhost:3000/api/auth/callback/google

   # Produção
   https://opusatlas.com.br/api/auth/callback/google
   https://www.opusatlas.com.br/api/auth/callback/google
   ```

6. **Origens JavaScript autorizadas**:

   ```
   # Desenvolvimento
   http://localhost:3000

   # Produção
   https://opusatlas.com.br
   https://www.opusatlas.com.br
   ```

### 1.3 YouTube Data API v3

#### Ativar API

1. **APIs & Services** → **Biblioteca**
2. Pesquisar "YouTube Data API v3"
3. Clicar em "Ativar"

#### Criar API Key

1. **APIs & Services** → **Credenciais**
2. **Criar credenciais** → **Chave de API**
3. **Restringir chave**:
   - **Restrições da aplicação**: Referenciadores HTTP
   - **Referenciadores de sites**:
     ```
     localhost:3000/*
     opusatlas.com.br/*
     *.opusatlas.com.br/*
     ```
   - **Restrições de API**: YouTube Data API v3
4. **Nome**: `Opus Atlas YouTube API`

### 1.4 Variáveis de Ambiente Google

```env
# Google OAuth
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"

# YouTube API
YOUTUBE_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"
```

---

## 2. Spotify for Developers

### 2.1 Criar Aplicação

1. Acesse [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. **Create App**
3. **Configurações**:
   ```
   App name: Opus Atlas
   App description: Plataforma educacional de música clássica
   Website: https://opusatlas.com.br
   Redirect URIs:
     http://localhost:3000/api/auth/callback/spotify
     https://opusatlas.com.br/api/auth/callback/spotify
   ```
4. **Which API/SDKs are you planning to use?**
   - Web API ✅
   - Web Playback SDK ✅

### 2.2 Configurar Permissões

**Scopes necessários**:

- `user-read-email` - Email do usuário
- `user-read-private` - Perfil básico
- `streaming` - Reproduzir música (futuro)

### 2.3 Obter Credenciais

1. **Settings** da aplicação criada
2. Copiar **Client ID** e **Client Secret**
3. **Show client secret** para ver a secret

### 2.4 Variáveis de Ambiente Spotify

```env
SPOTIFY_CLIENT_ID="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
SPOTIFY_CLIENT_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0"
```

### 2.5 Teste da Integração

```javascript
// Teste no console do navegador ou Node.js
const testSpotifyAuth = async () => {
  const clientId = 'seu-client-id';
  const clientSecret = 'seu-client-secret';

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  );

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await response.json();
  console.log('Spotify Auth:', data.access_token ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 3. Cloudinary

### 3.1 Criar Conta

1. Acesse [Cloudinary](https://cloudinary.com/users/register_free)
2. Registre-se com seu email
3. Verificar email e completar cadastro
4. Escolher plano **Free** (25 GB/mês)

### 3.2 Obter Credenciais

1. **Dashboard** → **Account Details**
2. Copiar:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3.3 Configurar Upload Preset

1. **Settings** → **Upload**
2. **Add upload preset**
3. **Configurações**:

   ```
   Preset name: musical-encyclopedia
   Signing mode: Unsigned
   Folder: opus-atlas

   # Transformações automáticas
   Format: Auto
   Quality: Auto

   # Eager transformations:
   c_fill,w_800,h_600,q_auto,f_auto (para cards)
   c_fill,w_400,h_300,q_auto,f_auto (para thumbnails)
   c_fill,w_150,h_150,q_auto,f_auto (para avatars)
   ```

### 3.4 Configurações Avançadas

```json
{
  "folder": "opus-atlas",
  "resource_type": "auto",
  "allowed_formats": ["jpg", "jpeg", "png", "gif", "webp", "svg"],
  "max_file_size": 10485760,
  "max_image_width": 2000,
  "max_image_height": 2000,
  "quality": "auto:best",
  "format": "auto",
  "crop": "limit",
  "fetch_format": "auto"
}
```

### 3.5 Variáveis de Ambiente Cloudinary

```env
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"
```

### 3.6 Teste da Integração

```javascript
// Upload de teste
const testCloudinaryUpload = async () => {
  const formData = new FormData();
  formData.append('upload_preset', 'musical-encyclopedia');
  formData.append(
    'file',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/seu-cloud-name/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  console.log('Cloudinary:', data.secure_url ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 4. Gmail SMTP

### 4.1 Configurar Autenticação 2 Fatores

1. [Google Account Security](https://myaccount.google.com/security)
2. **2-Step Verification** → **Get started**
3. Seguir instruções para ativar

### 4.2 Gerar Senha de App

1. **2-Step Verification** → **App passwords**
2. **Select app**: Mail
3. **Select device**: Other (custom name)
4. **Name**: `Opus Atlas SMTP`
5. **Generate** → Copiar senha gerada (16 caracteres)

### 4.3 Configuração SMTP

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"  # StartTLS
SMTP_USER="opusatlas@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"  # App password
```

### 4.4 Teste SMTP

```javascript
// Teste de envio (Node.js + nodemailer)
const nodemailer = require('nodemailer');

const testSMTP = async () => {
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'opusatlas@gmail.com',
      pass: 'sua-app-password',
    },
  });

  try {
    await transporter.sendMail({
      from: 'opusatlas@gmail.com',
      to: 'seu-email-teste@gmail.com',
      subject: 'Teste SMTP Opus Atlas',
      text: 'Email de teste enviado com sucesso!',
    });
    console.log('SMTP: ✅ Sucesso');
  } catch (error) {
    console.log('SMTP: ❌ Erro', error.message);
  }
};
```

---

## 5. OpenAI API (Opcional)

### 5.1 Criar Conta

1. Acesse [OpenAI Platform](https://platform.openai.com)
2. Registrar/Login
3. **Billing** → Adicionar método de pagamento
4. **Usage limits** → Configurar limites

### 5.2 Gerar API Key

1. **API Keys** → **Create new secret key**
2. **Name**: `Opus Atlas Production`
3. **Permissions**: Restricted
4. **Allowed actions**:
   - Model capabilities: ✅
   - Model inference: ✅
5. Copiar chave (começa com `sk-proj-...`)

### 5.3 Configurações de Uso

```env
OPENAI_API_KEY="sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890..."

# Configurações opcionais
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1000"
OPENAI_TEMPERATURE="0.7"
```

### 5.4 Teste OpenAI

```javascript
const testOpenAI = async () => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em música clássica.',
        },
        { role: 'user', content: 'Fale brevemente sobre Bach.' },
      ],
      max_tokens: 100,
    }),
  });

  const data = await response.json();
  console.log('OpenAI:', data.choices?.[0]?.message ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 6. Groq API (Alternativa IA)

### 6.1 Criar Conta

1. Acesse [Groq Console](https://console.groq.com)
2. Registrar com GitHub/Google
3. **API Keys** → **Create API Key**
4. **Name**: `Opus Atlas`
5. Copiar chave (começa com `gsk_...`)

### 6.2 Vantagens do Groq

- **Velocidade**: ~10x mais rápido que OpenAI
- **Gratuito**: Tier generoso gratuito
- **Models**: Llama 2, Mixtral, Gemma

### 6.3 Configuração Groq

```env
GROQ_API_KEY="gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"

# Configurações
GROQ_MODEL="llama2-70b-4096"
GROQ_MAX_TOKENS="1000"
GROQ_TEMPERATURE="0.7"
```

### 6.4 Teste Groq

```javascript
const testGroq = async () => {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em música clássica.',
          },
          { role: 'user', content: 'Fale brevemente sobre Mozart.' },
        ],
        max_tokens: 100,
      }),
    }
  );

  const data = await response.json();
  console.log('Groq:', data.choices?.[0]?.message ? '✅ Sucesso' : '❌ Erro');
};
```

---

## 7. SendGrid (Email Marketing)

### 7.1 Criar Conta

1. Acesse [SendGrid](https://sendgrid.com)
2. **Start for Free**
3. Verificar email e completar onboarding

### 7.2 Configurar Sender Identity

1. **Settings** → **Sender Authentication**
2. **Single Sender Verification**
3. **Create New Sender**:
   ```
   From Name: Opus Atlas
   From Email: opusatlas@gmail.com
   Reply To: opusatlas@gmail.com
   Company: Opus Atlas
   Address: Sua cidade, Estado
   ```
4. Verificar email enviado

### 7.3 Gerar API Key

1. **Settings** → **API Keys**
2. **Create API Key**
3. **API Key Name**: `Opus Atlas Production`
4. **API Key Permissions**: Restricted Access
5. **Selected permissions**:
   - Mail Send: Full Access
   - Marketing Campaigns: Full Access
   - Template Engine: Full Access
6. Copiar chave (começa com `SG.`)

### 7.4 Configuração SendGrid

```env
SENDGRID_API_KEY="SG.AbCdEfGhIjKlMnOpQrStUvWxYz.1234567890"
SENDGRID_FROM_EMAIL="opusatlas@gmail.com"
SENDGRID_FROM_NAME="Opus Atlas"
```

### 7.5 Configurar Webhook (Opcional)

1. **Settings** → **Mail Settings** → **Event Webhook**
2. **HTTP POST URL**: `https://opusatlas.com.br/api/webhooks/sendgrid`
3. **Select Actions**:
   - Delivered ✅
   - Opens ✅
   - Clicks ✅
   - Bounces ✅
   - Spam Reports ✅

---

## 8. Configuração no Código

### 8.1 Arquivo .env Completo

```env
# =============================================================================
# OPUS ATLAS - CONFIGURAÇÃO COMPLETA DE SERVIÇOS
# =============================================================================

NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="mongodb://opusatlas:SenhaSuperSegura!@opus-atlas-mongodb-prod:27017/opus_atlas_prod?authSource=admin&replicaSet=rs0"
REDIS_URL="redis://:SenhaSuperSeguraRedis!@opus-atlas-redis:6379"

# =============================================================================
# NEXTAUTH.JS
# =============================================================================
NEXTAUTH_URL="https://opusatlas.com.br"
NEXTAUTH_SECRET="super-secret-production-key-change-this-in-prod-2024"

# =============================================================================
# GOOGLE SERVICES
# =============================================================================
GOOGLE_CLIENT_ID="123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz"
YOUTUBE_API_KEY="AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567"

# =============================================================================
# SPOTIFY API
# =============================================================================
SPOTIFY_CLIENT_ID="a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
SPOTIFY_CLIENT_SECRET="z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0"

# =============================================================================
# CLOUDINARY
# =============================================================================
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"

# =============================================================================
# EMAIL SMTP
# =============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="opusatlas@gmail.com"
SMTP_PASS="abcd efgh ijkl mnop"

# =============================================================================
# AI SERVICES (OPCIONAL)
# =============================================================================
# OpenAI
OPENAI_API_KEY="sk-proj-AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
OPENAI_MODEL="gpt-3.5-turbo"
OPENAI_MAX_TOKENS="1000"
OPENAI_TEMPERATURE="0.7"

# Groq (Alternativa mais rápida)
GROQ_API_KEY="gsk_AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
GROQ_MODEL="llama2-70b-4096"
GROQ_MAX_TOKENS="1000"
GROQ_TEMPERATURE="0.7"

# =============================================================================
# EMAIL MARKETING (OPCIONAL)
# =============================================================================
SENDGRID_API_KEY="SG.AbCdEfGhIjKlMnOpQrStUvWxYz.1234567890"
SENDGRID_FROM_EMAIL="opusatlas@gmail.com"
SENDGRID_FROM_NAME="Opus Atlas"

# =============================================================================
# CONFIGURAÇÕES ADICIONAIS
# =============================================================================
# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="900000"

# Upload Settings
MAX_FILE_SIZE="10485760"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp,image/gif"

# Cache TTL
CACHE_TTL_SECONDS="3600"
REDIS_TTL_SECONDS="1800"

# Feature Flags
ENABLE_AI_BIOGRAPHIES="true"
ENABLE_SPOTIFY_INTEGRATION="true"
ENABLE_EMAIL_MARKETING="true"
ENABLE_ANALYTICS="true"

# Debug
DEBUG="opus:*"
LOG_LEVEL="info"
```

### 8.2 Configuração NextAuth

```javascript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
}
```

### 8.3 Configuração Cloudinary

```javascript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

---

## 9. Scripts de Teste

### 9.1 Script de Teste Geral

Criar `scripts/test-all-services.js`:

```javascript
#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const tests = [
  {
    name: 'YouTube API',
    test: async () => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=Bach&type=video&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`
      );
      return response.ok;
    },
  },
  {
    name: 'Spotify API',
    test: async () => {
      const credentials = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64');
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });
      return response.ok;
    },
  },
  {
    name: 'Cloudinary',
    test: async () => {
      const formData = new FormData();
      formData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET);
      formData.append(
        'file',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=='
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      return response.ok;
    },
  },
];

const runTests = async () => {
  console.log('🧪 Testando serviços externos...\n');

  for (const { name, test } of tests) {
    try {
      const result = await test();
      console.log(`${result ? '✅' : '❌'} ${name}`);
    } catch (error) {
      console.log(`❌ ${name} - Erro: ${error.message}`);
    }
  }

  console.log('\n✨ Testes concluídos!');
};

runTests();
```

### 9.2 Executar Testes

```bash
# Tornar executável
chmod +x scripts/test-all-services.js

# Executar
node scripts/test-all-services.js

# Ou adicionar ao package.json
{
  "scripts": {
    "test:services": "node scripts/test-all-services.js"
  }
}
```

---

## 10. Troubleshooting

### 10.1 Problemas Comuns

#### Google OAuth "redirect_uri_mismatch"

```bash
# Erro: The redirect URI in the request does not match
# Solução: Verificar URLs exatas no Google Console
# Deve ser exatamente: http://localhost:3000/api/auth/callback/google
```

#### YouTube API "quotaExceeded"

```bash
# Erro: Daily quota exceeded
# Solução: Aguardar reset (00:00 PST) ou aumentar quota
# Verificar: Google Cloud Console → APIs & Services → Quotas
```

#### Spotify "invalid_client"

```bash
# Erro: Invalid client credentials
# Solução: Verificar Client ID e Secret
# Re-gerar credenciais se necessário
```

#### Cloudinary "upload_preset not found"

```bash
# Erro: Invalid upload preset
# Solução: Criar preset "musical-encyclopedia" como unsigned
```

### 10.2 Verificação de Conectividade

```bash
# Testar conectividade básica
curl -I https://www.googleapis.com/youtube/v3/
curl -I https://accounts.spotify.com/api/token
curl -I https://api.cloudinary.com/
curl -I https://api.openai.com/
```

### 10.3 Logs de Debug

```javascript
// Adicionar ao .env para debug
DEBUG = 'oauth,youtube,spotify,cloudinary';
LOG_LEVEL = 'debug';

// No código
console.log('API Response:', {
  service: 'youtube',
  status: response.status,
  headers: response.headers,
  body: await response.text(),
});
```

---

## 11. Checklist Final

### ✅ Antes do Deploy

- [ ] Todas as APIs configuradas
- [ ] Credenciais adicionadas ao .env
- [ ] Scripts de teste passando
- [ ] URLs de callback configuradas
- [ ] Quotas/limits verificados

### ✅ Em Produção

- [ ] Variáveis de ambiente corretas
- [ ] URLs HTTPS configuradas
- [ ] Monitoramento de APIs ativo
- [ ] Logs de erro configurados
- [ ] Backup de credenciais seguro

---

**Configuração concluída! 🎉**

Todos os serviços externos estão prontos para uso. Execute `npm run test:services` para verificar se tudo está funcionando.
