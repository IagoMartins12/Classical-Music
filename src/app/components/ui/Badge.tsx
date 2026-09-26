import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';

/**
 * Selo de estado e etiqueta de filtro.
 *
 * **Badge diz o que algo é**; usa cor, porque os estados significam coisas
 * diferentes: verificada, em revisão, domínio público, em atraso.
 *
 * **Chip é escolha**; não usa cor própria. As sete épocas não ganham sete
 * matizes: colorir todas gasta a paleta inteira e obriga quem enxerga pouco a
 * decorar sete tons. O ouro marca a que está selecionada, e só ela.
 *
 * Nenhum dos dois usa a tarja colorida de 4px à esquerda que hoje aparece em
 * 90 lugares: a cor do estado vive no fundo tingido, na borda de 1px e no
 * ícone.
 */

type Estado = 'neutro' | 'ok' | 'atencao' | 'erro' | 'aviso' | 'ouro';

const ESTADO: Record<Estado, string> = {
  neutro: 'border-linha text-texto-suave fundo-sup-2',
  ok: 'border-ok/35 text-ok bg-ok/10',
  atencao: 'border-atencao/35 text-atencao bg-atencao/10',
  erro: 'border-erro/35 text-erro bg-erro/10',
  aviso: 'border-aviso/35 text-aviso bg-aviso/10',
  ouro: 'border-ouro/30 text-ouro-texto tint-ouro',
};

export function Badge({
  estado = 'neutro',
  icone,
  className,
  children,
}: {
  estado?: Estado;
  icone?: ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cx(
        // 13px, o degrau de legenda: nada no sistema fica abaixo disso.
        'inline-flex items-center gap-1.5 rounded-controle border px-2.5 py-1 text-[0.8125rem] font-medium',
        ESTADO[estado],
        className
      )}
    >
      {icone && <Icon de={icone} tamanho="pp" />}
      {children}
    </span>
  );
}

export function Chip({
  selecionado = false,
  onClick,
  className,
  children,
}: {
  selecionado?: boolean;
  onClick?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      onClick={onClick}
      className={cx(
        'inline-flex min-h-9 items-center rounded-full border px-3.5 text-sm',
        'transition-[border-color,color] duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
        '[@media(pointer:coarse)]:min-h-[var(--alvo)]',
        selecionado
          ? 'border-ouro/50 tint-ouro font-medium text-ouro-texto'
          : 'border-linha-forte text-texto-suave hover:border-ouro/45 hover:text-ouro-texto',
        className
      )}
    >
      {children}
    </button>
  );
}
