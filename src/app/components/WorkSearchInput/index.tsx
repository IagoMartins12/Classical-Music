// app/components/WorkSearchInput.tsx - COM PRESERVAÇÃO DA OBRA SELECIONADA
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  PiCheck,
  PiFunnel,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiSpinnerGap,
  PiStar,
  PiTrendUp,
  PiUser,
  PiWarningCircle,
} from 'react-icons/pi';
import { searchWorks } from '@/app/requests/catalog-search';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

export interface WorkSearchInputWorkProp {
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
  onWorkSelect: (workId: string, workData?: WorkSearchInputWorkProp) => void;
  popularWorks?: WorkSearchInputWorkProp[];
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
  const [works, setWorks] = useState<WorkSearchInputWorkProp[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkData, setSelectedWorkData] =
    useState<WorkSearchInputWorkProp | null>(null);
  const [composerWorks, setComposerWorks] = useState<WorkSearchInputWorkProp[]>(
    []
  );
  const [isInitialized, setIsInitialized] = useState(false);

  // 🆕 ESTADO PARA PRESERVAR A OBRA SELECIONADA
  const [preservedSelectedWork, setPreservedSelectedWork] =
    useState<WorkSearchInputWorkProp | null>(null);

  console.log('selectedWorkData', selectedWorkData);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastComposerRef = useRef<string>('');
  const lastQueryRef = useRef<string>('');

  // MEMOIZAR PROPS ESTÁVEIS PARA EVITAR RE-RENDERS
  const stableFilterByComposer = useMemo(
    () => filterByComposer,
    [filterByComposer]
  );
  const stableUserSuggestions = useMemo(
    () => userSuggestions,
    [userSuggestions]
  );
  const stablePopularWorks = useMemo(() => popularWorks, [popularWorks]);

  // FUNÇÃO PARA CARREGAR OBRAS DO COMPOSITOR - MEMOIZADA E ESTÁVEL
  const loadComposerWorks = useCallback(async (composerId: string) => {
    if (
      !composerId ||
      composerId.trim() === '' ||
      lastComposerRef.current === composerId
    ) {
      return;
    }

    lastComposerRef.current = composerId;

    try {
      setIsLoading(true);

      const data = await searchWorks({ composerId, limit: 20 });
      setComposerWorks(data.works);
    } catch (error) {
      console.error('Erro ao buscar obras do compositor:', error);
      setComposerWorks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // EFFECT PARA CARREGAR OBRAS DO COMPOSITOR - SEM LOOPS
  useEffect(() => {
    if (stableFilterByComposer && stableFilterByComposer.trim() !== '') {
      if (lastComposerRef.current !== stableFilterByComposer) {
        loadComposerWorks(stableFilterByComposer);
      }
    } else {
      if (composerWorks.length > 0) {
        setComposerWorks([]);
        lastComposerRef.current = '';
      }
    }
  }, [stableFilterByComposer, loadComposerWorks, composerWorks.length]);

  // FUNÇÃO PARA PRIORIZAR OBRAS DO USUÁRIO - MEMOIZADA
  const prioritizeUserWorks = useCallback(
    (apiWorks: WorkSearchInputWorkProp[]): WorkSearchInputWorkProp[] => {
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

  // FUNÇÃO PARA SUGESTÕES LOCAIS - MEMOIZADA E ESTÁVEL
  const getLocalSuggestions = useCallback((): WorkSearchInputWorkProp[] => {
    // 1. SEMPRE priorizar obras do usuário se existirem
    if (stableUserSuggestions.length > 0) {
      let userWorksToShow = stableUserSuggestions;

      // Filtrar por compositor se selecionado
      if (stableFilterByComposer && stableFilterByComposer.trim() !== '') {
        userWorksToShow = stableUserSuggestions.filter(
          (work) => work.composer.id === stableFilterByComposer
        );

        if (userWorksToShow.length === 0) {
          return composerWorks.slice(0, 8);
        }
      }

      return userWorksToShow.slice(0, 8);
    }

    // 2. Se há compositor selecionado, mostrar obras dele
    if (
      stableFilterByComposer &&
      stableFilterByComposer.trim() !== '' &&
      composerWorks.length > 0
    ) {
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
          `Obras populares filtradas por compositor: ${popularFiltered.length}`
        );
        return popularFiltered.slice(0, 8);
      }
    }

    // 4. Fallback: obras populares gerais (apenas se não há filtro de compositor)
    if (!stableFilterByComposer || stableFilterByComposer.trim() === '') {
      return stablePopularWorks.slice(0, 8);
    }

    console.log('Nenhuma obra encontrada para as condições atuais');
    return [];
  }, [
    stableUserSuggestions,
    stableFilterByComposer,
    composerWorks,
    stablePopularWorks,
  ]);

  // FUNCTION PARA BUSCA - MEMOIZADA E COM DEBOUNCE MELHOR
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
        console.log('Buscando obras:', {
          query: searchQuery,
          filterByComposer: composerFilter,
        });

        const data = await searchWorks({
          q: searchQuery,
          limit: 12,
          composerId: composerFilter?.trim() || undefined,
        });
        const endTime = Date.now();

        console.log(`Busca completada em ${endTime - startTime}ms`);

        setWorks(prioritizeUserWorks(data.works));
      } catch (error) {
        console.error('Erro ao buscar obras:', error);
        setWorks([]);
      } finally {
        setIsLoading(false);
      }
    },
    [prioritizeUserWorks]
  );

