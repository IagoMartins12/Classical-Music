// components/ui/Select.tsx
'use client';

import React, { forwardRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      options,
      placeholder,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`relative ${containerClassName}`}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-theme-secondary mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              input-classical w-full !pr-10 !pl-6 appearance-none cursor-pointer
              ${error ? 'border-accent-red focus:border-accent-red' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FiChevronDown className="w-4 h-4 text-theme-tertiary" />
          </div>
        </div>

        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
