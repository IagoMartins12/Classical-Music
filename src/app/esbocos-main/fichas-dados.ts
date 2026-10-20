/**
 * As fichas dos esboços, desenhadas para o acervo como ele é (medido em
 * 02/10 no banco local):
 *
 * - compositores (19.176): retrato real 70,5% · biografia 3,4% · nascimento
 *   96,8% · nacionalidade 82,1% · vídeo 0% · ficha básica completa 2,9% (559);
 * - obras (207.891): ano 37% · catálogo 43% · movimentos 54% · dedicatória
 *   26% · Spotify 5,8% · YouTube 1,7% · áudio 0,1% · videoaula 1 obra ·
 *   categorias 58% · gênero e link do IMSLP em quase todas.
 *
 * Por isso há duas fichas de cada: a **completa** (Chopin, Noturnos Op. 9) e
 * a **típica** (Pierre Baillot, sem biografia; Caprichos Op. 2, sem ano, sem
 * mídia e sem partitura guardada — a página nasce "buscando no IMSLP").
 * A página mostra o que existe; o que falta vira convite para completar.
 *
 * Partituras: agrupadas como hoje (abas por tipo, os grupos do IMSLP, os
 * envios da comunidade primeiro). Sem edição, sem editor, sem downloads —
 * o banco não tem (todas as 116 dos Noturnos estão sem contagem).
 */

import { compositor, original } from './dados';

export const MINIATURAS = [
  'https://cdn.imslp.org/images/thumb/pdfs/98/2a88a6af5a75675a2291fe15ceb9fec94d57a54e.png',
  'https://cdn.imslp.org/images/thumb/pdfs/20/fbb491140ee8e6cc5f50a64be544e8b18d95d9b9.png',
  'https://cdn.imslp.org/images/thumb/pdfs/c0/7031079e65198ad8f7039cc5cd94e90e734e8a33.png',
  'https://cdn.imslp.org/images/thumb/pdfs/14/6e0fee5a07b48e06c89de239a35092d2b7a3e85d.png',
  'https://cdn.imslp.org/images/thumb/pdfs/30/10e6ffae039a1c97eb46a7b0373f956b7eb88ffc.png',
  'https://cdn.imslp.org/images/thumb/pdfs/e8/9bb9e2311e1717db11e5d8f4bf2243e620c58dc1.png',
  'https://cdn.imslp.org/images/thumb/pdfs/22/b108e103c7c85b1763658d6d3ca472338e609b65.png',
  'https://cdn.imslp.org/images/thumb/pdfs/5d/185c2c6cb80154199827fe3d7425d861c392efa0.png',
];

// ---------------------------------------------------------------------------
// Partituras
// ---------------------------------------------------------------------------

export const TIPOS = [
  { id: 'partituras', rotulo: 'Partituras' },
  { id: 'partes', rotulo: 'Partes' },
  { id: 'arranjos', rotulo: 'Arranjos' },
  { id: 'libretos', rotulo: 'Libretos' },
  { id: 'outros', rotulo: 'Outros' },
  { id: 'fontes', rotulo: 'Arquivos-fonte' },
] as const;
export type TipoPartitura = (typeof TIPOS)[number]['id'];

export interface Arquivo {
  id: string;
  /** O que o IMSLP chama o arquivo ("Partitura completa", "Parte do violino"). */
  titulo: string;
  paginas?: number;
  tamanho?: string;
  miniatura?: string;
  /** Enviado por alguém do Opus Atlas (não veio do IMSLP). */
  autor?: string;
}

export interface Grupo {
  titulo: string;
  comunidade?: boolean;
  arquivos: Arquivo[];
}

export type Partituras = Partial<Record<TipoPartitura, Grupo[]>>;

const PAGINAS = [7, 8, 3, 4, 4, 4, 8, 2];
const TAMANHOS = [
  '1,27 MB',
  '2,42 MB',
  '0,39 MB',
  '1,24 MB',
  '2,11 MB',
  '0,15 MB',
  '2,99 MB',
  '0,09 MB',
];

