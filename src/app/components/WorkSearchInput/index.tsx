// components/WorkSearchInput.tsx - Componente para busca de obras
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiMusic, FiX, FiTrendingUp, FiUser } from 'react-icons/fi';

interface Work {
  id: string;
  title: string;
  opOrCatalog?: string;
  composer: {
    name: string;
    fullName?: string;
  };
  annotationsCount?: number;
}

interface WorkSearchInputProps {
  selectedWork: string;
  onWorkSelect: (workId: string) => void;
  popularWorks?: Work[];
  isDisabled?: boolean;
}

export default function WorkSearchInput({
  selectedWork,
  onWorkSelect,
  popularWorks = [],
  isDisabled = false,
}: WorkSearchInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [works, setWorks] = useState<Work[]>(popularWorks);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkName, setSelectedWorkName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // Função para buscar dados da obra por ID
  const fetchWorkById = useCallback(async (workId: string) => {
    try {
      console.log('🔍 Buscando obra por ID:', workId);

      const response = await fetch(
        `/api/works/search?q=${encodeURIComponent(workId)}&limit=1`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.works && data.works.length > 0) {
          const work = data.works[0];
          console.log('✅ Obra encontrada:', work.title);
          return work;
        }
      }

      console.log('⚠️ Obra não encontrada para ID:', workId);
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar obra por ID:', error);
      return null;
    }
  }, []);

  // Encontrar nome da obra selecionada
  useEffect(() => {
    const findSelectedWork = async () => {
      if (selectedWork) {
        // Primeiro tenta encontrar nas listas locais (mais rápido)
        const work =
          popularWorks?.find((w) => w.id === selectedWork) ||
          works?.find((w) => w.id === selectedWork);

        if (work) {
          const workName = formatWorkName(work);
          setSelectedWorkName(workName);
          console.log('✅ Obra encontrada na lista local:', work.title);
        } else {
          // Se não encontrou nas listas locais, busca na API
          console.log('🔍 Obra não encontrada localmente, buscando na API...');
          const fetchedWork = await fetchWorkById(selectedWork);

          if (fetchedWork) {
            const workName = formatWorkName(fetchedWork);
            setSelectedWorkName(workName);

            // Adicionar a obra às listas locais para futuras buscas
            setWorks((prev) => {
              const exists = prev.some((w) => w.id === fetchedWork.id);
              if (!exists) {
                return [...prev, fetchedWork];
              }
              return prev;
            });
          } else {
            setSelectedWorkName('');
          }
        }
      } else {
        setSelectedWorkName('');
      }
    };

    findSelectedWork();
  }, [selectedWork, popularWorks, works, fetchWorkById]);

  // Função para formatar nome da obra
  const formatWorkName = (work: Work) => {
    const composerName = work.composer.fullName || work.composer.name;
    return `${work.title}${
      work.opOrCatalog ? ` (${work.opOrCatalog})` : ''
    } - ${composerName}`;
  };

  // Busca de obras com debounce
  const searchWorksDebounced = useCallback(
    async (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          console.log('🔍 Fazendo busca para:', term);

          const response = await fetch(
            `/api/works/search?q=${encodeURIComponent(term)}&limit=20`
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('📊 Resultados recebidos:', data.works.length, 'obras');
          setWorks(data.works);
        } catch (error) {
          console.error('❌ Erro ao buscar obras:', error);
          setWorks(popularWorks || []); // Fallback para obras populares
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [popularWorks]
  );

  // Effect para busca
  useEffect(() => {
    if (searchTerm.trim()) {
      searchWorksDebounced(searchTerm);
    } else {
      setWorks(popularWorks || []);
      setIsLoading(false);
    }
  }, [searchTerm, searchWorksDebounced, popularWorks]);

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
    if (!searchTerm && (!works || works.length === 0)) {
      // Carregar obras populares se não tiver dados
      setIsLoading(true);
      try {
        const response = await fetch('/api/works/search?q=&limit=20');

        if (response.ok) {
          const data = await response.json();
          setWorks(data.works);
          console.log('📊 Obras populares carregadas:', data.works.length);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar obras populares:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleWorkSelect = (work: Work) => {
    console.log('🎯 Obra selecionada:', work.title);
    onWorkSelect(work.id);
    const workName = formatWorkName(work);
    setSelectedWorkName(workName);
    setIsOpen(false);
    setSearchTerm('');
    inputRef.current?.blur();
  };

  const handleClear = () => {
    console.log('🗑️ Limpando seleção de obra');
    onWorkSelect('');
    setSelectedWorkName('');
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

  const displayWorks = works;
  const showPopularLabel =
    !searchTerm && popularWorks && popularWorks.length > 0;

  return (
    <div className="relative z-[120]">
      <div className="relative">
        <FiMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary z-10" />

        <input
          ref={inputRef}
          type="text"
          placeholder={selectedWorkName || 'Buscar obra...'}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className={`input-classical pl-11 pr-12 w-full ${
            isDisabled ? 'cursor-not-allowed opacity-50' : ''
          } ${selectedWork ? 'text-theme-primary font-medium' : ''}`}
          disabled={isDisabled}
        />

        {(selectedWork || searchTerm) && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors z-10"
            disabled={isDisabled}
          >
            <FiX className="w-4 h-4" />
          </button>
        )}

        {!searchTerm && !selectedWork && (
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
          {showPopularLabel && (
            <div className="flex items-center gap-2 px-4 py-3 bg-theme-secondary/10 border-b border-theme-secondary">
              <FiTrendingUp className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-theme-secondary">
                Obras Populares
              </span>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2 text-theme-secondary">
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Buscando obras...</span>
              </div>
            </div>
          )}

          {/* Results */}
          {!isLoading && displayWorks && displayWorks.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {displayWorks.map((work, index) => (
                <button
                  key={work.id}
                  onClick={() => handleWorkSelect(work)}
                  className={`
                    w-full text-left px-4 py-3 hover:bg-interactive-hover transition-colors duration-200 border-b last:border-b-0 border-theme-secondary
                    ${
                      selectedWork === work.id
                        ? 'bg-brand-primary/10 text-brand-primary font-medium'
                        : ''
                    }
                    ${index === 0 && !showPopularLabel ? 'border-t-0' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-theme-primary truncate">
                        {work.title}
                        {work.opOrCatalog && (
                          <span className="text-theme-tertiary ml-1">
                            ({work.opOrCatalog})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-theme-secondary truncate mt-0.5">
                        <FiUser className="w-3 h-3 mr-1" />
                        {work.composer.fullName || work.composer.name}
                      </div>
                    </div>

                    {work.annotationsCount && work.annotationsCount > 0 && (
                      <div className="ml-3 flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-theme-secondary/20 text-theme-secondary">
                          {work.annotationsCount} anotaç
                          {work.annotationsCount !== 1 ? 'ões' : 'ão'}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!displayWorks || displayWorks.length === 0) && (
            <div className="px-4 py-8 text-center">
              <FiMusic className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
              <p className="text-sm text-theme-secondary">
                {searchTerm
                  ? `Nenhuma obra encontrada para "${searchTerm}"`
                  : 'Nenhuma obra disponível'}
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
