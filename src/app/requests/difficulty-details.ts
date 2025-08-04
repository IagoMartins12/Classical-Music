// // app/requests/difficulty-details.ts - API para Sistema de Dificuldade

export interface DifficultyWork {
  id: string;
  title: string;
  subtitle?: string;
  opOrCatalog?: string;
  compositionYear?: string;
  imslpPermlink: string;

  // ✅ ENUM ORIGINAL (seu sistema)
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  // 🆕 SISTEMA DETALHADO IMSLP
  imslpDifficultyLevel?: string;
  imslpDifficultySystem?: string;
  imslpDifficultyRating?: string;
  imslpSourceId?: string;

  composer: {
    id: string;
    name: string;
    fullName?: string;
  };
  instrument: {
    id: string;
    name: string;
  };
  workScores?: {
    id: string;
    sourceId: string;
    downloadUrl?: string;
    title: string;
    fileFormat: string;
  }[];
}

export interface DifficultyResponse {
  works: DifficultyWork[];
  totalCount: number;
  instruments: { id: string; name: string; workCount: number }[];
  difficultyLevels: { level: string; count: number }[];
  systems: { system: string; count: number }[];
}

export interface DifficultyFilters {
  instrumentId?: string;

  // ✅ FILTROS PARA SEU ENUM
  enumDifficultyLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

  // 🆕 FILTROS PARA SISTEMA IMSLP
  imslpDifficultyLevel?: string;
  imslpDifficultySystem?: string;

  search?: string;
  page?: number;
  limit?: number;
}

// // 🎯 FUNÇÃO PRINCIPAL: Buscar obras com dificuldade
// export const getDifficultyWorks = unstable_cache(
//   async (filters: DifficultyFilters = {}): Promise<DifficultyResponse> => {
//     try {
//       const {
//         instrumentId,
//         enumDifficultyLevel,
//         imslpDifficultyLevel,
//         imslpDifficultySystem = 'IMSLP',
//         search,
//         page = 1,
//         limit = 50,
//       } = filters;

//       const skip = (page - 1) * limit;

//       // 🔍 CONSTRUIR WHERE CLAUSE HÍBRIDO
//       const whereClause: any = {};

//       // Se busca por enum OU IMSLP, adaptar
//       if (enumDifficultyLevel && enumDifficultyLevel !== 'all') {
//         whereClause.difficultyLevel = enumDifficultyLevel;
//       } else if (imslpDifficultyLevel && imslpDifficultyLevel !== 'all') {
//         whereClause.imslpDifficultyLevel = imslpDifficultyLevel;
//         whereClause.imslpDifficultySystem = imslpDifficultySystem;
//       } else {
//         // Se não especifica, buscar qualquer obra com dificuldade
//         whereClause.OR = [
//           { difficultyLevel: { not: null } },
//           { imslpDifficultyLevel: { not: null } },
//         ];
//       }

//       if (instrumentId && instrumentId !== 'all') {
//         whereClause.instrumentId = instrumentId;
//       }

//       if (search) {
//         const searchCondition = {
//           OR: [
//             { title: { contains: search, mode: 'insensitive' } },
//             { subtitle: { contains: search, mode: 'insensitive' } },
//             { opOrCatalog: { contains: search, mode: 'insensitive' } },
//             {
//               composer: {
//                 OR: [
//                   { name: { contains: search, mode: 'insensitive' } },
//                   { fullName: { contains: search, mode: 'insensitive' } },
//                 ],
//               },
//             },
//           ],
//         };

//         if (whereClause.OR) {
//           whereClause.AND = [{ OR: whereClause.OR }, searchCondition];
//           delete whereClause.OR;
//         } else {
//           whereClause.AND = [whereClause, searchCondition];
//         }
//       }

//       // 🔍 BUSCAR OBRAS E ESTATÍSTICAS EM PARALELO
//       const [works, totalCount, instruments, difficultyLevels, systems] =
//         await Promise.all([
//           // Buscar obras principais
//           prisma.work.findMany({
//             where: whereClause,
//             include: {
//               composer: {
//                 select: {
//                   id: true,
//                   name: true,
//                   fullName: true,
//                 },
//               },
//               instrument: {
//                 select: {
//                   id: true,
//                   name: true,
//                 },
//               },
//               cachedScores: {
//                 where: {
//                   isActive: true,
//                   sourceId: { not: null },
//                 },
//                 select: {
//                   id: true,
//                   sourceId: true,
//                   downloadUrl: true,
//                   title: true,
//                   fileFormat: true,
//                 },
//                 take: 3, // Primeiras 3 partituras
//               },
//             },
//             orderBy: [{ difficultyLevel: 'asc' }, { title: 'asc' }],
//             skip,
//             take: limit,
//           }),

