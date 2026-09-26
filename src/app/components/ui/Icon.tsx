import type { ComponentType, SVGProps } from 'react';
import { cx } from './cx';

/**
 * Ícone com tamanho e traço do sistema.
 *
 * **O que isto endereça.** `h-4 w-4` aparece 768 vezes, `h-5 w-5` 241, `h-3 w-3`
 * 242: o tamanho é decidido caso a caso. Pior, o projeto importa de **dez
 * famílias diferentes** (Feather 379 arquivos, Game Icons 112, Font Awesome 53,
 * Bootstrap, Material, Simple, Lucide, Phosphor e mais duas), e traços
 * diferentes aparecem lado a lado na mesma barra.
 *
 * Este componente resolve tamanho e traço agora. A família única entra na fase
 * 3, quando a troca puder ser feita de uma vez por codemod: aqui o ícone ainda
 * chega como propriedade, para nenhuma tela precisar mudar antes da hora.
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
  /** O componente do ícone, de qualquer família (por ora). */
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
      strokeWidth={1.5}
      aria-hidden={rotulo ? undefined : true}
      aria-label={rotulo}
      role={rotulo ? 'img' : undefined}
      focusable="false"
    />
  );
}