function arquivos(
  prefixo: string,
  n: number,
  titulo = 'Partitura completa',
  desde = 0
): Arquivo[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefixo}-${i}`,
    titulo,
    paginas: PAGINAS[(i + desde) % 8],
    tamanho: TAMANHOS[(i + desde) % 8],
    miniatura: MINIATURAS[(i + desde) % 8],
  }));
}

/** Os grupos reais dos Noturnos Op. 9 (116 arquivos; os 31 de arranjo resumidos). */
export const PARTITURAS_NOTURNO: Partituras = {
  partituras: [
    {
      titulo: 'Enviadas por quem estuda aqui',
      comunidade: true,
      arquivos: [
        {
          id: 'u1',
          titulo: 'Nº 2 com digitação',
          paginas: 4,
          tamanho: '0,8 MB',
          miniatura: MINIATURAS[3],
          autor: 'Marina D.',
        },
      ],
    },
    { titulo: 'Partitura completa', arquivos: arquivos('pc', 29) },
    { titulo: '1. Larghetto', arquivos: arquivos('lg', 2, '1. Larghetto', 2) },
  ],
  arranjos: [
    {
      titulo: 'Para instrumento e piano (Larocque)',
      arquivos: arquivos('a1', 12, 'Parte', 1),
    },
    {
      titulo: 'Para orquestra (Mouton)',
      arquivos: arquivos('a2', 12, 'Partitura e partes', 2),
    },
    {
      titulo: 'Para violoncelo e cordas (Choe)',
      arquivos: arquivos('a3', 7, 'Parte', 3),
    },
    {
      titulo: 'Para violino ou violoncelo e piano (Hofmann)',
      arquivos: arquivos('a4', 5, 'Parte', 4),
    },
    {
      titulo: 'Para violão (Tárrega)',
      arquivos: arquivos('a5', 3, 'Partitura completa', 5),
    },
    {
      titulo: 'Para violoncelo e piano (Servais)',
      arquivos: arquivos('a6', 3, 'Parte', 6),
    },
    {
      titulo: 'Para violino e piano (Sarasate)',
      arquivos: arquivos('a7', 2, 'Parte', 7),
    },
    {
      titulo: 'Para piano a quatro mãos (Horn)',
      arquivos: arquivos('a8', 1, 'Partitura completa', 0),
    },
  ],
};

/** Quantos arquivos, somando os grupos de um tipo. */
export const contar = (p: Partituras, t: TipoPartitura) =>
  (p[t] ?? []).reduce((n, g) => n + g.arquivos.length, 0);

export const totalDe = (p: Partituras) =>
  TIPOS.reduce((n, t) => n + contar(p, t.id), 0);

// ---------------------------------------------------------------------------
// Fichas
// ---------------------------------------------------------------------------

export interface Artigo {
  titulo: string;
  slug: string;
  leitura?: number;
  capa?: string;
}

export interface Midia {
  /** Gravação de domínio público (Wikimedia) ou enviada. */
  audio?: {
    titulo: string;
    interprete: string;
    fonte: string;
    duracao?: string;
  };
  spotify?: { faixa: string; artista: string; capa: string; duracao: string };
  youtube?: { titulo: string; id: string };
  videoaula?: { titulo: string; autor: string };
}

export interface FichaObra {
  id: string;
  titulo: string;
  catalogo?: string;
  compositor: {
    nome: string;
    nomeCompleto: string;
    retrato?: string | null;
    anos: string;
  };
  ano?: string;
  publicacao?: string;
  dedicatoria?: string;
  /** Como vem do IMSLP; às vezes cru ("Title suggests…"). */
  instrumentacao: string;
  movimentos?: { titulo: string; detalhe?: string }[];
  /** O texto cru de movimentos quando não há lista ("12 caprices"). */
  movimentosTexto?: string;
  generos: string[];
  categorias: string[];
  /** Dificuldade estimada — o banco tem para todas, mas não é confiável. */
  nivel?: string;
  midia: Midia;
  imslp: 'stored' | 'pending' | 'none';
  partituras: Partituras;
  artigos: Artigo[];
  anotacoes: number;
  estudando: number;
  aprenderam: number;
  /** O que falta e a comunidade pode completar. */
  falta: string[];
}

export interface FichaCompositor {
  id: string;
  nome: string;
  nomeCompleto: string;
  retrato?: string | null;
  nasc: number;
  morte?: number;
  nascimento?: string;
  falecimento?: string;
  pais?: string;
  epoca: string;
  /** O que fazia (do IMSLP: "Violin, Piano…" → "violinista"). */
  papel?: string;
  instrumentos?: string;
  bio?: string[];
  /** Quando não há biografia: uma frase montada só com os dados — nada inventado. */
  resumo: string;
  video?: { titulo: string; id: string };
  curiosidades: string[];
  obras: number;
  porGenero: { nome: string; n: number }[];
  destaques: {
    id: string;
    titulo: string;
    detalhe: string;
    partituras?: number;
  }[];
  artigos: Artigo[];
  verificado?: boolean;
  wikipedia?: string;
  falta: string[];
}

const chopin = compositor('Chopin');

export const FICHA_CHOPIN: FichaCompositor = {
  id: chopin.id,
  nome: 'Chopin',
  nomeCompleto: 'Frédéric Chopin',
  retrato: chopin.retrato,
  nasc: 1810,
  morte: 1849,
  nascimento: '1º de março de 1810, Żelazowa Wola',
  falecimento: '17 de outubro de 1849, Paris',
  pais: 'Polônia',
  epoca: 'Romântico',
  papel: 'pianista e compositor',
  instrumentos: 'Piano',
  bio: [
    'Frédéric Chopin foi um compositor e pianista polonês do período romântico, e quase tudo o que escreveu tem o piano no centro. Estudou no Conservatório de Varsóvia, deixou a Polônia aos vinte anos e nunca mais voltou: fez carreira em Paris, onde tocava mais em salões do que em grandes salas.',
    'Deu ao piano formas que pareciam pequenas — noturnos, mazurcas, prelúdios, estudos — e encheu-as de uma harmonia que só seria plenamente compreendida décadas depois.',
    'Morreu de tuberculose aos 39 anos. O coração foi levado para Varsóvia, como ele pediu.',
  ],
  resumo:
    'Pianista e compositor polonês do período Romântico (1810–1849). O Opus Atlas tem 179 obras dele, a maioria para piano.',
  video: {
    titulo: 'Chopin — a vida e a obra (documentário)',
    id: 'Pg84VVfu00I',
  },
  curiosidades: [
    'O coração está enterrado em Varsóvia; o corpo, em Paris.',
    'Quase toda a música dele foi escrita para piano solo.',
    'Viveu quase toda a vida adulta em Paris, sempre com saudade da Polônia.',
  ],
  obras: 179,
  porGenero: [
    { nome: 'Mazurcas', n: 58 },
    { nome: 'Estudos', n: 27 },
    { nome: 'Prelúdios', n: 26 },
    { nome: 'Noturnos', n: 21 },
    { nome: 'Valsas', n: 19 },
    { nome: 'Canções', n: 19 },
    { nome: 'Polonaises', n: 16 },
    { nome: 'Baladas', n: 4 },
  ],
  destaques: [
    {
      id: '686b45924206d8332943ebfd',
      titulo: 'Noturnos, Op. 9',
      detalhe: 'Noturno · 1830–31',
      partituras: 116,
    },
    {
      id: '686345f5204a67621b0bfbc5',
      titulo: 'Balada nº 1, Op. 23',
      detalhe: 'Balada · 1835',
      partituras: 64,
    },
    {
      id: '6879bb4668d244782048cff7',
      titulo: 'Estudos, Op. 10',
      detalhe: 'Estudo · 1829–32',
      partituras: 141,
    },
    {
      id: '6879539dab264c0093d7823a',
      titulo: 'Valsas, Op. 64',
      detalhe: 'Valsa · 1846–47',
      partituras: 88,
    },
    {
      id: '686d53c1e3de9a37f27c4886',
      titulo: 'Polonaise, Op. 53',
      detalhe: 'Polonaise · 1842',
      partituras: 52,
    },
    {
      id: '686c92b43d4f77ce841eb54d',
      titulo: 'Sonata nº 2, Op. 35',
      detalhe: 'Sonata · 1839',
      partituras: 47,
    },
  ],
  artigos: [
    {
      titulo: 'Chopin e os noturnos: o piano que canta',
      slug: 'chopin-e-os-noturnos',
      capa: original(
        'https://imslp.org/images/thumb/3/34/Chopin_Photo.jpg/180px-x.jpg'
      ),
    },
    {
      titulo: 'Tudo sobre Frédéric Chopin',
      slug: 'tudo-sobre-frederic-chopin',
      leitura: 22,
    },
    {
      titulo: 'Curiosidades de Frédéric Chopin',
      slug: 'curiosidades-de-frederic-chopin',
      leitura: 8,
    },
  ],
  verificado: true,
  wikipedia: 'https://pt.wikipedia.org/wiki/Fr%C3%A9d%C3%A9ric_Chopin',
  falta: [],
};

/** Pierre Baillot: o caso comum — retrato, datas e país; sem biografia, sem vídeo. */
export const FICHA_BAILLOT: FichaCompositor = {
  id: '685d91278803000f9b61d18e',
  nome: 'Baillot',
  nomeCompleto: 'Pierre Baillot',
  retrato: original(
    'https://imslp.org/images/thumb/9/91/Pierre_Baillot.jpg/180px-x.jpg'
  ),
  nasc: 1771,
  morte: 1842,
  nascimento: '1º de outubro de 1771',
  falecimento: '15 de setembro de 1842',
  pais: 'França',
  epoca: 'Clássico',
  papel: 'violinista e compositor',
  instrumentos: 'Violino, piano, quarteto de cordas',
  resumo:
    'Violinista e compositor francês do período Clássico (1771–1842). O Opus Atlas tem 39 obras dele, quase todas para violino: variações, concertos e estudos.',
  curiosidades: [],
  obras: 39,
  porGenero: [
    { nome: 'Variações', n: 10 },
    { nome: 'Concertos', n: 10 },
    { nome: 'Estudos', n: 5 },
    { nome: 'Métodos', n: 3 },
    { nome: 'Trios', n: 3 },
    { nome: 'Andantes', n: 3 },
  ],
  destaques: [
    {
      id: '6860314a0b6936a3c6cf4712',
      titulo: '12 Caprichos ou Estudos, Op. 2',
      detalhe: 'Violino',
    },
    {
      id: '686052cc0b6936a3c6cf4df9',
      titulo: '2 Árias variadas, Op. 5',
      detalhe: 'Variações · 1803',
    },
    {
      id: '6860534d0b6936a3c6cf4e11',
      titulo: '2 Andantes, Op. 26',
      detalhe: 'Violino e piano',
    },
    {
      id: '68609e8f0b6936a3c6cf5d2b',
      titulo: '24 Prelúdios em todos os tons',
      detalhe: 'Violino',
    },
    {
      id: '6860a0060b6936a3c6cf5d70',
      titulo: '24 Estudos para 2 violinos, Op. póst.',
      detalhe: 'Estudos',
    },
    {
      id: '6860a5190b6936a3c6cf5e77',
      titulo: '3 Árias russas variadas, Op. 20',
      detalhe: 'Quarteto de cordas',
    },
  ],
  artigos: [],
  wikipedia: 'https://en.wikipedia.org/wiki/Pierre_Baillot',
  falta: ['biografia', 'vídeo', 'curiosidades'],
};

export const FICHA_NOTURNO: FichaObra = {
  id: '686b45924206d8332943ebfd',
  titulo: 'Noturnos',
  catalogo: 'Op. 9',
  compositor: {
    nome: 'Chopin',
    nomeCompleto: 'Frédéric Chopin',
    retrato: chopin.retrato,
    anos: '1810–1849',
  },
  ano: '1830–31',
  publicacao: '1832–33',
  dedicatoria: 'Madame Camille Pleyel',
  instrumentacao: 'Piano',
  movimentos: [
    { titulo: 'Larghetto', detalhe: 'si bemol menor' },
    { titulo: 'Andante', detalhe: 'mi bemol maior' },
    { titulo: 'Allegretto', detalhe: 'si maior' },
  ],
  generos: ['Noturnos'],
  categorias: [
    'Para 1 instrumentista',
    'Arranjo para 2 instrumentistas',
    'Arranjo para piano a 4 mãos',
    'Arranjo para 1 instrumentista',
  ],
  nivel: 'Intermediário',
  midia: {
    audio: {
      titulo: 'Noturno nº 3 em si maior',
      interprete: 'Xuan He',
      fonte: 'Wikimedia Commons · domínio público',
      duracao: '6:55',
    },
    spotify: {
      faixa: 'Nocturne in E-flat major, Op. 9 No. 2',
      artista: 'Olga Bordas',
      capa: 'https://i.scdn.co/image/ab67616d0000b273500c3804415f3911be8ec409',
      duracao: '5:02',
    },
    youtube: { titulo: 'Chopin — Nocturne op. 9 nº 2', id: '9E6b3swbnWg' },
  },
  imslp: 'stored',
  partituras: PARTITURAS_NOTURNO,
  artigos: [
    {
      titulo: 'Chopin e os noturnos: o piano que canta',
      slug: 'chopin-e-os-noturnos',
      capa: original(
        'https://imslp.org/images/thumb/3/34/Chopin_Photo.jpg/180px-x.jpg'
      ),
    },
  ],
  anotacoes: 12,
  estudando: 214,
  aprenderam: 1380,
  falta: ['videoaula'],
};

/** A obra típica: sem ano, sem mídia, sem artigo, partituras ainda não lidas. */
export const FICHA_CAPRICHOS: FichaObra = {
  id: '6860314a0b6936a3c6cf4712',
  titulo: '12 Caprichos ou Estudos',
  catalogo: 'Op. 2',
  compositor: {
    nome: 'Baillot',
    nomeCompleto: 'Pierre Baillot',
    retrato: FICHA_BAILLOT.retrato,
    anos: '1771–1842',
  },
  instrumentacao: 'Violino, baixo contínuo; violino solo no Capricho nº 11',
  movimentosTexto: '12 caprichos',
  generos: ['Caprichos', 'Estudos'],
  categorias: ['Para 1 instrumentista'],
  midia: {},
  imslp: 'pending',
  partituras: {},
  artigos: [],
  anotacoes: 0,
  estudando: 0,
  aprenderam: 0,
  falta: ['ano de composição', 'gravação', 'videoaula', 'nível'],
};

export type QualFicha = 'completa' | 'tipica';
export const fichaCompositor = (q: QualFicha) =>
  q === 'completa' ? FICHA_CHOPIN : FICHA_BAILLOT;
export const fichaObra = (q: QualFicha) =>
  q === 'completa' ? FICHA_NOTURNO : FICHA_CAPRICHOS;

// ---------------------------------------------------------------------------
// Home: curiosidades, descobertas, últimas adições (dados reais)
// ---------------------------------------------------------------------------

/** 4 das 300 curiosidades de `utils.ts` (sorteadas a cada 6h). Sem emoji: o ícone vem do tipo. */
export const CURIOSIDADES = [
  {
    tipo: 'curiosidade',
    epoca: 'Barroco',
    titulo: 'Bach e seus filhos',
    texto:
      'Bach teve 20 filhos, e quatro deles — Wilhelm Friedemann, Carl Philipp Emanuel, Johann Christoph Friedrich e Johann Christian — viraram compositores conhecidos.',
  },
  {
    tipo: 'curiosidade',
    epoca: 'Clássico',
    titulo: 'Mozart precoce',
    texto:
      'Mozart começou a compor aos 5 anos e escreveu a primeira sinfonia aos 8.',
  },
  {
    tipo: 'curiosidade',
    epoca: 'Romântico',
    titulo: 'O ano das canções',
    texto:
      'Schumann dedicou 1840, o ano do casamento com Clara Wieck, às canções: foram 138 lieder.',
  },
  {
    tipo: 'inovação',
    epoca: 'Moderno',
    titulo: 'Atonalidade',
    texto:
      'Schoenberg abandonou o sistema tonal em 1908 e escreveu a primeira música inteiramente atonal.',
  },
];

/** O que a API devolve hoje como "aleatório" começa todo com A (Abbiate, Abel, Aadler…) — está ordenado, não sorteado. */
export const DESCOBERTAS = {
  compositores: [
    {
      nome: 'Louis Abbiate',
      detalhe: 'Romântico',
      retrato: original(
        'https://imslp.org/images/thumb/2/20/Louis_Abbiate.jpg/180px-x.jpg'
      ),
    },
    {
      nome: 'Ludwig Abel',
      detalhe: 'Romântico',
      retrato: original(
        'https://imslp.org/images/thumb/d/d2/Ludwig_abel.jpg/180px-x.jpg'
      ),
    },
    {
      nome: 'Henry Clay Work',
      detalhe: 'Romântico',
      retrato: original(
        'https://imslp.org/images/thumb/6/6d/Work%2C_Henry_Clay.jpg/180px-x.jpg'
      ),
    },
  ],
  obras: [
    {
      titulo: '2 Árias variadas, Op. 5',
      compositor: 'Pierre Baillot',
      detalhe: 'Violinos e violoncelo · 1803',
    },
    {
      titulo: 'Piano Trio em fá menor',
      compositor: 'Ludwig van Beethoven',
      detalhe: 'Trio',
    },
    {
      titulo: 'Concerto para oboé em fá maior, Hess 12',
      compositor: 'Ludwig van Beethoven',
      detalhe: 'Oboé e orquestra',
    },
  ],
};

/** As últimas adições, já filtradas: o banco traz "Demon slayer / Kimetsu no yaiba" como compositor. */
export const ADICOES = {
  compositores: [
    {
      nome: 'Erik Satie',
      detalhe: 'Moderno · ontem',
      retrato: original(
        'https://imslp.org/images/thumb/c/c2/Erik-satie-1.jpg/180px-x.jpg'
      ),
    },
    {
      nome: 'Pierre Baillot',
      detalhe: 'Clássico · 3 dias',
      retrato: FICHA_BAILLOT.retrato,
    },
  ],
  obras: [
    {
      titulo: 'Prelúdio Op. 28 nº 4',
      compositor: 'Frédéric Chopin',
      detalhe: 'Piano · enviada por Marina D.',
    },
    {
      titulo: 'Piano Trio em fá menor',
      compositor: 'Ludwig van Beethoven',
      detalhe: 'Violino, violoncelo e piano',
    },
    {
      titulo: 'Concerto para oboé, Hess 12',
      compositor: 'Ludwig van Beethoven',
      detalhe: 'Oboé',
    },
  ],
};
