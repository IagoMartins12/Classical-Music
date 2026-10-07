/**
 * Os dados dos três esboços da main. Saíram do banco local (01/10/2026):
 * compositores, retratos, obras, partituras e os aniversariantes do dia são
 * reais. O que é da pessoa (Marina, a lista dela, as conquistas) e os
 * concertos são de exemplo, no formato que a API devolve.
 *
 * Retrato: o banco guarda a miniatura de 180px do IMSLP; aqui se usa o
 * original (o otimizador do Next redimensiona — `imslp.org` está na lista).
 */

export const ESBOCOS = ['a', 'b', 'c'] as const;
export type EsbocoId = (typeof ESBOCOS)[number];

/** A miniatura do IMSLP vira o original: `/thumb/x/xy/Nome.jpg/180px-…` → `/x/xy/Nome.jpg`. */
export function original(url: string): string {
  return url.replace(/\/thumb(\/[^/]+\/[^/]+\/[^/]+)\/\d+px-[^/]+$/, '$1');
}

export const HOJE = { dia: 1, mes: 'outubro', rotulo: '1º de outubro' };

// -------------------------------------------------------------------------
// Compositores
// -------------------------------------------------------------------------

export interface Compositor {
  id: string;
  nome: string;
  nomeCompleto: string;
  nasc: number;
  morte?: number;
  epoca: Epoca;
  pais: string;
  retrato: string;
  verificado?: boolean;
  obras?: number;
}

export const EPOCAS = [
  {
    id: 'barroco',
    nome: 'Barroco',
    de: 1600,
    ate: 1750,
    imagem: '/epochs/baroque.jpeg',
  },
  {
    id: 'classico',
    nome: 'Clássico',
    de: 1750,
    ate: 1820,
    imagem: '/epochs/classical.webp',
  },
  {
    id: 'romantico',
    nome: 'Romântico',
    de: 1820,
    ate: 1900,
    imagem: '/epochs/romantic.jpeg',
  },
  {
    id: 'moderno',
    nome: 'Moderno',
    de: 1890,
    ate: 1950,
    imagem: '/epochs/modern.jpg',
  },
  {
    id: 'contemporaneo',
    nome: 'Contemporâneo',
    de: 1950,
    ate: 2026,
    imagem: '/epochs/contemporary.jpg',
  },
] as const;
export type Epoca = (typeof EPOCAS)[number]['id'];

const imslp = (caminho: string) =>
  original(`https://imslp.org/images/thumb/${caminho}`);

