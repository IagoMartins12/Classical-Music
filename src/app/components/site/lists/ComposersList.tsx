import type { Idioma } from '@/app/conteudo/legal/tipos';
import { countryFilters } from '@/app/conteudo/site/countries';
import { ERAS, eraOf } from '@/app/conteudo/site/eras';
import { LISTS } from '@/app/conteudo/site/lists';
import {
  COMPOSER_SORTS,
  getCatalogFilterOptions,
  listComposers,
} from '@/app/requests/catalog-lists';
import {
  COMPOSER_KEYS,
  parseComposerParams,
  toListQuery,
  type UrlParams,
} from '@/app/utils/listParams';
import { ComposerItem } from './ComposerItem';
import { EmptyList, ListHero } from './ListHero';
import { ListControls } from './ListControls';
import { Pagination } from './Pagination';
import { ListResults } from './ViewToggle';

const PATH = '/composers';

/** The database's epochs, in the order of the eras, named in the page language. */
export function eraOptions(
  epochs: { id: string; name: string }[],
  language: Idioma
) {
  return epochs
    .map((epoch) => ({ epoch, era: eraOf(epoch.name) }))
    .sort(
      (a, b) =>
        (a.era ? ERAS.indexOf(a.era) : 99) - (b.era ? ERAS.indexOf(b.era) : 99)
    )
    .map(({ epoch, era }) => ({
      value: epoch.id,
      label: era?.name[language] ?? epoch.name,
    }));
}

export async function ComposersList({
  language,
  params,
}: {
  language: Idioma;
  params: UrlParams;
}) {
  const copy = LISTS[language];
  const t = copy.composers;
  const countries = countryFilters(language);
  const parsed = parseComposerParams(
    params,
    (value) => countries.find((c) => c.value === value)?.demonyms
  );
  const query = toListQuery(params, COMPOSER_KEYS);
  const [options, { composers, total, pages }] = await Promise.all([
    getCatalogFilterOptions(),
    listComposers(parsed),
  ]);
  const range =
    parsed.bornFrom || parsed.bornTo
      ? t.born(parsed.bornFrom, parsed.bornTo)
      : null;

  return (
    <div className="section-wrap flex flex-col gap-8 py-12">
      <ListHero title={t.title} text={t.text} />
      <ListControls
        path={PATH}
        query={query}
        placeholder={t.placeholder}
        applyLabel={t.apply}
        count={t.found(total)}
        sort={{
          value: parsed.sort,
          options: COMPOSER_SORTS.map((value) => ({
            value,
            label: t.sorts[value],
          })),
        }}
        filters={[
          {
            key: 'epoch',
            label: t.era,
            anyLabel: t.anyEra,
            options: eraOptions(options.epochs, language),
            primary: true,
          },
          {
            key: 'country',
            label: t.country,
            anyLabel: t.anyCountry,
            options: countries,
            primary: true,
          },
          {
            key: 'instrument',
            label: t.wroteFor,
            anyLabel: t.anyInstrument,
            options: options.instruments.map((i) => ({
              value: i.id,
              label: i.name,
            })),
            primary: true,
          },
          {
            key: 'formation',
            label: t.formation,
            anyLabel: t.anyFormation,
            options: options.ensembles.map((e) => ({
              value: e.id,
              label: e.name,
            })),
          },
        ]}
        toggles={[{ key: 'verified', label: t.verified, chip: t.onlyVerified }]}
        range={{
          fromKey: 'from',
          toKey: 'to',
          legend: t.bornBetween,
          fromLabel: t.from,
          toLabel: t.to,
          chip: range,
        }}
      />
      {composers.length ? (
        <ListResults className="grid grid-cols-2 gap-x-5 gap-y-10 divide-[var(--linha)] sm:grid-cols-3 lg:grid-cols-5 max-sm:grid-cols-1! max-sm:gap-y-0 max-sm:divide-y data-[view=list]:grid-cols-1! data-[view=list]:gap-y-0 data-[view=list]:divide-y">
          {composers.map((composer, i) => (
            <ComposerItem
              key={composer.id}
              composer={composer}
              language={language}
              priority={i < 5}
            />
          ))}
        </ListResults>
      ) : (
        <EmptyList title={copy.common.empty} text={copy.common.emptyText} />
      )}
      <Pagination
        path={PATH}
        query={query}
        page={parsed.page}
        pages={pages}
        copy={copy.common}
      />
    </div>
  );
}
