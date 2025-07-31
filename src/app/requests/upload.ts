// app/requests/uploads.ts - ATUALIZADO COM LIMITAÇÃO POR CATEGORIA
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';
import { Prisma } from '@prisma/client';

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

// Buscar uploads do usuário - ATUALIZADO COM LIMITAÇÃO POR CATEGORIA
export const getUserUploads = unstable_cache(
  async ({
    userId,
    page = 1,
    limit = 24,
    search = '',
    type = 'all',
    epochId = '',
    composerId = '', // 🆕 Novo filtro por compositor
    workId = '', // 🆕 Novo filtro por obra
    limitPerType = false, // 🆕 Quando true, limita a 16 itens por categoria na aba "all"
  }: {
    userId: string;
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    epochId?: string;
    composerId?: string; // 🆕
    workId?: string; // 🆕
    limitPerType?: boolean; // 🆕
  }) => {
    try {
      const offset = (page - 1) * limit;
      const itemsPerTypeLimit = 16; // Limite para cada categoria na aba "all"

      // Buscar compositores do usuário
      const composerWhere: Prisma.ComposerWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(epochId && { epochId }),
        AND: [{ createdBy: userId }],
      };

      const workWhere: Prisma.WorkWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            {
              composer: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { fullName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          ],
        }),
        ...(epochId && { epochId }),
        ...(composerId && { composerId }), // 🆕 Filtro por compositor
        AND: [{ createdBy: userId }],
      };

      const scoreWhere: Prisma.WorkScoreWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { work: { title: { contains: search, mode: 'insensitive' } } },
          ],
        }),
        ...(workId && { workId }), // 🆕 Filtro por obra
        ...(epochId && {
          work: { epochId },
        }),
        source: { in: ['CUSTOM', 'UPLOAD'] },
        ...(userId && { uploadedBy: userId }),
      };

      // Determinar limites baseado no tipo e configuração
      const getTypeLimit = (requestedType: string) => {
        if (type !== 'all') {
          // Se não é "all", usar paginação normal
          return type === requestedType ? limit : undefined;
        } else {
          // Se é "all" e limitPerType está ativo, limitar a 16
          return limitPerType ? itemsPerTypeLimit : undefined;
        }
      };

      const getTypeSkip = (requestedType: string) => {
        if (type !== 'all') {
          return type === requestedType ? offset : undefined;
        } else {
          // Na aba "all", não usar skip quando limitando por tipo
          return limitPerType ? undefined : undefined;
        }
      };

      const [composers, works, scores] = await Promise.all([
        type === 'all' || type === 'composer'
          ? prisma.composer.findMany({
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
              take: getTypeLimit('composer'),
              skip: getTypeSkip('composer'),
              orderBy: { createdAt: 'desc' },
            })
          : [],

        type === 'all' || type === 'work'
          ? prisma.work.findMany({
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
              take: getTypeLimit('work'),
              skip: getTypeSkip('work'),
              orderBy: { createdAt: 'desc' },
            })
          : [],

        type === 'all' || type === 'score'
          ? prisma.workScore.findMany({
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
              take: getTypeLimit('score'),
              skip: getTypeSkip('score'),
              orderBy: { createdAt: 'desc' },
            })
          : [],
      ]);

      // Contar totais - SEMPRE buscar totais completos
      const [composerCount, workCount, scoreCount] = await Promise.all([
        prisma.composer.count({ where: composerWhere }),
        prisma.work.count({ where: workWhere }),
        prisma.workScore.count({ where: scoreWhere }),
      ]);

      const totalCount = composerCount + workCount + scoreCount;

      // Combinar e formatar dados
      const items: UserUpload[] = [
        ...composers.map((composer) => ({
          id: composer.id,
          title: composer.fullName || composer.name,
          type: 'composer' as const,
          createdAt: composer.createdAt.toISOString(),
          updatedAt: composer.updatedAt.toISOString(),
          isIMSLP: !!composer.imslpId,
          imslpId: composer.imslpId || undefined,
          epochName: composer.epoch.name,
          dataQuality: composer.dataQuality || undefined,
          verificationStatus: composer.verificationStatus || undefined,
          portraitUrl: composer.portraitUrl || undefined,
        })),
        ...works.map((work) => ({
          id: work.id,
          title: work.title,
          type: 'work' as const,
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
        })),
        ...scores.map((score) => ({
          id: score.id,
          title: score.title,
          type: 'score' as const,
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
        })),
      ];

      // Ordenar por data de criação
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Para a aba "all", aplicar limit após ordenação se não estiver limitando por tipo
      const finalItems =
        type === 'all' && !limitPerType
          ? items.slice(offset, offset + limit)
          : items;

      return {
        items: finalItems,
        composers,
        works,
        scores,
        totalCount,
        composerCount,
        workCount,
        scoreCount,
        // 🆕 Indicadores se há mais itens de cada tipo
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
    revalidate: 300,
    tags: ['user-uploads'],
  }
);

