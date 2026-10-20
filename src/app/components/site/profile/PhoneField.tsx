'use client';

import { useEffect, useId, useState } from 'react';
import { cx } from '@/app/components/ui/cx';
import { Selecao } from '@/app/components/ui/Selecao';
import {
  ALL_PHONE_COUNTRIES,
  getPhoneCountryByCode,
} from '@/app/utils/phones_and_location/completePhoneCountries';
import { formatPhoneNumberWithLimit } from '@/app/utils/phones_and_location/countryTranslations';
import { parsePhoneNumber } from '@/app/utils/phones_and_location/phoneValidation';

const OPTIONS = ALL_PHONE_COUNTRIES.map((c) => ({
  value: c.code,
  label: `${c.name} (${c.dialCode})`,
}));

/**
 * Phone in E.164 (`+5511999999999`), as the API expects: the country in the
 * system select, the number formatted to that country's mask as it is
 * typed. Replaces the legacy `InternationalPhoneInput` (its own dropdown,
 * emoji flags, console logs). Empty is valid; the parent validates.
 */
export function PhoneField({
  label,
  value,
  onChange,
  disabled,
  error,
  help,
  countryLabel,
  defaultCountry = 'BR',
}: {
  label: string;
  value: string;
  onChange: (phone: string) => void;
  disabled?: boolean;
  error?: string;
  help?: string;
  /** Accessible name of the country select ("País do telefone"). */
  countryLabel: string;
  defaultCountry?: string;
}) {
  const id = useId();
  const parsed = parsePhoneNumber(value);
  const [code, setCode] = useState(parsed?.countryCode ?? defaultCountry);
  const country = getPhoneCountryByCode(code) ?? ALL_PHONE_COUNTRIES[0];
  // Countries can share a dial code (+1): match on the code, not the country.
  const sameDial = parsed?.country.dialCode === country.dialCode;
  const digits = parsed && sameDial ? parsed.number : '';

  // A value set from outside (cancel, load) brings its own country.
  useEffect(() => {
    if (parsed && !sameDial) setCode(parsed.countryCode);
  }, [value]);

  const shown = formatPhoneNumberWithLimit(digits, country).formattedValue;
  const emit = (raw: string, c = country) => {
    const { rawDigits } = formatPhoneNumberWithLimit(raw, c);
    onChange(rawDigits ? `${c.dialCode}${rawDigits}` : '');
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={`${id}-number`}
        className="t-rotulo font-medium text-texto"
      >
        {label}
      </label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <Selecao
          aria-label={countryLabel}
          opcoes={OPTIONS}
          valor={code}
          disabled={disabled}
          aoMudar={(next) => {
            setCode(next);
            const c = getPhoneCountryByCode(next);
            if (c && digits) emit(digits, c);
          }}
        />
        <input
          id={`${id}-number`}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          value={shown}
          disabled={disabled}
          placeholder={country.format.replace(/X/g, '0')}
          onChange={(e) => emit(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-erro` : help ? `${id}-ajuda` : undefined
          }
          className={cx(
            'input-classical-2 w-full rounded-controle',
            disabled && 'cursor-not-allowed opacity-70'
          )}
        />
      </div>
      {help && !error && (
        <span id={`${id}-ajuda`} className="t-legenda">
          {help}
        </span>
      )}
      <span
        id={`${id}-erro`}
        aria-live="polite"
        className="t-legenda text-erro empty:hidden"
      >
        {error}
      </span>
    </div>
  );
}