/** Os 18 "famosos" da API (`GET /composers/famous`), com a época corrigida. */
export const FAMOSOS: Compositor[] = [
  {
    id: '685d8f9a8803000f9b61d151',
    nome: 'Bach',
    nomeCompleto: 'Johann Sebastian Bach',
    nasc: 1685,
    morte: 1750,
    epoca: 'barroco',
    pais: 'Alemanha',
    retrato: imslp('6/6a/Johann_Sebastian_Bach.jpg/180px-x.jpg'),
    verificado: true,
    obras: 1128,
  },
  {
    id: '685e7a9fc6bd886c5b496d62',
    nome: 'Handel',
    nomeCompleto: 'George Frideric Handel',
    nasc: 1685,
    morte: 1759,
    epoca: 'barroco',
    pais: 'Alemanha',
    retrato: imslp('3/3d/Haendel.jpg/180px-x.jpg'),
    obras: 612,
  },
  {
    id: '685f8b71c6bd886c5b4995fe',
    nome: 'Vivaldi',
    nomeCompleto: 'Antonio Vivaldi',
    nasc: 1678,
    morte: 1741,
    epoca: 'barroco',
    pais: 'Itália',
    retrato: imslp('1/1b/Antonio_Vivaldi.jpg/180px-x.jpg'),
    obras: 803,
  },
  {
    id: '685e7ff8c6bd886c5b496e2a',
    nome: 'Haydn',
    nomeCompleto: 'Joseph Haydn',
    nasc: 1732,
    morte: 1809,
    epoca: 'classico',
    pais: 'Áustria',
    retrato: imslp('c/c6/J-haydn.jpg/180px-x.jpg'),
    obras: 1046,
  },
  {
    id: '685ef349c6bd886c5b497f8f',
    nome: 'Mozart',
    nomeCompleto: 'Wolfgang Amadeus Mozart',
    nasc: 1756,
    morte: 1791,
    epoca: 'classico',
    pais: 'Áustria',
    retrato: imslp('8/87/415_mozart.jpg/180px-x.jpg'),
    verificado: true,
    obras: 1093,
  },
  {
    id: '685d9bd98803000f9b61d369',
    nome: 'Beethoven',
    nomeCompleto: 'Ludwig van Beethoven',
    nasc: 1770,
    morte: 1827,
    epoca: 'classico',
    pais: 'Alemanha',
    retrato: imslp('9/92/Beethoven2.jpg/180px-x.jpg'),
    verificado: true,
    obras: 722,
  },
  {
    id: '685f4a93c6bd886c5b498cce',
    nome: 'Schubert',
    nomeCompleto: 'Franz Schubert',
    nasc: 1797,
    morte: 1828,
    epoca: 'romantico',
    pais: 'Áustria',
    retrato: imslp('3/39/Schubert_HQ.JPG/180px-x.JPG'),
    obras: 998,
  },
  {
    id: '685ee433c6bd886c5b497d55',
    nome: 'Mendelssohn',
    nomeCompleto: 'Felix Mendelssohn',
    nasc: 1809,
    morte: 1847,
    epoca: 'romantico',
    pais: 'Alemanha',
    retrato: 'https://imslp.org/images/f/f4/Mendelssohn.JPG',
    obras: 487,
  },
  {
    id: '685e1087c6bd886c5b495d66',
    nome: 'Chopin',
    nomeCompleto: 'Frédéric Chopin',
    nasc: 1810,
    morte: 1849,
    epoca: 'romantico',
    pais: 'Polônia',
    retrato: imslp('3/34/Chopin_Photo.jpg/180px-x.jpg'),
    verificado: true,
    obras: 179,
  },
  {
    id: '685f4badc6bd886c5b498cf1',
    nome: 'Schumann',
    nomeCompleto: 'Robert Schumann',
    nasc: 1810,
    morte: 1856,
    epoca: 'romantico',
    pais: 'Alemanha',
    retrato: imslp('f/f7/Schumann.jpg/180px-x.jpg'),
    obras: 402,
  },
  {
    id: '685f8f06c6bd886c5b49967e',
    nome: 'Wagner',
    nomeCompleto: 'Richard Wagner',
    nasc: 1813,
    morte: 1883,
    epoca: 'romantico',
    pais: 'Alemanha',
    retrato: imslp('2/23/Wagner_370.jpg/180px-x.jpg'),
    obras: 214,
  },
  {
    id: '685dec2bc6bd886c5b4958cd',
    nome: 'Brahms',
    nomeCompleto: 'Johannes Brahms',
    nasc: 1833,
    morte: 1897,
    epoca: 'romantico',
    pais: 'Alemanha',
    retrato: imslp('9/9e/Brahms-old.jpg/180px-x.jpg'),
    obras: 386,
  },
  {
    id: '685e3b49c6bd886c5b496396',
    nome: 'Dvořák',
    nomeCompleto: 'Antonín Dvořák',
    nasc: 1841,
    morte: 1904,
    epoca: 'romantico',
    pais: 'Tchéquia',
    retrato: imslp('1/12/Dvorak.jpg/180px-x.jpg'),
    obras: 302,
  },
  {
    id: '685ed386c6bd886c5b497af9',
    nome: 'Mahler',
    nomeCompleto: 'Gustav Mahler',
    nasc: 1860,
    morte: 1911,
    epoca: 'romantico',
    pais: 'Áustria',
    retrato: imslp('b/b6/Mahler-picture-big.jpg/180px-x.jpg'),
    obras: 74,
  },
  {
    id: '685e2b6fc6bd886c5b49611d',
    nome: 'Debussy',
    nomeCompleto: 'Claude Debussy',
    nasc: 1862,
    morte: 1918,
    epoca: 'moderno',
    pais: 'França',
    retrato: imslp('3/31/C_debussy.png/180px-x.png'),
    obras: 263,
  },
  {
    id: '685f248cc6bd886c5b498739',
    nome: 'Ravel',
    nomeCompleto: 'Maurice Ravel',
    nasc: 1875,
    morte: 1937,
    epoca: 'moderno',
    pais: 'França',
    retrato: imslp('4/40/M_ravel.jpg/180px-x.jpg'),
    obras: 121,
  },
  {
    id: '685f6a0bc6bd886c5b499135',
    nome: 'Stravinsky',
    nomeCompleto: 'Igor Stravinsky',
    nasc: 1882,
    morte: 1971,
    epoca: 'moderno',
    pais: 'Rússia',
    retrato: imslp('9/99/Stravinsky.jpg/180px-x.jpg'),
    obras: 138,
  },
  {
    id: '685f2686c6bd886c5b49878c',
    nome: 'Reich',
    nomeCompleto: 'Steve Reich',
    nasc: 1936,
    epoca: 'contemporaneo',
    pais: 'Estados Unidos',
    retrato: imslp('2/28/Picture-Reich%2C_Steve.png/180px-x.png'),
    obras: 41,
  },
];

