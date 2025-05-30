// app/requests/composer-details.ts
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
}

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
