import { MoreActions } from '../MoreActions';
import { nomeDeTransicao } from '@/app/components/ui/nomeDeTransicao';
import { PiArrowSquareOut } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { COMPOSER } from '@/app/conteudo/site/composer';
import { eraName } from '@/app/conteudo/site/eras';
import type { BlogArticlePreview } from '@/app/requests/blog/composer-articles';
import type { Contribution, Curiosity } from '@/app/requests/contributions';
import type {
  ComposerDetails,
  ComposerFilterOptions,
  ComposerOverview,
  ComposerWorksResponse,
} from '@/app/requests/composer-details';
import { localizeHref } from '@/app/utils/localizedRoutes';
import { SITE_URL } from '@/app/utils/seoAlternates';
import { FavoriteHeart } from '../FavoriteHeart';
import { youtubeId } from '../youtube';
import { Portrait } from '../Portrait';
import { ShareAction } from '../ShareAction';
import { AlternativeNames } from './AlternativeNames';
import { BiographyText } from './BiographyText';
import { ContributionCredit } from '../contribute/ContributionCredit';
import {
  CompleteInvite,
  ContributeProvider,
  type ContributionTarget,
  WrongOnThisPage,
} from '../contribute/Contribute';
import { BiographyWriter } from './BiographyWriter';
import { ComposerCatalog } from './ComposerCatalog';
import { ComposerFacts } from './ComposerFacts';
import { Contemporaries } from './Contemporaries';
import { FurtherReading } from './FurtherReading';
import { StartingPoints } from './StartingPoints';
import { WatchAndCuriosities } from './WatchAndCuriosities';

const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

