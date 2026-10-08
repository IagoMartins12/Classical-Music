import { PiHeadphones } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import {
  COMPOSER,
  levelLabel,
  LEVEL_VALUES,
} from '@/app/conteudo/site/composer';
import type { WorkListItem } from '@/app/requests/catalog-lists';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { workTitle } from '../workTitle';

/** "BEGINNER" or an IMSLP number ("7") as the site's three levels. */
function workLevel(value: string | null | undefined, language: Idioma) {
  if (!value) return null;
  const copy = COMPOSER[language];
  const named = LEVEL_VALUES[value as keyof typeof LEVEL_VALUES];
  return named
    ? copy.startHere.levels[named]
    : levelLabel(Number(value) || null, copy);
}

/** One work in a list: a card, or a row led by the composer's portrait. */
export function WorkItem({
  work,
  language,
}: {
  work: WorkListItem;
  language: Idioma;
}) {
  const composer = work.composer.fullName || work.composer.name;
  const meta = [work.compositionYear, workLevel(work.difficultyLevel, language)]
    .filter(Boolean)
    .join(' · ');
  return (
    <li className="relative">
      <Link
        href={`/works/${work.id}`}
        data-vira={`work-${work.id}`}
        className="group flex h-full flex-col gap-1.5 rounded-card bg-sup-2 p-5 pr-12 row:flex-row row:items-center row:gap-4 row:rounded-none row:bg-transparent! row:px-0 row:py-4"
      >
        <Portrait
          name={composer}
          src={work.composer.portraitUrl}
          sizes="48px"
          className="hidden h-12 w-12 shrink-0 rounded-full text-[0.875rem] row:block"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-display text-[1.3125rem] leading-snug group-hover:text-ouro-texto row:truncate">
            {workTitle(work.title, work.opOrCatalog)}
            {work.isVerified && (
              <SeloVerificada className="ml-1.5 inline-block h-4 w-4 align-[-0.1em] text-verificado" />
            )}
          </span>
          <span className="t-rotulo truncate text-texto-suave">
            {[composer, work.instrument?.name].filter(Boolean).join(' · ')}
          </span>
        </span>
        {(meta || work.hasRecording) && (
          <span className="t-legenda mt-auto flex items-center gap-2 pt-2 row:mt-0 row:shrink-0 row:pr-10 row:pt-0 max-sm:row:hidden">
            {meta}
            {work.hasRecording && (
              <Icon
                de={PiHeadphones}
                tamanho="pp"
                rotulo={language === 'pt' ? 'Com gravação' : 'Has a recording'}
              />
            )}
          </span>
        )}
      </Link>
      <FavoriteHeart
        type="work"
        id={work.id}
        name={work.title}
        className="absolute right-2 top-2 z-elevado row:right-0 row:top-1/2 row:-translate-y-1/2"
      />
    </li>
  );
}
