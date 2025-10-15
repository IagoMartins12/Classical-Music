// app/requests/uploads.ts - CORRIGIDO - OTIMIZADO PARA PERFORMANCE
import prisma from '@/app/libs/prismadb';
import { revalidatePath, unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';
import { composersByEpoch } from './music-history-translated';

export interface UserUpload {
  id: string;
  title: string;
  type: 'composer' | 'work' | 'score';
  createdAt: string;
  updatedAt: string;
  isIMSLP: boolean;
  imslpId?: string;
  imslpPermlink?: string;
  epochName?: string;
  composerName?: string;
  composerId?: string;
  instrumentName?: string;
  workGenres?: string[];
  categoryNames?: string[];
  verificationStatus?: string;
  pageCount?: string;
  fileSize?: string;
  dataQuality?: string;
  portraitUrl?: string;
  workTitle?: string;
  workId?: string;
  downloadUrl?: string;
  isVerified?: boolean;
}

// 🚀 FUNÇÃO PRINCIPAL OTIMIZADA - QUERIES CONDICIONAIS CORRIGIDAS
export const getUserUploads = unstable_cache(
  async ({
    userId,
    page = 1,
    limit = 24,
    search = '',
    type = 'all',
    epochId = '',
    composerId = '',
    workId = '',
    limitPerType = false,
  }: {
    userId: string;
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    epochId?: string;
    composerId?: string;
    workId?: string;
    limitPerType?: boolean;
  }) => {
    try {
      const offset = (page - 1) * limit;
      const itemsPerTypeLimit = 16;

      // 🚀 OTIMIZAÇÃO 1: Queries condicionais - só buscar o que precisa
      const shouldGetComposers = type === 'all' || type === 'composer';
      const shouldGetWorks = type === 'all' || type === 'work';
      const shouldGetScores = type === 'all' || type === 'score';

      // 🚀 OTIMIZAÇÃO 2: WHERE clauses corrigidas com tipos corretos
      const composerWhere: Prisma.ComposerWhereInput = shouldGetComposers
        ? {
            createdBy: userId,
            ...(search && {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  fullName: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }),
            ...(epochId && { epochId }),
          }
        : {};

      const workWhere: Prisma.WorkWhereInput = shouldGetWorks
        ? {
            createdBy: userId,
            ...(search && {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  composer: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                      {
                        fullName: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                    ],
                  },
                },
              ],
            }),
            ...(epochId && { epochId }),
            ...(composerId && { composerId }),
          }
        : {};

      const scoreWhere: Prisma.WorkScoreWhereInput = shouldGetScores
        ? {
            uploadedBy: userId,
            source: { in: ['CUSTOM', 'UPLOAD'] },
            ...(search && {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  work: {
                    title: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              ],
            }),
            ...(workId && { workId }),
            ...(epochId && { work: { epochId } }),
          }
        : {};

      // 🚀 OTIMIZAÇÃO 3: Queries paralelas condicionais corrigidas
      const queries = [];

      if (shouldGetComposers) {
        queries.push(
          prisma.composer.findMany({
            where: composerWhere,
            select: {
              id: true,
              name: true,
              fullName: true,
              portraitUrl: true,
              createdAt: true,
              updatedAt: true,
              imslpId: true,
              dataQuality: true,
              verificationStatus: true,
              epoch: { select: { name: true } },
            },
            take:
              type === 'composer'
                ? limit
                : limitPerType
                  ? itemsPerTypeLimit
                  : undefined,
            skip: type === 'composer' ? offset : undefined,
            orderBy: { createdAt: 'desc' },
          })
        );
      } else {
        queries.push(Promise.resolve([]));
      }

      if (shouldGetWorks) {
        queries.push(
          prisma.work.findMany({
            where: workWhere,
            select: {
              id: true,
              title: true,
              opOrCatalog: true,
              createdAt: true,
              updatedAt: true,
              imslpId: true,
              imslpPermlink: true,
              composer: {
                select: {
                  id: true,
                  name: true,
                  fullName: true,
                },
              },
              epoch: { select: { name: true } },
              instrument: { select: { name: true } },
              workGenresArr: true,
              categoryNames: true,
            },
            take:
              type === 'work'
                ? limit
                : limitPerType
                  ? itemsPerTypeLimit
                  : undefined,
            skip: type === 'work' ? offset : undefined,
            orderBy: { createdAt: 'desc' },
          })
        );
      } else {
        queries.push(Promise.resolve([]));
      }

      if (shouldGetScores) {
        queries.push(
          prisma.workScore.findMany({
            where: scoreWhere,
            select: {
              id: true,
              title: true,
              source: true,
              fileSize: true,
              pageCount: true,
              downloadUrl: true,
              dataQuality: true,
              verificationStatus: true,
              createdAt: true,
              updatedAt: true,
              work: {
                select: {
                  id: true,
                  title: true,
                  composer: {
                    select: {
                      id: true,
                      name: true,
                      fullName: true,
                    },
                  },
                },
              },
            },
            take:
              type === 'score'
                ? limit
                : limitPerType
                  ? itemsPerTypeLimit
                  : undefined,
            skip: type === 'score' ? offset : undefined,
            orderBy: { createdAt: 'desc' },
          })
        );
      } else {
        queries.push(Promise.resolve([]));
      }

      const [composers, works, scores] = await Promise.all(queries);

      // 🚀 OTIMIZAÇÃO 4: Sempre buscar counts de todos os tipos para estatísticas corretas
      const [composerCount, workCount, scoreCount] = await Promise.all([
        // Sempre buscar count de compositores (para estatísticas)
        prisma.composer.count({
          where: {
            createdBy: userId,
            ...(search && {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  fullName: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            }),
            ...(epochId && { epochId }),
          },
        }),

        // Sempre buscar count de obras (para estatísticas)
        prisma.work.count({
          where: {
            createdBy: userId,
            ...(search && {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  composer: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                      {
                        fullName: {
                          contains: search,
                          mode: Prisma.QueryMode.insensitive,
                        },
                      },
                    ],
                  },
                },
              ],
            }),
            ...(epochId && { epochId }),
            ...(composerId && { composerId }),
          },
        }),

        // Sempre buscar count de partituras (para estatísticas)
        prisma.workScore.count({
          where: {
            uploadedBy: userId,
            source: { in: ['CUSTOM', 'UPLOAD'] },
            ...(search && {
              OR: [
                {
                  title: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  work: {
                    title: {
                      contains: search,
                      mode: Prisma.QueryMode.insensitive,
                    },
                  },
                },
              ],
            }),
            ...(workId && { workId }),
            ...(epochId && { work: { epochId } }),
          },
        }),
      ]);
      const totalCount = composerCount + workCount + scoreCount;

      // 🚀 OTIMIZAÇÃO 5: Processamento completamente separado para evitar union type issues
      const items: UserUpload[] = [];

      // Processar compositores com type assertion
      const composerResults = composers as Array<{
        id: string;
        name: string;
        fullName: string;
        portraitUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
        imslpId: string | null;
        dataQuality: string | null;
        verificationStatus: string | null;
        epoch: { name: string };
      }>;

      composerResults.forEach((composer) => {
        items.push({
          id: composer.id,
          title: composer.fullName || composer.name,
          type: 'composer',
          createdAt: composer.createdAt.toISOString(),
          updatedAt: composer.updatedAt.toISOString(),
          isIMSLP: !!composer.imslpId,
          imslpId: composer.imslpId || undefined,
          epochName: composer.epoch.name,
          dataQuality: composer.dataQuality || undefined,
          verificationStatus: composer.verificationStatus || undefined,
          portraitUrl: composer.portraitUrl || undefined,
        });
      });

      // Processar obras com type assertion
      const workResults = works as Array<{
        id: string;
        title: string;
        opOrCatalog: string | null;
        createdAt: Date;
        updatedAt: Date;
        imslpId: string;
        imslpPermlink: string;
        composer: {
          id: string;
          name: string;
          fullName: string;
        };
        epoch: { name: string };
        instrument: { name: string };
        workGenresArr: string[];
        categoryNames: string[];
      }>;

      workResults.forEach((work) => {
        items.push({
          id: work.id,
          title: work.title,
          type: 'work',
          createdAt: work.createdAt.toISOString(),
          updatedAt: work.updatedAt.toISOString(),
          isIMSLP: !!work.imslpId,
          imslpId: work.imslpId || undefined,
          imslpPermlink: work.imslpPermlink,
          epochName: work.epoch.name,
          composerName: work.composer.fullName || work.composer.name,
          composerId: work.composer.id,
          instrumentName: work.instrument.name,
          workGenres: work.workGenresArr,
          categoryNames: work.categoryNames,
        });
      });

      // Processar partituras com type assertion
      const scoreResults = scores as Array<{
        id: string;
        title: string;
        source: any;
        fileSize: string | null;
        pageCount: string | null;
        downloadUrl: string | null;
        dataQuality: string | null;
        verificationStatus: string | null;
        createdAt: Date;
        updatedAt: Date;
        work: {
          id: string;
          title: string;
          composer: {
            id: string;
            name: string;
            fullName: string;
          };
        };
      }>;

      scoreResults.forEach((score) => {
        items.push({
          id: score.id,
          title: score.title,
          type: 'score',
          createdAt: score.createdAt.toISOString(),
          updatedAt: score.updatedAt.toISOString(),
          isIMSLP: score.source === 'IMSLP',
          composerName:
            score.work.composer.fullName || score.work.composer.name,
          composerId: score.work.composer.id,
          workTitle: score.work.title,
          workId: score.work.id,
          fileSize: score.fileSize || undefined,
          pageCount: score.pageCount || undefined,
          downloadUrl: score.downloadUrl || undefined,
          dataQuality: score.dataQuality || undefined,
          verificationStatus: score.verificationStatus || undefined,
        });
      });

      // Ordenar e limitar apenas se necessário
      if (type === 'all') {
        items.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (!limitPerType) {
          const finalItems = items.slice(offset, offset + limit);
          return {
            items: finalItems,
            composers,
            works,
            scores,
            totalCount,
            composerCount,
            workCount,
            scoreCount,
            hasMoreComposers: composerCount > itemsPerTypeLimit,
            hasMoreWorks: workCount > itemsPerTypeLimit,
            hasMoreScores: scoreCount > itemsPerTypeLimit,
          };
        }
      }

      return {
        items,
        composers,
        works,
        scores,
        totalCount,
        composerCount,
        workCount,
        scoreCount,
        hasMoreComposers: composerCount > itemsPerTypeLimit,
        hasMoreWorks: workCount > itemsPerTypeLimit,
        hasMoreScores: scoreCount > itemsPerTypeLimit,
      };
    } catch (error) {
      console.error('Erro ao buscar uploads do usuário:', error);
      return {
        items: [],
        composers: [],
        works: [],
        scores: [],
        totalCount: 0,
        composerCount: 0,
        workCount: 0,
        scoreCount: 0,
        hasMoreComposers: false,
        hasMoreWorks: false,
        hasMoreScores: false,
      };
    }
  },
  ['user-uploads'],
  {
    revalidate: 1800, // 🚀 Cache mais longo: 30 minutos
    tags: ['user-uploads'],
  }
);

