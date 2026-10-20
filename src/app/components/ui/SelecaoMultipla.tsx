'use client';

import { useId, useMemo } from 'react';
import { PiX } from 'react-icons/pi';
import { Icon } from './Icon';
import { NomeAcao } from './NomeAcao';
import { SelecaoComBusca } from './SelecaoComBusca';
import { cx } from './cx';

/**
 * Escolher várias entradas de uma lista conhecida (categorias, gêneros).
 *
 * Feito com o que já existe: o `SelecaoComBusca` escolhe uma entrada de cada
 * vez, e as escolhidas ficam como fichas com o seu botão de tirar, no mesmo
 * desenho do `CampoDeFichas`. Entradas já escolhidas ou em `excluir` não
 * aparecem na lista. Substitui o `MultiSelect` legado, que tinha lista,
 * busca e fichas próprios.
 */
export function SelecaoMultipla({
  rotulo,
  opcoes,
  valores,
  aoMudar,
  placeholder,
  excluir = [],
  vazio,
  className,
}: {
  rotulo: string;
  opcoes: string[];
  valores: string[];
  aoMudar: (valores: string[]) => void;
  placeholder?: string;
  /** Entradas que não podem ser escolhidas (já usadas em outro campo). */
  excluir?: string[];
  vazio?: string;
  className?: string;
}) {
  const id = useId();
  const disponiveis = useMemo(() => {
    const fora = new Set([...valores, ...excluir]);
    return opcoes
      .filter((o) => !fora.has(o))
      .map((o) => ({ value: o, label: o }));
  }, [opcoes, valores, excluir]);

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={`${id}-campo`} className="text-sm font-medium text-texto">
        {rotulo}
      </label>
      {valores.length > 0 && (
        <ul aria-label={rotulo} className="flex flex-wrap gap-1.5">
          {valores.map((valor) => (
            <li
              key={valor}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-linha-forte bg-sup-2 pl-3 pr-1 text-sm text-texto"
            >
              {valor}
              <button
                type="button"
                onClick={() => aoMudar(valores.filter((v) => v !== valor))}
                className="grid h-6 w-6 place-items-center rounded-full text-texto-fraco hover:text-texto"
              >
                <Icon de={PiX} tamanho="pp" />
                <NomeAcao acao="tirar" />
                <span className="sr-only"> {valor}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <SelecaoComBusca
        id={`${id}-campo`}
        opcoes={disponiveis}
        valor=""
        aoMudar={(valor) => {
          if (valor && !valores.includes(valor)) aoMudar([...valores, valor]);
        }}
        placeholder={placeholder}
        vazio={vazio}
      />
    </div>
  );
}
