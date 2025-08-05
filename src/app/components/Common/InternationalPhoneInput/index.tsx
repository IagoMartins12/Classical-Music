// components/Common/InternationalPhoneInput.tsx (VERSÃO COMPLETA com todos os países)
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FiPhone, FiChevronDown, FiX, FiGlobe } from 'react-icons/fi';
import {
  ALL_PHONE_COUNTRIES,
  PhoneCountry,
  getPhoneCountryByCode,
  searchPhoneCountries,
} from '@/app/utils/phones_and_location/completePhoneCountries';
import {
  formatPhoneNumberWithLimit,
  getFormattedPlaceholder,
  handlePhonePaste,
} from '@/app/utils/phones_and_location/countryTranslations';

export interface InternationalPhoneInputProps {
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

// 🔧 Função para parsear número de telefone com nova base de dados
const parsePhoneNumber = (
  phone: string
): {
  countryCode: string;
  number: string;
  country: PhoneCountry;
} | null => {
  if (!phone || !phone.startsWith('+')) {
    return null;
  }

  // Ordenar por dialCode (mais longo primeiro para evitar conflitos)
  const sortedCountries = [...ALL_PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const country of sortedCountries) {
    if (phone.startsWith(country.dialCode)) {
      const number = phone.slice(country.dialCode.length).replace(/\D/g, '');

      return {
        countryCode: country.code,
        number,
        country,
      };
    }
  }

  console.log('❌ Nenhum país encontrado para o telefone:', phone);
  return null;
};

const InternationalPhoneInput: React.FC<InternationalPhoneInputProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  label = 'Telefone',
  error,
  placeholder,
  showLabel = true,
  defaultCountry = '+55',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localNumber, setLocalNumber] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] =
    useState(defaultCountry);
  const [warningMessage, setWarningMessage] = useState<string>('');

  console.log('selected', selectedCountryCode);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔍 Detectar país atual usando a nova base completa
  const currentCountry = useMemo(() => {
    if (value) {
      const parsed = parsePhoneNumber(value);
      if (parsed && parsed.countryCode) {
        const foundCountry = getPhoneCountryByCode(parsed.countryCode);
        console.log('🎯 País detectado:', foundCountry);

        if (foundCountry) {
          if (selectedCountryCode !== foundCountry.code) {
            setSelectedCountryCode(foundCountry.code);
          }
          return foundCountry;
        }
      }
    }

    const fallbackCountry =
      getPhoneCountryByCode(selectedCountryCode) ||
      getPhoneCountryByCode(defaultCountry) ||
      ALL_PHONE_COUNTRIES[0];

    console.log('🔄 Usando país fallback:', fallbackCountry);
    return fallbackCountry;
  }, [value, selectedCountryCode, defaultCountry]);

  // 📱 Extrair número local do valor completo
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

  // 🎯 HANDLER MELHORADO COM FORMATAÇÃO E LIMITAÇÃO
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentCountry) return;

    const inputValue = e.target.value;
    console.log('📝 Input original:', inputValue);

    // Usar a função de formatação com limite
    const { formattedValue, rawDigits, isComplete, maxReached } =
      formatPhoneNumberWithLimit(inputValue, currentCountry);

    console.log('📱 Resultado da formatação:', {
      formattedValue,
      rawDigits,
      isComplete,
      maxReached,
    });

    // Mostrar aviso se chegou no limite
    if (maxReached) {
    } else {
      setWarningMessage('');
    }

    // Atualizar o valor do input com a formatação
    e.target.value = formattedValue;

    // Atualizar estados
    setLocalNumber(rawDigits);

    // Gerar telefone completo
    if (rawDigits) {
      const fullPhone = `${currentCountry.dialCode}${rawDigits}`;
      console.log('✅ Telefone completo gerado:', fullPhone);
      onChange(fullPhone);
    } else {
      console.log('🧹 Limpando telefone');
      onChange('');
    }
  };

  // 📋 HANDLER PARA PASTE COM VALIDAÇÃO
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!currentCountry) return;

    const pastedText = e.clipboardData.getData('text');
    console.log('📋 Texto colado:', pastedText);

    const { shouldAccept, processedValue, warning } = handlePhonePaste(
      pastedText,
      currentCountry
    );

    if (!shouldAccept) {
      e.preventDefault();
      return;
    }

    if (warning) {
      setWarningMessage(warning);
      setTimeout(() => setWarningMessage(''), 3000);
    }

    // Deixar o evento normal acontecer, mas com o valor processado
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.value = processedValue;
        const changeEvent = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(changeEvent);
      }
    }, 0);
  };

  // 🏆 Filtrar países com busca inteligente
  const filteredCountries = useMemo(() => {
    const searchResults = searchPhoneCountries(searchTerm);

    // Se não há busca, retornar organizados (populares primeiro)
    if (!searchTerm) {
      const popular = searchResults.filter((c) => c.popular);
      const others = searchResults.filter((c) => !c.popular);
      return [...popular, ...others];
    }

    // Com busca, manter ordem de relevância
    return searchResults;
  }, [searchTerm]);

  // 🎯 Handler para seleção de país
  const handleCountrySelect = (country: PhoneCountry) => {
    console.log('🌍 País selecionado:', country);

    setSelectedCountryCode(country.code);

    // Se já existe número local, reformatar para o novo país
    if (localNumber) {
      const { rawDigits } = formatPhoneNumberWithLimit(localNumber, country);
      const fullPhone = `${country.dialCode}${rawDigits}`;
      onChange(fullPhone);
    }

    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.focus();
  };

  // 📱 Número formatado para exibição
  const formattedNumber = useMemo(() => {
    if (localNumber && currentCountry) {
      const { formattedValue } = formatPhoneNumberWithLimit(
        localNumber,
        currentCountry
      );
      return formattedValue;
    }
    return localNumber;
  }, [localNumber, currentCountry]);

  // 🎨 Placeholder formatado
  const dynamicPlaceholder = useMemo(() => {
    if (currentCountry) {
      return getFormattedPlaceholder(currentCountry);
    }
    return placeholder || 'Digite seu número';
  }, [currentCountry, placeholder]);

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
        totalCountries: ALL_PHONE_COUNTRIES.length,
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
                h-full min-w-[120px]
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
                  <span className="text-lg flex-shrink-0">
                    {currentCountry.flag}
                  </span>
                  <span className="text-sm font-medium text-theme-primary truncate">
                    {currentCountry.dialCode}
                  </span>
                </>
              )}
              <FiChevronDown
                className={`w-3 h-3 text-theme-tertiary transition-transform duration-200 flex-shrink-0 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* 🎨 Dropdown Completo com TODOS os países */}
            {isOpen && !disabled && (
              <div
                ref={dropdownRef}
                className="absolute top-full left-0 w-80 mt-1 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[500] max-h-80 overflow-hidden"
              >
                {/* 🏷️ Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
                  <FiGlobe className="w-4 h-4 text-brand-primary" />
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
                    placeholder="Buscar país, código ou DDD..."
                    className="w-full px-3 py-2 text-sm bg-theme-secondary bg-opacity-50 border border-theme-secondary rounded-md focus:outline-none focus:border-brand-primary transition-colors"
                    autoFocus
                  />
                </div>

                {/* 📋 Lista de Países */}
                <div className="max-h-64 overflow-y-auto">
                  {filteredCountries.length > 0 ? (
                    <>
                      {/* 🏆 Seção de Populares (se não há busca) */}
                      {!searchTerm &&
                        filteredCountries.some((c) => c.popular) && (
                          <>
                            <div className="px-4 py-2 bg-brand-primary/5">
                              <span className="text-xs font-medium text-brand-primary uppercase tracking-wide">
                                🏆 Populares
                              </span>
                            </div>
                            {filteredCountries
                              .filter((c) => c.popular)
                              .map((country) => (
                                <CountryOption
                                  key={`popular-${country.code}`}
                                  country={country}
                                  isSelected={
                                    currentCountry?.code === country.code
                                  }
                                  onClick={() => handleCountrySelect(country)}
                                />
                              ))}

                            <div className="px-4 py-2 bg-theme-secondary/5 border-t border-theme-secondary">
                              <span className="text-xs font-medium text-theme-secondary uppercase tracking-wide">
                                🌍 Todos os Países
                              </span>
                            </div>
                          </>
                        )}

                      {/* 📋 Lista Principal */}
                      {(searchTerm
                        ? filteredCountries
                        : filteredCountries.filter((c) => !c.popular)
                      ).map((country) => (
                        <CountryOption
                          key={country.code}
                          country={country}
                          isSelected={currentCountry?.code === country.code}
                          onClick={() => handleCountrySelect(country)}
                        />
                      ))}
                    </>
                  ) : (
                    // 🚫 Estado Vazio
                    <div className="px-4 py-8 text-center">
                      <FiGlobe className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-secondary">
                        {searchTerm
                          ? `Nenhum país encontrado para "${searchTerm}"`
                          : 'Nenhum país disponível'}
                      </p>
                      {searchTerm && (
                        <p className="text-xs text-theme-tertiary mt-1">
                          Tente buscar por nome, código ou DDD
                        </p>
                      )}
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
              onPaste={handlePaste}
              placeholder={dynamicPlaceholder}
              disabled={disabled}
              className={`
                input-classical !rounded-l-none w-full pr-10
                ${error ? 'border-accent-red focus:border-accent-red' : ''}
                ${
                  warningMessage
                    ? 'border-orange-400 focus:border-orange-400'
                    : ''
                }
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
                onClick={() => {
                  setLocalNumber('');
                  onChange('');
                  setWarningMessage('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ⚠️ Mensagem de Aviso */}
        {warningMessage && (
          <p className="text-xs text-orange-600 flex items-center space-x-1 mt-1 animate-pulse">
            <span>⚠️</span>
            <span>{warningMessage}</span>
          </p>
        )}

        {/* ❌ Erro */}
        {error && !warningMessage && (
          <p className="text-xs text-accent-red flex items-center space-x-1 mt-1">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        {/* ✅ Indicador de Progresso */}
        {localNumber && currentCountry && (
          <div className="mt-1">
            {localNumber.length !== currentCountry.maxDigits && (
              <p className="text-xs text-theme-tertiary">
                {localNumber.length}/{currentCountry.maxDigits} dígitos
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// 🎨 Componente para opção de país (reutilizável)
const CountryOption: React.FC<{
  country: PhoneCountry;
  isSelected: boolean;
  onClick: () => void;
}> = ({ country, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 
      border-b last:border-b-0 border-theme-secondary
      ${
        isSelected
          ? 'bg-brand-primary/10 text-brand-primary font-medium'
          : 'text-theme-primary'
      }
    `}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <span className="text-lg flex-shrink-0">{country.flag}</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{country.name}</div>
          <div className="text-xs text-theme-tertiary truncate">
            {country.dialCode} • {country.format} • {country.maxDigits} dígitos
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
);

export default InternationalPhoneInput;
