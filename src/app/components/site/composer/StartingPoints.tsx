'use client';

import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { COMPOSER, levelLabel } from '@/app/conteudo/site/composer';
import type { ComposerOverview } from '@/app/requests/composer-details';
import { FavoriteHeart } from '../FavoriteHeart';
import { useSession } from '@/app/libs/session/session-client';
import { workTitle } from '../workTitle';

/**
 * How many works fit the study horizon the person gave in the welcome
 * questions: a short plan gets the two easiest; a lifetime gets five,
 * harder ones included. Visitors and people who did not answer see three.
 */
const BY_HORIZON = { MONTHS: 2, YEAR: 3, YEARS: 4, LIFE: 5 } as const;
const DEFAULT_COUNT = 3;

/**
 * "Por onde começar": a few works, each a step in. The team's picks lead;
 * the automatic ones (most studied, easiest first) fill the rest; a caption
 * says when the team chose. The page is cached for everyone, so the
 * count follows the person's study horizon here, in the browser.
 */
export function StartingPoints({
  works,
  language,
}: {
  works: ComposerOverview['startingPoints'];
  language: 'pt' | 'en';
}) {
  const copy = COMPOSER[language];
  const horizon = useSession().data?.user.studyHorizon ?? null;
  const shown = works.slice(0, horizon ? BY_HORIZON[horizon] : DEFAULT_COUNT);
  if (!shown.length) return null;
  const curated = shown.filter((w) => w.curated).length;
  // Only the team's picks are worth a caption; the automatic ones speak for
  // themselves.
  const caption = !curated
    ? null
    : curated === shown.length
      ? copy.startHere.curated
      : copy.startHere.mixed;
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="t-subtitulo">{copy.startHere.title}</h2>
        {caption && <span className="t-legenda text-right">{caption}</span>}
      </div>
      <ol className="flex flex-col gap-3">
        {shown.map((work, i) => {
          const level = levelLabel(work.difficulty, copy);
          return (
            // The whole row is the work's card: it turns into the work's
            // header, and shows the loading ring while the page is made.
            <li
              key={work.id}
              data-vira={`obra-${work.id}`}
              className="flex items-center gap-3 rounded-card bg-sup-2 p-4"
            >
              <span className="w-6 shrink-0 font-display text-[1.75rem] leading-none text-texto-fraco">
                {i + 1}
              </span>
              <Link
                href={`/works/${work.id}`}
                className="group flex min-w-0 flex-1 flex-col gap-0.5"
              >
                <span className="font-display text-[1.25rem] leading-snug group-hover:text-ouro-texto">
                  {workTitle(work.title, work.opOrCatalog)}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {[level, work.instrumentName].filter(Boolean).join(' · ')}
                </span>
              </Link>
              <Icon
                de={PiArrowRight}
                tamanho="p"
                className="shrink-0 text-texto-fraco max-sm:hidden"
              />
              <FavoriteHeart type="work" id={work.id} name={work.title} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
