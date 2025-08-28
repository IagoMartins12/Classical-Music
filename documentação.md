Documentação Técnica Completa - Opus Atlas
Números e Estatísticas do Sistema
Quantidades Gerais

Páginas totais: 115 páginas
Rotas de API: 163 rotas
Tabelas do banco: 43 tabelas
Sistemas principais: 28 sistemas
Mini-sistemas: 47 mini-sistemas
Tipos de usuário: 4 (Casual, Estudante, Profissional, Professor)
Níveis de acesso: 3 (Usuário comum, Admin, Super Admin)

Detalhamento por Módulos
Sistema Público: 23 páginas
Sistema Protegido: 15 páginas
Sistema Professor: 18 páginas
Sistema Aluno: 12 páginas
Sistema Admin: 35 páginas
Páginas de Token: 6 páginas
Sistema Newsletter: 3 páginas

Arquitetura do Sistema
Stack Tecnológico
Frontend: Next.js 14 (App Router)
Backend: Next.js API Routes
Banco de Dados: MongoDB com Prisma ORM
Autenticação: NextAuth.js
Upload de Arquivos: Sistema próprio + CDN
Scraping: Cheerio para IMSLP
Email: Sistema de newsletter integrado

28 Sistemas Principais Identificados

Sistema de Autenticação

Login/Registro
OAuth Google
Recuperação de senha
Verificação de email

Sistema de Usuários

Perfis personalizados
Onboarding multi-etapas
Tipos de usuário

Sistema de Favoritos

Favoritos de compositores
Favoritos de obras
Favoritos de partituras específicas

Sistema Quero Aprender/Já Aprendi

Lista de estudos
Progresso com milestones
Avaliações e métricas

Sistema de Anotações

Anotações públicas/privadas
Categorização avançada
Sistema de votos úteis

Sistema de Upload

Upload de compositores
Upload de obras
Upload de partituras

Sistema de Scraping IMSLP

Extração automática de dados
Bulk discovery de compositores
Cache de partituras

Sistema de Gamificação/Conquistas

75 badges diferentes
Sistema de XP
Streak tracking

Sistema Professor-Aluno

Relacionamento professor-aluno
Convites e aprovações
Dashboard específico

Sistema de Aulas

Agendamento
Recorrência
Status tracking

Sistema de Tarefas

Criação de assignments
Submissão de vídeos
Sistema de feedback

Sistema de Calendário

Visualização mensal/semanal
Conflitos de horário
Integração com aulas

Sistema de Notificações

26 tipos de notificação
Sistema de prioridades
Prevenção de duplicatas

Sistema de Atividades Escolares

Tracking de ações
Histórico detalhado
Relatórios de atividade

Sistema de Moderação

Reports de conteúdo
Aprovação/Rejeição
Bulk actions

Sistema de Newsletter

Subscriber management
Campanhas automáticas
Templates personalizados

Sistema de Analytics

Métricas de usuário
Performance de conteúdo
Insights com IA

Sistema de Backup

Backup completo/seletivo
Agendamento automático
Restore point

Sistema de Publicidade

Gestão de anúncios
Targeting avançado
Analytics de performance

Sistema de Limpeza

Arquivos órfãos
Cleanup automático
Recuperação de espaço

Sistema de Tokens

Confirmação de email
Reset de senha
Convites diversos

Sistema de Revisões

Avaliações de professores
Sistema de estrelas
Moderação de reviews

Sistema de Instrumentos

Catálogo de instrumentos
Associação com usuários
Níveis de proficiência

Sistema de Épocas/Períodos

Classificação histórica
Filtros por período
Estatísticas por época

Sistema de Gêneros

Categorização musical
Tags automáticas
Filtros avançados

Sistema de Mídia

YouTube integration
Spotify integration
Áudio customizado

Sistema de Relatórios

Geração automática
Múltiplos formatos
Dados estatísticos

Sistema de Cache

Cache de partituras
Performance optimization
Invalidação inteligente

47 Mini-sistemas Identificados
Verificação de duplicatas
Processamento de imagens
Geração de thumbnails
Detecção de conflitos de aula
Sistema de milestone tracking
Preview de partituras
Agrupamento de partituras
Sistema de tags
Filtros avançados de busca
Paginação inteligente
View toggles (card/list)
Sistema de ordenação
Bulk selection
Export de dados
Sistema de cores para listas
Auto-refresh de dados
Sistema de prioridades
Prevenção de spam
Rate limiting
Sistema de qualidade de dados
Verificação de links
Processamento de vídeos
Sistema de aspectRatio
Responsive image processing
Sistema de webhooks
Email templates dinâmicos
Sistema de variáveis
A/B testing para emails
Sistema de segmentação
Tracking de abertura/clique
Sistema de bounce handling
Auto-cleanup de dados
Sistema de logs estruturados
Monitoramento de performance
Sistema de alertas
Health check automático
Sistema de throttling
Queue management
Sistema de retry
Error tracking
Sistema de métricas
Dashboard widgets
Sistema de permissões
Role-based access
Sistema de auditoria
Watermarking de uploads
Sistema de versionamento

Schema do Banco de Dados
41 Tabelas Principais

