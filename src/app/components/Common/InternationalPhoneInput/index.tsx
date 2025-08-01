// components/Common/InternationalPhoneInput.tsx (versão corrigida)
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiPhone, FiChevronDown, FiX, FiTrendingUp } from 'react-icons/fi';

// 🌍 Dados dos países para telefone (com flags e formatação)
const PHONE_COUNTRIES = [
  {
    code: 'BR',
    name: 'Brasil',
    flag: '🇧🇷',
    dialCode: '+55',
    format: '(XX) XXXXX-XXXX',
    popular: true,
  },
  {
    code: 'US',
    name: 'Estados Unidos',
    flag: '🇺🇸',
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    popular: true,
  },
  {
    code: 'CA',
    name: 'Canadá',
    flag: '🇨🇦',
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    popular: true,
  },
  {
    code: 'GB',
    name: 'Reino Unido',
    flag: '🇬🇧',
    dialCode: '+44',
    format: 'XXXX XXX XXX',
    popular: true,
  },
  {
    code: 'FR',
    name: 'França',
    flag: '🇫🇷',
    dialCode: '+33',
    format: 'X XX XX XX XX',
    popular: true,
  },
  {
    code: 'DE',
    name: 'Alemanha',
    flag: '🇩🇪',
    dialCode: '+49',
    format: 'XXX XXXXXXXX',
    popular: true,
  },
  {
    code: 'IT',
    name: 'Itália',
    flag: '🇮🇹',
    dialCode: '+39',
    format: 'XXX XXX XXXX',
    popular: true,
  },
  {
    code: 'ES',
    name: 'Espanha',
    flag: '🇪🇸',
    dialCode: '+34',
    format: 'XXX XX XX XX',
    popular: true,
  },
  {
    code: 'AR',
    name: 'Argentina',
    flag: '🇦🇷',
    dialCode: '+54',
    format: 'XX XXXX XXXX',
  },
  {
    code: 'CL',
    name: 'Chile',
    flag: '🇨🇱',
    dialCode: '+56',
    format: 'X XXXX XXXX',
  },
  {
    code: 'CO',
    name: 'Colômbia',
    flag: '🇨🇴',
    dialCode: '+57',
    format: 'XXX XXX XXXX',
  },
  {
    code: 'MX',
    name: 'México',
    flag: '🇲🇽',
    dialCode: '+52',
    format: 'XX XXXX XXXX',
  },
  {
    code: 'JP',
    name: 'Japão',
    flag: '🇯🇵',
    dialCode: '+81',
    format: 'XX XXXX XXXX',
  },
  {
    code: 'CN',
    name: 'China',
    flag: '🇨🇳',
    dialCode: '+86',
    format: 'XXX XXXX XXXX',
  },
  {
    code: 'IN',
    name: 'Índia',
    flag: '🇮🇳',
    dialCode: '+91',
    format: 'XXXXX XXXXX',
  },
  {
    code: 'AU',
    name: 'Austrália',
    flag: '🇦🇺',
    dialCode: '+61',
    format: 'XXX XXX XXX',
  },
  {
    code: 'RU',
    name: 'Rússia',
    flag: '🇷🇺',
    dialCode: '+7',
    format: 'XXX XXX XX XX',
  },
  {
    code: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    dialCode: '+351',
    format: 'XXX XXX XXX',
  },
  {
    code: 'NL',
    name: 'Países Baixos',
    flag: '🇳🇱',
    dialCode: '+31',
    format: 'XX XXX XXXX',
  },
  {
    code: 'BE',
    name: 'Bélgica',
    flag: '🇧🇪',
    dialCode: '+32',
    format: 'XXX XX XX XX',
  },
  {
    code: 'CH',
    name: 'Suíça',
    flag: '🇨🇭',
    dialCode: '+41',
    format: 'XX XXX XX XX',
  },
  {
    code: 'AT',
    name: 'Áustria',
    flag: '🇦🇹',
    dialCode: '+43',
    format: 'XXX XXX XXXX',
  },
  {
    code: 'SE',
    name: 'Suécia',
    flag: '🇸🇪',
    dialCode: '+46',
    format: 'XX XXX XX XX',
  },
  {
    code: 'NO',
    name: 'Noruega',
    flag: '🇳🇴',
    dialCode: '+47',
    format: 'XXX XX XXX',
  },
  {
    code: 'DK',
    name: 'Dinamarca',
    flag: '🇩🇰',
    dialCode: '+45',
    format: 'XX XX XX XX',
  },
  {
    code: 'FI',
    name: 'Finlândia',
    flag: '🇫🇮',
    dialCode: '+358',
    format: 'XX XXX XXXX',
  },
];

interface PhoneCountry {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
  popular?: boolean;
}

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

