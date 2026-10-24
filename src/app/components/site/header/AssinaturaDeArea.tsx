import type { CSSProperties } from 'react';
import { cx } from '@/app/components/ui/cx';

/**
 * The box of each area signature (public/brand/marca/areas), width × height.
 * The full and the short version of an area share it.
 */
const CAIXA = {
  'blog-pt': [572.22, 92],
  'blog-en': [522.77, 92],
  portal: [607.62, 92],
  /** The portal's sidebar: the same line, a larger motto, so it still reads at 190 px. */
  'portal-lateral': [607.62, 104],
  admin: [429.2, 92],
} as const;

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
  const [largura, altura] = CAIXA[area];
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
