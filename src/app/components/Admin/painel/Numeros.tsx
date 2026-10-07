import type { ReactNode } from 'react';
import { PiCaretRight } from 'react-icons/pi';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';

/**
 * Uma faixa de números: uma superfície, várias células, divisória de 1px
 * entre elas. **Nunca um card por número** — seis caixas iguais lado a lado
 * são a cara de painel gerado, e a moldura repetida pesa mais que o dado.
 *
 * O número é mono tabular (os dígitos alinham de uma linha para a outra) e
 * sem cor: cor aqui só se o valor pedir ação (`tom="atencao"`).
 */

export interface Numero {
  id: string;
  rotulo: string;
  valor: ReactNode;
  /** A segunda linha: variação, base, "no período". */
  nota?: ReactNode;
  tom?: 'atencao' | 'erro';
  /** Abre o que está por trás do número (a lista de favoritos, por ex.). */
  aoClicar?: () => void;
}

const COLUNAS = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-5',
  6: 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
} as const;

export function Numeros({
  itens,
  colunas,
  carregando = false,
  className,
}: {
  itens: Numero[];
  colunas?: keyof typeof COLUNAS;
  carregando?: boolean;
  className?: string;
}) {
  const n =
    colunas ?? (Math.min(Math.max(itens.length, 2), 6) as keyof typeof COLUNAS);

  return (
    <dl
      className={cx(
        // O `gap-px` sobre o fundo `linha` desenha as divisórias: funciona em
        // qualquer quebra de coluna, sem calcular qual célula tem borda.
        'grid gap-px overflow-hidden rounded-card border border-linha bg-[var(--linha)] shadow-[var(--sombra-1)]',
        COLUNAS[n],
        className
      )}
    >
      {itens.map((item) => (
        <div
          key={item.id}
          className={cx(
            'relative flex min-w-0 flex-col gap-1 fundo-sup-1 px-5 py-4',
            item.aoClicar &&
              'transition-colors focus-within:bg-[var(--interactive-hover)] hover:bg-[var(--interactive-hover)]'
          )}
        >
          <dt className="t-legenda flex items-center gap-1 truncate">
            {item.aoClicar ? (
              // O botão cobre a célula inteira (o `after`), mas o nome dele é
              // o rótulo: o leitor de tela anuncia "Favoritos, botão".
              <button
                type="button"
                onClick={item.aoClicar}
                className="truncate text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline"
              >
                {item.rotulo}
              </button>
            ) : (
              item.rotulo
            )}
            {item.aoClicar && (
              <PiCaretRight aria-hidden="true" className="h-3 w-3 shrink-0" />
            )}
          </dt>
          <dd
            className={cx(
              't-dado truncate text-[1.5rem] leading-tight',
              item.tom === 'atencao'
                ? 'text-atencao'
                : item.tom === 'erro'
                  ? 'text-erro'
                  : 'text-texto'
            )}
          >
            {carregando ? <Skeleton className="mt-1 h-6 w-20" /> : item.valor}
          </dd>
          {item.nota !== undefined && (
            <dd className="t-legenda line-clamp-2">
              {carregando ? <Skeleton className="w-24" /> : item.nota}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}

/**
 * Leva a vista até a lista que um número acabou de filtrar — o número fica
 * em cima, a lista embaixo, e sem rolar a pessoa não vê o que mudou.
 */
export function rolarAte(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
