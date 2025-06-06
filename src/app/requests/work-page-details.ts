// app/requests/work-details.ts
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

  workGenres: {
    id: string;
    name: string;
  }[];
  categoryNames: string[];
  workGenresArr: string[];
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
    name: string;
  } | null;

  workGenres: {
    id: string;
    name: string;
  }[];
}

export interface WorksListResponse {
  works: WorkListItem[];
  totalCount: number;
  hasMore: boolean;
}

// Função auxiliar para buscar categorias e gêneros de trabalho
async function getWorkCategoriesAndGenres(workIds: string[]) {
  if (workIds.length === 0)
    return { categoriesMap: new Map(), workGenresMap: new Map() };

  const [workCategories, workGenresTypes] = await Promise.all([
    // Buscar categorias através da tabela WorkCategorie
    prisma.workCategorie.findMany({
      where: {
        workId: { in: workIds },
      },
      include: {
        categorie: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    // Buscar gêneros de trabalho através da tabela WorkGenresTypes
    prisma.workGenresTypes.findMany({
      where: {
        workId: { in: workIds },
      },
      include: {
        workGenre: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  // Criar mapas agrupados por workId
  const categoriesMap = new Map<string, { id: string; name: string }[]>();
  const workGenresMap = new Map<string, { id: string; name: string }[]>();

  // Agrupar categorias por workId
  workCategories.forEach((wc) => {
    if (!categoriesMap.has(wc.workId)) {
      categoriesMap.set(wc.workId, []);
    }
    categoriesMap.get(wc.workId)!.push({
      id: wc.categorie.id,
      name: wc.categorie.name,
    });
  });

  // Agrupar gêneros de trabalho por workId
  workGenresTypes.forEach((wgt) => {
    if (!workGenresMap.has(wgt.workId)) {
      workGenresMap.set(wgt.workId, []);
    }
    workGenresMap.get(wgt.workId)!.push({
      id: wgt.workGenre.id,
      name: wgt.workGenre.name,
    });
  });

  return { categoriesMap, workGenresMap };
}

// Cache dos dados da obra (sem anotações/favoritos) por 2 horas
const getCachedWorkData = unstable_cache(
  async (workId: string) => {
    try {
      const work = await prisma.work.findUnique({
        where: {
          id: workId,
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          compositionYear: true,
          firstPublishDate: true,
          tone: true,
          mediaDuration: true,
          imslpPermlink: true,
          imslpId: true,
          videoUrl: true,
          workStyle: true,
          moviment: true,
          dedicateTo: true,
          dedicationComposerLink: true,
          instrumentation: true,
          workType: true,
          isPartOfCollection: true,
          parentWorkId: true,
          movementNumber: true,
          createdAt: true,
          instrumentId: true,
          epochId: true,
          categoryNames: true,
          workGenresArr: true,
          composer: {
            select: {
              id: true,
              name: true,
              fullName: true,
              epochName: true,
            },
          },
        },
      });

      if (!work) return null;

      // Buscar genre, instrument, epoch, categories e workGenres
      const [instrument, epoch, { categoriesMap, workGenresMap }] =
        await Promise.all([
          work.instrumentId
            ? prisma.instrument.findUnique({
                where: { id: work.instrumentId },
                select: { id: true, name: true },
              })
            : null,
          work.epochId
            ? prisma.epoch.findUnique({
                where: { id: work.epochId },
                select: { id: true, name: true },
              })
            : null,
          getWorkCategoriesAndGenres([work.id]),
        ]);

      return {
        ...work,
        instrument,
        epoch,
        categories: categoriesMap.get(work.id) || [],
        workGenres: workGenresMap.get(work.id) || [],
      };
    } catch (error) {
      console.error('Erro ao buscar dados da obra:', error);
      return null;
    }
  },
  ['work-basic-data'],
  {
    revalidate: 7200, // 2 horas
    tags: ['work-basic-data'],
  }
);

// Função principal para buscar obra por ID
export const getWorkById = async (
  workId: string
): Promise<WorkDetails | null> => {
  try {
    const work = await getCachedWorkData(workId);

    if (!work) {
      return null;
    }

    return {
      id: work.id,
      title: work.title,
      opOrCatalog: work.opOrCatalog || undefined,
      compositionYear: work.compositionYear || undefined,
      firstPublishDate: work.firstPublishDate || undefined,
      tone: work.tone || undefined,
      mediaDuration: work.mediaDuration || undefined,
      imslpPermlink: work.imslpPermlink,
      imslpId: work.imslpId,
      videoUrl: work.videoUrl || undefined,
      workStyle: work.workStyle || undefined,
      moviment: work.moviment || undefined,
      dedicateTo: work.dedicateTo || undefined,
      dedicationComposerLink: work.dedicationComposerLink || undefined,
      instrumentation: work.instrumentation || undefined,
      workType: work.workType,
      isPartOfCollection: work.isPartOfCollection,
      parentWorkId: work.parentWorkId || undefined,
      movementNumber: work.movementNumber || undefined,
      createdAt: work.createdAt,
      composer: work.composer,
      instrument: work.instrument,
      epoch: work.epoch,
      workGenres: work.workGenres,
      categoryNames: work.categoryNames,
      workGenresArr: work.workGenresArr,
    };
  } catch (error) {
    console.error('Erro ao buscar obra:', error);
    return null;
  }
};

// Buscar obras relacionadas (mesmo compositor, mesmo gênero, etc.)
export const getRelatedWorks = unstable_cache(
  async (workId: string, limit: number = 6): Promise<WorkListItem[]> => {
    try {
      const work = await prisma.work.findUnique({
        where: { id: workId },
        select: {
          composerId: true,
          instrumentId: true,
        },
      });

      if (!work) return [];

      const relatedWorks = await prisma.work.findMany({
        where: {
          AND: [
            { id: { not: workId } },
            {
              OR: [
                { composerId: work.composerId },
                ...(work.instrumentId
                  ? [{ instrumentId: work.instrumentId }]
                  : []),
              ],
            },
          ],
        },
        select: {
          id: true,
          title: true,
          opOrCatalog: true,
          compositionYear: true,
          tone: true,
          mediaDuration: true,
          workType: true,
          isPartOfCollection: true,
          instrumentId: true,
          composer: {
            select: {
              id: true,
              name: true,
              epochName: true,
            },
          },
        },
        orderBy: {
          title: 'asc',
        },
        take: limit,
      });

      const instrumentIds = [
        ...new Set(relatedWorks.map((w) => w.instrumentId).filter(Boolean)),
      ];
      const workIds = relatedWorks.map((w) => w.id);

      const [instruments, { categoriesMap, workGenresMap }] = await Promise.all(
        [
          instrumentIds.length > 0
            ? prisma.instrument.findMany({
                where: { id: { in: instrumentIds } },
                select: { id: true, name: true },
              })
            : [],
          getWorkCategoriesAndGenres(workIds),
        ]
      );

      // Criar mapas para lookup rápido
      const instrumentMap = new Map(instruments.map((i) => [i.id, i]));

      return relatedWorks.map((work) => ({
        id: work.id,
        title: work.title,
        opOrCatalog: work.opOrCatalog || undefined,
        compositionYear: work.compositionYear || undefined,
        tone: work.tone || undefined,
        mediaDuration: work.mediaDuration || undefined,
        workType: work.workType,
        isPartOfCollection: work.isPartOfCollection,
        composer: work.composer,
        instrument: work.instrumentId
          ? instrumentMap.get(work.instrumentId) || null
          : null,
        workGenres: workGenresMap.get(work.id) || [],
      }));
    } catch (error) {
      console.error('Erro ao buscar obras relacionadas:', error);
      return [];
    }
  },
  ['related-works'],
  {
    revalidate: 3600,
    tags: ['related-works'],
  }
);

// Função para invalidar cache
export async function revalidateWorkCache(workId?: string) {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('works-list');
  revalidateTag('work-basic-data');
  revalidateTag('related-works');
  revalidateTag('instruments-list');
  if (workId) {
    revalidateTag(`work-${workId}`);
  }
}
