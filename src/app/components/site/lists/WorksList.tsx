import type { Idioma } from '@/app/conteudo/legal/tipos';
import { COMPOSER, LEVEL_VALUES } from '@/app/conteudo/site/composer';
import { LISTS } from '@/app/conteudo/site/lists';
import {
  getCatalogFilterOptions,
  listWorks,
  WORK_SORTS,
} from '@/app/requests/catalog-lists';
import {
  parseWorkParams,
  toListQuery,
  WORK_KEYS,
  type UrlParams,
} from '@/app/utils/listParams';
import { findComposerById } from '@/app/requests/catalog-search';
import { eraOptions } from './ComposersList';
import { EmptyList, ListHero } from './ListHero';
import { ListControls } from './ListControls';
import { Pagination } from './Pagination';
import { ListResults } from './ViewToggle';
import { WorkItem } from './WorkItem';

const PATH = '/works';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export async function WorksList({
  language,
  params,
}: {
  language: Idioma;
  params: UrlParams;
}) {
  const copy = LISTS[language];
  const t = copy.works;
  const parsed = parseWorkParams(params);
  const query = toListQuery(params, WORK_KEYS);
  const [options, { works, total, pages }] = await Promise.all([
    getCatalogFilterOptions(),
    listWorks(parsed),
  ]);
  const levels = COMPOSER[language].startHere.levels;
  // The composer in the URL, named for the field and the chip.
  const famous = options.popularComposers.find(
    (c) => c.id === parsed.composerId
  );
  const composerLabel = parsed.composerId
    ? famous
      ? famous.name
      : await findComposerById(parsed.composerId)
          .then((c) => (c ? c.fullName || c.name : undefined))
          .catch(() => undefined)
    : undefined;

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
          options: WORK_SORTS.map((value) => ({
            value,
            label: t.sorts[value],
          })),
        }}
        toggles={[{ key: 'verified', label: t.verified, chip: t.onlyVerified }]}
        composer={{
          key: 'composer',
          label: t.composer,
          placeholder: t.composer,
          selectedLabel: composerLabel,
        }}
        filters={[
          {
            key: 'instrument',
            label: t.instrument,
            anyLabel: t.anyInstrument,
            options: options.instruments.map((i) => ({
              value: i.id,
              label: i.name,
            })),
            primary: true,
          },
          {
            key: 'epoch',
            label: t.era,
            anyLabel: t.anyEra,
            options: eraOptions(options.epochs, language),
            primary: true,
          },
          {
            key: 'genre',
            label: t.genre,
            anyLabel: t.anyGenre,
            options: options.workGenres.map((g) => ({
              value: g.name,
              label: capitalize(g.name),
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
          {
            key: 'level',
            label: t.level,
            anyLabel: t.anyLevel,
            options: Object.entries(LEVEL_VALUES).map(([value, key]) => ({
              value,
              label: levels[key],
            })),
          },
        ]}
      />
      {works.length ? (
        <ListResults className="grid grid-cols-1 gap-3 divide-[var(--linha)] sm:grid-cols-2 lg:grid-cols-3 max-sm:gap-0 max-sm:divide-y data-[view=list]:grid-cols-1! data-[view=list]:gap-0 data-[view=list]:divide-y">
          {works.map((work) => (
            <WorkItem key={work.id} work={work} language={language} />
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
