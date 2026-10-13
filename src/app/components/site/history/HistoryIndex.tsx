import { PiArrowDown, PiArrowRight } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { eraChapter } from '@/app/conteudo/history';
import { ERAS, eraYears } from '@/app/conteudo/site/eras';
import { LEARN } from '@/app/conteudo/site/learn';
import { EraTabs } from './EraTabs';

/** The history of music: an opening, the era tabs and one entry per era. */
export function HistoryIndex({ language }: { language: Idioma }) {
  const copy = LEARN[language].history;
  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap grid grid-cols-1 gap-6 py-14 md:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
          <h1 className="rise font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.02em]">
            {copy.title}
          </h1>
          <div
            className="rise flex flex-col gap-4"
            style={{ ['--delay' as string]: '90ms' }}
          >
            <p className="t-corpo text-texto-suave">{copy.text}</p>
            <Link
              href="/music-history/medieval"
              className={`${classesDeBotao('primario')} self-start`}
            >
              <Icon de={PiArrowDown} /> {copy.startAtStart}
            </Link>
          </div>
        </div>
      </section>

      <EraTabs language={language} label={copy.eras} />

      <ol className="section-wrap flex flex-col divide-y divide-[var(--linha)] py-6">
        {ERAS.map((era, i) => {
          const chapter = eraChapter(era.key, language);
          return (
            <li key={era.key}>
              <Link
                href={`/music-history/${era.key}`}
                className="group grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 py-8 sm:gap-10"
              >
                <span
                  data-vira={`epoca-${era.key}`}
                  className="relative block aspect-[3/4] w-24 overflow-hidden rounded-card shadow-[var(--sombra-1)] sm:w-36"
                >
                  <Image
                    src={era.image}
                    alt=""
                    fill
                    sizes="144px"
                    // The first two covers are above the fold on phones.
                    priority={i < 2}
                    className="object-cover transition-transform duration-[var(--t-resposta)] group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex min-w-0 flex-col gap-2">
                  <span className="t-dado text-[0.9375rem] text-ouro-texto">
                    {eraYears(era, language)}
                  </span>
                  <span className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none group-hover:text-ouro-texto">
                    {era.name[language]}
                  </span>
                  <span className="t-corpo line-clamp-3 max-w-[64ch] text-texto-suave max-sm:hidden">
                    {chapter?.lede}
                  </span>
                  <span className="inline-flex items-center gap-1.5 t-rotulo text-ouro-texto">
                    {copy.readChapter} <Icon de={PiArrowRight} tamanho="pp" />
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
