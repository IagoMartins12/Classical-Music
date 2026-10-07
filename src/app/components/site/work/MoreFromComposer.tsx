import { PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { COMPOSER, LEVEL_VALUES } from '@/app/conteudo/site/composer';
import type { WorkCopy } from '@/app/conteudo/site/work';
import type { ComposerWork } from '@/app/requests/composer-details';
import { FavoriteHeart } from '../FavoriteHeart';
import { workTitle } from '../workTitle';

/** "Mais de Chopin": four other works, then the full catalog. */
export function MoreFromComposer({
  composer,
  works,
  language,
  copy,
}: {
  composer: { id: string; name: string };
  works: ComposerWork[];
  language: Idioma;
  copy: WorkCopy;
}) {
  if (!works.length) return null;
  const levels = COMPOSER[language].startHere.levels;
  return (
    <section className="mt-20 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">
          {copy.moreFrom(composer.name)}
        </h2>
        <Link
          href={`/composer/${composer.id}#works`}
          className="inline-flex items-center gap-1.5 t-rotulo text-ouro-texto underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
        >
          {copy.allWorks} <Icon de={PiArrowRight} tamanho="pp" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {works.map((work) => {
          const level = work.difficultyLevel
            ? levels[
                LEVEL_VALUES[work.difficultyLevel as keyof typeof LEVEL_VALUES]
              ]
            : null;
          return (
            <li key={work.id} className="relative">
              <FavoriteHeart
                type="work"
                id={work.id}
                name={work.title}
                className="absolute right-2 top-2 z-elevado"
              />
              <Link
                href={`/works/${work.id}`}
                className="group flex h-full flex-col gap-1 rounded-card bg-sup-2 p-5 pr-12"
              >
                <span className="font-display text-[1.1875rem] leading-snug group-hover:text-ouro-texto">
                  {workTitle(work.title, work.opOrCatalog)}
                </span>
                <span className="t-rotulo text-texto-suave">
                  {[work.instrument?.name, level].filter(Boolean).join(' · ')}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
