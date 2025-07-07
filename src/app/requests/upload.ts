// app/requests/uploads.ts - CORRIGIDO COM TIPOS PRISMA CORRETOS
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
  composerId?: string; // Novo campo para link
  instrumentName?: string;
  workGenres?: string[];
  categoryNames?: string[];
  verificationStatus?: string;
  pageCount?: string;
  fileSize?: string;
  dataQuality?: string;
  portraitUrl?: string; // Adicionar portraitUrl para compositores
  // Campos específicos para partituras
  workTitle?: string; // Novo campo para link da obra
  workId?: string; // Novo campo para link da obra
  downloadUrl?: string; // URL de download da partitura
}

// Buscar uploads do usuário
export const getUserUploads = unstable_cache(
  async ({
    userId,
    page = 1,
    limit = 24,
    search = '',
    type = 'all',
    epochId = '',
  }: {
    userId: string;
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    epochId?: string;
  }) => {
    try {
      const offset = (page - 1) * limit;

      // Buscar compositores do usuário
      const composerWhere: Prisma.ComposerWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(epochId && { epochId }),
        // Filtrar apenas compositores criados pelo usuário ou customizados
        OR: [{ createdBy: userId }, { isCustom: true }],
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
        // Filtrar apenas obras criadas pelo usuário ou customizadas
        OR: [{ createdBy: userId }, { isCustom: true }],
      };

      const scoreWhere: Prisma.WorkScoreWhereInput = {
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { work: { title: { contains: search, mode: 'insensitive' } } },
          ],
        }),
        source: { in: ['CUSTOM', 'UPLOAD'] }, // Apenas partituras não-IMSLP
        ...(userId && { uploadedBy: userId }),
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
                // dataQuality não existe no modelo Work - removido
                // verificationStatus não existe no modelo Work - removido
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

      // Contar totais
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
          portraitUrl: composer.portraitUrl || undefined, // Adicionar portraitUrl
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
          composerId: work.composer.id, // Novo campo para link
          instrumentName: work.instrument.name,
          workGenres: work.workGenresArr,
          categoryNames: work.categoryNames,
          // dataQuality e verificationStatus não existem no modelo Work
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
          composerId: score.work.composer.id, // Novo campo para link
          workTitle: score.work.title, // Novo campo para link da obra
          workId: score.work.id, // Novo campo para link da obra
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
      };
    }
  },
  ['user-uploads'],
  {
    revalidate: 300, // 5 minutos
    tags: ['user-uploads'],
  }
);

// Buscar todos os uploads (para admin)
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

      // Buscar todos os compositores
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
                // dataQuality não existe no modelo Work - removido
                // verificationStatus não existe no modelo Work - removido
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

      // Contar totais
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
          composerId: work.composer.id, // Novo campo para link
          instrumentName: work.instrument.name,
          workGenres: work.workGenresArr,
          categoryNames: work.categoryNames,
          // dataQuality e verificationStatus não existem no modelo Work
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
          composerId: score.work.composer.id, // Novo campo para link
          workTitle: score.work.title, // Novo campo para link da obra
          workId: score.work.id, // Novo campo para link da obra
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
    revalidate: 300, // 5 minutos
    tags: ['all-uploads'],
  }
);

// Buscar dados para formulários - ATUALIZADO
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
        // CORREÇÃO: Buscar compositores sem ordenação por contagem
        prisma.composer.findMany({
          select: {
            id: true,
            name: true,
            fullName: true,
          },
          orderBy: { name: 'asc' }, // Ordenação simples por nome
          take: 100, // Reduzir quantidade para melhor performance
        }),
        // Buscar obras recentes
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

      // Formatar compositores (sem contagem de obras)
      const formattedComposers = composers.map((composer) => ({
        id: composer.id,
        name: composer.name,
        fullName: composer.fullName,
        worksCount: 0, // Removendo contagem por performance
      }));

      // Formatar obras
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
    revalidate: 3600, // 1 hora
    tags: ['form-data'],
  }
);
// Cache de épocas (reutilizar da página de compositores)
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
    revalidate: 3600, // 1 hora
    tags: ['epochs'],
  }
);
export const getComposerFormData = unstable_cache(
  async () => {
    try {
      // Buscar apenas os dados essenciais para o formulário
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
    revalidate: 3600, // 1 hora
    tags: ['composer-form-data'],
  }
);

// Função para invalidar caches - ATUALIZADA
export async function revalidateUploadsCache(userId?: string) {
  const { revalidateTag } = await import('next/cache');

  revalidateTag('user-uploads');
  revalidateTag('all-uploads');
  revalidateTag('form-data');
  revalidateTag('composer-form-data'); // Adicionar novo cache
  revalidateTag('epochs');

  if (userId) {
    revalidateTag(`user-uploads-${userId}`);
  }
}
