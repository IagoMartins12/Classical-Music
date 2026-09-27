// components/NationalitySelect.tsx - Select filtrado de nacionalidades
'use client';

import { useState, useEffect, useRef } from 'react';
import { PiCaretDown, PiGlobe, PiMagnifyingGlass, PiX } from 'react-icons/pi';
import {
  NATIONALITIES,
  filterNationalities,
  type Nationality,
} from '@/app/data/nationalities';
import { useLanguageStore } from '@/app/stores/useLanguageStore';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

interface NationalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function NationalitySelect({
  value,
  onChange,
  error,
  placeholder = 'Selecione a nacionalidade...',
  disabled = false,
  className = '',
}: NationalitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNationalities, setFilteredNationalities] =
    useState<Nationality[]>(NATIONALITIES);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar nacionalidades baseado no termo de busca
  useEffect(() => {
    const filtered = filterNationalities(searchTerm);
    setFilteredNationalities(filtered);
  }, [searchTerm]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
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

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
      setSearchTerm(value || '');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);

    // Se o input está vazio, limpar a seleção
    if (!newValue) {
      onChange('');
    }
  };

  const handleNationalitySelect = (nationality: Nationality) => {
    onChange(nationality.name);
    setSearchTerm('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = searchTerm || value || '';
  const { language } = useLanguageStore();
  const getMessage = (search?: string) => {
    if (search) {
      if (language === 'en') return `Results for "${search}"`;
      return `Resultado para "${search}"`;
    }

    if (language === 'en') return 'Select a nationality';
    return 'Selecione uma nacionalidade';
  };
  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <PiGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary z-10" />

        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-classical-2 !pl-11 pr-20 w-full
            ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'}
            ${error ? 'border-red-500' : ''}
            ${value ? 'text-theme-primary font-medium' : ''}
          `}
        />

        <Inline
          gap={1}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-theme-tertiary transition-colors"
            >
              <PiX className="w-4 h-4" />
              <NomeAcao acao="fechar" />
            </button>
          )}

          <div className="p-1 text-theme-tertiary">
            <PiCaretDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </Inline>
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated rounded-xl shadow-xl z-menu max-h-80 overflow-hidden"
        >
          {/* Search header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-theme-secondary">
            <PiMagnifyingGlass className="w-4 h-4 text-ouro-texto" />
            <Text papel="rotulo" tom="suave" className="font-medium">
              {searchTerm ? getMessage(searchTerm) : getMessage()}
            </Text>
          </div>

          {/* Nationalities list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNationalities.length > 0 ? (
              filteredNationalities.map((nationality) => (
                <button
                  key={nationality.id}
                  onClick={() => handleNationalitySelect(nationality)}
                  className={`
                    w-full text-left px-4 py-3 transition-colors duration-200 border-b border-color-primary last:border-b-0
                    ${
                      value === nationality.name
                        ? 'text-ouro-texto font-medium'
                        : 'text-theme-primary'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {nationality.name}
                      </div>
                      <Text
                        papel="legenda"
                        tom="suave"
                        as="div"
                        className="truncate mt-0.5"
                      >
                        {nationality.countries.slice(0, 2).join(', ')}
                        {nationality.countries.length > 2 && '...'}
                      </Text>
                    </div>

                    {value === nationality.name && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-2 h-2 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <PiGlobe className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                <Text papel="rotulo" tom="suave" as="p">
                  {searchTerm
                    ? `Nenhuma nacionalidade encontrada para "${searchTerm}"`
                    : 'Nenhuma nacionalidade disponível'}
                </Text>
                {searchTerm && (
                  <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                    Tente uma busca mais geral
                  </Text>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
