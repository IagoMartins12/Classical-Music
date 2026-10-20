'use client';

import { useEffect, useState } from 'react';
import { cx } from './cx';

export interface ItemDoIndice {
  id: string;
  numero: number;
  titulo: string;
}

/**
 * O índice lateral dos documentos longos: acompanha a leitura, marcando a
 * cláusula que está na tela. Sem JavaScript, continua sendo uma lista de
 * âncoras que funciona.
 */
export function IndiceDoDocumento({
  itens,
  rotulo,
}: {
  itens: ItemDoIndice[];
  rotulo: string;
}) {
  const [ativo, setAtivo] = useState(itens[0]?.id);

  useEffect(() => {
    const secoes = itens
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    // A cláusula ativa é a última cujo topo já passou do primeiro terço da tela.
    const observador = new IntersectionObserver(
      () => {
        const linha = window.innerHeight * 0.3;
        let atual = secoes[0]?.id;
        for (const s of secoes)
          if (s.getBoundingClientRect().top <= linha) atual = s.id;
        setAtivo(atual);
      },
      { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] }
    );
    secoes.forEach((s) => observador.observe(s));
    return () => observador.disconnect();
  }, [itens]);

  return (
    <nav aria-label={rotulo}>
      <p className="mb-4 text-sm font-semibold text-texto">{rotulo}</p>
      <ol className="flex flex-col gap-1">
        {itens.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={ativo === item.id ? 'location' : undefined}
              className={cx(
                'grid grid-cols-[1.75rem_1fr] rounded-controle py-1.5 text-sm leading-snug transition-colors duration-[var(--t-toque)]',
                ativo === item.id
                  ? 'text-ouro-texto'
                  : 'text-texto-fraco hover:text-texto'
              )}
            >
              <span className="tabular-nums">{item.numero}.</span>
              <span>{item.titulo}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