  // EFFECT PARA BUSCA COM QUERY - SEM LOOPS E COM DEBOUNCE MELHOR
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

  // EFFECT PARA INICIALIZAÇÃO - APENAS UMA VEZ
  useEffect(() => {
    if (!isInitialized && query.length < 2) {
      const suggestions = getLocalSuggestions();
      setWorks(suggestions);
      setIsInitialized(true);
    }
  }, [isInitialized, query.length, getLocalSuggestions]);

  // 🆕 BUSCAR DADOS DA OBRA SELECIONADA - COM FALLBACK PARA OBRA PRESERVADA
  const findSelectedWorkData = useCallback(() => {
    if (!selectedWork) return null;

    // 1. PRIMEIRO: Tentar nas listas normais
    const allWorks = [
      ...stableUserSuggestions,
      ...composerWorks,
      ...stablePopularWorks,
      ...works,
    ];

    const foundWork = allWorks.find((w) => w.id === selectedWork);

    if (foundWork) {
      console.log('✅ [LISTAS] Obra encontrada nas listas:', foundWork.title);
      return foundWork;
    }

    // 2. FALLBACK: Usar obra preservada se IDs coincidem
    if (preservedSelectedWork && preservedSelectedWork.id === selectedWork) {
      console.log(
        '✅ [PRESERVADA] Usando obra preservada:',
        preservedSelectedWork.title
      );
      return preservedSelectedWork;
    }

    console.warn(
      '⚠️ [NOT FOUND] Obra não encontrada em lugar nenhum:',
      selectedWork
    );
    return null;
  }, [
    selectedWork,
    stableUserSuggestions,
    composerWorks,
    stablePopularWorks,
    works,
    preservedSelectedWork, // 🆕 Adicionar obra preservada como dependência
  ]);

  // Effect para atualizar dados da obra selecionada
  useEffect(() => {
    const workData = findSelectedWorkData();
    console.log('WORK DATA', workData);
    setSelectedWorkData(workData);
  }, [selectedWork, findSelectedWorkData]);

  // 🆕 Effect para limpar obra preservada quando selectedWork muda para vazio
  useEffect(() => {
    if (!selectedWork) {
      setPreservedSelectedWork(null);
    }
  }, [selectedWork]);

  // FECHAR DROPDOWN AO CLICAR FORA - MEMOIZADO
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

  // 🆕 HANDLER PARA SELEÇÃO DE OBRA - COM PRESERVAÇÃO
  const handleWorkSelect = useCallback(
    (work: WorkSearchInputWorkProp) => {
      console.log('Obra selecionada:', work);

      // 🆕 PRESERVAR a obra selecionada IMEDIATAMENTE
      setPreservedSelectedWork(work);

      onWorkSelect(work.id, work);
      setSelectedWorkData(work);
      setQuery('');
      setIsOpen(false);
    },
    [onWorkSelect]
  );

  const handleClearSelection = useCallback(() => {
    onWorkSelect('');
    setSelectedWorkData(null);
    setPreservedSelectedWork(null); // 🆕 Limpar obra preservada também
    setQuery('');
    setIsOpen(false);
  }, [onWorkSelect]);

