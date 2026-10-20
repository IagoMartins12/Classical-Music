'use client';

import { useRouter } from 'next/navigation';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';
import { useEffect, useState, useTransition } from 'react';
import {
  PiArrowsDownUp,
  PiFunnelSimple,
  PiMagnifyingGlass,
  PiX,
} from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Selecao } from '@/app/components/ui/Selecao';
import { Sheet } from '@/app/components/ui/Sheet';
import { cx } from '@/app/components/ui/cx';
import { LISTS } from '@/app/conteudo/site/lists';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';
import { localizeHref } from '@/app/utils/localizedRoutes';
import { listHref, type ListQuery } from '@/app/utils/listParams';
import { SelecaoComBusca } from '@/app/components/ui/SelecaoComBusca';
import { composerOptions } from '@/app/requests/catalog-search';
import { ViewToggle } from './ViewToggle';

export interface Option {
  value: string;
  label: string;
}

/**
 * A choice filter: a pill on the page when `primary`, otherwise in "More
 * filters". Never in both: the sheet only holds what the page does not show.
 */
export interface ChoiceFilter {
  key: string;
  label: string;
  anyLabel: string;
  options: Option[];
  primary?: boolean;
}

/**
 * A pill on the page that searches as the person types (composer on the
 * works list): the list is too long to load as options.
 */
export interface ComposerFilter {
  key: string;
  label: string;
  placeholder: string;
  /** Name of the composer in the URL, resolved on the server. */
  selectedLabel?: string;
}

export interface ToggleFilter {
  key: string;
  label: string;
  /** The chip once it is on ("With portrait"). */
  chip: string;
}

export interface RangeFilter {
  fromKey: string;
  toKey: string;
  legend: string;
  fromLabel: string;
  toLabel: string;
  /** The chip once set ("Born 1700–1800"); `null` when empty. */
  chip: string | null;
}

const pill = 'w-auto! min-h-10! rounded-full! py-0! text-[0.9375rem]';

/**
 * Search, filters, sort and view for a server-rendered list. Every change is
 * a new URL (shareable, indexable); the list stays on screen until the next
 * one arrives, marked busy.
 */
