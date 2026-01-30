// app/api/admin/database/records/route.ts - CORRIGIDO
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import { getSearchableFields } from '@/app/libs/database/prismaSchemaExtractor';

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

// 🔧 FUNÇÃO CORRIGIDA - Verifica se é ObjectId antes de aplicar filtro
function isValidObjectId(str: string): boolean {
  // MongoDB ObjectId tem exatamente 24 caracteres hexadecimais
  return /^[0-9a-fA-F]{24}$/.test(str);
}

// Helper para construir a cláusula WHERE com filtros
function buildWhereClause(
  model: string,
  search?: string,
  filters?: Record<string, any>
) {
  const where: any = {};

  // 🔧 CORREÇÃO: Busca de texto - usar campos pesquisáveis E validar ObjectId
  if (search) {
    const searchableFields = getSearchableFields(model);

    if (searchableFields.length > 0) {
      // 🔧 Se a busca parecer um ObjectId, buscar apenas no campo 'id'
      if (isValidObjectId(search)) {
        where.id = search;
      } else {
        // 🔧 Busca normal em campos String (não ObjectId)
        where.OR = searchableFields.map((field) => ({
          [field]: { contains: search, mode: 'insensitive' },
        }));
      }
    }
  }

  // Filtros específicos
  if (filters) {
    Object.entries(filters).forEach(([field, value]) => {
      if (value === null || value === undefined || value === '') return;

      // 🔧 CORREÇÃO: Se o campo termina com 'Id' e não é um ObjectId válido, ignorar
      if (field.endsWith('Id') || field === 'id') {
        if (typeof value === 'string' && !isValidObjectId(value)) {
          console.warn(`⚠️ Ignorando filtro inválido para ${field}: ${value}`);
          return;
        }
      }

      // Tratar diferentes tipos de filtros
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Filtro complexo (ex: { gte: 10, lte: 20 })
        where[field] = value;
      } else if (Array.isArray(value)) {
        // Filtro de array (ex: [1, 2, 3])
        where[field] = { in: value };
      } else {
        // Filtro simples
        where[field] = value;
      }
    });
  }

  return where;
}

// Helper para construir o select de campos
function buildSelectClause(selectedFields?: string[]) {
  if (!selectedFields || selectedFields.length === 0) {
    return undefined; // Retorna todos os campos
  }

  const select: Record<string, boolean> = {};
  selectedFields.forEach((field) => {
    select[field] = true;
  });

  // Sempre incluir o ID
  select.id = true;

  return select;
}

// Helper para buscar registros com todas as opções
async function fetchRecords(
  model: string,
  options: {
    page: number;
    pageSize: number;
    search?: string;
    sortField?: string;
    sortDirection?: 'asc' | 'desc';
    filters?: Record<string, any>;
    selectedFields?: string[];
  }
) {
  const prismaModel = getPrismaModel(model);

  if (!prismaModel) {
    throw new Error(`Model ${model} não encontrado`);
  }

  const {
    page,
    pageSize,
    search,
    sortField,
    sortDirection,
    filters,
    selectedFields,
  } = options;

  const skip = (page - 1) * pageSize;
  const take = pageSize;

  // Construir WHERE clause
  const where = buildWhereClause(model, search, filters);

  // Construir SELECT clause
  const select = buildSelectClause(selectedFields);

  // Construir ORDER BY
  let orderBy: any = {};

  if (sortField) {
    orderBy = { [sortField]: sortDirection || 'asc' };
  } else {
    // Modelos sem createdAt
    const modelsWithoutCreatedAt = [
      'Account',
      'Session',
      'UserInstrument',
      'Annotation',
      'FavoriteWork',
      'FavoriteComposer',
      'FavoriteScore',
      'WantToLearn',
      'Learned',
      'ScoreFavoriteStats',
      'BlogArticleCategory',
      'BlogArticleTag',
      'BlogCommentLike',
      'BlogLike',
      'BlogBookmark',
      'AnnotationHelpfulVote',
      'TeacherStudent',
      'CouponUsage',
      'NewsletterCampaignSend',
      'EventReminder',
    ];

    orderBy = modelsWithoutCreatedAt.includes(model)
      ? { id: 'desc' }
      : { createdAt: 'desc' };
  }

  try {
    const queryOptions: any = {
      where,
      skip,
      take,
      orderBy,
    };

    // Adicionar select apenas se houver campos selecionados
    if (select) {
      queryOptions.select = select;
    }

    const [records, total] = await Promise.all([
      prismaModel.findMany(queryOptions),
      prismaModel.count({ where }),
    ]);

    return { records, total };
  } catch (error) {
    console.error(`Erro ao buscar registros de ${model}:`, error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const model = searchParams.get('model');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '25');
    const search = searchParams.get('search') || undefined;
    const sortField = searchParams.get('sortField') || undefined;
    const sortDirection =
      (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc';

    // Campos selecionados (separados por vírgula)
    const selectedFieldsParam = searchParams.get('fields');
    const selectedFields = selectedFieldsParam
      ? selectedFieldsParam.split(',').filter(Boolean)
      : undefined;

    // Filtros (JSON string)
    const filtersParam = searchParams.get('filters');
    const filters = filtersParam ? JSON.parse(filtersParam) : undefined;

    if (!model) {
      return NextResponse.json(
        { error: 'Model não especificado' },
        { status: 400 }
      );
    }

    const { records, total } = await fetchRecords(model, {
      page,
      pageSize,
      search,
      sortField,
      sortDirection,
      filters,
      selectedFields,
    });

    return NextResponse.json({
      success: true,
      records,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      appliedFilters: filters,
      selectedFields: selectedFields,
    });
  } catch (error) {
    console.error('Erro na API de records:', error);
    return NextResponse.json(
      {
        error: 'Erro ao buscar registros',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { model, data } = await request.json();

    if (!model || !data) {
      return NextResponse.json(
        { error: 'Model e dados são obrigatórios' },
        { status: 400 }
      );
    }

    const prismaModel = getPrismaModel(model);

    if (!prismaModel) {
      return NextResponse.json(
        { error: `Model ${model} não encontrado` },
        { status: 404 }
      );
    }

    // Criar registro
    const record = await prismaModel.create({
      data,
    });

    return NextResponse.json({
      success: true,
      record,
      message: 'Registro criado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar registro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao criar registro',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { model, id, data } = await request.json();

    if (!model || !id || !data) {
      return NextResponse.json(
        { error: 'Model, ID e dados são obrigatórios' },
        { status: 400 }
      );
    }

    const prismaModel = getPrismaModel(model);

    if (!prismaModel) {
      return NextResponse.json(
        { error: `Model ${model} não encontrado` },
        { status: 404 }
      );
    }

    // Atualizar registro
    const record = await prismaModel.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      record,
      message: 'Registro atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    return NextResponse.json(
      {
        error: 'Erro ao atualizar registro',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 2) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { model, ids } = await request.json();

    if (!model || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Model e IDs são obrigatórios' },
        { status: 400 }
      );
    }

    const prismaModel = getPrismaModel(model);

    if (!prismaModel) {
      return NextResponse.json(
        { error: `Model ${model} não encontrado` },
        { status: 404 }
      );
    }

    // Deletar registros
    const result = await prismaModel.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `${result.count} registro(s) deletado(s) com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao deletar registros:', error);
    return NextResponse.json(
      {
        error: 'Erro ao deletar registros',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
