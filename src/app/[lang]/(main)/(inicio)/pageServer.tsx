import { DiscoverSection } from '@/app/components/site/home/DiscoverSection';
import { ErasCarousel } from '@/app/components/site/home/ErasCarousel';
import { FeaturedComposer } from '@/app/components/site/home/FeaturedComposer';
import { HomeHero } from '@/app/components/site/home/HomeHero';
import { MusicalFacts } from '@/app/components/site/home/MusicalFacts';
import { PlansCallout } from '@/app/components/site/home/PlansCallout';
import { PopularComposers } from '@/app/components/site/home/PopularComposers';
import { UpcomingConcerts } from '@/app/components/site/home/UpcomingConcerts';
import { workTitle } from '@/app/components/site/workTitle';
import { HOME } from '@/app/conteudo/site/home';
import { loadCalendar } from '@/app/requests/calendar-requests';
import {
  getCachedFeaturedComposer,
  getCachedMusicalFacts,
  getCachedRandomDiscoveries,
  getCachedRecentAdditions,
  getCachedTop20FamousComposers,
} from '@/app/requests/cached-requests/cached-home-functions';
import type { Language } from '@/app/utils/translations/serverTranslations';

const CONCERT_WINDOW_DAYS = 60;
const CONCERTS_SHOWN = 4;

/**
 * The next concerts. The window starts at today's midnight (UTC) so the
 * request — and its cache entry — stays the same for the whole day.
 */
async function upcomingConcerts() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + CONCERT_WINDOW_DAYS);
  try {
    const { events } = await loadCalendar(start, end);
    const now = Date.now();
    return events
      .filter((event) => event.end.getTime() >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, CONCERTS_SHOWN);
  } catch {
    return [];
  }
}

/**
 * The home page. The language comes from the `[lang]` segment (never a
 * cookie, which would make the page dynamic and switch its cache off).
 * Every block is fetched in parallel; each request carries its own cache
 * tag, revalidated by the API when the data changes.
 */
export default async function HomePage({ language }: { language: Language }) {
  const copy = HOME[language];
  const [popular, featured, discoveries, recent, facts, concerts] =
    await Promise.all([
      getCachedTop20FamousComposers(),
      getCachedFeaturedComposer(),
      getCachedRandomDiscoveries(),
      getCachedRecentAdditions(),
      getCachedMusicalFacts(),
      upcomingConcerts(),
    ]);

  const bach = popular.find((c) => c.name === 'Bach') ?? popular[0];

  return (
    <div className="classical-theme">
      <HomeHero
        copy={copy.hero}
        language={language}
        composerPortrait={
          bach && { name: bach.fullName, src: bach.portraitUrl }
        }
      />
      <PopularComposers
        copy={copy.popular}
        language={language}
        composers={popular}
      />
      {featured && (
        <FeaturedComposer
          copy={copy.featured}
          language={language}
          composer={featured}
        />
      )}
      <ErasCarousel copy={copy.eras} language={language} />
      <UpcomingConcerts
        copy={copy.concerts}
        language={language}
        events={concerts}
      />
      <MusicalFacts copy={copy.facts} language={language} initial={facts} />
      <DiscoverSection
        copy={copy.discover}
        language={language}
        random={{
          composers: discoveries.composers,
          works: discoveries.works.map((w) => ({
            id: w.id,
            title: workTitle(w.title, w.opOrCatalog),
            composerName: w.composerName,
            detail: w.instrumentName,
          })),
        }}
        recent={{
          composers: recent.composers,
          works: recent.works.map((w) => ({
            id: w.id,
            title: w.title,
            composerName: w.composer.fullName,
            detail: w.instrument.name,
          })),
        }}
      />
      <PlansCallout copy={copy.plans} />
    </div>
  );
}
