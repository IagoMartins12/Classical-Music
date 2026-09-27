'use client';

import React from 'react';
import { PiSpinnerGap } from 'react-icons/pi';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'google'
    | 'delete'
    | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses = `
    inline-flex cursor-pointer items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ouro focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden
  `;

  const variants = {
    primary: 'btn-classical-primary',
    secondary: 'btn-classical-secondary',
    delete: `
      btn-classical-secondary !bg-erro text-white font-bold focus:ring-erro focus:ring-opacity-50
    `,
    outline: `
      bg-transparent border-2 border-theme-accent text-brand-primary hover:bg-ouro hover:text-sobre-ouro hover:border-ouro
    `,
    ghost: `
      bg-transparent text-theme-secondary hover:text-ouro-texto hover:bg-ouro/10
    `,
    google: `
      bg-white text-texto-suave border border-linha hover:bg-sup-2 focus:ring-2 focus:ring-aviso focus:ring-opacity-50
    `,
    success: `
      bg-ok text-white hover:bg-ok focus:ring-2 focus:ring-ok focus:ring-opacity-50
    `,
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <PiSpinnerGap className={`animate-spin ${iconSizes[size]} mr-2`} />
      )}
      {!isLoading && leftIcon && (
        <span className={`${iconSizes[size]} mr-2`}>{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span
          className={`${iconSizes[size]} flex justify-center items-center ml-2 `}
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
