'use client';

import { useEffect, useId, useRef } from 'react';
import { PiX } from 'react-icons/pi';
import type { ReactNode } from 'react';
import { cx } from './cx';
import { Button } from './Button';

/**
 * A casca dos diálogos do produto.
 *
 * **O projeto tem 70 arquivos de modal, somando 34.450 linhas** — 16% do
 * front. Cada um reimplementa o mesmo contorno: sobreposição, fechar no Esc,
 * travar a rolagem do fundo, devolver o foco. Onde alguém esqueceu, o defeito
 * é silencioso: o Tab passeia por trás do diálogo e ninguém percebe até
 * alguém navegar por teclado.
 *
 * **No telefone isto sobe de baixo.** Diálogo centralizado numa tela de 390px
 * é o padrão que obriga a pessoa a mirar; a folha ocupa a largura toda e fica
 * ao alcance do polegar. É também o gesto que o aplicativo vai herdar.
 *
 * Usa `<dialog>` nativo: foco preso, Esc e camada de topo já vêm do navegador,
 * e são exatamente as partes que as 70 implementações erram.
 */

interface SheetProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  /** Texto curto sob o título, lido junto pelo leitor de tela. */
  descricao?: string;
  /** Botões de ação. Ficam presos ao rodapé. */
  rodape?: ReactNode;
  largura?: 'p' | 'm' | 'g';
  children: ReactNode;
}

const LARGURA = {
  p: 'sm:max-w-md',
  m: 'sm:max-w-xl',
  g: 'sm:max-w-3xl',
} as const;

export function Sheet({
  aberto,
  aoFechar,
  titulo,
  descricao,
  rodape,
  largura = 'm',
  children,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  // Ids por instância: com `sheet-titulo` fixo, dois diálogos na mesma página
  // teriam ids duplicados, e o leitor de tela anunciaria o título do outro.
  const id = useId();
  const idTitulo = `${id}-titulo`;
  const idDescricao = `${id}-descricao`;

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;

    if (aberto && !dialogo.open) {
      dialogo.showModal();
      // A rolagem do fundo trava enquanto o diálogo está aberto: sem isto, o
      // conteúdo de trás rola junto no telefone e a pessoa perde o lugar.
      document.body.style.overflow = 'hidden';
    }

    if (!aberto && dialogo.open) {
      dialogo.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      onClose={aoFechar}
      onClick={(evento) => {
        // Clique fora fecha. O alvo é o próprio <dialog> só quando o clique
        // caiu no fundo, nunca no conteúdo.
        if (evento.target === ref.current) aoFechar();
      }}
      className={cx(
        'sup-alta m-0 w-full max-w-none p-0 text-texto backdrop:bg-[var(--bg-overlay)]',
        'mt-auto rounded-b-none',
        'sm:m-auto sm:rounded-folha',
        LARGURA[largura]
      )}
    >
      <div className="flex max-h-[85dvh] flex-col">
        <header className="flex items-start gap-3 px-6 pt-6">
          <div className="flex flex-1 flex-col gap-1">
            <h2 id={idTitulo} className="t-subtitulo">
              {titulo}
            </h2>
            {descricao && (
              <p id={idDescricao} className="t-legenda">
                {descricao}
              </p>
            )}
          </div>
          {/* No telefone não há Esc: sem este botão, a única saída era acertar
              a faixa de fundo que sobra acima da folha. */}
          <Button
            variante="fantasma"
            icone={PiX}
            rotulo="Fechar"
            onClick={aoFechar}
            className="-mr-2 -mt-2"
          />
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {rodape && (
          <footer className="flex justify-end gap-2 border-t border-linha px-6 py-4">
            {rodape}
          </footer>
        )}
      </div>
    </dialog>
  );
}
