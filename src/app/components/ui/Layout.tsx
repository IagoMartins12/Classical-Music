import type { AllHTMLAttributes, ElementType, ReactNode, Ref } from 'react';
import { cx } from './cx';

/**
 * Espaçamento entre irmãos, decidido pelo pai.
 *
 * **O problema que isto resolve.** A medição achou **6.090 margens escritas à
 * mão** (`mb-2` sozinha aparece 1.240 vezes) e **4.567 usos de `space-x/y-*`**,
 * contra apenas 1.439 de `gap`. A forma frágil virou a regra.
 *
 * Margem é espaçamento que o filho decide: dois vizinhos escolhem margens
 * diferentes e o resultado depende de quem veio primeiro. `space-*` tem o
 * problema oposto e pior: some quando um filho é condicional, e não sobrevive
 * à quebra de linha.
 *
 * A regra do sistema é uma só: **o pai distribui, o filho não se afasta**.
 *
 * Os degraus são os que o projeto já usava: 94,9% dos 17.741 espaçamentos
 * medidos cabem em seis valores.
 */

type Degrau = 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;

const GAP: Record<Degrau, string> = {
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  6: 'gap-6',
  8: 'gap-8',
  12: 'gap-12',
  16: 'gap-16',
};

/**
 * Qualquer atributo HTML passa adiante (`onClick`, `id`, `role`, `aria-*`,
 * `type` de botão, `ref`): a fase 3 troca `<div className="flex …">` por estes
 * componentes em 2.289 lugares, e um clique ou um `ref` perdido na troca seria
 * defeito silencioso.
 */
type Repassados = Omit<
  AllHTMLAttributes<HTMLElement>,
  'className' | 'children' | 'as'
> & {
  ref?: Ref<HTMLElement>;
};

interface StackProps extends Repassados {
  /** 2 é "dentro de um grupo", 4 é o padrão de conteúdo, 6 separa seções. */
  gap?: Degrau;
  alinhar?: 'inicio' | 'centro' | 'fim' | 'esticar';
  as?: ElementType;
  className?: string;
  children?: ReactNode;
}

const ALINHAR = {
  inicio: 'items-start',
  centro: 'items-center',
  fim: 'items-end',
  esticar: 'items-stretch',
} as const;

/** Empilha na vertical. */
export function Stack({
  gap = 4,
  alinhar,
  as: Tag = 'div',
  className,
  children,
  ...resto
}: StackProps) {
  return (
    <Tag
      {...resto}
      className={cx(
        'flex flex-col',
        GAP[gap],
        alinhar && ALINHAR[alinhar],
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface InlineProps extends Omit<StackProps, 'alinhar'> {
  alinhar?: 'inicio' | 'centro' | 'fim' | 'base';
  /** Separa os extremos: o padrão `flex items-center justify-between`, 228 usos. */
  extremos?: boolean;
  /** Deixa quebrar em mais de uma linha. Com `gap` isso funciona; com `space-x` não. */
  quebra?: boolean;
}

const ALINHAR_INLINE = {
  inicio: 'items-start',
  centro: 'items-center',
  fim: 'items-end',
  base: 'items-baseline',
} as const;

/** Alinha na horizontal. Substitui `flex items-center space-x-N` (2.221 lugares na fase 3). */
export function Inline({
  gap = 2,
  alinhar = 'centro',
  extremos = false,
  quebra = false,
  as: Tag = 'div',
  className,
  children,
  ...resto
}: InlineProps) {
  return (
    <Tag
      {...resto}
      className={cx(
        'flex',
        GAP[gap],
        ALINHAR_INLINE[alinhar],
        extremos && 'justify-between',
        quebra && 'flex-wrap',
        className
      )}
    >
      {children}
    </Tag>
  );
}

/**
 * A largura útil da página. Cinco contêineres sem critério viram três, e a
 * medida de texto para de crescer em telas largas.
 */
export function Container({
  largura = 'conteudo',
  className,
  children,
}: {
  largura?: 'texto' | 'conteudo' | 'catalogo' | 'cheia';
  className?: string;
  children: ReactNode;
}) {
  const LARGURA = {
    texto: 'max-w-[var(--largura-texto)]',
    conteudo: 'max-w-[var(--largura-conteudo)]',
    catalogo: 'max-w-[var(--largura-catalogo)]',
    cheia: 'max-w-none',
  } as const;

  return (
    <div
      className={cx(
        'mx-auto w-full px-4 sm:px-6 lg:px-14',
        LARGURA[largura],
        className
      )}
    >
      {children}
    </div>
  );
}
