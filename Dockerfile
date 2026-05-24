# Multi-stage build otimizado para Next.js 15
FROM node:20.18.1-alpine AS base
RUN apk add --no-cache libc6-compat curl
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build application
FROM base AS builder
COPY package.json package-lock.json* ./
RUN npm ci
RUN apk add --no-cache ffmpeg
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Configurações de build otimizadas - AUMENTANDO MEMÓRIA
ENV NODE_OPTIONS="--max-old-space-size=3072"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

# URLs fake mas válidas para build
ENV DATABASE_URL="mongodb://build:build@localhost:27017/build"
ENV NEXTAUTH_SECRET="build-secret-temp"
ENV NEXTAUTH_URL="http://localhost:3000"

# Build da aplicação
RUN npm run build

# Stage 3: Production runtime
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=512"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Criar diretórios com permissões corretas
RUN mkdir -p /app/logs /app/SystemLogs /app/logs/imslp/analysis
RUN chown -R nextjs:nodejs /app

# Copiar build standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/credentials ./credentials

# Criar arquivos necessários
RUN touch /app/logs/imslp/analysis/prediction_model.json
RUN chown -R nextjs:nodejs /app

# Criar diretório uploads com permissões corretas
RUN mkdir -p /app/public/uploads && \
    chown -R nextjs:nodejs /app/public/uploads && \
    chmod -R 755 /app/public/uploads

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]