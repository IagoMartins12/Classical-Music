/**
 * Os dados da versão consolidada (esboço A, 06/10). O que é do acervo é real
 * (banco local); coleções, anotações, envios e o perfil de Marina são de
 * exemplo, no formato dos modelos da API (`WorkAnnotation`, `WorkScore`…).
 */

import { FAMOSOS, original } from './dados';
import { FICHA_BAILLOT } from './fichas-dados';

// ---------------------------------------------------------------------------
// Períodos: as 7 épocas do banco + "Todos" (a home de hoje já faz assim)
// ---------------------------------------------------------------------------

export const PERIODOS = [
  {
    id: 'todos',
    nome: 'Todos',
    anos: '500–hoje',
    compositores: 19176,
    obras: 207891,
    imagem: '/epochs/all.png',
    frase: 'O acervo inteiro, em ordem.',
  },
  {
    id: 'medieval',
    nome: 'Medieval',
    anos: '500–1400',
    compositores: 49,
    obras: 305,
    imagem: '/epochs/medieval.jpg',
    frase: 'Canto gregoriano e a primeira notação.',
  },
  {
    id: 'renascentista',
    nome: 'Renascentista',
    anos: '1400–1600',
    compositores: 703,
    obras: 15130,
    imagem: '/epochs/renaissance.webp',
    frase: 'A polifonia de Josquin e Palestrina.',
  },
  {
    id: 'barroco',
    nome: 'Barroco',
    anos: '1600–1750',
    compositores: 1489,
    obras: 25534,
    imagem: '/epochs/baroque.jpeg',
    frase: 'Bach, Vivaldi, Handel e a fuga.',
  },
  {
    id: 'classico',
    nome: 'Clássico',
    anos: '1750–1820',
    compositores: 2873,
    obras: 22315,
    imagem: '/epochs/classical.webp',
    frase: 'Haydn, Mozart e a forma sonata.',
  },
  {
    id: 'romantico',
    nome: 'Romântico',
    anos: '1820–1900',
    compositores: 10365,
    obras: 86827,
    imagem: '/epochs/romantic.jpeg',
    frase: 'O piano de Chopin, a orquestra de Wagner.',
  },
  {
    id: 'modernismo',
    nome: 'Modernismo',
    anos: '1900–1950',
    compositores: 1070,
    obras: 25022,
    imagem: '/epochs/modern.jpg',
    frase: 'Debussy, Stravinsky e o fim da tonalidade.',
  },
  {
    id: 'contemporaneo',
    nome: 'Contemporâneo',
    anos: '1950–hoje',
    compositores: 2627,
    obras: 32758,
    imagem: '/epochs/contemporary.jpg',
    frase: 'De Reich a quem escreve hoje.',
  },
];

// ---------------------------------------------------------------------------
// Coleções (modelo novo: Collection + CollectionItem)
// ---------------------------------------------------------------------------

export type ItemDeColecao =
  | {
      tipo: 'obra';
      titulo: string;
      compositor: string;
      detalhe?: string;
      nota?: string;
    }
  | { tipo: 'compositor'; nome: string; detalhe?: string; nota?: string }
  | {
      tipo: 'partitura';
      titulo: string;
      obra: string;
      compositor: string;
      paginas?: number;
      nota?: string;
    };

/** Uma coleção tem um tipo só (06/10, 2ª rodada): nada de misturar. */
export type TipoColecao = 'obra' | 'compositor' | 'partitura';
export const ROTULO_COLECAO: Record<
  TipoColecao,
  { plural: string; singular: string }
> = {
  obra: { plural: 'Obras', singular: 'obra' },
  compositor: { plural: 'Compositores', singular: 'compositor' },
  partitura: { plural: 'Partituras', singular: 'partitura' },
};

export interface ColecaoFinal {
  id: string;
  tipo: TipoColecao;
  titulo: string;
  descricao: string;
  autor: {
    nome: string;
    papel: 'Equipe Opus Atlas' | 'Professora' | 'Estudante';
  };
  publica: boolean;
  /** Só admin marca; aparece na home. */
  naHome: boolean;
  favoritos: number;
  atualizada: string;
  rostos: string[];
  itens: ItemDeColecao[];
}

