'use client';

import React, { forwardRef, useState } from 'react';
import { FiCheck } from 'react-icons/fi';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      className = '',
      containerClassName = '',
      id,
      checked,
      onChange,
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    // Estado local para debug (remover depois)
    const [internalChecked, setInternalChecked] = useState(checked || false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setInternalChecked(newChecked);
      console.log('📝 Checkbox changed:', newChecked);

      if (onChange) {
        onChange(e);
      }
    };

    // Use controlled state se fornecido, senão use interno
    const isChecked = checked !== undefined ? checked : internalChecked;

    return (
      <div className={`relative ${containerClassName}`}>
        <label
          htmlFor={checkboxId}
          className="flex items-center cursor-pointer select-none"
        >
          {/* INPUT */}
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className="peer sr-only"
            {...props}
          />

          {/* CHECKBOX VISUAL - Versão com forced state para debug */}
          <div
            className={`
              w-5 h-5 rounded border-1 border-transparent bg-theme-tertiary transition-all duration-200
              flex items-center justify-center
              ${isChecked ? 'bg-brand-primary   ' : ''}
            `}
          >
            <FiCheck
              className={`
                text-theme-primary transition-all duration-200
                ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
              `}
              strokeWidth={3}
              size={16}
            />
          </div>

          {label && <span className="ml-3 text-sm text-gray-800">{label}</span>}
        </label>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
