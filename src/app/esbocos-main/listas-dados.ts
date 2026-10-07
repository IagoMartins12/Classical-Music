/**
 * As listagens dos esboços (`/composers`, `/works`), com a mistura real do
 * acervo: os famosos ao lado dos típicos — sem foto (29,5%), sem país (17,9%),
 * sem ano de obra (63%). Ids, nomes, datas e retratos são do banco local.
 */

import { FAMOSOS, original } from './dados';

export interface ItemCompositor {
  id: string;
  nome: string;
  nomeCompleto: string;
  nasc?: number;
  morte?: number;
  pais?: string;
  epoca: string;
  obras: number;
  retrato?: string | null;
  verificado?: boolean;
  /** Para o esboço saber que tela abrir. */
  ficha: 'completa' | 'tipica';
}

const im = (c: string) =>
  original(`https://imslp.org/images/thumb/${c}/180px-x.jpg`);

const NOMES_EPOCA: Record<string, string> = {
  barroco: 'Barroco',
  classico: 'Clássico',
  romantico: 'Romântico',
  moderno: 'Modernismo',
  contemporaneo: 'Contemporâneo',
};

export const LISTA_COMPOSITORES: ItemCompositor[] = [
  ...FAMOSOS.slice(0, 10).map((c) => ({
    id: c.id,
    nome: c.nome,
    nomeCompleto: c.nomeCompleto,
    nasc: c.nasc,
    morte: c.morte,
    pais: c.pais,
    epoca: NOMES_EPOCA[c.epoca],
    obras: c.obras ?? 0,
    retrato: c.retrato,
    verificado: c.verificado,
    ficha: (c.nome === 'Chopin' ? 'completa' : 'tipica') as
      | 'completa'
      | 'tipica',
  })),
  {
    id: '685e6976c6bd886c5b496acc',
    nome: 'Carlos Gomes',
    nomeCompleto: 'Carlos Gomes',
    nasc: 1836,
    morte: 1896,
    pais: 'Brasil',
    epoca: 'Romântico',
    obras: 75,
    retrato: original(
      'https://imslp.org/images/thumb/f/fe/Cgomes.png/180px-x.png'
    ),
    ficha: 'tipica',
  },
  {
    id: '685e69d1c6bd886c5b496adb',
    nome: 'Chiquinha Gonzaga',
    nomeCompleto: 'Chiquinha Gonzaga',
    nasc: 1847,
    morte: 1935,
    pais: 'Brasil',
    epoca: 'Romântico',
    obras: 68,
    retrato: im('f/f3/Chiquinha_Gonzaga-1877.jpg'),
    ficha: 'tipica',
  },
  // Villa-Lobos está como "American" no banco: aqui com o país certo.
  {
    id: '685f89c1c6bd886c5b4995bc',
    nome: 'Villa-Lobos',
    nomeCompleto: 'Heitor Villa-Lobos',
    nasc: 1887,
    morte: 1959,
    pais: 'Brasil',
    epoca: 'Modernismo',
    obras: 122,
    retrato: 'https://imslp.org/images/0/01/Villa-lobos.jpg',
    ficha: 'tipica',
  },
  {
    id: '685e5d34c6bd886c5b4968b9',
    nome: 'José Maurício',
    nomeCompleto: 'José Maurício Nunes Garcia',
    nasc: 1767,
    morte: 1830,
    pais: 'Brasil',
    epoca: 'Clássico',
    obras: 70,
    retrato: im('7/72/Jos%C3%A9_Mauricio_Nunes_Garcia.jpg'),
    ficha: 'tipica',
  },
  {
    id: '685d91278803000f9b61d18e',
    nome: 'Baillot',
    nomeCompleto: 'Pierre Baillot',
    nasc: 1771,
    morte: 1842,
    pais: 'França',
    epoca: 'Clássico',
    obras: 39,
    retrato: im('9/91/Pierre_Baillot.jpg'),
    ficha: 'tipica',
  },
  {
    id: '685e1283c6bd886c5b495db7',
    nome: 'Cirri',
    nomeCompleto: 'Giovanni Battista Cirri',
    nasc: 1724,
    morte: 1808,
    pais: 'Itália',
    epoca: 'Barroco',
    obras: 14,
    retrato: im('1/1c/Cirri.jpg'),
    ficha: 'tipica',
  },
  // Sem foto: o retrato salvo é o "sem foto" do IMSLP — vira inicial.
  {
    id: '685d97a18803000f9b61d2a7',
    nome: 'Bassani',
    nomeCompleto: 'Giovanni Battista Bassani',
    morte: 1716,
    pais: 'Itália',
    epoca: 'Barroco',
    obras: 31,
    retrato: null,
    ficha: 'tipica',
  },
  {
    id: '685d8c918803000f9b61d0c8',
    nome: 'Asola',
    nomeCompleto: 'Giammateo Asola',
    morte: 1609,
    pais: 'Itália',
    epoca: 'Renascentista',
    obras: 30,
    retrato: null,
    ficha: 'tipica',
  },
  // Sem país e sem morte: 17,9% não têm nacionalidade.
  {
    id: '685d7dcc8803000f9b61ce21',
    nome: 'Abel',
    nomeCompleto: 'Ludwig Abel',
    nasc: 1834,
    epoca: 'Romântico',
    obras: 5,
    retrato: im('d/d2/Ludwig_abel.jpg'),
    ficha: 'tipica',
  },
  {
    id: '685d7d9e8803000f9b61ce19',
    nome: 'Abbiate',
    nomeCompleto: 'Louis Abbiate',
    nasc: 1866,
    morte: 1933,
    pais: 'França',
    epoca: 'Romântico',
    obras: 6,
    retrato: im('2/20/Louis_Abbiate.jpg'),
    ficha: 'tipica',
  },
  {
    id: '685ef95cc6bd886c5b498077',
    nome: 'Diniz Nazareth',
    nomeCompleto: 'Diniz Nazareth',
    pais: 'Brasil',
    epoca: 'Romântico',
    obras: 0,
    retrato: null,
    ficha: 'tipica',
  },
];

