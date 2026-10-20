import Link from '@/app/components/LocalizedLink';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import type { Era } from '@/app/conteudo/site/eras';
import type { ComposerListItem } from '@/app/requests/catalog-lists';
import { Portrait } from '../Portrait';
import { yearOf } from '../composerYears';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Composers of the era on a shared timeline: each bar runs from birth to
 * death, inside the era's span. Phones get a plain list.
 */
export function LifeRuler({
  era,
  composers,
  todayLabel,
}: {
  era: Era;
  composers: ComposerListItem[];
  language: Idioma;
  todayLabel: string;
}) {
  const from = era.span.from;
  const to = era.span.to ?? CURRENT_YEAR;
  const lives = composers
    .map((c) => ({
      composer: c,
      born: Number(yearOf(c.birthDate)),
      died: Number(yearOf(c.deathDate)) || null,
    }))
    .filter((l) => l.born)
    .sort((a, b) => a.born - b.born);
  if (!lives.length) return null;
  const x = (year: number) =>
    Math.min(100, Math.max(0, ((year - from) / (to - from)) * 100));
  const years = (l: (typeof lives)[number]) => `${l.born}–${l.died ?? ''}`;

  return (
    <>
      <ul className="flex flex-col divide-y divide-[var(--linha)] md:hidden">
        {lives.map((l) => (
          <li key={l.composer.id}>
            <Link
              href={`/composer/${l.composer.id}`}
              className="flex items-center gap-3 py-2.5"
            >
              <Portrait
                name={l.composer.fullName || l.composer.name}
                src={l.composer.portraitUrl}
                sizes="40px"
                className="h-10 w-10 shrink-0 rounded-full text-[0.875rem]"
              />
              <span className="min-w-0 flex-1 truncate">
                {l.composer.fullName || l.composer.name}
              </span>
              <span className="t-dado text-[0.75rem] text-texto-fraco">
                {years(l)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 max-md:hidden">
        {lives.map((l) => {
          const left = Math.min(x(l.born), 72);
          const width = Math.max(
            x(l.died ?? Math.min(to, l.born + 70)) - x(l.born),
            28
          );
          return (
            <Link
              key={l.composer.id}
              href={`/composer/${l.composer.id}`}
              className="group relative block h-10"
            >
              <span
                className="absolute flex h-full items-center gap-2 rounded-full bg-sup-2 pr-4 transition-colors group-hover:bg-[var(--interactive-hover)]"
                style={{
                  left: `${left}%`,
                  width: `${Math.min(width, 100 - left)}%`,
                }}
              >
                <Portrait
                  name={l.composer.fullName || l.composer.name}
                  src={l.composer.portraitUrl}
                  sizes="40px"
                  className="h-10 w-10 shrink-0 rounded-full text-[0.875rem]"
                />
                <span className="truncate text-[0.875rem]">
                  {l.composer.fullName || l.composer.name}{' '}
                  <span className="t-dado opacity-70">{years(l)}</span>
                </span>
              </span>
            </Link>
          );
        })}
        <div className="mt-2 flex justify-between border-t border-[var(--linha)] pt-2">
          <span className="t-dado text-[0.75rem] text-texto-fraco">{from}</span>
          <span className="t-dado text-[0.75rem] text-texto-fraco">
            {era.span.to ?? todayLabel}
          </span>
        </div>
      </div>
    </>
  );
}
