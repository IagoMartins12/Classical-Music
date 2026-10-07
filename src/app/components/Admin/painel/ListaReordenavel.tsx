'use client';

import {
  useRef,
  useState,
  type PointerEvent as EventoDePonteiro,
  type ReactNode,
} from 'react';
import { PiArrowDown, PiArrowUp, PiDotsSixVertical } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';

/**
 * Uma lista que se reordena arrastando — a linha das categorias do painel
 * (`TaxonomiaDoBlog`), com a alça de arrastar na frente.
 *
 * **Arrastar é por ponteiro**, não pelo arrastar nativo do HTML: o nativo
 * não funciona no toque, e foi por isso que a lista antiga trocou o arraste
 * por setas. Aqui a alça segue o dedo e o mouse; as outras linhas abrem
 * espaço enquanto ela passa; soltar grava a ordem.
 *
 * **As setas continuam**, para o teclado e o leitor de tela (e para quem
 * prefere um passo de cada vez).
 */
export function ListaReordenavel<T>({
  itens,
  chave,
  nome,
  aoMudar,
  ocupado = false,
  children,
}: {
  itens: T[];
  chave: (item: T) => string;
  /** O nome da linha nos rótulos ("Subir Romântico"). */
  nome: (item: T) => string;
  aoMudar: (nova: T[]) => void;
  /** Gravando: a lista não se mexe até terminar. */
  ocupado?: boolean;
  /** O resto da linha, depois da alça e das setas. */
  children: (item: T, indice: number) => ReactNode;
}) {
  const lista = useRef<HTMLUListElement>(null);
  const [arrasto, setArrasto] = useState<{
    de: number;
    para: number;
    dy: number;
  } | null>(null);
  const gesto = useRef({
    y: 0,
    alturas: [] as number[],
    topos: [] as number[],
  });

  const mover = (de: number, para: number) => {
    if (de === para || para < 0 || para >= itens.length) return;
    const nova = [...itens];
    const [item] = nova.splice(de, 1);
    nova.splice(para, 0, item);
    aoMudar(nova);
  };

  const pegar = (e: EventoDePonteiro<HTMLButtonElement>, i: number) => {
    if (ocupado || !lista.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const linhas = [...lista.current.children] as HTMLElement[];
    gesto.current = {
      y: e.clientY,
      alturas: linhas.map((l) => l.offsetHeight),
      topos: linhas.map((l) => l.offsetTop),
    };
    setArrasto({ de: i, para: i, dy: 0 });
  };

  const arrastar = (e: EventoDePonteiro<HTMLButtonElement>) => {
    if (!arrasto) return;
    const dy = e.clientY - gesto.current.y;
    const { topos, alturas } = gesto.current;
    // O centro da linha arrastada decide em que posição ela cairia.
    const centro = topos[arrasto.de] + alturas[arrasto.de] / 2 + dy;
    let para = 0;
    for (let i = 0; i < topos.length; i++) {
      if (centro > topos[i] + alturas[i] / 2) para = i;
    }
    if (centro < topos[0] + alturas[0] / 2) para = 0;
    setArrasto({ ...arrasto, dy, para });
  };

  const soltar = () => {
    if (!arrasto) return;
    const { de, para } = arrasto;
    setArrasto(null);
    mover(de, para);
  };

  /** Quanto cada linha se desloca para abrir espaço à arrastada. */
  const deslocamento = (i: number) => {
    if (!arrasto || i === arrasto.de) return 0;
    const altura = gesto.current.alturas[arrasto.de] ?? 0;
    if (arrasto.de < arrasto.para && i > arrasto.de && i <= arrasto.para)
      return -altura;
    if (arrasto.de > arrasto.para && i < arrasto.de && i >= arrasto.para)
      return altura;
    return 0;
  };

  return (
    <ul ref={lista} className="sup-1 flex flex-col !p-0">
      {itens.map((item, i) => {
        const arrastada = arrasto?.de === i;
        return (
          <li
            key={chave(item)}
            style={{
              transform: `translateY(${arrastada ? arrasto.dy : deslocamento(i)}px)`,
            }}
            className={cx(
              'relative flex flex-wrap items-center gap-3 border-t border-linha px-4 py-3 first:border-0',
              arrastada
                ? 'z-10 rounded-controle bg-sup-2 shadow-[var(--sombra-2)]'
                : 'transition-transform duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none'
            )}
          >
            <button
              type="button"
              aria-hidden="true"
              tabIndex={-1}
              onPointerDown={(e) => pegar(e, i)}
              onPointerMove={arrastar}
              onPointerUp={soltar}
              onPointerCancel={soltar}
              className="grid h-11 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-controle text-texto-fraco hover:text-texto active:cursor-grabbing"
            >
              <Icon de={PiDotsSixVertical} />
            </button>
            <span className="flex flex-col gap-0.5">
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiArrowUp}
                rotulo={`Subir ${nome(item)}`}
                disabled={i === 0 || ocupado}
                onClick={() => mover(i, i - 1)}
                className="!min-h-7"
              />
              <Button
                tamanho="p"
                variante="fantasma"
                icone={PiArrowDown}
                rotulo={`Descer ${nome(item)}`}
                disabled={i === itens.length - 1 || ocupado}
                onClick={() => mover(i, i + 1)}
                className="!min-h-7"
              />
            </span>
            {children(item, i)}
          </li>
        );
      })}
    </ul>
  );
}
