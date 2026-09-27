// components/ComposerSearchInput.tsx - COM SUPORTE A FULLDATA
'use client';

import { useTranslation } from '@/app/context/TranslationContext';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PiMagnifyingGlass, PiTrendUp, PiUser, PiX } from 'react-icons/pi';
import { findComposerById, findComposers } from '@/app/requests/catalog-search';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

interface Composer {
  id: string;
  name: string;
  fullName?: string;
  worksCount?: number;
  // Campos adicionais quando fullData = true
  alternativeNames?: string;
  imslpId?: string;
  portraitUrl?: string;
  epochName?: string;
  epoch?: {
    id: string;
    name: string;
  };
  birthDate?: string;
  deathDate?: string;
  birthPlace?: string;
  deathPlace?: string;
  nationality?: string;
  biography?: string;
  wikiLink?: string;
}

interface ComposerSearchInputProps {
  selectedComposer: string;
  onComposerSelect: (composerId: string) => void;
  isDisabled?: boolean;
  fullData?: boolean; // ✅ Agora será usado!
}

export default function ComposerSearchInputSimple({
  selectedComposer,
  onComposerSelect,
  isDisabled = false,
  fullData = false,
}: ComposerSearchInputProps) {
  const { t } = useTranslation({ sections: ['components/composerFilter'] });

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composers, setComposers] = useState<Composer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComposerName, setSelectedComposerName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  // ✅ MODIFICADO: Agora usa fullData
  const fetchComposerById = useCallback(
    async (composerId: string) => {
      try {
        // A API devolve sempre o detalhe completo; `fullData` só muda o log.
        const composer = await findComposerById(composerId);
        if (composer && composer.name) {
          console.log('✅ Compositor encontrado:', composer.name);
          if (fullData) {
            console.log('📊 Dados completos:', composer);
          }
          return composer;
        }

        console.log('⚠️ Compositor não encontrado para ID:', composerId);
        return null;
      } catch (error) {
        console.error('❌ Erro ao buscar compositor por ID:', error);
        return null;
      }
    },
    [fullData]
  ); // ✅ Agora depende de fullData

  useEffect(() => {
    const findSelectedComposer = async () => {
      if (!selectedComposer) {
        setSelectedComposerName('');
        return;
      }

      const localComposer = composers?.find((c) => c.id === selectedComposer);

      if (localComposer) {
        setSelectedComposerName(localComposer.fullName || localComposer.name);
        console.log(
          '✅ Compositor encontrado na lista local:',
          localComposer.name
        );
        return;
      }

      console.log(
        '🔍 Compositor não encontrado localmente, buscando na API...'
      );
      const fetchedComposer = await fetchComposerById(selectedComposer);

      if (fetchedComposer) {
        setSelectedComposerName(
          fetchedComposer.fullName || fetchedComposer.name
        );
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
    };

    findSelectedComposer();
  }, [selectedComposer, fetchComposerById, composers]);

  // ✅ MODIFICADO: Agora usa fullData na busca
  const searchComposersDebounced = useCallback(
    (term: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setIsLoading(true);
        try {
          console.log('🔍 Fazendo busca para:', term);

          const results = await findComposers(term, 20);
          console.log(
            '📊 Resultados recebidos:',
            results.length,
            'compositores'
          );
          if (fullData && results.length > 0) {
            console.log('📊 Exemplo de dados completos:', results[0]);
          }
          setComposers(results);
        } catch (error) {
          console.error('❌ Erro ao buscar compositores:', error);
          setComposers([]);
        } finally {
          setIsLoading(false);
        }
      }, 300);
    },
    [fullData]
  );

  useEffect(() => {
    if (searchTerm.trim()) {
      searchComposersDebounced(searchTerm);
    } else {
      setComposers([]);
      setIsLoading(false);
    }
  }, [searchTerm, searchComposersDebounced]);

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ✅ MODIFICADO: Usa fullData ao carregar compositores populares
  const handleInputFocus = async () => {
    setIsOpen(true);
    if (!searchTerm && (!composers || composers.length === 0)) {
      setIsLoading(true);
      try {
        const results = await findComposers('', 20);
        setComposers(results);
        console.log('📊 Compositores populares carregados:', results.length);
      } catch (error) {
        console.error('❌ Erro ao carregar compositores populares:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleComposerSelect = (composer: Composer) => {
    console.log('🎯 Compositor selecionado:', composer.name);
    if (fullData) {
      console.log('📊 Dados completos do compositor:', composer);
    }
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
  const showPopularLabel = !searchTerm;

  return (
    <div className={`relative ${isOpen ? 'z-menu' : 'z-elevado'}`}>
      <div className="relative">
        <PiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary z-10" />

        <input
          ref={inputRef}
          type="text"
          placeholder={
            selectedComposerName || t('composer_search_jsx_placeholder')
          }
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary transition-colors z-10"
            disabled={isDisabled}
          >
            <PiX className="w-4 h-4" />
            <NomeAcao acao="fechar" />
          </button>
        )}

        {!searchTerm && !selectedComposer && (
          <PiMagnifyingGlass className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
        )}
      </div>

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-theme-elevated border border-theme-secondary rounded-xl shadow-xl z-menu max-h-80 overflow-hidden"
          style={{
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.3)',
          }}
        >
          {showPopularLabel && (
            <div className="flex items-center gap-2 px-4 py-3 border-b border-theme-secondary">
              <PiTrendUp className="w-4 h-4 text-ouro-texto" />
              <Text papel="rotulo" tom="suave" className="font-medium">
                {t('composer_search_jsx_popular_label')}
              </Text>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Inline gap={2} className="text-theme-secondary">
                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">
                  {t('composer_search_jsx_loading')}
                </span>
              </Inline>
            </div>
          )}

          {!isLoading && displayComposers && displayComposers.length > 0 && (
            <div className="max-h-64 overflow-y-auto">
              {displayComposers.map((composer, index) => (
                <button
                  key={composer.id}
                  onClick={() => handleComposerSelect(composer)}
                  className={`
                    w-full text-left px-4 py-3 transition-colors duration-200 border-b last:border-b-0 border-theme-secondary
                    ${
                      selectedComposer === composer.id
                        ? 'text-ouro-texto font-medium'
                        : ''
                    }
                    ${index === 0 && !showPopularLabel ? 'border-t-0' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <Text
                        papel="rotulo"
                        tom="forte"
                        as="div"
                        className="font-medium truncate"
                      >
                        {composer.name}
                      </Text>
                      {composer.fullName &&
                        composer.fullName !== composer.name && (
                          <Text
                            papel="legenda"
                            tom="suave"
                            as="div"
                            className="truncate mt-0.5"
                          >
                            {composer.fullName}
                          </Text>
                        )}
                      {/* ✅ NOVO: Mostra época se fullData estiver ativo */}
                      {fullData && composer.epochName && (
                        <Text
                          papel="legenda"
                          tom="fraco"
                          as="div"
                          className="truncate mt-0.5"
                        >
                          {composer.epochName}
                        </Text>
                      )}
                    </div>

                    {composer.worksCount && Number(composer.worksCount) > 1 && (
                      <div className="ml-3 flex-shrink-0">
                        <Text
                          papel="legenda"
                          tom="suave"
                          className="inline-flex items-center px-2 py-1 rounded-full"
                        >
                          {composer.worksCount}{' '}
                          {composer.worksCount === 1
                            ? t('composer_search_jsx_work_singular')
                            : t('composer_search_jsx_work_plural')}
                        </Text>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading &&
            (!displayComposers || displayComposers.length === 0) && (
              <div className="px-4 py-8 text-center">
                <PiUser className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                <Text papel="rotulo" tom="suave" as="p">
                  {searchTerm
                    ? `${t('composer_search_jsx_no_results_for')} "${searchTerm}"`
                    : t('composer_search_jsx_no_composers')}
                </Text>
                {searchTerm && (
                  <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                    {t('composer_search_jsx_try_broader')}
                  </Text>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
