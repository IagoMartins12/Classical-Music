// app/components/Common/Inputs/index.tsx - VERSÃO CORRIGIDA
'use client';

import React, { forwardRef, useId, useState, useEffect } from 'react';
import { PiEye, PiEyeSlash, PiWarningCircle } from 'react-icons/pi';
import { Text } from '@/app/components/ui/Text';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
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

    // A aparência vem de `.input-classical` (globals.css), a mesma de todo
    // campo do produto. Aqui fica só o que é deste componente: o recuo para
    // os ícones e as variantes.
    const baseClasses = `
      input-classical w-full
      ${leftIcon ? 'pl-10' : 'pl-4'}
      ${rightIcon || isPassword ? 'pr-10' : 'pr-4'}
      ${variant === 'filled' ? 'bg-theme-secondary' : ''}
    `;
    const idErro = finalInputId && `${finalInputId}-erro`;
    const idAjuda = finalInputId && `${finalInputId}-ajuda`;

    return (
      <div className={`relative ${widhtFull && 'w-full'}`}>
        {label && (
          <label
            htmlFor={finalInputId}
            className="block t-rotulo font-medium text-texto mb-2"
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
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? idErro : helperText ? idAjuda : undefined}
            {...props}
          />

          {(rightIcon || isPassword) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-theme-tertiary transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <PiEyeSlash className="w-4 h-4" />
                  ) : (
                    <PiEye className="w-4 h-4" />
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
            <PiWarningCircle className="text-erro" />
            <p id={idErro} className="mt-1 t-rotulo text-erro">
              {error}
            </p>
          </div>
        )}

        {helperText && !error && (
          <Text papel="rotulo" tom="fraco" as="p" id={idAjuda} className="mt-1">
            {helperText}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
