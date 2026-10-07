import { cx } from './cx';

/**
 * O visto de "incluído", feito de traço (como o `SeloVerificada`) para poder
 * se desenhar: dentro de um `Revelar` que acabou de aparecer, cada visto se
 * traça, em cascata pelo `ordem`. Fora disso, ou com movimento reduzido, está
 * pronto.
 */
export function VistoQueSeDesenha({
  ordem = 0,
  className,
}: {
  ordem?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cx('visto-desenha', className)}
      style={{ ['--d' as string]: ordem }}
    >
      <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
