// app/requests/composer-details.ts - Versão corrigida para MongoDB
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

export interface ComposerDetails {
  id: string;
  name: string;
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  portraitUrl?: string;
  bio?: string;
  permLinkImslp?: string;
  wikipediaLink?: string;
  epochId: string;
  epochName: string;
  primaryRoleId?: string;
  primaryRoleName?: string;
  worksCount: number;
  createdAt: Date;
  roleNames?: string[];
}

// Interface atualizada para incluir arrays de gêneros/categorias
export interface ComposerWork {
  id: string;
  title: string;
  opOrCatalog?: string;
  compositionYear?: string;
  tone?: string;
  mediaDuration?: string;
  imslpPermlink: string;
  videoUrl?: string;
  instrument?: {
    id: string;
    name: string;
  };
  workType: string;
  isPartOfCollection: boolean;
  parentWorkId?: string;
  workGenresArr?: string[];
  categoryNames?: string[];
}

// Nova interface para resposta paginada
export interface ComposerWorksResponse {
  works: ComposerWork[];
  totalCount: number;
  hasMore: boolean;
  currentPage: number;
}

// Interface para opções de filtros
export interface ComposerFilterOptions {
  instruments: { id: string; name: string }[];
  workGenres: string[];
  categories: string[];
}

// Função OTIMIZADA para buscar obras do compositor com paginação e filtros
export const getComposerWorksWithFilters = unstable_cache(
  async (
    composerId: string,
    page: number = 1,
    limit: number = 50,
    filters?: {
      instrumentId?: string;
      workGenresArr?: string;
      categoryNames?: string;
      search?: string;
    }
  ): Promise<ComposerWorksResponse> => {
    try {
      const skip = (page - 1) * limit;

      // Construir filtros WHERE de forma eficiente
      const whereClause: any = {
        composerId: composerId,
      };

      if (filters?.instrumentId) {
        whereClause.instrumentId = filters.instrumentId;
      }

      if (filters?.workGenresArr) {
        whereClause.workGenresArr = {
          has: filters.workGenresArr,
        };
      }

      if (filters?.categoryNames) {
        whereClause.categoryNames = {
          has: filters.categoryNames,
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
            tone: {
              contains: filters.search,
              mode: 'insensitive',
            },
          },
        ];
      }

      // OTIMIZAÇÃO: Buscar obras e contagem total em paralelo
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
            imslpPermlink: true,
            videoUrl: true,
            workType: true,
            isPartOfCollection: true,
            parentWorkId: true,
            workGenresArr: true,
            categoryNames: true,
            // JOIN otimizado com instrument
            instrument: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: [
            {
              title: 'asc',
            },
          ],
          skip,
          take: limit,
        }),
        // Contagem otimizada
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
          imslpPermlink: work.imslpPermlink,
          videoUrl: work.videoUrl || undefined,
          instrument: work.instrument,
          workType: work.workType,
          isPartOfCollection: work.isPartOfCollection,
          parentWorkId: work.parentWorkId || undefined,
          workGenresArr: work.workGenresArr,
          categoryNames: work.categoryNames,
        })),
        totalCount,
        hasMore: skip + works.length < totalCount,
        currentPage: page,
      };
    } catch (error) {
      console.error('Erro ao buscar obras do compositor com filtros:', error);
      return {
        works: [],
        totalCount: 0,
        hasMore: false,
        currentPage: page,
      };
    }
  },
  [`composer-works-filtered`],
  {
    revalidate: 3600, // 1 hora
    tags: ['composer-works-filtered'],
  }
);

