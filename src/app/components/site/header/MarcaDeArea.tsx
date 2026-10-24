import type { ReactNode } from 'react';
import Link from 'next/link';
import { cx } from '@/app/components/ui/cx';

/**
 * A part of Opus Atlas (the blog, the portal, the admin panel) signed with
 * the main signature: the signature with its gold shine, then the part's name
 * in italics and its motto. Side by side in a top bar; stacked in a sidebar,
 * where the width is short. `href` goes as is: each part has its own routes.
 */
export function MarcaDeArea({
  href,
  label,
  area,
  lema,
  lemaKey,
  empilhada = false,
  className,
}: {
  href: string;
  label: string;
  area: string;
  lema?: ReactNode;
  /** Changes when the motto changes, to replay its entrance. */
  lemaKey?: string;
  empilhada?: boolean;
  className?: string;
}) {
  if (empilhada) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={cx(
          'flex min-w-0 flex-col items-start gap-1.5 rounded-controle',
          className
        )}
      >
        <span
          aria-hidden="true"
          className="marca marca-assinatura marca-brilho h-[22px]"
        />
        <span className="flex min-w-0 max-w-full items-baseline gap-1.5 leading-none">
          <span className="shrink-0 font-display text-[1rem] italic text-texto-suave">
            {area}
          </span>
          {lema && (
            <span
              key={lemaKey}
              className="entra truncate text-[0.75rem] text-texto-fraco"
            >
              {lema}
            </span>
          )}
        </span>
      </Link>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cx(
        'flex min-h-[var(--alvo)] shrink-0 items-center gap-3 rounded-controle',
        className
      )}
    >
      <span
        aria-hidden="true"
        className="marca marca-assinatura marca-brilho h-[22px] sm:h-7"
      />
      <span aria-hidden="true" className="h-6 w-px bg-linha-forte sm:h-7" />
      <span className="flex flex-col">
        <span className="font-display text-[1.0625rem] italic leading-none text-texto-suave sm:text-[1.25rem]">
          {area}
        </span>
        {lema && (
          <span
            key={lemaKey}
            className="entra mt-1 hidden text-[0.75rem] leading-none text-texto-fraco sm:block"
          >
            {lema}
          </span>
        )}
      </span>
    </Link>
  );
}
