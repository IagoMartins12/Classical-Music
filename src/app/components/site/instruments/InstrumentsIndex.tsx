import Link from '@/app/components/LocalizedLink';
import Image from '@/app/components/SmartImage';
import { NotasAoFundo } from '@/app/components/ui/NotasAoFundo';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import {
  FAMILIES,
  INSTRUMENTS,
  instrumentChapter,
  type FamilyKey,
} from '@/app/conteudo/instruments';
import { LEARN } from '@/app/conteudo/site/learn';

/** Ages for the "when each appeared" strip: before, during and after the Middle Ages. */
const AGES: { until: number; label: Record<Idioma, string> }[] = [
  {
    until: 500,
    label: { pt: 'Pré-história e Antiguidade', en: 'Prehistory and Antiquity' },
  },
  {
    until: 1600,
    label: {
      pt: 'Idade Média e Renascença',
      en: 'Middle Ages and Renaissance',
    },
  },
  { until: Infinity, label: { pt: 'Barroco', en: 'Baroque' } },
];

const FAMILY_ORDER: FamilyKey[] = [
  'keyboards',
  'strings',
  'woodwinds',
  'brass',
  'percussion',
  'voice',
];

/** The instruments page: when each one appeared, then every family. */
export function InstrumentsIndex({ language }: { language: Idioma }) {
  const copy = LEARN[language].instruments;
  const sorted = [...INSTRUMENTS].sort((a, b) => a.since - b.since);
  const ages = AGES.map((age, i) => ({
    label: age.label[language],
    items: sorted.filter(
      (m) => m.since < age.until && m.since >= (AGES[i - 1]?.until ?? -Infinity)
    ),
  }));

  return (
    <div className="flex flex-col">
      <section className="relative isolate overflow-hidden">
        <NotasAoFundo className="-z-10" />
        <div className="section-wrap flex flex-col gap-12 py-14 md:py-20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end">
            <h1 className="rise font-display text-[clamp(2.75rem,7vw,5.5rem)] leading-[0.96] tracking-[-0.02em]">
              {copy.title}
            </h1>
            <p
              className="rise t-corpo text-texto-suave"
              style={{ ['--delay' as string]: '90ms' }}
            >
              {copy.text}
            </p>
          </div>
          <div
            className="rise flex flex-col gap-4"
            style={{ ['--delay' as string]: '180ms' }}
          >
            <h2 className="t-legenda">{copy.ruler}</h2>
            <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {ages.map((age) => (
                <li
                  key={age.label}
                  className="flex flex-col gap-3 border-t-2 border-[var(--ouro)] pt-3"
                >
                  <span className="font-display text-[1.25rem]">
                    {age.label}
                  </span>
                  <ul className="flex flex-wrap gap-2">
                    {age.items.map((meta) => (
                      <li key={meta.key}>
                        <Link
                          href={`/instruments/${meta.key}`}
                          className="inline-flex min-h-9 items-center rounded-full bg-sup-2 px-3.5 text-[0.875rem] hover:text-ouro-texto"
                        >
                          {instrumentChapter(meta.key, language)?.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <nav
        aria-label={copy.families}
        className="sticky top-16 z-elevado border-y border-[var(--linha)] bg-fundo"
      >
        <ul className="section-wrap scroll-strip flex gap-1 overflow-x-auto py-2">
          {FAMILY_ORDER.map((family) => (
            <li key={family} className="shrink-0">
              <a
                href={`#${family}`}
                className="inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] text-texto-suave hover:bg-sup-2 hover:text-texto"
              >
                {FAMILIES[family][language]}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="section-wrap flex flex-col gap-16 py-12">
        {FAMILY_ORDER.map((family) => (
          <section
            key={family}
            id={family}
            className="flex scroll-mt-32 flex-col gap-6"
          >
            <h2 className="t-titulo max-sm:!text-[1.75rem]">
              {FAMILIES[family][language]}
            </h2>
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {INSTRUMENTS.filter((m) => m.family === family).map((meta) => {
                const chapter = instrumentChapter(meta.key, language)!;
                return (
                  <li key={meta.key}>
                    <Link
                      href={`/instruments/${meta.key}`}
                      className="group flex h-full flex-col overflow-hidden rounded-card bg-sup-2"
                    >
                      <span
                        data-vira={`instrumento-${meta.key}`}
                        className="relative block aspect-[4/3]"
                      >
                        <Image
                          src={meta.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-contain p-4 transition-transform duration-[var(--t-resposta)] group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="flex flex-col gap-1.5 p-5">
                        <span className="t-dado text-[0.8125rem] text-ouro-texto">
                          {chapter.when}
                        </span>
                        <span className="font-display text-[1.75rem] leading-none group-hover:text-ouro-texto">
                          {chapter.name}
                        </span>
                        <span className="t-rotulo line-clamp-3 text-texto-suave">
                          {chapter.lede}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
