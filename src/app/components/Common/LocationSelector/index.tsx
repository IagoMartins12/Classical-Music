// components/Common/LocationSelector.tsx - VERSÃO CORRIGIDA COM AUTO-LOAD E MULTILÍNGUE
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useTranslation } from '@/app/context/TranslationContext';

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

// 🚀 DADOS BÁSICOS BILÍNGUES
const BASIC_COUNTRIES = [
  { isoCode: 'BR', name_pt: 'Brasil', name_en: 'Brazil', flag: '🇧🇷' },
  {
    isoCode: 'US',
    name_pt: 'Estados Unidos',
    name_en: 'United States',
    flag: '🇺🇸',
  },
  { isoCode: 'PT', name_pt: 'Portugal', name_en: 'Portugal', flag: '🇵🇹' },
  { isoCode: 'AR', name_pt: 'Argentina', name_en: 'Argentina', flag: '🇦🇷' },
  { isoCode: 'FR', name_pt: 'França', name_en: 'France', flag: '🇫🇷' },
  { isoCode: 'DE', name_pt: 'Alemanha', name_en: 'Germany', flag: '🇩🇪' },
  { isoCode: 'ES', name_pt: 'Espanha', name_en: 'Spain', flag: '🇪🇸' },
  { isoCode: 'IT', name_pt: 'Itália', name_en: 'Italy', flag: '🇮🇹' },
  {
    isoCode: 'GB',
    name_pt: 'Reino Unido',
    name_en: 'United Kingdom',
    flag: '🇬🇧',
  },
  { isoCode: 'CA', name_pt: 'Canadá', name_en: 'Canada', flag: '🇨🇦' },
  { isoCode: 'MX', name_pt: 'México', name_en: 'Mexico', flag: '🇲🇽' },
  { isoCode: 'JP', name_pt: 'Japão', name_en: 'Japan', flag: '🇯🇵' },
  { isoCode: 'CN', name_pt: 'China', name_en: 'China', flag: '🇨🇳' },
  { isoCode: 'IN', name_pt: 'Índia', name_en: 'India', flag: '🇮🇳' },
  { isoCode: 'AU', name_pt: 'Austrália', name_en: 'Australia', flag: '🇦🇺' },
  { isoCode: 'RU', name_pt: 'Rússia', name_en: 'Russia', flag: '🇷🇺' },
  { isoCode: 'CO', name_pt: 'Colômbia', name_en: 'Colombia', flag: '🇨🇴' },
  { isoCode: 'PE', name_pt: 'Peru', name_en: 'Peru', flag: '🇵🇪' },
  { isoCode: 'CL', name_pt: 'Chile', name_en: 'Chile', flag: '🇨🇱' },
  { isoCode: 'UY', name_pt: 'Uruguai', name_en: 'Uruguay', flag: '🇺🇾' },
];

// 🚀 BUSCA INTELIGENTE MULTILÍNGUE
const searchInCountry = (country: any, searchTerm: string): boolean => {
  if (!searchTerm) return true;

  const term = searchTerm.toLowerCase().trim();

  // Buscar no nome em português
  const namePt = (country.name_pt || country.name || '').toLowerCase();
  if (namePt.includes(term)) return true;

  // Buscar no nome em inglês
  const nameEn = (country.name_en || country.name || '').toLowerCase();
  if (nameEn.includes(term)) return true;

  // Buscar no código ISO
  const isoCode = (country.isoCode || '').toLowerCase();
  if (isoCode.includes(term)) return true;

  return false;
};

