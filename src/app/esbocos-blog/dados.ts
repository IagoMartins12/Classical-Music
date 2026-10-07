/**
 * Dados de exemplo dos três esboços do blog.
 *
 * Os artigos são inventados para o esboço, mas o que cada um afirma é
 * verdadeiro (datas, obras, quadros). As capas são pinturas em domínio
 * público do Wikimedia Commons, guardadas em `public/esbocos-blog/` — saem
 * junto com esta pasta quando o esboço escolhido virar o blog.
 *
 * Dois artigos existem só para mostrar a capa de reserva: um sem capa
 * (`capa: null`) e um cuja capa aponta para um arquivo que não existe.
 *
 * A agenda é de exemplo: as casas são as do calendário real, os programas não.
 */

export type EsbocoId = 'a' | 'b' | 'c';
export type Vista = 'inicio' | 'artigo' | 'lista' | 'agenda';

export const ESBOCOS: EsbocoId[] = ['a', 'b', 'c'];
export const VISTAS: { id: Vista; rotulo: string }[] = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'artigo', rotulo: 'Artigo' },
  { id: 'lista', rotulo: 'Lista' },
  { id: 'agenda', rotulo: 'Agenda' },
];

/** O endereço de uma vista dentro de um esboço. */
export function rota(
  esboco: EsbocoId,
  vista: Vista = 'inicio',
  categoria?: string
) {
  const base = `/esbocos-blog/${esboco}`;
  if (vista === 'inicio') return base;
  if (vista === 'lista' && categoria)
    return `${base}/lista?categoria=${categoria}`;
  return `${base}/${vista}`;
}

export interface Categoria {
  slug: string;
  nome: string;
  descricao: string;
}

export const CATEGORIAS: Categoria[] = [
  {
    slug: 'historia',
    nome: 'História',
    descricao: 'Os episódios, os lugares e as pessoas por trás da música.',
  },
  {
    slug: 'compositores',
    nome: 'Compositores',
    descricao: 'Vida e obra de quem escreveu o repertório.',
  },
  {
    slug: 'instrumentos',
    nome: 'Instrumentos',
    descricao: 'Como são feitos, como soam e onde aparecem.',
  },
  {
    slug: 'escuta',
    nome: 'Guia de escuta',
    descricao: 'Roteiros para ouvir com mais atenção.',
  },
  {
    slug: 'analise',
    nome: 'Análise',
    descricao: 'Uma obra de cada vez, por dentro.',
  },
];

export interface Autor {
  id: string;
  nome: string;
  iniciais: string;
  papel: string;
  bio: string;
}

const AUTORES: Record<string, Autor> = {
  helena: {
    id: 'helena-prado',
    nome: 'Helena Prado',
    iniciais: 'HP',
    papel: 'Editora do blog',
    bio: 'Cravista e pesquisadora de música barroca. Escreve sobre contraponto, fontes e edições.',
  },
  caio: {
    id: 'caio-andrade',
    nome: 'Caio Andrade',
    iniciais: 'CA',
    papel: 'Colaborador',
    bio: 'Pianista e professor. Escreve guias de escuta e análises do repertório romântico.',
  },
  marina: {
    id: 'marina-lacerda',
    nome: 'Marina Lacerda',
    iniciais: 'ML',
    papel: 'Colaboradora',
    bio: 'Historiadora da arte. Escreve sobre a música nos quadros e os instrumentos de época.',
  },
};

export interface Artigo {
  slug: string;
  titulo: string;
  resumo: string;
  categoria: string;
  tags: string[];
  autor: Autor;
  /** Data de publicação, ISO. */
  data: string;
  minutos: number;
  capa: string | null;
  /** Descrição da capa, usada quando ela é conteúdo (no topo do artigo). */
  alt: string;
  credito: string;
  /** `object-position` da capa: onde está o assunto quando ela é cortada. */
  foco?: string;
  leituras: number;
  comentarios: number;
}

const img = (nome: string) => `/esbocos-blog/${nome}.jpg`;

