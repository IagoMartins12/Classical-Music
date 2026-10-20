import { PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { countryOf } from '@/app/conteudo/site/countries';
import { eraName } from '@/app/conteudo/site/eras';
import {
  ON_THIS_DAY,
  daySlug,
  formatDay,
  shiftDay,
  type CalendarDay,
} from '@/app/conteudo/site/onThisDay';
import {
  getOnThisDay,
  type OnThisDayComposer,
} from '@/app/requests/on-this-day';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { DayPicker } from './DayPicker';

/**
 * One calendar day: who was born (portrait cards; a swipeable row on phones)
 * and who died (headstones). Every day has its own address.
 */
export async function OnThisDayPage({
  date,
  language,
}: {
  date: CalendarDay;
  language: Idioma;
}) {
  const copy = ON_THIS_DAY[language];
  const { born, died } = await getOnThisDay(date.month, date.day);
  const prev = shiftDay(date, -1);
  const next = shiftDay(date, 1);

  return (
    <div className="section-wrap flex flex-col gap-16 py-12">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <p className="rise t-legenda">{copy.menuTitle}</p>
          <h1
            className="rise font-display text-[clamp(3rem,8vw,6rem)] leading-[0.95] tracking-[-0.02em]"
            style={{ ['--delay' as string]: '60ms' }}
          >
            {formatDay(date, language)}
          </h1>
          <p
            className="rise t-corpo max-w-[52ch] text-texto-suave"
            style={{ ['--delay' as string]: '120ms' }}
          >
            {copy.text}
          </p>
        </div>
        <nav aria-label={copy.otherDays} className="flex flex-wrap gap-2">
          <DayPicker current={date} language={language} />
          <Link
            href={`/on-this-day/${daySlug(prev)}`}
            rel="prev"
            className={classesDeBotao('secundario', 'p')}
          >
            <Icon de={PiCaretLeft} tamanho="pp" /> {formatDay(prev, language)}
          </Link>
          <Link
            href={`/on-this-day/${daySlug(next)}`}
            rel="next"
            className={classesDeBotao('secundario', 'p')}
          >
            {formatDay(next, language)} <Icon de={PiCaretRight} tamanho="pp" />
          </Link>
        </nav>
      </header>

      <section className="flex flex-col gap-6">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.born}</h2>
        {born.length ? (
          <ul className="scroll-strip -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-10 md:overflow-visible md:px-0 lg:grid-cols-6">
            {born.map((composer, i) => (
              <BornCard
                key={composer.id}
                composer={composer}
                language={language}
                priority={i < 4}
              />
            ))}
          </ul>
        ) : (
          <p className="t-rotulo text-texto-suave">{copy.nobodyBorn}</p>
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.died}</h2>
        {died.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
            {died.map((composer) => (
              <Headstone
                key={composer.id}
                composer={composer}
                language={language}
              />
            ))}
          </ul>
        ) : (
          <p className="t-rotulo text-texto-suave">{copy.nobodyDied}</p>
        )}
      </section>
    </div>
  );
}

function BornCard({
  composer,
  language,
  priority,
}: {
  composer: OnThisDayComposer;
  language: Idioma;
  priority: boolean;
}) {
  const detail = [
    countryOf(composer.nationality, language),
    eraName(composer.epochName, language),
  ]
    .filter(Boolean)
    .join(' · ');
  return (
    <li className="relative w-[62%] shrink-0 snap-start sm:w-[40%] md:w-auto">
      <FavoriteHeart
        type="composer"
        id={composer.id}
        name={composer.name}
        onPhoto
        className="absolute right-2 top-2 z-elevado"
      />
      <Link
        href={`/composer/${composer.id}`}
        className="group flex flex-col gap-3"
      >
        <Portrait
          name={composer.fullName}
          src={composer.portraitUrl}
          priority={priority}
          sizes="(max-width: 768px) 62vw, 16vw"
          className="aspect-[4/5] w-full rounded-card text-[2.5rem] shadow-[var(--sombra-1)]"
        />
        <span className="flex flex-col gap-0.5">
          {composer.birthYear && (
            <span className="t-dado text-ouro-texto">{composer.birthYear}</span>
          )}
          <span className="flex items-center gap-1.5 font-display text-[1.375rem] leading-tight group-hover:text-ouro-texto">
            <span className="truncate">{composer.name}</span>
            {composer.isVerified && (
              <SeloVerificada className="h-4 w-4 shrink-0 text-verificado" />
            )}
          </span>
          {detail && (
            <span className="t-rotulo truncate text-texto-suave">{detail}</span>
          )}
        </span>
      </Link>
    </li>
  );
}

/** A headstone: arched stone, the portrait in grey, the years engraved. */
function Headstone({
  composer,
  language,
}: {
  composer: OnThisDayComposer;
  language: Idioma;
}) {
  const copy = ON_THIS_DAY[language];
  const age =
    composer.birthYear &&
    composer.deathYear &&
    composer.deathYear - composer.birthYear < 120
      ? composer.deathYear - composer.birthYear
      : null;
  return (
    <li className="flex flex-col items-center">
      <Link
        href={`/composer/${composer.id}`}
        className="group flex w-full flex-col items-center gap-3 rounded-t-full bg-sup-2 px-4 pb-6 pt-8 text-center shadow-[var(--sombra-1)] transition-shadow duration-[var(--t-resposta)] hover:shadow-[var(--sombra-2)]"
      >
        <Portrait
          name={composer.fullName}
          src={composer.portraitUrl}
          sizes="80px"
          className="h-20 w-20 rounded-full text-[1.25rem] grayscale transition-[filter] duration-[var(--t-resposta)] group-hover:grayscale-0"
        />
        <span className="line-clamp-2 font-display text-[1.25rem] leading-tight group-hover:text-ouro-texto">
          {composer.name}
        </span>
        <span className="t-dado text-[0.8125rem] tracking-[0.18em] text-texto-suave">
          {composer.birthYear ?? '?'}–{composer.deathYear ?? '?'}
        </span>
        {age !== null && <span className="t-legenda">{copy.aged(age)}</span>}
      </Link>
      <span
        aria-hidden="true"
        className="h-2 w-[112%] rounded-[3px] bg-sup-2 opacity-60"
      />
    </li>
  );
}
