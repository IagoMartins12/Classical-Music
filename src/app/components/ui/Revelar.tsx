import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from './cx';

/**
 * Entra na tela quando chega à vista: sobe um pouco e aparece, acompanhando
 * a rolagem. Os filhos de `cascata` entram cada um na sua vez.
 *
 * Só CSS (`.revela` / `.revela-filhos` em `globals.css`, com
 * `animation-timeline: view()`): o conteúdo nunca some depois de pintado,
 * não depende de script e, sem suporte ou com movimento reduzido, aparece
 * inteiro de uma vez.
 */
export function Revelar({
  children,
  as: Tag = 'div',
  cascata = false,
  className,
  style,
  id,
  ...aria
}: {
  children: ReactNode;
  as?: ElementType;
  /** Os filhos entram um depois do outro, em vez do bloco inteiro. */
  cascata?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-labelledby'?: string;
  'aria-label'?: string;
}) {
  return (
    <Tag
      id={id}
      style={style}
      className={cx(cascata ? 'revela-filhos' : 'revela', className)}
      {...aria}
    >
      {children}
    </Tag>
  );
}