// 🚀 LAZY LOADING: Dados para filtros - só quando necessário
export const getFilterData = unstable_cache(
  async (userId: string) => {
    try {
      const [userComposers, userWorks] = await Promise.all([
        prisma.composer.findMany({
          where: { createdBy: userId },
          select: {
            id: true,
            name: true,
            fullName: true,
          },
          orderBy: { name: 'asc' },
          take: 50, // 🚀 Reduzir para 50
        }),
        prisma.work.findMany({
          where: { createdBy: userId },
          select: {
            id: true,
            title: true,
            composer: {
              select: {
                name: true,
                fullName: true,
              },
            },
          },
          orderBy: { title: 'asc' },
          take: 50, // 🚀 Reduzir para 50
        }),
      ]);

      return {
        composers: userComposers,
        works: userWorks.map((work) => ({
          id: work.id,
          title: work.title,
          composerName: work.composer.fullName || work.composer.name,
        })),
      };
    } catch (error) {
      console.error('Erro ao buscar dados para filtros:', error);
      return {
        composers: [],
        works: [],
      };
    }
  },
  ['filter-data'],
  {
    revalidate: 3600, // 🚀 Cache longo: 1 hora
    tags: ['filter-data'],
  }
);

// 🚀 LAZY LOADING: Épocas disponíveis - só quando filtro for aberto
export const getAvailableEpochs = unstable_cache(
  async (userId: string, type: string = 'all') => {
    try {
      // 🚀 Otimizar query baseada no tipo
      const epochIds: string[] = [];

      if (type === 'all' || type === 'composer') {
        const composerEpochs = await prisma.composer.findMany({
          where: { createdBy: userId },
          select: { epochId: true },
          distinct: ['epochId'],
        });
        epochIds.push(...composerEpochs.map((c) => c.epochId));
      }

      if (type === 'all' || type === 'work') {
        const workEpochs = await prisma.work.findMany({
          where: { createdBy: userId },
          select: { epochId: true },
          distinct: ['epochId'],
        });
        epochIds.push(...workEpochs.map((w) => w.epochId));
      }

      if (type === 'all' || type === 'score') {
        const scoreEpochs = await prisma.workScore.findMany({
          where: {
            source: { in: ['CUSTOM', 'UPLOAD'] },
            uploadedBy: userId,
          },
          select: {
            work: { select: { epochId: true } },
          },
          distinct: ['workId'],
        });
        epochIds.push(...scoreEpochs.map((s) => s.work.epochId));
      }

      const uniqueEpochIds = [...new Set(epochIds)];

      if (uniqueEpochIds.length === 0) {
        return [];
      }

      const epochs = await prisma.epoch.findMany({
        where: { id: { in: uniqueEpochIds } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });

      return epochs;
    } catch (error) {
      console.error('Erro ao buscar épocas disponíveis:', error);
      return [];
    }
  },
  ['available-epochs'],
  {
    revalidate: 3600, // 🚀 Cache longo: 1 hora
    tags: ['available-epochs'],
  }
);

// 🚀 SIMPLIFICADO: Dados básicos para epochs (sempre precisamos)
export const getEpochsCache = unstable_cache(
  async () => {
    try {
      return await prisma.epoch.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      console.error('Erro ao buscar épocas:', error);
      return [];
    }
  },
  ['epochs-cache'],
  {
    revalidate: 7200, // 🚀 Cache muito longo: 2 horas
    tags: ['epochs'],
  }
);

// 🚀 LAZY LOADING: Form data só quando modal abrir
export const getFormDataPage = unstable_cache(
  async () => {
    try {
      const allComposerNames = Object.values(composersByEpoch).flat();

      const [epochs, instruments, roles, composers] = await Promise.all([
        prisma.epoch.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        prisma.instrument.findMany({
          select: { id: true, name: true, category: true },
          orderBy: { name: 'asc' },
        }),
        prisma.role.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        prisma.composer.findMany({
          where: {
            OR: allComposerNames.map((composerName) => ({
              OR: [
                {
                  fullName: {
                    equals: composerName,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  name: {
                    equals: composerName,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            })),
          },
          select: {
            id: true,
            name: true,
            fullName: true,
            epoch: { select: { name: true } },
            _count: { select: { works: true } },
          },
          take: 30, // 🚀 Reduzir para 30
          orderBy: [{ birthDate: 'asc' }, { name: 'asc' }],
        }),
      ]);

      // 🚀 Simplificar busca de works
      const composerIds = composers.map((c) => c.id);
      const works = await prisma.work.findMany({
        where: { composerId: { in: composerIds } },
        select: {
          id: true,
          title: true,
          composerId: true,
          composer: { select: { id: true, name: true, fullName: true } },
        },
        take: 30, // 🚀 Reduzir drasticamente
        orderBy: { title: 'asc' },
      });

      const formattedComposers = composers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName,
        worksCount: composer._count.works,
      }));

      const formattedWorks = works.map((work) => ({
        id: work.id,
        title: work.title,
        composer: {
          id: work.composer.id,
          fullName: work.composer.fullName,
          name: work.composer.name,
        },
      }));

      return {
        epochs,
        instruments,
        roles,
        composers: formattedComposers,
        works: formattedWorks,
      };
    } catch (error) {
      console.error('Erro ao buscar dados para a página de formulário:', error);
      return {
        epochs: [],
        instruments: [],
        roles: [],
        composers: [],
        works: [],
      };
    }
  },
  ['form-data-page'],
  {
    revalidate: 7200, // 🚀 Cache muito longo: 2 horas
    tags: ['form-data-page'],
  }
);

// 🚀 API ROUTE: Para refresh manual
export async function refreshUserUploads(_userId: string) {
  const { revalidateTag } = await import('next/cache');

  // 🚀 Invalidação seletiva
  revalidateTag('user-uploads');
  revalidateTag('filter-data');
  revalidateTag('available-epochs');

  revalidatePath('/uploads');

  return { success: true };
}

// 🚀 INVALIDAÇÃO INTELIGENTE: Só invalida o que mudou
export async function revalidateUploadsCache(
  _userId?: string,
  type?: 'composer' | 'work' | 'score'
) {
  const { revalidateTag } = await import('next/cache');

  // Sempre invalidar uploads do usuário
  revalidateTag('user-uploads');

  // Invalidar filtros se criou/editou composer ou work
  if (type === 'composer' || type === 'work') {
    revalidateTag('filter-data');
    revalidateTag('available-epochs');
  }

  // Invalidar form data só se necessário
  if (type === 'composer') {
    revalidateTag('form-data-page');
  }

  revalidatePath('/uploads');
}

// Manter função legada para compatibilidade
export const getAllUploads = getUserUploads;
export const getFormData = getFormDataPage;
export const getComposerFormData = unstable_cache(
  async () => {
    try {
      const [epochs, roles] = await Promise.all([
        prisma.epoch.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
        prisma.role.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' },
        }),
      ]);

      return { epochs, roles };
    } catch (error) {
      console.error(
        'Erro ao buscar dados para formulário do compositor:',
        error
      );
      return { epochs: [], roles: [] };
    }
  },
  ['composer-form-data'],
  {
    revalidate: 7200, // 🚀 Cache longo
    tags: ['composer-form-data'],
  }
);
