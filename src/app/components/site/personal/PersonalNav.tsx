'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cx } from '@/app/components/ui/cx';
import { PERSONAL } from '@/app/conteudo/site/personal';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

const PAGES = [
  ['profile', '/profile'],
  ['studies', '/learning'],
  ['favorites', '/favorites'],
  ['annotations', '/annotations'],
  ['uploads', '/upload'],
  ['achievements', '/achievements'],
] as const;

/** Tabs between the personal pages. */
export function PersonalNav() {
  const copy = PERSONAL[useRouteLanguage().language].nav;
  const pathname = usePathname() ?? '';
  return (
    <nav aria-label={copy.label} className="border-b border-[var(--linha)]">
      <ul className="section-wrap scroll-strip flex gap-1 overflow-x-auto py-2">
        {PAGES.map(([key, href]) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={key} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
                  active
                    ? 'tint-ouro text-ouro-na-tinta'
                    : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
                )}
              >
                {copy[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
