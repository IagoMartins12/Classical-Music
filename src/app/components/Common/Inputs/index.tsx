// app/components/Common/Inputs/index.tsx - VERSÃO CORRIGIDA
'use client';

import React, { forwardRef, useId, useState, useEffect } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  inputType?: string;
  customId?: string; // 🆕 Prop para ID customizado
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      className = '',
      inputType,
      customId, // 🆕 ID customizado
      ...props
    },
    ref
  ) => {
    // 🆕 Estado para controlar se o componente foi hidratado
    const [isHydrated, setIsHydrated] = useState(false);

    // 🆕 Use o ID customizado se fornecido, senão gere um
    const generatedId = useId();
    const inputId = customId || generatedId;

    // 🆕 Marcar como hidratado após o primeiro render
    useEffect(() => {
      setIsHydrated(true);
    }, []);

    // 🆕 Evitar problemas de hydration usando o estado
    const finalInputId = isHydrated ? inputId : undefined;

    const baseClasses = `
      input-classical w-full
      pl-4
      ${leftIcon ? 'pl-10' : 'pl-4'}
      ${rightIcon ? 'pr-10' : 'pr-4'}
      py-3
      bg-theme-background
      border border-theme-primary
      rounded-lg
      text-theme-primary
      placeholder-theme-tertiary
      focus:outline-none
      focus:ring-2
      focus:ring-brand-primary
      focus:border-brand-primary
      transition-all duration-200
      ${error ? 'border-accent-red focus:ring-accent-red' : ''}
      ${variant === 'filled' ? 'bg-theme-secondary' : ''}
      ${variant === 'outlined' ? 'border-2' : ''}
    `;

    return (
      <div className="relative">
        {label && (
          <label
            htmlFor={finalInputId}
            className="block text-sm font-medium text-theme-primary mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={finalInputId} // 🆕 Usar ID controlado por estado
            type={inputType || props.type || 'text'}
            className={`${baseClasses} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-theme-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
