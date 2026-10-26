import Link from '@/app/components/LocalizedLink';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import {
  ageAt,
  formatDateParts,
  type ComposerCopy,
} from '@/app/conteudo/site/composer';
import { countryOf } from '@/app/conteudo/site/countries';
import { instrumentOf } from '@/app/conteudo/instruments/meta';
import { eraName, eraOf } from '@/app/conteudo/site/eras';
import type {
  ComposerDetails,
  ComposerOverview,
} from '@/app/requests/composer-details';

function Fact({
  term,
  children,
  wide,
}: {
  term: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'flex flex-col sm:col-span-2' : 'flex flex-col'}>
      <dt className="t-legenda">{term}</dt>
      {children}
    </div>
  );
}

const value = 'font-display text-[1.1875rem] leading-snug';
const link =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

/** Birth, death, country, era and instruments: only the facts on record. */
export function ComposerFacts({
  composer,
  writtenFor,
  language,
  copy,
}: {
  composer: ComposerDetails;
  writtenFor: ComposerOverview['writtenFor'];
  language: Idioma;
  copy: ComposerCopy['facts'];
}) {
  const born = formatDateParts(composer.birth, language) ?? composer.birthDate;
  const died = formatDateParts(composer.death, language) ?? composer.deathDate;
  const age = ageAt(composer.birth, composer.death);
  const country = countryOf(composer.nationality, language);
  const era = eraName(composer.epochName, language);
  return (
    <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
      {born && (
        <Fact term={copy.born}>
          <dd className={value}>{born}</dd>
        </Fact>
      )}
      {died && (
        <Fact term={copy.died}>
          <dd className={value}>{died}</dd>
          {age !== null && (
            <dd className="t-rotulo text-texto-suave">{copy.aged(age)}</dd>
          )}
        </Fact>
      )}
      {country && (
        <Fact term={copy.country}>
          <dd className={value}>{country}</dd>
        </Fact>
      )}
      {era && (
        <Fact term={copy.era}>
          <dd className={value}>
            {/* The era's chapter in the history of music. It pointed to
                `/history`, which does not exist. */}
            {eraOf(composer.epochName) ? (
              <Link
                href={`/music-history/${eraOf(composer.epochName)!.key}`}
                className={link}
              >
                {era}
              </Link>
            ) : (
              era
            )}
          </dd>
        </Fact>
      )}
      {writtenFor.length > 0 && (
        <Fact term={copy.wroteFor} wide>
          <dd className={value}>
            {writtenFor.map((item, i) => {
              const nome = i === 0 ? item.name : item.name.toLowerCase();
              const instrumento = instrumentOf(item.name);
              return (
                <span key={item.instrumentId}>
                  {i > 0 && <span className="text-texto-fraco">{' · '}</span>}
                  {instrumento ? (
                    <Link
                      href={`/instruments/${instrumento.key}`}
                      className={link}
                    >
                      {nome}
                    </Link>
                  ) : (
                    nome
                  )}
                </span>
              );
            })}
          </dd>
        </Fact>
      )}
    </dl>
  );
}