// 🔧 FUNÇÕES AUXILIARES CORRIGIDAS
const parsePhoneNumber = (
  phone: string
): { countryCode: string; number: string } | null => {
  console.log('📞 Parseando telefone:', phone);

  if (!phone || !phone.startsWith('+')) {
    return null;
  }

  // Tentar encontrar o país pelo dialCode mais longo primeiro
  let matchedCountry = null;
  let matchedDialCode = '';

  // Ordenar por dialCode (mais longo primeiro para evitar conflitos como +1 vs +1242)
  const sortedCountries = [...PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const country of sortedCountries) {
    if (phone.startsWith(country.dialCode)) {
      matchedCountry = country;
      matchedDialCode = country.dialCode;
      break;
    }
  }

  if (!matchedCountry) {
    console.log('❌ Nenhum país encontrado para o telefone:', phone);
    return null;
  }

  const number = phone.slice(matchedDialCode.length).replace(/\D/g, '');

  console.log('✅ Telefone parseado:', {
    countryCode: matchedCountry.code,
    dialCode: matchedDialCode,
    number,
  });

  return {
    countryCode: matchedCountry.code,
    number,
  };
};

const formatPhoneNumber = (number: string, country: PhoneCountry): string => {
  if (!number) return '';

  // Remove caracteres não numéricos
  const digits = number.replace(/\D/g, '');

  // Aplica formatação baseada no país
  let formatted = '';
  let digitIndex = 0;

  for (
    let i = 0;
    i < country.format.length && digitIndex < digits.length;
    i++
  ) {
    const char = country.format[i];
    if (char === 'X') {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += char;
    }
  }

  // Adiciona dígitos restantes se houver
  if (digitIndex < digits.length) {
    formatted += digits.slice(digitIndex);
  }

  return formatted;
};

