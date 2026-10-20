'use client';

import { useId, type ReactNode } from 'react';
import { cx } from './cx';

/**
 * The system's checkbox, with the same finish as `Selecao` and `Field`: the
 * field's dark surface and 1px line, gold when checked, the focus ring of
 * every control. The native input stays (keyboard, forms, screen readers);
 * only its look is drawn here. The check traces itself when ticked, unless
 * motion is reduced.
 */
export function CaixaDeMarcar({
  rotulo,
  ajuda,
  marcado,
  aoMudar,
  disabled,
  name,
  className,
}: {
  rotulo: ReactNode;
  ajuda?: ReactNode;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cx(
        'group flex min-h-[var(--alvo)] cursor-pointer items-start gap-3 py-2',
        disabled && 'cursor-not-allowed opacity-60',
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        checked={marcado}
        disabled={disabled}
        onChange={(e) => aoMudar(e.target.checked)}
        aria-describedby={ajuda ? `${id}-ajuda` : undefined}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cx(
          'caixa-marcar mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-[6px] border transition-[background-color,border-color,box-shadow] duration-[var(--t-resposta)] ease-saida',
          'peer-focus-visible:shadow-[var(--foco-anel)]',
          marcado
            ? 'border-[var(--ouro)] fill-ouro text-sobre-ouro'
            : 'border-[var(--linha-forte)] bg-[var(--campo)] group-hover:border-[var(--ouro)]'
        )}
      >
        {marcado && (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="caixa-visto h-3.5 w-3.5"
          >
            <path pathLength={1} d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="t-rotulo text-texto">{rotulo}</span>
        {ajuda && (
          <span id={`${id}-ajuda`} className="t-legenda">
            {ajuda}
          </span>
        )}
      </span>
    </label>
  );
}