export const PAISES_FILTRO = [
  'Alemanha',
  'França',
  'Itália',
  'Áustria',
  'Brasil',
  'Polônia',
  'Rússia',
  'Inglaterra',
  'Estados Unidos',
];

export interface ItemObra {
  id: string;
  titulo: string;
  catalogo?: string;
  compositor: string;
  instrumentacao: string;
  ano?: string;
  genero: string;
  epoca: string;
  /** Quantas partituras guardadas; ausente = ainda não lidas do IMSLP (89%). */
  partituras?: number;
  midia?: ('spotify' | 'youtube' | 'audio')[];
  ficha: 'completa' | 'tipica';
}

export const LISTA_OBRAS: ItemObra[] = [
  {
    id: '686b45924206d8332943ebfd',
    titulo: 'Noturnos',
    catalogo: 'Op. 9',
    compositor: 'Chopin',
    instrumentacao: 'Piano',
    ano: '1830–31',
    genero: 'Noturnos',
    epoca: 'Romântico',
    partituras: 116,
    midia: ['audio', 'spotify', 'youtube'],
    ficha: 'completa',
  },
  {
    id: '6860314a0b6936a3c6cf4712',
    titulo: '12 Caprichos ou Estudos',
    catalogo: 'Op. 2',
    compositor: 'Baillot',
    instrumentacao: 'Violino',
    genero: 'Caprichos',
    epoca: 'Clássico',
    ficha: 'tipica',
  },
  {
    id: '686345f5204a67621b0bfbc5',
    titulo: 'Balada nº 1',
    catalogo: 'Op. 23',
    compositor: 'Chopin',
    instrumentacao: 'Piano',
    ano: '1835',
    genero: 'Baladas',
    epoca: 'Romântico',
    partituras: 64,
    midia: ['spotify'],
    ficha: 'completa',
  },
  {
    id: '6aa2b1b737f7cca71f1c7384',
    titulo: 'Trio para piano em fá menor',
    compositor: 'Beethoven',
    instrumentacao: 'Violino, violoncelo e piano',
    genero: 'Trios',
    epoca: 'Clássico',
    ficha: 'tipica',
  },
  {
    id: '686052cc0b6936a3c6cf4df9',
    titulo: '2 Árias variadas',
    catalogo: 'Op. 5',
    compositor: 'Baillot',
    instrumentacao: 'Violinos e violoncelo',
    ano: '1803',
    genero: 'Variações',
    epoca: 'Clássico',
    partituras: 2,
    ficha: 'tipica',
  },
  {
    id: '6879bb4668d244782048cff7',
    titulo: 'Estudos',
    catalogo: 'Op. 10',
    compositor: 'Chopin',
    instrumentacao: 'Piano',
    ano: '1829–32',
    genero: 'Estudos',
    epoca: 'Romântico',
    partituras: 141,
    midia: ['spotify', 'youtube'],
    ficha: 'completa',
  },
  {
    id: '6aa2b1b637f7cca71f1c7383',
    titulo: 'Concerto para oboé em fá maior',
    catalogo: 'Hess 12',
    compositor: 'Beethoven',
    instrumentacao: 'Oboé e orquestra',
    genero: 'Concertos',
    epoca: 'Clássico',
    ficha: 'tipica',
  },
  {
    id: '68609e8f0b6936a3c6cf5d2b',
    titulo: '24 Prelúdios em todos os tons',
    compositor: 'Baillot',
    instrumentacao: 'Violino',
    genero: 'Prelúdios',
    epoca: 'Clássico',
    ficha: 'tipica',
  },
  {
    id: '6879539dab264c0093d7823a',
    titulo: 'Valsas',
    catalogo: 'Op. 64',
    compositor: 'Chopin',
    instrumentacao: 'Piano',
    ano: '1846–47',
    genero: 'Valsas',
    epoca: 'Romântico',
    partituras: 88,
    midia: ['spotify'],
    ficha: 'completa',
  },
  {
    id: '6860a5190b6936a3c6cf5e77',
    titulo: '3 Árias russas variadas',
    catalogo: 'Op. 20',
    compositor: 'Baillot',
    instrumentacao: 'Quarteto de cordas',
    genero: 'Variações',
    epoca: 'Clássico',
    ficha: 'tipica',
  },
];

