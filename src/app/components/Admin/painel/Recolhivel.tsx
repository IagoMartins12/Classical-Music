'use client';

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { PiCaretDown } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';

/**
 * Um bloco de métricas que se fecha: o topo das listas (usuários, catálogo,
 * envios) tem números que ajudam a ler a lista, mas quem só veio editar um
 * registro não quer rolar por eles. Fechado, fica só a linha do título; o
 * estado é lembrado por tela, neste navegador.
 *
 * O conteúdo só monta aberto — e as consultas dele também, por isso quem
 * chama passa as métricas como filhos, não calculadas antes.
 */
export function Recolhivel({
  chave,
  titulo,
  resumo,
  abertoPorPadrao = false,
  children,
}: {
  /** Identifica o bloco no `localStorage` (`painel:recolhivel:<chave>`). */
  chave: string;
  titulo: string;
  /** Uma linha que aparece fechado, para não precisar abrir ("1.204 contas"). */
  resumo?: ReactNode;
  abertoPorPadrao?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const armazenado = `painel:recolhivel:${chave}`;
  const [aberto, setAberto] = useState(abertoPorPadrao);

  useEffect(() => {
    try {
      const v = localStorage.getItem(armazenado);
      if (v !== null) setAberto(v === '1');
    } catch {
      // Sem armazenamento (janela privada): fica o padrão.
    }
  }, [armazenado]);

  const alternar = () => {
    setAberto((a) => {
      try {
        localStorage.setItem(armazenado, a ? '0' : '1');
      } catch {
        // idem
      }
      return !a;
    });
  };

  return (
    <section className="flex flex-col gap-3">
      <button
        type="button"
        onClick={alternar}
        aria-expanded={aberto}
        aria-controls={id}
        className="-mx-2 flex min-h-11 items-center gap-2 rounded-controle px-2 text-left transition-colors hover:bg-[var(--interactive-hover)]"
      >
        <Icon
          de={PiCaretDown}
          tamanho="p"
          className={cx(
            'text-texto-suave transition-transform duration-[var(--t-toque)] ease-saida',
            !aberto && '-rotate-90'
          )}
        />
        <span className="t-secao">{titulo}</span>
        {!aberto && resumo && (
          <span className="t-legenda ml-2 truncate">{resumo}</span>
        )}
      </button>
      {aberto && (
        <div id={id} className="flex flex-col gap-6">
          {children}
        </div>
      )}
    </section>
  );
}