//           // Total count
//           prisma.work.count({ where: whereClause }),

//           // Instrumentos com contagem
//           getInstrumentsWithDifficultyCount(difficultySystem),

//           // Níveis de dificuldade
//           getDifficultyLevels(difficultySystem, instrumentId),

//           // Sistemas disponíveis
//           getDifficultySystems(),
//         ]);

//       return {
//         works: works
//           .filter((work) => work.difficultyLevel) // Filtrar apenas obras com enum definido
//           .map((work) => ({
//             id: work.id,
//             title: work.title,
//             subtitle: work.subtitle || undefined,
//             opOrCatalog: work.opOrCatalog || undefined,
//             compositionYear: work.compositionYear || undefined,
//             imslpPermlink: work.imslpPermlink,

//             // ✅ ENUM ORIGINAL (garantir que não é null)
//             difficultyLevel: work.difficultyLevel as
//               | 'BEGINNER'
//               | 'INTERMEDIATE'
//               | 'ADVANCED',

//             // 🆕 DADOS DETALHADOS IMSLP
//             imslpDifficultyLevel: work.imslpDifficultyLevel || undefined,
//             imslpDifficultySystem: work.imslpDifficultySystem || undefined,
//             imslpDifficultyRating: work.imslpDifficultyRating || undefined,
//             imslpSourceId: work.imslpSourceId || undefined,

//             composer: {
//               id: work.composer.id,
//               name: work.composer.name,
//               fullName: work.composer.fullName || undefined,
//             },
//             instrument: {
//               id: work.instrument!.id,
//               name: work.instrument!.name,
//             },
//             workScores:
//               work.cachedScores.length > 0
//                 ? work.cachedScores.map((score) => ({
//                     id: score.id,
//                     sourceId: score.sourceId,
//                     downloadUrl: score.downloadUrl || undefined,
//                     title: score.title,
//                     fileFormat: score.fileFormat,
//                   }))
//                 : undefined,
//           })),
//         totalCount,
//         instruments,
//         difficultyLevels,
//         systems,
//       };
//     } catch (error) {
//       console.error('❌ Erro ao buscar obras com dificuldade:', error);
//       return {
//         works: [],
//         totalCount: 0,
//         instruments: [],
//         difficultyLevels: [],
//         systems: [],
//       };
//     }
//   },
//   ['difficulty-works'],
//   {
//     revalidate: CACHE_CONFIG.DIFFICULTY_WORKS,
//     tags: ['difficulty-works'],
//   }
// );

// // 🎹 BUSCAR INSTRUMENTOS COM CONTAGEM DE DIFICULDADE
// const getInstrumentsWithDifficultyCount = unstable_cache(
//   async (
//     system: string = 'IMSLP'
//   ): Promise<{ id: string; name: string; workCount: number }[]> => {
//     try {
//       const result = await prisma.instrument.findMany({
//         where: {
//           works: {
//             some: {
//               OR: [
//                 { difficultyLevel: { not: null } },
//                 { imslpDifficultyLevel: { not: null } },
//               ],
//             },
//           },
//         },
//         select: {
//           id: true,
//           name: true,
//           _count: {
//             select: {
//               works: {
//                 where: {
//                   OR: [
//                     { difficultyLevel: { not: null } },
//                     { imslpDifficultyLevel: { not: null } },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//         orderBy: [{ name: 'asc' }],
//       });

//       return result.map((instrument) => ({
//         id: instrument.id,
//         name: instrument.name,
//         workCount: instrument._count.works,
//       }));
//     } catch (error) {
//       console.error('❌ Erro ao buscar instrumentos:', error);
//       return [];
//     }
//   },
//   ['difficulty-instruments'],
//   {
//     revalidate: CACHE_CONFIG.INSTRUMENTS,
//     tags: ['difficulty-instruments'],
//   }
// );

// // 📊 BUSCAR NÍVEIS DE DIFICULDADE
// const getDifficultyLevels = unstable_cache(
//   async (
//     system: string = 'IMSLP',
//     instrumentId?: string
//   ): Promise<{ level: string; count: number }[]> => {
//     try {
//       const whereClause: any = {};

//       if (instrumentId && instrumentId !== 'all') {
//         whereClause.instrumentId = instrumentId;
//       }

