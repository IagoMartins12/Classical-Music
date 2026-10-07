import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { levelLabel, type ComposerCopy } from '@/app/conteudo/site/composer';
import type { ComposerOverview } from '@/app/requests/composer-details';
import { FavoriteHeart } from '../FavoriteHeart';
import { workTitle } from '../workTitle';

/** "Por onde começar": three works, easiest first, each a step in. */
export function StartingPoints({
  works,
  copy,
}: {
  works: ComposerOverview['startingPoints'];
  copy: ComposerCopy;
}) {
  if (!works.length) return null;
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="t-subtitulo">{copy.startHere.title}</h2>
        <span className="t-legenda">{copy.startHere.automatic}</span>
      </div>
      <ol className="flex flex-col gap-3">
        {works.map((work, i) => {
          const level = levelLabel(work.difficulty, copy);
          return (
            <li
              key={work.id}
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
