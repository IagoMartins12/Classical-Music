// components/ui/Select.tsx
'use client';

import React, { forwardRef, useMemo } from 'react';
import { FiAlertCircle, FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
  key?: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'defaultValue'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  containerClassName?: string;
  defaultValue?: string; // Pode ser o label ou value da opção
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
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    // Encontrar o value correto baseado no defaultValue
    const resolvedDefaultValue = useMemo(() => {
      if (!defaultValue || (value && value !== '')) {
        return undefined; // Se já tem value controlado, não usar defaultValue
      }

      // Primeiro, tentar encontrar por value exato
      const optionByValue = options.find(
        (option) => option.value === defaultValue
      );
      if (optionByValue) {
        return optionByValue.value;
      }

      // Depois, tentar encontrar por label (case-insensitive)
      const optionByLabel = options.find(
        (option) => option.label.toLowerCase() === defaultValue.toLowerCase()
      );
      if (optionByLabel) {
        return optionByLabel.value;
      }

      // Tentar encontrar por label que contenha o defaultValue
      const optionByPartialLabel = options.find((option) =>
        option.label.toLowerCase().includes(defaultValue.toLowerCase())
      );
      if (optionByPartialLabel) {
        return optionByPartialLabel.value;
      }

      return undefined;
    }, [defaultValue, options, value]);

    // Determinar o value final a ser usado
    const finalValue = value !== undefined ? value : resolvedDefaultValue;

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
            value={finalValue || ''}
            className={`
              input-classical w-full !pr-10 !pl-6 appearance-none cursor-pointer
              ${error ? '!border-red-500 focus:border-accent-red' : ''}
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
                key={option.key ? option.key : option.value}
                value={option.value}
                disabled={option.disabled}
                className="capitalize"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FiChevronDown className="w-4 h-4 text-theme-tertiary" />
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm font-medium flex items-center space-x-1 mt-1 gap-2">
            <FiAlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && defaultValue && (
          <div className="mt-1 text-xs text-gray-500">
            Default: &quot;{defaultValue}&quot; →{' '}
            {resolvedDefaultValue
              ? `"${resolvedDefaultValue}"`
              : 'não encontrado'}
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
