// components/ui/Input.tsx
'use client';

import React, { forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      isPassword = false,
      type = 'text',
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`relative ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-theme-secondary mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-[38%] transform -translate-y-1/2 text-theme-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`
              input-classical w-full
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon || isPassword ? 'pr-10' : 'pr-4'}
              ${error ? 'border-accent-red focus:border-accent-red' : ''}
              ${className}
            `}
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

        {error && <p className="mt-1 text-sm text-accent-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