export const ARTIGOS: Artigo[] = [
  {
    slug: 'oferenda-musical',
    titulo: 'O dia em que Frederico II desafiou Bach',
    resumo:
      'Em maio de 1747, um rei flautista entregou a Bach um tema quase impossível. A resposta levou dois meses e virou a Oferenda Musical.',
    categoria: 'historia',
    tags: ['Bach', 'Barroco', 'Contraponto'],
    autor: AUTORES.helena,
    data: '2026-09-28',
    minutos: 9,
    capa: img('menzel'),
    alt: 'Frederico II toca flauta num salão iluminado por velas, acompanhado pelos músicos da corte',
    credito:
      'Adolph Menzel, Concerto de flauta de Frederico, o Grande, em Sanssouci (1852). Alte Nationalgalerie, Berlim.',
    foco: '50% 45%',
    leituras: 4812,
    comentarios: 14,
  },
  {
    slug: 'fosso-de-degas',
    titulo: 'O fosso da orquestra visto por Degas',
    resumo:
      'Por volta de 1870, Degas pintou a Ópera de Paris a partir da plateia e pôs um fagotista no centro do quadro.',
    categoria: 'historia',
    tags: ['Ópera', 'Orquestra', 'Paris'],
    autor: AUTORES.marina,
    data: '2026-09-24',
    minutos: 6,
    capa: img('degas'),
    alt: 'Músicos de uma orquestra de ópera vistos de perto, com um fagotista ao centro e bailarinas ao fundo',
    credito:
      'Edgar Degas, A orquestra da Ópera (c. 1870). Musée d’Orsay, Paris.',
    foco: '50% 62%',
    leituras: 2140,
    comentarios: 5,
  },
  {
    slug: 'ouvir-uma-fuga',
    titulo: 'Como ouvir uma fuga sem se perder',
    resumo:
      'Sujeito, resposta, contrassujeito: um roteiro em quatro escutas para acompanhar as vozes de uma fuga de Bach.',
    categoria: 'escuta',
    tags: ['Bach', 'Fuga', 'Contraponto'],
    autor: AUTORES.helena,
    data: '2026-09-19',
    minutos: 11,
    capa: img('bach'),
    alt: 'Retrato de Johann Sebastian Bach segurando uma folha com um cânone',
    credito: 'Elias Gottlob Haussmann, retrato de Johann Sebastian Bach.',
    foco: '50% 22%',
    leituras: 6930,
    comentarios: 22,
  },
  {
    slug: 'beethoven-de-stieler',
    titulo: 'O Beethoven de Stieler e a partitura que ele segura',
    resumo:
      'No retrato de 1820, o compositor escreve a Missa Solemnis. É a imagem que fixou o rosto de Beethoven.',
    categoria: 'compositores',
    tags: ['Beethoven', 'Classicismo'],
    autor: AUTORES.marina,
    data: '2026-09-15',
    minutos: 7,
    capa: img('beethoven'),
    alt: 'Retrato de Beethoven de casaco escuro e lenço vermelho, escrevendo numa partitura',
    credito:
      'Joseph Karl Stieler, Beethoven com o manuscrito da Missa Solemnis (1820).',
    foco: '50% 24%',
    leituras: 5375,
    comentarios: 9,
  },
  {
    slug: 'polonaise-heroica',
    titulo: 'A Polonaise Heroica, do manuscrito ao palco',
    resumo:
      'Escrita em 1842, a Polonaise op. 53 pede da mão esquerda uma sequência de oitavas que virou teste de resistência para pianistas.',
    categoria: 'analise',
    tags: ['Chopin', 'Piano', 'Romantismo'],
    autor: AUTORES.caio,
    data: '2026-09-10',
    minutos: 8,
    capa: img('polonaise'),
    alt: 'Página manuscrita da Polonaise op. 53 de Chopin',
    credito: 'Frédéric Chopin, manuscrito da Polonaise op. 53.',
    leituras: 3088,
    comentarios: 7,
  },
  {
    slug: 'chopin-por-delacroix',
    titulo: 'O retrato de Chopin que foi cortado ao meio',
    resumo:
      'Delacroix pintou Chopin e George Sand na mesma tela em 1838. Décadas depois, o quadro foi dividido em dois.',
    categoria: 'compositores',
    tags: ['Chopin', 'Romantismo'],
    autor: AUTORES.marina,
    data: '2026-09-04',
    minutos: 5,
    capa: img('chopin'),
    alt: 'Retrato inacabado de Chopin, de perfil, em tons escuros',
    credito:
      'Eugène Delacroix, Frédéric Chopin (1838). Museu do Louvre, Paris.',
    foco: '50% 28%',
    leituras: 2766,
    comentarios: 4,
  },
  {
    slug: 'familia-mozart',
    titulo: 'A família Mozart em volta do teclado',
    resumo:
      'Pintado por volta de 1780, o retrato reúne Wolfgang, Nannerl e Leopold, com a mãe presente num quadro na parede.',
    categoria: 'compositores',
    tags: ['Mozart', 'Classicismo'],
    autor: AUTORES.caio,
    data: '2026-08-27',
    minutos: 6,
    capa: img('mozart'),
    alt: 'Wolfgang e Nannerl Mozart ao teclado, com Leopold ao lado segurando um violino',
    credito:
      'Atribuído a Johann Nepomuk della Croce, A família Mozart (c. 1780).',
    foco: '50% 35%',
    leituras: 1904,
    comentarios: 3,
  },
  {
    slug: 'musicos-de-caravaggio',
    titulo: 'O que tocam os músicos de Caravaggio',
    resumo:
      'Alaúde, violino e corneto: os instrumentos de um quadro de 1597 e o som que eles faziam.',
    categoria: 'instrumentos',
    tags: ['Alaúde', 'Renascença'],
    autor: AUTORES.marina,
    data: '2026-08-21',
    minutos: 7,
    capa: img('caravaggio'),
    alt: 'Quatro jovens músicos; um deles afina um alaúde',
    credito:
      'Caravaggio, Os músicos (1597). The Metropolitan Museum of Art, Nova York.',
    foco: '50% 35%',
    leituras: 1522,
    comentarios: 2,
  },
  {
    slug: 'piano-na-sala',
    titulo: 'Quando o piano entrou na sala de estar',
    resumo:
      'O quadro de Renoir de 1892 registra um hábito do século XIX: o piano como móvel da casa e parte da educação.',
    categoria: 'instrumentos',
    tags: ['Piano', 'Século XIX'],
    autor: AUTORES.caio,
    data: '2026-08-14',
    minutos: 8,
    capa: img('renoir'),
    alt: 'Duas meninas leem uma partitura diante de um piano vertical',
    credito: 'Pierre-Auguste Renoir, Duas meninas ao piano (1892).',
    foco: '50% 30%',
    leituras: 2391,
    comentarios: 6,
  },
  {
    slug: 'virginal-de-vermeer',
    titulo: 'O virginal de Vermeer',
    resumo:
      'Na Lição de Música, o instrumento traz uma inscrição em latim: a música é companheira da alegria e remédio da dor.',
    categoria: 'instrumentos',
    tags: ['Virginal', 'Barroco'],
    autor: AUTORES.marina,
    data: '2026-08-06',
    minutos: 5,
    capa: img('vermeer'),
    alt: 'Uma mulher de costas toca um virginal, observada por um homem, numa sala com piso xadrez',
    credito:
      'Johannes Vermeer, A lição de música (c. 1662-1665). Royal Collection.',
    foco: '50% 40%',
    leituras: 1730,
    comentarios: 1,
  },
  {
    slug: 'glossario-de-andamentos',
    titulo: 'Do largo ao presto: um glossário de andamentos',
    resumo:
      'O que cada indicação italiana pede ao intérprete, com exemplos para ouvir.',
    categoria: 'escuta',
    tags: ['Teoria', 'Glossário'],
    autor: AUTORES.caio,
    data: '2026-07-30',
    minutos: 10,
    capa: null,
    alt: '',
    credito: '',
    leituras: 3940,
    comentarios: 11,
  },
  {
    slug: 'comecar-por-villa-lobos',
    titulo: 'Por onde começar em Villa-Lobos',
    resumo:
      'Cinco obras para entrar no catálogo do compositor brasileiro, das Bachianas aos Choros.',
    categoria: 'compositores',
    tags: ['Villa-Lobos', 'Brasil'],
    autor: AUTORES.helena,
    data: '2026-07-22',
    minutos: 9,
    // De propósito: arquivo que não existe, para mostrar a reserva por erro.
    capa: img('capa-que-nao-existe'),
    alt: '',
    credito: '',
    leituras: 4105,
    comentarios: 8,
  },
  {
    slug: 'festa-em-roma',
    titulo: 'Uma festa musical em Roma, 1747',
    resumo:
      'Panini pintou o Teatro Argentina tomado por músicos e convidados na festa pelo casamento do delfim da França.',
    categoria: 'historia',
    tags: ['Barroco', 'Roma'],
    autor: AUTORES.marina,
    data: '2026-07-16',
    minutos: 6,
    capa: img('panini'),
    alt: 'Interior de um teatro lotado, com orquestra e cantores num palco decorado',
    credito:
      'Giovanni Paolo Panini, Festa musical (1747). Museu do Louvre, Paris.',
    leituras: 980,
    comentarios: 0,
  },
  {
    slug: 'concerto-de-leyster',
    titulo: 'O concerto de Judith Leyster',
    resumo:
      'Três músicos, uma pintora holandesa do século XVII e a música que se fazia em casa.',
    categoria: 'historia',
    tags: ['Barroco', 'Holanda'],
    autor: AUTORES.marina,
    data: '2026-07-09',
    minutos: 4,
    capa: img('leyster'),
    alt: 'Uma cantora entre um violinista e um alaudista',
    credito: 'Judith Leyster, O concerto (c. 1633).',
    foco: '50% 30%',
    leituras: 1211,
    comentarios: 2,
  },
];