// 🆕 Função para buscar dados específicos para filtros
export const getFilterData = unstable_cache(
  async (userId: string) => {
    try {
      // Buscar apenas compositores e obras do usuário para filtros
      const [userComposers, userWorks] = await Promise.all([
        prisma.composer.findMany({
          where: {
            AND: [{ createdBy: userId }],
          },
          select: {
            id: true,
            name: true,
            fullName: true,
          },
          orderBy: { name: 'asc' },
          take: 100, // Limitar para performance
        }),
        prisma.work.findMany({
          where: {
            AND: [{ createdBy: userId }],
          },
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
          take: 100, // Limitar para performance
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
    revalidate: 600, // 10 minutos
    tags: ['filter-data'],
  }
);

// 🆕 Função para buscar épocas disponíveis por tipo de upload do usuário
export const getAvailableEpochs = unstable_cache(
  async (userId: string, type: string = 'all') => {
    try {
      const epochIds: string[] = [];

      if (type === 'all' || type === 'composer') {
        const composerEpochs = await prisma.composer.findMany({
          where: {
            AND: [{ createdBy: userId }],
          },
          select: { epochId: true },
          distinct: ['epochId'],
        });
        epochIds.push(...composerEpochs.map((c) => c.epochId));
      }

      if (type === 'all' || type === 'work') {
        const workEpochs = await prisma.work.findMany({
          where: {
            AND: [{ createdBy: userId }],
          },
          select: { epochId: true },
          distinct: ['epochId'],
        });
        epochIds.push(...workEpochs.map((w) => w.epochId));
      }

      if (type === 'all' || type === 'score') {
        const scoreEpochs = await prisma.workScore.findMany({
          where: {
            source: { in: ['CUSTOM', 'UPLOAD'] },
            ...(userId && { uploadedBy: userId }),
          },
          select: {
            work: {
              select: { epochId: true },
            },
          },
          distinct: ['workId'],
        });
        epochIds.push(...scoreEpochs.map((s) => s.work.epochId));
      }

      // Remover duplicatas
      const uniqueEpochIds = [...new Set(epochIds)];

      // Buscar os dados completos das épocas
      const epochs = await prisma.epoch.findMany({
        where: {
          id: { in: uniqueEpochIds },
        },
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
    revalidate: 600, // 10 minutos
    tags: ['available-epochs'],
  }
);

// Manter outras funções existentes...
export const getAllUploads = unstable_cache(
  async ({
    page = 1,
    limit = 24,
    search = '',
    type = 'all',
    epochId = '',
  }: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    epochId?: string;
  }) => {
    try {
      const offset = (page - 1) * limit;

      const composerWhere: Prisma.ComposerWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(epochId && { epochId }),
      };

      const workWhere: Prisma.WorkWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            {
              composer: {
                OR: [
                  { name: { contains: search, mode: 'insensitive' } },
                  { fullName: { contains: search, mode: 'insensitive' } },
                ],
              },
            },
          ],
        }),
        ...(epochId && { epochId }),
      };

      const scoreWhere: Prisma.WorkScoreWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { work: { title: { contains: search, mode: 'insensitive' } } },
          ],
        }),
      };

      const [composers, works, scores] = await Promise.all([
        type === 'all' || type === 'composer'
          ? prisma.composer.findMany({
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
              take: type === 'composer' ? limit : undefined,
              skip: type === 'composer' ? offset : undefined,
              orderBy: { createdAt: 'desc' },
            })
          : [],

        type === 'all' || type === 'work'
          ? prisma.work.findMany({
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
              take: type === 'work' ? limit : undefined,
              skip: type === 'work' ? offset : undefined,
              orderBy: { createdAt: 'desc' },
            })
          : [],

        type === 'all' || type === 'score'
          ? prisma.workScore.findMany({
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
              take: type === 'score' ? limit : undefined,
              skip: type === 'score' ? offset : undefined,
              orderBy: { createdAt: 'desc' },
            })
          : [],
      ]);

      const [composerCount, workCount, scoreCount] = await Promise.all([
        type === 'all' || type === 'composer'
          ? prisma.composer.count({ where: composerWhere })
          : 0,
        type === 'all' || type === 'work'
          ? prisma.work.count({ where: workWhere })
          : 0,
        type === 'all' || type === 'score'
          ? prisma.workScore.count({ where: scoreWhere })
          : 0,
      ]);

      const totalCount = composerCount + workCount + scoreCount;

      const items: UserUpload[] = [
        ...composers.map((composer) => ({
          id: composer.id,
          title: composer.fullName || composer.name,
          type: 'composer' as const,
          createdAt: composer.createdAt.toISOString(),
          updatedAt: composer.updatedAt.toISOString(),
          isIMSLP: !!composer.imslpId,
          imslpId: composer.imslpId || undefined,
          epochName: composer.epoch.name,
          dataQuality: composer.dataQuality || undefined,
          verificationStatus: composer.verificationStatus || undefined,
        })),
        ...works.map((work) => ({
          id: work.id,
          title: work.title,
          type: 'work' as const,
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
        })),
        ...scores.map((score) => ({
          id: score.id,
          title: score.title,
          type: 'score' as const,
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
        })),
      ];

      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return {
        items: type === 'all' ? items.slice(offset, offset + limit) : items,
        composers,
        works,
        scores,
        totalCount,
        composerCount,
        workCount,
        scoreCount,
      };
    } catch (error) {
      console.error('Erro ao buscar todos os uploads:', error);
      return {
        items: [],
        composers: [],
        works: [],
        scores: [],
        totalCount: 0,
        composerCount: 0,
        workCount: 0,
        scoreCount: 0,
      };
    }
  },
  ['all-uploads'],
  {
    revalidate: 300,
    tags: ['all-uploads'],
  }
);