export const COLECOES_FINAL: ColecaoFinal[] = [
  {
    id: 'comecar-no-piano',
    tipo: 'obra',
    titulo: 'Para começar no piano',
    descricao:
      'Peças curtas, de leitura clara, que soam como música desde a primeira semana.',
    autor: { nome: 'Equipe Opus Atlas', papel: 'Equipe Opus Atlas' },
    publica: true,
    naHome: true,
    favoritos: 412,
    atualizada: '28 set',
    rostos: ['Bach', 'Schumann', 'Mozart', 'Chopin'],
    itens: [
      {
        tipo: 'obra',
        titulo: 'Prelúdio em dó maior, BWV 846',
        compositor: 'Bach',
        detalhe: 'Piano · 2 min',
        nota: 'Arpejos que cabem na mão; ótimo para o pedal.',
      },
      {
        tipo: 'obra',
        titulo: 'Álbum para a juventude, Op. 68 — nº 1, Melodia',
        compositor: 'Schumann',
        detalhe: 'Piano · 1 min',
        nota: 'Escrito pelo Schumann para as filhas aprenderem.',
      },
      {
        tipo: 'obra',
        titulo: 'Sonata facile, K. 545 — I',
        compositor: 'Mozart',
        detalhe: 'Piano · 4 min',
      },
      {
        tipo: 'obra',
        titulo: 'Kinderszenen, Op. 15 — Träumerei',
        compositor: 'Schumann',
        detalhe: 'Piano · 3 min',
        nota: 'Lenta, para trabalhar o som e o pedal.',
      },
      {
        tipo: 'obra',
        titulo: 'Prelúdio em mi menor, Op. 28 nº 4',
        compositor: 'Chopin',
        detalhe: 'Piano · 2 min',
      },
      {
        tipo: 'obra',
        titulo: 'Para Elisa, WoO 59',
        compositor: 'Beethoven',
        detalhe: 'Piano · 3 min',
      },
    ],
  },
  {
    id: 'noturnos',
    tipo: 'obra',
    titulo: 'A noite no piano',
    descricao: 'De John Field, que inventou o noturno, a Fauré.',
    autor: { nome: 'Helena Prado', papel: 'Professora' },
    publica: true,
    naHome: true,
    favoritos: 87,
    atualizada: '2 out',
    rostos: ['Chopin', 'Debussy', 'Schubert'],
    itens: [],
  },
  {
    id: 'cordas-barroco',
    tipo: 'partitura',
    titulo: 'Cordas no Barroco, as edições boas',
    descricao:
      'As edições de domínio público mais legíveis das sonatas e partitas para violino e violoncelo solo.',
    autor: { nome: 'Equipe Opus Atlas', papel: 'Equipe Opus Atlas' },
    publica: true,
    naHome: true,
    favoritos: 133,
    atualizada: '19 set',
    rostos: ['Bach', 'Vivaldi', 'Handel'],
    itens: [],
  },
  {
    id: 'compositoras',
    tipo: 'compositor',
    titulo: 'Elas também escreveram',
    descricao:
      'Compositoras que a história deixou de lado, de Hildegard von Bingen a Lili Boulanger.',
    autor: { nome: 'Equipe Opus Atlas', papel: 'Equipe Opus Atlas' },
    publica: true,
    naHome: false,
    favoritos: 268,
    atualizada: '30 set',
    rostos: ['Clara Schumann', 'Fanny Mendelssohn'],
    itens: [],
  },
  {
    id: 'recital-dezembro',
    tipo: 'obra',
    titulo: 'Recital de dezembro',
    descricao: 'O que estou preparando para o recital da escola.',
    autor: { nome: 'Marina Duarte', papel: 'Estudante' },
    publica: false,
    naHome: false,
    favoritos: 0,
    atualizada: 'ontem',
    rostos: ['Chopin', 'Bach'],
    itens: [],
  },
];

// ---------------------------------------------------------------------------
// Compositor: o que faltava (nomes alternativos, compôs para, links)
// ---------------------------------------------------------------------------

