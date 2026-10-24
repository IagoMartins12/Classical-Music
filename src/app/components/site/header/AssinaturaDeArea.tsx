import type { CSSProperties } from 'react';
import { cx } from '@/app/components/ui/cx';

/**
 * The width of each area signature for a height of 92 (public/brand/marca/areas).
 * The full and the short version of an area share it.
 */
const LARGURA = {
  'blog-pt': 572.22,
  'blog-en': 522.77,
  portal: 607.62,
  admin: 429.2,
} as const;

export type Area = keyof typeof LARGURA;

const camada = (arquivo: string): CSSProperties =>
  ({ '--marca': `url('/brand/marca/areas/${arquivo}.svg')` }) as CSSProperties;

/**
 * "Blog do OPUS ATLAS", "Portal do OPUS ATLAS", the admin's "OPUS ATLAS":
 * drawn as one piece, like the main signature, in three stacked layers — the
 * symbol and the name in gold with the shine, the italic in the soft text
 * colour, the motto in the faint one. `curta` drops the motto and centres the
 * name (phones, sidebars). Size it by height; the width follows.
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
  return (
    <span
      aria-hidden="true"
      className={cx('relative block shrink-0', className)}
      style={{ aspectRatio: `${LARGURA[area]} / 92` }}
    >
      <span
        className="marca marca-brilho absolute inset-0"
        style={camada(`${base}-ouro`)}
      />
      {area !== 'admin' && (
        <span
          className="marca marca-texto absolute inset-0"
          style={camada(`${base}-prefixo`)}
        />
      )}
      {!curta && (
        <span
          className="marca marca-texto-fraco absolute inset-0"
          style={camada(`${base}-lema`)}
        />
      )}
    </span>
  );
}
