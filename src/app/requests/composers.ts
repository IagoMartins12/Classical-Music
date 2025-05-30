// app/requests/composers-optimized.ts
import prisma from '@/app/libs/prismadb';
import { unstable_cache } from 'next/cache';

interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  epochId?: string;
}

interface CountParams {
  search?: string;
  epochId?: string;
}

// Cache de épocas por 24 horas (dados raramente mudam)
export const getEpochsCache = unstable_cache(
  async () => {
    const epochs = await prisma.epoch.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return epochs;
  },
  ['epochs-list'],
  {
    revalidate: 86400, // 24 horas
    tags: ['epochs'],
  }
);

// Função para construir filtros WHERE reutilizável
function buildWhereClause(search?: string, epochId?: string) {
  const where: any = {};

  if (search && search.trim()) {
    where.OR = [
      {
        name: {
          contains: search.trim(),
          mode: 'insensitive',
        },
      },
      {
        fullName: {
          contains: search.trim(),
          mode: 'insensitive',
        },
      },
    ];
  }

  if (epochId && epochId.trim()) {
    where.epochId = epochId.trim();
  }

  return where;
}

// Paginação otimizada com cache condicional
export const getComposersWithPagination = unstable_cache(
  async ({ page, limit, search, epochId }: PaginationParams) => {
    const skip = (page - 1) * limit;
    const where = buildWhereClause(search, epochId);

    const composers = await prisma.composer.findMany({
      where,
      select: {
        id: true,
        name: true,
        fullName: true,
        birthDate: true,
        deathDate: true,
        portraitUrl: true,
        epochId: true,
        bio: true,
        permLinkImslp: true,
        wikipediaLink: true,
        imslpId: true,
        epoch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
      skip,
      take: limit,
    });

    // Transformar dados para incluir epochName
    return composers.map((composer) => ({
      ...composer,
      epochName: composer.epoch.name,
    }));
  },
  ['composers-paginated'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers'],
  }
);

// Count otimizado com cache
export const getComposersCount = unstable_cache(
  async ({ search, epochId }: CountParams) => {
    const where = buildWhereClause(search, epochId);

    const count = await prisma.composer.count({
      where,
    });

    return count;
  },
  ['composers-count'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['composers'],
  }
);

// Função para invalidar cache quando necessário
export async function revalidateComposersCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('composers');
  revalidateTag('epochs');
}
