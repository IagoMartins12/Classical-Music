import Link from '@/app/components/LocalizedLink';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { countryOf } from '@/app/conteudo/site/countries';
import { eraName } from '@/app/conteudo/site/eras';
import type { ComposerListItem } from '@/app/requests/catalog-lists';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { composerYears } from '../composerYears';

/**
 * One composer in a list: a portrait card, or a row with a round portrait on
 * phones and in list view (the `row:` variant, set by the list).
 */
export function ComposerItem({
  composer,
  language,
  priority = false,
}: {
  composer: ComposerListItem;
  language: Idioma;
  priority?: boolean;
}) {
  const fullName = composer.fullName || composer.name;
  const detail = [
    composerYears(
      composer.birthDate,
      composer.deathDate,
      language === 'pt' ? 'n.' : 'b.'
    ),
    countryOf(composer.nationality, language),
  ]
    .filter(Boolean)
    .join(' · ');
  const era = eraName(composer.epochName, language);
  return (
    <li className="relative">
      <Link
        href={`/composer/${composer.id}`}
        data-vira={`composer-${composer.id}`}
        className="group flex flex-col gap-3 row:flex-row row:items-center row:gap-4 row:py-3 row:pr-12"
      >
        <Portrait
          name={fullName}
          src={composer.portraitUrl}
          priority={priority}
          sizes="(max-width: 640px) 56px, (max-width: 1024px) 33vw, 20vw"
          className="aspect-[4/5] w-full rounded-card text-[2rem] row:aspect-square row:h-14 row:w-14 row:shrink-0 row:rounded-full row:text-[1rem]"
        />
        <span className="flex min-w-0 flex-col row:flex-1">
          <span className="flex items-center gap-1.5 font-display text-[1.25rem] leading-tight group-hover:text-ouro-texto">
            <span className="truncate row:hidden">{composer.name}</span>
            <span className="hidden truncate row:inline">{fullName}</span>
            {composer.isVerified && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          {detail && (
            <span className="t-rotulo truncate text-texto-suave">{detail}</span>
          )}
        </span>
        {era && (
          <span className="t-rotulo hidden shrink-0 text-texto-suave md:row:inline">
            {era}
          </span>
        )}
      </Link>
      <FavoriteHeart
        type="composer"
        id={composer.id}
        name={composer.name}
        onPhoto
        className="absolute right-2 top-2 z-elevado row:right-0 row:top-1/2 row:-translate-y-1/2 row:bg-transparent! row:bg-none! row:text-texto-fraco"
      />
    </li>
  );
}
