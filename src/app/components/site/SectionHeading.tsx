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
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="t-titulo max-sm:!text-[1.75rem]">
          {title}
        </h2>
        {subtitle && <p className="t-corpo text-texto-suave">{subtitle}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex min-h-10 items-center gap-1.5 t-rotulo text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
        >
          {action.label} <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      )}
    </div>
  );
}
