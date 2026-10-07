'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
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
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Já na tela ao montar (ou sem IntersectionObserver): fica como está,
    // sem sumir e voltar. Só o que está abaixo da dobra se esconde para
    // entrar quando a pessoa rolar até lá.
    const naDobra = el.getBoundingClientRect().top < window.innerHeight * 0.88;
    if (naDobra || !('IntersectionObserver' in window)) {
      el.dataset.visivel = '';
      return;
    }
    el.dataset.pronto = '';
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.dataset.visivel = '';
          obs.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      id={id}
      style={style}
      className={cx(cascata ? 'revela-filhos' : 'revela', className)}
      {...aria}
    >
      {children}
    </Tag>
  );
}