export const EXTRA_CHOPIN = {
  nomesAlternativos: [
    'Frédéric François Chopin',
    'Fryderyk Franciszek Chopin',
    'Fryderyk Franciszek Szopen',
    'Federic Chopin',
    'Шопен, Фредерик',
    'フレデリック・ショパン',
    '弗雷德里克·肖邦',
  ],
  nascimento: { data: '1º de março de 1810', lugar: 'Żelazowa Wola, Polônia' },
  falecimento: { data: '17 de outubro de 1849', lugar: 'Paris, França' },
  idade: 39,
  /** Das categorias e instrumentações das obras dele no acervo. */
  compsPara: [
    { nome: 'Piano solo', n: 158 },
    { nome: 'Voz e piano', n: 19 },
    { nome: 'Piano e orquestra', n: 6 },
    { nome: 'Violoncelo e piano', n: 4 },
    { nome: 'Trio com piano', n: 1 },
  ],
  wikipedia: 'https://pt.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Chopin',
  imslp: 'https://imslp.org/wiki/Category:Chopin,_Fr%C3%A9d%C3%A9ric',
  curiosidades: [
    {
      texto: 'O coração está enterrado em Varsóvia; o corpo, em Paris.',
      autor: 'Equipe Opus Atlas',
    },
    {
      texto: 'Quase toda a música dele foi escrita para piano solo.',
      autor: 'Equipe Opus Atlas',
    },
    {
      texto:
        'Deu só cerca de 30 concertos públicos na vida inteira — preferia os salões.',
      autor: 'Helena P.',
    },
  ],
};

export const EXTRA_BAILLOT = {
  nomesAlternativos: ['Pierre Marie François de Sales Baillot'],
  nascimento: { data: '1º de outubro de 1771', lugar: 'Passy, França' },
  falecimento: { data: '15 de setembro de 1842', lugar: 'Paris, França' },
  idade: 70,
  compsPara: [
    { nome: 'Violino', n: 21 },
    { nome: 'Quarteto de cordas', n: 8 },
    { nome: 'Violino e orquestra', n: 10 },
  ],
  wikipedia: FICHA_BAILLOT.wikipedia,
  imslp: 'https://imslp.org/wiki/Category:Baillot,_Pierre',
  curiosidades: [] as { texto: string; autor: string }[],
};

/** Por onde começar: automático (mais estudadas com partitura, da mais fácil) + curadoria. */
export const COMECAR_CHOPIN = {
  curadoria: true,
  obras: [
    {
      titulo: 'Prelúdio em mi menor, Op. 28 nº 4',
      nivel: 'Iniciante',
      porque: '2 minutos, uma melodia e acordes na esquerda.',
      estudando: 151,
    },
    {
      titulo: 'Valsa em lá menor, B. 150',
      nivel: 'Iniciante',
      porque: 'A valsa mais simples dele, publicada depois da morte.',
      estudando: 96,
    },
    {
      titulo: 'Noturnos, Op. 9',
      nivel: 'Intermediário',
      porque: 'O nº 2 é o noturno mais tocado do mundo.',
      estudando: 214,
    },
  ],
};

export const COMECAR_BAILLOT = {
  curadoria: false,
  obras: [
    {
      titulo: '24 Prelúdios em todos os tons',
      nivel: 'Intermediário',
      porque: 'Curtos, um por tonalidade.',
      estudando: 3,
    },
    {
      titulo: '12 Caprichos ou Estudos, Op. 2',
      nivel: 'Avançado',
      porque: 'Os estudos de violino que ele usava no Conservatório de Paris.',
      estudando: 2,
    },
    {
      titulo: '2 Andantes, Op. 26',
      nivel: 'Intermediário',
      porque: 'Violino e piano, para tocar em dupla.',
      estudando: 1,
    },
  ],
};