/** "Fryderyk Franciszek Chopin, (pl), …" → readable names only. */
function splitNames(raw: string | undefined, shown: string[]) {
  if (!raw) return [];
  const seen = new Set(shown.map((n) => n.toLowerCase()));
  return raw
    .split(/[,;]/)
    .map((n) =>
      n
        .replace(/\([^)]*\)/g, '')
        .replace(/[.\s]+$/, '')
        .trim()
    )
    .filter((n) => {
      const key = n.toLowerCase();
      if (n.length < 2 || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * The composer profile: portrait column on the left (sticky from tablet up),
 * the story on the right, then video, catalog, reading and contemporaries.
 * Every section is born from data: nothing on record, nothing rendered.
 */
export function ComposerPage({
  composer,
  overview,
  works,
  filterOptions,
  articles,
  curiosities,
  contributions,
  language,
}: {
  composer: ComposerDetails;
  overview: ComposerOverview;
  works: ComposerWorksResponse;
  filterOptions: ComposerFilterOptions;
  articles: BlogArticlePreview[];
  curiosities: Curiosity[];
  contributions: Contribution[];
  language: Idioma;
}) {
  const copy = COMPOSER[language];
  const fullName = composer.fullName || composer.name;
  const [first, last] = [
    fullName.split(' ').slice(0, -1).join(' '),
    fullName.split(' ').slice(-1)[0],
  ];
  const bio = language === 'pt' ? composer.bio : composer.bioEn;
  const era = eraName(composer.epochName, language);
  // The newest live contribution of each kind is the one on screen.
  const bioCredit =
    contributions.find(
      (c) =>
        c.kind === 'BIO' && c.field === (language === 'en' ? 'bioEn' : 'bio')
    ) ?? null;
  const videoCredit = contributions.find((c) => c.kind === 'VIDEO') ?? null;
  const contribution: ContributionTarget = {
    type: 'composer',
    id: composer.id,
    name: composer.name || fullName,
    current: {
      // Only the page's language: the sheet edits that one.
      [language === 'en' ? 'bioEn' : 'bio']: bio,
      videoUrl: composer.videoUrl,
      birthDate: composer.birthDate,
      deathDate: composer.deathDate,
      nationality: composer.nationality,
      wikipediaLink: composer.wikipediaLink,
    },
  };
  const missing = [
    !bio && { key: 'bio', kind: 'bio' as const },
    !composer.videoUrl && { key: 'video', kind: 'video' as const },
    !curiosities.length && { key: 'curiosity', kind: 'curiosity' as const },
  ].filter((m) => !!m);
  const url = `${SITE_URL}${localizeHref(`/composer/${composer.id}`, language)}`;
  const external = [
    composer.wikipediaLink && [
      language === 'pt' ? 'Wikipédia' : 'Wikipedia',
      composer.wikipediaLink,
    ],
    composer.permLinkImslp && ['IMSLP', composer.permLinkImslp],
  ].filter(Boolean) as [string, string][];

  return (
    <ContributeProvider target={contribution}>
      <article className="section-wrap py-10 md:py-14">
        <nav
          aria-label={copy.breadcrumb}
          className="t-rotulo mb-8 text-texto-fraco"
        >
          <Link href="/composers" className={textLink}>
            {copy.breadcrumb}
          </Link>
          {era && (
            <>
              {' '}
              <span aria-hidden="true">/</span> {era}
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <aside className="flex flex-col gap-6 md:sticky md:top-24 md:self-start">
            {/* The card clicked in a list turns into this portrait (CartoesQueViram). */}
            <div
              className="relative"
              style={nomeDeTransicao(`compositor-${composer.id}`, 'cartao')}
            >
              <Portrait
                name={fullName}
                src={composer.portraitUrl}
                priority
                fromCard
                sizes="(max-width: 768px) 100vw, 40vw"
                className="aspect-[4/5] w-full rounded-card text-[3rem] shadow-[var(--sombra-2)]"
              />
              <FavoriteHeart
                type="composer"
                id={composer.id}
                name={composer.name}
                onPhoto
                className="absolute right-3 top-3"
              />
            </div>
            {external.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {external.map(([label, href]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-ouro-texto"
                  >
                    {label} <Icon de={PiArrowSquareOut} tamanho="pp" />
                  </a>
                ))}
              </div>
            )}
          </aside>

          <div className="flex min-w-0 flex-col gap-10">
            <header className="flex flex-col gap-5">
              <h1 className="font-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em]">
                {first && `${first} `}
                <span className="whitespace-nowrap">
                  {last}
                  {composer.isVerified && (
                    <SeloVerificada
                      desenhar
                      className="ml-2 inline-block h-[0.42em] w-[0.42em] align-[0.35em] text-verificado"
                    />
                  )}
                </span>
              </h1>
              <ComposerFacts
                composer={composer}
                writtenFor={overview.writtenFor}
                language={language}
                copy={copy.facts}
              />
              <AlternativeNames
                names={splitNames(composer.alternativeNames, [
                  fullName,
                  composer.name,
                ])}
              />
              {/* Uma linha só: os três pontos não descem para a linha de baixo no celular. */}
              <div className="flex flex-nowrap items-center gap-2 max-sm:gap-1.5">
                <FavoriteHeart
                  type="composer"
                  id={composer.id}
                  name={composer.name}
                  withLabel
                />
                <ShareAction
                  title={fullName}
                  url={url}
                  image={composer.portraitUrl}
                  imageName={fullName}
                />
                <MoreActions
                  type="composer"
                  id={composer.id}
                  name={fullName}
                  verified={!!composer.isVerified}
                />
              </div>
            </header>

            <section className="flex flex-col gap-4">
              <h2 className="sr-only">{copy.bio.heading}</h2>
              {bio ? (
                <>
                  <BiographyText
                    text={bio}
                    aiNote={
                      composer.bioTranslatedFrom &&
                      composer.bioTranslatedFrom !== language
                        ? copy.bio.translatedNote
                        : composer.bioGeneratedByAi
                          ? composer.bioReviewed
                            ? copy.bio.aiReviewedNote
                            : copy.bio.aiNote
                          : null
                    }
                  />
                  {bioCredit && (
                    <ContributionCredit
                      contribution={bioCredit}
                      name={copy.bio.heading}
                    />
                  )}
                </>
              ) : (
                <BiographyWriter
                  composerId={composer.id}
                  name={composer.name}
                />
              )}
            </section>

            <StartingPoints
              works={overview.startingPoints}
              language={language}
            />
            <CompleteInvite missing={missing} />
          </div>
        </div>

        <WatchAndCuriosities
          composerId={composer.id}
          videoId={youtubeId(composer.videoUrl)}
          videoCredit={videoCredit}
          title={fullName}
          name={composer.name || fullName}
          curiosities={curiosities}
          copy={copy}
        />

        <ComposerCatalog
          composerId={composer.id}
          name={composer.name}
          initial={works}
          options={filterOptions}
        />

        <FurtherReading articles={articles} copy={copy.reading} />

        <Contemporaries
          composers={overview.contemporaries}
          language={language}
          copy={copy.sameTime}
        />

        <WrongOnThisPage uploadHref="/upload" />
      </article>
    </ContributeProvider>
  );
}
