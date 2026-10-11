import { PiArrowSquareOut, PiLightbulb } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Revelar } from '@/app/components/ui/Revelar';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { eraName } from '@/app/conteudo/site/eras';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { SectionHeading } from '../SectionHeading';
import { composerYears } from '../composerYears';

export interface FeaturedComposerData {
  id: string;
  name: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  portraitUrl: string | null;
  bio: string | null;
  permLinkImslp: string | null;
  wikipediaLink: string | null;
  epochName: string;
  isVerified?: boolean;
  works: { id: string; title: string }[];
  curiosities: Record<Idioma, { id: string; text: string }[]>;
}

const pillLink =
  'inline-flex min-h-10 items-center gap-2 rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-ouro-texto';

/** "Compositor em destaque": the composer of the day, with works and curiosities. */
export function FeaturedComposer({
  copy,
  language,
  composer,
}: {
  copy: HomeCopy['featured'];
  language: Idioma;
  composer: FeaturedComposerData;
}) {
  const href = `/composer/${composer.id}`;
  const firstParagraph = composer.bio?.split(/\n\s*\n/)[0];
  const meta = [
    composerYears(
      composer.birthDate,
      composer.deathDate,
      language === 'pt' ? 'n.' : 'b.'
    ),
    eraName(composer.epochName, language),
  ].filter(Boolean);

  return (
    <Revelar as="section" className="section-wrap flex flex-col gap-10 py-12">
      <SectionHeading title={copy.title} subtitle={copy.subtitle} />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="relative md:sticky md:top-24 md:self-start">
          <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
            <Portrait
              name={composer.fullName}
              src={composer.portraitUrl}
              sizes="(max-width: 768px) 100vw, 40vw"
              className="aspect-[4/5] w-full rounded-card text-[3rem] shadow-[var(--sombra-2)]"
            />
          </Link>
          <FavoriteHeart
            type="composer"
            id={composer.id}
            name={composer.name}
            onPhoto
            className="absolute right-3 top-3"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h3 className="font-display text-[clamp(2.5rem,5.5vw,4.25rem)] leading-[0.98] tracking-[-0.02em]">
              <Link href={href} className="hover:text-ouro-texto">
                {composer.fullName}
              </Link>
              {composer.isVerified && (
                <SeloVerificada className="ml-2 inline-block h-[0.4em] w-[0.4em] align-[0.35em] text-verificado" />
              )}
            </h3>
            {meta.length > 0 && (
              <p className="t-rotulo text-texto-suave">{meta.join(' · ')}</p>
            )}
            {firstParagraph && (
              <p className="t-corpo max-w-[62ch] line-clamp-5 text-texto-suave">
                {firstParagraph}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {composer.wikipediaLink && (
                <a
                  href={composer.wikipediaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillLink}
                >
                  Wikipédia <Icon de={PiArrowSquareOut} tamanho="pp" />
                </a>
              )}
              {composer.permLinkImslp && (
                <a
                  href={composer.permLinkImslp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={pillLink}
                >
                  IMSLP <Icon de={PiArrowSquareOut} tamanho="pp" />
                </a>
              )}
            </div>
          </div>

          {composer.works.length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="t-subtitulo">{copy.works}</h4>
              <ul className="flex flex-col divide-y divide-[var(--linha)] border-y border-[var(--linha)]">
                {composer.works.slice(0, 3).map((work) => (
                  <li key={work.id} className="flex items-center gap-2">
                    <Link
                      href={`/works/${work.id}`}
                      className="min-w-0 flex-1 py-3.5 font-display text-[1.25rem] leading-snug hover:text-ouro-texto"
                    >
                      {work.title}
                    </Link>
                    <FavoriteHeart type="work" id={work.id} name={work.title} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {composer.curiosities[language].length > 0 && (
            <div className="flex flex-col gap-3">
              <h4 className="t-subtitulo">{copy.curiosities}</h4>
              <ul className="flex flex-col gap-3">
                {composer.curiosities[language].map((curiosity) => (
                  <li
                    key={curiosity.id}
                    className="flex items-start gap-3 rounded-card bg-sup-2 p-4"
                  >
                    <Icon
                      de={PiLightbulb}
                      tamanho="m"
                      className="mt-0.5 shrink-0 text-ouro-texto"
                    />
                    <span className="t-rotulo">{curiosity.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link href={href} className={classesDeBotao('primario', 'm')}>
              {copy.exploreWorks}
            </Link>
            {composer.bio && (
              <Link
                href={`${href}#bio`}
                className={classesDeBotao('fantasma', 'm')}
              >
                {copy.readBio}
              </Link>
            )}
          </div>
        </div>
      </div>
    </Revelar>
  );
}