//       // Se for sistema IMSLP, buscar níveis IMSLP
//       if (system === 'IMSLP') {
//         whereClause.imslpDifficultyLevel = { not: null };
//         whereClause.imslpDifficultySystem = system;

//         const result = await prisma.work.groupBy({
//           by: ['imslpDifficultyLevel'],
//           where: whereClause,
//           _count: {
//             imslpDifficultyLevel: true,
//           },
//           orderBy: {
//             imslpDifficultyLevel: 'asc',
//           },
//         });

//         return result
//           .filter((item) => item.imslpDifficultyLevel)
//           .map((item) => ({
//             level: item.imslpDifficultyLevel!,
//             count: item._count.imslpDifficultyLevel,
//           }));
//       } else {
//         // Para outros sistemas, usar o enum
//         whereClause.difficultyLevel = { not: null };

//         const result = await prisma.work.groupBy({
//           by: ['difficultyLevel'],
//           where: whereClause,
//           _count: {
//             difficultyLevel: true,
//           },
//           orderBy: {
//             difficultyLevel: 'asc',
//           },
//         });

//         return result
//           .filter((item) => item.difficultyLevel)
//           .map((item) => ({
//             level: item.difficultyLevel!,
//             count: item._count.difficultyLevel,
//           }));
//       }
//     } catch (error) {
//       console.error('❌ Erro ao buscar níveis de dificuldade:', error);
//       return [];
//     }
//   },
//   ['difficulty-levels'],
//   {
//     revalidate: CACHE_CONFIG.DIFFICULTY_STATS,
//     tags: ['difficulty-levels'],
//   }
// );

// // 🏷️ BUSCAR SISTEMAS DE DIFICULDADE
// const getDifficultySystems = unstable_cache(
//   async (): Promise<{ system: string; count: number }[]> => {
//     try {
//       const result = await prisma.work.groupBy({
//         by: ['difficultySystem'],
//         where: {
//           difficultyLevel: { not: null },
//           difficultySystem: { not: null },
//         },
//         _count: {
//           difficultySystem: true,
//         },
//         orderBy: {
//           _count: {
//             difficultySystem: 'desc',
//           },
//         },
//       });

//       return result.map((item) => ({
//         system: item.difficultySystem!,
//         count: item._count.difficultySystem,
//       }));
//     } catch (error) {
//       console.error('❌ Erro ao buscar sistemas de dificuldade:', error);
//       return [];
//     }
//   },
//   ['difficulty-systems'],
//   {
//     revalidate: CACHE_CONFIG.DIFFICULTY_STATS,
//     tags: ['difficulty-systems'],
//   }
// );

// // 📈 ESTATÍSTICAS GERAIS DE DIFICULDADE
// export const getDifficultyStats = unstable_cache(
//   async (): Promise<{
//     totalWorks: number;
//     totalInstruments: number;
//     averageLevel: number;
//     mostCommonLevel: string;
//     systemDistribution: { system: string; count: number; percentage: number }[];
//   }> => {
//     try {
//       const [totalWorks, systems, levels] = await Promise.all([
//         prisma.work.count({
//           where: { difficultyLevel: { not: null } },
//         }),
//         getDifficultySystems(),
//         getDifficultyLevels(),
//       ]);

//       const totalInstruments = await prisma.instrument.count({
//         where: {
//           works: {
//             some: { difficultyLevel: { not: null } },
//           },
//         },
//       });

//       // Calcular nível médio
//       const numericLevels = levels
//         .map((l) => parseInt(l.level))
//         .filter((l) => !isNaN(l));

//       const averageLevel =
//         numericLevels.length > 0
//           ? numericLevels.reduce(
//               (sum, level, _, arr) => sum + level / arr.length,
//               0
//             )
//           : 0;

//       // Nível mais comum
//       const mostCommonLevel =
//         levels.length > 0
//           ? levels.reduce((max, current) =>
//               current.count > max.count ? current : max
//             ).level
//           : 'N/A';

//       // Distribuição por sistema
//       const systemDistribution = systems.map((s) => ({
//         system: s.system,
//         count: s.count,
//         percentage: (s.count / totalWorks) * 100,
//       }));

//       return {
//         totalWorks,
//         totalInstruments,
//         averageLevel: Math.round(averageLevel * 10) / 10,
//         mostCommonLevel,
//         systemDistribution,
//       };
//     } catch (error) {
//       console.error('❌ Erro ao calcular estatísticas:', error);
//       return {
//         totalWorks: 0,
//         totalInstruments: 0,
//         averageLevel: 0,
//         mostCommonLevel: 'N/A',
//         systemDistribution: [],
//       };
//     }
//   },
//   ['difficulty-stats'],
//   {
//     revalidate: CACHE_CONFIG.DIFFICULTY_STATS,
//     tags: ['difficulty-stats'],
//   }
// );