export const categoriaDe = (slug: string) =>
  CATEGORIAS.find((c) => c.slug === slug) ?? CATEGORIAS[0];

export const artigosDe = (categoria?: string) =>
  categoria ? ARTIGOS.filter((a) => a.categoria === categoria) : ARTIGOS;

export const MAIS_LIDOS = [...ARTIGOS]
  .sort((a, b) => b.leituras - a.leituras)
  .slice(0, 5);

const MESES = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

const MESES_POR_EXTENSO = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const partes = (iso: string) => {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number);
  return { ano, mes, dia };
};

/** "28 set 2026". Montada à mão: igual no servidor e no navegador. */
export function dataCurta(iso: string) {
  const { ano, mes, dia } = partes(iso);
  return `${dia} ${MESES[mes - 1]} ${ano}`;
}

export function diaDoMes(iso: string) {
  return String(partes(iso).dia).padStart(2, '0');
}

export function mesCurto(iso: string) {
  return MESES[partes(iso).mes - 1];
}

/** "Setembro de 2026": o título de cada grupo do índice. */
export function mesPorExtenso(iso: string) {
  const { ano, mes } = partes(iso);
  return `${MESES_POR_EXTENSO[mes - 1]} de ${ano}`;
}

export const milhar = (n: number) => n.toLocaleString('pt-BR');

