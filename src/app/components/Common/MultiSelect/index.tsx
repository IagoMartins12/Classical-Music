// app/components/Common/MultiSelect.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { FiX, FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  isDisabled?: boolean;
  error?: string;
}

export default function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Selecione opções...',
  maxDisplay = 3,
  isDisabled = false,
  error,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtrar opções baseado no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
  }, [searchTerm, options]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
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

  const handleToggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((val) => val !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleRemoveSelected = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((val) => val !== option));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleToggleDropdown = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  return (
    <div className="relative">
      {/* Label */}
      <label className="block text-sm font-medium text-theme-tertiary mb-2">
        {label}
      </label>

      {/* Main Input */}
      <div
        className={`
          relative cursor-pointer border rounded-xl px-4 py-3 bg-theme-elevated
          transition-all duration-200 min-h-[48px] flex items-center
          ${
            isDisabled
              ? 'cursor-not-allowed opacity-50'
              : 'hover:border-brand-primary/50'
          }
          ${error ? 'border-red-300' : 'border-theme-secondary'}
          ${isOpen ? 'border-brand-primary ring-2 ring-brand-primary/20' : ''}
        `}
        onClick={handleToggleDropdown}
      >
        {/* Selected Values Display */}
        <div className="flex-1 flex flex-wrap gap-1 mr-2">
          {selectedValues.length === 0 ? (
            <span className="text-theme-secondary text-sm">{placeholder}</span>
          ) : selectedValues.length <= maxDisplay ? (
            selectedValues.map((value) => (
              <span
                key={value}
                className="inline-flex items-center capitalize gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs font-medium"
              >
                {value}
                <button
                  onClick={(e) => handleRemoveSelected(value, e)}
                  className="hover:bg-brand-primary/20 rounded p-0.5 transition-colors"
                  disabled={isDisabled}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <div className="flex items-center gap-2">
              {selectedValues.slice(0, maxDisplay).map((value) => (
                <span
                  key={value}
                  className="inline-flex capitalize items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs font-medium"
                >
                  {value}
                  <button
                    onClick={(e) => handleRemoveSelected(value, e)}
                    className="hover:bg-brand-primary/20 rounded p-0.5 transition-colors"
                    disabled={isDisabled}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <span className="text-theme-secondary text-xs">
                +{selectedValues.length - maxDisplay} mais
              </span>
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1">
          {selectedValues.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1 hover:bg-theme-secondary/20 rounded transition-colors"
              disabled={isDisabled}
            >
              <FiX className="w-4 h-4 text-theme-tertiary" />
            </button>
          )}
          <FiChevronDown
            className={`w-4 h-4 text-theme-tertiary transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[500] max-h-80 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-theme-secondary">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar opções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-theme-primary border border-theme-secondary rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm  capitalizetext-theme-secondary">
                  {searchTerm
                    ? `Nenhuma opção encontrada para "${searchTerm}"`
                    : 'Nenhuma opção disponível'}
                </p>
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <button
                    key={option}
                    onClick={() => handleToggleOption(option)}
                    className={`
                      w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 
                      flex items-center justify-between border-b last:border-b-0 border-theme-secondary/50
                      ${
                        isSelected
                          ? 'bg-brand-primary/5 text-brand-primary'
                          : 'text-theme-primary'
                      }
                    `}
                  >
                    <span className="text-sm capitalize">{option}</span>
                    {isSelected && (
                      <FiCheck className="w-4 h-4 text-brand-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with count */}
          {selectedValues.length > 0 && (
            <div className="px-4 py-2 border-t border-theme-secondary bg-theme-secondary/5">
              <p className="text-xs text-theme-secondary">
                {selectedValues.length}{' '}
                {selectedValues.length === 1
                  ? 'item selecionado'
                  : 'itens selecionados'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
