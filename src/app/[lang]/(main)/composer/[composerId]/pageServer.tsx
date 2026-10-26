import { notFound } from 'next/navigation';
import { JsonLd } from '@/app/components/site/JsonLd';
import { composerJsonLd } from './jsonLd';
import { ComposerPage } from '@/app/components/site/composer/ComposerPage';
import { getComposerArticles } from '@/app/requests/blog/composer-articles';
import {
  composerCuriosities,
  entityContributions,
} from '@/app/requests/contributions';
import {
  getComposerById,
  getComposerFilterOptions,
  getComposerOverview,
  getComposerWorksWithFilters,
} from '@/app/requests/composer-details';
import type { Language } from '@/app/utils/translations/serverTranslations';

/** First page of the catalog, rendered on the server. */
const FIRST_PAGE = 30;

/**
 * The composer comes first, alone: it decides whether the page exists. In a
 * `Promise.all`, an unknown id made the other requests 404 and the page a 500
 * instead of "not found". The extra round trip only happens on a cold render.
 *
 * No `catch` that turns failures into `notFound()`: a 404 gets cached, so an
 * API hiccup would index the composer as missing. Errors surface as 500.
 *
 * The session is not read here (it would make the page dynamic); curator
 * actions are decided in the browser.
 */
export default async function ComposerDetailsServer({
  composerId,
  language,
}: {
  composerId: string;
  language: Language;
}) {
  const composer = await getComposerById(composerId);
  if (!composer) notFound();

  const [
    overview,
    works,
    filterOptions,
    { articles },
    curiosities,
    contributions,
  ] = await Promise.all([
    getComposerOverview(composerId),
    getComposerWorksWithFilters(composerId, 1, FIRST_PAGE),
    getComposerFilterOptions(composerId),
    getComposerArticles(composerId, 6, language),
    composerCuriosities(composerId, language),
    entityContributions('composer', composerId),
  ]);

  return (
    <>
      <JsonLd data={composerJsonLd(composer)} />
      <ComposerPage
        composer={composer}
        overview={overview}
        works={works}
        filterOptions={filterOptions}
        articles={articles}
        curiosities={curiosities}
        contributions={contributions}
        language={language}
      />
    </>
  );
}
