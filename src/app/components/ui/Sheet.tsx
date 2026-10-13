'use client';

import { NomeAcao } from './NomeAcao';
import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
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
 *
 * **A alça (01/10), no telefone**, como a do `Modal`: arrastar para baixo
 * fecha; para cima, a folha ocupa a tela inteira (e para baixo, de tela
 * cheia, volta ao tamanho de antes). O X continua sendo o caminho acessível.
 * `alca={false}` para diálogos curtos (confirmações), onde ela só ocupa
 * lugar.
 *
 * **Uma rolagem só.** O `<dialog>` modal tem `overflow: auto` do navegador:
 * com o corpo da folha também rolando, apareciam duas barras. O diálogo não
 * rola; só o corpo.
 */

interface SheetProps {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  /** Texto curto sob o título, lido junto pelo leitor de tela. */
  descricao?: string;
  /** Botões de ação. Ficam presos ao rodapé. */
  rodape?: ReactNode;
  largura?: 'p' | 'm' | 'g' | 'gg';
  /** A alça de arrastar no telefone (padrão: sim). */
  alca?: boolean;
  children: ReactNode;
}

const LARGURA = {
  p: 'sm:max-w-md',
  m: 'sm:max-w-xl',
  g: 'sm:max-w-3xl',
  gg: 'sm:max-w-5xl',
} as const;

export function Sheet({
  aberto,
  aoFechar,
  titulo,
  descricao,
  rodape,
  largura = 'm',
  alca = true,
  children,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const [arrasto, setArrasto] = useState<number | null>(null);
  const [telaCheia, setTelaCheia] = useState(false);
  const gesto = useRef({ y: 0, t: 0 });
  // O `close` do <dialog> dispara também quando quem fechou foi o próprio
  // app (`aberto` virou falso, por exemplo depois de salvar). Repassar esse
  // fechamento chamava `aoFechar` de novo — e o formulário, ainda marcado
  // como alterado, perguntava "Sair sem salvar?" depois de salvar.
  const abertoRef = useRef(aberto);
  abertoRef.current = aberto;

  useEffect(() => {
    if (!aberto) {
      setTelaCheia(false);
      setArrasto(null);
    }
  }, [aberto]);

  const pegar = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    gesto.current = { y: e.clientY, t: performance.now() };
    setArrasto(0);
  };
  const arrastar = (e: PointerEvent<HTMLDivElement>) => {
    if (arrasto === null) return;
    const dy = e.clientY - gesto.current.y;
    // Para cima a folha resiste: é o sinal de que vai crescer.
    setArrasto(dy < 0 ? dy * (telaCheia ? 0.15 : 0.35) : dy);
  };
  const soltar = (e: PointerEvent<HTMLDivElement>) => {
    if (arrasto === null) return;
    const dy = e.clientY - gesto.current.y;
    const velocidade = dy / Math.max(1, performance.now() - gesto.current.t);
    const altura = ref.current?.offsetHeight ?? 600;
    const desceu = dy > Math.min(160, altura * 0.25) || velocidade > 0.6;
    const subiu = dy < -60 || velocidade < -0.6;
    setArrasto(null);
    if (desceu && telaCheia) setTelaCheia(false);
    else if (desceu) aoFechar();
    else if (subiu) setTelaCheia(true);
  };
  // Ids por instância: com `sheet-titulo` fixo, dois diálogos na mesma página
  // teriam ids duplicados, e o leitor de tela anunciaria o título do outro.
  const id = useId();
  const idTitulo = `${id}-titulo`;
  const idDescricao = `${id}-descricao`;

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    // Another dialog may stay open under this one (a sheet stacked on a
    // sheet): the page behind unlocks only when the last one closes.
    const destravar = () => {
      if (document.querySelector('dialog[open]')) return;
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };

    if (aberto && !dialogo.open) {
      dialogo.showModal();
      // A rolagem do fundo trava enquanto o diálogo está aberto: sem isto, o
      // conteúdo de trás rola junto no telefone e a pessoa perde o lugar.
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }

    if (!aberto && dialogo.open) {
      dialogo.close();
      destravar();
    }

    // Unmounting removes the dialog from the page (and the top layer); only
    // the lock is left to undo, after it is gone.
    return () => {
      queueMicrotask(destravar);
    };
  }, [aberto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      aria-describedby={descricao ? idDescricao : undefined}
      // Só o próprio fechamento: o `close` de um diálogo aberto por cima
      // (outro Sheet, um Modal, uma confirmação) sobe pela árvore do React
      // e fechava este junto.
      onClose={(evento) => {
        if (evento.target === ref.current && abertoRef.current) aoFechar();
      }}
      onClick={(evento) => {
        // Clique fora fecha. O alvo é o próprio <dialog> só quando o clique
        // caiu no fundo, nunca no conteúdo.
        if (evento.target === ref.current) aoFechar();
      }}
      style={
        arrasto !== null ? { transform: `translateY(${arrasto}px)` } : undefined
      }
      className={cx(
        'folha sup-alta m-0 w-full max-w-none overflow-hidden p-0 text-texto backdrop:bg-[var(--bg-overlay)]',
        'mt-auto rounded-b-none',
        'sm:m-auto sm:rounded-folha',
        telaCheia &&
          'max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none',
        arrasto !== null
          ? 'transition-none'
          : 'transition-[transform,height,border-radius] duration-[var(--t-folha)] ease-saida motion-reduce:transition-none',
        LARGURA[largura]
      )}
    >
      <div
        className={cx(
          'flex flex-col',
          telaCheia
            ? 'max-sm:h-[100dvh] max-sm:pt-[env(safe-area-inset-top)]'
            : 'max-h-[85dvh]',
          'sm:max-h-[85dvh]'
        )}
      >
        {alca && (
          // A faixa é maior que a barra, para o dedo acertar.
          <div
            aria-hidden="true"
            onPointerDown={pegar}
            onPointerMove={arrastar}
            onPointerUp={soltar}
            onPointerCancel={soltar}
            className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing sm:hidden"
          >
            <span className="h-1 w-10 rounded-full bg-linha-forte" />
          </div>
        )}
        <header
          className={cx(
            'flex items-start gap-3 px-6',
            alca ? 'pt-3 sm:pt-6' : 'pt-6',
            'max-sm:px-4'
          )}
        >
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
            onClick={aoFechar}
            className="-mr-2 -mt-2"
          >
            <NomeAcao acao="fechar" />
          </Button>
        </header>

        {/* Sem rolagem lateral: texto longo sem espaço (URL, JSON, id) quebra
            em qualquer ponto em vez de alargar a folha. */}
        <div className="classical-scrollbar min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 [overflow-wrap:anywhere] max-sm:px-4">
          {children}
        </div>

        {rodape && (
          // No telefone os botões dividem a largura em partes iguais: lado a
          // lado e alinhados à direita, três botões espremiam o texto e
          // quebravam em duas linhas cada um.
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-linha px-6 py-4 max-sm:px-4 max-sm:[&>*]:!mr-0 max-sm:[&>*]:flex-auto max-sm:[&>*]:whitespace-nowrap">
            {rodape}
          </footer>
        )}
      </div>
    </dialog>
  );
}
