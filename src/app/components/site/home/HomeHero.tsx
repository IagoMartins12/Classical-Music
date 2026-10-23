import type { Idioma } from '@/app/conteudo/legal/tipos';
import { HEADER } from '@/app/conteudo/site/header';
import type { HomeCopy } from '@/app/conteudo/site/home';
import { HeaderSearch } from '../header/HeaderSearch';
import { CelestialAtlas } from './CelestialAtlas';
import { CelestialGlobe } from './CelestialGlobe';
import { HeroActions } from './HeroActions';

/**
 * The anchor of the site: Opus Atlas as the whole ecosystem of classical
 * music. Desktop (lg+) shows the atlas beside the text; phones and tablets
 * center the text over the engraved globe. One `h1`, one search, no counts.
 */
export function HomeHero({
  copy,
  language,
}: {
  copy: HomeCopy['hero'];
  language: Idioma;
}) {
  return (
    // O globo mantém o tamanho; só ganha respiro. Celular: a esfera (440 dos
    // 600 do desenho) cabe na largura com 1rem de cada lado — só o anel de
    // fora passa da tela. Tablet: a seção tem a altura da esfera (46rem × 440
    // / 600 ≈ 34rem) e mais um respiro, para o topo não encostar no cabeçalho.
    <section className="relative isolate overflow-x-clip sm:max-lg:flex sm:max-lg:min-h-[40rem] sm:max-lg:flex-col sm:max-lg:justify-center">
      <CelestialGlobe className="lg:hidden" />
      <div className="section-wrap grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-12 lg:py-12">
        <div className="flex flex-col gap-6 max-lg:items-center max-lg:text-center">
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
        </div>
        <div className="max-lg:hidden">
          <CelestialAtlas copy={copy} />
        </div>
      </div>
    </section>
  );
}