export const compositor = (nome: string) =>
  FAMOSOS.find((c) => c.nome === nome) as Compositor;

export const CHOPIN = {
  ...compositor('Chopin'),
  nascimento: '1º de março de 1810, Żelazowa Wola',
  falecimento: '17 de outubro de 1849, Paris',
  instrumento: 'Piano',
  obras: 179,
  partituras: 4812,
  bio: [
    'Frédéric Chopin foi um compositor e pianista polonês do período romântico, e quase tudo o que escreveu tem o piano no centro. Estudou no Conservatório de Varsóvia, deixou a Polônia aos vinte anos e nunca mais voltou: fez carreira em Paris, onde tocava mais em salões do que em grandes salas.',
    'Deu ao piano formas que pareciam pequenas — noturnos, mazurcas, prelúdios, estudos — e encheu-as de uma harmonia que só seria plenamente compreendida décadas depois. Os Estudos Op. 10 e Op. 25 mudaram a técnica do instrumento; as Baladas e os Scherzos inventaram uma narrativa sem palavras.',
    'Morreu de tuberculose aos 39 anos. O coração foi levado para Varsóvia, como ele pediu.',
  ],
};

export interface ObraResumo {
  id: string;
  titulo: string;
  catalogo?: string;
  ano?: string;
  genero: string;
  nivel?: 'Iniciante' | 'Intermediário' | 'Avançado';
  partituras?: number;
}

/** Obras reais do Chopin (ids do banco). O nível do banco está errado em
 * várias (Estudos Op. 10 como "iniciante") — aqui vai o que a obra é. */
export const OBRAS_CHOPIN: ObraResumo[] = [
  {
    id: '686b45924206d8332943ebfd',
    titulo: 'Noturnos',
    catalogo: 'Op. 9',
    ano: '1830–31',
    genero: 'Noturno',
    nivel: 'Intermediário',
    partituras: 116,
  },
  {
    id: '686345f5204a67621b0bfbc5',
    titulo: 'Balada nº 1',
    catalogo: 'Op. 23',
    ano: '1835',
    genero: 'Balada',
    nivel: 'Avançado',
    partituras: 64,
  },
  {
    id: '6879bb4668d244782048cff7',
    titulo: 'Estudos',
    catalogo: 'Op. 10',
    ano: '1829–32',
    genero: 'Estudo',
    nivel: 'Avançado',
    partituras: 141,
  },
  {
    id: '686c92b43d4f77ce841eb54d',
    titulo: 'Sonata para piano nº 2',
    catalogo: 'Op. 35',
    ano: '1839',
    genero: 'Sonata',
    nivel: 'Avançado',
    partituras: 47,
  },
  {
    id: '686c73dd3d4f77ce841eae9c',
    titulo: 'Concerto para piano nº 1',
    catalogo: 'Op. 11',
    ano: '1830',
    genero: 'Concerto',
    nivel: 'Avançado',
    partituras: 39,
  },
  {
    id: '686d53c1e3de9a37f27c4886',
    titulo: 'Polonaise em lá bemol maior',
    catalogo: 'Op. 53',
    ano: '1842',
    genero: 'Polonaise',
    nivel: 'Avançado',
    partituras: 52,
  },
  {
    id: '6879539dab264c0093d7823a',
    titulo: 'Valsas',
    catalogo: 'Op. 64',
    ano: '1846–47',
    genero: 'Valsa',
    nivel: 'Intermediário',
    partituras: 88,
  },
  {
    id: '686a6f87c93ef3be836d818f',
    titulo: 'Mazurcas',
    catalogo: 'Op. 17',
    ano: '1831–33',
    genero: 'Mazurca',
    nivel: 'Intermediário',
    partituras: 33,
  },
  {
    id: '686e699ac3a93a29566ce5e8',
    titulo: 'Scherzo nº 2',
    catalogo: 'Op. 31',
    ano: '1837',
    genero: 'Scherzo',
    nivel: 'Avançado',
    partituras: 41,
  },
];

