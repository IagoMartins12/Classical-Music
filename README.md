# Opus Atlas - Plataforma Educacional de Música Clássica

> Uma plataforma educacional completa que combina catálogo de partituras com ferramentas de aprendizado, sistema professor-aluno e gamificação integrada.

## Visão Geral

**Opus Atlas** é uma plataforma moderna para música clássica que oferece:

- 📚 **19.177 compositores** e **207.883 obras** catalogadas
- 🎓 **Sistema professor-aluno** completo com aulas e tarefas
- 🏆 **75 tipos de conquistas** e sistema de gamificação
- 🎵 **Ferramentas de estudo** com milestone tracking
- 📝 **Anotações da comunidade** públicas
- 🎬 **Upload de performances** pessoais
- 📊 **Analytics com IA** e dashboards completos

### Números do Sistema

- **247 páginas** implementadas
- **124 APIs** funcionais
- **41 tabelas** no banco
- **28 sistemas principais** + **47 mini-sistemas**

---

## Stack Tecnológico

- **Frontend/Backend**: Next.js 15.3.2, React 19, TypeScript 5.8.3
- **Banco de Dados**: MongoDB 7.0 (Replica Set) + Redis 7.2
- **Infraestrutura**: Docker + Nginx + Ubuntu 24.04.3
- **Monitoramento**: Grafana + Prometheus + Uptime Kuma
- **CDN/Segurança**: Cloudflare + Let's Encrypt SSL

---

## Quick Start

### 1. Pré-requisitos

- Node.js 20.x
- Docker & Docker Compose
- Git

### 2. Instalação Rápida

```bash
# Clone
git clone https://github.com/IagoMartins12/Classical-Music.git
cd Classical-Music

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Editar .env.local com suas configurações

# Start database
docker-compose up -d mongodb-dev redis

# Setup Prisma
npx prisma generate
npx prisma db push

# Start development
npm run dev
```

Aplicação disponível em: http://localhost:3000

---

## Documentação Completa

### 📋 Guias de Setup

- **[🚀 Instalação Completa](docs/INSTALLATION.md)** - Setup desenvolvimento + todas as APIs
- **[🏭 Deploy em Produção](docs/PRODUCTION.md)** - Deploy VPS completo com Docker
- **[🔧 Configuração de Serviços](docs/SERVICES.md)** - APIs externas (Google, Spotify, YouTube, etc.)

### 📚 Documentação Técnica

- **[🏗️ Arquitetura do Sistema](docs/ARCHITECTURE.md)** - 28 sistemas, 41 tabelas, 247 páginas
- **[📡 APIs e Integrações](docs/API.md)** - 124 rotas documentadas
- **[💾 Banco de Dados](docs/DATABASE.md)** - Schema completo e relacionamentos

### 🚀 Infraestrutura e Operações

- **[📊 Monitoramento](docs/MONITORING.md)** - Grafana, Prometheus, Uptime Kuma
- **[🔒 Segurança](docs/SECURITY.md)** - Hardening, SSL, firewall, backup
- **[⚡ Performance](docs/PERFORMANCE.md)** - Otimizações, cache, CDN
- **[🛠️ Comandos Operacionais](docs/OPERATIONS.md)** - Deploy, backup, troubleshooting

### 💻 Desenvolvimento

- **[🔀 CI/CD](docs/CICD.md)** - GitHub Actions, deploy automático
- **[🐛 Troubleshooting](docs/TROUBLESHOOTING.md)** - Problemas comuns e soluções
- **[🤝 Contribuição](docs/CONTRIBUTING.md)** - Como contribuir com o projeto

---

## Ambiente de Desenvolvimento

### Variáveis de Ambiente Essenciais

```bash
# Database
DATABASE_URL="mongodb://localhost:27017/opus_atlas_dev"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret"

# APIs Principais (ver docs/SERVICES.md para detalhes)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
SPOTIFY_CLIENT_ID="your-spotify-client-id"
SPOTIFY_CLIENT_SECRET="your-spotify-secret"
YOUTUBE_API_KEY="your-youtube-api-key"
```

📋 **[Ver configuração completa de todas as APIs →](docs/SERVICES.md)**

### Comandos de Desenvolvimento

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run lint         # Linting
npm run type-check   # Type checking
npx prisma studio    # Database GUI
```

---

## Deploy em Produção

### Infraestrutura Recomendada

- **Servidor**: 8GB RAM, 2 vCPUs, 100GB SSD
- **OS**: Ubuntu 24.04.3 LTS
- **Domínio**: Configurado no Cloudflare

### Deploy Rápido

```bash
# No servidor
git clone https://github.com/IagoMartins12/Classical-Music.git
cd Classical-Music