// Função SIMPLIFICADA para buscar opções de filtros específicas do compositor
export const getComposerFilterOptions = unstable_cache(
  async (composerId: string): Promise<ComposerFilterOptions> => {
    try {
      // Buscar todas as obras do compositor para processar localmente
      const allWorks = await prisma.work.findMany({
        where: {
          composerId: composerId,
        },
        select: {
          instrumentId: true,
          workGenresArr: true,
          categoryNames: true,
          instrument: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Processar instrumentos únicos
      const instrumentsMap = new Map<string, { id: string; name: string }>();

      allWorks.forEach((work) => {
        if (work.instrument && work.instrumentId) {
          instrumentsMap.set(work.instrumentId, work.instrument);
        }
      });

      const instruments = Array.from(instrumentsMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      // Processar gêneros únicos
      const genresSet = new Set<string>();
      allWorks.forEach((work) => {
        if (work.workGenresArr && Array.isArray(work.workGenresArr)) {
          work.workGenresArr.forEach((genre) => {
            if (genre && typeof genre === 'string' && genre.trim().length > 0) {
              genresSet.add(genre.trim());
            }
          });
        }
      });

      // Processar categorias únicas
      const categoriesSet = new Set<string>();
      allWorks.forEach((work) => {
        if (work.categoryNames && Array.isArray(work.categoryNames)) {
          work.categoryNames.forEach((category) => {
            if (
              category &&
              typeof category === 'string' &&
              category.trim().length > 0
            ) {
              categoriesSet.add(category.trim());
            }
          });
        }
      });

      return {
        instruments,
        workGenres: Array.from(genresSet).sort(),
        categories: Array.from(categoriesSet).sort(),
      };
    } catch (error) {
      console.error('Erro ao buscar opções de filtros do compositor:', error);
      return {
        instruments: [],
        workGenres: [],
        categories: [],
      };
    }
  },
  [`composer-filter-options`],
  {
    revalidate: 7200, // 2 horas - dados relativamente estáticos
    tags: ['composer-filter-options'],
  }
);

// Função original mantida para compatibilidade (agora usa a nova função)
export const getComposerWorks = unstable_cache(
  async (composerId: string): Promise<ComposerWork[]> => {
    try {
      const result = await getComposerWorksWithFilters(composerId, 1, 1000); // Buscar todas para compatibilidade
      return result.works;
    } catch (error) {
      console.error('Erro ao buscar obras do compositor:', error);
      return [];
    }
  },
  ['composer-works'],
  {
    revalidate: 3600, // 1 hora
    tags: ['composer-works'],
  }
);

// Cache dos dados do compositor (exceto bio) por 2 horas
const getCachedComposerData = unstable_cache(
  async (composerId: string) => {
    try {
      const composer = await prisma.composer.findUnique({
        where: {
          id: composerId,
        },
        select: {
          id: true,
          name: true,
          fullName: true,
          birthDate: true,
          deathDate: true,
          portraitUrl: true,
          roles: true,
          // bio: true, // Removido do cache
          permLinkImslp: true,
          wikipediaLink: true,
          epochId: true,
          primaryRoleId: true,
          createdAt: true,
          epoch: {
            select: {
              name: true,
            },
          },
          primaryRole: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              works: true,
            },
          },
        },
      });

      if (!composer) {
        return null;
      }

      // Converter string de IDs em array e buscar os nomes dos roles
      let roleNames: string[] = [];
      if (composer.roles) {
        const roleIds = composer.roles.split(', ').map((id) => id.trim());

        const roles = await prisma.role.findMany({
          where: {
            id: {
              in: roleIds,
            },
          },
          select: {
            name: true,
          },
        });

        roleNames = roles.map((role) => role.name);
      }

      return {
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName,
        birthDate: composer.birthDate || undefined,
        deathDate: composer.deathDate || undefined,
        portraitUrl: composer.portraitUrl || undefined,
        permLinkImslp: composer.permLinkImslp || undefined,
        wikipediaLink: composer.wikipediaLink || undefined,
        epochId: composer.epochId,
        epochName: composer.epoch.name,
        primaryRoleId: composer.primaryRoleId || undefined,
        primaryRoleName: composer.primaryRole?.name || undefined,
        worksCount: composer._count.works,
        createdAt: composer.createdAt,
        roles: composer.roles, // IDs originais
        roleNames: roleNames, // Nomes dos roles
      };
    } catch (error) {
      console.error('Erro ao buscar dados básicos do compositor:', error);
      return null;
    }
  },
  ['composer-basic-data'],
  {
    revalidate: 7200, // 2 horas
    tags: ['composer-basic-data'],
  }
);

// Função para buscar apenas a bio (sem cache)
const getComposerBio = async (
  composerId: string
): Promise<string | undefined> => {
  try {
    const composer = await prisma.composer.findUnique({
      where: {
        id: composerId,
      },
      select: {
        bio: true,
      },
    });

    return composer?.bio || undefined;
  } catch (error) {
    console.error('Erro ao buscar bio do compositor:', error);
    return undefined;
  }
};

// Função principal que combina dados cacheados com bio dinâmica
export const getComposerById = async (
  composerId: string
): Promise<ComposerDetails | null> => {
  try {
    // Busca dados cacheados e bio em paralelo
    const [cachedData, bio] = await Promise.all([
      getCachedComposerData(composerId),
      getComposerBio(composerId),
    ]);

    if (!cachedData) {
      return null;
    }

    // Combina os dados cacheados com a bio sempre atualizada
    return {
      ...cachedData,
      bio,
    };
  } catch (error) {
    console.error('Erro ao buscar compositor:', error);
    return null;
  }
};

// Função para invalidar cache quando necessário
export async function revalidateComposerCache(composerId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('composer-details');
  revalidateTag('composer-works-filtered');
  revalidateTag('composer-filter-options');
  if (composerId) {
    revalidateTag(`composer-${composerId}`);
  }
}

export async function updateComposerBio(composerId: string, biography: string) {
  try {
    const composer = await prisma.composer.findUnique({
      where: {
        id: composerId,
      },
    });

    if (!composer) {
      return null;
    }

    const updateBioComposer = await prisma.composer.update({
      where: {
        id: composerId,
      },
      data: {
        bio: biography,
      },
    });

    if (updateBioComposer) {
      return 'Biografia Atualizada';
    }

    return 'Erro ao Atualizar biografia';
  } catch (error) {
    console.error('Erro ao buscar compositor:', error);
    return null;
  }
}
