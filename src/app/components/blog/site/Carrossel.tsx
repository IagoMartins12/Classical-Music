'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { cx } from '@/app/components/ui/cx';
import { BLOG, type Idioma } from '@/app/conteudo/blog';
import { useArrastarParaRolar } from './useArrastarParaRolar';

/**
 * A prateleira horizontal do blog (últimos artigos, categorias).
 *
 * A rolagem é a do navegador (dedo, trackpad, Shift + roda, Tab em cada
 * cartão); o mouse também arrasta (`useArrastarParaRolar`). Embaixo, os
 * pontos: um por "página" da faixa, o atual alongado em ouro, e clicar leva
 * até ela (01/10: no lugar das setas no canto do título).
 *
 * Sem `sempre`, no telefone a lista é vertical (esboço A) e os pontos não
 * aparecem.
 */
export function Carrossel({
  cabecalho,
  rotulo,
  idioma,
  sempre = false,
  largura = 'minmax(15rem,17.5rem)',
  className,
  children,
}: {
  /** Horizontal também no telefone (senão, lista vertical abaixo do `lg`). */
  sempre?: boolean;
  /** A largura de cada item na faixa (`grid-auto-columns`). */
  largura?: string;
  cabecalho: ReactNode;
  rotulo: string;
  idioma: Idioma;
  className?: string;
  children: ReactNode;
}) {
  const trilho = useRef<HTMLDivElement>(null);
  const [partes, setPartes] = useState(1);
  const [atual, setAtual] = useState(0);
  useArrastarParaRolar(trilho);

  const medir = useCallback(() => {
    const el = trilho.current;
    if (!el || !el.clientWidth) return;
    const sobra = el.scrollWidth - el.clientWidth;
    const total = sobra > 4 ? Math.ceil(sobra / el.clientWidth) + 1 : 1;
    setPartes(total);
    // Na ponta direita, o último ponto (a última parte pode ser mais curta).
    setAtual(
      el.scrollLeft >= sobra - 4
        ? total - 1
        : Math.round(el.scrollLeft / el.clientWidth)
    );
  }, []);

  useEffect(() => {
    const el = trilho.current;
    if (!el) return;
    medir();
    el.addEventListener('scroll', medir, { passive: true });
    const observador = new ResizeObserver(medir);
    observador.observe(el);
    return () => {
      el.removeEventListener('scroll', medir);
      observador.disconnect();
    };
  }, [medir]);

  const irPara = (parte: number) => {
    const el = trilho.current;
    if (!el) return;
    const reduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    el.scrollTo({
      left: Math.min(parte * el.clientWidth, el.scrollWidth - el.clientWidth),
      behavior: reduzido ? 'auto' : 'smooth',
    });
  };

  return (
    <div className={className}>
      {/* No right padding on wide screens: "See all" sits at the edge. */}
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:pl-10 lg:pr-0">
        {cabecalho}
      </div>
      <div
        ref={trilho}
        role="list"
        aria-label={rotulo}
        style={{ ['--coluna' as string]: largura }}
        className={cx(
          'mx-auto mt-4 max-w-[1360px] px-4 sm:px-6',
          sempre
            ? 'grid auto-cols-[var(--coluna)] grid-flow-col gap-3 overflow-x-auto overscroll-x-contain pb-2 [scroll-padding-inline:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory sm:gap-5 lg:snap-proximity'
            : 'flex flex-col',
          'lg:mt-6 lg:grid lg:auto-cols-[var(--coluna)] lg:grid-flow-col lg:gap-5 lg:overflow-x-auto lg:overscroll-x-contain lg:px-10 lg:pb-2',
          'lg:cursor-grab lg:snap-x lg:snap-proximity lg:[scroll-padding-inline:2.5rem] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden'
        )}
      >
        {children}
      </div>
      {partes > 1 && (
        <div
          role="group"
          aria-label={rotulo}
          className={cx(
            'mt-5 justify-center gap-1',
            sempre ? 'flex' : 'hidden lg:flex'
          )}
        >
          {Array.from({ length: partes }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={BLOG[idioma].inicio.parte(i + 1, partes)}
              aria-current={i === atual ? 'true' : undefined}
              onClick={() => irPara(i)}
              // O alvo é a faixa de 24px; o ponto desenhado é menor.
              className="group grid h-6 place-items-center px-1"
            >
              <span
                aria-hidden="true"
                className={cx(
                  'block h-2 rounded-full transition-[width,background-color] duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
                  i === atual
                    ? 'w-6 bg-ouro'
                    : 'w-2 bg-linha-forte group-hover:bg-texto-fraco'
                )}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
