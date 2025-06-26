// components/ComposerSearchInput.tsx - Versão com POST
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiUser, FiX, FiTrendingUp } from 'react-icons/fi';

interface Composer {
  id: string;
  name: string;
  fullName?: string;
  worksCount?: number;
}

interface ComposerSearchInputProps {
  selectedComposer: string;
  onComposerSelect: (composerId: string) => void;
  popularComposers?: Composer[];
  isDisabled?: boolean;
}

export default function ComposerSearchInput({
  selectedComposer,
  onComposerSelect,
  popularComposers = [],
  isDisabled = false,
}: ComposerSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composers, setComposers] = useState<Composer[]>(popularComposers);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComposerName, setSelectedComposerName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Encontrar nome do compositor selecionado
  useEffect(() => {
    const findSelectedComposer = async () => {
      if (selectedComposer) {
        // Primeiro tenta encontrar nas listas locais
        const composer =
          popularComposers?.find((c) => c.id === selectedComposer) ||
          composers?.find((c) => c.id === selectedComposer);

        if (composer) {
          setSelectedComposerName(composer.name);
        } else {
          // Se não encontrou nas listas locais, busca na API
          try {
            const response = await fetch('/api/composers', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: selectedComposer,
              }),
            });

            if (response.ok) {
              const composer = await response.json();
              if (composer && composer.name) {
                setSelectedComposerName(composer.name);
              } else {
                setSelectedComposerName('');
              }
            }
          } catch (error) {
            console.error('Erro ao buscar nome do compositor:', error);
            setSelectedComposerName('');
          }
        }
      } else {
        setSelectedComposerName('');
      }
    };

    findSelectedComposer();
  }, [selectedComposer, popularComposers, composers]);

  // Busca de compositores com debounce usando POST
  const searchComposersDebounced = useCallback(
    async (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          console.log('Fazendo busca para:', term);

          const response = await fetch('/api/composers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: term,
              limit: 20,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const results = await response.json();
          console.log('Resultados recebidos:', results);
          setComposers(results);
        } catch (error) {
          console.error('Erro ao buscar compositores:', error);
          setComposers(popularComposers || []); // Fallback para compositores populares
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [popularComposers]
  );

  // Effect para busca
  useEffect(() => {
    if (searchTerm.trim()) {
      searchComposersDebounced(searchTerm);
    } else {
      setComposers(popularComposers || []);
      setIsLoading(false);
    }
  }, [searchTerm, searchComposersDebounced, popularComposers]);

  // Fechar dropdown ao clicar fora
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

  // Limpar timeout no unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleInputFocus = async () => {
    setIsOpen(true);
    if (!searchTerm && (!composers || composers.length === 0)) {
      // Carregar compositores populares se não tiver dados
      setIsLoading(true);
      try {
        const response = await fetch('/api/composers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: '',
            limit: 20,
          }),
        });

        if (response.ok) {
          const results = await response.json();
          setComposers(results);
        }
      } catch (error) {
        console.error('Erro ao carregar compositores populares:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComposerSelect = (composer: Composer) => {
    onComposerSelect(composer.id);
    setSelectedComposerName(composer.name);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onComposerSelect('');
    setSelectedComposerName('');
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const displayComposers = composers;
  const showPopularLabel =
    !searchTerm && popularComposers && popularComposers.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary z-10" />

        <input
          ref={inputRef}
          type="text"
          placeholder={selectedComposerName || 'Buscar compositor...'}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={`input-classical pl-11 pr-12 w-full ${
            isDisabled ? 'cursor-not-allowed opacity-50' : ''
          } ${selectedComposer ? 'text-theme-primary font-medium' : ''}`}
          disabled={isDisabled}
        />

        {(selectedComposer || searchTerm) && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors z-10"
            disabled={isDisabled}
          >
            <FiX className="w-4 h-4" />
          </button>
        )}

        {!searchTerm && !selectedComposer && (
          <FiSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[80] max-h-80 overflow-hidden"
        >
          {/* Header com label */}
          {showPopularLabel && (
            <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
              <FiTrendingUp className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-theme-secondary">
                Compositores Populares
              </span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-theme-secondary">
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Buscando compositores...</span>
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && displayComposers && displayComposers.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {displayComposers.map((composer, index) => (
                <button
                  key={composer.id}
                  onClick={() => handleComposerSelect(composer)}
                  className={`
                    w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 border-b last:border-b-0 border-theme-secondary
                    ${
                      selectedComposer === composer.id
                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                        : ''
                    }
                    ${index === 0 && !showPopularLabel ? 'border-t-0' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-theme-primary truncate">
                        {composer.name}
                      </div>
                      {composer.fullName &&
                        composer.fullName !== composer.name && (
                          <div className="text-xs text-theme-secondary truncate mt-0.5">
                            {composer.fullName}
                          </div>
                        )}
                    </div>

                    {composer.worksCount && composer.worksCount > 0 && (
                      <div className="ml-3 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary/20 text-theme-secondary">
                          {composer.worksCount} obra
                          {composer.worksCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading &&
            (!displayComposers || displayComposers.length === 0) && (
              <div className="px-4 py-8 text-center">
                <FiUser className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                <p className="text-sm text-theme-secondary">
                  {searchTerm
                    ? `Nenhum compositor encontrado para "${searchTerm}"`
                    : 'Nenhum compositor disponível'}
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
  );
}
