// app/api/admin/database/models/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { extractPrismaModels } from '@/app/libs/database/prismaSchemaExtractor';

// Categorização dos models
const MODEL_CATEGORIES: Record<
  string,
  { category: string; displayName: string; icon?: string }
> = {
  // Core/Usuários
  User: { category: 'core', displayName: 'Usuários', icon: 'FiUsers' },
  Account: { category: 'core', displayName: 'Contas', icon: 'FiKey' },
  Session: { category: 'core', displayName: 'Sessões', icon: 'FiClock' },
  UserToken: { category: 'core', displayName: 'Tokens', icon: 'FiShield' },
  UserInstrument: {
    category: 'core',
    displayName: 'Instrumentos do Usuário',
    icon: 'FiMusic',
  },

  // Conteúdo Musical
  Composer: {
    category: 'content',
    displayName: 'Compositores',
    icon: 'FiUser',
  },
  Work: { category: 'content', displayName: 'Obras', icon: 'FiFileText' },
  WorkScore: { category: 'content', displayName: 'Partituras', icon: 'FiFile' },
  Epoch: { category: 'content', displayName: 'Épocas', icon: 'FiCalendar' },
  Role: { category: 'content', displayName: 'Papéis', icon: 'FiTag' },
  Instrument: {
    category: 'content',
    displayName: 'Instrumentos',
    icon: 'FiMusic',
  },
  WorkGenre: { category: 'content', displayName: 'Gêneros', icon: 'FiList' },

  // Social/Interação
  Annotation: {
    category: 'social',
    displayName: 'Anotações Privadas',
    icon: 'FiEdit',
  },
  WorkAnnotation: {
    category: 'social',
    displayName: 'Anotações Públicas',
    icon: 'FiMessageSquare',
  },
  AnnotationHelpfulVote: {
    category: 'social',
    displayName: 'Votos de Anotações',
    icon: 'FiThumbsUp',
  },
  FavoriteWork: {
    category: 'social',
    displayName: 'Obras Favoritas',
    icon: 'FiHeart',
  },
  FavoriteComposer: {
    category: 'social',
    displayName: 'Compositores Favoritos',
    icon: 'FiStar',
  },
  FavoriteScore: {
    category: 'social',
    displayName: 'Partituras Favoritas',
    icon: 'FiBookmark',
  },
  WantToLearn: {
    category: 'social',
    displayName: 'Quero Aprender',
    icon: 'FiTarget',
  },
  Learned: {
    category: 'social',
    displayName: 'Aprendidas',
    icon: 'FiCheckCircle',
  },

  // Blog
  BlogArticle: {
    category: 'content',
    displayName: 'Artigos do Blog',
    icon: 'FiFileText',
  },
  BlogCategory: {
    category: 'content',
    displayName: 'Categorias do Blog',
    icon: 'FiFolder',
  },
  BlogTag: { category: 'content', displayName: 'Tags do Blog', icon: 'FiHash' },
  BlogComment: {
    category: 'social',
    displayName: 'Comentários do Blog',
    icon: 'FiMessageCircle',
  },
  BlogLike: {
    category: 'social',
    displayName: 'Curtidas do Blog',
    icon: 'FiHeart',
  },
  BlogBookmark: {
    category: 'social',
    displayName: 'Salvos do Blog',
    icon: 'FiBookmark',
  },
  BlogMedia: {
    category: 'content',
    displayName: 'Mídia do Blog',
    icon: 'FiImage',
  },

  // Sistema Escola
  Teacher: { category: 'admin', displayName: 'Professores', icon: 'FiUsers' },
  Student: { category: 'admin', displayName: 'Alunos', icon: 'FiUser' },
  TeacherStudent: {
    category: 'admin',
    displayName: 'Relação Professor-Aluno',
    icon: 'FiLink',
  },
  Lesson: { category: 'admin', displayName: 'Aulas', icon: 'FiBook' },
  Assignment: {
    category: 'admin',
    displayName: 'Tarefas',
    icon: 'FiClipboard',
  },
  Notification: {
    category: 'system',
    displayName: 'Notificações',
    icon: 'FiBell',
  },
  SchoolActivity: {
    category: 'system',
    displayName: 'Atividades Escolares',
    icon: 'FiActivity',
  },

  // Gamificação
  UserAchievement: {
    category: 'social',
    displayName: 'Conquistas',
    icon: 'FiAward',
  },
  AchievementProgress: {
    category: 'social',
    displayName: 'Progresso de Conquistas',
    icon: 'FiTrendingUp',
  },
  ActivityLog: {
    category: 'system',
    displayName: 'Log de Atividades',
    icon: 'FiList',
  },

  // Assinaturas e Pagamentos
  Subscription: {
    category: 'admin',
    displayName: 'Assinaturas',
    icon: 'FiCreditCard',
  },
  Payment: {
    category: 'admin',
    displayName: 'Pagamentos',
    icon: 'FiDollarSign',
  },
  Invoice: { category: 'admin', displayName: 'Faturas', icon: 'FiFileText' },
  Coupon: { category: 'admin', displayName: 'Cupons', icon: 'FiGift' },
  CouponUsage: {
    category: 'admin',
    displayName: 'Uso de Cupons',
    icon: 'FiShoppingCart',
  },
  PlanPricing: {
    category: 'admin',
    displayName: 'Preços de Planos',
    icon: 'FiDollarSign',
  },

  // Marketing
  Advertisement: { category: 'admin', displayName: 'Anúncios', icon: 'FiEye' },
  AdStats: {
    category: 'admin',
    displayName: 'Estatísticas de Anúncios',
    icon: 'FiBarChart2',
  },
  NewsletterSubscriber: {
    category: 'admin',
    displayName: 'Inscritos Newsletter',
    icon: 'FiMail',
  },
  NewsletterCampaign: {
    category: 'admin',
    displayName: 'Campanhas de Email',
    icon: 'FiSend',
  },
  NewsletterTemplate: {
    category: 'admin',
    displayName: 'Templates de Email',
    icon: 'FiLayout',
  },
  TestEmailList: {
    category: 'admin',
    displayName: 'Listas de Teste',
    icon: 'FiList',
  },

  // Eventos
  Venue: {
    category: 'content',
    displayName: 'Salas de Concerto',
    icon: 'FiHome',
  },
  Event: { category: 'content', displayName: 'Eventos', icon: 'FiCalendar' },
  EventReminder: {
    category: 'system',
    displayName: 'Lembretes de Eventos',
    icon: 'FiBell',
  },
  ScrapingLog: {
    category: 'system',
    displayName: 'Logs de Scraping',
    icon: 'FiServer',
  },

  // Sistema
  UploadHistory: {
    category: 'system',
    displayName: 'Histórico de Uploads',
    icon: 'FiUpload',
  },
  UploadModeration: {
    category: 'system',
    displayName: 'Moderação de Uploads',
    icon: 'FiAlertTriangle',
  },
  GeneratedReport: {
    category: 'system',
    displayName: 'Relatórios Gerados',
    icon: 'FiFileText',
  },
  SharedProgressReport: {
    category: 'admin',
    displayName: 'Relatórios Compartilhados',
    icon: 'FiShare2',
  },
  SharedReportComment: {
    category: 'admin',
    displayName: 'Comentários de Relatórios',
    icon: 'FiMessageSquare',
  },
  BlogArticleVersion: {
    category: 'content',
    displayName: 'Versões de Artigos',
    icon: 'FiGitBranch',
  },
  BlogArticleCategory: {
    category: 'content',
    displayName: 'Artigos-Categorias',
    icon: 'FiLink',
  },
  BlogArticleTag: {
    category: 'content',
    displayName: 'Artigos-Tags',
    icon: 'FiLink',
  },
  NewsletterEmailEvent: {
    category: 'system',
    displayName: 'Eventos de Email',
    icon: 'FiActivity',
  },
  NewsletterCampaignSend: {
    category: 'system',
    displayName: 'Envios de Campanha',
    icon: 'FiSend',
  },
  SubscriptionHistory: {
    category: 'admin',
    displayName: 'Histórico de Assinaturas',
    icon: 'FiClock',
  },
  TemplateFragment: {
    category: 'admin',
    displayName: 'Fragmentos de Template',
    icon: 'FiCode',
  },
  ScoreFavoriteStats: {
    category: 'social',
    displayName: 'Estatísticas de Favoritos',
    icon: 'FiBarChart2',
  },
};