/** "Do mesmo tempo": 10 a 15 compositores sorteados entre os que viveram junto. */
export function contemporaneosSorteados(
  nasc: number,
  morte: number,
  semente: number
) {
  const vivos = FAMOSOS.filter(
    (f) => f.nasc < morte && (f.morte ?? 2026) > nasc
  );
  const extra = [
    {
      id: 'x1',
      nome: 'Liszt',
      nomeCompleto: 'Franz Liszt',
      nasc: 1811,
      morte: 1886,
      retrato: original(
        'https://imslp.org/images/thumb/3/38/Liszt_1858.jpg/180px-x.jpg'
      ),
    },
    {
      id: 'x2',
      nome: 'Clara Schumann',
      nomeCompleto: 'Clara Schumann',
      nasc: 1819,
      morte: 1896,
      retrato: 'https://imslp.org/images/d/d4/ClaraSchumann.JPG',
    },
    {
      id: 'x3',
      nome: 'John Field',
      nomeCompleto: 'John Field',
      nasc: 1782,
      morte: 1837,
      retrato: null,
    },
    {
      id: 'x4',
      nome: 'Paganini',
      nomeCompleto: 'Niccolò Paganini',
      nasc: 1782,
      morte: 1840,
      retrato: null,
    },
    {
      id: 'x5',
      nome: 'Berlioz',
      nomeCompleto: 'Hector Berlioz',
      nasc: 1803,
      morte: 1869,
      retrato: null,
    },
    {
      id: 'x6',
      nome: 'Bellini',
      nomeCompleto: 'Vincenzo Bellini',
      nasc: 1801,
      morte: 1835,
      retrato: null,
    },
    {
      id: 'x7',
      nome: 'Kreutzer',
      nomeCompleto: 'Rodolphe Kreutzer',
      nasc: 1766,
      morte: 1831,
      retrato: null,
    },
    {
      id: 'x8',
      nome: 'Viotti',
      nomeCompleto: 'Giovanni Battista Viotti',
      nasc: 1755,
      morte: 1824,
      retrato: null,
    },
  ].filter((f) => f.nasc < morte && f.morte > nasc);
  const todos = [
    ...vivos.map((v) => ({
      id: v.id,
      nome: v.nome,
      nomeCompleto: v.nomeCompleto,
      nasc: v.nasc,
      morte: v.morte,
      retrato: v.retrato as string | null,
    })),
    ...extra,
  ];
  // Embaralha com semente (no produto: `$sample` do Mongo a cada visita, em cache curto).
  const r = (i: number) => Math.abs(Math.sin(semente * 9301 + i * 49297)) % 1;
  return todos
    .map((t, i) => ({ t, k: r(i) }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.t)
    .slice(0, 15);
}

// ---------------------------------------------------------------------------
// Anotações (WorkAnnotation)
// ---------------------------------------------------------------------------

export const CATEGORIAS_ANOTACAO = [
  {
    id: 'TECHNIQUE',
    rotulo: 'Técnica',
    detalhe: 'Dedilhado, articulação, golpe de arco',
  },
  {
    id: 'INTERPRETATION',
    rotulo: 'Interpretação',
    detalhe: 'Dinâmica, fraseado, caráter',
  },
  { id: 'THEORY', rotulo: 'Teoria', detalhe: 'Harmonia, forma, análise' },
  {
    id: 'PRACTICE_TIP',
    rotulo: 'Dica de estudo',
    detalhe: 'Como praticar esse trecho',
  },
  {
    id: 'PERFORMANCE',
    rotulo: 'Palco',
    detalhe: 'Performance, nervosismo, memória',
  },
  {
    id: 'HISTORICAL',
    rotulo: 'Contexto',
    detalhe: 'História por trás da obra',
  },
  { id: 'GENERAL', rotulo: 'Geral', detalhe: 'Qualquer outra coisa' },
] as const;
export type CategoriaAnotacao = (typeof CATEGORIAS_ANOTACAO)[number]['id'];

export const ALCANCES = [
  { id: 'SPECIFIC_MEASURE', rotulo: 'Compassos' },
  { id: 'SECTION', rotulo: 'Seção' },
  { id: 'MOVEMENT', rotulo: 'Movimento' },
  { id: 'ENTIRE_WORK', rotulo: 'Obra inteira' },
] as const;

export interface AnotacaoRica {
  id: string;
  titulo: string;
  texto: string;
  categoria: CategoriaAnotacao;
  alcance: (typeof ALCANCES)[number]['id'];
  compassos?: [number, number];
  movimento?: string;
  secao?: string;
  pagina?: number;
  mao?: 'esquerda' | 'direita' | 'ambas';
  nivel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Todos os níveis';
  tags: string[];
  autor: {
    nome: string;
    papel: 'Estudante' | 'Professor' | 'Profissional';
    verificado?: boolean;
  };
  uteis: number;
  naoUteis: number;
  quando: string;
  publica: boolean;
  minha?: boolean;
}

export const ANOTACOES_NOTURNO: AnotacaoRica[] = [
  {
    id: 'a1',
    titulo: 'O rubato é da mão direita',
    texto:
      'No nº 2, quem atrasa e adianta é a melodia. A esquerda segura o tempo como um relógio — se ela ceder, a valsa desmancha. Estude a esquerda sozinha com metrônomo antes de juntar.',
    categoria: 'INTERPRETATION',
    alcance: 'MOVEMENT',
    movimento: '2. Andante',
    mao: 'ambas',
    nivel: 'Intermediário',
    tags: ['rubato', 'tempo'],
    autor: { nome: 'Helena Prado', papel: 'Professor', verificado: true },
    uteis: 48,
    naoUteis: 2,
    quando: 'há 3 semanas',
    publica: true,
  },
  {
    id: 'a2',
    titulo: 'Dedilhado da fioritura do compasso 16',
    texto:
      '4-3-2-1-3 na descida resolve a virada do polegar. Toque a fioritura como um suspiro, não como escala — ela não precisa caber exata no tempo.',
    categoria: 'TECHNIQUE',
    alcance: 'SPECIFIC_MEASURE',
    compassos: [16, 16],
    movimento: '2. Andante',
    pagina: 2,
    mao: 'direita',
    nivel: 'Intermediário',
    tags: ['dedilhado', 'ornamento'],
    autor: { nome: 'Marina D.', papel: 'Estudante' },
    uteis: 14,
    naoUteis: 0,
    quando: 'ontem',
    publica: true,
    minha: true,
  },
  {
    id: 'a3',
    titulo: 'Pedal a cada troca de harmonia',
    texto:
      'O baixo muda a cada tempo forte; troque o pedal ali, não por compasso. Nos compassos 13–14 a harmonia muda no meio: pedal duas vezes.',
    categoria: 'PRACTICE_TIP',
    alcance: 'SPECIFIC_MEASURE',
    compassos: [13, 14],
    movimento: '2. Andante',
    pagina: 1,
    mao: 'ambas',
    nivel: 'Iniciante',
    tags: ['pedal'],
    autor: { nome: 'R. Kowalski', papel: 'Profissional', verificado: true },
    uteis: 31,
    naoUteis: 1,
    quando: 'há 2 meses',
    publica: true,
  },
  {
    id: 'a4',
    titulo: 'Dedicados a Camille Pleyel',
    texto:
      'Marie Pleyel era pianista e mulher do fabricante dos pianos que Chopin preferia — o som "velado" do Pleyel explica muito do pedal destas peças.',
    categoria: 'HISTORICAL',
    alcance: 'ENTIRE_WORK',
    nivel: 'Todos os níveis',
    tags: ['pleyel'],
    autor: {
      nome: 'Equipe Opus Atlas',
      papel: 'Profissional',
      verificado: true,
    },
    uteis: 22,
    naoUteis: 0,
    quando: 'há 4 meses',
    publica: true,
  },
];

// ---------------------------------------------------------------------------
// História: obras emblemáticas por época (conteúdo da apresentação)
// ---------------------------------------------------------------------------

export const EMBLEMATICAS: Record<
  string,
  { titulo: string; compositor: string; ano: string }[]
> = {
  Medieval: [
    {
      titulo: 'Ordo Virtutum',
      compositor: 'Hildegard von Bingen',
      ano: 'c. 1151',
    },
    {
      titulo: 'Messe de Nostre Dame',
      compositor: 'Guillaume de Machaut',
      ano: 'c. 1365',
    },
  ],
  Renascentista: [
    { titulo: 'Missa Papae Marcelli', compositor: 'Palestrina', ano: '1562' },
    {
      titulo: 'Ave Maria… Virgo serena',
      compositor: 'Josquin des Prez',
      ano: 'c. 1485',
    },
  ],
  Barroco: [
    { titulo: 'Concertos de Brandemburgo', compositor: 'Bach', ano: '1721' },
    { titulo: 'As quatro estações', compositor: 'Vivaldi', ano: '1725' },
    { titulo: 'O Messias', compositor: 'Handel', ano: '1741' },
  ],
  Clássico: [
    { titulo: 'Sinfonia nº 40', compositor: 'Mozart', ano: '1788' },
    { titulo: 'A Criação', compositor: 'Haydn', ano: '1798' },
    { titulo: 'Sinfonia nº 5', compositor: 'Beethoven', ano: '1808' },
  ],
  Romântico: [
    { titulo: 'Winterreise', compositor: 'Schubert', ano: '1827' },
    { titulo: 'Noturnos, Op. 9', compositor: 'Chopin', ano: '1832' },
    { titulo: 'Tristão e Isolda', compositor: 'Wagner', ano: '1859' },
  ],
  Modernismo: [
    {
      titulo: 'Prélude à l’après-midi d’un faune',
      compositor: 'Debussy',
      ano: '1894',
    },
    {
      titulo: 'A sagração da primavera',
      compositor: 'Stravinsky',
      ano: '1913',
    },
    {
      titulo: 'Bachianas Brasileiras nº 5',
      compositor: 'Villa-Lobos',
      ano: '1938',
    },
  ],
};

// ---------------------------------------------------------------------------
// Envios (o mapa da /upload de hoje)
// ---------------------------------------------------------------------------

export type Qualidade = 'alta' | 'média' | 'baixa';

export const ENVIOS_FINAL = {
  limite: { usados: 3, total: 20, videos: { usados: 1, total: 4 } },
  stats: {
    compositores: 1,
    obras: 1,
    partituras: 1,
    verificados: 0,
    denunciados: 1,
  },
  compositores: [
    {
      id: 'c1',
      nome: 'Chiquinha Gonzaga',
      detalhe: 'Retrato novo · 1847–1935',
      obras: 68,
      qualidade: 'média' as Qualidade,
      estado: 'Denunciado' as const,
      quando: '21 ago',
      fonte: 'Wikipedia',
      retrato: original(
        'https://imslp.org/images/thumb/f/f3/Chiquinha_Gonzaga-1877.jpg/180px-x.jpg'
      ),
    },
  ],
  obras: [
    {
      id: 'o1',
      titulo: 'Modinha',
      compositor: 'Alberto Nepomuceno',
      detalhe: 'Voz e piano · 1894',
      qualidade: 'baixa' as Qualidade,
      estado: 'No ar' as const,
      quando: '30 ago',
      falta: ['tonalidade', 'duração', 'gravação'],
      partituras: 0,
      pai: null as string | null,
    },
  ],
  partituras: [
    {
      id: 'p1',
      titulo: 'Nº 2 com digitação',
      obra: 'Noturnos, Op. 9',
      compositor: 'Chopin',
      formato: 'PDF',
      paginas: 4,
      tamanho: '0,8 MB',
      grupo: 'Enviadas por quem estuda aqui',
      qualidade: 'alta' as Qualidade,
      estado: 'No ar' as const,
      quando: '12 set',
      baixadas: 37,
    },
  ],
  historico: [
    {
      quando: '12 set, 21:14',
      acao: 'Enviou a partitura',
      alvo: 'Nº 2 com digitação — Noturnos, Op. 9',
    },
    {
      quando: '30 ago, 10:02',
      acao: 'Criou a obra',
      alvo: 'Modinha — Alberto Nepomuceno',
    },
    {
      quando: '24 ago, 18:40',
      acao: 'Recebeu uma denúncia em',
      alvo: 'Chiquinha Gonzaga (retrato)',
    },
    {
      quando: '21 ago, 09:12',
      acao: 'Trocou o retrato de',
      alvo: 'Chiquinha Gonzaga',
    },
  ],
};

export const FORMATOS = [
  'PDF',
  'MusicXML',
  'MIDI',
  'Imagens (JPG/PNG)',
  'SVG',
  'Outro',
];
export const TIPOS_OBRA = [
  'Obra individual',
  'Coleção (opus com várias peças)',
  'Movimento ou parte de outra obra',
];
