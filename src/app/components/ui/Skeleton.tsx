import { cx } from './cx';

/**
 * O esqueleto do carregamento.
 *
 * **Por que isto importa tanto neste projeto.** As 39 telas de carregamento
 * somam **11.263 linhas**, média de 289 cada, e **38 das 39 são
 * `'use client'`** — um esqueleto não interage, então isso manda JavaScript ao
 * navegador para desenhar retângulos parados. Várias importam catorze ícones e
 * desenham borrões que pulsam.
 *
 * O caminho é o inverso: cada primitivo expõe o próprio esqueleto, com as
 * medidas do componente de verdade. Mudou o card, mudou o esqueleto. Hoje os
 * dois se desencontram no primeiro ajuste de layout.
 *
 * O brilho percorre uma vez e usa a cor da superfície, não cinza. Com
 * `prefers-reduced-motion`, ele para e fica um bloco liso (regra no
 * `globals.css`).
 */

interface SkeletonProps {
  /** Classe de largura/altura. O padrão é uma linha de texto. */
  className?: string;
  /** Arredondamento: `linha` para texto, `bloco` para áreas, `circulo` para avatar. */
  forma?: 'linha' | 'bloco' | 'circulo';
}

const FORMA = {
  linha: 'rounded h-3',
  bloco: 'rounded-[var(--r-controle)]',
  circulo: 'rounded-full',
} as const;

export function Skeleton({ className, forma = 'linha' }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={cx('loading-skeleton block', FORMA[forma], className)}
    />
  );
}

/**
 * Uma região que está carregando, anunciada para leitor de tela.
 *
 * Sem isto, quem usa leitor ouve silêncio enquanto a tela se monta. O texto
 * sai da tela mas continua sendo lido.
 */
export function AreaCarregando({
  rotulo = 'Carregando',
  children,
}: {
  rotulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{rotulo}</span>
      {children}
    </div>
  );
}
