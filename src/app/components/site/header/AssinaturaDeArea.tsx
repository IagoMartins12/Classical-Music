import type { CSSProperties } from 'react';
import { cx } from '@/app/components/ui/cx';

/**
 * The box of each area signature (public/brand/marca/areas), width × height.
 * The blog's are built on the main signature's geometry (its ink band is
 * 88.75 tall): at the main's CSS scale the piano and the name match it pixel
 * for pixel. The short version (no motto) has its own box.
 */
const CAIXA = {
  'blog-pt': [885.48, 143.27],
  'blog-en': [805.04, 143.27],
  portal: [607.62, 92],
  /** The portal's sidebar: the same line, a larger motto, so it still reads at 190 px. */
  'portal-lateral': [607.62, 104],
  admin: [429.2, 92],
} as const;

const CAIXA_CURTA: Partial<
  Record<keyof typeof CAIXA, readonly [number, number]>
> = {
  'blog-pt': [885.48, 88.75],
  'blog-en': [805.04, 88.75],
};

export type Area = keyof typeof CAIXA;

const camada = (arquivo: string): CSSProperties =>
  ({ '--marca': `url('/brand/marca/areas/${arquivo}.svg')` }) as CSSProperties;

/**
 * "Blog do OPUS ATLAS", "Portal do OPUS ATLAS", the admin's "OPUS ATLAS":
 * drawn as one piece, like the main signature, in three stacked layers — the
 * symbol and the name in the theme's gold with the shine, the italic in plain
 * gold, the motto in the text colour so it steps back. `curta` drops the
 * motto and centres the name (phones). Size it by height or by width; the
 * other side follows.
 */
export function AssinaturaDeArea({
  area,
  variante,
  curta = false,
  className,
}: {
  area: Area;
  /** Which motto, when the area has more than one (the portal's roles). */
  variante?: string;
  curta?: boolean;
  className?: string;
}) {
  const base = curta
    ? `${area}-curta`
    : variante
      ? `${area}-${variante}`
      : area;
  const [largura, altura] = (curta && CAIXA_CURTA[area]) || CAIXA[area];
  return (
    <span
      aria-hidden="true"
      className={cx('relative block shrink-0', className)}
      style={{ aspectRatio: `${largura} / ${altura}` }}
    >
      <span
        className="marca marca-brilho absolute inset-0"
        style={camada(`${base}-ouro`)}
      />
      {area !== 'admin' && (
        <span
          className="marca absolute inset-0"
          style={camada(`${base}-prefixo`)}
        />
      )}
      {!curta && (
        <span
          className="marca marca-lema absolute inset-0"
          style={camada(`${base}-lema`)}
        />
      )}
    </span>
  );
}
