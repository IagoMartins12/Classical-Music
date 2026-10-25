import type { Idioma } from '../legal/tipos';

/**
 * A instrumentação de uma obra (`Work.instrumentation`) é texto livre, vindo
 * das fontes: "Violino, Piano", "Voz, Baixo Contínuo", mas também "Violins",
 * "Mixed Coro satb", "Clarinets b♭" e "Cravo ou Piano". A maior parte está em
 * português, com os nomes da tabela de instrumentos da API.
 *
 * O multi-select do "Completar" escolhe desta lista: o valor gravado é o nome
 * em português (o que o banco já usa), e o rótulo segue o idioma da tela.
 * `lerInstrumentacao` traz o texto gravado para a lista, reconhecendo plural,
 * inglês e qualificadores ("b♭", "satb", "in f"); o que não reconhece fica
 * como está, para nada se perder.
 */
const INSTRUMENTOS: [pt: string, en: string, sinonimos: string[]][] = [
  ['Piano', 'Piano', ['pianos', 'pianoforte', 'piano solo']],
  [
    'Voz',
    'Voice',
    [
      'vozes',
      'voice',
      'voices',
      'vocal',
      'vocal soloists',
      'solo voz',
      'high voz',
      'medium voz',
      'low voz',
    ],
  ],
  ['Soprano', 'Soprano', ['sopranos', 'vozes: soprano']],
  ['Meio-Soprano', 'Mezzo-soprano', ['mezzo-soprano', 'mezzo']],
  ['Contralto', 'Alto', ['alto', 'altos', 'contraltos']],
  ['Tenor', 'Tenor', ['tenors', 'tenores']],
  ['Barítono', 'Baritone', ['baritone', 'baritones', 'baritonos']],
  [
    'Coro',
    'Choir',
    [
      'choir',
      'chorus',
      'mixed coro',
      'male coro',
      'female coro',
      'coro satb',
      'satb coro',
      'satb',
      'vozes satb',
      'satb vozes',
      'mixed choir',
    ],
  ],
  ['Orquestra', 'Orchestra', ['orchestra', 'theater orquestra', 'orquestras']],
  ['Orquestra de Cordas', 'String orchestra', ['string orchestra']],
  ['Cordas', 'Strings', ['strings']],
  ['Quarteto de Cordas', 'String quartet', ['string quartet']],
  ['Metais', 'Brass', ['brass']],
  ['Madeiras', 'Woodwinds', ['woodwinds', 'winds']],
  ['Banda', 'Band', ['band', 'banda de sopros', 'wind band', 'concert band']],
  [
    'Baixo Contínuo',
    'Basso continuo',
    ['continuo', 'basso continuo', 'baixo continuo'],
  ],
  ['Violino', 'Violin', ['violin', 'violins', 'violinos']],
  ['Viola', 'Viola', ['violas']],
  [
    'Violoncelo',
    'Cello',
    ['cello', 'cellos', 'violoncello', 'violoncellos', 'violoncelos'],
  ],
  [
    'Contrabaixo',
    'Double bass',
    ['double bass', 'double basses', 'contrabass', 'basses', 'contrabaixos'],
  ],
  ['Viola da Gamba', 'Viola da gamba', ['viola da gamba', 'viols', 'viol']],
  ['Violão', 'Guitar', ['guitar', 'guitars', 'violoes']],
  ['Alaúde', 'Lute', ['lute', 'lutes']],
  ['Bandolim', 'Mandolin', ['mandolin', 'mandolins']],
  ['Harpa', 'Harp', ['harp', 'harps', 'harpas']],
  ['Órgão', 'Organ', ['organ', 'organs', 'orgao solo']],
  ['Cravo', 'Harpsichord', ['harpsichord', 'harpsichords']],
  ['Clavicórdio', 'Clavichord', ['clavichord']],
  ['Harmônio', 'Harmonium', ['harmonium']],
  ['Teclado', 'Keyboard', ['keyboard', 'keyboards']],
  ['Celesta', 'Celesta', []],
  ['Acordeão', 'Accordion', ['accordion']],
  ['Flauta', 'Flute', ['flute', 'flutes', 'flautas']],
  ['Flautim', 'Piccolo', ['piccolo', 'piccolos']],
  ['Flauta Doce', 'Recorder', ['recorder', 'recorders']],
  ['Oboé', 'Oboe', ['oboe', 'oboes', 'oboes']],
  ['Corne Inglês', 'English horn', ['english horn', 'cor anglais']],
  ['Clarinete', 'Clarinet', ['clarinet', 'clarinets', 'clarinetes']],
  ['Clarinete Baixo', 'Bass clarinet', ['bass clarinet']],
  ['Fagote', 'Bassoon', ['bassoon', 'bassoons', 'fagotes']],
  ['Contrafagote', 'Contrabassoon', ['contrabassoon']],
  ['Saxofone', 'Saxophone', ['saxophone', 'saxophones']],
  ['Trompa', 'Horn', ['horn', 'horns', 'french horn', 'trompas']],
  ['Trompete', 'Trumpet', ['trumpet', 'trumpets', 'trompetes']],
  ['Corneta', 'Cornet', ['cornet', 'cornets']],
  ['Trombone', 'Trombone', ['trombones']],
  ['Tuba', 'Tuba', ['tubas']],
  ['Eufônio', 'Euphonium', ['euphonium']],
  ['Tímpanos', 'Timpani', ['timpani', 'timpano']],
  ['Percussão', 'Percussion', ['percussion']],
  ['Caixa', 'Snare drum', ['snare drum']],
  ['Bumbo', 'Bass drum', ['bass drum']],
  ['Pratos', 'Cymbals', ['cymbals']],
  ['Triângulo', 'Triangle', ['triangle']],
  ['Pandeiro', 'Tambourine', ['tambourine']],
  ['Glockenspiel', 'Glockenspiel', []],
  ['Xilofone', 'Xylophone', ['xylophone']],
  ['Vibrafone', 'Vibraphone', ['vibraphone']],
  ['Marimba', 'Marimba', []],
  ['Sinos', 'Bells', ['bells', 'tubular bells']],
  ['Bateria', 'Drum kit', ['drum kit', 'drums']],
  ['Tam-tam', 'Tam-tam', ['gongo', 'gong']],
  ['Banjo', 'Banjo', []],
  ['Violone', 'Violone', []],
  ["Viola d'Amore", "Viola d'amore", ["viola d'amore"]],
  ['Narrador', 'Narrator', ['narrator', 'speaker']],
];

