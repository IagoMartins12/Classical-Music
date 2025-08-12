// app/components/Common/Inputs/index.tsx - VERSÃO CORRIGIDA
'use client';

import React, { forwardRef, useId, useState, useEffect } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MdErrorOutline } from 'react-icons/md';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  inputType?: string;
  isPassword?: boolean;
  widhtFull?: boolean;

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
      isPassword = false,
      className = '',
      inputType,
      customId, // 🆕 ID customizado
      widhtFull,
      ...props
    },
    ref
  ) => {
    // 🆕 Estado para controlar se o componente foi hidratado
    const [isHydrated, setIsHydrated] = useState(false);
    const [showPassword, setShowPassword] = React.useState(false);
    const inputType2 = isPassword
      ? showPassword
        ? 'text'
        : 'password'
      : inputType;

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
      ${error ? '!border-red-400 !focus:ring-accent-red' : ''}
      ${variant === 'filled' ? 'bg-theme-secondary' : ''}
      ${variant === 'outlined' ? 'border-2' : ''}
    `;

    return (
      <div className={`relative ${widhtFull && 'w-full'}`}>
        {label && (
          <label
            htmlFor={finalInputId}
            className="block  text-sm font-medium text-theme-primary mb-2"
          >
            {label}
          </label>
        )}

        <div className={`relative ${widhtFull && 'w-full'}`}>
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={finalInputId} // 🆕 Usar ID controlado por estado
            type={inputType2 || inputType || props.type || 'text'}
            className={`${baseClasses} ${className}`}
            {...props}
          />

          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-theme-tertiary hover:text-brand-primary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-4 h-4" />
                  ) : (
                    <FiEye className="w-4 h-4" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="flex gap-2 items-center mt-1">
            <MdErrorOutline className="text-red-500" />
            <p className="mt-1 text-sm text-red-400">{error}</p>
          </div>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-theme-tertiary">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
