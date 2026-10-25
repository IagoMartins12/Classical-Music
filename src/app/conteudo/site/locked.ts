import type { Idioma } from '../legal/tipos';

/**
 * O que cada recurso de plano mostra a quem ainda não tem o plano
 * (`RecursoDoPlano`): o que ele faz, em três frases concretas, e o caminho
 * para os planos. Sem marca de terceiros nem número de acervo.
 */
export type RecursoBloqueado =
  | 'recommendations'
  | 'history'
  | 'videos'
  | 'uploads';

interface Texto {
  title: string;
  text: (limit: number | null) => string;
  items: string[];
}

const pt: {
  notNow: string;
  action: (plano: string) => string;
  recursos: Record<RecursoBloqueado, Texto>;
} = {
  notNow: 'Agora não',
  action: (plano) => `Conhecer o ${plano}`,
  recursos: {
    recommendations: {
      title: 'Recomendações de peças',
      text: () =>
        'Peças escolhidas a partir do que você já tocou e do que quer aprender, cada uma com o motivo da escolha.',
      items: [
        'Em cada obra, as próximas que fazem sentido: mesmo instrumento, mesma época ou um passo acima no nível',
        'Nos seus estudos, uma lista montada a partir das suas listas e dos seus favoritos',
        'O motivo de cada sugestão, para você decidir se é a hora de começar',
      ],
    },
    history: {
      title: 'Seu histórico de estudo',
      text: () =>
        'Um resumo do que você estudou, em cartões para passar um a um e guardar.',
      items: [
        'As obras, os compositores e as épocas que mais ocuparam o seu estudo',
        'Como o seu repertório se compara com o de quem toca o mesmo instrumento',
        'Uma sugestão para o próximo capítulo e uma imagem pronta para compartilhar',
      ],
    },
    videos: {
      title: 'Vídeos de performance sem limite',
      text: (limit) =>
        limit === null
          ? 'No Plus, você guarda a gravação de cada peça que aprender.'
          : `No Free, cabem ${limit} vídeos de performance. No Plus, você guarda a gravação de cada peça que aprender.`,
      items: [
        'Um vídeo para cada obra em "já aprendi", sem contar quantos',
        'Você decide se cada vídeo fica público ou só para você',
        'Meses depois, dá para ver como você tocava e quanto mudou',
      ],
    },
    uploads: {
      title: 'Envios ao acervo sem limite',
      text: (limit) =>
        limit === null
          ? 'No Plus, você envia ao acervo quantos compositores, obras e partituras quiser.'
          : `No Free, são ${limit} envios ao acervo. No Plus, você envia quantos compositores, obras e partituras quiser.`,
      items: [
        'Compositores, obras e partituras que ainda faltam no Opus Atlas',
        'Tudo o que você enviou fica reunido na sua página de envios',
        'As recomendações de peças e o histórico de estudo vêm no mesmo plano',
      ],
    },
  },
};

const en: typeof pt = {
  notNow: 'Not now',
  action: (plano) => `See the ${plano} plan`,
  recursos: {
    recommendations: {
      title: 'Piece recommendations',
      text: () =>
        'Pieces picked from what you have played and what you want to learn, each with the reason it was picked.',
      items: [
        'On every work, the ones that make sense next: same instrument, same era or one step up in level',
        'In your studies, a list built from your lists and your favorites',
        'The reason behind each suggestion, so you can decide if it is time to start',
      ],
    },
    history: {
      title: 'Your study history',
      text: () =>
        'A summary of what you studied, in cards to go through one by one and keep.',
      items: [
        'The works, composers and eras that took up most of your practice',
        'How your repertoire compares with people who play the same instrument',
        'A suggestion for your next chapter and an image ready to share',
      ],
    },
    videos: {
      title: 'Unlimited performance videos',
      text: (limit) =>
        limit === null
          ? 'With Plus, you keep a recording of every piece you learn.'
          : `Free holds ${limit} performance videos. With Plus, you keep a recording of every piece you learn.`,
      items: [
        'One video for each work in "learned", without counting',
        'You decide whether each video is public or only for you',
        'Months later, you can see how you played and how much changed',
      ],
    },
    uploads: {
      title: 'Unlimited catalog uploads',
      text: (limit) =>
        limit === null
          ? 'With Plus, you add as many composers, works and scores as you want.'
          : `Free includes ${limit} catalog uploads. With Plus, you add as many composers, works and scores as you want.`,
      items: [
        'Composers, works and scores still missing from Opus Atlas',
        'Everything you upload stays together on your uploads page',
        'Piece recommendations and your study history come in the same plan',
      ],
    },
  },
};

export const LOCKED: Record<Idioma, typeof pt> = { pt, en };