const semAcento = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Qualificadores que não mudam o instrumento: afinação, vozes do coro,
 * "solo". "4 mãos" e "mão esquerda" mudam a peça e ficam como estão.
 */
const QUALIFICADOR =
  /\s+(b♭|bb|in [a-g](♭|b)?|[a-g](♭|b)?|s{0,2}a{0,2}t{0,2}b{0,2}|solo|arranged|ad lib\.?)$/;

/**
 * A primeira palavra que só qualifica o instrumento seguinte: "Contralto
 * Saxofone" é o saxofone alto, "Military Banda" é a banda.
 */
const PREFIXO = new Set([
  'contralto',
  'alto',
  'tenor',
  'soprano',
  'baixo',
  'bass',
  'military',
  'theatre',
  'theater',
  'tubular',
  'equal',
  'mixed',
  'male',
  'female',
  'high',
  'medium',
  'low',
]);

const PELO_NOME = new Map<string, string>();
for (const [pt, en, sinonimos] of INSTRUMENTOS)
  for (const nome of [pt, en, ...sinonimos]) PELO_NOME.set(semAcento(nome), pt);

const ROTULO = new Map(INSTRUMENTOS.map(([pt, en]) => [pt, { pt, en }]));

/** O instrumento que o nome nomeia, tirando qualificadores do fim. */
function pelo(nome: string): string | null {
  let t = nome.trim().replace(/^\d+-/, '');
  for (let i = 0; i < 4; i++) {
    const achado = PELO_NOME.get(t);
    if (achado) return achado;
    const sem = t.replace(QUALIFICADOR, '').trim();
    if (sem === t || !sem) break;
    t = sem;
  }
  return null;
}

/**
 * Os instrumentos da lista que o trecho nomeia, ou `null`. Além do nome
 * inteiro, entende o que as fontes juntaram num trecho só: "Orquestra:
 * flutes" e "Bassoons + horns" são dois; "Orquestra flutes", também; e
 * "Contralto Saxofone" é o saxofone.
 */
function reconhecer(trecho: string): string[] | null {
  const t = semAcento(trecho);
  const inteiro = pelo(t);
  if (inteiro) return [inteiro];

  const pedacos = t
    .split(/[:+]/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (pedacos.length > 1) {
    const achados = pedacos.map((p) => pelo(p));
    if (achados.every(Boolean)) return achados as string[];
  }

  const palavras = t.split(/\s+/);
  if (palavras.length > 1) {
    const resto = pelo(palavras.slice(1).join(' '));
    if (resto && PREFIXO.has(palavras[0])) return [resto];
    for (let i = 1; i < palavras.length; i++) {
      const a = pelo(palavras.slice(0, i).join(' '));
      const b = pelo(palavras.slice(i).join(' '));
      if (a && b) return [a, b];
    }
  }
  return null;
}

/**
 * Do texto gravado para a lista: cada parte (separada por vírgula, ponto e
 * vírgula ou "ou"/"or") vira o instrumento que ela nomeia, sem repetir; o que
 * não é reconhecido fica com o texto original.
 */
export function lerInstrumentacao(texto: string | null | undefined): string[] {
  const vistos = new Set<string>();
  for (const parte of (texto ?? '').split(/[,;]|\s+(?:ou|or)\s+/)) {
    const trecho = parte.trim();
    if (!trecho) continue;
    for (const nome of reconhecer(trecho) ?? [trecho]) vistos.add(nome);
  }
  return [...vistos];
}

/** Da lista para o texto gravado: "Violino, Piano". */
export const escreverInstrumentacao = (instrumentos: string[]) =>
  instrumentos.join(', ');

/** As opções do multi-select: o valor em português, o rótulo no idioma. */
export const opcoesDeInstrumento = (idioma: Idioma) =>
  INSTRUMENTOS.map(([pt]) => pt).sort((a, b) =>
    rotuloDoInstrumento(a, idioma).localeCompare(
      rotuloDoInstrumento(b, idioma),
      idioma
    )
  );

/** O nome na tela; o que não é da lista aparece como foi gravado. */
export const rotuloDoInstrumento = (valor: string, idioma: Idioma) =>
  ROTULO.get(valor)?.[idioma] ?? valor;
