// components/Common/InternationalPhoneInput.tsx
'use client';

import React from 'react';
import { PhoneInput } from 'react-international-phone';
import { FiPhone } from 'react-icons/fi';
import 'react-international-phone/style.css';

interface InternationalPhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  placeholder?: string;
  showLabel?: boolean;
  defaultCountry?: string;
}

const InternationalPhoneInput2: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Telefone',
  error,
  placeholder = 'Digite seu número',
  showLabel = true,
  defaultCountry = 'br', // Brasil como padrão
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && label && (
        <label className="block text-sm font-medium text-theme-secondary">
          <FiPhone className="w-4 h-4 inline mr-2" />
          {label}
        </label>
      )}

      <div className="relative">
        <PhoneInput
          defaultCountry={defaultCountry}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className="international-phone-input"
          inputProps={{
            className: `
              input-classical !pl-16 
              ${error ? 'border-accent-red focus:border-accent-red' : ''}
              ${
                disabled
                  ? 'bg-theme-secondary bg-opacity-50 cursor-not-allowed text-theme-tertiary'
                  : ''
              }
            `,
            disabled,
          }}
          countrySelectorStyleProps={{
            buttonClassName: `
              !bg-transparent !border-none !outline-none
              hover:!bg-theme-secondary hover:!bg-opacity-30 
              focus:!bg-theme-secondary focus:!bg-opacity-30
              !rounded-l-lg !px-3 !py-2 !-top-4
              ${
                disabled ? '!cursor-not-allowed !opacity-50' : '!cursor-pointer'
              }
            `,
            dropdownStyleProps: {
              className: `
                !bg-theme-primary  !border-theme-secondary !shadow-lg
                !max-h-60 !overflow-y-auto
                !rounded-lg !mt-1 !top-5
              `,
              listItemClassName: `
                !text-theme-primary hover:!bg-theme-primary hover:!bg-opacity-50
                !px-3 !py-2 !cursor-pointer
                focus:!bg-brand-primary focus:!bg-opacity-10
              `,
            },
            style: {
              backgroundColor: '#000000',
            },
          }}
        />
      </div>

      {error && (
        <p className="text-xs text-accent-red flex items-center space-x-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      )}

      {/* Info sobre formatação */}
      {!error && !disabled && (
        <p className="text-xs text-theme-tertiary">
          O número será formatado automaticamente para o país selecionado
        </p>
      )}

      {/* Debug info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && value && (
        <div className="mt-2 p-2 bg-theme-secondary bg-opacity-20 rounded text-xs">
          <div className="text-theme-tertiary">
            <strong>Debug:</strong> {value}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternationalPhoneInput2;
