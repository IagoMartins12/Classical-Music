// app/components/Common/MultiSelect.tsx
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  PiCaretDown,
  PiCheck,
  PiMagnifyingGlass,
  PiPlus,
  PiX,
} from 'react-icons/pi';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { useTx } from '@/app/hooks/useTx';

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxDisplay?: number;
  isDisabled?: boolean;
  error?: string;
  excludeValues?: string[];
  allowCreate?: boolean; // ✅ NOVO: Permitir criar novos itens
}

export default function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder,
  maxDisplay = 10,
  isDisabled = false,
  error,
  excludeValues = [],
  allowCreate = false, // ✅ NOVO: Padrão false
}: MultiSelectProps) {
  const tx = useTx();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stableExcludeValues = useMemo(
    () => excludeValues,
    [excludeValues.join(',')]
  );

  const computedFilteredOptions = useMemo(() => {
    let filtered = options;

    if (stableExcludeValues.length > 0) {
      filtered = filtered.filter(
        (option) => !stableExcludeValues.includes(option)
      );
    }

    if (!searchTerm.trim()) {
      return filtered;
    } else {
      return filtered.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }, [options, searchTerm, stableExcludeValues]);

  useEffect(() => {
    setFilteredOptions(computedFilteredOptions);
  }, [computedFilteredOptions]);

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
    e.preventDefault();
    onChange(selectedValues.filter((val) => val !== option));
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

  const handleOptionClick = (option: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleToggleOption(option);
  };

  // ✅ NOVO: Criar novo item ao pressionar Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      if (!allowCreate || !searchTerm.trim()) return;

      const newValue = searchTerm.trim();

      // Verificar se já existe
      const exists =
        options.some((opt) => opt.toLowerCase() === newValue.toLowerCase()) ||
        selectedValues.includes(newValue);

      if (!exists) {
        // Adicionar aos selecionados
        onChange([...selectedValues, newValue]);
        setSearchTerm('');
      } else {
        // Se já existe, apenas selecionar
        if (!selectedValues.includes(newValue)) {
          onChange([...selectedValues, newValue]);
        }
        setSearchTerm('');
      }
    }
  };

  return (
    <div className="relative">
      {/* Label */}
      <span className="block text-sm font-medium text-texto-fraco mb-2">
        {label}
      </span>

      {/* Main Input */}
      <div
        className={`
          relative cursor-pointer border rounded-controle px-4 py-3 bg-sup-2
          transition-all duration-200 min-h-[48px] flex items-center
          ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
          ${error ? 'border-[var(--erro)]' : 'border-[var(--linha)]'}
          ${isOpen ? 'ring-2' : ''}
        `}
        onClick={handleToggleDropdown}
      >
        {/* Selected Values Display */}
        <div className="flex-1 flex flex-wrap gap-1 mr-2">
          {selectedValues.length === 0 ? (
            <Text papel="rotulo" tom="suave">
              {placeholder ?? tx('Escolha as opções…', 'Choose options…')}
            </Text>
          ) : selectedValues.length <= maxDisplay ? (
            selectedValues.map((value) => (
              <Text
                papel="legenda"
                tom="ouro"
                key={value}
                className="inline-flex items-center capitalize gap-1 px-2 py-1 rounded-lg font-medium"
              >
                {value}
                <button
                  type="button"
                  onClick={(e) => handleRemoveSelected(value, e)}
                  className="rounded p-0.5 transition-colors"
                  disabled={isDisabled}
                >
                  <PiX className="w-3 h-3" />
                  <NomeAcao acao="fechar" />
                </button>
              </Text>
            ))
          ) : (
            <div className="flex items-center gap-2">
              {selectedValues.slice(0, maxDisplay).map((value) => (
                <Text
                  papel="legenda"
                  tom="ouro"
                  key={value}
                  className="inline-flex capitalize items-center gap-1 px-2 py-1 rounded-lg font-medium"
                >
                  {value}
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSelected(value, e)}
                    className="rounded p-0.5 transition-colors"
                    disabled={isDisabled}
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </Text>
              ))}
              <Text papel="legenda" tom="suave">
                +{selectedValues.length - maxDisplay} {tx('mais', 'more')}
              </Text>
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1">
          {selectedValues.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-1 rounded transition-colors"
              disabled={isDisabled}
            >
              <PiX className="w-4 h-4 text-texto-fraco" />
              <NomeAcao acao="fechar" />
            </button>
          )}
          <PiCaretDown
            className={`w-4 h-4 text-texto-fraco transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && <p className="text-erro text-xs mt-1">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 rounded-controle border border-[var(--linha-forte)] bg-[var(--sup-alta)] shadow-[var(--sombra-alta)] z-menu max-h-80 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-[var(--linha)]">
            <div className="relative">
              <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-texto-fraco" />
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  allowCreate
                    ? tx(
                        'Buscar ou criar nova opção (Enter)...',
                        'Search or create an option (Enter)…'
                      )
                    : tx('Buscar opções...', 'Search options…')
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-[var(--fundo)] border border-[var(--linha)] rounded-lg text-sm focus:outline-none focus:ring-2"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto">
            {/* ✅ NOVO: Botão para criar novo item */}
            {allowCreate &&
              searchTerm.trim() &&
              !filteredOptions.some(
                (opt) => opt.toLowerCase() === searchTerm.toLowerCase()
              ) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    const newValue = searchTerm.trim();
                    onChange([...selectedValues, newValue]);
                    setSearchTerm('');
                  }}
                  className="w-full text-left px-4 py-3 transition-colors duration-200 flex items-center gap-2 border-b bg-sup-2 border-linha"
                >
                  <PiPlus className="w-4 h-4 text-ouro-texto" />
                  <span className="text-sm font-medium text-ouro-texto">
                    {tx(
                      `Criar “${searchTerm}” e adicionar`,
                      `Create “${searchTerm}” and add it`
                    )}
                  </span>
                </button>
              )}

            {filteredOptions.length === 0 &&
            (!allowCreate || !searchTerm.trim()) ? (
              <div className="px-4 py-8 text-center">
                <Text papel="rotulo" tom="suave" as="p" className="capitalize">
                  {searchTerm
                    ? tx(
                        `Nenhuma opção encontrada para “${searchTerm}”`,
                        `No options found for “${searchTerm}”`
                      )
                    : stableExcludeValues.length > 0
                      ? tx(
                          'Todas as opções disponíveis já foram selecionadas ou excluídas',
                          'Every available option is already chosen or excluded'
                        )
                      : tx('Nenhuma opção disponível', 'No options available')}
                </Text>
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={(e) => handleOptionClick(option, e)}
                    className={`
                      w-full text-left px-4 py-3 transition-colors duration-200 flex items-center justify-between border-b last:border-b-0 border-linha
                      ${isSelected ? 'text-ouro-texto' : 'text-texto'}
                    `}
                  >
                    <span className="text-sm capitalize">{option}</span>
                    {isSelected && (
                      <PiCheck className="w-4 h-4 text-ouro-texto" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with count */}
          {selectedValues.length > 0 && (
            <div className="px-4 py-2 border-t border-[var(--linha)]">
              <Text papel="legenda" tom="suave" as="p">
                {selectedValues.length}{' '}
                {selectedValues.length === 1
                  ? tx('item selecionado', 'item selected')
                  : tx('itens selecionados', 'items selected')}
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
