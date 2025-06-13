import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

export interface WorkDetails {
  id: string;
  title: string;
  opOrCatalog?: string;
  compositionYear?: string;
  firstPublishDate?: string;
  tone?: string;
  mediaDuration?: string;
  imslpPermlink: string;
  imslpId: string;
  videoUrl?: string;
  workStyle?: string;
  moviment?: string;
  dedicateTo?: string;
  dedicationComposerLink?: string;
  instrumentation?: string;
  workType: string;
  isPartOfCollection: boolean;
  parentWorkId?: string;
  movementNumber?: number;
  createdAt: Date;
  composer: {
    id: string;
    name: string;
    fullName: string;
    epochName: string | null;
  };
  instrument: {
    id: string;
    name: string;
  } | null;
  epoch: {
    id: string;
    name: string;
  } | null;
  categoryNames: string[];
  workGenresArr?: string[];
}

export interface WorkListItem {
  id: string;
  title: string;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  workType: string;
  isPartOfCollection: boolean;
  composer: {
    id: string;
    name: string;
    epochName: string | null;
  };
  instrument: {
    id: string;
    name: string;
  } | null;
  epoch: {
    id: string;
    name: string;
  } | null;
}

export interface WorksListResponse {
  works: WorkListItem[];
  totalCount: number;
  hasMore: boolean;
}

export interface FilterOptions {
  instruments: { id: string; name: string }[];
  epochs: { id: string; name: string }[];
  workGenres: { id: string; name: string }[];
}

// Buscar todas as obras com paginação - VERSÃO OTIMIZADA
export const getWorks = unstable_cache(
  async (
    page: number = 1,
    limit: number = 32,
    filters?: {
      composerId?: string;
      instrumentId?: string;
      epochId?: string;
      workGenreId?: string;
      search?: string;
      categoryNames?: string;
      workGenresArr?: string;
    }
  ): Promise<WorksListResponse> => {
    try {
      const skip = (page - 1) * limit;

      // Construir filtros WHERE de forma mais eficiente
      const whereClause: any = {};

      if (filters?.composerId) {
        whereClause.composerId = filters.composerId;
      }

      if (filters?.instrumentId) {
        whereClause.instrumentId = filters.instrumentId;
      }

      if (filters?.epochId) {
        whereClause.epochId = filters.epochId;
      }

      if (filters?.categoryNames) {
        whereClause.categoryNames = {
          has: filters.categoryNames,
        };
      }

      if (filters?.workGenresArr) {
        whereClause.workGenresArr = {
          has: filters.workGenresArr,
        };
      }

      if (filters?.search) {
        whereClause.OR = [
          {
            title: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            opOrCatalog: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
          {
            composer: {
              OR: [
                {
                  name: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
                {
                  fullName: {
                    contains: filters.search,
                    mode: 'insensitive',
                  },
                },
              ],
            },
          },
        ];
      }

      // OTIMIZAÇÃO PRINCIPAL: Uma única consulta com includes otimizados
      const [works, totalCount] = await Promise.all([
        prisma.work.findMany({
          where: whereClause,
          select: {
            id: true,
            title: true,
            opOrCatalog: true,
            compositionYear: true,
            tone: true,
            mediaDuration: true,
            workType: true,
            isPartOfCollection: true,
            // Incluir dados relacionados diretamente na consulta
            composer: {
              select: {
                id: true,
                name: true,
                epochName: true,
              },
            },
            instrument: {
              select: {
                id: true,
                name: true,
              },
            },
            epoch: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            {
              composer: {
                name: 'asc',
              },
            },
            {
              title: 'asc',
            },
          ],
          skip,
          take: limit,
        }),
        // Consulta de contagem otimizada (apenas conta, não busca dados)
        prisma.work.count({
          where: whereClause,
        }),
      ]);

      return {
        works: works.map((work) => ({
          id: work.id,
          title: work.title,
          opOrCatalog: work.opOrCatalog || undefined,
          compositionYear: work.compositionYear || undefined,
          tone: work.tone || undefined,
          mediaDuration: work.mediaDuration || undefined,
          workType: work.workType,
          isPartOfCollection: work.isPartOfCollection,
          composer: work.composer,
          instrument: work.instrument,
          epoch: work.epoch,
        })),
        totalCount,
        hasMore: skip + works.length < totalCount,
      };
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
      return {
        works: [],
        totalCount: 0,
        hasMore: false,
      };
    }
  },
  ['works-list'],
  {
    revalidate: 3600, // 1 hora
    tags: ['works-list'],
  }
);

// Buscar todas as opções de filtro em uma única função otimizada
export const getFilterOptions = unstable_cache(
  async (): Promise<FilterOptions> => {
    try {
      // Executar todas as consultas em paralelo para máxima eficiência
      const [instruments, epochs, workGenres] = await Promise.all([
        // Instrumentos
        prisma.instrument.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: 'asc',
          },
        }),

        // Épocas
        prisma.epoch.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: 'asc',
          },
        }),

        // Gêneros de trabalho (apenas os primeiros 20 para performance)
        prisma.workGenre.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: 'asc',
          },
          take: 20,
        }),
      ]);

      return {
        instruments,
        epochs,
        workGenres,
      };
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
      return {
        instruments: [],
        epochs: [],
        workGenres: [],
      };
    }
  },
  ['filter-options'],
  {
    revalidate: 7200, // 2 horas - dados relativamente estáticos
    tags: ['filter-options'],
  }
);

// Funções individuais para compatibilidade (delegam para getFilterOptions)
export const getInstruments = unstable_cache(
  async () => {
    try {
      const { instruments } = await getFilterOptions();
      return instruments;
    } catch (error) {
      console.error('Erro ao buscar instrumentos:', error);
      return [];
    }
  },
  ['instruments-list'],
  {
    revalidate: 7200,
    tags: ['instruments-list'],
  }
);

export const getEpochs = unstable_cache(
  async () => {
    try {
      const { epochs } = await getFilterOptions();
      return epochs;
    } catch (error) {
      console.error('Erro ao buscar épocas:', error);
      return [];
    }
  },
  ['epochs-list'],
  {
    revalidate: 7200,
    tags: ['epochs-list'],
  }
);

// Buscar gêneros com filtro de texto (para o input de busca)
export const searchWorkGenres = async (
  searchTerm: string = '',
  limit: number = 20
): Promise<{ id: string; name: string }[]> => {
  try {
    const whereClause = searchTerm
      ? {
          name: {
            contains: searchTerm,
            mode: 'insensitive' as const,
          },
        }
      : {};

    return await prisma.workGenre.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: limit,
    });
  } catch (error) {
    console.error('Erro ao buscar gêneros com filtro:', error);
    return [];
  }
};

// Buscar TODOS os gêneros (para a página /genres)
export const getAllWorkGenres = unstable_cache(
  async (): Promise<{ id: string; name: string }[]> => {
    try {
      return await prisma.workGenre.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      console.error('Erro ao buscar todos os gêneros:', error);
      return [];
    }
  },
  ['all-work-genres'],
  {
    revalidate: 7200, // 2 horas - dados mais estáticos
    tags: ['all-work-genres'],
  }
);

// Função para invalidar cache - ATUALIZADA
export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');

  // Invalidar todos os caches relacionados
  revalidateTag('works-list');
  revalidateTag('work-basic-data');
  revalidateTag('related-works');
  revalidateTag('filter-options');
  revalidateTag('instruments-list');
  revalidateTag('epochs-list');
  revalidateTag('work-genres-list');
  revalidateTag('works-stats');

  if (workId) {
    revalidateTag(`work-${workId}`);
  }
}