  // handleInputChange MUITO SIMPLES - apenas atualiza query e isOpen
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setIsOpen(value.length > 0 || !selectedWorkData);
    },
    [selectedWorkData]
  );

  // LABELS E CORES MEMOIZADOS
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
        return { icon: PiUser, color: '' };
      }

      if (hasComposerFilter) {
        return { icon: PiFunnel, color: '' };
      }

      return { icon: PiTrendUp, color: 'text-ouro-texto' };
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
            <Inline gap={3}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                <PiCheck className="w-4 h-4" />
              </div>
              <div>
                <Text papel="rotulo" tom="forte" as="p" className="font-medium">
                  {selectedWorkData.title}
                </Text>
                <Text papel="legenda" tom="fraco" as="p">
                  {selectedWorkData.composer.fullName ||
                    selectedWorkData.composer.name}
                </Text>
              </div>
            </Inline>
            {!disabled && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-theme-tertiary transition-colors p-1"
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
            <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4 z-10" />
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
              <PiSpinnerGap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ouro-texto w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Dropdown de resultados */}
          {isOpen && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated rounded-lg shadow-theme-large max-h-80 overflow-y-auto z-50"
            >
              {/* Loading */}
              {(isLoading || loadingUserSuggestions) && (
                <div className="p-4 text-center">
                  <PiSpinnerGap className="w-5 h-5 mx-auto animate-spin text-ouro-texto mb-2" />
                  <Text papel="rotulo" tom="fraco" as="p">
                    {loadingUserSuggestions
                      ? 'Carregando suas obras...'
                      : 'Buscando obras...'}
                  </Text>
                </div>
              )}

              {/* Results */}
              {!isLoading && !loadingUserSuggestions && works.length > 0 && (
                <div className="p-2">
                  {/* Header com label inteligente */}
                  {suggestionsLabel && (
                    <Text
                      papel="legenda"
                      tom="fraco"
                      as="div"
                      className="px-3 py-2 flex items-center gap-2 font-medium uppercase tracking-wide"
                    >
                      <SuggestionIcon className={`w-4 h-4 ${iconColor}`} />
                      {suggestionsLabel}
                    </Text>
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
                        className="w-full text-left p-3 rounded-lg transition-colors group"
                      >
                        <Inline gap={3}>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform ${
                              isUserWork ? '' : ''
                            }`}
                          >
                            {isUserWork ? (
                              <PiStar className="w-4 h-4" />
                            ) : (
                              <PiMusicNotes className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Inline gap={2}>
                              <Text
                                papel="rotulo"
                                tom="forte"
                                as="p"
                                className="font-medium truncate"
                              >
                                {work.title}
                              </Text>
                              {isUserWork && (
                                <span className="text-xs px-1.5 py-0.5 rounded">
                                  Sua
                                </span>
                              )}
                            </Inline>
                            <Text
                              papel="legenda"
                              tom="fraco"
                              as="p"
                              className="truncate"
                            >
                              {work.composer.fullName || work.composer.name}
                            </Text>
                          </div>
                        </Inline>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {!isLoading && !loadingUserSuggestions && works.length === 0 && (
                <div className="p-4 text-center text-theme-tertiary">
                  <PiMagnifyingGlass className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
          <Inline
            as="p"
            gap={1}
            className="text-red-500 text-sm font-medium mt-1"
          >
            <PiWarningCircle className="w-4 h-4" />
            <span>{error}</span>
          </Inline>
        </div>
      )}

      {/* Informação sobre o estado atual */}
      {!selectedWorkData && (
        <Text
          papel="legenda"
          tom="fraco"
          as="div"
          className="mt-1 flex items-center justify-between"
        >
          <Inline gap={2}>
            {stableFilterByComposer && stableFilterByComposer.trim() !== '' && (
              <Inline as="span" gap={1}>
                <PiFunnel className="w-3 h-3" />
                <span>Filtrado por compositor</span>
              </Inline>
            )}
            {stableUserSuggestions.length > 0 && (
              <Inline as="span" gap={1}>
                <PiUser className="w-3 h-3" />
                <span>{stableUserSuggestions.length} obra(s) sua(s)</span>
              </Inline>
            )}
          </Inline>
          {composerWorks.length > 0 && (
            <span className="text-ouro-texto">
              {composerWorks.length} obra(s) do compositor
            </span>
          )}
        </Text>
      )}
    </div>
  );
};

export default WorkSearchInput;
