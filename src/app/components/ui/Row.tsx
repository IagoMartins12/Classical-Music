import type { ElementType, ReactNode } from 'react';
import { cx } from './cx';
import { Skeleton } from './Skeleton';

/**
 * Linha de lista: a densidade alta do produto.
 *
 * **Onde isto entra.** Painel do professor, administração, histórico, listas
 * de aluno. Hoje essas telas usam um card por item, e o resultado é um painel
 * com 30 caixas empilhadas onde deveria haver uma superfície e linhas.
 *
 * Card não é o container padrão: quando os itens são muitos e iguais, a
 * separação vem do espaço e do realce sob o cursor, não de uma borda por item.
 *
 * Num telefone, cada linha vira bloco empilhado (dado principal em cima), em
 * vez de rolagem horizontal, que é o pior jeito de ler tabela em tela
 * estreita.
 */

interface RowProps {
  /** Conteúdo à esquerda: avatar, ícone, marcador. */
  antes?: ReactNode;
  /** O que a linha é. */
  titulo: ReactNode;
  /** A segunda linha, menor. */
  detalhe?: ReactNode;
  /** Valor à direita: contagem, estado, data. */
  valor?: ReactNode;
  /** Ações no fim da linha. */
  depois?: ReactNode;
  clicavel?: boolean;
  as?: ElementType;
  className?: string;
  onClick?: () => void;
}

export function Row({
  antes,
  titulo,
  detalhe,
  valor,
  depois,
  clicavel = false,
  as,
  className,
  ...resto
}: RowProps) {
  const Tag = as ?? (clicavel ? 'button' : 'div');

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      className={cx(
        'flex w-full min-h-[var(--alvo)] flex-col gap-2 rounded-controle px-3.5 py-3 text-left',
        'sm:flex-row sm:items-center sm:gap-3.5',
        clicavel &&
          'cursor-pointer transition-colors duration-[var(--t-resposta)] ease-saida hover:bg-[var(--interactive-hover)] motion-reduce:transition-none',
        className
      )}
      {...resto}
    >
      {antes}

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[0.9375rem] text-texto">{titulo}</span>
        {detalhe && <span className="truncate t-legenda">{detalhe}</span>}
      </span>

      {valor && (
        <span className="t-dado text-[0.8125rem] text-texto-suave">
          {valor}
        </span>
      )}

      {depois}
    </Tag>
  );
}

/** Uma superfície só, com as linhas dentro. */
Row.Lista = function RowLista({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx('sup-1 p-2', className)}>{children}</div>;
};

Row.Skeleton = function RowSkeleton({ repetir = 4 }: { repetir?: number }) {
  return (
    <>
      {Array.from({ length: repetir }, (_, i) => (
        <div
          key={i}
          className="flex min-h-[var(--alvo)] items-center gap-3.5 px-3.5 py-3"
        >
          <Skeleton forma="circulo" className="h-8 w-8" />
          <span className="flex flex-1 flex-col gap-2">
            <Skeleton className="w-[42%]" />
            <Skeleton className="w-[28%]" />
          </span>
          <Skeleton className="w-16" />
        </div>
      ))}
    </>
  );
};
