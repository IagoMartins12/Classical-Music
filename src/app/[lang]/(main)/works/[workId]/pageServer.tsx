import { notFound } from 'next/navigation';
import { WorkPage } from '@/app/components/site/work/WorkPage';
import { getComposerWorksWithFilters } from '@/app/requests/composer-details';
import { getWorkById } from '@/app/requests/work-page-details';
import { getWorkScoreLibrary } from '@/app/requests/work-score-library';
import { type Language } from '@/app/utils/translations/serverTranslations';

const MORE_WORKS = 4;

/**
 * The work comes first, alone: it decides whether the page exists (an unknown
 * id must be a 404, not a 500 from a sibling request). Failures surface as
 * 500 on purpose — a cached 404 during an API hiccup would deindex the work.
 *
 * The session is not read here (it would make the page dynamic); study state
 * and curator actions are decided in the browser.
 *
 * The translation provider only serves the media and annotation blocks,
 * which still read the legacy `pages/workId` dictionary.
 */
export default async function WorkDetailsServer({
  workId,
  language,
}: {
  workId: string;
  language: Language;
}) {
  const work = await getWorkById(workId);
  if (!work) notFound();

  const [scores, siblings] = await Promise.all([
    getWorkScoreLibrary(workId),
    getComposerWorksWithFilters(work.composer.id, 1, MORE_WORKS + 1).catch(
      () => null
    ),
  ]);
  const moreWorks = (siblings?.works ?? [])
    .filter((w) => w.id !== work.id)
    .slice(0, MORE_WORKS);

  return (
    <WorkPage
      work={work}
      scores={scores}
      moreWorks={moreWorks}
      language={language}
    />
  );
}
