import {
  PiArrowLeft,
  PiArrowRight,
  PiLightbulb,
  PiMagnifyingGlass,
} from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { Icon } from '@/app/components/ui/Icon';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { eraChapter } from '@/app/conteudo/history';
import { instrumentKeyForName } from '@/app/conteudo/instruments';
import { ERAS, eraOf, eraYears, type Era } from '@/app/conteudo/site/eras';
import { LEARN } from '@/app/conteudo/site/learn';
import {
  getCatalogFilterOptions,
  listComposers,
} from '@/app/requests/catalog-lists';
import { EraTabs } from './EraTabs';
import { LifeRuler } from './LifeRuler';

const RULER_SIZE = 10;
const textLink =
  'underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]';

/**
 * One era: the opening, the story, how it sounds, what changed, its forms
 * and instruments, who lived in it, where to start listening and a few
 * facts, then the eras before and after.
 */
export async function EraChapterPage({
  era,
  language,
}: {
  era: Era;
  language: Idioma;
}) {
  const copy = LEARN[language];
  const t = copy.history;
  const chapter = eraChapter(era.key, language);
  if (!chapter) return null;

  const options = await getCatalogFilterOptions();
  const epochId = options.epochs.find(
    (epoch) => eraOf(epoch.name)?.key === era.key
  )?.id;
  const people = epochId
    ? (
        await listComposers({
          page: 1,
          sort: 'featured',
          epochId,
          withPortrait: true,
        })
      ).composers.slice(0, RULER_SIZE)
    : [];

  const index = ERAS.indexOf(era);
  const before = ERAS[index - 1];
  const after = ERAS[index + 1];

  return (
    <div className="flex flex-col">
      <EraTabs active={era.key} language={language} label={t.eras} />

      <article className="section-wrap flex flex-col gap-16 py-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)] items-end gap-6 sm:gap-10">
          <span className="relative block aspect-[3/4] w-28 overflow-hidden rounded-card shadow-[var(--sombra-2)] sm:w-44">
            <Image
              src={era.image}
              alt=""
              fill
              priority
              sizes="176px"
              className="object-cover"
            />
          </span>
          <span className="flex flex-col gap-1">
            <span className="t-dado text-[0.9375rem] text-ouro-texto">
              {eraYears(era, language)}
            </span>
            <h1 className="font-display text-[clamp(2.75rem,8vw,6rem)] leading-[0.92] tracking-[-0.02em]">
              {era.name[language]}
            </h1>
          </span>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="flex flex-col gap-6">
            <p className="font-display text-[clamp(1.375rem,2.4vw,1.75rem)] leading-snug">
              {chapter.lede}
            </p>
            {chapter.story.map((paragraph, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? 't-corpo drop-cap max-w-[64ch]'
                    : 't-corpo max-w-[64ch]'
                }
              >
                {paragraph}
              </p>
            ))}
          </div>
          <aside className="flex flex-col gap-8 lg:sticky lg:top-36 lg:self-start">
            <section className="flex flex-col gap-3 rounded-card bg-sup-2 p-6">
              <h2 className="t-legenda">{t.sound}</h2>
              <p className="font-display text-[1.25rem] leading-snug">
                {chapter.sound}
              </p>
            </section>
            <section className="flex flex-col gap-3">
              <h2 className="t-legenda">{t.instruments}</h2>
              <ul className="flex flex-wrap gap-2">
                {chapter.instruments.map((name) => {
                  const key = instrumentKeyForName(name, language);
                  const chip =
                    'inline-flex min-h-9 items-center rounded-full bg-sup-2 px-3.5 text-[0.875rem]';
                  return (
                    <li key={name}>
                      {key ? (
                        <Link
                          href={`/instruments/${key}`}
                          className={`${chip} text-texto hover:text-ouro-texto`}
                        >
                          {name}
                        </Link>
                      ) : (
                        <span className={`${chip} text-texto-suave`}>
                          {name}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>
        </div>

        <section className="flex flex-col gap-6">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.changes}</h2>
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {chapter.changes.map((change, i) => (
              <li
                key={change.title}
                className="flex gap-4 rounded-card bg-sup-2 p-5"
              >
                <span className="font-display text-[1.75rem] leading-none text-texto-fraco">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="font-display text-[1.3125rem] leading-snug">
                    {change.title}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {change.text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.forms}</h2>
          <dl className="grid grid-cols-1 gap-x-10 divide-y divide-[var(--linha)] md:grid-cols-2 md:divide-y-0">
            {chapter.forms.map((form) => (
              <div
                key={form.name}
                className="flex flex-col gap-1 border-[var(--linha)] py-4 md:border-b"
              >
                <dt className="font-display text-[1.25rem]">{form.name}</dt>
                <dd className="t-rotulo text-texto-suave">{form.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        {people.length > 0 && (
          <section className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.people}</h2>
                <p className="t-rotulo text-texto-suave">{t.peopleText}</p>
              </div>
              {epochId && (
                <Link
                  href={`/composers?epoch=${epochId}`}
                  className={`inline-flex items-center gap-1.5 t-rotulo text-ouro-texto ${textLink}`}
                >
                  {t.composers} <Icon de={PiArrowRight} tamanho="pp" />
                </Link>
              )}
            </div>
            <LifeRuler
              era={era}
              composers={people}
              language={language}
              todayLabel={t.today}
            />
          </section>
        )}

        <section className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.listen}</h2>
            {epochId && (
              <Link
                href={`/works?epoch=${epochId}`}
                className={`inline-flex items-center gap-1.5 t-rotulo text-ouro-texto ${textLink}`}
              >
                {t.works} <Icon de={PiArrowRight} tamanho="pp" />
              </Link>
            )}
          </div>
          <ol className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {chapter.listenFirst.map((item, i) => (
              <li key={item.work}>
                <Link
                  href={`/search?q=${encodeURIComponent(`${item.work} ${item.composer === 'Anônimo' || item.composer === 'Anonymous' ? '' : item.composer}`.trim())}`}
                  className="group flex h-full flex-col gap-2 rounded-card bg-sup-2 p-5"
                >
                  <span className="t-dado text-[0.8125rem] text-texto-fraco">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-display text-[1.25rem] leading-snug group-hover:text-ouro-texto">
                    {item.work}
                  </span>
                  <span className="t-rotulo text-texto-suave">
                    {item.composer}
                  </span>
                  <span className="t-rotulo mt-1">{item.note}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 t-legenda text-ouro-texto">
                    <Icon de={PiMagnifyingGlass} tamanho="pp" />{' '}
                    {copy.searchListen}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="t-titulo max-sm:!text-[1.75rem]">{t.didYouKnow}</h2>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {chapter.didYouKnow.map((fact) => (
              <li
                key={fact}
                className="flex flex-col gap-3 rounded-card bg-sup-2 p-5"
              >
                <Icon
                  de={PiLightbulb}
                  tamanho="m"
                  className="text-ouro-texto"
                />
                <span className="t-rotulo">{fact}</span>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label={t.eras} className="grid grid-cols-2 gap-3">
          {before ? (
            <Link
              href={`/music-history/${before.key}`}
              rel="prev"
              className="group flex flex-col items-start gap-1 rounded-card bg-sup-2 p-5"
            >
              <span className="inline-flex items-center gap-1.5 t-legenda">
                <Icon de={PiArrowLeft} tamanho="pp" /> {t.before}
              </span>
              <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
                {before.name[language]}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {after && (
            <Link
              href={`/music-history/${after.key}`}
              rel="next"
              className="group flex flex-col items-end gap-1 rounded-card bg-sup-2 p-5 text-right"
            >
              <span className="inline-flex items-center gap-1.5 t-legenda">
                {t.after} <Icon de={PiArrowRight} tamanho="pp" />
              </span>
              <span className="font-display text-[1.5rem] group-hover:text-ouro-texto">
                {after.name[language]}
              </span>
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