// Manter outras funções existentes (getFormData, getEpochsCache, etc.)...
export const getFormData = unstable_cache(
  async () => {
    try {
      const [epochs, instruments, roles, composers, works] = await Promise.all([
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
          select: {
            id: true,
            name: true,
            fullName: true,
          },
          orderBy: { name: 'asc' },
          take: 100,
        }),
        prisma.work.findMany({
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
          orderBy: { createdAt: 'desc' },
          take: 100,
        }),
      ]);

      const formattedComposers = composers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName,
        worksCount: 0,
      }));

      const formattedWorks = works.map((work) => ({
        id: work.id,
        title: work.title,
        composerName: work.composer.fullName || work.composer.name,
      }));

      return {
        epochs,
        instruments,
        roles,
        composers: formattedComposers,
        works: formattedWorks,
      };
    } catch (error) {
      console.error('Erro ao buscar dados para formulários:', error);
      return {
        epochs: [],
        instruments: [],
        roles: [],
        composers: [],
        works: [],
      };
    }
  },
  ['form-data'],
  {
    revalidate: 3600,
    tags: ['form-data'],
  }
);

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
    revalidate: 3600,
    tags: ['epochs'],
  }
);

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

      return {
        epochs,
        roles,
      };
    } catch (error) {
      console.error(
        'Erro ao buscar dados para formulário do compositor:',
        error
      );
      return {
        epochs: [],
        roles: [],
      };
    }
  },
  ['composer-form-data'],
  {
    revalidate: 3600,
    tags: ['composer-form-data'],
  }
);

export async function revalidateUploadsCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('user-uploads');
  revalidateTag('all-uploads');
  revalidateTag('form-data');
  revalidateTag('composer-form-data');
  revalidateTag('filter-data'); // 🆕
  revalidateTag('available-epochs'); // 🆕 Novo cache de épocas
  revalidateTag('epochs');

  if (userId) {
    revalidateTag(`user-uploads-${userId}`);
  }
}
