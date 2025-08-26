// app/components/WorkSearchInput.tsx - VERSÃO CORRIGIDA SEM LOOPS INFINITOS
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  FiSearch,
  FiMusic,
  FiLoader,
  FiCheck,
  FiTrendingUp,
  FiUser,
  FiStar,
  FiFilter,
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

interface UserWork {
  id: string;
  title: string;
  composer: {
    id: string;
    name: string;
    fullName: string;
  };
}

interface WorkSearchInputProps {
  selectedWork: string;
  onWorkSelect: (workId: string) => void;
  popularWorks?: Work[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  filterByComposer?: string;
  userSuggestions?: UserWork[];
  loadingUserSuggestions?: boolean;
  shoudDisabled?: boolean;
}

const WorkSearchInput: React.FC<WorkSearchInputProps> = ({
  selectedWork,
  onWorkSelect,
  popularWorks = [],
  placeholder = 'Digite para buscar uma obra...',
  error,
  disabled = false,
  filterByComposer = '',
  userSuggestions = [],
  loadingUserSuggestions = false,
}) => {
  const [query, setQuery] = useState('');
  const [works, setWorks] = useState<Work[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkData, setSelectedWorkData] = useState<Work | null>(null);
  const [composerWorks, setComposerWorks] = useState<Work[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastComposerRef = useRef<string>('');
  const lastQueryRef = useRef<string>('');

  // 🔥 MEMOIZAR PROPS ESTÁVEIS PARA EVITAR RE-RENDERS
  const stableFilterByComposer = useMemo(
    () => filterByComposer,
    [filterByComposer]
  );
  const stableUserSuggestions = useMemo(
    () => userSuggestions,
    [userSuggestions]
  );
  const stablePopularWorks = useMemo(() => popularWorks, [popularWorks]);

  // 🔥 FUNÇÃO PARA CARREGAR OBRAS DO COMPOSITOR - MEMOIZADA E ESTÁVEL
  const loadComposerWorks = useCallback(async (composerId: string) => {
    // Evitar chamadas duplicadas
    if (
      !composerId ||
      composerId.trim() === '' ||
      lastComposerRef.current === composerId
    ) {
      return;
    }

    console.log('🎼 Carregando obras do compositor:', composerId);
    lastComposerRef.current = composerId;

    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        q: '',
        composer: composerId,
        limit: '20',
      });

      const response = await fetch(`/api/works/search?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setComposerWorks(data.works || []);
        console.log(
          '✅ Obras do compositor carregadas:',
          data.works?.length || 0
        );
      } else {
        console.error(
          '❌ Erro ao carregar obras do compositor:',
          response.status
        );
        setComposerWorks([]);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar obras do compositor:', error);
      setComposerWorks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🔥 EFFECT PARA CARREGAR OBRAS DO COMPOSITOR - SEM LOOPS
  useEffect(() => {
    if (stableFilterByComposer && stableFilterByComposer.trim() !== '') {
      // Só carrega se realmente mudou
      if (lastComposerRef.current !== stableFilterByComposer) {
        loadComposerWorks(stableFilterByComposer);
      }
    } else {
      // Limpar obras do compositor se não há filtro
      if (composerWorks.length > 0) {
        setComposerWorks([]);
        lastComposerRef.current = '';
      }
    }
  }, [stableFilterByComposer, loadComposerWorks, composerWorks.length]);

  // 🔥 FUNÇÃO PARA PRIORIZAR OBRAS DO USUÁRIO - MEMOIZADA
  const prioritizeUserWorks = useCallback(
    (apiWorks: Work[]): Work[] => {
      const userWorksFiltered = stableUserSuggestions.filter((userWork) => {
        const matchesQuery =
          query.length < 2 ||
          userWork.title.toLowerCase().includes(query.toLowerCase()) ||
          userWork.composer.name.toLowerCase().includes(query.toLowerCase()) ||
          userWork.composer.fullName
            .toLowerCase()
            .includes(query.toLowerCase());

        const matchesComposer =
          !stableFilterByComposer ||
          stableFilterByComposer.trim() === '' ||
          userWork.composer.id === stableFilterByComposer;

        return matchesQuery && matchesComposer;
      });

      const apiWorksFiltered = apiWorks.filter(
        (apiWork) =>
          !userWorksFiltered.some((userWork) => userWork.id === apiWork.id)
      );

      return [...userWorksFiltered, ...apiWorksFiltered];
    },
    [query, stableFilterByComposer, stableUserSuggestions]
  );

  // 🔥 FUNÇÃO PARA SUGESTÕES LOCAIS - MEMOIZADA E ESTÁVEL
  const getLocalSuggestions = useCallback((): Work[] => {
    console.log('💡 Obtendo sugestões locais...');

    // 1. SEMPRE priorizar obras do usuário se existirem
    if (stableUserSuggestions.length > 0) {
      let userWorksToShow = stableUserSuggestions;

      // Filtrar por compositor se selecionado
      if (stableFilterByComposer && stableFilterByComposer.trim() !== '') {
        userWorksToShow = stableUserSuggestions.filter(
          (work) => work.composer.id === stableFilterByComposer
        );

        if (userWorksToShow.length === 0) {
          console.log(
            '🔄 Nenhuma obra do usuário para este compositor, usando obras gerais'
          );
          return composerWorks.slice(0, 8);
        }
      }

      console.log(`⭐ Mostrando obras do usuário: ${userWorksToShow.length}`);
      return userWorksToShow.slice(0, 8);
    }

    // 2. Se há compositor selecionado, mostrar obras dele
    if (
      stableFilterByComposer &&
      stableFilterByComposer.trim() !== '' &&
      composerWorks.length > 0
    ) {
      console.log(`🎼 Mostrando obras do compositor: ${composerWorks.length}`);
      return composerWorks.slice(0, 8);
    }

    // 3. Filtrar obras populares por compositor se selecionado
    if (stableFilterByComposer && stableFilterByComposer.trim() !== '') {
      const popularFiltered = stablePopularWorks.filter((work) => {
        return (
          (work.composer.id && work.composer.id === stableFilterByComposer) ||
          work.composer.name === stableFilterByComposer ||
          work.composer.fullName === stableFilterByComposer
        );
      });

      if (popularFiltered.length > 0) {
        console.log(
          `📊 Obras populares filtradas por compositor: ${popularFiltered.length}`
        );
        return popularFiltered.slice(0, 8);
      }
    }

    // 4. Fallback: obras populares gerais (apenas se não há filtro de compositor)
    if (!stableFilterByComposer || stableFilterByComposer.trim() === '') {
      console.log(
        `🌟 Mostrando obras populares gerais: ${stablePopularWorks.length}`
      );
      return stablePopularWorks.slice(0, 8);
    }

    console.log('❌ Nenhuma obra encontrada para as condições atuais');
    return [];
  }, [
    stableUserSuggestions,
    stableFilterByComposer,
    composerWorks,
    stablePopularWorks,
  ]);

  // 🔥 FUNCTION PARA BUSCA - MEMOIZADA E COM DEBOUNCE MELHOR
  const performSearch = useCallback(
    async (searchQuery: string, composerFilter: string) => {
      // Evitar buscas duplicadas
      const searchKey = `${searchQuery}:${composerFilter}`;
      if (lastQueryRef.current === searchKey) {
        return;
      }
      lastQueryRef.current = searchKey;

      try {
        const startTime = Date.now();
        const params = new URLSearchParams({
          q: searchQuery,
          limit: '12',
        });

        if (composerFilter && composerFilter.trim() !== '') {
          params.append('composer', composerFilter);
        }

        console.log('🔍 Buscando obras:', {
          query: searchQuery,
          filterByComposer: composerFilter,
        });

        const response = await fetch(`/api/works/search?${params.toString()}`);
        const endTime = Date.now();

        console.log(`⏱️ Busca completada em ${endTime - startTime}ms`);

        if (response.ok) {
          const data = await response.json();
          const combinedWorks = prioritizeUserWorks(data.works || []);
          setWorks(combinedWorks);
          console.log(
            '✅ Obras encontradas e priorizadas:',
            combinedWorks.length
          );
        } else {
          console.error('❌ Erro na busca:', response.status);
          setWorks([]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar obras:', error);
        setWorks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [prioritizeUserWorks]
  );

  // 🔥 EFFECT PARA BUSCA COM QUERY - SEM LOOPS E COM DEBOUNCE MELHOR
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se não há query, usar sugestões locais
    if (query.trim().length < 2) {
      const suggestions = getLocalSuggestions();
      setWorks(suggestions);
      setIsLoading(false);
      setIsInitialized(true);
      return;
    }

    setIsLoading(true);

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, stableFilterByComposer);
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, stableFilterByComposer, getLocalSuggestions, performSearch]);

  // 🔥 EFFECT PARA INICIALIZAÇÃO - APENAS UMA VEZ
  useEffect(() => {
    if (!isInitialized && query.length < 2) {
      const suggestions = getLocalSuggestions();
      setWorks(suggestions);
      setIsInitialized(true);
    }
  }, [isInitialized, query.length, getLocalSuggestions]);

  // 🔥 BUSCAR DADOS DA OBRA SELECIONADA - MEMOIZADO
  const findSelectedWorkData = useCallback(() => {
    if (!selectedWork) return null;

    const allWorks = [
      ...stableUserSuggestions,
      ...composerWorks,
      ...stablePopularWorks,
      ...works,
    ];

    return allWorks.find((w) => w.id === selectedWork) || null;
  }, [
    selectedWork,
    stableUserSuggestions,
    composerWorks,
    stablePopularWorks,
    works,
  ]);

  // Effect para atualizar dados da obra selecionada
  useEffect(() => {
    const workData = findSelectedWorkData();
    setSelectedWorkData(workData);
    if (workData && query !== '') {
      setQuery(''); // Limpar query quando uma obra é selecionada
    }
  }, [selectedWork, findSelectedWorkData, query]);

  // 🔥 FECHAR DROPDOWN AO CLICAR FORA - MEMOIZADO
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

  // 🔥 HANDLERS MEMOIZADOS
  const handleWorkSelect = useCallback(
    (work: Work) => {
      console.log('🎯 Obra selecionada:', work.title);
      onWorkSelect(work.id);
      setSelectedWorkData(work);
      setQuery('');
      setIsOpen(false);
    },
    [onWorkSelect]
  );

  const handleClearSelection = useCallback(() => {
    console.log('🗑️ Limpando seleção de obra');
    onWorkSelect('');
    setSelectedWorkData(null);
    setQuery('');
    setIsOpen(false);
  }, [onWorkSelect]);

  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(value.length > 0 || !selectedWorkData);

      // Se limpar o input, limpar seleção
      if (value.length === 0 && selectedWorkData) {
        handleClearSelection();
      }
    },
    [selectedWorkData, handleClearSelection]
  );

  // 🔥 LABELS E CORES MEMOIZADOS
  const { suggestionsLabel, iconAndColor } = useMemo(() => {
    const getSuggestionsLabel = () => {
      if (query.length >= 2) {
        return stableFilterByComposer && stableFilterByComposer.trim() !== ''
          ? 'Resultados filtrados por compositor'
          : 'Resultados da busca';
      }

      if (
        stableUserSuggestions.length > 0 &&
        stableFilterByComposer &&
        stableFilterByComposer.trim() !== ''
      ) {
        const userComposerWorks = stableUserSuggestions.filter(
          (w) => w.composer.id === stableFilterByComposer
        );
        if (userComposerWorks.length > 0) {
          return `Suas obras de ${
            userComposerWorks[0].composer.fullName ||
            userComposerWorks[0].composer.name
          }`;
        }
      }

      if (
        stableUserSuggestions.length > 0 &&
        (!stableFilterByComposer || stableFilterByComposer.trim() === '')
      ) {
        return 'Suas obras recentes';
      }

      if (stableFilterByComposer && stableFilterByComposer.trim() !== '') {
        return 'Obras do compositor selecionado';
      }

      return 'Obras populares';
    };

    const getIconAndColor = () => {
      const hasUserWorks = stableUserSuggestions.length > 0;
      const hasComposerFilter =
        stableFilterByComposer && stableFilterByComposer.trim() !== '';

      if (
        hasUserWorks &&
        (!hasComposerFilter ||
          stableUserSuggestions.some(
            (w) => w.composer.id === stableFilterByComposer
          ))
      ) {
        return { icon: FiUser, color: 'text-accent-purple' };
      }

      if (hasComposerFilter) {
        return { icon: FiFilter, color: 'text-accent-blue' };
      }

      return { icon: FiTrendingUp, color: 'text-brand-primary' };
    };

    return {
      suggestionsLabel: getSuggestionsLabel(),
      iconAndColor: getIconAndColor(),
    };
  }, [query.length, stableFilterByComposer, stableUserSuggestions]);

  const { icon: SuggestionIcon, color: iconColor } = iconAndColor;

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
                ×
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
              onFocus={() => setIsOpen(true)}
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
                      ? 'Carregando suas obras...'
                      : 'Buscando obras...'}
                  </p>
                </div>
              )}

              {/* Results */}
              {!isLoading && !loadingUserSuggestions && works.length > 0 && (
                <div className="p-2">
                  {/* Header com label inteligente */}
                  {suggestionsLabel && (
                    <div className="px-3 py-2 flex items-center gap-2 text-xs font-medium text-theme-tertiary uppercase tracking-wide">
                      <SuggestionIcon className={`w-4 h-4 ${iconColor}`} />
                      {suggestionsLabel}
                    </div>
                  )}

                  {works.map((work, i) => {
                    const isUserWork = stableUserSuggestions.some(
                      (uw) => uw.id === work.id
                    );

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
                                  Sua
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
                      : stableFilterByComposer &&
                        stableFilterByComposer.trim() !== ''
                      ? 'Nenhuma obra encontrada para este compositor'
                      : 'Nenhuma obra disponível'}
                  </p>
                  {query.length >= 2 && (
                    <p className="text-xs mt-1">
                      Tente termos diferentes
                      {stableFilterByComposer &&
                      stableFilterByComposer.trim() !== ''
                        ? ' ou remova o filtro de compositor'
                        : ''}
                    </p>
                  )}
                </div>
              )}
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

      {/* Informação sobre o estado atual */}
      {!selectedWorkData && (
        <div className="mt-1 flex items-center justify-between text-xs text-theme-tertiary">
          <div className="flex items-center space-x-2">
            {stableFilterByComposer && stableFilterByComposer.trim() !== '' && (
              <span className="flex items-center space-x-1">
                <FiFilter className="w-3 h-3" />
                <span>Filtrado por compositor</span>
              </span>
            )}
            {stableUserSuggestions.length > 0 && (
              <span className="flex items-center space-x-1">
                <FiUser className="w-3 h-3 text-accent-purple" />
                <span>{stableUserSuggestions.length} obra(s) sua(s)</span>
              </span>
            )}
          </div>
          {composerWorks.length > 0 && (
            <span className="text-brand-primary">
              {composerWorks.length} obra(s) do compositor
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkSearchInput;
