// components/ComposerSearchInput.tsx - VERSÃO FLEXÍVEL (API + Local)
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiUser, FiX, FiTrendingUp, FiLoader } from 'react-icons/fi';

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
  placeholder?: string;
  error?: string;
  // 🆕 NOVAS PROPS PARA FLEXIBILIDADE
  mode?: 'api' | 'local'; // Define se usa API ou filtragem local
  localComposers?: Composer[]; // Lista de compositores para filtragem local
  apiEndpoint?: string; // Endpoint customizado para API
  showPopularLabel?: boolean; // Mostrar label "Compositores Populares"
  allowClear?: boolean; // Permitir limpar seleção
  showWorksCount?: boolean; // Mostrar contagem de obras
}

export default function ComposerSearchInput({
  selectedComposer,
  onComposerSelect,
  popularComposers = [],
  isDisabled = false,
  placeholder,
  error,
  // 🆕 PROPS FLEXÍVEIS COM DEFAULTS
  mode = 'api',
  localComposers = [],
  apiEndpoint = '/api/composers',
  showPopularLabel = true,
  allowClear = true,
  showWorksCount = true,
}: ComposerSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composers, setComposers] = useState<Composer[]>(popularComposers);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComposerName, setSelectedComposerName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // 🆕 FUNÇÃO PARA BUSCAR DADOS DO COMPOSITOR POR ID (FLEXÍVEL)
  const fetchComposerById = useCallback(
    async (composerId: string) => {
      try {
        console.log('🔍 Buscando compositor por ID:', composerId);

        if (mode === 'local') {
          // Buscar na lista local
          const composer =
            localComposers.find((c) => c.id === composerId) ||
            popularComposers.find((c) => c.id === composerId);
          return composer || null;
        } else {
          // Buscar via API
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: composerId,
            }),
          });

          if (response.ok) {
            const composer = await response.json();
            if (composer && composer.name) {
              console.log('✅ Compositor encontrado via API:', composer.name);
              return composer;
            }
          }
        }

        console.log('⚠️ Compositor não encontrado para ID:', composerId);
        return null;
      } catch (error) {
        console.error('❌ Erro ao buscar compositor por ID:', error);
        return null;
      }
    },
    [mode, localComposers, popularComposers, apiEndpoint]
  );

  // Encontrar nome do compositor selecionado
  useEffect(() => {
    const findSelectedComposer = async () => {
      if (selectedComposer) {
        // Buscar nas listas locais primeiro
        const allComposers = [
          ...popularComposers,
          ...composers,
          ...localComposers,
        ];
        const composer = allComposers.find((c) => c.id === selectedComposer);

        if (composer) {
          setSelectedComposerName(composer.fullName || composer.name);
          console.log(
            '✅ Compositor encontrado na lista local:',
            composer.name
          );
        } else {
          // Se não encontrou nas listas locais, buscar via função
          console.log('🔍 Compositor não encontrado localmente, buscando...');
          const fetchedComposer = await fetchComposerById(selectedComposer);

          if (fetchedComposer) {
            setSelectedComposerName(
              fetchedComposer.fullName || fetchedComposer.name
            );

            // Adicionar à lista local para futuras buscas
            setComposers((prev) => {
              const exists = prev.some((c) => c.id === fetchedComposer.id);
              if (!exists) {
                return [...prev, fetchedComposer];
              }
              return prev;
            });
          } else {
            setSelectedComposerName('');
          }
        }
      } else {
        setSelectedComposerName('');
      }
    };

    findSelectedComposer();
  }, [
    selectedComposer,
    popularComposers,
    composers,
    localComposers,
    fetchComposerById,
  ]);

  // 🆕 BUSCA DE COMPOSITORES FLEXÍVEL (API OU LOCAL)
  const searchComposersDebounced = useCallback(
    async (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(
        async () => {
          setIsLoading(true);
          try {
            console.log('🔍 Fazendo busca para:', term);

            if (mode === 'local') {
              // 🆕 BUSCA LOCAL
              const filtered = localComposers.filter((composer) => {
                const name = (composer.name || '').toLowerCase();
                const fullName = (composer.fullName || '').toLowerCase();
                const search = term.toLowerCase();

                return name.includes(search) || fullName.includes(search);
              });

              console.log(
                '📊 Resultados locais:',
                filtered.length,
                'compositores'
              );
              setComposers(filtered.slice(0, 20)); // Limitar resultados
            } else {
              // BUSCA VIA API (comportamento original)
              const response = await fetch(apiEndpoint, {
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
              console.log('📊 Resultados API:', results.length, 'compositores');
              setComposers(results);
            }
          } catch (error) {
            console.error('❌ Erro ao buscar compositores:', error);
            setComposers(popularComposers || []); // Fallback
          } finally {
            setIsLoading(false);
          }
        },
        mode === 'local' ? 200 : 300
      ); // Delay menor para busca local
    },
    [mode, localComposers, popularComposers, apiEndpoint]
  );

  // Effect para busca
  useEffect(() => {
    if (searchTerm.trim()) {
      searchComposersDebounced(searchTerm);
    } else {
      if (mode === 'local') {
        setComposers(localComposers.slice(0, 20));
      } else {
        setComposers(popularComposers || []);
      }
      setIsLoading(false);
    }
  }, [
    searchTerm,
    searchComposersDebounced,
    mode,
    localComposers,
    popularComposers,
  ]);

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
      if (mode === 'local') {
        // Carregar lista local
        setComposers(localComposers.slice(0, 20));
      } else {
        // Carregar compositores populares via API
        setIsLoading(true);
        try {
          const response = await fetch(apiEndpoint, {
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
            console.log(
              '📊 Compositores populares carregados:',
              results.length
            );
          }
        } catch (error) {
          console.error('❌ Erro ao carregar compositores populares:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
  };

  const handleComposerSelect = (composer: Composer) => {
    console.log('🎯 Compositor selecionado:', composer.name);
    onComposerSelect(composer.id);
    setSelectedComposerName(composer.fullName || composer.name);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleClear = () => {
    console.log('🗑️ Limpando seleção de compositor');
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
  const showPopular =
    showPopularLabel &&
    !searchTerm &&
    popularComposers &&
    popularComposers.length > 0;

  // 🆕 PLACEHOLDER DINÂMICO
  const dynamicPlaceholder =
    placeholder ||
    selectedComposerName ||
    (mode === 'local' ? 'Filtrar compositor...' : 'Buscar compositor...');

  return (
    <div className="relative z-[120]">
      <div className="relative">
        <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary z-10" />

        <input
          ref={inputRef}
          type="text"
          placeholder={dynamicPlaceholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={`input-classical pl-11 pr-12 w-full ${
            isDisabled ? 'cursor-not-allowed opacity-50' : ''
          } ${selectedComposer ? 'text-theme-primary font-medium' : ''} ${
            error ? 'border-red-500' : ''
          }`}
          disabled={isDisabled}
        />

        {(selectedComposer || searchTerm) && allowClear && (
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
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-[500] max-h-80 overflow-hidden"
        >
          {/* Header com label */}
          {showPopular && (
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
                <FiLoader className="w-4 h-4 animate-spin text-brand-primary" />
                <span className="text-sm">
                  {mode === 'local'
                    ? 'Filtrando compositores...'
                    : 'Buscando compositores...'}
                </span>
              </div>
            </div>
          )}

          {/* 🆕 OPÇÃO "TODOS OS COMPOSITORES" PARA MODO LOCAL */}
          {!isLoading && mode === 'local' && searchTerm.length >= 2 && (
            <button
              onClick={() => {
                onComposerSelect('');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className="w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors border-b border-theme-secondary"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-theme-secondary/20 rounded-lg flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-theme-tertiary" />
                </div>
                <span className="text-sm font-medium text-theme-primary">
                  Todos os compositores
                </span>
              </div>
            </button>
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
                    ${index === 0 && !showPopular ? 'border-t-0' : ''}
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

                    {showWorksCount &&
                      composer.worksCount &&
                      composer.worksCount > 0 && (
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
                    {mode === 'local'
                      ? 'Tente termos diferentes'
                      : 'Tente uma busca mais geral'}
                  </p>
                )}
              </div>
            )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
