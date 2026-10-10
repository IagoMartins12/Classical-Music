import type { Idioma } from '../legal/tipos';

/** Copy for the home page sections. No exact counts anywhere (owner's rule). */
const pt = {
  hero: {
    title: 'O atlas da música erudita.',
    text: 'Conheça compositores e obras, baixe partituras de cada edição, ouça gravações, entenda cada época e organize o que você estuda. Quem dá aula acompanha os alunos aqui também. Tudo em um lugar só.',
    start: 'Começar grátis',
    exploreComposers: 'Explorar os compositores',
    teach: 'Dá aula? Conheça o portal',
    continue: 'Continuar meus estudos',
    freeNote: 'Ler, ouvir e baixar é grátis. A conta guarda o que você estuda.',
    atlasLabel: 'O que tem no Opus Atlas',
    orbits: {
      composers: 'Compositores',
      scores: 'Partituras',
      recordings: 'Gravações',
      history: 'História',
      studies: 'Estudo',
      lessons: 'Aulas',
      reading: 'Leituras',
      instruments: 'Instrumentos',
    },
  },
  popular: { title: 'Compositores populares', seeAll: 'Ver todos' },
  featured: {
    title: 'Compositor em destaque',
    subtitle: 'Descobrindo a genialidade de hoje',
    works: 'Obras',
    curiosities: 'Curiosidades',
    exploreWorks: 'Explorar as obras',
    readBio: 'Ler a biografia',
  },
  eras: {
    title: 'Explore por período',
    history: 'A história da música',
    allName: 'Todos',
    allTagline: 'O acervo inteiro, em ordem.',
  },
  concerts: {
    title: 'Próximos concertos',
    agenda: 'Ver a agenda',
    free: 'Entrada gratuita',
  },
  facts: {
    title: 'Curiosidades musicais',
    filter: 'Filtrar por período',
    all: 'Todos os períodos',
    shuffle: 'Embaralhar',
  },
  discover: {
    title: 'Descobrir',
    random: 'Ao acaso',
    randomText: 'Compositores e obras menos conhecidos, sorteados a cada hora.',
    recent: 'Chegaram agora',
    recentText: 'O que acabou de entrar no acervo.',
    composer: 'Compositor',
    work: 'Obra',
  },
  plans: {
    title: 'Grátis para sempre. Mais, quando você precisar.',
    text: 'Ler, ouvir e baixar não custa nada. Os planos pagos são para quem envia muito ou dá aula.',
    cta: 'Ver os planos',
    teachers: 'Para professores',
    items: [
      {
        name: 'Free',
        text: 'Enciclopédia, partituras, estante, anotações e conquistas.',
      },
      { name: 'Plus', text: 'Envios e vídeos sem limite.' },
      { name: 'Mentor', text: 'O portal de aulas para quem começa a ensinar.' },
      { name: 'Maestro', text: 'Alunos sem limite e selo de verificado.' },
    ],
  },
};

const en: typeof pt = {
  hero: {
    title: 'The atlas of classical music.',
    text: 'Meet composers and works, download the scores of every edition, listen to recordings, understand each era and organize what you study. Teachers follow their students here too. All in one place.',
    start: 'Start for free',
    exploreComposers: 'Explore the composers',
    teach: 'Do you teach? See the portal',
    continue: 'Continue my studies',
    freeNote:
      'Reading, listening and downloading are free. An account keeps what you study.',
    atlasLabel: 'What Opus Atlas holds',
    orbits: {
      composers: 'Composers',
      scores: 'Scores',
      recordings: 'Recordings',
      history: 'History',
      studies: 'Studies',
      lessons: 'Lessons',
      reading: 'Reading',
      instruments: 'Instruments',
    },
  },
  popular: { title: 'Popular composers', seeAll: 'See all' },
  featured: {
    title: 'Featured composer',
    subtitle: "Discovering today's genius",
    works: 'Works',
    curiosities: 'Curiosities',
    exploreWorks: 'Explore the works',
    readBio: 'Read the biography',
  },
  eras: {
    title: 'Explore by era',
    history: 'The history of music',
    allName: 'All',
    allTagline: 'The whole archive, in order.',
  },
  concerts: {
    title: 'Upcoming concerts',
    agenda: 'See the calendar',
    free: 'Free entry',
  },
  facts: {
    title: 'Musical curiosities',
    filter: 'Filter by era',
    all: 'All eras',
    shuffle: 'Shuffle',
  },
  discover: {
    title: 'Discover',
    random: 'At random',
    randomText: 'Lesser-known composers and works, drawn every hour.',
    recent: 'Just arrived',
    recentText: 'What has just entered the archive.',
    composer: 'Composer',
    work: 'Work',
  },
  plans: {
    title: 'Free forever. More, when you need it.',
    text: 'Reading, listening and downloading cost nothing. Paid plans are for heavy uploaders and teachers.',
    cta: 'See the plans',
    teachers: 'For teachers',
    items: [
      {
        name: 'Free',
        text: 'Encyclopedia, scores, shelf, annotations and achievements.',
      },
      { name: 'Plus', text: 'Unlimited uploads and videos.' },
      {
        name: 'Mentor',
        text: 'The lesson portal for those starting to teach.',
      },
      { name: 'Maestro', text: 'Unlimited students and the verified badge.' },
    ],
  },
};

export const HOME: Record<Idioma, typeof pt> = { pt, en };
export type HomeCopy = typeof pt;
