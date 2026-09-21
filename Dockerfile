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

# O Prisma não é mais gerado aqui: nenhum arquivo da aplicação o importa
# (Etapa 7). Ele segue no projeto como dependência de desenvolvimento, para os
# scripts de manutenção e de raspagem que ainda leem o banco direto — e esses
# não rodam dentro da imagem.

# Configurações de build otimizadas - AUMENTANDO MEMÓRIA
ENV NODE_OPTIONS="--max-old-space-size=3072"
ENV NEXT_TELEMETRY_DISABLED=1
ENV SKIP_ENV_VALIDATION=true

# URLs fake mas válidas para build
ENV DATABASE_URL="mongodb://build:build@localhost:27017/build"
ENV NEXTAUTH_SECRET="build-secret-temp"
ENV NEXTAUTH_URL="http://localhost:3000"

# ---------------------------------------------------------------------------
# Endereço da API durante o build — obrigatório.
#
# O build gera as páginas públicas, e para isso ele **chama a API**. Sem um
# endereço que responda, as páginas saem sem conteúdo — antes elas saíam assim
# em silêncio; hoje o build falha, porque as páginas deixaram de engolir a
# falha (ver os comentários em `[lang]/(main)/*/pageServer.tsx`). Falhar é o
# comportamento correto: melhor um build quebrado que uma imagem inteira de
# páginas vazias, servidas com `s-maxage` por horas.
#
#   docker build --build-arg NEST_API_URL=http://api:4000/api .
#
# `NEST_API_URL` é o endereço que o servidor do Next usa (rede interna);
# `NEXT_PUBLIC_API_URL` é o que vai para o navegador e precisa ser público.
# ---------------------------------------------------------------------------
ARG NEST_API_URL
ARG NEXT_PUBLIC_API_URL
ENV NEST_API_URL=${NEST_API_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN test -n "$NEST_API_URL" || \
    (echo "ERRO: NEST_API_URL não informado. O build gera as páginas públicas chamando a API." && exit 1)

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

# O balanceador precisa saber quando esta réplica parou de servir. `/api/health`
# é a rota de saúde do próprio Next (não toca a API nem o banco de propósito:
# é liveness, não readiness).
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS "http://localhost:${PORT:-3000}/api/health" || exit 1

CMD ["node", "server.js"]