// Helper seguro para acessar modelos do Prisma
function getPrismaModel(modelName: string) {
  const models: Record<string, any> = {
    user: prisma.user,
    account: prisma.account,
    session: prisma.session,
    userToken: prisma.userToken,
    userInstrument: prisma.userInstrument,
    composer: prisma.composer,
    work: prisma.work,
    workScore: prisma.workScore,
    epoch: prisma.epoch,
    role: prisma.role,
    instrument: prisma.instrument,
    workGenre: prisma.workGenre,
    annotation: prisma.annotation,
    workAnnotation: prisma.workAnnotation,
    annotationHelpfulVote: prisma.annotationHelpfulVote,
    favoriteWork: prisma.favoriteWork,
    favoriteComposer: prisma.favoriteComposer,
    favoriteScore: prisma.favoriteScore,
    wantToLearn: prisma.wantToLearn,
    learned: prisma.learned,
    blogArticle: prisma.blogArticle,
    blogCategory: prisma.blogCategory,
    blogTag: prisma.blogTag,
    blogComment: prisma.blogComment,
    blogLike: prisma.blogLike,
    blogBookmark: prisma.blogBookmark,
    blogMedia: prisma.blogMedia,
    teacher: prisma.teacher,
    student: prisma.student,
    teacherStudent: prisma.teacherStudent,
    lesson: prisma.lesson,
    assignment: prisma.assignment,
    notification: prisma.notification,
    schoolActivity: prisma.schoolActivity,
    userAchievement: prisma.userAchievement,
    achievementProgress: prisma.achievementProgress,
    activityLog: prisma.activityLog,
    subscription: prisma.subscription,
    payment: prisma.payment,
    invoice: prisma.invoice,
    coupon: prisma.coupon,
    couponUsage: prisma.couponUsage,
    planPricing: prisma.planPricing,
    advertisement: prisma.advertisement,
    adStats: prisma.adStats,
    newsletterSubscriber: prisma.newsletterSubscriber,
    newsletterCampaign: prisma.newsletterCampaign,
    newsletterTemplate: prisma.newsletterTemplate,
    testEmailList: prisma.testEmailList,
    venue: prisma.venue,
    event: prisma.event,
    eventReminder: prisma.eventReminder,
    scrapingLog: prisma.scrapingLog,
    uploadHistory: prisma.uploadHistory,
    uploadModeration: prisma.uploadModeration,
    generatedReport: prisma.generatedReport,
    sharedProgressReport: prisma.sharedProgressReport,
    sharedReportComment: prisma.sharedReportComment,
    blogArticleVersion: prisma.blogArticleVersion,
    blogArticleCategory: prisma.blogArticleCategory,
    blogArticleTag: prisma.blogArticleTag,
    newsletterEmailEvent: prisma.newsletterEmailEvent,
    newsletterCampaignSend: prisma.newsletterCampaignSend,
    subscriptionHistory: prisma.subscriptionHistory,
    templateFragment: prisma.templateFragment,
    scoreFavoriteStats: prisma.scoreFavoriteStats,
    blogCommentLike: prisma.blogCommentLike,
  };

  const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
  return models[modelKey];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Extrair todos os modelos do Prisma DMMF
    const prismaModels = extractPrismaModels();

    // Buscar contagem de registros para cada model
    const models = await Promise.all(
      prismaModels.map(async (model) => {
        try {
          const prismaModel = getPrismaModel(model.name);

          // Obter info de categoria se existir, senão usar default
          const categoryInfo = MODEL_CATEGORIES[model.name] || {
            category: 'system',
            displayName: model.name,
            icon: 'FiDatabase',
          };

          if (!prismaModel) {
            console.warn(`Model ${model.name} não encontrado no Prisma`);
            return {
              name: model.name,
              displayName: categoryInfo.displayName,
              category: categoryInfo.category,
              icon: categoryInfo.icon,
              count: 0,
              totalFields: model.fields.length,
            };
          }

          const count = await prismaModel.count();

          return {
            name: model.name,
            displayName: categoryInfo.displayName,
            category: categoryInfo.category,
            icon: categoryInfo.icon,
            count,
            totalFields: model.fields.length,
          };
        } catch (error) {
          console.error(`Erro ao contar ${model.name}:`, error);
          return {
            name: model.name,
            displayName:
              MODEL_CATEGORIES[model.name]?.displayName || model.name,
            category: MODEL_CATEGORIES[model.name]?.category || 'system',
            icon: MODEL_CATEGORIES[model.name]?.icon || 'FiDatabase',
            count: 0,
            totalFields: model.fields.length,
          };
        }
      })
    );

    // Ordenar por categoria e nome
    const sortedModels = models.sort((a, b) => {
      if (a.category !== b.category) {
        const order = ['core', 'content', 'social', 'admin', 'system'];
        return order.indexOf(a.category) - order.indexOf(b.category);
      }
      return a.displayName.localeCompare(b.displayName);
    });

    return NextResponse.json({
      success: true,
      models: sortedModels,
      totalModels: sortedModels.length,
    });
  } catch (error) {
    console.error('Erro na API de models:', error);
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
