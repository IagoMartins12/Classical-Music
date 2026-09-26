import type { ElementType, ReactNode } from 'react';
import LocalizedLink from '../LocalizedLink';
import { cx } from './cx';
import { Skeleton } from './Skeleton';

/**
 * A superfície do produto.
 *
 * **O degradê fica** — é o traço mais próprio do visual do Opus Atlas, e foi
 * decisão sua mantê-lo. O que muda é a disciplina:
 *
 * - **um ângulo só, 135°**, em todo degradê do sistema, para a luz vir sempre
 *   do mesmo canto;
 * - **opaco, não translúcido.** O `.classical-card` de hoje é
 *   `rgba(...,0.6)` com `backdrop-filter: blur(12px)`: a superfície muda de cor
 *   conforme o que passa atrás, então o mesmo card não é o mesmo card em duas
 *   telas. O desfoque ainda custa GPU em toda a grade sem ter nada atrás para
 *   desfocar, e não tem equivalente em tela nativa;
 * - **sombra com deslocamento**, tingida do fundo no tema claro. A elevação
 *   vem da luz, não da borda dourada;
 * - **180ms e 3px** sob o cursor, no lugar de 700ms com escala de 1,05, que
 *   fazia o card empurrar os vizinhos na grade.
 *
 * Os três níveis têm significado: `1` é o card de trabalho, `2` é barra e
 * painel (fica, não flutua), `alta` é diálogo e menu.
 */

type Nivel = 1 | 2 | 'alta';
type Densidade = 'compacta' | 'media' | 'larga';

const NIVEL: Record<string, string> = {
  '1': 'sup-1',
  '2': 'sup-2',
  alta: 'sup-alta',
};

/** `p-6` é o padding mais usado do projeto (939 vezes): é o padrão. */
const DENSIDADE: Record<Densidade, string> = {
  compacta: 'p-4',
  media: 'p-6',
  larga: 'p-8',
};

interface CardProps {
  nivel?: Nivel;
  densidade?: Densidade;
  /** Realce sob o cursor. Só quando o card inteiro leva a algum lugar. */
  clicavel?: boolean;
  /** Estado selecionado: é aqui que o ouro marca hierarquia. */
  selecionado?: boolean;
  /**
   * Para onde o card leva. Com `href`, o card inteiro vira **link**
   * (`LocalizedLink`, que mantém o idioma), e não botão: navegação é link —
   * abre em nova aba, aparece no rastreamento e o leitor de tela anuncia o
   * destino. Botão fica para card que faz algo na própria tela (`onClick`).
   */
  href?: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function Card({
  nivel = 1,
  densidade = 'media',
  clicavel = false,
  selecionado = false,
  href,
  as,
  className,
  children,
  ...resto
}: CardProps) {
  const Tag = as ?? (href ? LocalizedLink : clicavel ? 'button' : 'div');

  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      href={href}
      className={cx(
        NIVEL[String(nivel)],
        href && 'block',
        DENSIDADE[densidade],
        Tag === 'button' && 'w-full text-left',
        (clicavel || href) &&
          'cursor-pointer transition-[transform,border-color,box-shadow] duration-[var(--t-resposta)] ease-saida hover:-translate-y-[3px] hover:border-ouro/40 hover:shadow-[var(--sombra-2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0',
        selecionado && 'border-ouro/50',
        className
      )}
      {...resto}
    >
      {children}
    </Tag>
  );
}

/**
 * O esqueleto do próprio card, com as medidas dele.
 *
 * Substitui as telas de carregamento desenhadas à mão: a do aluno tem 289
 * linhas para dizer o que aqui cabe em uma chamada.
 */
Card.Skeleton = function CardSkeleton({
  repetir = 1,
  densidade = 'media',
  nivel = 1,
}: {
  repetir?: number;
  densidade?: Densidade;
  nivel?: Nivel;
}) {
  return (
    <>
      {Array.from({ length: repetir }, (_, i) => (
        <div
          key={i}
          className={cx(
            NIVEL[String(nivel)],
            DENSIDADE[densidade],
            'flex flex-col gap-3'
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex w-full flex-col gap-2">
              <Skeleton className="h-5 w-[70%]" />
              <Skeleton className="w-[45%]" />
            </div>
            <Skeleton forma="bloco" className="h-6 w-20" />
          </div>
          <div className="h-px bg-[var(--linha)]" />
          <div className="flex gap-4">
            <Skeleton className="w-16" />
            <Skeleton className="w-10" />
            <Skeleton className="w-20" />
          </div>
        </div>
      ))}
    </>
  );
};
