'use client';

import React from 'react';
import { CaixaDeMarcar } from '@/app/components/ui/CaixaDeMarcar';

interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  label?: string;
  error?: string;
  containerClassName?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * The older forms' checkbox, drawn by the system's `CaixaDeMarcar`. The API
 * stays: `onChange` still gets an event-like object with `target.checked`
 * and `target.name`, which is what those forms read.
 */
export default function Checkbox({
  label,
  error,
  containerClassName = '',
  checked,
  onChange,
  disabled,
  name,
}: CheckboxProps) {
  return (
    <div className={containerClassName}>
      <CaixaDeMarcar
        rotulo={label ?? ''}
        marcado={!!checked}
        disabled={disabled}
        name={name}
        aoMudar={(value) =>
          onChange?.({
            target: { checked: value, name: name ?? '' },
            currentTarget: { checked: value, name: name ?? '' },
          } as unknown as React.ChangeEvent<HTMLInputElement>)
        }
      />
      {error && <p className="t-legenda text-erro">{error}</p>}
    </div>
  );
}
