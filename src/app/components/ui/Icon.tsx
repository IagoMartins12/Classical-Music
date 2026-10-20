import type { ComponentType, SVGProps } from 'react';
import { cx } from './cx';

/**
 * Ícone com tamanho e família do sistema.
 *
 * **O que isto endereça.** `h-4 w-4` aparece 768 vezes, `h-5 w-5` 241, `h-3 w-3`
 * 242: o tamanho é decidido caso a caso.
 *
 * **Uma família: Phosphor** (`react-icons/pi`, peso regular — traço de 1,5 a
 * 24px, já no desenho, sem `strokeWidth`). Até a fase 3 eram treze famílias, de
 * Feather a Game Icons, com traços diferentes lado a lado na mesma barra. O
 * cheio (`PiStarFill`, `PiHeartFill`) só marca estado: avaliado, favoritado.
 *
 * **Ficam de fora, de propósito:** o `FcGoogle` do "Entrar com Google" (o
 * Google exige o logo oficial ali) e o conjunto musical da Game Icons — piano
 * de cauda (o logo), violino, harpa, órgão, trompete, flauta, saxofone,
 * bateria, clave de sol e partitura —, que a Phosphor não desenha.
 *
 * `aria-hidden` é o padrão porque quase todo ícone do produto acompanha um
 * rótulo visível. Quando o ícone é a única informação, passe `rotulo` e ele
 * vira acessível.
 */

type Tamanho = 'pp' | 'p' | 'm' | 'g';

const TAMANHO: Record<Tamanho, string> = {
  pp: 'h-3.5 w-3.5',
  p: 'h-4 w-4',
  m: 'h-5 w-5',
  g: 'h-6 w-6',
};

interface IconProps {
  /** O componente do ícone: Phosphor (`react-icons/pi`), ou do conjunto musical. */
  de: ComponentType<SVGProps<SVGSVGElement>>;
  tamanho?: Tamanho;
  /** Só quando o ícone carrega a informação sozinho. */
  rotulo?: string;
  className?: string;
}

export function Icon({
  de: Glifo,
  tamanho = 'p',
  rotulo,
  className,
}: IconProps) {
  return (
    <Glifo
      className={cx(TAMANHO[tamanho], 'shrink-0', className)}
      aria-hidden={rotulo ? undefined : true}
      aria-label={rotulo}
      role={rotulo ? 'img' : undefined}
      focusable="false"
    />
  );
}
