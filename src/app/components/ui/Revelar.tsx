import type { CSSProperties, ElementType, ReactNode } from 'react';
import { cx } from './cx';

/**
 * Entra na tela quando chega à vista: sobe um pouco, perde o desfoque e
 * aparece — uma vez só. Os filhos com `style={{ '--i': n }}` entram em
 * cascata (`.revela-filhos`).
 *
 * **O conteúdo nunca depende disto para existir.** O HTML chega visível; só
 * depois de montar, e só o que está abaixo da dobra, ganha `data-pronto` e se
 * esconde até chegar à vista. Sem script, com hidratação lenta, ou para o
 * robô que não rola a página, está tudo lá desde o começo. Com movimento
 * reduzido, o CSS não esconde nada.
 *
 * Componente de servidor: quem observa a rolagem é um só, para a página
 * inteira (`RevelarAoRolar`), em vez de uma ilha de cliente por bloco.
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