/** Quantas obras por gênero (as fichas do catálogo do compositor). */
export const GENEROS_CHOPIN = [
  { nome: 'Mazurcas', n: 58 },
  { nome: 'Valsas', n: 19 },
  { nome: 'Noturnos', n: 21 },
  { nome: 'Polonaises', n: 16 },
  { nome: 'Estudos', n: 27 },
  { nome: 'Prelúdios', n: 26 },
  { nome: 'Baladas', n: 4 },
  { nome: 'Scherzos', n: 4 },
  { nome: 'Sonatas', n: 4 },
  { nome: 'Canções', n: 19 },
];

/** Obras por ano de composição — a vida desenhada no esboço B. */
export const OBRAS_POR_ANO: { ano: number; n: number }[] = [
  [1817, 2],
  [1820, 1],
  [1824, 3],
  [1826, 4],
  [1827, 5],
  [1828, 6],
  [1829, 9],
  [1830, 11],
  [1831, 8],
  [1832, 9],
  [1833, 7],
  [1834, 6],
  [1835, 9],
  [1836, 8],
  [1837, 10],
  [1838, 7],
  [1839, 11],
  [1840, 6],
  [1841, 8],
  [1842, 7],
  [1843, 6],
  [1844, 3],
  [1845, 5],
  [1846, 6],
  [1847, 4],
  [1848, 2],
  [1849, 2],
].map(([ano, n]) => ({ ano, n }));

// -------------------------------------------------------------------------
// A obra
// -------------------------------------------------------------------------

export interface Partitura {
  id: string;
  paginas: number;
  tamanho: string;
  miniatura: string;
}

/**
 * Os Noturnos Op. 9 em resumo (home e prateleiras). A ficha inteira, com as
 * partituras agrupadas como no site, está em `fichas-dados.ts`.
 */
export const NOTURNO = {
  id: '686b45924206d8332943ebfd',
  titulo: 'Noturnos',
  catalogo: 'Op. 9',
  compositor: CHOPIN,
  ano: '1830–31',
  publicacao: '1832',
  dedicatoria: 'à Madame Camille Pleyel',
  instrumentacao: 'Piano',
  genero: 'Noturno',
  nivel: 'Intermediário' as const,
  movimentos: [
    { n: 1, titulo: 'Larghetto', tom: 'si bemol menor', duracao: '5:40' },
    { n: 2, titulo: 'Andante', tom: 'mi bemol maior', duracao: '4:32' },
    { n: 3, titulo: 'Allegretto', tom: 'si maior', duracao: '6:55' },
  ],
  gravacao: {
    titulo: 'Noturno nº 3 em si maior',
    interprete: 'Xuan He',
    fonte: 'Wikimedia Commons · domínio público',
    duracao: '6:55',
  },
  spotify: 'Olga Bordas',
  youtube: 'Chopin — Nocturne op. 9 nº 2',
  contagem: { completas: 31, arranjos: 85, partes: 0 },
  anotacoes: 12,
  estudando: 214,
  aprenderam: 1380,
  partituras: [
    {
      id: 'p1',
      paginas: 7,
      tamanho: '1,27 MB',
      miniatura:
        'https://cdn.imslp.org/images/thumb/pdfs/98/2a88a6af5a75675a2291fe15ceb9fec94d57a54e.png',
    },
    {
      id: 'p2',
      paginas: 8,
      tamanho: '2,42 MB',
      miniatura:
        'https://cdn.imslp.org/images/thumb/pdfs/20/fbb491140ee8e6cc5f50a64be544e8b18d95d9b9.png',
    },
    {
      id: 'p3',
      paginas: 3,
      tamanho: '0,39 MB',
      miniatura:
        'https://cdn.imslp.org/images/thumb/pdfs/c0/7031079e65198ad8f7039cc5cd94e90e734e8a33.png',
    },
    {
      id: 'p4',
      paginas: 4,
      tamanho: '1,24 MB',
      miniatura:
        'https://cdn.imslp.org/images/thumb/pdfs/14/6e0fee5a07b48e06c89de239a35092d2b7a3e85d.png',
    },
    {
      id: 'p5',
      paginas: 4,
      tamanho: '2,11 MB',
      miniatura:
        'https://cdn.imslp.org/images/thumb/pdfs/30/10e6ffae039a1c97eb46a7b0373f956b7eb88ffc.png',
    },
  ] satisfies Partitura[],
  arranjos: [
    { grupo: 'Violão (Tárrega)', n: 3 },
    { grupo: 'Violão (Llobet)', n: 1 },
    { grupo: 'Piano a 4 mãos', n: 6 },
    { grupo: 'Violino e piano (Sarasate)', n: 4 },
    { grupo: 'Violoncelo e piano (Popper)', n: 3 },
  ],
};

