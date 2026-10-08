import Link from '@/app/components/LocalizedLink';
import { cx } from '@/app/components/ui/cx';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { ERAS, type EraKey } from '@/app/conteudo/site/eras';

/** The seven eras as fixed tabs: each one is its own page. */
export function EraTabs({
  active,
  language,
  label,
}: {
  active?: EraKey;
  language: Idioma;
  label: string;
}) {
  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-elevado border-y border-[var(--linha)] bg-fundo"
    >
      <ul className="section-wrap scroll-strip flex gap-1 overflow-x-auto py-2">
        {ERAS.map((era) => (
          <li key={era.key} className="shrink-0">
            <Link
              href={`/music-history/${era.key}`}
              aria-current={era.key === active ? 'page' : undefined}
              className={cx(
                'inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
                era.key === active
                  ? 'tint-ouro text-ouro-na-tinta'
                  : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
              )}
            >
              {era.name[language]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
