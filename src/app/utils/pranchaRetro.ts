import type { IconType } from 'react-icons';
import {
  GiClarinet,
  GiDrum,
  GiFlute,
  GiHarp,
  GiSaxophone,
  GiTrumpet,
  GiViolin,
} from 'react-icons/gi';
import {
  PiBooks,
  PiGuitar,
  PiMedal,
  PiMicrophoneStage,
  PiMusicNotes,
  PiNotePencil,
  PiPianoKeys,
} from 'react-icons/pi';
import type { RetroCard, RetroFace } from '@/app/requests/retrospective';

/**
 * A retrospective card as a plate of the atlas: the person's year drawn in
 * the engraved orbits of the home globe (`site/orbits`). The screen
 * (`PranchaDoAno`) and the 9:16 image (`og/retro`) both draw from
 * `desenhoDo`, so the shared image is the plate on the screen.
 *
 * Each kind of card draws its own thing, so no two plates in a row look
 * alike:
 * - the composer and the work most mastered: the portrait in the middle;
 * - the profile: the instrument in the middle;
 * - the era: its name and years in the middle, its composers in orbit;
 * - the month: a dial of twelve, the month lit;
 * - the genre: a staff of five rings, one note per piece;
 * - practice: one tick per day at the instrument;
 * - repertoire and next chapter: the faces of the composers in orbit;
 * - a count ("7 obras aprendidas"): one star per item;
 * - a share ("41% do Barroco"): an arc on the outer ring, as long as it.
 */

/** The three orbits of every plate, in the 600-unit box of `Orbitas`. */
export const ANEIS = [118, 178, 234] as const;
/** Where the card's label follows the outer ring. */
export const RAIO_DO_ROTULO = 256;
/** The genre's staff: five rings, close as the lines of a stave. */
export const PAUTA = [150, 166, 182, 198, 214] as const;
/** Past this, more stars only blur into a band. */
const MAX_ESTRELAS = 36;
const MAX_DIAS = 60;

const r2 = (n: number) => Math.round(n * 100) / 100;
const C = 300;
export const ponto = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: r2(C + r * Math.cos(rad)), y: r2(C + r * Math.sin(rad)) };
};

export const maiuscula = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export type Medida =
  | { tipo: 'contagem'; n: number }
  | { tipo: 'fracao'; p: number }
  | null;

