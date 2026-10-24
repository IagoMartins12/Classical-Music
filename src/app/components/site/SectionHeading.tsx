import type { ReactNode } from 'react';
import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';

/** A section title, an optional line under it, and an optional "see all". */
export function SectionHeading({
  title,
  subtitle,
  action,
  id,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: { label: string; href: string };
  id?: string;
}) {
  return (
    // No celular o link fica na linha do título, centrado nele: quem quebra é
    // o título, nunca o link.
    <div className="flex items-center justify-between gap-x-4 gap-y-2 sm:flex-wrap sm:items-end sm:gap-x-6">
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id={id} className="t-titulo max-sm:!text-[1.75rem]">
          {title}
        </h2>
        {subtitle && <p className="t-corpo text-texto-suave">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap t-rotulo text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
        >
          {action.label} <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      )}
    </div>
  );
}