export const FILTROS_OBRAS = {
  instrumentos: [
    { nome: 'Piano', n: 108822 },
    { nome: 'Violino', n: 26351 },
    { nome: 'Orquestra', n: 13362 },
    { nome: 'Órgão', n: 5918 },
    { nome: 'Coro', n: 5454 },
    { nome: 'Harpa', n: 2782 },
    { nome: 'Violão', n: 2091 },
    { nome: 'Violoncelo', n: 1141 },
  ],
  epocas: [
    { nome: 'Medieval', n: 305 },
    { nome: 'Renascentista', n: 15130 },
    { nome: 'Barroco', n: 25534 },
    { nome: 'Clássico', n: 22315 },
    { nome: 'Romântico', n: 86827 },
    { nome: 'Modernismo', n: 25022 },
    { nome: 'Contemporâneo', n: 32758 },
  ],
  generos: [
    'Sonatas',
    'Noturnos',
    'Estudos',
    'Variações',
    'Concertos',
    'Valsas',
    'Fugas',
    'Missas',
    'Canções',
    'Prelúdios',
  ],
  categorias: [
    'Para 1 instrumentista',
    'Para 2 instrumentistas',
    'Para 3 instrumentistas',
    'Para orquestra',
    'Para coro',
    'Arranjo para piano a 4 mãos',
  ],
};

export const TOTAIS = { compositores: 19176, obras: 207891 };
