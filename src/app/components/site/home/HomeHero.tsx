import type { Idioma } from '@/app/conteudo/legal/tipos';
import { HEADER } from '@/app/conteudo/site/header';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { HeaderSearch } from '../header/HeaderSearch';
import { CelestialAtlas } from './CelestialAtlas';
import { CelestialGlobe } from './CelestialGlobe';
import { HeroActions } from './HeroActions';

/**
 * The anchor of the site: Opus Atlas as the whole ecosystem of classical
 * music. Tablet and desktop show the atlas beside the text; phones center
 * the text over the engraved globe. One `h1`, one search, no counts.
 */
export function HomeHero({
  copy,
  language,
  composerPortrait,
}: {
  copy: HomeCopy['hero'];
  language: Idioma;
  composerPortrait?: { name: string; src: string | null };
}) {
  return (
    <section className="relative isolate overflow-x-clip">
      <CelestialGlobe className="md:hidden" />
      <div className="section-wrap grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:py-12 lg:gap-12">
        <div className="flex flex-col gap-6 max-md:items-center max-md:text-center">
          <h1 className="entra max-w-[14ch] text-balance font-display text-[clamp(2.5rem,5.2vw,4.25rem)] leading-[0.98] tracking-[-0.02em]">
            {copy.title}
          </h1>
          <p
            className="entra max-w-[52ch] t-corpo text-texto-suave"
            style={{ ['--i' as string]: 1 }}
          >
            {copy.text}
          </p>
          <div
            className="entra flex w-full max-w-xl flex-col gap-4"
            style={{ ['--i' as string]: 2 }}
          >
            <HeaderSearch
              copy={HEADER[language].search}
              language={language}
              variant="hero"
            />
            <HeroActions copy={copy} />
          </div>
          <p className="entra t-legenda" style={{ ['--i' as string]: 3 }}>
            {copy.freeNote}
          </p>
        </div>
        <div className="max-md:hidden">
          <CelestialAtlas copy={copy} composerPortrait={composerPortrait} />
        </div>
      </div>
    </section>
  );
}
