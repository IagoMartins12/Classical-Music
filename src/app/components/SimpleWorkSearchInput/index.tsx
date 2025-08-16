// app/components/SimpleWorkSearchInput.tsx - VERSÃO ATUALIZADA COM USER SUGGESTIONS
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiSearch,
  FiMusic,
  FiLoader,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiStar,
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
  // 🆕 Novas props para sugestões
  userSuggestions?: Work[];
  loadingUserSuggestions?: boolean;
}

const SimpleWorkSearchInput: React.FC<SimpleWorkSearchInputProps> = ({
  selectedWork,
  onWorkSelect,
  placeholder = 'Digite para buscar uma obra...',
  error,
  disabled = false,
  filterByComposer = '',
  // 🆕 Props de sugestões com valores padrão
  userSuggestions = [],
  loadingUserSuggestions = false,
}) => {
  const [query, setQuery] = useState('');
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkData, setSelectedWorkData] = useState<Work | null>(null);

  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log('🔍 [SIMPLE-WORK-SEARCH] Render com sugestões:', {
    query,
    selectedWork,
    userSuggestions: userSuggestions.length,
    loadingUserSuggestions,
  });

  // 🆕 BUSCA COMBINADA - API + USER SUGGESTIONS
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        // 🆕 Se não há query, mostrar sugestões do usuário
        setWorks(userSuggestions.slice(0, 8));
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
          const apiWorks = data.works || [];

          // 🆕 COMBINAR COM USER SUGGESTIONS
          const combinedWorks = combineWorksWithSuggestions(
            apiWorks,
            searchQuery
          );
          setWorks(combinedWorks);

          console.log(
            '✅ [SIMPLE-WORK-SEARCH] Obras combinadas:',
            combinedWorks.length,
            '(API:',
            apiWorks.length,
            '+ Sugestões)'
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
    [filterByComposer, userSuggestions]
  );

  // 🆕 FUNÇÃO PARA COMBINAR API RESULTS COM USER SUGGESTIONS
  const combineWorksWithSuggestions = useCallback(
    (apiWorks: Work[], searchQuery: string) => {
      // Filtrar user suggestions que correspondem à busca
      const matchingUserSuggestions = userSuggestions.filter((userWork) => {
        const matchesQuery =
          userWork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          userWork.composer.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          userWork.composer.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesComposer =
          !filterByComposer ||
          filterByComposer.trim() === '' ||
          userWork.composer.id === filterByComposer;

        return matchesQuery && matchesComposer;
      });

      // Remover duplicatas (obras que estão tanto na API quanto nas sugestões)
      const apiWorksFiltered = apiWorks.filter(
        (apiWork) =>
          !matchingUserSuggestions.some(
            (userWork) => userWork.id === apiWork.id
          )
      );

      // Priorizar user suggestions no topo
      return [...matchingUserSuggestions, ...apiWorksFiltered];
    },
    [userSuggestions, filterByComposer]
  );

  // 🆕 EFFECT PARA MOSTRAR SUGESTÕES QUANDO NÃO HÁ QUERY
  useEffect(() => {
    if (query.trim().length === 0 && userSuggestions.length > 0) {
      setWorks(userSuggestions.slice(0, 8));
    }
  }, [userSuggestions, query]);

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
        // 🆕 Mostrar sugestões quando limpar
        setWorks(userSuggestions.slice(0, 8));
        return;
      }

      // 🆕 BUSCAR OU MOSTRAR SUGESTÕES
      if (value.trim().length >= 2) {
        searchTimeoutRef.current = setTimeout(() => {
          performSearch(value);
        }, 400);
      } else {
        // Mostrar sugestões quando menos de 2 caracteres
        setWorks(userSuggestions.slice(0, 8));
        setIsLoading(false);
      }
    },
    [selectedWorkData, onWorkSelect, performSearch, userSuggestions]
  );

  // 🔥 BUSCAR DADOS DA OBRA SELECIONADA
  const findSelectedWork = useCallback(
    async (workId: string) => {
      if (!workId) {
        setSelectedWorkData(null);
        return;
      }

      // 🆕 Primeiro verificar nas user suggestions
      const userWork = userSuggestions.find((work) => work.id === workId);
      if (userWork) {
        setSelectedWorkData(userWork);
        console.log(
          '✅ [SIMPLE-WORK-SEARCH] Obra encontrada nas sugestões:',
          userWork.title
        );
        return;
      }

      // Se não encontrou nas sugestões, buscar na API
      try {
        const response = await fetch(`/api/works/${workId}`);
        if (response.ok) {
          const workData = await response.json();
          setSelectedWorkData(workData);
          console.log(
            '✅ [SIMPLE-WORK-SEARCH] Obra carregada da API:',
            workData.title
          );
        }
      } catch (error) {
        console.error('❌ [SIMPLE-WORK-SEARCH] Erro ao carregar obra:', error);
        setSelectedWorkData(null);
      }
    },
    [userSuggestions]
  );

  // 🔥 CARREGAR OBRA SELECIONADA QUANDO selectedWork MUDA
  useEffect(() => {
    if (selectedWork && selectedWork !== selectedWorkData?.id) {
      findSelectedWork(selectedWork);
    } else if (!selectedWork) {
      setSelectedWorkData(null);
    }
  }, [selectedWork, selectedWorkData?.id, findSelectedWork]);

  // 🔥 FECHAR DROPDOWN AO CLICAR FORA
  useEffect(() => {
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
  useEffect(() => {
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

  // 🆕 DETERMINAR SE É USER SUGGESTION
  const isUserSuggestion = useCallback(
    (work: Work) => {
      return userSuggestions.some((userWork) => userWork.id === work.id);
    },
    [userSuggestions]
  );

  // 🆕 DETERMINAR LABEL DO HEADER
  const getHeaderLabel = () => {
    if (query.length >= 2) {
      return filterByComposer
        ? 'Resultados filtrados por compositor'
        : 'Resultados da busca';
    }

    if (userSuggestions.length > 0) {
      return filterByComposer
        ? 'Obras do compositor selecionado'
        : 'Sugestões para você';
    }

    return 'Obras populares';
  };

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
                setIsOpen(true);
                // 🆕 Mostrar sugestões no foco se não há query
                if (query.length === 0 && userSuggestions.length > 0) {
                  setWorks(userSuggestions.slice(0, 8));
                }
              }}
              placeholder={placeholder}
              disabled={disabled}
              className={`input-classical-2 w-full !pl-10 pr-10 ${
                error ? 'border-red-500' : ''
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {(isLoading || loadingUserSuggestions) && (
              <FiLoader className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brand-primary w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Dropdown de resultados */}
          {isOpen && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-lg shadow-theme-large max-h-80 overflow-y-auto z-50"
            >
              {/* Loading */}
              {(isLoading || loadingUserSuggestions) && (
                <div className="p-4 text-center">
                  <FiLoader className="w-5 h-5 mx-auto animate-spin text-brand-primary mb-2" />
                  <p className="text-sm text-theme-tertiary">
                    {loadingUserSuggestions
                      ? 'Carregando sugestões...'
                      : 'Buscando obras...'}
                  </p>
                </div>
              )}

              {/* Results */}
              {!isLoading && !loadingUserSuggestions && works.length > 0 && (
                <div className="p-2">
                  {/* 🆕 Header inteligente */}
                  <div className="px-3 py-2 text-xs font-medium text-theme-tertiary uppercase tracking-wide border-b border-theme-secondary mb-2">
                    <div className="flex items-center gap-2">
                      {query.length >= 2 ? (
                        <FiSearch className="w-4 h-4" />
                      ) : userSuggestions.length > 0 ? (
                        <FiStar className="w-4 h-4 text-accent-purple" />
                      ) : (
                        <FiMusic className="w-4 h-4" />
                      )}
                      {getHeaderLabel()}
                    </div>
                  </div>

                  {works.map((work, i) => {
                    const isUserWork = isUserSuggestion(work);

                    return (
                      <button
                        key={`${work.id}-${i}`}
                        type="button"
                        onClick={() => handleWorkSelect(work)}
                        className="w-full text-left p-3 rounded-lg hover:bg-theme-secondary transition-colors group"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                              isUserWork
                                ? 'bg-accent-purple/20 group-hover:bg-accent-purple/30'
                                : 'bg-accent-blue/20 group-hover:bg-accent-blue/30'
                            }`}
                          >
                            {isUserWork ? (
                              <FiStar className="w-4 h-4 text-accent-purple" />
                            ) : (
                              <FiMusic className="w-4 h-4 text-accent-blue" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-theme-primary text-sm truncate">
                                {work.title}
                              </p>
                              {isUserWork && (
                                <span className="text-xs bg-accent-purple/20 text-accent-purple px-1.5 py-0.5 rounded">
                                  Sugerida
                                </span>
                              )}
                            </div>
                            <p className="text-theme-tertiary text-xs truncate">
                              {work.composer.fullName || work.composer.name}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !loadingUserSuggestions && works.length === 0 && (
                <div className="p-4 text-center text-theme-tertiary">
                  <FiSearch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {query.length >= 2
                      ? `Nenhuma obra encontrada para "${query}"`
                      : userSuggestions.length === 0
                      ? 'Nenhuma sugestão disponível'
                      : 'Digite pelo menos 2 caracteres para buscar'}
                  </p>
                  {query.length >= 2 && (
                    <p className="text-xs mt-1">Tente termos diferentes</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 🆕 Dica dinâmica */}
          {!isOpen && query.length === 0 && !selectedWorkData && (
            <div className="mt-2 text-xs text-theme-tertiary">
              {userSuggestions.length > 0
                ? ``
                : '💡 Digite pelo menos 2 caracteres para buscar obras'}
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
