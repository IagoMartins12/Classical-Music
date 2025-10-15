# Guia Completo de Instalação - Opus Atlas

Este guia cobre a instalação completa do Opus Atlas para desenvolvimento local, incluindo configuração de todas as APIs e serviços externos.

## Pré-requisitos

### Software Necessário

- **Node.js**: 20.x ou superior
- **Docker**: 24.x ou superior + Docker Compose v2
- **Git**: Última versão
- **Editor**: VSCode recomendado

### Contas de Serviços (Necessárias)

- Google Cloud Console (OAuth + YouTube API)
- Spotify Developer Account
- Cloudinary Account
- Gmail/Google Account (SMTP)
- OpenAI Account (opcional)
- Groq Account (opcional)

---

## 1. Clone e Setup Inicial

### 1.1 Clonar Repositório

```bash
git clone https://github.com/IagoMartins12/Classical-Music.git
cd Classical-Music
```

### 1.2 Instalar Dependências

```bash
# Instalar dependências do projeto
npm install

# Verificar instalação
npm list --depth=0
```

### 1.3 Verificar Versões

```bash
node --version    # v20.x.x
npm --version     # 10.x.x
docker --version  # 24.x.x
```

---

## 2. Configuração do Banco de Dados

### 2.1 Docker Compose para Desenvolvimento

Criar `docker-compose.dev.yml`:

```yaml
services:
  mongodb-dev:
    image: mongo:7.0
    container_name: opus-atlas-mongodb-dev
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: opusdev
      MONGO_INITDB_ROOT_PASSWORD: DevPassword2024!
      MONGO_INITDB_DATABASE: opus_atlas_dev
    ports:
      - '27017:27017'
    volumes:
      - mongodb_dev_data:/data/db
    command: ['mongod', '--replSet', 'rs0']

  redis-dev:
    image: redis:7.2-alpine
    container_name: opus-atlas-redis-dev
    restart: unless-stopped
    command: redis-server --requirepass DevRedisPass2024! --appendonly yes
    ports:
      - '6379:6379'
    volumes:
      - redis_dev_data:/data

  mongo-express:
    image: mongo-express:1.0.2
    container_name: opus-atlas-mongo-express
    restart: unless-stopped
    ports:
      - '8081:8081'
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: opusdev
      ME_CONFIG_MONGODB_ADMINPASSWORD: DevPassword2024!
      ME_CONFIG_MONGODB_URL: mongodb://opusdev:DevPassword2024!@opus-atlas-mongodb-dev:27017/
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
    depends_on:
      - mongodb-dev

volumes:
  mongodb_dev_data:
  redis_dev_data:
```

### 2.2 Iniciar Banco de Dados

```bash
# Iniciar serviços
docker-compose -f docker-compose.dev.yml up -d

# Verificar status
docker-compose -f docker-compose.dev.yml ps

# Logs se necessário
docker-compose -f docker-compose.dev.yml logs mongodb-dev
```

### 2.3 Configurar Replica Set

```bash
# Conectar ao MongoDB
docker exec -it opus-atlas-mongodb-dev mongosh \
  --username opusdev \
  --password DevPassword2024! \
  --authenticationDatabase admin

# Inicializar replica set
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "opus-atlas-mongodb-dev:27017" }
  ]
})

# Verificar status
rs.status()

# Sair
exit
```

---

## 3. Configuração de Variáveis de Ambiente

### 3.1 Arquivo .env.local

Criar `.env.local` na raiz do projeto:

```env
# =============================================================================
# OPUS ATLAS - DESENVOLVIMENTO
# =============================================================================

NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# =============================================================================
# DATABASE
# =============================================================================
DATABASE_URL="mongodb://opusdev:DevPassword2024!@localhost:27017/opus_atlas_dev?authSource=admin&replicaSet=rs0"

# =============================================================================
# REDIS CACHE
# =============================================================================
REDIS_URL="redis://:DevRedisPass2024!@localhost:6379"

# =============================================================================
# NEXTAUTH.JS
# =============================================================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production-2024"

# =============================================================================
# GOOGLE SERVICES
# =============================================================================
# Google OAuth (necessário)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-google-client-secret"

# YouTube Data API (necessário)
YOUTUBE_API_KEY="AIzaSyYour-YouTube-API-Key"

# =============================================================================
# SPOTIFY API
# =============================================================================
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-client-secret"

# =============================================================================
# AI SERVICES (OPCIONAL)
# =============================================================================
# OpenAI (para biografias automáticas)
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# Groq (alternativa mais rápida)
GROQ_API_KEY="gsk_your-groq-api-key"

# =============================================================================
# EMAIL SMTP
# =============================================================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"

# =============================================================================
# CLOUDINARY (UPLOAD DE IMAGENS)
# =============================================================================
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
CLOUDINARY_UPLOAD_PRESET="musical-encyclopedia"

# =============================================================================
# CONFIGURAÇÕES OPCIONAIS
# =============================================================================
# Rate Limiting
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW_MS="900000"

# Upload Settings
MAX_FILE_SIZE="10485760"
ALLOWED_IMAGE_TYPES="image/jpeg,image/png,image/webp"

# Cache TTL
CACHE_TTL_SECONDS="3600"
REDIS_TTL_SECONDS="1800"

# =============================================================================
# DEBUG E LOGS
# =============================================================================
DEBUG="opus:*"
LOG_LEVEL="debug"
ENABLE_QUERY_LOGGING="true"
```

