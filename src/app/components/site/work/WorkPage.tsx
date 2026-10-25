import { MoreActions } from '../MoreActions';
import {
  CompleteInvite,
  ContributeProvider,
  type ContributionTarget,
} from '../contribute/Contribute';
import { WorkListen } from './WorkListen';
import { nomeDeTransicao } from '@/app/components/ui/nomeDeTransicao';
import Link from '@/app/components/LocalizedLink';
import { SeloVerificada } from '@/app/components/ui/SeloVerificada';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { CONTRIBUTE } from '@/app/conteudo/site/contribute';
import { WORK } from '@/app/conteudo/site/work';
import type { ComposerWork } from '@/app/requests/composer-details';
import type { WorkDetails } from '@/app/requests/work-page-details';
import type { ScoreLibrary } from '@/app/requests/work-score-library';
import { localizeHref } from '@/app/utils/localizedRoutes';
import { SITE_URL } from '@/app/utils/seoAlternates';
import { FavoriteHeart } from '../FavoriteHeart';
import { Portrait } from '../Portrait';
import { ShareAction } from '../ShareAction';
import { workTitle } from '../workTitle';
import { MoreFromComposer } from './MoreFromComposer';
import { Recommendations } from '../Recommendations';
import { StudyActions } from './StudyActions';
import { WorkLesson } from './WorkLesson';
import { WorkAnnotations } from '../annotations/WorkAnnotations';
import { WorkDetailsPanel } from './WorkDetailsPanel';
import { WorkScores } from './WorkScores';
import type { StudyContext } from './useStudy';

const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

/**
 * The work page: title and study actions, then listening, then the details
 * beside the scores (the details give way to a score preview on click),
 * annotations and more by the composer.
 */
export function WorkPage({
  work,
  scores,
  moreWorks,
  language,
}: {
  work: WorkDetails;
  scores: ScoreLibrary;
  moreWorks: ComposerWork[];
  language: Idioma;
}) {
  const copy = WORK[language];
  const title = workTitle(work.title, work.opOrCatalog);
  const composerName = work.composer.fullName || work.composer.name;
  const subtitle = [
    work.instrumentation || work.instrument?.name,
    work.compositionYear,
    work.dedicateTo && copy.dedicatedTo(work.dedicateTo),
  ]
    .filter(Boolean)
    .join(' · ');
  const context: StudyContext = {
    workId: work.id,
    workTitle: work.title,
    composerName,
    epochName: work.epoch?.name ?? work.composer.epochName ?? undefined,
    instrumentName: work.instrument?.name,
  };
  const url = `${SITE_URL}${localizeHref(`/works/${work.id}`, language)}`;
  const contribution: ContributionTarget = {
    type: 'work',
    id: work.id,
    name: CONTRIBUTE[language].workTarget,
    current: {
      compositionYear: work.compositionYear,
      tone: work.tone,
      instrumentation: work.instrumentation,
      dedicateTo: work.dedicateTo,
      firstPublishDate: work.firstPublishDate,
      subtitle: work.subtitle,
      youtubeVideoId: work.youtubeVideoId,
    },
  };
  const missing = [
    ...(work.youtubeVideoId ? [] : [{ key: 'video', kind: 'video' as const }]),
    ...(['compositionYear', 'tone', 'instrumentation'] as const)
      .filter((field) => !work[field])
      .map((key) => ({ key, kind: 'data' as const })),
  ];

  return (
    <ContributeProvider target={contribution}>
      <article className="section-wrap py-10 md:py-14">
        <nav
          aria-label={composerName}
          className="t-rotulo mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-texto-fraco"
        >
          <Link
            href={`/composer/${work.composer.id}`}
            className={`flex items-center gap-2 ${textLink}`}
          >
            {/* The composer's portrait turns into the composer page's. */}
            <Portrait
              name={composerName}
              src={work.composer.portraitUrl}
              sizes="32px"
              decorative
              vira={`compositor-${work.composer.id}`}
              className="h-7 w-7 rounded-full text-[0.4375rem]"
            />
            {composerName}
          </Link>
          {work.parentWork && (
            <>
              <span aria-hidden="true">/</span>
              <span>
                {copy.partOf}{' '}
                <Link
                  href={`/works/${work.parentWork.id}`}
                  className={textLink}
                >
                  {work.parentWork.title}
                </Link>
              </span>
            </>
          )}
        </nav>

        {/* The card clicked in a list turns into this header (CartoesQueViram). */}
        <header
          className="grid grid-cols-1 gap-8 min-[728px]:grid-cols-[minmax(0,1fr)_auto] min-[728px]:items-end lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]"
          style={nomeDeTransicao(`obra-${work.id}`, 'cartao')}
        >
          <div className="flex flex-col gap-5">
            <h1 className="font-display text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[0.98] tracking-[-0.02em] [overflow-wrap:anywhere]">
              {title}
              {work.isVerified && (
                <SeloVerificada
                  desenhar
                  className="ml-2 inline-block h-[0.42em] w-[0.42em] align-[0.12em] text-verificado"
                />
              )}
            </h1>
            {work.subtitle && (
              <p className="font-display text-[1.375rem] text-texto-suave">
                {work.subtitle}
              </p>
            )}
            {subtitle && (
              <p className="t-corpo max-w-[60ch] text-texto-suave">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <StudyActions context={context} />
            {/* No celular, esta linha ocupa a mesma largura das abas de estudo. */}
            <div className="flex flex-nowrap items-center gap-2 max-sm:gap-1.5">
              <FavoriteHeart
                type="work"
                id={work.id}
                name={work.title}
                withLabel
                className="max-[727px]:flex-1"
              />
              <ShareAction
                className="max-[727px]:flex-1"
                title={`${title} — ${composerName}`}
                url={url}
                image={work.composer.portraitUrl}
                imageName={composerName}
              />
              <MoreActions
                type="work"
                id={work.id}
                name={title}
                verified={work.isVerified}
              />
            </div>
          </div>
        </header>

        <WorkScores
          initial={scores}
          context={context}
          details={
            <div className="flex flex-col gap-8">
              <WorkDetailsPanel work={work} language={language} copy={copy} />
              <CompleteInvite missing={missing} />
            </div>
          }
        />

        {/* Right after the scores: what to study next (Plus). */}
        <Recommendations
          source={{ kind: 'work', workId: work.id }}
          className="mt-20"
        />

        {/* Below the scores, above the notes: first the score, then how it
            sounds, then what people wrote about it. */}
        <section className="mt-20 flex flex-col gap-6">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{copy.listen}</h2>
          <WorkListen work={work} />
        </section>

        <div className="mt-20">
          <WorkAnnotations workId={work.id} />
        </div>

        <section className="mt-20">
          <WorkLesson work={work} />
        </section>

        <MoreFromComposer
          composer={{ id: work.composer.id, name: work.composer.name }}
          works={moreWorks}
          language={language}
          copy={copy}
        />
      </article>
    </ContributeProvider>
  );
}