export const RELACIONADAS: (ObraResumo & { compositor: string })[] = [
  {
    id: 'r1',
    titulo: 'Noturnos',
    catalogo: 'Op. 27',
    ano: '1835',
    genero: 'Noturno',
    compositor: 'Chopin',
    nivel: 'Avançado',
  },
  {
    id: 'r2',
    titulo: 'Noturno nº 5',
    catalogo: 'H. 37',
    ano: '1816',
    genero: 'Noturno',
    compositor: 'John Field',
    nivel: 'Intermediário',
  },
  {
    id: 'r3',
    titulo: 'Clair de lune',
    catalogo: 'L. 75',
    ano: '1890',
    genero: 'Suíte',
    compositor: 'Debussy',
    nivel: 'Intermediário',
  },
  {
    id: 'r4',
    titulo: 'Liebestraum nº 3',
    catalogo: 'S. 541',
    ano: '1850',
    genero: 'Noturno',
    compositor: 'Liszt',
    nivel: 'Avançado',
  },
];

// -------------------------------------------------------------------------
// O dia, coleções, concertos, busca
// -------------------------------------------------------------------------

/** Quem nasceu e quem morreu em 1º de outubro, do banco local, por nº de obras. */
export const DIA = {
  nasceram: [
    {
      id: '685d91278803000f9b61d18e',
      nome: 'Pierre Baillot',
      ano: 1771,
      morte: 1842,
      pais: 'França',
      epoca: 'Clássico',
      obras: 39,
      retrato: imslp('9/91/Pierre_Baillot.jpg/180px-x.jpg'),
      papel: 'violinista e compositor',
    },
    {
      id: '685fa33cc6bd886c5b49991e',
      nome: 'Henry Clay Work',
      ano: 1832,
      morte: 1884,
      pais: 'Estados Unidos',
      epoca: 'Romântico',
      obras: 70,
      retrato: imslp('6/6d/Work%2C_Henry_Clay.jpg/180px-x.jpg'),
      papel: 'compositor de canções',
    },
    {
      id: '685e1283c6bd886c5b495db7',
      nome: 'Giovanni Battista Cirri',
      ano: 1724,
      morte: 1808,
      pais: 'Itália',
      epoca: 'Barroco',
      obras: 14,
      retrato: imslp('1/1c/Cirri.jpg/180px-x.jpg'),
      papel: 'violoncelista e compositor',
    },
  ],
  morreram: [
    {
      id: '685e36b3c6bd886c5b4962d6',
      nome: 'Riccardo Drigo',
      ano: 1930,
      nasc: 1846,
      pais: 'Itália',
      obras: 18,
      retrato: imslp('d/d9/RiccardoDrigo.jpg/180px-x.jpg'),
    },
    {
      id: '685f536ac6bd886c5b498df8',
      nome: 'Nikolay Shcherbachyov',
      ano: 1922,
      nasc: 1853,
      pais: 'Rússia',
      obras: 31,
      retrato: imslp('a/a4/Shcherbachev.jpg/180px-x.jpg'),
    },
  ],
};

export interface Colecao {
  id: string;
  titulo: string;
  descricao: string;
  obras: number;
  rostos: string[];
}

export const COLECOES: Colecao[] = [
  {
    id: 'comecar-no-piano',
    titulo: 'Para começar no piano',
    descricao:
      'Peças curtas, de leitura clara, que soam como música desde a primeira semana.',
    obras: 24,
    rostos: ['Bach', 'Schumann', 'Mozart', 'Chopin'],
  },
  {
    id: 'ate-cinco-minutos',
    titulo: 'Obras de até cinco minutos',
    descricao: 'Para o recital, a prova ou o intervalo do almoço.',
    obras: 40,
    rostos: ['Satie', 'Chopin', 'Debussy', 'Brahms'],
  },
  {
    id: 'noturnos',
    titulo: 'A noite no piano',
    descricao: 'De John Field, que inventou o noturno, a Fauré.',
    obras: 18,
    rostos: ['Chopin', 'Debussy', 'Schubert', 'Mendelssohn'],
  },
  {
    id: 'cordas-barroco',
    titulo: 'Cordas no Barroco',
    descricao: 'Sonatas e partitas para violino e violoncelo solo.',
    obras: 31,
    rostos: ['Bach', 'Vivaldi', 'Handel', 'Haydn'],
  },
];

