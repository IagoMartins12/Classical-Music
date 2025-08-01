// app/components/WorkSearchInput.tsx - VERSÃO CORRIGIDA COM FILTRO DE COMPOSITOR
import React, { useState, useEffect, useRef } from 'react';
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
  filterByComposer?: string; // ID do compositor para filtrar
  userSuggestions?: UserWork[]; // Obras do usuário
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
  const [composerWorks, setComposerWorks] = useState<Work[]>([]); // 🆕 Cache de obras do compositor

  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🆕 EFFECT PARA CARREGAR OBRAS DO COMPOSITOR AUTOMATICAMENTE
  useEffect(() => {
    const loadComposerWorks = async () => {
      if (filterByComposer && filterByComposer.trim() !== '') {
        console.log('🎼 Carregando obras do compositor:', filterByComposer);

        try {
          setIsLoading(true);

          const params = new URLSearchParams({
            q: '', // Query vazia para pegar sugestões do compositor
            composer: filterByComposer,
            limit: '20',
          });

          const response = await fetch(
            `/api/works/search?${params.toString()}`
          );

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
      } else {
        setComposerWorks([]);
      }
    };

    loadComposerWorks();
  }, [filterByComposer]);

  // 🆕 EFFECT PARA BUSCA COM QUERY - MELHORADO
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Se não há query, usar sugestões locais
    if (query.trim().length < 2) {
      const suggestions = getLocalSuggestions();
      setWorks(suggestions);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const startTime = Date.now();

        const params = new URLSearchParams({
          q: query,
          limit: '12',
        });

        console.log('trim', filterByComposer.trim() !== '');
        console.log('filter', filterByComposer === '');
        // 🔧 SEMPRE incluir filtro de compositor se estiver selecionado
        if (filterByComposer && filterByComposer.trim() !== '') {
          params.append('composer', filterByComposer);
        } else {
          params.delete('composer');
        }

        console.log('🔍 Buscando obras:', { query, filterByComposer, params });

        const response = await fetch(`/api/works/search?${params.toString()}`);

        const endTime = Date.now();
        console.log(`⏱️ Busca completada em ${endTime - startTime}ms`);

        if (response.ok) {
          const data = await response.json();

          // 🆕 PRIORIZAÇÃO CORRIGIDA: SEMPRE obras do usuário primeiro
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
    }, 400);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, filterByComposer, userSuggestions, composerWorks]);

  // 🆕 FUNÇÃO PARA PRIORIZAR OBRAS DO USUÁRIO
  const prioritizeUserWorks = (apiWorks: Work[]): Work[] => {
    // 1. Filtrar obras do usuário que correspondem à busca
    const userWorksFiltered = userSuggestions.filter((userWork) => {
      const matchesQuery =
        query.length < 2 ||
        userWork.title.toLowerCase().includes(query.toLowerCase()) ||
        userWork.composer.name.toLowerCase().includes(query.toLowerCase()) ||
        userWork.composer.fullName.toLowerCase().includes(query.toLowerCase());

      const matchesComposer =
        !filterByComposer ||
        filterByComposer.trim() === '' ||
        userWork.composer.id === filterByComposer;

      return matchesQuery && matchesComposer;
    });

    // 2. Filtrar obras da API que não estão nas obras do usuário
    const apiWorksFiltered = apiWorks.filter(
      (apiWork) =>
        !userWorksFiltered.some((userWork) => userWork.id === apiWork.id)
    );

    // 3. Combinar: obras do usuário primeiro, depois da API
    return [...userWorksFiltered, ...apiWorksFiltered];
  };

  // 🆕 FUNÇÃO PARA SUGESTÕES LOCAIS (SEM QUERY)
  const getLocalSuggestions = (): Work[] => {
    console.log('💡 Obtendo sugestões locais...');

    // 1. SEMPRE priorizar obras do usuário se existirem
    if (userSuggestions.length > 0) {
      let userWorksToShow = userSuggestions;

      // Filtrar por compositor se selecionado
      if (filterByComposer && filterByComposer.trim() !== '') {
        userWorksToShow = userSuggestions.filter(
          (work) => work.composer.id === filterByComposer
        );
        console.log(
          `🎯 Obras do usuário filtradas por compositor: ${userWorksToShow.length}`
        );

        // Se o usuário tem obras mas nenhuma do compositor selecionado,
        // mostrar obras do compositor das fontes gerais
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
      filterByComposer &&
      filterByComposer.trim() !== '' &&
      composerWorks.length > 0
    ) {
      console.log(`🎼 Mostrando obras do compositor: ${composerWorks.length}`);
      return composerWorks.slice(0, 8);
    }

    // 3. Filtrar obras populares por compositor se selecionado
    if (filterByComposer && filterByComposer.trim() !== '') {
      const popularFiltered = popularWorks.filter((work) => {
        return (
          (work.composer.id && work.composer.id === filterByComposer) ||
          work.composer.name === filterByComposer ||
          work.composer.fullName === filterByComposer
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
    if (!filterByComposer || filterByComposer.trim() === '') {
      console.log(
        `🌟 Mostrando obras populares gerais: ${popularWorks.length}`
      );
      return popularWorks.slice(0, 8);
    }

    // 5. Se há filtro mas nenhuma obra encontrada
    console.log('❌ Nenhuma obra encontrada para as condições atuais');
    return [];
  };

  // Buscar dados da obra selecionada
  useEffect(() => {
    if (selectedWork) {
      const work = [
        ...userSuggestions,
        ...composerWorks,
        ...popularWorks,
        ...works,
      ].find((w) => w.id === selectedWork);
      if (work) {
        setSelectedWorkData(work);
        setQuery(''); // Limpar query quando uma obra é selecionada
      }
    } else {
      setSelectedWorkData(null);
    }
  }, [selectedWork, userSuggestions, composerWorks, popularWorks, works]);

  // Fechar dropdown ao clicar fora
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

  const handleWorkSelect = (work: Work) => {
    console.log('🎯 Obra selecionada:', work.title);
    onWorkSelect(work.id);
    setSelectedWorkData(work);
    setQuery('');
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    console.log('🗑️ Limpando seleção de obra');
    onWorkSelect('');
    setSelectedWorkData(null);
    setQuery('');
    setIsOpen(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsOpen(value.length > 0 || !selectedWorkData);

    // Se limpar o input, limpar seleção
    if (value.length === 0 && selectedWorkData) {
      handleClearSelection();
    }
  };

  // 🆕 LABEL INTELIGENTE PARA SUGESTÕES
  const getSuggestionsLabel = () => {
    if (query.length >= 2) {
      return filterByComposer && filterByComposer.trim() !== ''
        ? 'Resultados filtrados por compositor'
        : 'Resultados da busca';
    }

    // Se usuário tem uploads e há compositor selecionado
    if (
      userSuggestions.length > 0 &&
      filterByComposer &&
      filterByComposer.trim() !== ''
    ) {
      const userComposerWorks = userSuggestions.filter(
        (w) => w.composer.id === filterByComposer
      );
      if (userComposerWorks.length > 0) {
        return `Suas obras de ${
          userComposerWorks[0].composer.fullName ||
          userComposerWorks[0].composer.name
        }`;
      }
    }

    // Se usuário tem uploads (geral)
    if (
      userSuggestions.length > 0 &&
      (!filterByComposer || filterByComposer.trim() === '')
    ) {
      return 'Suas obras recentes';
    }

    // Se há compositor selecionado mas usuário não tem obras dele
    if (filterByComposer && filterByComposer.trim() !== '') {
      return 'Obras do compositor selecionado';
    }

    return 'Obras populares';
  };

  // 🆕 DETERMINAR COR DO ÍCONE BASEADO NO TIPO DE SUGESTÃO
  const getIconAndColor = () => {
    const hasUserWorks = userSuggestions.length > 0;
    const hasComposerFilter =
      filterByComposer && filterByComposer.trim() !== '';

    if (
      hasUserWorks &&
      (!hasComposerFilter ||
        userSuggestions.some((w) => w.composer.id === filterByComposer))
    ) {
      return { icon: FiUser, color: 'text-accent-purple' };
    }

    if (hasComposerFilter) {
      return { icon: FiFilter, color: 'text-accent-blue' };
    }

    return { icon: FiTrendingUp, color: 'text-brand-primary' };
  };

  const suggestionsLabel = getSuggestionsLabel();
  const { icon: SuggestionIcon, color: iconColor } = getIconAndColor();

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
                    // 🆕 VERIFICAR SE É OBRA DO USUÁRIO
                    const isUserWork = userSuggestions.some(
                      (uw) => uw.id === work.id
                    );

                    return (
                      <button
                        key={i}
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
                      : filterByComposer && filterByComposer.trim() !== ''
                      ? 'Nenhuma obra encontrada para este compositor'
                      : 'Nenhuma obra disponível'}
                  </p>
                  {query.length >= 2 && (
                    <p className="text-xs mt-1">
                      Tente termos diferentes
                      {filterByComposer && filterByComposer.trim() !== ''
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

      {/* 🆕 Informação sobre o estado atual */}
      {!selectedWorkData && (
        <div className="mt-1 flex items-center justify-between text-xs text-theme-tertiary">
          <div className="flex items-center space-x-2">
            {filterByComposer && filterByComposer.trim() !== '' && (
              <span className="flex items-center space-x-1">
                <FiFilter className="w-3 h-3" />
                <span>Filtrado por compositor</span>
              </span>
            )}
            {userSuggestions.length > 0 && (
              <span className="flex items-center space-x-1">
                <FiUser className="w-3 h-3 text-accent-purple" />
                <span>{userSuggestions.length} obra(s) sua(s)</span>
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
