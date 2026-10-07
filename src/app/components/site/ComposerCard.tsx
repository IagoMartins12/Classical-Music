import Link from '@/app/components/LocalizedLink';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { eraName } from '@/app/conteudo/site/eras';
import { FavoriteHeart } from './FavoriteHeart';
import { Portrait } from './Portrait';
import { composerYears } from './composerYears';

export interface ComposerCardData {
  id: string;
  name: string;
  fullName?: string | null;
  portraitUrl?: string | null;
  birthDate?: string | null;
  deathDate?: string | null;
  epochName?: string | null;
  isVerified?: boolean;
}

/** Carousel width that fits this card (portrait leads). */
export const COMPOSER_CARD_WIDTH = 'minmax(14.5rem,16.5rem)';

/** The large composer card of the carousels: the portrait is the hook. */
export function ComposerCard({
  composer,
  language,
}: {
  composer: ComposerCardData;
  language: Idioma;
}) {
  const years = composerYears(
    composer.birthDate,
    composer.deathDate,
    language === 'pt' ? 'n.' : 'b.'
  );
  const era = eraName(composer.epochName, language);
  return (
    <div role="listitem" className="relative snap-start">
      <FavoriteHeart
        type="composer"
        id={composer.id}
        name={composer.name}
        onPhoto
        className="absolute right-3 top-3 z-elevado"
      />
      <Link
        href={`/composer/${composer.id}`}
        className="group flex flex-col gap-3"
      >
        <Portrait
          name={composer.fullName || composer.name}
          src={composer.portraitUrl}
          sizes="264px"
          className="aspect-[4/5] w-full rounded-card text-[2.5rem] shadow-[var(--sombra-1)]"
        />
        <span className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5 font-display text-[1.4375rem] leading-tight group-hover:text-ouro-texto">
            <span className="truncate">{composer.name}</span>
            {composer.isVerified && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          <span className="t-dado text-[0.8125rem] text-texto-fraco">
            {[years, era].filter(Boolean).join(' · ')}
          </span>
        </span>
      </Link>
    </div>
  );
}
