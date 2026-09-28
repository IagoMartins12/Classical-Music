// app/components/SimpleWorkSearchInput.tsx - VERSÃO ATUALIZADA COM USER SUGGESTIONS
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  PiCheck,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiSpinnerGap,
  PiStar,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { getWorkById, searchWorks } from '@/app/requests/catalog-search';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

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
  /** Id do campo, para o `<label htmlFor>` de quem usa. */
  id?: string;
  selectedWork: string;
  onWorkSelect: (workId: string, data?: any) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  filterByComposer?: string;
  // 🆕 Novas props para sugestões
  userSuggestions?: Work[];
  loadingUserSuggestions?: boolean;
}

const SimpleWorkSearchInput: React.FC<SimpleWorkSearchInputProps> = ({
  id,
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
        const data = await searchWorks({
          q: searchQuery,
          limit: 12,
          composerId: filterByComposer?.trim() || undefined,
        });
        const apiWorks = data.works;

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
        onWorkSelect('', null);
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
        const workData = await getWorkById(workId);
        if (workData) {
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
      onWorkSelect(work.id, work);
      setSelectedWorkData(work);
      setQuery('');
      setIsOpen(false);
      setWorks([]);
    },
    [onWorkSelect]
  );

  const handleClearSelection = useCallback(() => {
    console.log('🗑️ [SIMPLE-WORK-SEARCH] Limpando seleção');
    onWorkSelect('', null);
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
                <PiX className="w-4 h-4" />
                <NomeAcao acao="fechar" />
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
              id={id}
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
              <PiSpinnerGap className="absolute right-3 top-1/2 transform -translate-y-1/2 text-ouro-texto w-4 h-4 animate-spin" />
            )}
          </div>

          {/* Dropdown de resultados */}
          {isOpen && !disabled && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated rounded-lg shadow-theme-large max-h-80 overflow-y-auto z-menu"
            >
              {/* Loading */}
              {(isLoading || loadingUserSuggestions) && (
                <div className="p-4 text-center">
                  <PiSpinnerGap className="w-5 h-5 mx-auto animate-spin text-ouro-texto mb-2" />
                  <Text papel="rotulo" tom="fraco" as="p">
                    {loadingUserSuggestions
                      ? 'Carregando sugestões...'
                      : 'Buscando obras...'}
                  </Text>
                </div>
              )}

              {/* Results */}
              {!isLoading && !loadingUserSuggestions && works.length > 0 && (
                <div className="p-2">
                  {/* 🆕 Header inteligente */}
                  <Text
                    papel="legenda"
                    tom="fraco"
                    as="div"
                    className="px-3 py-2 font-medium uppercase tracking-wide border-b border-theme-secondary mb-2"
                  >
                    <div className="flex items-center gap-2">
                      {query.length >= 2 ? (
                        <PiMagnifyingGlass className="w-4 h-4" />
                      ) : userSuggestions.length > 0 ? (
                        <PiStar className="w-4 h-4" />
                      ) : (
                        <PiMusicNotes className="w-4 h-4" />
                      )}
                      {getHeaderLabel()}
                    </div>
                  </Text>

                  {works.map((work, i) => {
                    const isUserWork = isUserSuggestion(work);

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
                                  Sugerida
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
            <Text papel="legenda" tom="fraco" as="div" className="mt-2">
              {userSuggestions.length > 0
                ? ``
                : 'Digite pelo menos 2 caracteres para buscar obras'}
            </Text>
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
    </div>
  );
};

export default SimpleWorkSearchInput;
