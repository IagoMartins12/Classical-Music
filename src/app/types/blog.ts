// app/types/blog.ts — enums do blog no front
//
// Antes vinham do `@prisma/client`. Mesmos valores do schema da API, no mesmo
// formato do Prisma (objeto + união de textos), para que `'DRAFT'` continue
// valendo onde a tela usa o texto direto.

export const ArticleStatus = {
  DRAFT: 'DRAFT',
  REVIEW: 'REVIEW',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type ArticleStatus = (typeof ArticleStatus)[keyof typeof ArticleStatus];

export const ArticleType = {
  COMPOSER_ANALYSIS: 'COMPOSER_ANALYSIS',
  WORK_ANALYSIS: 'WORK_ANALYSIS',
  INSTRUMENT_GUIDE: 'INSTRUMENT_GUIDE',
  MUSIC_HISTORY: 'MUSIC_HISTORY',
  TUTORIAL: 'TUTORIAL',
  TOP_LIST: 'TOP_LIST',
  INTERVIEW: 'INTERVIEW',
  NEWS: 'NEWS',
  CURIOSITY: 'CURIOSITY',
  PERFORMANCE_VIDEO: 'PERFORMANCE_VIDEO',
  CONCERT_GUIDE: 'CONCERT_GUIDE',
  GENERAL: 'GENERAL',
} as const;

export type ArticleType = (typeof ArticleType)[keyof typeof ArticleType];
