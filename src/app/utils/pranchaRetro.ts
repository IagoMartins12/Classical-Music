import type { RetroCard } from '@/app/requests/retrospective';

/**
 * A retrospective card as a plate of the atlas: the person's year drawn in
 * the engraved orbits of the home globe (`site/orbits`), from the card's own
 * number. The screen (`PranchaDoAno`) and the 9:16 image (`og/retro`) draw
 * from the same geometry, so the shared image is the plate on the screen.
 *
 * - a count ("7 obras aprendidas") is one engraved star per item on the rings;
 * - a share ("62% do Romântico", the mastery of a work) is an arc on the
 *   outer ring, as long as the share;
 * - "next chapter" puts the suggested works as numbered bodies on the rings.
 */

/** The three orbits of every plate, in the 600-unit box of `Orbitas`. */
export const ANEIS = [118, 178, 234] as const;
/** Where the card's label follows the outer ring. */
export const RAIO_DO_ROTULO = 256;
/** Past this, more stars only blur into a band. */
const MAX_ESTRELAS = 36;

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

const r2 = (n: number) => Math.round(n * 100) / 100;

/**
 * One star per item, spread over the three rings by the golden angle: no
 * two land on top of each other, and the same count always draws the same
 * sky (server and browser print the same numbers).
 */
export function estrelas(n: number): { r: number; deg: number }[] {
  return Array.from({ length: Math.min(n, MAX_ESTRELAS) }, (_, i) => ({
    r: ANEIS[i % ANEIS.length],
    deg: r2(-90 + i * 137.508),
  }));
}

/** Where each suggested work of "next chapter" sits, one per ring. */
export const CORPOS_DO_PROXIMO = [
  { r: ANEIS[0], deg: -40 },
  { r: ANEIS[1], deg: 150 },
  { r: ANEIS[2], deg: 35 },
] as const;

const C = 300;
export const ponto = (r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: r2(C + r * Math.cos(rad)), y: r2(C + r * Math.sin(rad)) };
};

/**
 * The plate as SVG text, for the image renderer (`next/og`), which cannot
 * run the page's components or CSS. No text inside it: the renderer has no
 * fonts for an embedded SVG, so the number and the label are set over it.
 */
export function pranchaSvg(card: RetroCard, cor: string): string {
  const m = medidaDo(card);
  const partes: string[] = [];
  ANEIS.forEach((r, i) => {
    partes.push(
      `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${cor}" stroke-width="${1 + i * 0.1}" opacity="${0.22 + i * 0.08}"/>`
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
  if (m?.tipo === 'fracao') {
    const r = ANEIS[2];
    const comprimento = r2(2 * Math.PI * r * m.p);
    partes.push(
      `<circle cx="${C}" cy="${C}" r="${r}" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${comprimento} 9999" transform="rotate(-90 ${C} ${C})"/>`
    );
  }
  if (m?.tipo === 'contagem') {
    for (const e of estrelas(m.n)) {
      const p = ponto(e.r, e.deg);
      partes.push(`<circle cx="${p.x}" cy="${p.y}" r="4" fill="${cor}"/>`);
    }
  }
  if (card.kind === 'next') {
    (card.list ?? []).slice(0, 3).forEach((_, i) => {
      const c = CORPOS_DO_PROXIMO[i];
      const p = ponto(c.r, c.deg);
      partes.push(
        `<circle cx="${p.x}" cy="${p.y}" r="22" fill="#0c0d12" stroke="${cor}" stroke-width="1.2"/>`
      );
    });
  }
  // No number for the center: a small engraved sun, where the screen has
  // the seal.
  if (!card.value?.trim()) {
    partes.push(
      `<circle cx="${C}" cy="${C}" r="34" fill="none" stroke="${cor}" stroke-width="1.2" opacity="0.7"/>`,
      `<circle cx="${C}" cy="${C}" r="20" fill="none" stroke="${cor}" stroke-width="0.8" opacity="0.5"/>`,
      `<circle cx="${C}" cy="${C}" r="6" fill="${cor}"/>`
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">${partes.join('')}</svg>`;
}