/** What the card's number measures: a count, a share, or nothing to draw. */
export function medidaDo(card: Pick<RetroCard, 'value'>): Medida {
  const v = card.value?.trim();
  if (!v) return null;
  if (v.endsWith('%')) {
    const p = Number.parseFloat(v.replace(',', '.'));
    return Number.isFinite(p)
      ? { tipo: 'fracao', p: Math.min(Math.max(p / 100, 0), 1) }
      : null;
  }
  // "1.234" in Portuguese, "1,234" in English: the digits are the count.
  const n = Number.parseInt(v.replace(/\D/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? { tipo: 'contagem', n } : null;
}

/** The length of the outer ring's arc for a share. */
export const arco = (p: number) => r2(2 * Math.PI * ANEIS[2] * p);

/**
 * One star per item, spread over the rings by the golden angle: no two land
 * on top of each other, and the same count always draws the same sky.
 */
export function estrelas(
  n: number,
  aneis: readonly number[] = ANEIS
): { r: number; deg: number }[] {
  return Array.from({ length: Math.min(n, MAX_ESTRELAS) }, (_, i) => ({
    r: aneis[i % aneis.length],
    deg: r2(-90 + i * 137.508),
  }));
}

/** Where the bodies sit, in order: one per ring first, then the gaps. */
const LUGARES = [
  { r: ANEIS[0], deg: -40 },
  { r: ANEIS[1], deg: 150 },
  { r: ANEIS[2], deg: 35 },
  { r: ANEIS[2], deg: -135 },
  { r: ANEIS[1], deg: 75 },
  { r: ANEIS[0], deg: 215 },
] as const;

type Idioma = 'pt' | 'en';

const EPOCAS: Record<string, { pt: string; en: string; anos: string }> = {
  Medieval: { pt: 'Medieval', en: 'Medieval', anos: '500–1400' },
  Renascentista: { pt: 'Renascença', en: 'Renaissance', anos: '1400–1600' },
  Barroco: { pt: 'Barroco', en: 'Baroque', anos: '1600–1750' },
  Clássico: { pt: 'Clássico', en: 'Classical', anos: '1750–1820' },
  Romântico: { pt: 'Romântico', en: 'Romantic', anos: '1820–1900' },
  Modernismo: { pt: 'Modernismo', en: 'Modernism', anos: '1900–1950' },
  Contemporâneo: { pt: 'Contemporâneo', en: 'Contemporary', anos: '1950–' },
};

const MESES: Record<Idioma, string[]> = {
  pt: [
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
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

/** The catalog's instrument name (pt or en) as its icon. */
const INSTRUMENTOS: [RegExp, IconType][] = [
  [/piano|cravo|harpsichord|órg[ãa]o|organ|teclado|keyboard/i, PiPianoKeys],
  [/viol[ãa]o|guitar|ala[úu]de|lute/i, PiGuitar],
  [/violino|violin|viola|violoncelo|cello|contrabaixo|double bass/i, GiViolin],
  [/flauta|flute|recorder/i, GiFlute],
  [/clarinete|clarinet|obo[ée]|oboe|fagote|bassoon/i, GiClarinet],
  [/saxofone|saxophone/i, GiSaxophone],
  [/trompete|trumpet|trompa|horn|trombone|tuba/i, GiTrumpet],
  [/harpa|harp/i, GiHarp],
  [/percuss|tambor|drum|t[íi]mpano|timpani/i, GiDrum],
  [/canto|voz|voice|soprano|tenor|coro|choir/i, PiMicrophoneStage],
];
const iconeDoInstrumento = (nome: string) =>
  INSTRUMENTOS.find(([re]) => re.test(nome))?.[1] ?? PiMusicNotes;

export type CentroDaPrancha =
  | { tipo: 'numero'; valor: string }
  | { tipo: 'retrato'; rosto: RetroFace }
  | { tipo: 'icone'; icone: IconType }
  | { tipo: 'palavra'; texto: string; legenda?: string }
  | { tipo: 'selo' };

export interface CorpoDaPrancha {
  r: number;
  deg: number;
  rosto?: RetroFace;
  icone?: IconType;
  texto?: string;
  /** A badge, not a planet: it sits still at the end of the arc. */
  fixo?: boolean;
}

export interface Desenho {
  centro: CentroDaPrancha;
  /** The share's arc on the outer ring (0 to 1). */
  arco: number | null;
  estrelas: { r: number; deg: number }[];
  pauta: boolean;
  /** Radial ticks on the middle ring, one per day (practice). */
  dias: number[];
  /** The month dial: twelve ticks, this one lit. */
  mes: number | null;
  corpos: CorpoDaPrancha[];
}

/** What the plate of this card draws. */
export function desenhoDo(card: RetroCard, idioma: Idioma): Desenho {
  const art = card.art ?? {};
  const medida = medidaDo(card);
  const valor = card.value?.trim() || null;
  const d: Desenho = {
    centro: valor ? { tipo: 'numero', valor } : { tipo: 'selo' },
    arco: medida?.tipo === 'fracao' ? medida.p : null,
    estrelas: [],
    pauta: false,
    dias: [],
    mes: null,
    corpos: [],
  };
  const contagem = medida?.tipo === 'contagem' ? medida.n : 0;
  const rostos = (faces: RetroFace[] | undefined) =>
    (faces ?? []).slice(0, LUGARES.length).map((rosto, i) => ({
      ...LUGARES[i],
      rosto,
    }));

  switch (card.kind) {
    case 'persona':
      if (art.instrument)
        d.centro = { tipo: 'icone', icone: iconeDoInstrumento(art.instrument) };
      break;
    case 'composer':
      if (art.portrait) d.centro = { tipo: 'retrato', rosto: art.portrait };
      d.estrelas = estrelas(contagem, [ANEIS[1], ANEIS[2]]);
      break;
    case 'best':
      if (art.portrait) {
        d.centro = { tipo: 'retrato', rosto: art.portrait };
        // The share sits at the end of its own arc.
        if (valor && d.arco !== null)
          d.corpos.push({
            r: ANEIS[2],
            deg: r2(-90 + 360 * d.arco),
            texto: valor,
            fixo: true,
          });
      }
      break;
    case 'epoch': {
      const epoca = art.epoch ? EPOCAS[art.epoch] : undefined;
      if (epoca)
        d.centro = {
          tipo: 'palavra',
          texto: epoca[idioma],
          legenda: epoca.anos,
        };
      d.corpos = rostos(art.faces?.slice(0, 3));
      break;
    }
    case 'genre':
      d.pauta = true;
      d.estrelas = estrelas(contagem, PAUTA);
      break;
    case 'month':
      if (art.month !== undefined) {
        d.mes = art.month;
        d.centro = { tipo: 'palavra', texto: MESES[idioma][art.month] };
        if (valor)
          d.corpos.push({
            r: ANEIS[2],
            deg: -90 + art.month * 30,
            texto: valor,
            fixo: true,
          });
      } else d.estrelas = estrelas(contagem);
      break;
    case 'practice': {
      const dias = Number.parseInt(
        card.detail?.match(/\d+/g)?.at(-1) ?? '',
        10
      );
      const n = Math.min(Number.isFinite(dias) ? dias : contagem, MAX_DIAS);
      d.dias = Array.from({ length: n }, (_, i) => r2(-90 + (360 / n) * i));
      break;
    }
    case 'discovery':
      d.corpos = rostos(art.faces);
      if (!d.corpos.length) d.estrelas = estrelas(contagem);
      break;
    case 'achievements':
      d.corpos = LUGARES.slice(0, Math.min(contagem, 3)).map((l) => ({
        ...l,
        icone: PiMedal,
      }));
      break;
    case 'community':
      d.corpos = [
        { ...LUGARES[0], icone: PiNotePencil },
        { ...LUGARES[1], icone: PiBooks },
      ];
      break;
    case 'next':
      d.corpos = art.faces?.length
        ? rostos(art.faces.slice(0, 3))
        : (card.list ?? []).slice(0, 3).map((_, i) => ({
            ...LUGARES[i],
            texto: String(i + 1),
          }));
      break;
    default:
      d.estrelas = estrelas(contagem);
  }
  return d;
}

/**
 * The card's words, as a sentence each. When the plate's middle holds a
 * portrait, an era or a month, the number leaves it and opens the detail
 * ("41% das suas obras..."); otherwise the detail starts with a capital.
 */
export function textoDo(card: RetroCard, desenho: Desenho) {
  const valor = card.value?.trim();
  const numeroFora =
    valor &&
    desenho.centro.tipo !== 'numero' &&
    !desenho.corpos.some((c) => c.texto === valor);
  return {
    titulo: maiuscula(card.title),
    detalhe: card.detail
      ? numeroFora
        ? `${valor} ${card.detail}`
        : maiuscula(card.detail)
      : numeroFora
        ? valor
        : null,
    /** The number is drawn only: say it to screen readers with the detail. */
    numeroSoNoDesenho: Boolean(valor && !numeroFora),
  };
}

/**
 * The plate's strokes as SVG text, for the image renderer (`next/og`), which
 * cannot run the page's components or CSS. No text or bodies inside it: the
 * route sets them over it, with the fonts and the portraits.
 */
export function pranchaSvg(d: Desenho, cor: string): string {
  const partes: string[] = [];
  const aneis = d.pauta ? [...PAUTA] : [...ANEIS];
  aneis.forEach((r, i) => {
    partes.push(
      `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${cor}" stroke-width="${d.pauta ? 1 : 1 + i * 0.1}" opacity="${d.pauta ? 0.4 : 0.22 + i * 0.08}"/>`
    );
  });
  // The graduated rim of the home atlas.
  for (let deg = 0; deg < 360; deg += 5) {
    const longo = deg % 30 === 0;
    const a = ponto(278 - (longo ? 0 : 8), deg - 90);
    const b = ponto(278 - 14, deg - 90);
    partes.push(
      `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${cor}" stroke-width="${longo ? 1.4 : 0.8}" opacity="0.3"/>`
    );
  }
  if (d.arco !== null) {
    partes.push(
      `<circle cx="${C}" cy="${C}" r="${ANEIS[2]}" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${arco(d.arco)} 9999" transform="rotate(-90 ${C} ${C})"/>`
    );
  }
  for (const e of d.estrelas) {
    const p = ponto(e.r, e.deg);
    partes.push(`<circle cx="${p.x}" cy="${p.y}" r="4" fill="${cor}"/>`);
  }
  for (const deg of d.dias) {
    const a = ponto(ANEIS[1] - 10, deg);
    const b = ponto(ANEIS[1] + 10, deg);
    partes.push(
      `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${cor}" stroke-width="2" stroke-linecap="round"/>`
    );
  }
  if (d.mes !== null) {
    for (let m = 0; m < 12; m++) {
      const a = ponto(ANEIS[2] - 12, -90 + m * 30);
      const b = ponto(ANEIS[2] + 12, -90 + m * 30);
      partes.push(
        `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" stroke="${cor}" stroke-width="1.4" opacity="${m === d.mes ? 1 : 0.45}"/>`
      );
    }
  }
  if (d.centro.tipo === 'retrato') {
    partes.push(
      `<circle cx="${C}" cy="${C}" r="${RAIO_DO_RETRATO + 8}" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.7"/>`
    );
  }
  if (d.centro.tipo === 'selo') {
    partes.push(
      `<circle cx="${C}" cy="${C}" r="34" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.7"/>`,
      `<circle cx="${C}" cy="${C}" r="20" fill="none" stroke="${cor}" stroke-width="0.8" opacity="0.5"/>`,
      `<circle cx="${C}" cy="${C}" r="6" fill="${cor}"/>`
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${partes.join('')}</svg>`;
}

/** The portrait in the middle, inside the first ring. */
export const RAIO_DO_RETRATO = 96;
/** A body's side, in the 600-unit box. */
export const LADO_DO_CORPO = 64;
