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
        <label
          htmlFor={checkboxId}
          className="flex items-center cursor-pointer select-none"
        >
          {/* INPUT */}
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={`peer sr-only ${className}`}
            {...props}
          />

          {/* CHECKBOX VISUAL */}
          <div
            className={`
              w-5 h-5 rounded border border-gray-400 
              flex items-center justify-center
              peer-checked:transparent peer-checked:transparent
              transition-colors
            `}
          >
            <FiCheck
              className={`
                text-white text-sm 
                opacity-0 peer-checked:opacity-100 
                transition-opacity
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
