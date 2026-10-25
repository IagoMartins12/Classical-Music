import type { Idioma } from '../legal/tipos';

/** A retrospectiva de estudo (Plus), no estilo da do Spotify. */
const pt = {
  button: 'Ver meu histórico',
  plus: 'Plus',
  locked: 'O histórico visual é do Plus',
  upsell: {
    title: 'Seu histórico de estudo',
    text: 'Uma retrospectiva do que você estudou, contada em cartões, no estilo da do Spotify.',
    items: [
      'As obras, os compositores e as épocas que mais passaram pelas suas mãos',
      'Como o seu estudo se compara ao de quem estuda o mesmo instrumento',
      'Uma sugestão do próximo capítulo, e a imagem para compartilhar',
    ],
    notNow: 'Agora não',
    action: 'Conhecer o Plus',
  },
  missing: (n: number) =>
    `Faltam ${n} ${n === 1 ? 'obra' : 'obras'} nas suas listas para o histórico`,
  generating: 'Gerando a sua retrospectiva…',
  generatingSteps: [
    'Contando o que você estudou',
    'Comparando com quem estuda o mesmo',
    'Escolhendo o próximo capítulo',
  ],
  periods: { year: (y: number) => `Este ano (${y})`, all: 'Desde o começo' },
  next: 'Próximo',
  previous: 'Anterior',
  close: 'Fechar',
  download: 'Baixar imagem',
  copyLink: 'Copiar link',
  copied: 'Link copiado.',
  regenerate: 'Gerar de novo',
  stale: 'Você estudou mais desde a última vez.',
  failed: 'Não foi possível gerar agora. Tente de novo em instantes.',
  share: {
    title: (name: string) => `A retrospectiva musical de ${name}`,
    cta: 'Crie a sua no Opus Atlas',
  },
};

const en: typeof pt = {
  button: 'See my history',
  plus: 'Plus',
  locked: 'Visual history comes with Plus',
  upsell: {
    title: 'Your study history',
    text: 'A look back at what you studied, told in cards, in the style of Spotify Wrapped.',
    items: [
      'The works, composers and eras you spent the most time with',
      'How your study compares with people who play the same instrument',
      'A suggestion for your next chapter, and an image to share',
    ],
    notNow: 'Not now',
    action: 'See the Plus plan',
  },
  missing: (n: number) =>
    `${n} more ${n === 1 ? 'work' : 'works'} on your lists to unlock your history`,
  generating: 'Building your year in review…',
  generatingSteps: [
    'Counting what you studied',
    'Comparing with people who study the same',
    'Picking your next chapter',
  ],
  periods: { year: (y: number) => `This year (${y})`, all: 'Since the start' },
  next: 'Next',
  previous: 'Previous',
  close: 'Close',
  download: 'Download image',
  copyLink: 'Copy link',
  copied: 'Link copied.',
  regenerate: 'Generate again',
  stale: 'You studied more since last time.',
  failed: 'Could not generate it now. Try again in a moment.',
  share: {
    title: (name: string) => `${name}'s music year in review`,
    cta: 'Make yours at Opus Atlas',
  },
};

export const RETROSPECTIVE: Record<Idioma, typeof pt> = { pt, en };