### 3.2 Arquivo .env.example

Criar `.env.example` para referência:

```env
# Copy this file to .env.local and fill in your values

# Database
DATABASE_URL="mongodb://opusdev:DevPassword2024!@localhost:27017/opus_atlas_dev?authSource=admin&replicaSet=rs0"
REDIS_URL="redis://:DevRedisPass2024!@localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret"

# Google Services
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
YOUTUBE_API_KEY="your-youtube-api-key"

# Spotify
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-secret"

# AI Services (optional)
OPENAI_API_KEY="sk-proj-your-openai-key"
GROQ_API_KEY="gsk_your-groq-key"

# Email
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_PRESET="your-upload-preset"
```

---

## 4. Configuração do Prisma

### 4.1 Gerar Prisma Client

```bash
# Gerar cliente Prisma
npx prisma generate

# Verificar geração
ls -la node_modules/.prisma/client/
```

### 4.2 Configurar Banco (Desenvolvimento)

```bash
# Push schema para o banco
npx prisma db push

# Verificar tabelas criadas
npx prisma studio
# Abre em: http://localhost:5555
```

### 4.3 Seed Inicial (Opcional)

Criar `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Criar épocas musicais
  const epochs = [
    { name: 'Medieval' },
    { name: 'Renaissance' },
    { name: 'Baroque' },
    { name: 'Classical' },
    { name: 'Romantic' },
    { name: '20th Century' },
    { name: 'Contemporary' },
  ];

  for (const epoch of epochs) {
    await prisma.epoch.upsert({
      where: { name: epoch.name },
      update: {},
      create: epoch,
    });
  }

  // Criar roles
  const roles = [
    { name: 'Composer' },
    { name: 'Pianist' },
    { name: 'Violinist' },
    { name: 'Conductor' },
    { name: 'Opera Singer' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // Criar instrumentos
  const instruments = [
    { name: 'Piano', category: 'Keyboard' },
    { name: 'Violin', category: 'Strings' },
    { name: 'Cello', category: 'Strings' },
    { name: 'Flute', category: 'Woodwinds' },
    { name: 'Trumpet', category: 'Brass' },
  ];

  for (const instrument of instruments) {
    await prisma.instrument.upsert({
      where: { name: instrument.name },
      update: {},
      create: instrument,
    });
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Executar seed:

```bash
# Adicionar ao package.json
"scripts": {
  "db:seed": "tsx prisma/seed.ts"
}

# Executar
npm run db:seed
```

---

## 5. Configuração de Serviços Externos

### 5.1 Google OAuth Setup

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie/selecione um projeto
3. Ative Google+ API
4. Vá para "Credenciais" → "Criar credenciais" → "ID do cliente OAuth 2.0"
5. Configure:
   - Tipo: Aplicação Web
   - URIs de redirect autorizados: `http://localhost:3000/api/auth/callback/google`
   - Origens JavaScript autorizadas: `http://localhost:3000`

### 5.2 YouTube API Setup

1. No mesmo projeto Google Cloud
2. Ative "YouTube Data API v3"
3. Crie credencial "Chave de API"
4. Restrinja por:
   - Referenciadores HTTP: `localhost:3000/*`
   - APIs: YouTube Data API v3

### 5.3 Spotify API Setup