const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Telefone',
  error,
  placeholder = 'Digite seu número',
  showLabel = true,
  defaultCountry = 'BR',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountry);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔍 DETECTAR PAÍS ATUAL BASEADO NO VALOR - CORRIGIDO!
  const currentCountry = useMemo(() => {
    console.log('🔍 Detectando país para o value:', value);

    if (value) {
      const parsed = parsePhoneNumber(value);
      if (parsed && parsed.countryCode) {
        const foundCountry = PHONE_COUNTRIES.find(
          (c) => c.code === parsed.countryCode
        );
        console.log('🎯 País detectado:', foundCountry);

        if (foundCountry) {
          // Atualizar o estado local para manter consistência
          if (selectedCountryCode !== foundCountry.code) {
            setSelectedCountryCode(foundCountry.code);
          }
          return foundCountry;
        }
      }
    }

    // Fallback para o país padrão ou selecionado
    const fallbackCountry =
      PHONE_COUNTRIES.find((c) => c.code === selectedCountryCode) ||
      PHONE_COUNTRIES.find((c) => c.code === defaultCountry) ||
      PHONE_COUNTRIES[0];

    console.log('🔄 Usando país fallback:', fallbackCountry);
    return fallbackCountry;
  }, [value, selectedCountryCode, defaultCountry]);

  // 📱 Extrair número local do valor completo - CORRIGIDO!
  useEffect(() => {
    console.log('📱 Atualizando número local para value:', value);

    if (value && currentCountry) {
      const parsed = parsePhoneNumber(value);
      if (parsed) {
        console.log('✅ Número local extraído:', parsed.number);
        setLocalNumber(parsed.number);
      } else {
        console.log('❌ Erro ao extrair número local');
        setLocalNumber('');
      }
    } else {
      console.log('🧹 Limpando número local (value vazio)');
      setLocalNumber('');
    }
  }, [value, currentCountry]);

  // 🏆 Filtrar países (populares primeiro, depois por busca)
  const filteredCountries = useMemo(() => {
    let countries = PHONE_COUNTRIES;

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      countries = countries.filter(
        (country) =>
          country.name.toLowerCase().includes(lowerSearchTerm) ||
          country.dialCode.includes(lowerSearchTerm) ||
          country.code.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Separar populares dos outros
    const popular = countries.filter((c) => c.popular);
    const others = countries.filter((c) => !c.popular);

    return [...popular, ...others];
  }, [searchTerm]);

  // 🔄 ATUALIZAR TELEFONE COMPLETO - CORRIGIDO!
  const updateFullPhone = (country: PhoneCountry, number: string) => {
    console.log('🔄 Atualizando telefone completo:', {
      country: country.code,
      number,
    });

    if (number && number.trim()) {
      const cleanNumber = number.replace(/\D/g, '');
      const fullPhone = `${country.dialCode}${cleanNumber}`;
      console.log('✅ Telefone completo gerado:', fullPhone);
      onChange(fullPhone);
    } else {
      console.log('🧹 Limpando telefone (número vazio)');
      onChange('');
    }
  };

  // 🎯 HANDLERS CORRIGIDOS
  const handleCountrySelect = (country: PhoneCountry) => {
    console.log('🌍 País selecionado:', country);

    setSelectedCountryCode(country.code);
    updateFullPhone(country, localNumber);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cleanValue = inputValue.replace(/\D/g, '');

    console.log('📝 Número alterado:', { inputValue, cleanValue });

    if (currentCountry) {
      setLocalNumber(cleanValue);
      updateFullPhone(currentCountry, cleanValue);
    }
  };

  const handleClear = () => {
    console.log('🧹 Limpando telefone');
    setLocalNumber('');
    onChange('');
  };

  // 📱 Número formatado para exibição
  const formattedNumber = useMemo(() => {
    if (localNumber && currentCountry) {
      const formatted = formatPhoneNumber(localNumber, currentCountry);
      console.log('🎨 Número formatado:', { localNumber, formatted });
      return formatted;
    }
    return localNumber;
  }, [localNumber, currentCountry]);

  // 🖱️ Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // 🐛 Debug melhorado
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 PhoneInput State:', {
        value,
        currentCountry: currentCountry?.code,
        localNumber,
        formattedNumber,
        selectedCountryCode,
      });
    }
  }, [
    value,
    currentCountry,
    localNumber,
    formattedNumber,
    selectedCountryCode,
  ]);

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && label && (
        <label className="block text-sm font-medium text-theme-secondary">
          <FiPhone className="w-4 h-4 inline mr-2" />
          {label}
        </label>
      )}

      <div className="relative z-[120]">
        <div className="flex">
          {/* 🌍 Seletor de País */}
          <div className="relative">
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className={`
                input-classical !rounded-r-none border-r-0 !px-3 !py-2 flex items-center space-x-2
                h-full
                ${
                  disabled
                    ? 'cursor-not-allowed opacity-50'
                    : 'cursor-pointer hover:border-brand-primary'
                }
                ${isOpen ? 'border-brand-primary' : ''}
              `}
            >
              {currentCountry && (
                <>
                  <span className="text-lg">{currentCountry.flag}</span>
                  <span className="text-sm font-medium text-theme-primary">
                    {currentCountry.dialCode}
                  </span>
                </>
              )}
              <FiChevronDown
                className={`w-3 h-3 text-theme-tertiary transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* 🎨 Dropdown Elegante */}
            {isOpen && !disabled && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 w-80 mt-1 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[500] max-h-80 overflow-hidden"
              >
                {/* 🏷️ Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
                  <FiTrendingUp className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-medium text-theme-secondary">
                    Selecionar País
                  </span>
                </div>

                {/* 🔍 Campo de Busca */}
                <div className="p-3 border-b border-theme-secondary">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar país ou código..."
                    className="w-full px-3 py-2 text-sm bg-theme-secondary bg-opacity-50 border border-theme-secondary rounded-md focus:outline-none focus:border-brand-primary transition-colors"
                    autoFocus
                  />
                </div>

                {/* 📋 Lista de Países */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => handleCountrySelect(country)}
                        className={`
                          w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 
                          border-b last:border-b-0 border-theme-secondary
                          ${
                            currentCountry?.code === country.code
                              ? 'bg-brand-primary/10 text-brand-primary font-medium'
                              : 'text-theme-primary'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <span className="text-lg flex-shrink-0">
                              {country.flag}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium truncate">
                                {country.name}
                              </div>
                              <div className="text-xs text-theme-tertiary truncate">
                                {country.dialCode} • {country.format}
                              </div>
                            </div>
                          </div>
                          {country.popular && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-brand-primary/10 text-brand-primary flex-shrink-0 ml-2">
                              Popular
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <FiPhone className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-secondary">
                        {searchTerm
                          ? `Nenhum país encontrado para "${searchTerm}"`
                          : 'Nenhum país disponível'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 📱 Campo do Número */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="tel"
              value={formattedNumber}
              onChange={handleNumberChange}
              placeholder={
                currentCountry?.format.replace(/X/g, '0') || placeholder
              }
              disabled={disabled}
              className={`
                input-classical !rounded-l-none w-full pr-10
                ${error ? 'border-accent-red focus:border-accent-red' : ''}
                ${
                  disabled
                    ? 'bg-theme-secondary bg-opacity-50 cursor-not-allowed text-theme-tertiary'
                    : ''
                }
              `}
            />

            {/* 🗑️ Botão Limpar */}
            {(value || localNumber) && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ❌ Erro */}
        {error && (
          <p className="text-xs text-accent-red flex items-center space-x-1 mt-1">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        {/* ℹ️ Info sobre formatação */}
        {!error && !disabled && currentCountry && (
          <p className="text-xs text-theme-tertiary mt-1">
            Formato: {currentCountry.flag} {currentCountry.dialCode}{' '}
            {currentCountry.format}
          </p>
        )}

        {/* 🐛 Debug info (apenas em desenvolvimento) */}
        {process.env.NODE_ENV === 'development' && value && (
          <div className="mt-2 p-2 bg-theme-secondary bg-opacity-20 rounded text-xs">
            <div className="text-theme-tertiary">
              <strong>🔍 Debug:</strong> {value} | País: {currentCountry?.code}{' '}
              | Local: {localNumber} | Flag: {currentCountry?.flag}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternationalPhoneInput;