# Setup completo (ver docs/PRODUCTION.md)
./scripts/production-setup.sh

# Deploy
docker-compose up -d
```

🏭 **[Guia completo de produção →](docs/PRODUCTION.md)**

---

## Monitoramento

### URLs de Produção

- **Aplicação**: https://opusatlas.com.br
- **Monitoramento**: https://monitor.opusatlas.com.br
- **Grafana**: :3003 (admin / sua-senha)
- **Uptime Kuma**: :3002

### Dashboards Disponíveis

- Sistema Completo (14 painéis)
- Métricas do Servidor (CPU, RAM, Disco)
- Containers Docker
- MongoDB Performance
- Uptime e Disponibilidade

📊 **[Guia completo de monitoramento →](docs/MONITORING.md)**

---

## Estrutura do Projeto

```
Classical-Music/
├── app/                    # Next.js App Router (247 páginas)
├── components/            # Componentes React reutilizáveis
├── lib/                   # Utilitários e configurações
├── prisma/               # Schema do banco (41 tabelas)
├── docs/                 # 📚 Documentação completa
├── scripts/              # Scripts de automação
├── docker-compose.yml    # Orquestração Docker
└── README.md            # Este arquivo
```

---

## Funcionalidades Principais

### Para Estudantes

- Catálogo completo de partituras clássicas
- Sistema "Quero Aprender" / "Já Aprendi"
- Upload de vídeos de performance
- Sistema de conquistas e badges
- Anotações pessoais e da comunidade

### Para Professores

- Dashboard completo de gestão
- Sistema de aulas com agendamento
- Criação e correção de tarefas
- Relatórios de progresso dos alunos
- Calendário integrado

### Para Administradores

- Analytics avançados com IA
- Sistema de moderação
- Newsletter automática
- Backup e monitoramento
- Gestão completa de conteúdo

🏗️ **[Arquitetura completa do sistema →](docs/ARCHITECTURE.md)**

---

## API e Integrações

### APIs Internas

- **124 rotas** organizadas por módulo
- **GraphQL-like** queries para performance
- **Rate limiting** e cache Redis
- **Documentação** Swagger/OpenAPI

### Integrações Externas

- **IMSLP**: Scraping automático de partituras
- **YouTube/Spotify**: Busca de performances
- **Google OAuth**: Autenticação social
- **Cloudinary**: Upload otimizado de imagens
- **SendGrid**: Sistema de email
- **OpenAI/Groq**: IA para biografias

📡 **[Documentação completa das APIs →](docs/API.md)**

---

## Segurança

### Medidas Implementadas

- SSL/TLS obrigatório (Let's Encrypt)
- Firewall UFW + Fail2ban
- Autenticação JWT + OAuth
- Rate limiting nas APIs
- Headers de segurança
- Backup automático criptografado

🔒 **[Guia completo de segurança →](docs/SECURITY.md)**

---

## Performance

### Otimizações

- CDN Cloudflare global
- Cache Redis multi-layer
- Compressão Nginx (gzip + brotli)
- Images WebP responsivas
- Bundle splitting automático
- Database indexing otimizado

⚡ **[Guia completo de performance →](docs/PERFORMANCE.md)**

---

## Status do Projeto

- ✅ **MVP Completo**: Sistema base funcional
- ✅ **Sistema Educacional**: Professor-aluno implementado
- ✅ **Gamificação**: 75 badges e sistema XP
- ✅ **Monitoramento**: Dashboards enterprise
- ✅ **Infraestrutura**: Deploy produção completo
- 🔄 **Em desenvolvimento**: App mobile nativo

---

## Contribuição

Contribuições são bem-vindas! Por favor:

1. Leia o [guia de contribuição](docs/CONTRIBUTING.md)
2. Faça fork do projeto
3. Crie uma feature branch
4. Faça commit das mudanças
5. Abra um Pull Request

### Reportar Issues

- 🐛 **Bugs**: Use o template de bug report
- ✨ **Features**: Use o template de feature request
- ❓ **Dúvidas**: Use GitHub Discussions

---

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

## Links Úteis

- 🌐 **Demo**: https://opusatlas.com.br
- 📊 **Status**: https://monitor.opusatlas.com.br
- 📧 **Contato**: opusatlas@gmail.com
- 📱 **Issues**: [GitHub Issues](https://github.com/IagoMartins12/Classical-Music/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/IagoMartins12/Classical-Music/discussions)

---

**Desenvolvido por**: Iago Martins  
**Arquitetura**: Claude (Anthropic)  
**Status**: ✅ Produção Completa  
**Última atualização**: Dezembro 2024
