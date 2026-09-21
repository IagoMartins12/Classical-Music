'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  /** Chave estável de cada item — a mesma que o `key` teria. */
  itemKey: (item: T, index: number) => string;
  /** Altura aproximada da linha; a real é medida depois que ela monta. */
  estimateHeight: number;
  /** Espaço entre as linhas, em pixels (o `space-y` da lista). */
  gap?: number;
  /**
   * Abaixo disso a lista sai inteira, sem virtualização: pouca linha não
   * justifica o posicionamento absoluto, e a medição custaria mais do que
   * economiza.
   */
  threshold?: number;
  className?: string;
  children: (item: T, index: number) => React.ReactNode;
}

const DEFAULT_THRESHOLD = 60;

/**
 * Lista longa do painel, virtualizada.
 *
 * As tabelas grandes acumulam fatia sobre fatia ("carregar mais"): depois de
 * algumas, são centenas de cartões no DOM, todos com sombra, transição e
 * ícones — o navegador recalcula estilo e layout da lista inteira a cada
 * rolagem. Aqui só o que está na janela (mais uma folga) existe de fato.
 *
 * A rolagem é a da página, não a de uma caixa interna: por isso o
 * virtualizador é o de janela, e o `scrollMargin` diz a que altura do
 * documento a lista começa. Sem ele, as linhas aparecem deslocadas.
 *
 * A altura de cada linha é medida depois de montar (`measureElement`), porque
 * os cartões mudam de altura conforme o conteúdo e a largura da tela.
 */
export default function VirtualList<T>({
  items,
  itemKey,
  estimateHeight,
  gap = 0,
  threshold = DEFAULT_THRESHOLD,
  className,
  children,
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  // `offsetTop` é leitura de layout: no efeito de layout ela acontece antes
  // da pintura, então a primeira rolagem já sai no lugar certo.
  useLayoutEffect(() => {
    setScrollMargin(containerRef.current?.offsetTop ?? 0);
  }, [items.length === 0]);

  const virtualizer = useWindowVirtualizer({
    count: items.length,
    estimateSize: () => estimateHeight,
    overscan: 6,
    gap,
    scrollMargin,
  });

  if (items.length <= threshold) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <div key={itemKey(item, index)}>{children(item, index)}</div>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((row) => (
          <div
            key={itemKey(items[row.index], row.index)}
            data-index={row.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${row.start - scrollMargin}px)`,
            }}
          >
            {children(items[row.index], row.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
