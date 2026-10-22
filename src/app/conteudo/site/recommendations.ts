import type { Idioma } from '../legal/tipos';

/** "Para estudar depois desta" e "Recomendadas para você" (Plus). */
const pt = {
  work: {
    title: 'Para estudar depois desta',
    text: 'Escolhidas pelo instrumento, pelo compositor, pelo gênero, pela época e pelo que estudou quem estuda esta obra.',
  },
  me: {
    title: 'Recomendadas para você',
    text: 'A partir do que você já aprendeu, quer aprender e favoritou.',
    empty:
      'Assim que você tiver obras em "quero estudar", "já aprendi" ou nos favoritos, as recomendações aparecem aqui.',
  },
  locked: {
    title: 'Recomendações de peças são do Plus',
    text: 'Assine o Plus para ver peças escolhidas a partir do que você estuda, com o motivo de cada uma.',
    action: 'Conhecer o Plus',
    signIn: 'Entre para ver as recomendações',
  },
  reasons: {
    'co-study': 'quem estudou esta também estudou',
    'same-instrument': 'mesmo instrumento',
    'same-instrumentation': 'mesma formação',
    'same-composer': 'mesmo compositor',
    'same-genre': 'mesmo gênero',
    'same-epoch': 'mesma época',
    'step-up': 'um passo acima',
    'same-level': 'mesmo nível',
    popular: 'muito estudada',
  },
  error: 'Não foi possível carregar as recomendações.',
};

const en: typeof pt = {
  work: {
    title: 'To study after this one',
    text: 'Chosen by instrument, composer, genre, era and what people who study this work also study.',
  },
  me: {
    title: 'Recommended for you',
    text: 'From what you have learned, want to learn and favorited.',
    empty:
      'Once you have works in "want to study", "learned" or your favorites, recommendations show up here.',
  },
  locked: {
    title: 'Piece recommendations come with Plus',
    text: 'Subscribe to Plus to see pieces chosen from what you study, each with its reason.',
    action: 'See Plus',
    signIn: 'Sign in to see recommendations',
  },
  reasons: {
    'co-study': 'people who studied this also studied',
    'same-instrument': 'same instrument',
    'same-instrumentation': 'same scoring',
    'same-composer': 'same composer',
    'same-genre': 'same genre',
    'same-epoch': 'same era',
    'step-up': 'one step up',
    'same-level': 'same level',
    popular: 'often studied',
  },
  error: 'Could not load the recommendations.',
};

export const RECOMMENDATIONS: Record<Idioma, typeof pt> = { pt, en };
export type RecommendationsCopy = typeof pt;