/** Os artigos agrupados por mês, na ordem em que vêm. */
export function porMes(artigos: Artigo[]) {
  const grupos: { mes: string; artigos: Artigo[] }[] = [];
  for (const artigo of artigos) {
    const mes = mesPorExtenso(artigo.data);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.mes === mes) ultimo.artigos.push(artigo);
    else grupos.push({ mes, artigos: [artigo] });
  }
  return grupos;
}

// ---------------------------------------------------------------------------
// Agenda de concertos (exemplo): outubro de 2026. As casas são as do
// calendário real; os programas e os horários são inventados.
// ---------------------------------------------------------------------------

export const TIPOS = [
  'Concerto',
  'Ópera',
  'Recital',
  'Câmara',
  'Coral',
] as const;
export type Tipo = (typeof TIPOS)[number];

export interface Concerto {
  id: string;
  data: string;
  /** Dia da semana, abreviado: "sex". */
  semana: string;
  hora: string;
  programa: string;
  tipo: Tipo;
  casa: string;
  cidade: string;
  uf: string;
  gratuito: boolean;
  /** Quem está no programa: liga o evento à enciclopédia. */
  compositores: string[];
  descricao: string;
  /** Imagem do evento, quando a casa publica uma. */
  imagem?: string;
  foco?: string;
}

const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const SEMANA_POR_EXTENSO = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

/** O dia da semana de uma data ISO, de 0 (domingo) a 6. */
export const diaDaSemana = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).getUTCDay();

export const semanaPorExtenso = (iso: string) =>
  SEMANA_POR_EXTENSO[diaDaSemana(iso)];

