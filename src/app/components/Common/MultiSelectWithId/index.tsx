'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { FiX, FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';

interface Option {
  id: string;
  label: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selectedValues: string[]; // ids selecionados
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  isDisabled?: boolean;
  error?: string;
  excludeValues?: string[];
}

export default function MultiSelectWithId({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Selecione opções...',
  maxDisplay = 10,
  isDisabled = false,
  error,
  excludeValues = [],
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stableExcludeValues = useMemo(
    () => excludeValues,
    [excludeValues.join(',')]
  );

  const filteredOptions = useMemo(() => {
    let filtered = options.filter(
      (opt) => !stableExcludeValues.includes(opt.id)
    );
    if (searchTerm.trim()) {
      filtered = filtered.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [options, searchTerm, stableExcludeValues]);

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

  const handleToggleOption = (id: string) => {
    if (selectedValues.includes(id)) {
      onChange(selectedValues.filter((val) => val !== id));
    } else {
      onChange([...selectedValues, id]);
    }
  };

  const handleRemoveSelected = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(selectedValues.filter((val) => val !== id));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange([]);
  };

  const handleToggleDropdown = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isDisabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  };

  const handleOptionClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleOption(id);
  };

  const selectedLabels = selectedValues
    .map((id) => options.find((opt) => opt.id === id)?.label)
    .filter(Boolean) as string[];

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-theme-tertiary mb-2">
        {label}
      </label>

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
        <div className="flex-1 flex flex-wrap gap-1 mr-2">
          {selectedLabels.length === 0 ? (
            <span className="text-theme-secondary text-sm">{placeholder}</span>
          ) : selectedLabels.length <= maxDisplay ? (
            /* ✅ FIX: Mapear diretamente de selectedValues */
            selectedValues.map((id) => {
              const option = options.find((opt) => opt.id === id);
              if (!option) return null; // ✅ Skip se não encontrar

              return (
                <span
                  key={id}
                  className="inline-flex items-center capitalize gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs font-medium"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSelected(id, e)}
                    className="hover:bg-brand-primary/20 rounded p-0.5 transition-colors"
                    disabled={isDisabled}
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          ) : (
            <div className="flex items-center gap-2">
              {/* ✅ FIX: Mesmo padrão para quando tem mais que maxDisplay */}
              {selectedValues.slice(0, maxDisplay).map((id) => {
                const option = options.find((opt) => opt.id === id);
                if (!option) return null;

                return (
                  <span
                    key={id}
                    className="inline-flex capitalize items-center gap-1 bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-xs font-medium"
                  >
                    {option.label}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSelected(id, e)}
                      className="hover:bg-brand-primary/20 rounded p-0.5 transition-colors"
                      disabled={isDisabled}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <span className="text-theme-secondary text-xs">
                +{selectedValues.length - maxDisplay} mais
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {selectedValues.length > 0 && (
            <button
              type="button"
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

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[500] max-h-80 overflow-hidden"
        >
          <div className="p-3 border-b border-theme-secondary">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar opções..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.preventDefault();
                }}
                className="w-full pl-10 pr-4 py-2 bg-theme-primary border border-theme-secondary rounded-lg text-sm focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm capitalize text-theme-secondary">
                  {searchTerm
                    ? `Nenhuma opção encontrada para "${searchTerm}"`
                    : stableExcludeValues.length > 0
                      ? 'Todas as opções disponíveis já foram selecionadas ou excluídas'
                      : 'Nenhuma opção disponível'}
                </p>
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={(e) => handleOptionClick(opt.id, e)}
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
                    <span className="text-sm capitalize">{opt.label}</span>
                    {isSelected && (
                      <FiCheck className="w-4 h-4 text-brand-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>

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
