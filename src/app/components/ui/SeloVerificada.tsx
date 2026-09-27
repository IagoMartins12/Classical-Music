/**
 * O selo de verificada, feito de traço para poder se desenhar.
 *
 * Os ícones do Phosphor são formas preenchidas — não se desenham. Este tem o
 * contorno ondulado do `PiSealCheck` e o visto como traços, e com
 * `desenhar` o contorno se traça (0,8s) e o visto entra em seguida (0,5s):
 * 1,3s, uma vez. Com movimento reduzido, aparece pronto.
 */
const CONTORNO =
  'M12.00 2.90 L12.89 3.57 L13.55 4.69 L14.31 4.89 L15.45 4.25 L16.55 4.12 L16.98 5.14 L17.00 6.45 L17.55 7.00 L18.86 7.02 L19.88 7.45 L19.75 8.55 L19.11 9.69 L19.31 10.45 L20.43 11.11 L21.10 12.00 L20.43 12.89 L19.31 13.55 L19.11 14.31 L19.75 15.45 L19.88 16.55 L18.86 16.98 L17.55 17.00 L17.00 17.55 L16.98 18.86 L16.55 19.88 L15.45 19.75 L14.31 19.11 L13.55 19.31 L12.89 20.43 L12.00 21.10 L11.11 20.43 L10.45 19.31 L9.69 19.11 L8.55 19.75 L7.45 19.88 L7.02 18.86 L7.00 17.55 L6.45 17.00 L5.14 16.98 L4.12 16.55 L4.25 15.45 L4.89 14.31 L4.69 13.55 L3.57 12.89 L2.90 12.00 L3.57 11.11 L4.69 10.45 L4.89 9.69 L4.25 8.55 L4.12 7.45 L5.14 7.02 L6.45 7.00 L7.00 6.45 L7.02 5.14 L7.45 4.12 L8.55 4.25 L9.69 4.89 L10.45 4.69 L11.11 3.57 L12.00 2.90 Z';

export function SeloVerificada({
  className,
  desenhar = false,
}: {
  className?: string;
  desenhar?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${desenhar ? 'selo-desenha' : ''} ${className ?? ''}`}
    >
      <path className="selo-contorno" pathLength={1} d={CONTORNO} />
      <path
        className="selo-visto"
        pathLength={1}
        d="M8.6 12.3l2.3 2.3 4.5-4.9"
      />
    </svg>
  );
}