1. Acesse [Spotify Developer](https://developer.spotify.com)
2. Criar App
3. Configure:
   - Redirect URIs: `http://localhost:3000/api/auth/callback/spotify`
   - Website: `http://localhost:3000`
4. Copie Client ID e Client Secret

### 5.4 Cloudinary Setup

1. Acesse [Cloudinary](https://cloudinary.com)
2. Crie conta gratuita
3. Dashboard → Settings → Upload
4. Crie upload preset:
   - Nome: `musical-encyclopedia`
   - Mode: Unsigned
   - Folder: `opus-atlas`

### 5.5 Gmail SMTP Setup

1. Acesse [Google Account Settings](https://myaccount.google.com)
2. Security → 2-Step Verification (ativar)
3. App passwords → Generate new
4. Escolha "Mail" → "Custom name"
5. Use a senha gerada no .env

---

## 6. Testes de Instalação

### 6.1 Verificar Conexões

```bash
# Testar MongoDB
docker exec opus-atlas-mongodb-dev mongosh \
  --username opusdev \
  --password DevPassword2024! \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"

# Testar Redis
docker exec opus-atlas-redis-dev redis-cli \
  -a DevRedisPass2024! ping
```

### 6.2 Verificar Prisma

```bash
# Testar conexão
npx prisma db pull --print

# Verificar schema
npx prisma validate

# Studio
npx prisma studio &
```

### 6.3 Testar APIs Externas

Criar `scripts/test-apis.js`:

```javascript
// Testar YouTube API
const testYouTube = async () => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=Bach&type=video&key=${process.env.YOUTUBE_API_KEY}`
  );
  console.log('YouTube API:', response.ok ? '✅' : '❌');
};

// Testar Spotify API
const testSpotify = async () => {
  const auth = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64');

  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  console.log('Spotify API:', tokenResponse.ok ? '✅' : '❌');
};

// Executar testes
testYouTube();
testSpotify();
```

---

## 7. Iniciar Desenvolvimento

### 7.1 Primeira Execução

```bash
# Verificar se tudo está pronto
npm run type-check
npm run lint

# Iniciar desenvolvimento
npm run dev
```

### 7.2 URLs Disponíveis

- **Aplicação**: http://localhost:3000
- **Prisma Studio**: http://localhost:5555
- **MongoDB Express**: http://localhost:8081 (admin/admin)
- **Redis**: localhost:6379

### 7.3 Verificações de Health

```bash
# API Health
curl http://localhost:3000/api/health

# Database
curl http://localhost:3000/api/db/health

# Cache
curl http://localhost:3000/api/cache/health
```

---

## 8. Scripts Utéis

### 8.1 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "npx prisma generate",
    "db:push": "npx prisma db push",
    "db:studio": "npx prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "npx prisma db push --force-reset && npm run db:seed",
    "test": "jest",
    "test:watch": "jest --watch",
    "prepare": "husky install"
  }
}
```

### 8.2 Scripts de Desenvolvimento

Criar `scripts/dev-setup.sh`:

```bash
#!/bin/bash
# Desenvolvimento - Setup completo

echo "🚀 Opus Atlas - Setup de Desenvolvimento"
echo "========================================="

# Verificar pré-requisitos
echo "📋 Verificando pré-requisitos..."
node --version
npm --version
docker --version

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Setup banco
echo "💾 Configurando banco de dados..."
docker-compose -f docker-compose.dev.yml up -d

# Aguardar banco
echo "⏳ Aguardando banco de dados..."
sleep 10

# Setup Prisma
echo "🔧 Configurando Prisma..."
npx prisma generate
npx prisma db push

# Seed inicial
echo "🌱 Executando seed inicial..."
npm run db:seed

echo "✅ Setup concluído!"
echo "🎯 Execute: npm run dev"
```

### 8.3 Scripts de Limpeza

Criar `scripts/dev-clean.sh`:

```bash
#!/bin/bash
# Limpeza desenvolvimento

echo "🧹 Limpando ambiente de desenvolvimento..."

# Parar containers
docker-compose -f docker-compose.dev.yml down -v

# Limpar node_modules
rm -rf node_modules package-lock.json

# Limpar build
rm -rf .next

# Limpar Prisma
rm -rf node_modules/.prisma

echo "✅ Limpeza concluída!"
echo "🔄 Execute: npm install && npm run dev"
```

---

## 9. Problemas Comuns

### 9.1 Erro de Conexão MongoDB

```bash
# Sintoma: Connection timeout
# Solução:
docker-compose -f docker-compose.dev.yml restart mongodb-dev
docker exec -it opus-atlas-mongodb-dev mongosh --eval "rs.status()"
```

### 9.2 Prisma Client Outdated

```bash
# Sintoma: PrismaClientInitializationError
# Solução:
npx prisma generate
npm run dev
```

### 9.3 API Keys Não Funcionando

```bash
# Verificar .env.local
cat .env.local | grep "CLIENT_ID\|API_KEY"

# Testar APIs
node scripts/test-apis.js
```

### 9.4 Porto 3000 em Uso

```bash
# Encontrar processo
lsof -ti:3000

# Matar processo
kill -9 $(lsof -ti:3000)

# Ou usar porta alternativa
PORT=3001 npm run dev
```

---

## 10. Próximos Passos

Após instalação bem-sucedida:

1. **Configurar IDE**:
   - Instalar extensões: Prisma, Tailwind CSS, TypeScript
   - Configurar ESLint e Prettier

2. **Explorar Sistema**:
   - Criar conta via Google OAuth
   - Testar funcionalidades principais
   - Verificar dashboards admin

3. **Desenvolvimento**:
   - Ler [ARCHITECTURE.md](ARCHITECTURE.md)
   - Consultar [API.md](API.md)
   - Seguir [CONTRIBUTING.md](CONTRIBUTING.md)

4. **Deploy**:
   - Ver [PRODUCTION.md](PRODUCTION.md) quando pronto

---

## Suporte

- **Issues**: [GitHub Issues](https://github.com/IagoMartins12/Classical-Music/issues)
- **Discussions**: [GitHub Discussions](https://github.com/IagoMartins12/Classical-Music/discussions)
- **Email**: opusatlas@gmail.com

---

**Instalação concluída com sucesso! 🎉**

Próximo passo: `npm run dev` e acesse http://localhost:3000
