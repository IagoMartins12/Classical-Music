// app/libs/prismadb.ts - SOLUÇÃO UNIVERSAL BUILD-SAFE
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// DETECÇÃO DE BUILD TIME
const IS_BUILD_TIME =
  process.env.DATABASE_URL?.includes('build:build@localhost') ||
  (process.env.NODE_ENV === 'production' &&
    typeof window === 'undefined' &&
    !process.env.VERCEL);

// DADOS MOCK BÁSICOS PARA BUILD TIME
const EMPTY_RESULT: any[] = [];
const EMPTY_COUNT = 0;
const EMPTY_OBJECT = null;

// MOCK DATA MÍNIMO (para páginas que precisam de estrutura específica)
const MOCK_COMPOSER = {
  id: 'mock-composer-1',
  name: 'Build Mock',
  fullName: 'Build Time Mock Composer',
  epochName: 'Classical',
  portraitUrl: null,
  bio: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  epoch: { id: 'mock-epoch', name: 'Classical' },
  works: [],
  _count: { works: 0 },
};

const MOCK_WORK = {
  id: 'mock-work-1',
  title: 'Build Time Mock Work',
  composer: MOCK_COMPOSER,
  epoch: { id: 'mock-epoch', name: 'Classical' },
  instrument: { id: 'mock-instrument', name: 'Piano' },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const MOCK_EPOCH = {
  id: 'mock-epoch-1',
  name: 'Classical',
};

// FACTORY PARA RESULTADOS MOCK
const createMockResult = (model: string, operation: string, args: any) => {
  if (IS_BUILD_TIME) {
    console.log(`🔧 Build time detected - mocking ${model}.${operation}`);

    switch (operation) {
      case 'findMany':
        const take = args?.take || 0;
        if (model === 'composer')
          return take > 0 ? [MOCK_COMPOSER] : EMPTY_RESULT;
        if (model === 'work') return take > 0 ? [MOCK_WORK] : EMPTY_RESULT;
        if (model === 'epoch') return take > 0 ? [MOCK_EPOCH] : EMPTY_RESULT;
        return EMPTY_RESULT;

      case 'findFirst':
      case 'findUnique':
        if (model === 'composer') return MOCK_COMPOSER;
        if (model === 'work') return MOCK_WORK;
        if (model === 'epoch') return MOCK_EPOCH;
        return EMPTY_OBJECT;

      case 'count':
        return EMPTY_COUNT;

      case 'aggregate':
        return { _count: { id: EMPTY_COUNT } };

      case 'create':
      case 'update':
      case 'upsert':
        if (model === 'composer') return MOCK_COMPOSER;
        if (model === 'work') return MOCK_WORK;
        return EMPTY_OBJECT;

      case 'delete':
      case 'deleteMany':
        return { count: 0 };

      case 'createMany':
      case 'updateMany':
        return { count: 0 };

      default:
        return EMPTY_RESULT;
    }
  }

  return null; // Não é build time, prosseguir normalmente
};

// CRIAR INSTÂNCIA REAL DO PRISMA
const realPrisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = realPrisma;
}

// PROXY UNIVERSAL PARA INTERCEPTAR TODAS AS OPERAÇÕES
const createModelProxy = (modelName: string) => {
  return new Proxy(
    {},
    {
      get(target, operation) {
        return async (...args: any[]) => {
          // Se for build time, retornar mock
          const mockResult = createMockResult(
            modelName,
            operation as string,
            args[0]
          );
          if (mockResult !== null) {
            return mockResult;
          }

          // Caso contrário, usar Prisma real
          try {
            const model = (realPrisma as any)[modelName];
            if (model && typeof model[operation as string] === 'function') {
              return await model[operation as string](...args);
            }

            console.warn(
              `Operation ${operation as string} not found on model ${modelName}`
            );
            return EMPTY_RESULT;
          } catch (error) {
            console.error(
              `Prisma operation failed: ${modelName}.${operation as string}`,
              error
            );

            // Fallback para erro - retornar estrutura vazia
            if ((operation as string).includes('find')) {
              return (operation as string) === 'findMany'
                ? EMPTY_RESULT
                : EMPTY_OBJECT;
            }
            if ((operation as string) === 'count') {
              return EMPTY_COUNT;
            }

            throw error;
          }
        };
      },
    }
  );
};

// PROXY PRINCIPAL PARA INTERCEPTAR ACESSO AOS MODELOS
const prisma = new Proxy(realPrisma, {
  get(target, modelName) {
    // Se for build time e for um modelo, retornar proxy mock
    if (
      IS_BUILD_TIME &&
      typeof modelName === 'string' &&
      modelName !== 'constructor'
    ) {
      // Lista COMPLETA dos modelos do schema
      const models = [
        // Modelos principais
        'user',
        'composer',
        'work',
        'epoch',
        'role',
        'instrument',
        'workGenre',

        // Modelos de partitura e conteúdo
        'workScore',
        'annotation',
        'workAnnotation',
        'annotationHelpfulVote',

        // Modelos de usuário e favoritos
        'userInstrument',
        'favoriteWork',
        'favoriteComposer',
        'favoriteScore',
        'scoreFavoriteStats',
        'wantToLearn',
        'learned',

        // Modelos de autenticação
        'account',
        'session',
        'userToken',

        // Modelos de upload e moderação
        'uploadHistory',
        'uploadModeration',
        'generatedReport',

        // Modelos de publicidade
        'advertisement',
        'adStats',

        // Modelos de newsletter
        'newsletterSubscriber',
        'newsletterTemplate',
        'newsletterCampaign',
        'newsletterCampaignSend',
        'newsletterEmailEvent',
        'testEmailList',
        'templateFragment',

        // Modelos do sistema professor-aluno
        'teacher',
        'student',
        'teacherStudent',
        'lesson',
        'assignment',

        // Modelos de notificação e atividade
        'notification',
        'schoolActivity',

        // Modelos de conquistas
        'userAchievement',
        'achievementProgress',

        // Modelos de relatórios compartilhados
        'sharedProgressReport',
        'sharedReportComment',
      ];

      if (models.includes(modelName)) {
        return createModelProxy(modelName);
      }
    }

    // Operações não-modelo ou runtime normal
    return Reflect.get(target, modelName);
  },
});

// LOG DE STATUS
if (IS_BUILD_TIME) {
  console.log('🔧 PRISMA BUILD-SAFE MODE ACTIVATED');
  console.log('📦 All database operations will return mock data during build');
} else {
  console.log('🚀 PRISMA RUNTIME MODE - Real database operations enabled');
}

export default prisma;
