// components/Common/LocationSelector.tsx (versão corrigida)
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Country, State, City } from 'country-state-city';
import {
  FiMapPin,
  FiChevronDown,
  FiX,
  FiGlobe,
  FiMap,
  FiHome,
  FiTrendingUp,
} from 'react-icons/fi';
import { FaGlobeAmericas, FaMapPin, FaCity } from 'react-icons/fa';
import { translateCountryName } from '@/app/utils/phones_and_location/countryTranslations';

interface LocationData {
  country?: {
    isoCode: string;
    name: string;
    flag: string;
  };
  state?: {
    isoCode: string;
    name: string;
    countryCode: string;
  };
  city?: {
    name: string;
    stateCode: string;
    countryCode: string;
  };
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
  variant?: 'default' | 'compact';
}

interface SelectWithSearchProps {
  options: Array<{
    value: string;
    label: string;
    extra?: string;
    flag?: string;
  }>;
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  searchPlaceholder: string;
  leftIcon?: React.ReactNode;
  onClear?: () => void;
  headerLabel?: string;
  headerIcon?: React.ReactNode;
  emptyMessage?: string;
  isLoading?: boolean;
}

// 🎨 Componente Select Elegante (versão corrigida)
const ElegantSelectWithSearch: React.FC<SelectWithSearchProps> = ({
  options,
  value,
  onChange,
  placeholder,
  disabled = false,
  searchPlaceholder,
  leftIcon,
  onClear,
  headerLabel,
  headerIcon,
  emptyMessage,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar opções baseado na busca
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(lowerSearchTerm) ||
        (option.extra && option.extra.toLowerCase().includes(lowerSearchTerm))
    );
  }, [options, searchTerm]);

  // Encontrar opção selecionada
  const selectedOption = options.find((opt) => opt.value === value);

  // Resetar busca quando fechar
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Ajustar z-index quando abrir/fechar
  useEffect(() => {
    if (containerRef.current) {
      if (isOpen) {
        containerRef.current.style.zIndex = '9999';
      } else {
        // Pequeno delay para evitar flicker
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.zIndex = '1';
          }
        }, 200);
      }
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClear) {
      onClear();
    }
    setIsOpen(false);
  };

  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  // Valor a ser exibido no input principal (quando fechado)
  const displayValue = isOpen ? searchTerm : selectedOption?.label || '';

  return (
    <div ref={containerRef} className="relative" style={{ zIndex: 1 }}>
      {/* Input Principal */}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
            {leftIcon}
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          placeholder={!selectedOption ? placeholder : ''}
          value={displayValue}
          onChange={handleSearchChange}
          onClick={handleInputClick}
          className={`
            input-classical w-full transition-all duration-200
            ${leftIcon ? 'pl-11' : 'pl-4'} pr-12
            ${
              disabled
                ? 'cursor-not-allowed opacity-50'
                : 'cursor-pointer hover:border-brand-primary'
            }
            ${isOpen ? 'border-brand-primary' : ''}
            ${
              selectedOption
                ? 'text-theme-primary font-medium'
                : 'text-theme-secondary'
            }
          `}
          disabled={disabled}
          readOnly={!isOpen}
        />

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 z-10">
          {selectedOption && onClear && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-theme-secondary hover:bg-opacity-30 rounded-full transition-colors"
            >
              <FiX className="w-3 h-3 text-theme-tertiary hover:text-theme-primary" />
            </button>
          )}
          <FiChevronDown
            className={`w-4 h-4 text-theme-tertiary transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* 🎨 Dropdown Elegante */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-2xl max-h-80 overflow-hidden"
          style={{ zIndex: 10000 }}
        >
          {/* 🏷️ Header com Label */}
          {headerLabel && (
            <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
              {headerIcon}
              <span className="text-sm font-medium text-theme-secondary">
                {headerLabel}
              </span>
            </div>
          )}

          {/* 🔍 Campo de Busca (dentro do dropdown) */}
          <div className="p-3 border-b border-theme-secondary">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full px-3 py-2 text-sm bg-theme-secondary bg-opacity-50 border border-theme-secondary rounded-md focus:outline-none focus:border-brand-primary transition-colors"
              autoFocus
            />
          </div>

          {/* ⏳ Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-theme-secondary">
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Carregando opções...</span>
              </div>
            </div>
          )}

          {/* 📋 Lista de Opções */}
          {!isLoading && (
            <div className="max-h-64 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 
                      border-b last:border-b-0 border-theme-secondary
                      ${
                        value === option.value
                          ? 'bg-brand-primary/10 text-brand-primary font-medium'
                          : 'text-theme-primary'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 flex items-center space-x-3">
                        {/* 🏳️ Flag (se disponível) */}
                        {option.flag && (
                          <span className="text-lg flex-shrink-0">
                            {option.flag}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {option.label}
                          </div>
                          {option.extra && (
                            <div className="text-xs text-theme-tertiary truncate mt-0.5">
                              {option.extra}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                // 🚫 Estado Vazio
                <div className="px-4 py-8 text-center">
                  <FiMapPin className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                  <p className="text-sm text-theme-secondary">
                    {emptyMessage ||
                      (searchTerm
                        ? `Nenhum resultado encontrado para "${searchTerm}"`
                        : 'Nenhuma opção disponível')}
                  </p>
                  {searchTerm && (
                    <p className="text-xs text-theme-tertiary mt-1">
                      Tente uma busca mais geral
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  showLabels = true,
}) => {
  // 🌍 Preparar opções de países com flags
  const countryOptions = useMemo(() => {
    return Country.getAllCountries().map((country) => ({
      value: country.isoCode,
      label: translateCountryName(country.name), // 🔄 TRADUÇÃO APLICADA AQUI!
      extra: country.isoCode,
      flag: country.flag,
      originalName: country.name, // Manter nome original para debug
    }));
  }, []);

  useEffect(() => {
    if (!value.country) {
      const br = Country.getCountryByCode('BR');
      if (br) {
        onChange({
          country: {
            isoCode: br.isoCode,
            name: br.name,
            flag: br.flag,
          },
          state: undefined,
          city: undefined,
        });
      }
    }
  }, [value.country, onChange]);

  // 🗺️ Preparar opções de estados (dependente do país selecionado)
  const stateOptions = useMemo(() => {
    if (!value.country?.isoCode) return [];

    const states = State.getStatesOfCountry(value.country.isoCode);
    return states.map((state) => ({
      value: state.isoCode,
      label: state.name,
      extra: state.isoCode,
    }));
  }, [value.country?.isoCode]);

  // 🏙️ Preparar opções de cidades (dependente do país e estado selecionados)
  const cityOptions = useMemo(() => {
    if (!value.country?.isoCode || !value.state?.isoCode) return [];

    const cities = City.getCitiesOfState(
      value.country.isoCode,
      value.state.isoCode
    );
    return cities.map((city) => ({
      value: city.name,
      label: city.name,
    }));
  }, [value.country?.isoCode, value.state?.isoCode]);

  // 🎯 Handlers para mudança de seleção - CORRIGIDO!
  const handleCountryChange = (countryCode: string) => {
    console.log('🌍 Selecionando país com código:', countryCode);

    if (!countryCode) {
      onChange({
        country: undefined,
        state: undefined,
        city: undefined,
      });
      return;
    }

    const country = Country.getCountryByCode(countryCode);
    console.log('🌍 País encontrado na biblioteca:', country);

    if (country) {
      // 🔧 CORREÇÃO: Acessar as propriedades corretamente
      const countryData = {
        isoCode: country.isoCode || countryCode,
        name: country.name || '',
        flag: country.flag || '🏳️',
      };

      console.log('🌍 Dados do país processados:', countryData);

      onChange({
        country: countryData,
        state: undefined,
        city: undefined,
      });
    } else {
      console.warn('❌ País não encontrado para o código:', countryCode);
    }
  };

  const handleStateChange = (stateCode: string) => {
    console.log('🗺️ Selecionando estado com código:', stateCode);

    if (!value.country?.isoCode || !stateCode) {
      onChange({
        ...value,
        state: undefined,
        city: undefined,
      });
      return;
    }

    const state = State.getStateByCodeAndCountry(
      stateCode,
      value.country.isoCode
    );
    console.log('🗺️ Estado encontrado na biblioteca:', state);

    if (state) {
      onChange({
        ...value,
        state: {
          isoCode: state.isoCode,
          name: state.name,
          countryCode: state.countryCode,
        },
        // Limpar cidade quando trocar estado
        city: undefined,
      });
    }
  };

  const handleCityChange = (cityName: string) => {
    console.log('🏙️ Selecionando cidade:', cityName);

    if (!value.country?.isoCode || !value.state?.isoCode || !cityName) {
      onChange({
        ...value,
        city: undefined,
      });
      return;
    }

    onChange({
      ...value,
      city: {
        name: cityName,
        stateCode: value.state.isoCode,
        countryCode: value.country.isoCode,
      },
    });
  };

  // 🗑️ Handlers para limpar seleções
  const handleClearCountry = () => {
    onChange({
      country: undefined,
      state: undefined,
      city: undefined,
    });
  };

  const handleClearState = () => {
    onChange({
      ...value,
      state: undefined,
      city: undefined,
    });
  };

  const handleClearCity = () => {
    onChange({
      ...value,
      city: undefined,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 🌍 País */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            <FaGlobeAmericas className="w-4 h-4 inline mr-2" />
            País
          </label>
        )}
        <ElegantSelectWithSearch
          options={countryOptions}
          value={value.country?.isoCode}
          onChange={handleCountryChange}
          placeholder="Selecione um país"
          searchPlaceholder="Buscar país..."
          disabled={disabled}
          leftIcon={
            value.country?.flag ? (
              <span className="text-lg">{value.country.flag}</span>
            ) : (
              <FiGlobe className="w-4 h-4 text-theme-tertiary" />
            )
          }
          onClear={value.country ? handleClearCountry : undefined}
          headerLabel="Países Disponíveis"
          headerIcon={<FiTrendingUp className="w-4 h-4 text-brand-primary" />}
          emptyMessage="Nenhum país encontrado"
        />
      </div>

      {/* 🗺️ Estado */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            <FaMapPin className="w-4 h-4 inline mr-2" />
            Estado/Região
          </label>
        )}
        <ElegantSelectWithSearch
          options={stateOptions}
          value={value.state?.isoCode}
          onChange={handleStateChange}
          placeholder={
            value.country ? 'Selecione um estado' : 'Primeiro selecione um país'
          }
          searchPlaceholder="Buscar estado..."
          disabled={disabled || !value.country}
          leftIcon={<FiMap className="w-4 h-4 text-theme-tertiary" />}
          onClear={value.state ? handleClearState : undefined}
          headerLabel={
            value.country ? `Estados de ${value.country.name}` : 'Estados'
          }
          headerIcon={<FiMap className="w-4 h-4 text-brand-primary" />}
          emptyMessage={
            value.country
              ? 'Nenhum estado encontrado'
              : 'Selecione um país primeiro'
          }
        />
        {!value.country && !disabled && (
          <p className="text-xs text-theme-tertiary mt-1">
            Selecione um país primeiro
          </p>
        )}
      </div>

      {/* 🏙️ Cidade */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            <FaCity className="w-4 h-4 inline mr-2" />
            Cidade
          </label>
        )}
        <ElegantSelectWithSearch
          options={cityOptions}
          value={value.city?.name}
          onChange={handleCityChange}
          placeholder={
            value.state
              ? 'Selecione uma cidade'
              : 'Primeiro selecione um estado'
          }
          searchPlaceholder="Buscar cidade..."
          disabled={disabled || !value.state}
          leftIcon={<FiHome className="w-4 h-4 text-theme-tertiary" />}
          onClear={value.city ? handleClearCity : undefined}
          headerLabel={
            value.state ? `Cidades de ${value.state.name}` : 'Cidades'
          }
          headerIcon={<FiHome className="w-4 h-4 text-brand-primary" />}
          emptyMessage={
            value.state
              ? 'Nenhuma cidade encontrada'
              : 'Selecione um estado primeiro'
          }
        />
        {!value.state && !disabled && (
          <p className="text-xs text-theme-tertiary mt-1">
            Selecione um estado primeiro
          </p>
        )}
      </div>

      {/* 🐛 Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' &&
        (value.country || value.state || value.city) && (
          <div className="mt-4 p-3 bg-theme-secondary bg-opacity-20 rounded-xl">
            <h4 className="text-xs font-medium text-theme-tertiary mb-2">
              🔍 Debug Info:
            </h4>
            <div className="text-xs text-theme-tertiary space-y-1">
              {value.country && (
                <div>
                  🌍 País: {value.country.flag} {value.country.name} (
                  {value.country.isoCode})
                </div>
              )}
              {value.state && (
                <div>
                  🗺️ Estado: {value.state.name} ({value.state.isoCode})
                </div>
              )}
              {value.city && <div>🏙️ Cidade: {value.city.name}</div>}
            </div>
          </div>
        )}
    </div>
  );
};

export default LocationSelector;
export type { LocationData };
