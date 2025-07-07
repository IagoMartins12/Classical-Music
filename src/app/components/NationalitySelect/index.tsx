// components/NationalitySelect.tsx - Select filtrado de nacionalidades
'use client';

import { useState, useEffect, useRef } from 'react';
import { FiGlobe, FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import {
  NATIONALITIES,
  filterNationalities,
  type Nationality,
} from '@/app/data/nationalities';

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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input */}
      <div className="relative">
        <FiGlobe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary z-10" />

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

        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}

          <div className="p-1 text-theme-tertiary">
            <FiChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[200] max-h-80 overflow-hidden"
        >
          {/* Search header */}
          <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
            <FiSearch className="w-4 h-4 text-brand-primary" />
            <span className="text-sm font-medium text-theme-secondary">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : 'Selecione uma nacionalidade'}
            </span>
          </div>

          {/* Nationalities list */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNationalities.length > 0 ? (
              filteredNationalities.map((nationality, index) => (
                <button
                  key={nationality.id}
                  onClick={() => handleNationalitySelect(nationality)}
                  className={`
                    w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 
                    border-b last:border-b-0 border-theme-secondary/50
                    ${
                      value === nationality.name
                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                        : 'text-theme-primary'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {nationality.name}
                      </div>
                      <div className="text-xs text-theme-secondary truncate mt-0.5">
                        {nationality.countries.slice(0, 2).join(', ')}
                        {nationality.countries.length > 2 && '...'}
                      </div>
                    </div>

                    {value === nationality.name && (
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <FiGlobe className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                <p className="text-sm text-theme-secondary">
                  {searchTerm
                    ? `Nenhuma nacionalidade encontrada para "${searchTerm}"`
                    : 'Nenhuma nacionalidade disponível'}
                </p>
                {searchTerm && (
                  <p className="text-xs text-theme-tertiary mt-1">
                    Tente uma busca mais geral
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer with count */}
          {filteredNationalities.length > 0 && (
            <div className="px-4 py-2 bg-theme-secondary/5 border-t border-theme-secondary/50">
              <p className="text-xs text-theme-tertiary">
                {filteredNationalities.length === NATIONALITIES.length
                  ? `${NATIONALITIES.length} nacionalidades disponíveis`
                  : `${filteredNationalities.length} de ${NATIONALITIES.length} nacionalidades`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
