'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { PiMagnifyingGlass, PiX } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { useDismiss } from '@/app/hooks/useDismiss';
import { searchComposers } from '@/app/requests/uploads-client';
import { Portrait } from '../Portrait';

export interface ComposerOption {
  id: string;
  name: string;
  fullName?: string;
  portraitUrl?: string | null;
}

type Option = ComposerOption;

/**
 * Choosing a composer by name: type, pick from the matches, each with its
 * portrait. With `onClear` the choice can be undone (an optional filter).
 */
export function ComposerField({
  label,
  placeholder,
  value,
  onChange,
  onClear,
  hint,
  clearLabel,
  className,
}: {
  label: string;
  placeholder: string;
  value: Option | null;
  onChange: (composer: Option) => void;
  onClear?: () => void;
  hint?: string;
  clearLabel?: string;
  className?: string;
}) {
  const id = useId();
  const [term, setTerm] = useState(value?.fullName || value?.name || '');
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Option[]>([]);
  const ref = useDismiss<HTMLDivElement>(open, () => setOpen(false));
  const typed = useRef(false);

  useEffect(() => {
    if (!typed.current || term.trim().length < 2) return;
    const timer = setTimeout(() => {
      searchComposers(term, 8)
        .then((found) => {
          setOptions(found);
          setOpen(true);
        })
        .catch(() => setOptions([]));
    }, 250);
    return () => clearTimeout(timer);
  }, [term]);

  return (
    <div
      ref={ref}
      className={cx(
        'relative flex flex-col gap-2',
        className ?? 'sm:col-span-2'
      )}
    >
      <label htmlFor={id} className="t-rotulo">
        {label}
      </label>
      <span className="search-field input-classical flex items-center gap-3 !pl-4">
        {value ? (
          <Portrait
            name={value.fullName || value.name}
            src={value.portraitUrl}
            sizes="28px"
            className="h-7 w-7 shrink-0 rounded-full text-[0.75rem]"
          />
        ) : (
          <Icon de={PiMagnifyingGlass} className="shrink-0 text-texto-fraco" />
        )}
        <input
          id={id}
          value={term}
          autoComplete="off"
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          onChange={(e) => {
            typed.current = true;
            setTerm(e.target.value);
          }}
          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-texto-fraco"
        />
        {value && onClear && (
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => {
              typed.current = false;
              setTerm('');
              setOptions([]);
              onClear();
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-texto-fraco hover:bg-sup-2 hover:text-texto"
          >
            <Icon de={PiX} tamanho="p" />
          </button>
        )}
      </span>
      {hint && <span className="t-legenda">{hint}</span>}
      {open && options.length > 0 && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="popover-open sup-alta absolute inset-x-0 top-full z-menu mt-2 flex max-h-72 flex-col gap-1 overflow-y-auto !rounded-card p-2"
        >
          {options.map((o) => (
            <li key={o.id}>
              <button
                type="button"
                role="option"
                aria-selected={o.id === value?.id}
                onClick={() => {
                  onChange(o);
                  setTerm(o.fullName || o.name);
                  setOpen(false);
                }}
                className={cx(
                  'flex w-full items-center gap-3 rounded-controle px-3 py-2 text-left hover:bg-sup-2',
                  o.id === value?.id && 'text-ouro-texto'
                )}
              >
                <Portrait
                  name={o.fullName || o.name}
                  src={o.portraitUrl}
                  sizes="32px"
                  className="h-8 w-8 shrink-0 rounded-full text-[0.8125rem]"
                />
                <span className="font-display text-[1.0625rem]">
                  {o.fullName || o.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
