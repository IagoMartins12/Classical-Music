// components/ui/Select.tsx - VERSÃO CORRIGIDA SEM HYDRATION MISMATCH
'use client';

import React, { forwardRef, useId, useMemo } from 'react';
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
  defaultValue?: string;
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
    // 🔥 USAR useId PARA ID ESTÁVEL E CONSISTENTE (SSR SAFE)
    const selectId = useId();
    const finalId = id || selectId;

    // 🔥 MEMOIZAR OPÇÕES PARA EVITAR RE-RENDERS
    const memoizedOptions = useMemo(() => options, [options]);

    // 🔥 RESOLVER defaultValue DE FORMA ESTÁVEL E MEMOIZADA
    const resolvedDefaultValue = useMemo(() => {
      if (!defaultValue || (value !== undefined && value !== '')) {
        return undefined;
      }

      // Tentar encontrar por value exato primeiro
      const optionByValue = memoizedOptions.find(
        (option) => option.value === defaultValue
      );
      if (optionByValue) {
        return optionByValue.value;
      }

      // Depois tentar por label (case-insensitive)
      const optionByLabel = memoizedOptions.find(
        (option) => option.label.toLowerCase() === defaultValue.toLowerCase()
      );
      if (optionByLabel) {
        return optionByLabel.value;
      }

      // Por último, busca parcial no label
      const optionByPartialLabel = memoizedOptions.find((option) =>
        option.label.toLowerCase().includes(defaultValue.toLowerCase())
      );
      if (optionByPartialLabel) {
        return optionByPartialLabel.value;
      }

      return undefined;
    }, [defaultValue, memoizedOptions, value]);

    // 🔥 DETERMINAR VALUE FINAL DE FORMA ESTÁVEL
    const finalValue = value !== undefined ? value : resolvedDefaultValue;

    return (
      <div className={`relative ${containerClassName}`}>
        {label && (
          <label
            htmlFor={finalId}
            className="block text-sm font-medium text-theme-secondary mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={finalId}
            value={finalValue || ''}
            className={`
              input-classical w-full !pr-10 !pl-6 appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary
              transition-all duration-200
              ${
                error
                  ? '!border-red-500 focus:ring-red-500 focus:border-red-500'
                  : ''
              }
              ${
                props.disabled
                  ? 'opacity-50 cursor-not-allowed bg-theme-secondary/20'
                  : ''
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}

            {memoizedOptions.map((option, index) => (
              <option
                key={option.key || `${option.value}-${index}`}
                value={option.value}
                disabled={option.disabled}
                className="capitalize"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Seta customizada */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <FiChevronDown
              className={`w-4 h-4 transition-colors duration-200 ${
                props.disabled ? 'text-theme-tertiary' : 'text-theme-secondary'
              }`}
            />
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <p className="text-red-500 text-sm font-medium flex items-center space-x-1 mt-1 gap-2">
            <FiAlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
