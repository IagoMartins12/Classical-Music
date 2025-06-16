// components/ui/Checkbox.tsx
'use client';

import React, { forwardRef } from 'react';
import { FiCheck } from 'react-icons/fi';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, className = '', containerClassName = '', id, ...props },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`relative ${containerClassName}`}>
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={`
                sr-only peer
                ${className}
              `}
              {...props}
            />
            <div
              className="
              w-5 h-5 bg-theme-elevated border border-theme-secondary rounded
              peer-checked:bg-brand-primary peer-checked:border-brand-primary
              peer-focus:ring-2 peer-focus:ring-brand-primary peer-focus:ring-opacity-50
              transition-all cursor-pointer flex items-center justify-center
            "
            >
              <FiCheck className="w-3 h-3 text-theme-inverse opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>

          {label && (
            <label
              htmlFor={checkboxId}
              className="ml-3 text-sm text-theme-secondary cursor-pointer"
            >
              {label}
            </label>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