User - Usuários do sistema
Account - Contas OAuth
Session - Sessões ativas
UserToken - Tokens de verificação
Composer - Compositores
Work - Obras musicais
WorkScore - Partituras das obras
Epoch - Períodos históricos
Role - Papéis dos compositores
Instrument - Instrumentos musicais
WorkGenre - Gêneros musicais
UserInstrument - Instrumentos do usuário
Annotation - Anotações simples
WorkAnnotation - Anotações avançadas
AnnotationHelpfulVote - Votos em anotações
FavoriteWork - Obras favoritas
FavoriteComposer - Compositores favoritos
FavoriteScore - Partituras favoritas
ScoreFavoriteStats - Estatísticas de favoritos
WantToLearn - Lista quero aprender
Learned - Lista já aprendi
Teacher - Perfis de professores
Student - Perfis de alunos
TeacherStudent - Relacionamento professor-aluno
Lesson - Aulas
Assignment - Tarefas
TeacherReview - Avaliações de professores
Notification - Notificações
SchoolActivity - Atividades escolares
UserAchievement - Conquistas do usuário
AchievementProgress - Progresso de conquistas
Advertisement - Anúncios
AdStats - Estatísticas de anúncios
NewsletterSubscriber - Assinantes
NewsletterTemplate - Templates de email
NewsletterCampaign - Campanhas
NewsletterCampaignSend - Envios de campanha
NewsletterEmailEvent - Eventos de email
TestEmailList - Listas de teste
UploadHistory - Histórico de uploads
UploadModeration - Moderação de uploads

Funcionalidades por Módulo
Módulo Público (23 páginas)
Páginas de Navegação:

/ - Homepage
/about-us - Sobre nós
/contact - Contato
/help - Central de ajuda
/faq - Perguntas frequentes
/support - Suporte técnico
/terms - Termos de uso
/privacy - Política de privacidade
/copyright - Direitos autorais

Páginas de Conteúdo:

/music-history - História da música
/instruments - Instrumentos
/composers - Catálogo de compositores
/composer/[id] - Perfil do compositor
/works - Catálogo de obras
/works/[id] - Detalhes da obra
/genres - Gêneros musicais

Funcionalidades Principais:

Sistema de busca avançada
Filtros por época, instrumento, dificuldade
Preview de partituras
Player de áudio/vídeo integrado
Sistema de cache inteligente

Módulo Protegido (15 páginas)
Páginas de Usuário:

/profile - Perfil do usuário
/favorites - Favoritos
/learning - Quero aprender/Já aprendi
/annotations - Anotações
/uploads - Gerenciar uploads
/uploads/history - Histórico

Funcionalidades:

Sistema de conquistas/badges
Progresso de aprendizado
Anotações públicas/privadas
Upload de conteúdo
Sistema de moderação

Módulo Professor (18 páginas)
Dashboard e Gestão:

/teacher - Dashboard principal
/teacher/students - Meus alunos
/teacher/students/[id] - Perfil do aluno
/teacher/lessons - Todas as aulas
/teacher/lessons/[id] - Detalhes da aula
/teacher/lessons/create - Criar aula
/teacher/calendar - Calendário

Sistema de Tarefas:

/teacher/assignments - Todas as tarefas
/teacher/assignments/[id] - Detalhes da tarefa
/teacher/assignments/create - Criar tarefa

Funcionalidades:

Agendamento de aulas recorrentes
Sistema de convites para alunos
Relatórios de progresso
Sistema de feedback

Módulo Aluno (12 páginas)
Dashboard e Aulas:

/student - Dashboard
/student/lessons - Minhas aulas
/student/lessons/[id] - Detalhes da aula
/student/calendar - Calendário
/student/assignments - Minhas tarefas
/student/assignments/[id] - Detalhes da tarefa

Progresso:

/student/progress - Meu progresso
/student/history - Histórico de atividades

Funcionalidades:

Upload de vídeos de performance
Sistema de milestone tracking
Notificações de aula
Relatórios de progresso

Módulo Admin (35 páginas)
Dashboard Principal:

/admin - Overview geral
/admin/analytics - Analytics avançados
/admin/insights - Insights com IA

Gestão de Usuários:

/admin/users - Gerenciar usuários
/admin/users/list - Lista completa

Gestão de Conteúdo:

/admin/composers - Compositores
/admin/works - Obras
/admin/scores - Partituras
/admin/uploads - Uploads

Sistema de Newsletter:

/admin/newsletter - Dashboard
/admin/newsletter/subscribers - Assinantes
/admin/newsletter/campaigns - Campanhas
/admin/newsletter/templates - Templates
/admin/newsletter/analytics - Analytics
/admin/newsletter/test-lists - Listas de teste

Sistema e Backup:

/admin/backup - Backup automático
/admin/system - Monitoramento
/admin/orphan-files - Limpeza

Outras Funcionalidades:

Sistema de relatórios automáticos
Moderação de conteúdo
Gestão de publicidade
Analytics com IA

APIs e Integrações
124 Rotas de API Identificadas
Autenticação (7 rotas):

/api/auth/[...nextauth]
/api/auth/check-email-status
/api/auth/confirm-account/[token]
/api/auth/forgot-password
/api/auth/reset-password
/api/auth/confirm-email-change/[token]

Gestão de Usuários (12 rotas):

/api/student/_ (8 rotas)
/api/teacher/_ (15 rotas)
/api/profile/\* (2 rotas)

Conteúdo Musical (25 rotas):

/api/composers/_ (5 rotas)
/api/works/_ (6 rotas)
/api/uploads/\* (20 rotas)

Sistema Educacional (18 rotas):

/api/lessons/_ (3 rotas)
/api/assignments/_ (2 rotas)
/api/learning/_ (2 rotas)
/api/favorites/_ (3 rotas)

Moderação e Admin (25 rotas):

/api/admin/_ (35 rotas total)
/api/reports/_ (7 rotas)

Newsletter (12 rotas):

/api/newsletter/\* (6 rotas)