export const COLECAO_PIANO = [
  {
    titulo: 'Prelúdio em dó maior',
    catalogo: 'BWV 846',
    compositor: 'Bach',
    min: 2,
    nivel: 'Iniciante',
  },
  {
    titulo: 'Álbum para a juventude, nº 1',
    catalogo: 'Op. 68',
    compositor: 'Schumann',
    min: 1,
    nivel: 'Iniciante',
  },
  {
    titulo: 'Sonata facile, I',
    catalogo: 'K. 545',
    compositor: 'Mozart',
    min: 4,
    nivel: 'Iniciante',
  },
  {
    titulo: 'Prelúdio em mi menor',
    catalogo: 'Op. 28 nº 4',
    compositor: 'Chopin',
    min: 2,
    nivel: 'Iniciante',
  },
  {
    titulo: 'Para Elisa',
    catalogo: 'WoO 59',
    compositor: 'Beethoven',
    min: 3,
    nivel: 'Iniciante',
  },
  {
    titulo: 'Valsa em lá menor',
    catalogo: 'B. 150',
    compositor: 'Chopin',
    min: 2,
    nivel: 'Iniciante',
  },
];

export const CONCERTOS = [
  {
    id: 'c1',
    dia: '4',
    mes: 'out',
    semana: 'sáb',
    titulo: 'Chopin e Liszt — recital de piano',
    local: 'Sala Cecília Meireles',
    cidade: 'Rio de Janeiro',
    hora: '19h',
  },
  {
    id: 'c2',
    dia: '9',
    mes: 'out',
    semana: 'qui',
    titulo: 'Sinfonia nº 9 de Dvořák',
    local: 'Theatro Municipal',
    cidade: 'São Paulo',
    hora: '20h',
  },
  {
    id: 'c3',
    dia: '12',
    mes: 'out',
    semana: 'dom',
    titulo: 'As quatro estações',
    local: 'Theatro Municipal',
    cidade: 'Rio de Janeiro',
    hora: '11h',
  },
];

export const BUSCA_EXEMPLO = {
  termo: 'noturno',
  compositores: [
    { nome: 'John Field', detalhe: 'inventou o noturno · 1782–1837' },
  ],
  obras: [
    { titulo: 'Noturnos, Op. 9', compositor: 'Chopin', partituras: 116 },
    { titulo: 'Noturnos, Op. 27', compositor: 'Chopin', partituras: 72 },
    { titulo: 'Noturno nº 5, H. 37', compositor: 'John Field', partituras: 9 },
    {
      titulo: 'Noturno em dó sustenido menor, B. 49',
      compositor: 'Chopin',
      partituras: 40,
    },
  ],
  artigos: [
    {
      titulo: 'Como o noturno saiu da Irlanda e chegou a Paris',
      autor: 'Equipe Opus Atlas',
    },
  ],
  generos: ['Noturnos (612 obras)'],
};

export const NUMEROS = {
  obras: 207892,
  compositores: 19177,
  partituras: 92167,
};

// -------------------------------------------------------------------------
// A pessoa
// -------------------------------------------------------------------------

