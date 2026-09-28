import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

/**
 * Abas: a faixa que troca o que a página mostra (Todos, Compositores,
 * Obras…).
 *
 * Favoritos, envios, anotações e estudos escreviam cada aba à mão — o mesmo
 * `px-4 py-2 rounded-lg` com o ternário de ativa, copiado dezesseis vezes — e
 * nenhuma dizia ao leitor de tela que era aba, nem qual estava escolhida.
 * Aqui a faixa é `tablist`, cada aba é `tab` com `aria-selected`, e a ativa
 * ganha a superfície de cima: tom, não cor. As mesmas superfícies das abas
 * de antes (`bg-theme-secondary` e `-tertiary`), para a tela não mudar.
 */
export function Abas({
  rotulo,
  className,
  children,
}: {
  /** Nome da faixa para o leitor de tela ("Filtrar favoritos"). */
  rotulo: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="tablist"
      aria-label={rotulo}
      className={cx(
        'classical-scrollbar-mini flex gap-1 overflow-x-auto rounded-xl bg-theme-secondary p-1',
        className
      )}
    >
      {children}
    </div>
  );
}

export function Aba({
  ativa,
  className,
  children,
  ...resto
}: ButtonHTMLAttributes<HTMLButtonElement> & { ativa: boolean }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativa}
      className={cx(
        'min-h-9 shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium',
        'transition-colors duration-[var(--t-toque)] ease-saida',
        ativa
          ? 'bg-theme-tertiary text-texto shadow-md'
          : 'text-texto-fraco hover:text-texto',
        className
      )}
      {...resto}
    >
      {children}
    </button>
  );
}
