'use client';

import { useEffect, useId, useMemo, useState } from 'react';
import { Selecao } from '@/app/components/ui/Selecao';
import { SelecaoComBusca } from '@/app/components/ui/SelecaoComBusca';
import { translateCountryName } from '@/app/utils/phones_and_location/countryTranslations';

/** Where the person lives, as the profile stores it (names) plus codes. */
export interface LocationData {
  country?: { isoCode: string; name: string; flag: string };
  state?: { isoCode: string; name: string; countryCode: string };
  city?: { name: string; stateCode: string; countryCode: string };
}

// Countries and states only (~640 kB); the cities come from `/geo/cities`.
type Library = {
  Country: typeof import('country-state-city/lib/country').default;
  State: typeof import('country-state-city/lib/state').default;
};

const norm = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/**
 * Country, state and city in three system selects, replacing the legacy
 * `LocationSelector` (850 lines, emoji flags, its own dropdown).
 *
 * The profile keeps names, not codes (`country: "Brasil"`), so a value read
 * from the database arrives without `isoCode`; once the place library loads
 * (lazily, it is large) the names are matched to codes, in Portuguese or
 * English. Country and state filter as the person types
 * (`SelecaoComBusca`); in the city list, typing letters jumps to the option.
 */
export function LocationField({
  value,
  onChange,
  disabled,
  language,
}: {
  value: LocationData;
  onChange: (location: LocationData) => void;
  disabled?: boolean;
  language: 'pt' | 'en';
}) {
  const id = useId();
  const [lib, setLib] = useState<Library | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      import('country-state-city/lib/country'),
      import('country-state-city/lib/state'),
    ]).then(
      ([country, state]) =>
        alive && setLib({ Country: country.default, State: state.default })
    );
    return () => {
      alive = false;
    };
  }, []);

  const label = (english: string) =>
    language === 'pt' ? translateCountryName(english) : english;

  const countries = useMemo(
    () =>
      lib
        ? lib.Country.getAllCountries()
            .map((c) => ({
              value: c.isoCode,
              label: label(c.name),
              flag: c.flag,
            }))
            .sort((a, b) => a.label.localeCompare(b.label, language))
        : [],

    [lib, language]
  );

  // Codes of what is selected, recovered from the stored names when needed.
  const countryCode =
    value.country?.isoCode ||
    (value.country &&
      lib?.Country.getAllCountries().find(
        (c) =>
          norm(c.name) === norm(value.country!.name) ||
          norm(translateCountryName(c.name)) === norm(value.country!.name)
      )?.isoCode) ||
    '';

  const states = useMemo(
    () =>
      lib && countryCode
        ? lib.State.getStatesOfCountry(countryCode).map((s) => ({
            value: s.isoCode,
            label: s.name,
          }))
        : [],
    [lib, countryCode]
  );

  const stateCode =
    value.state?.isoCode ||
    (value.state &&
      states.find((s) => norm(s.label) === norm(value.state!.name))?.value) ||
    '';

  const [cityNames, setCityNames] = useState<string[]>([]);
  useEffect(() => {
    setCityNames([]);
    if (!countryCode || !stateCode) return;
    let alive = true;
    fetch(
      `/geo/cities?country=${encodeURIComponent(countryCode)}&state=${encodeURIComponent(stateCode)}`
    )
      .then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
      .then((names) => alive && setCityNames(names))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [countryCode, stateCode]);
  const cities = useMemo(
    () => cityNames.map((name) => ({ value: name, label: name })),
    [cityNames]
  );

  const t =
    language === 'pt'
      ? {
          country: 'País',
          state: 'Estado',
          city: 'Cidade',
          pick: 'Escolha',
          loading: 'Carregando…',
          first: (what: string) => `Escolha o ${what} primeiro`,
        }
      : {
          country: 'Country',
          state: 'State',
          city: 'City',
          pick: 'Choose',
          loading: 'Loading…',
          first: (what: string) => `Choose the ${what} first`,
        };

  // A stored name that the library does not list still shows, as itself.
  const withStored = (
    opts: { value: string; label: string }[],
    code: string,
    stored?: string
  ) =>
    stored && !code
      ? [{ value: `stored:${stored}`, label: stored }, ...opts]
      : opts;

  const fields = [
    {
      key: 'country',
      label: t.country,
      opts: withStored(countries, countryCode, value.country?.name),
      valor:
        countryCode || (value.country ? `stored:${value.country.name}` : ''),
      placeholder: lib ? t.pick : t.loading,
      off: disabled || !lib,
      change: (code: string) => {
        const c = countries.find((o) => o.value === code);
        if (c)
          onChange({
            country: { isoCode: c.value, name: c.label, flag: c.flag },
          });
      },
    },
    {
      key: 'state',
      label: t.state,
      opts: withStored(states, stateCode, value.state?.name),
      valor: stateCode || (value.state ? `stored:${value.state.name}` : ''),
      placeholder: countryCode ? t.pick : t.first(t.country.toLowerCase()),
      off: disabled || !countryCode || states.length === 0,
      change: (code: string) => {
        const s = states.find((o) => o.value === code);
        if (s)
          onChange({
            country: value.country && {
              ...value.country,
              isoCode: value.country.isoCode || countryCode,
            },
            state: { isoCode: s.value, name: s.label, countryCode },
          });
      },
    },
    {
      key: 'city',
      label: t.city,
      opts: withStored(cities, '', value.city?.name).filter(
        (o, i, all) => all.findIndex((x) => x.label === o.label) === i
      ),
      valor: value.city
        ? cities.some((c) => c.value === value.city!.name)
          ? value.city.name
          : `stored:${value.city.name}`
        : '',
      placeholder: stateCode ? t.pick : t.first(t.state.toLowerCase()),
      off: disabled || !stateCode || cities.length === 0,
      change: (name: string) =>
        onChange({
          country: value.country && {
            ...value.country,
            isoCode: value.country.isoCode || countryCode,
          },
          state: value.state && {
            ...value.state,
            isoCode: value.state.isoCode || stateCode,
          },
          city: { name, stateCode, countryCode },
        }),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {fields.map((f) => (
        <div key={f.key} className="flex flex-col gap-2">
          <label
            id={`${id}-${f.key}`}
            className="t-rotulo font-medium text-texto"
          >
            {f.label}
          </label>
          {f.key === 'city' ? (
            <Selecao
              aria-labelledby={`${id}-${f.key}`}
              opcoes={f.opts}
              valor={f.valor}
              placeholder={f.placeholder}
              disabled={f.off}
              aoMudar={f.change}
            />
          ) : (
            // Long lists: country and state filter as the person types.
            <SelecaoComBusca
              aria-labelledby={`${id}-${f.key}`}
              opcoes={f.opts}
              valor={f.valor}
              placeholder={f.placeholder}
              disabled={f.off}
              vazio={language === 'pt' ? 'Nada encontrado' : 'No match'}
              aoMudar={(v) => f.change(v)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