export const PESSOA = {
  nome: 'Marina',
  nomeCompleto: 'Marina Duarte',
  email: 'marina@exemplo.com',
  instrumento: 'Piano',
  plano: 'Free',
  xp: 1240,
  nivel: 6,
  proximoNivel: 1500,
  sequencia: 9,
  estudando: [
    {
      obra: 'Noturnos, Op. 9 nº 2',
      compositor: 'Chopin',
      edicao: 'Partitura completa · IMSLP',
      desde: 'há 3 semanas',
      progresso: 'Compassos 1–16 firmes',
    },
    {
      obra: 'Invenção nº 8, BWV 779',
      compositor: 'Bach',
      edicao: 'Partitura completa · IMSLP',
      desde: 'há 6 dias',
      progresso: 'Mão esquerda sozinha',
    },
  ],
  queroAprender: [
    { obra: 'Clair de lune', compositor: 'Debussy' },
    { obra: 'Balada nº 1, Op. 23', compositor: 'Chopin' },
    { obra: 'Gymnopédie nº 1', compositor: 'Satie' },
  ],
  aprendi: [
    {
      obra: 'Prelúdio em mi menor, Op. 28 nº 4',
      compositor: 'Chopin',
      dominio: 'Toco de cor',
    },
    {
      obra: 'Para Elisa, WoO 59',
      compositor: 'Beethoven',
      dominio: 'Com a partitura',
    },
    {
      obra: 'Prelúdio em dó maior, BWV 846',
      compositor: 'Bach',
      dominio: 'Toco de cor',
    },
  ],
  favoritos: {
    compositores: ['Chopin', 'Debussy', 'Bach', 'Schumann', 'Ravel'],
    obras: [
      'Noturnos, Op. 9',
      'Suíte bergamasque',
      'Kinderszenen, Op. 15',
      'Gaspard de la nuit',
    ],
    partituras: [
      'Noturnos, Op. 9 — partitura completa',
      'Invenções, BWV 772–786 — partitura completa',
    ],
  },
  anotacoes: [
    {
      obra: 'Noturnos, Op. 9',
      compositor: 'Chopin',
      texto:
        'No nº 2, o rubato é na mão direita; a esquerda segura o tempo como um relógio.',
      quando: 'ontem',
      curtidas: 14,
      publica: true,
    },
    {
      obra: 'Invenção nº 8',
      compositor: 'Bach',
      texto:
        'Dedilhado 1-2-3-1 na subida do compasso 3 resolve a virada do polegar.',
      quando: 'há 4 dias',
      curtidas: 3,
      publica: false,
    },
  ],
  envios: [
    {
      tipo: 'Partitura',
      titulo: 'Noturno Op. 9 nº 2 — digitação própria',
      estado: 'No ar',
      quando: '12 set',
    },
    {
      tipo: 'Obra',
      titulo: 'Modinha, de Alberto Nepomuceno',
      estado: 'No ar',
      quando: '30 ago',
    },
    {
      tipo: 'Compositor',
      titulo: 'Chiquinha Gonzaga — retrato novo',
      estado: 'Denunciado',
      quando: '21 ago',
    },
  ],
  limiteEnvios: { usados: 3, total: 20 },
};

export interface Conquista {
  id: string;
  nome: string;
  como: string;
  xp: number;
  feita?: string;
  progresso?: { atual: number; total: number };
  rara?: boolean;
}

export const CONQUISTAS: Conquista[] = [
  {
    id: 'primeira-partitura',
    nome: 'Primeira estante',
    como: 'Escolher a partitura de uma obra que você quer aprender',
    xp: 50,
    feita: '14 set',
  },
  {
    id: 'nove-dias',
    nome: 'Nove dias seguidos',
    como: 'Abrir o que está estudando em nove dias seguidos',
    xp: 120,
    feita: 'hoje',
  },
  {
    id: 'primeira-anotacao',
    nome: 'Primeira nota na margem',
    como: 'Publicar uma anotação numa obra',
    xp: 40,
    feita: '20 set',
  },
  {
    id: 'aprendi-tres',
    nome: 'Três peças de cor',
    como: 'Marcar três obras como aprendidas',
    xp: 150,
    feita: '28 set',
  },
  {
    id: 'contribuir',
    nome: 'Mão na enciclopédia',
    como: 'Enviar uma obra ao acervo',
    xp: 80,
    feita: '30 ago',
  },
  {
    id: 'epocas',
    nome: 'Quatro séculos',
    como: 'Ter no repertório obras de quatro épocas',
    xp: 200,
    progresso: { atual: 3, total: 4 },
  },
  {
    id: 'anotacoes-curtidas',
    nome: 'Margem lida',
    como: 'Receber 25 curtidas nas suas anotações',
    xp: 150,
    progresso: { atual: 17, total: 25 },
  },
  {
    id: 'trinta-dias',
    nome: 'Um mês ao piano',
    como: 'Estudar trinta dias seguidos',
    xp: 400,
    progresso: { atual: 9, total: 30 },
    rara: true,
  },
  {
    id: 'dez-envios',
    nome: 'Arquivista',
    como: 'Ter dez envios no ar',
    xp: 300,
    progresso: { atual: 2, total: 10 },
  },
];