const CASAS = {
  salaSp: { casa: 'Sala São Paulo', cidade: 'São Paulo', uf: 'SP' },
  municipalSp: { casa: 'Theatro Municipal', cidade: 'São Paulo', uf: 'SP' },
  municipalRj: {
    casa: 'Theatro Municipal',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
  cecilia: {
    casa: 'Sala Cecília Meireles',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
  cidadeDasArtes: {
    casa: 'Cidade das Artes',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
  },
  paz: { casa: 'Theatro da Paz', cidade: 'Belém', uf: 'PA' },
};

function concerto(
  id: string,
  dia: number,
  hora: string,
  programa: string,
  tipo: Tipo,
  local: (typeof CASAS)[keyof typeof CASAS],
  compositores: string[],
  descricao: string,
  extra: Partial<Pick<Concerto, 'gratuito' | 'imagem' | 'foco'>> = {}
): Concerto {
  const data = `2026-10-${String(dia).padStart(2, '0')}`;
  return {
    id,
    data,
    semana: SEMANA[diaDaSemana(data)],
    hora,
    programa,
    tipo,
    ...local,
    gratuito: false,
    compositores,
    descricao,
    ...extra,
  };
}

export const MES_DA_AGENDA = {
  nome: 'Outubro de 2026',
  iso: '2026-10',
  dias: 31,
};

export const AGENDA: Concerto[] = [
  concerto(
    'osesp-mahler',
    2,
    '20h30',
    'Osesp: Mahler, Sinfonia n.º 5',
    'Concerto',
    CASAS.salaSp,
    ['Gustav Mahler'],
    'A sinfonia do Adagietto, em cinco movimentos, com a orquestra completa.'
  ),
  concerto(
    'traviata',
    3,
    '20h',
    'Verdi, La Traviata',
    'Ópera',
    CASAS.municipalRj,
    ['Giuseppe Verdi'],
    'Ópera em três atos, cantada em italiano com legendas em português.',
    { imagem: img('degas'), foco: '50% 62%' }
  ),
  concerto(
    'recital-chopin',
    4,
    '11h',
    'Recital de piano: Chopin e Villa-Lobos',
    'Recital',
    CASAS.cecilia,
    ['Frédéric Chopin', 'Heitor Villa-Lobos'],
    'Noturnos e baladas de Chopin ao lado das Cirandas de Villa-Lobos.',
    { gratuito: true }
  ),
  concerto(
    'beethoven-7',
    8,
    '20h',
    'Beethoven, Sinfonia n.º 7',
    'Concerto',
    CASAS.paz,
    ['Ludwig van Beethoven'],
    'A Sétima, precedida pela abertura Egmont.'
  ),
  concerto(
    'flauta-magica',
    10,
    '17h',
    'Mozart, A Flauta Mágica',
    'Ópera',
    CASAS.municipalSp,
    ['Wolfgang Amadeus Mozart'],
    'O singspiel de Mozart, em dois atos, numa montagem para toda a família.',
    { imagem: img('panini') }
  ),
  concerto(
    'quarteto-haydn',
    10,
    '20h',
    'Quarteto de cordas: Haydn e Shostakovich',
    'Câmara',
    CASAS.cecilia,
    ['Joseph Haydn', 'Dmitri Shostakovich'],
    'Dois quartetos separados por um século e meio, no mesmo programa.'
  ),
  concerto(
    'matinal-mozart',
    11,
    '11h',
    'Concerto matinal: Mozart, Sinfonia n.º 40',
    'Concerto',
    CASAS.salaSp,
    ['Wolfgang Amadeus Mozart'],
    'Concerto de domingo de manhã, com entrada gratuita e duração de uma hora.',
    { gratuito: true }
  ),
  concerto(
    'requiem-alemao',
    15,
    '20h30',
    'Osesp: Brahms, Um Réquiem Alemão',
    'Coral',
    CASAS.salaSp,
    ['Johannes Brahms'],
    'Para solistas, coro e orquestra, em sete movimentos.'
  ),
  concerto(
    'patetica',
    17,
    '20h',
    'Tchaikovsky, Sinfonia n.º 6',
    'Concerto',
    CASAS.cidadeDasArtes,
    ['Piotr Ilitch Tchaikovsky'],
    'A última sinfonia de Tchaikovsky, a Patética.'
  ),
  concerto(
    'missa-si-menor',
    18,
    '17h',
    'Bach, Missa em Si menor',
    'Coral',
    CASAS.municipalSp,
    ['Johann Sebastian Bach'],
    'A missa completa, com coro, solistas e orquestra de instrumentos de época.',
    { imagem: img('menzel'), foco: '50% 45%' }
  ),
  concerto(
    'suites-de-bach',
    23,
    '20h',
    'Recital de violoncelo: Suítes de Bach',
    'Recital',
    CASAS.paz,
    ['Johann Sebastian Bach'],
    'As suítes n.º 1, 3 e 5 para violoncelo solo.',
    { gratuito: true }
  ),
  concerto(
    'boheme',
    24,
    '20h',
    'Puccini, La Bohème',
    'Ópera',
    CASAS.municipalRj,
    ['Giacomo Puccini'],
    'Ópera em quatro quadros, cantada em italiano com legendas em português.'
  ),
  concerto(
    'bachianas',
    29,
    '20h30',
    'Osesp: Villa-Lobos, Bachianas Brasileiras n.º 4 e 7',
    'Concerto',
    CASAS.salaSp,
    ['Heitor Villa-Lobos'],
    'Duas das nove Bachianas, na versão para orquestra.'
  ),
  concerto(
    'sagracao',
    31,
    '20h',
    'Stravinsky, A Sagração da Primavera',
    'Concerto',
    CASAS.cidadeDasArtes,
    ['Igor Stravinsky'],
    'O balé de 1913 em versão de concerto.'
  ),
];

export const CIDADES = [...new Set(AGENDA.map((c) => c.cidade))];

/** Os eventos agrupados por dia, na ordem da agenda. */
export function porDia(eventos: Concerto[]) {
  const dias: { data: string; eventos: Concerto[] }[] = [];
  for (const evento of eventos) {
    const ultimo = dias[dias.length - 1];
    if (ultimo?.data === evento.data) ultimo.eventos.push(evento);
    else dias.push({ data: evento.data, eventos: [evento] });
  }
  return dias;
}

// ---------------------------------------------------------------------------
// O artigo aberto na vista "Artigo": o corpo em blocos, como o servidor vai
// renderizar o JSON do TipTap.
// ---------------------------------------------------------------------------

export type Bloco =
  | { tipo: 'p'; texto: string }
  | { tipo: 'h2'; id: string; texto: string }
  | { tipo: 'lista'; itens: string[] }
  | { tipo: 'citacao'; texto: string; fonte: string }
  | {
      tipo: 'figura';
      src: string;
      alt: string;
      legenda: string;
      foco?: string;
    };

export const ARTIGO_ABERTO = ARTIGOS[0];

export const CORPO: Bloco[] = [
  {
    tipo: 'p',
    texto:
      'Na noite de 7 de maio de 1747, Johann Sebastian Bach chegou a Potsdam depois de dias de viagem. Tinha 62 anos e ia visitar o filho Carl Philipp Emanuel, cravista da corte. Frederico II da Prússia, que tocava flauta todas as noites com seus músicos, interrompeu o concerto ao saber da chegada e mandou chamá-lo.',
  },
  {
    tipo: 'h2',
    id: 'um-tema-dificil',
    texto: 'Um tema feito para não dar certo',
  },
  {
    tipo: 'p',
    texto:
      'O rei levou Bach pelos salões do palácio para experimentar os pianofortes de Gottfried Silbermann, uma novidade que a corte colecionava. Diante de um deles, tocou um tema longo, cheio de semitons, e pediu uma fuga. É difícil imaginar melodia menos dócil: ela sobe por um acorde de dó menor, salta para baixo e desce meio tom por vez, sem deixar claro onde repousa.',
  },
  {
    tipo: 'p',
    texto:
      'Bach improvisou ali mesmo uma fuga a três vozes. Frederico quis mais e pediu seis. Bach respondeu que nem todo tema serve para tantas vozes, improvisou a seis sobre uma melodia sua e prometeu levar o tema do rei para casa.',
  },
  { tipo: 'h2', id: 'dois-meses-em-leipzig', texto: 'Dois meses em Leipzig' },
  {
    tipo: 'p',
    texto:
      'De volta a Leipzig, ele trabalhou o tema em todas as formas que conhecia. Em julho, a obra estava gravada em cobre e dedicada ao rei com o título de Oferenda Musical. A sonata em trio, com flauta, é uma homenagem evidente ao instrumento de Frederico.',
  },
  {
    tipo: 'lista',
    itens: [
      'Ricercar a 3: a fuga improvisada em Potsdam, agora por escrito.',
      'Ricercar a 6: a resposta ao pedido que ficou sem atender naquela noite.',
      'Dez cânones, alguns apresentados como enigmas a resolver.',
      'Sonata em trio para flauta, violino e baixo contínuo.',
    ],
  },
  {
    tipo: 'citacao',
    texto: 'Regis Iussu Cantio Et Reliqua Canonica Arte Resoluta',
    fonte: 'Inscrição de Bach no exemplar enviado ao rei',
  },
  {
    tipo: 'p',
    texto:
      'A frase diz, em tradução livre, que o tema foi dado por ordem do rei e o restante resolvido pela arte do cânone. Lidas em sequência, as iniciais formam RICERCAR, nome antigo da fuga e o título que Bach deu às duas peças principais.',
  },
  {
    tipo: 'figura',
    src: img('bach'),
    alt: 'Retrato de Johann Sebastian Bach segurando uma folha com um cânone',
    legenda:
      'Bach no retrato de Elias Gottlob Haussmann. Na mão, um cânone a seis vozes.',
    foco: '50% 20%',
  },
  { tipo: 'h2', id: 'o-canone-que-sobe', texto: 'O cânone que sobe sem parar' },
  {
    tipo: 'p',
    texto:
      'Um dos cânones modula um tom acima a cada volta. Ao fim de seis repetições, a música está de novo em dó menor, uma oitava acima de onde começou. Na margem, Bach anotou o desejo de que a glória do rei subisse como a modulação.',
  },
  { tipo: 'h2', id: 'como-ouvir-hoje', texto: 'Como ouvir hoje' },
  {
    tipo: 'p',
    texto:
      'Bach não indicou instrumentos para quase nada além da sonata. Por isso a Oferenda existe em gravações de cravo solo, de conjunto de câmara e de orquestra, e cada uma responde de um jeito à mesma pergunta: como fazer seis vozes caberem no ouvido.',
  },
  {
    tipo: 'p',
    texto:
      'Comece pelo Ricercar a 3, que guarda o gesto da improvisação, e só depois vá ao Ricercar a 6. Se o rei chegou a tocar a sonata, ninguém registrou.',
  },
];

export const SUMARIO = CORPO.filter(
  (b): b is Extract<Bloco, { tipo: 'h2' }> => b.tipo === 'h2'
).map((b, i) => ({ id: b.id, numero: i + 1, titulo: b.texto }));

/** O que o artigo cita da enciclopédia: o "Neste artigo". */
export const CITADOS = {
  compositores: [
    {
      id: 'bach',
      nome: 'Johann Sebastian Bach',
      anos: '1685 – 1750',
      epoca: 'Barroco',
      retrato: img('bach') as string | null,
      foco: '50% 20%',
      iniciais: 'JB',
    },
    {
      id: 'cpe-bach',
      nome: 'Carl Philipp Emanuel Bach',
      anos: '1714 – 1788',
      epoca: 'Classicismo',
      retrato: null as string | null,
      foco: '50% 50%',
      iniciais: 'CB',
    },
  ],
  obras: [
    {
      id: 'bwv-1079',
      titulo: 'Oferenda Musical',
      catalogo: 'BWV 1079',
      ano: '1747',
      autor: 'J. S. Bach',
    },
    {
      id: 'bwv-1080',
      titulo: 'A Arte da Fuga',
      catalogo: 'BWV 1080',
      ano: 'c. 1742-1750',
      autor: 'J. S. Bach',
    },
  ],
  partitura: {
    titulo: 'Musikalisches Opfer, BWV 1079',
    detalhe: 'Edição da Bach-Gesellschaft, domínio público',
  },
  musica: 'Oferenda Musical, Ricercar a 3',
};

export const COMENTARIOS = [
  {
    id: 'c1',
    nome: 'Renata Moura',
    iniciais: 'RM',
    quando: 'há 2 dias',
    texto:
      'Nunca tinha reparado que as iniciais formam a palavra ricercar. Fui ouvir o Ricercar a 6 de novo depois de ler.',
    curtidas: 12,
  },
  {
    id: 'c2',
    nome: 'Tiago Bessa',
    iniciais: 'TB',
    quando: 'há 5 dias',
    texto:
      'O cânone que sobe um tom a cada volta é o meu preferido. Vale um artigo só sobre ele.',
    curtidas: 4,
  },
];
