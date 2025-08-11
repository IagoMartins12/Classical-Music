// app/components/SimpleWorkSearchInput.tsx - VERSÃO SIMPLES SEM AUTO-SUGGESTIONS
import React, { useState, useRef, useCallback } from 'react';
import {
  FiSearch,
  FiMusic,
  FiLoader,
  FiCheck,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';

interface Work {
  id: string;
  title: string;
  composer: {
    id?: string;
    name: string;
    fullName: string;
  };
}

interface SimpleWorkSearchInputProps {
  selectedWork: string;
  onWorkSelect: (workId: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  filterByComposer?: string;
}

const SimpleWorkSearchInput: React.FC<SimpleWorkSearchInputProps> = ({
  selectedWork,
  onWorkSelect,
  placeholder = 'Digite para buscar uma obra...',
  error,
  disabled = false,
  filterByComposer = '',
}) => {
  const [query, setQuery] = useState('');
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkData, setSelectedWorkData] = useState<Work | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('🔍 [SIMPLE-WORK-SEARCH] Render simples:', {
    query,
    selectedWork,
  });

  // 🔥 BUSCA APENAS QUANDO DIGITA (SEM AUTO-SUGGESTIONS)
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setWorks([]);
        setIsLoading(false);
        return;
      }

      console.log('🔍 [SIMPLE-WORK-SEARCH] Buscando para:', searchQuery);
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          limit: '12',
        });

        if (filterByComposer && filterByComposer.trim() !== '') {
          params.append('composer', filterByComposer);
        }

        const response = await fetch(`/api/works/search?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          setWorks(data.works || []);
          console.log(
            '✅ [SIMPLE-WORK-SEARCH] Encontradas:',
            data.works?.length || 0
          );
        } else {
          console.error(
            '❌ [SIMPLE-WORK-SEARCH] Erro na busca:',
            response.status
          );
          setWorks([]);
        }
      } catch (error) {
        console.error('❌ [SIMPLE-WORK-SEARCH] Erro:', error);
        setWorks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [filterByComposer]
  );

  // 🔥 HANDLER DE INPUT COM DEBOUNCE
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(true);

      // Limpar timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Se limpar completamente, limpar seleção
      if (value.length === 0 && selectedWorkData) {
        onWorkSelect('');
        setSelectedWorkData(null);
        setWorks([]);
        setIsOpen(false);
        return;
      }

      // Só buscar se tiver pelo menos 2 caracteres
      if (value.trim().length >= 2) {
        searchTimeoutRef.current = setTimeout(() => {
          performSearch(value);
        }, 400);
      } else {
        setWorks([]);
        setIsLoading(false);
      }
    },
    [selectedWorkData, onWorkSelect, performSearch]
  );

  // 🔥 BUSCAR DADOS DA OBRA SELECIONADA
  const findSelectedWork = useCallback(async (workId: string) => {
    if (!workId) {
      setSelectedWorkData(null);
      return;
    }

    try {
      const response = await fetch(`/api/works/${workId}`);
      if (response.ok) {
        const workData = await response.json();
        setSelectedWorkData(workData);
        console.log(
          '✅ [SIMPLE-WORK-SEARCH] Obra selecionada carregada:',
          workData.title
        );
      }
    } catch (error) {
      console.error('❌ [SIMPLE-WORK-SEARCH] Erro ao carregar obra:', error);
      setSelectedWorkData(null);
    }
  }, []);

  // 🔥 CARREGAR OBRA SELECIONADA QUANDO selectedWork MUDA
  React.useEffect(() => {
    if (selectedWork && selectedWork !== selectedWorkData?.id) {
      findSelectedWork(selectedWork);
    } else if (!selectedWork) {
      setSelectedWorkData(null);
    }
  }, [selectedWork, selectedWorkData?.id, findSelectedWork]);

  // 🔥 FECHAR DROPDOWN AO CLICAR FORA
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 🔥 LIMPAR TIMEOUT NO UNMOUNT
  React.useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // 🔥 HANDLERS
  const handleWorkSelect = useCallback(
    (work: Work) => {
      console.log('🎯 [SIMPLE-WORK-SEARCH] Obra selecionada:', work.title);
      onWorkSelect(work.id);
      setSelectedWorkData(work);
      setQuery('');
      setIsOpen(false);
      setWorks([]);
    },
    [onWorkSelect]
  );

  const handleClearSelection = useCallback(() => {
    console.log('🗑️ [SIMPLE-WORK-SEARCH] Limpando seleção');
    onWorkSelect('');
    setSelectedWorkData(null);
    setQuery('');
    setIsOpen(false);
    setWorks([]);
  }, [onWorkSelect]);

  return (
    <div className="relative">
      {/* Campo selecionado */}
      {selectedWorkData ? (
        <div
          className={`w-full p-3 border rounded-lg bg-theme-elevated ${
            error ? 'border-red-500' : 'border-theme-secondary'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                <FiCheck className="w-4 h-4 text-accent-blue" />
              </div>
              <div>
                <p className="font-medium text-theme-primary text-sm">
                  {selectedWorkData.title}
                </p>
                <p className="text-theme-tertiary text-xs">
                  {selectedWorkData.composer.fullName ||
                    selectedWorkData.composer.name}
                </p>
              </div>
            </div>
            {!disabled && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-theme-tertiary hover:text-accent-red transition-colors p-1"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Campo de busca */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4 z-10" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (query.length >= 2) {
                  setIsOpen(true);
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={`input-classical-2 w-full !pl-10 pr-10 ${
                error ? 'border-red-500' : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {isLoading && (
              <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-primary w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Dropdown de resultados */}
          {isOpen && !disabled && query.length >= 2 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-lg shadow-theme-large max-h-80 overflow-y-auto z-50"
            >
              {/* Loading */}
              {isLoading && (
                <div className="p-4 text-center">
                  <FiLoader className="w-5 h-5 mx-auto animate-spin text-brand-primary mb-2" />
                  <p className="text-sm text-theme-tertiary">
                    Buscando obras...
                  </p>
                </div>
              )}

              {/* Results */}
              {!isLoading && works.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-medium text-theme-tertiary uppercase tracking-wide border-b border-theme-secondary mb-2">
                    <div className="flex items-center gap-2">
                      <FiSearch className="w-4 h-4" />
                      Resultados da busca
                    </div>
                  </div>

                  {works.map((work, i) => (
                    <button
                      key={`${work.id}-${i}`}
                      type="button"
                      onClick={() => handleWorkSelect(work)}
                      className="w-full text-left p-3 rounded-lg hover:bg-theme-secondary transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform bg-accent-blue/20 group-hover:bg-accent-blue/30">
                          <FiMusic className="w-4 h-4 text-accent-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary text-sm truncate">
                            {work.title}
                          </p>
                          <p className="text-theme-tertiary text-xs truncate">
                            {work.composer.fullName || work.composer.name}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && works.length === 0 && query.length >= 2 && (
                <div className="p-4 text-center text-theme-tertiary">
                  <FiSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Nenhuma obra encontrada para "{query}"
                  </p>
                  <p className="text-xs mt-1">Tente termos diferentes</p>
                </div>
              )}
            </div>
          )}

          {/* Dica quando não há busca */}
          {!isOpen && query.length === 0 && !selectedWorkData && (
            <div className="mt-2 text-xs text-theme-tertiary">
              💡 Digite pelo menos 2 caracteres para buscar obras
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div>
          <p className="text-red-500 text-sm font-medium flex items-center space-x-1 mt-1">
            <FiAlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SimpleWorkSearchInput;
