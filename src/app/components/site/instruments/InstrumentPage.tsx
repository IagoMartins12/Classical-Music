import { nomeDeTransicao } from '@/app/components/ui/nomeDeTransicao';
import {
  PiArrowLeft,
  PiArrowRight,
  PiLightbulb,
  PiMagnifyingGlass,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import {
  FAMILIES,
  INSTRUMENTS,
  instrumentChapter,
  type InstrumentMeta,
} from '@/app/conteudo/instruments';
import { LEARN } from '@/app/conteudo/site/learn';
import { getCatalogFilterOptions } from '@/app/requests/catalog-lists';

/**
 * One instrument: what it is and how it works, its story and milestones,
 * what was written for it and where to start listening.
 */
export async function InstrumentPage({
  meta,
  language,
  credit,
}: {
  meta: InstrumentMeta;
  language: Idioma;
  credit?: string;
}) {
  const copy = LEARN[language];
  const t = copy.instruments;
  const chapter = instrumentChapter(meta.key, language);
  if (!chapter) return null;

  const options = await getCatalogFilterOptions();
  const instrumentId = meta.dbNames
    .map((name) => options.instruments.find((i) => i.name === name)?.id)
    .find(Boolean);

  const index = INSTRUMENTS.indexOf(meta);
  const before = INSTRUMENTS[index - 1];
  const after = INSTRUMENTS[index + 1];
  const siblings = INSTRUMENTS.filter(
    (m) => m.family === meta.family && m.key !== meta.key
  );

  return (
    <article className="section-wrap flex flex-col gap-16 py-12">
      <header className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-center lg:gap-14">
        {/* The card clicked on the index turns into this drawing (CartoesQueViram). */}
        <span
          className="relative block aspect-[4/5]"
          style={nomeDeTransicao(`instrumento-${meta.key}`, 'cartao')}
        >
          <Image
            src={meta.image}
            alt={chapter.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-contain p-2"
          />
        </span>
        <div className="flex flex-col gap-5">
          <nav aria-label={t.families} className="t-rotulo text-texto-fraco">
            <Link
              href={`/instruments#${meta.family}`}
              className="underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
            >
              {FAMILIES[meta.family][language]}
            </Link>
          </nav>
          <h1 className="font-display text-[clamp(3rem,8vw,6rem)] leading-[0.92] tracking-[-0.02em]">
            {chapter.name}
          </h1>
          <p className="t-dado text-ouro-texto">{chapter.when}</p>
          <p className="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] leading-snug">
            {chapter.lede}
          </p>
          {instrumentId && (
            <Link
              href={`/works?instrument=${instrumentId}`}
              className={`${classesDeBotao('primario')} self-start`}
            >
              {t.worksFor(chapter.name)} <Icon de={PiArrowRight} />
            </Link>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="flex flex-col gap-10">
          <section className="flex flex-col gap-3 rounded-card bg-sup-2 p-6">
            <h2 className="t-legenda">{t.howItWorks}</h2>
            <p className="t-corpo">{chapter.howItWorks}</p>
          </section>
          <section className="flow-root space-y-5">
            <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.story}</h2>
            {chapter.story.map((paragraph, i) => (
              <div key={i} className="space-y-5">
                <p
                  className={
                    i === 0
                      ? 't-corpo drop-cap max-w-[64ch]'
                      : 't-corpo max-w-[64ch]'
                  }
                >
                  {paragraph}
                </p>
                {i === 0 && (
                  <figure className="flex flex-col gap-2 sm:float-right sm:mb-2 sm:ml-8 sm:w-64">
                    <span className="relative block aspect-square">
                      <Image
                        src={meta.photo}
                        alt={chapter.name}
                        fill
                        sizes="(max-width: 640px) 100vw, 256px"
                        className="object-contain"
                      />
                    </span>
                    {credit && (
                      <figcaption className="t-legenda">
                        {t.imageCredit}: {credit}
                      </figcaption>
                    )}
                  </figure>
                )}
              </div>
            ))}
          </section>
          <section className="flex flex-col gap-3">
            <h2 className="t-subtitulo">{t.repertoire}</h2>
            <p className="t-corpo max-w-[64ch] text-texto-suave">
              {chapter.repertoire}
            </p>
          </section>
        </div>
        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <h2 className="t-legenda">{t.timeline}</h2>
          <ol className="relative flex flex-col gap-5 pl-7 before:absolute before:bottom-2 before:left-[0.4rem] before:top-2 before:w-px before:bg-[var(--linha-forte)]">
            {chapter.timeline.map((step, i) => (
              <li key={step.year} className="relative flex flex-col gap-0.5">
                <span
                  aria-hidden="true"
                  className={
                    i === chapter.timeline.length - 1
                      ? 'absolute -left-7 top-1.5 h-3.5 w-3.5 rounded-full fill-ouro'
                      : 'absolute -left-7 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--linha-forte)] bg-[var(--fundo)]'
                  }
                />
                <span className="t-dado text-[0.875rem] text-ouro-texto">
                  {step.year}
                </span>
                <span className="t-rotulo">{step.text}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>

      <section className="flex flex-col gap-6">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.listen}</h2>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {chapter.listenFirst.map((item, i) => (
            <li key={item.work}>
              <Link
                href={`/search?q=${encodeURIComponent(`${item.work} ${item.composer}`)}`}
                className="group flex h-full gap-4 rounded-card bg-sup-2 p-5"
              >
                <span className="font-display text-[1.75rem] leading-none text-texto-fraco">
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-[1.25rem] leading-snug group-hover:text-ouro-texto">
                    {item.work}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {item.composer}
                  </span>
                  <span className="t-rotulo mt-1">{item.note}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 t-legenda text-ouro-texto">
                    <Icon de={PiMagnifyingGlass} tamanho="pp" />{' '}
                    {copy.searchListen}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.didYouKnow}</h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {chapter.didYouKnow.map((fact) => (
            <li key={fact} className="flex gap-4 rounded-card bg-sup-2 p-5">
              <Icon
                de={PiLightbulb}
                tamanho="m"
                className="mt-0.5 text-ouro-texto"
              />
              <span className="t-rotulo">{fact}</span>
            </li>
          ))}
        </ul>
      </section>

      {siblings.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="t-subtitulo">{t.others}</h2>
          <ul className="flex flex-wrap gap-2">
            {siblings.map((m) => (
              <li key={m.key}>
                <Link
                  href={`/instruments/${m.key}`}
                  className="inline-flex min-h-10 items-center rounded-full bg-sup-2 px-4 text-[0.9375rem] hover:text-ouro-texto"
                >
                  {instrumentChapter(m.key, language)?.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label={t.others} className="grid grid-cols-2 gap-3">
        {before ? (
          <Link
            href={`/instruments/${before.key}`}
            rel="prev"
            className="group flex flex-col items-start gap-1 rounded-card bg-sup-2 p-5"
          >
            <span className="inline-flex items-center gap-1.5 t-legenda">
              <Icon de={PiArrowLeft} tamanho="pp" />{' '}
              {FAMILIES[before.family][language]}
            </span>
            <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
              {instrumentChapter(before.key, language)?.name}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {after && (
          <Link
            href={`/instruments/${after.key}`}
            rel="next"
            className="group flex flex-col items-end gap-1 rounded-card bg-sup-2 p-5 text-right"
          >
            <span className="inline-flex items-center gap-1.5 t-legenda">
              {FAMILIES[after.family][language]}{' '}
              <Icon de={PiArrowRight} tamanho="pp" />
            </span>
            <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
              {instrumentChapter(after.key, language)?.name}
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
}