// 🚀 HOOK PARA LAZY LOADING DA BIBLIOTECA
const useLocationLibrary = () => {
  const [library, setLibrary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const loadLibrary = async () => {
    if (library || isLoading) return library;

    setIsLoading(true);
    setHasError(false);

    try {
      console.log('🚀 Carregando biblioteca country-state-city...');
      const { Country, State, City } = await import('country-state-city');

      const loadedLibrary = { Country, State, City };
      setLibrary(loadedLibrary);
      console.log('✅ Biblioteca carregada com sucesso');
      return loadedLibrary;
    } catch (error) {
      console.error('❌ Erro ao carregar biblioteca:', error);
      setHasError(true);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { library, isLoading, hasError, loadLibrary };
};

// 🚀 SELECT COMPONENT COM AUTO-LOAD
interface SelectWithSearchProps {
  options: Array<{
    value: string;
    label: string;
    extra?: string;
    flag?: string;
    name_pt?: string;
    name_en?: string;
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
  onSearchWithNoResults?: (searchTerm: string) => void;
}

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
  onSearchWithNoResults,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasTriggeredAutoLoad, setHasTriggeredAutoLoad] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 🚀 FILTRO INTELIGENTE COM BUSCA BILÍNGUE
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;

    const filtered = options.filter((option) => {
      // Se tem dados bilíngues, usar função de busca inteligente
      if (option.name_pt || option.name_en) {
        return searchInCountry(option, searchTerm);
      }

      // Fallback para busca padrão
      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        option.label.toLowerCase().includes(lowerSearchTerm) ||
        (option.extra && option.extra.toLowerCase().includes(lowerSearchTerm))
      );
    });

    // 🚀 AUTO-LOAD: Se não encontrou resultados E ainda não tentou carregar tudo
    if (
      filtered.length === 0 &&
      searchTerm.length >= 2 &&
      !hasTriggeredAutoLoad &&
      onSearchWithNoResults
    ) {
      console.log(
        `🔍 Nenhum resultado para "${searchTerm}", carregando todos os países...`
      );
      setHasTriggeredAutoLoad(true);
      setTimeout(() => {
        onSearchWithNoResults(searchTerm);
      }, 300);
    }

    return filtered;
  }, [options, searchTerm, hasTriggeredAutoLoad, onSearchWithNoResults]);

  // Reset auto-load quando options mudam
  useEffect(() => {
    if (options.length > 20) {
      setHasTriggeredAutoLoad(false);
    }
  }, [options.length]);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

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

  useEffect(() => {
    if (containerRef.current) {
      if (isOpen) {
        containerRef.current.style.zIndex = '9999';
      } else {
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

  const displayValue = isOpen ? searchTerm : selectedOption?.label || '';

  return (
    <div ref={containerRef} className="relative" style={{ zIndex: 1 }}>
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

      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-2xl max-h-80 overflow-hidden"
          style={{ zIndex: 10000 }}
        >
          {headerLabel && (
            <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
              {headerIcon}
              <span className="text-sm font-medium text-theme-secondary">
                {headerLabel}
              </span>
            </div>
          )}

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

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-theme-secondary">
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Carregando opções...</span>
              </div>
            </div>
          )}

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

// 🚀 LOCATION SELECTOR PRINCIPAL
const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  showLabels = true,
}) => {
  const { isLoading, hasError, loadLibrary } = useLocationLibrary();
  const { language } = useTranslation();

  // Função para traduzir nome do país
  const translateCountryName = (country: any) => {
    if (country.name_pt && country.name_en) {
      return language === 'pt' ? country.name_pt : country.name_en;
    }
    return country.name || country.name_en || country.name_pt;
  };

  // Preparar países básicos com tradução
  const basicCountriesWithTranslation = useMemo(() => {
    return BASIC_COUNTRIES.map((country) => ({
      isoCode: country.isoCode,
      name: translateCountryName(country),
      flag: country.flag,
      name_pt: country.name_pt,
      name_en: country.name_en,
    }));
  }, [language]);

  const [countryOptions, setCountryOptions] = useState(
    basicCountriesWithTranslation
  );
  const [stateOptions, setStateOptions] = useState<any[]>([]);
  const [cityOptions, setCityOptions] = useState<any[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [isLoadingAllCountries, setIsLoadingAllCountries] = useState(false);

  // Atualizar países básicos quando idioma mudar
  useEffect(() => {
    setCountryOptions(basicCountriesWithTranslation);
  }, [language, basicCountriesWithTranslation]);

  // 🚀 CARREGAR TODOS OS PAÍSES COM TRADUÇÃO
  const loadAllCountries = async () => {
    if (isLoadingAllCountries) return;

    setIsLoadingAllCountries(true);
    const lib = await loadLibrary();

    if (lib) {
      console.log('🌍 Carregando todos os países com tradução...');
      const allCountries = lib.Country.getAllCountries().map(
        (country: any) => ({
          isoCode: country.isoCode,
          name: country.name,
          flag: country.flag,
          name_pt: country.name,
          name_en: country.name,
        })
      );

      // Mesclar com traduções dos países básicos
      const mergedCountries = allCountries.map((country: any) => {
        const basicCountry = BASIC_COUNTRIES.find(
          (basic) => basic.isoCode === country.isoCode
        );
        if (basicCountry) {
          return {
            ...country,
            name: translateCountryName(basicCountry),
            name_pt: basicCountry.name_pt,
            name_en: basicCountry.name_en,
          };
        }
        return {
          ...country,
          name: country.name,
        };
      });

      // Ordenar alfabeticamente pelo nome traduzido
      mergedCountries.sort((a: any, b: any) => a.name.localeCompare(b.name));

      setCountryOptions(mergedCountries);
      console.log(
        `✅ ${mergedCountries.length} países carregados com tradução`
      );
    }

    setIsLoadingAllCountries(false);
  };

  // 🚀 AUTO-LOAD QUANDO BUSCA NÃO ENCONTRA RESULTADOS
  const handleSearchWithNoResults = async (searchTerm: string) => {
    console.log(`🔍 Auto-load acionado para: "${searchTerm}"`);
    await loadAllCountries();
  };

  // 🚀 Carregar estados quando país for selecionado
  const loadStatesForCountry = async (countryCode: string) => {
    if (!countryCode) {
      setStateOptions([]);
      return;
    }

    setLoadingStates(true);
    const lib = await loadLibrary();

    if (lib) {
      const states = lib.State.getStatesOfCountry(countryCode);
      const stateOpts = states.map((state: any) => ({
        value: state.isoCode,
        label: state.name,
        extra: state.isoCode,
      }));
      setStateOptions(stateOpts);
    }
    setLoadingStates(false);
  };

  // 🚀 Carregar cidades quando estado for selecionado
  const loadCitiesForState = async (countryCode: string, stateCode: string) => {
    if (!countryCode || !stateCode) {
      setCityOptions([]);
      return;
    }

    setLoadingCities(true);
    const lib = await loadLibrary();

    if (lib) {
      const cities = lib.City.getCitiesOfState(countryCode, stateCode);
      const cityOpts = cities.map((city: any) => ({
        value: city.name,
        label: city.name,
      }));
      setCityOptions(cityOpts);
    }
    setLoadingCities(false);
  };

  // Auto-definir Brasil como padrão
  useEffect(() => {
    if (!value.country) {
      const br = basicCountriesWithTranslation.find((c) => c.isoCode === 'BR');
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
  }, [value.country, onChange, basicCountriesWithTranslation]);

  // Carregar estados quando país mudar
  useEffect(() => {
    if (value.country?.isoCode) {
      loadStatesForCountry(value.country.isoCode);
    }
  }, [value.country?.isoCode]);

  // Carregar cidades quando estado mudar
  useEffect(() => {
    if (value.country?.isoCode && value.state?.isoCode) {
      loadCitiesForState(value.country.isoCode, value.state.isoCode);
    }
  }, [value.country?.isoCode, value.state?.isoCode]);

  // HANDLERS
  const handleCountryChange = (countryCode: string) => {
    if (!countryCode) {
      onChange({
        country: undefined,
        state: undefined,
        city: undefined,
      });
      return;
    }

    const country = countryOptions.find((c) => c.isoCode === countryCode);
    if (country) {
      onChange({
        country: {
          isoCode: country.isoCode,
          name: country.name,
          flag: country.flag,
        },
        state: undefined,
        city: undefined,
      });
    }
  };

  const handleStateChange = (stateCode: string) => {
    if (!value.country?.isoCode || !stateCode) {
      onChange({
        ...value,
        state: undefined,
        city: undefined,
      });
      return;
    }

    const state = stateOptions.find((s) => s.value === stateCode);
    if (state) {
      onChange({
        ...value,
        state: {
          isoCode: state.value,
          name: state.label,
          countryCode: value.country.isoCode,
        },
        city: undefined,
      });
    }
  };

  const handleCityChange = (cityName: string) => {
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

  // Preparar opções com suporte bilíngue
  const countrySelectOptions = useMemo(() => {
    return countryOptions.map((country) => ({
      value: country.isoCode,
      label: country.name,
      extra: country.isoCode,
      flag: country.flag,
      name_pt: country.name_pt,
      name_en: country.name_en,
    }));
  }, [countryOptions]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* País */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-theme-secondary mb-2">
            <FaGlobeAmericas className="w-4 h-4 inline mr-2" />
            País
          </label>
        )}
        <ElegantSelectWithSearch
          options={countrySelectOptions}
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
          isLoading={isLoading || isLoadingAllCountries}
          onSearchWithNoResults={handleSearchWithNoResults}
        />
      </div>

      {/* Estado */}
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
          isLoading={loadingStates}
        />
        {!value.country && !disabled && (
          <p className="text-xs text-theme-tertiary mt-1">
            Selecione um país primeiro
          </p>
        )}
      </div>

      {/* Cidade */}
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
          isLoading={loadingCities}
        />
        {!value.state && !disabled && (
          <p className="text-xs text-theme-tertiary mt-1">
            Selecione um estado primeiro
          </p>
        )}
      </div>

      {/* Feedback de erro */}
      {hasError && (
        <div className="text-xs text-red-500 mt-2">
          Erro ao carregar dados. Usando dados básicos.
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
export type { LocationData };