/** Os itens da barra aprovados em 01/10. */
export const EXPLORAR = [
  {
    rotulo: 'Compositores',
    detalhe: '19 mil, do Barroco a hoje',
    href: 'compositores',
  },
  { rotulo: 'Obras', detalhe: '208 mil, com partitura grátis', href: 'obras' },
  { rotulo: 'Gêneros', detalhe: 'Noturno, sonata, fuga…', href: 'generos' },
  {
    rotulo: 'História da música',
    detalhe: 'As épocas contadas em ordem',
    href: 'historia',
  },
  {
    rotulo: 'Instrumentos',
    detalhe: 'Da família das cordas ao órgão',
    href: 'instrumentos',
  },
] as const;

// -------------------------------------------------------------------------
// Telas e rotas do esboço
// -------------------------------------------------------------------------

export const TELAS = [
  { id: 'inicio', rotulo: 'Início', grupo: 'Público' },
  { id: 'compositor', rotulo: 'Compositor completo', grupo: 'Público' },
  { id: 'obra', rotulo: 'Obra completa', grupo: 'Público' },
  {
    id: 'compositor-tipico',
    rotulo: 'Compositor típico (sem bio)',
    grupo: 'Público',
  },
  { id: 'obra-tipica', rotulo: 'Obra típica (sem mídia)', grupo: 'Público' },
  { id: 'compositores', rotulo: 'Compositores (lista)', grupo: 'Público' },
  { id: 'obras', rotulo: 'Obras (lista)', grupo: 'Público' },
  { id: 'historia', rotulo: 'História da música', grupo: 'Público' },
  { id: 'instrumentos', rotulo: 'Instrumentos', grupo: 'Público' },
  { id: 'estudar', rotulo: 'Estudar (autodidata)', grupo: 'Público' },
  { id: 'busca', rotulo: 'Busca', grupo: 'Público' },
  { id: 'dia', rotulo: 'Nasceu num dia como hoje', grupo: 'Público' },
  { id: 'colecao', rotulo: 'Coleção', grupo: 'Público' },
  { id: 'ensino', rotulo: 'Ensino', grupo: 'Público' },
  { id: 'estudo', rotulo: 'Estudo (lições)', grupo: 'Seu' },
  { id: 'favoritos', rotulo: 'Favoritos', grupo: 'Seu' },
  { id: 'anotacoes', rotulo: 'Anotações', grupo: 'Seu' },
  { id: 'envios', rotulo: 'Envios', grupo: 'Seu' },
  { id: 'conquistas', rotulo: 'Conquistas', grupo: 'Seu' },
  { id: 'colecoes-minhas', rotulo: 'Coleções', grupo: 'Seu' },
  { id: 'perfil', rotulo: 'Perfil', grupo: 'Seu' },
  { id: 'confirmar', rotulo: 'Confirmar conta (token)', grupo: 'Sistema' },
  { id: 'redefinir', rotulo: 'Nova senha (token)', grupo: 'Sistema' },
  { id: 'convite', rotulo: 'Convite de professor (token)', grupo: 'Sistema' },
  { id: '404', rotulo: 'Não encontrada (404)', grupo: 'Sistema' },
  { id: 'negado', rotulo: 'Acesso negado', grupo: 'Sistema' },
] as const;
export type Tela = (typeof TELAS)[number]['id'];

export const TELAS_PESSOAIS: Tela[] = [
  'colecoes-minhas',
  'estudo',
  'favoritos',
  'anotacoes',
  'envios',
  'conquistas',
  'perfil',
];

export const rota = (esboco: EsbocoId, tela: Tela = 'inicio') =>
  tela === 'inicio'
    ? `/esbocos-main/${esboco}`
    : `/esbocos-main/${esboco}/${tela}`;

/** Destino de cada item da barra dentro do esboço (o que não foi desenhado leva ao início). */
export function destino(esboco: EsbocoId, chave: string): string {
  const mapa: Record<string, Tela> = {
    compositores: 'compositores',
    obras: 'obras',
    generos: 'obras',
    historia: 'historia',
    instrumentos: 'instrumentos',
    estudar: 'estudar',
    blog: 'inicio',
    ensino: 'ensino',
    planos: 'ensino',
    sobre: 'inicio',
  };
  return rota(esboco, mapa[chave] ?? 'inicio');
}

export const formatar = (n: number) => n.toLocaleString('pt-BR');
