import { PiArrowSquareOut } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Icon } from '@/app/components/ui/Icon';
import type { Idioma } from '@/app/conteudo/legal/tipos';
import { COMPOSER, LEVEL_VALUES } from '@/app/conteudo/site/composer';
import { eraName } from '@/app/conteudo/site/eras';
import type { WorkCopy } from '@/app/conteudo/site/work';
import type { WorkDetails } from '@/app/requests/work-page-details';

/** "Ficha": the facts on record, the movements and the tags. */
export function WorkDetailsPanel({
  work,
  language,
  copy,
}: {
  work: WorkDetails;
  language: Idioma;
  copy: WorkCopy;
}) {
  const t = copy.facts;
  const levelKey = work.difficultyLevel
    ? LEVEL_VALUES[work.difficultyLevel as keyof typeof LEVEL_VALUES]
    : undefined;
  const rows = (
    [
      [t.composed, work.compositionYear],
      [t.published, work.firstPublishDate],
      [t.dedication, work.dedicateTo],
      [t.instrumentation, work.instrumentation],
      [t.instrument, !work.instrumentation && work.instrument?.name],
      [t.catalog, work.opOrCatalog],
      [t.key, work.tone],
      [t.duration, work.mediaDuration],
      [t.era, eraName(work.epoch?.name ?? work.composer.epochName, language)],
      [t.level, levelKey && COMPOSER[language].startHere.levels[levelKey]],
    ] as const
  ).filter(([, value]) => value) as [string, string][];
  const tags = [...new Set([...work.workGenresArr, ...work.categoryNames])];
  const movements = work.childWorks ?? [];

  return (
    <>
      <h2 className="t-subtitulo">{t.title}</h2>
      <dl className="flex flex-col divide-y divide-[var(--linha)]">
        {rows.map(([term, value]) => (
          <div
            key={term}
            className="grid grid-cols-[8rem_minmax(0,1fr)] gap-4 py-2.5"
          >
            <dt className="t-rotulo text-texto-suave">{term}</dt>
            <dd className="t-rotulo break-words">{value}</dd>
          </div>
        ))}
      </dl>
      {movements.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="t-legenda">{t.movements}</span>
          <ol className="flex flex-col divide-y divide-[var(--linha)]">
            {movements.map((movement, i) => (
              <li key={movement.id}>
                <Link
                  href={`/works/${movement.id}`}
                  className="group flex items-baseline gap-3 py-2"
                >
                  <span className="t-dado w-5 shrink-0 text-texto-fraco">
                    {i + 1}
                  </span>
                  <span className="group-hover:text-ouro-texto">
                    {movement.title}
                    {movement.subtitle && (
                      <span className="text-texto-suave">
                        {' '}
                        · {movement.subtitle}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        work.moviment && (
          <div className="flex flex-col gap-2">
            <span className="t-legenda">{t.movements}</span>
            <p className="t-rotulo text-texto-suave">{work.moviment}</p>
          </div>
        )
      )}
      {tags.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="t-legenda">{t.tags}</span>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex min-h-8 items-center rounded-full bg-sup-2 px-3 text-[0.8125rem] text-texto-suave"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </li>
            ))}
          </ul>
        </div>
      )}
      {/^https?:\/\//.test(work.imslpPermlink) && (
        <a
          href={work.imslpPermlink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 self-start rounded-full bg-sup-2 px-4 text-[0.9375rem] text-texto-suave hover:text-ouro-texto"
        >
          {t.imslp} <Icon de={PiArrowSquareOut} tamanho="pp" />
        </a>
      )}
    </>
  );
}