// // 🔍 BUSCAR OBRA ESPECÍFICA COM DIFICULDADE
// export const getWorkDifficulty = async (
//   workId: string
// ): Promise<DifficultyWork | null> => {
//   try {
//     const work = await prisma.work.findUnique({
//       where: { id: workId },
//       select: {
//         id: true,
//         title: true,
//         subtitle: true,
//         opOrCatalog: true,
//         compositionYear: true,
//         imslpPermlink: true,
//         difficultyLevel: true,
//         difficultySystem: true,
//         difficultyRating: true,
//         difficultySourceId: true,
//         composer: {
//           select: {
//             id: true,
//             name: true,
//             fullName: true,
//           },
//         },
//         instrument: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//         cachedScores: {
//           where: { isActive: true },
//           select: {
//             id: true,
//             sourceId: true,
//             downloadUrl: true,
//             title: true,
//             fileFormat: true,
//           },
//         },
//       },
//     });

//     if (!work || !work.difficultyLevel) {
//       return null;
//     }

//     return {
//       id: work.id,
//       title: work.title,
//       subtitle: work.subtitle || undefined,
//       opOrCatalog: work.opOrCatalog || undefined,
//       compositionYear: work.compositionYear || undefined,
//       imslpPermlink: work.imslpPermlink,
//       difficultyLevel: work.difficultyLevel,
//       difficultySystem: work.difficultySystem!,
//       difficultyRating: work.difficultyRating!,
//       difficultySourceId: work.difficultySourceId || undefined,
//       composer: {
//         id: work.composer.id,
//         name: work.composer.name,
//         fullName: work.composer.fullName || undefined,
//       },
//       instrument: {
//         id: work.instrument!.id,
//         name: work.instrument!.name,
//       },
//       workScores: work.cachedScores.length > 0 ? work.cachedScores : undefined,
//     };
//   } catch (error) {
//     console.error('❌ Erro ao buscar dificuldade da obra:', error);
//     return null;
//   }
// };

// // 🔄 INVALIDAR CACHE DE DIFICULDADE
// export async function revalidateDifficultyCache() {
//   const { revalidateTag } = await import('next/cache');

//   revalidateTag('difficulty-works');
//   revalidateTag('difficulty-instruments');
//   revalidateTag('difficulty-levels');
//   revalidateTag('difficulty-systems');
//   revalidateTag('difficulty-stats');

//   console.log('🔄 Cache de dificuldade invalidado');
// }

// // 📝 CONSTANTES PARA EXPLICAÇÕES
export const DIFFICULTY_INFO = {
  IMSLP: {
    name: 'IMSLP Difficulty Levels',
    description:
      'Sistema de classificação de dificuldade baseado na comunidade IMSLP, com níveis de 1 a 12.',
    levels: {
      '1': 'Muito Fácil - Iniciantes absolutos',
      '2': 'Fácil - Algumas semanas de estudo',
      '3': 'Fácil/Intermediário - Alguns meses de estudo',
      '4': 'Intermediário - 6 meses a 1 ano',
      '5': 'Intermediário - 1-2 anos de estudo',
      '6': 'Intermediário/Avançado - 2-3 anos',
      '7': 'Avançado - 3-4 anos',
      '8': 'Avançado - 4-6 anos',
      '9': 'Muito Avançado - 6-8 anos',
      '10': 'Virtuoso - 8+ anos',
      '11': 'Profissional - Nível de conservatório',
      '12': 'Máximo - Extremamente desafiador',
    },
  },
  RCM: {
    name: 'Royal Conservatory of Music',
    description:
      'Sistema canadense amplamente reconhecido, usado em escolas de música ao redor do mundo.',
    levels: {
      'Prep A': 'Preparatório A - Primeiros passos',
      'Prep B': 'Preparatório B - Fundamentos básicos',
      '1': 'Nível 1 - Iniciante',
      '2': 'Nível 2 - Iniciante avançado',
      '3': 'Nível 3 - Intermediário inicial',
      '4': 'Nível 4 - Intermediário',
      '5': 'Nível 5 - Intermediário',
      '6': 'Nível 6 - Intermediário avançado',
      '7': 'Nível 7 - Avançado inicial',
      '8': 'Nível 8 - Avançado',
      '9': 'Nível 9 - Avançado superior',
      '10': 'Nível 10 - Pré-universitário',
    },
  },
};