export function ListControls({
  path,
  query,
  placeholder,
  filters,
  toggles = [],
  composer,
  range,
  sort,
  count,
  applyLabel,
}: {
  path: string;
  query: ListQuery;
  placeholder: string;
  filters: ChoiceFilter[];
  toggles?: ToggleFilter[];
  composer?: ComposerFilter;
  range?: RangeFilter;
  sort: { value: string; options: Option[] };
  count: string;
  applyLabel: string;
}) {
  const { language } = useRouteLanguage();
  const copy = LISTS[language].common;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(query.search ?? '');
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<ListQuery>(query);

  useEffect(() => setSearch(query.search ?? ''), [query.search]);
  useEffect(() => {
    if (sheet) setDraft(query);
  }, [sheet, query]);

  const go = (patch: ListQuery) =>
    startTransition(() =>
      router.push(localizeHref(listHref(path, query, patch), language), {
        scroll: false,
      })
    );

  const active = [
    ...filters.flatMap((f) => {
      const option = f.options.find((o) => o.value === query[f.key]);
      return option
        ? [{ key: f.key, label: option.label, clear: { [f.key]: undefined } }]
        : [];
    }),
    ...(composer && query[composer.key] && composer.selectedLabel
      ? [
          {
            key: composer.key,
            label: composer.selectedLabel,
            clear: { [composer.key]: undefined },
          },
        ]
      : []),
    ...toggles
      .filter((t) => query[t.key])
      .map((t) => ({
        key: t.key,
        label: t.chip,
        clear: { [t.key]: undefined },
      })),
    ...(range?.chip
      ? [
          {
            key: range.fromKey,
            label: range.chip,
            clear: { [range.fromKey]: undefined, [range.toKey]: undefined },
          },
        ]
      : []),
  ];
  const allKeys = [
    ...filters.map((f) => f.key),
    ...(composer ? [composer.key] : []),
    ...toggles.map((t) => t.key),
    ...(range ? [range.fromKey, range.toKey] : []),
  ];
  const sheetFilters = filters.filter((f) => !f.primary);
  // The sheet applies and clears only its own keys; pills stay as they are.
  const sheetKeys = [
    ...sheetFilters.map((f) => f.key),
    ...toggles.map((t) => t.key),
    ...(range ? [range.fromKey, range.toKey] : []),
  ];
  const secondary = active.filter(
    (a) => !filters.some((f) => f.primary && f.key === a.key)
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go({ search: search.trim() || undefined });
        }}
        className="search-field flex min-h-14 items-center gap-3 rounded-full bg-sup-2 pl-5 pr-2"
      >
        <Icon de={PiMagnifyingGlass} tamanho="m" className="text-texto-fraco" />
        <label className="sr-only" htmlFor={`${path}-search`}>
          {placeholder}
        </label>
        <input
          id={`${path}-search`}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-[1.0625rem] outline-none placeholder:text-texto-fraco"
        />
        <Button
          type="submit"
          variante="primario"
          tamanho="p"
          className="rounded-full"
        >
          {copy.search}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {filters
          .filter((f) => f.primary)
          .map((f) => (
            <div key={f.key}>
              <Selecao
                aria-label={f.label}
                className={cx(pill, query[f.key] && 'border-[var(--ouro)]!')}
                opcoes={[{ value: '', label: f.anyLabel }, ...f.options]}
                valor={query[f.key] ?? ''}
                aoMudar={(value) => go({ [f.key]: value || undefined })}
              />
            </div>
          ))}
        {composer && (
          <div className="w-64 max-w-full">
            <SelecaoComBusca
              aria-label={composer.label}
              placeholder={composer.placeholder}
              className={cx(
                pill,
                'w-full!',
                query[composer.key] && 'border-[var(--ouro)]!'
              )}
              buscar={composerOptions}
              valor={query[composer.key] ?? ''}
              rotulo={composer.selectedLabel}
              limpavel
              rotuloLimpar={copy.remove(composer.selectedLabel ?? '')}
              vazio={copy.noMatch}
              aoMudar={(value) => go({ [composer.key]: value || undefined })}
            />
          </div>
        )}
        <Button
          tamanho="p"
          icone={PiFunnelSimple}
          onClick={() => setSheet(true)}
          className="rounded-full"
        >
          {copy.moreFilters}
          {secondary > 0 && ` · ${secondary}`}
        </Button>
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <span
              key={a.key}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-full tint-ouro pl-3 pr-1 text-[0.8125rem] text-ouro-na-tinta"
            >
              {a.label}
              <button
                type="button"
                onClick={() => go(a.clear)}
                className="grid h-6 w-6 place-items-center rounded-full hover:bg-[var(--interactive-hover)]"
              >
                <Icon de={PiX} tamanho="pp" rotulo={copy.remove(a.label)} />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() =>
              go(Object.fromEntries(allKeys.map((k) => [k, undefined])))
            }
            className="t-rotulo text-texto-suave underline decoration-transparent underline-offset-4 hover:decoration-[var(--ouro)]"
          >
            {copy.clearAll}
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--linha)] pb-4">
        <p
          className="t-rotulo text-texto-suave"
          aria-live="polite"
          aria-busy={pending}
        >
          {count}
        </p>
        <div className="flex items-center gap-2">
          <div className="shrink-0">
            <Selecao
              aria-label={copy.sort}
              icone={PiArrowsDownUp}
              className={cx(pill, 'w-max! whitespace-nowrap')}
              opcoes={sort.options}
              valor={sort.value}
              aoMudar={(value) => go({ sort: value })}
            />
          </div>
          <ViewToggle />
        </div>
      </div>

      <Sheet
        aberto={sheet}
        aoFechar={() => setSheet(false)}
        titulo={copy.filters}
        largura="m"
        rodape={
          <div className="flex justify-between gap-2">
            <Button
              variante="fantasma"
              onClick={() =>
                setDraft({
                  ...draft,
                  ...Object.fromEntries(sheetKeys.map((k) => [k, undefined])),
                })
              }
            >
              {copy.clear}
            </Button>
            <Button
              variante="primario"
              onClick={() => {
                setSheet(false);
                go(Object.fromEntries(sheetKeys.map((k) => [k, draft[k]])));
              }}
            >
              {applyLabel}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-7">
          {sheetFilters.map((f) => (
            <fieldset key={f.key} className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{f.label}</legend>
              <div className="flex flex-wrap gap-2">
                {[{ value: '', label: f.anyLabel }, ...f.options].map((o) => {
                  const on = (draft[f.key] ?? '') === o.value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() =>
                        setDraft({ ...draft, [f.key]: o.value || undefined })
                      }
                      className={cx(
                        'inline-flex min-h-10 items-center rounded-full px-4 text-[0.9375rem] transition-colors duration-[var(--t-toque)]',
                        on
                          ? 'tint-ouro text-ouro-na-tinta'
                          : 'bg-sup-2 text-texto-suave hover:text-texto'
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {toggles.map((t) => (
            <CaixaDeMarcar
              key={t.key}
              rotulo={t.label}
              marcado={draft[t.key] === '1'}
              aoMudar={(on) =>
                setDraft({ ...draft, [t.key]: on ? '1' : undefined })
              }
            />
          ))}
          {range && (
            <fieldset className="flex flex-col gap-2">
              <legend className="t-rotulo mb-2">{range.legend}</legend>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    [range.fromKey, range.fromLabel, '1600'],
                    [range.toKey, range.toLabel, '1900'],
                  ] as const
                ).map(([key, label, example]) => (
                  <input
                    key={key}
                    inputMode="numeric"
                    aria-label={label}
                    placeholder={example}
                    value={draft[key] ?? ''}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        [key]:
                          e.target.value.replace(/\D/g, '').slice(0, 4) ||
                          undefined,
                      })
                    }
                    className="input-classical-2 rounded-controle"
                  />
                ))}
              </div>
            </fieldset>
          )}
        </div>
      </Sheet>
    </div>
  );
}
