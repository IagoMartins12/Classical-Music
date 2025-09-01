// app/components/GenreSearchInput.tsx - Com Z-index Corrigido e Traduções
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FiTag,
  FiSearch,
  FiX,
  FiExternalLink,
  FiChevronDown,
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import { searchGenresAction } from '@/app/actions/genre-actions';
import { useTranslation } from '@/app/context/TranslationContext';
import {
  translateGenre,
  matchesGenreSearch,
} from '@/app/utils/translations/instrumentsGenresTranslation';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

interface Genre {
  id: string;
  name: string;
  originalName?: string;
  translatedName?: string;
}

interface GenreSearchInputProps {
  selectedGenre: string;
  onGenreSelect: (genreId: string) => void;
  initialGenres: Genre[];
  isDisabled?: boolean;
}

export default function GenreSearchInput({
  selectedGenre,
  onGenreSelect,
  initialGenres,
  isDisabled,
}: GenreSearchInputProps) {
  const { t } = useTranslation({ sections: ['pages/works'] });
  const { language } = useLanguageStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenreName, setSelectedGenreName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Encontrar o nome do gênero selecionado e traduzir
  useEffect(() => {
    if (selectedGenre) {
      // Buscar o gênero nas listas disponíveis
      const foundGenre = initialGenres.find(
        (genre) =>
          genre.originalName === selectedGenre ||
          genre.name === selectedGenre ||
          genre.id === selectedGenre
      );

      if (foundGenre) {
        // Se encontrou, usar o nome traduzido para exibição
        const translatedName = translateGenre(
          foundGenre.originalName || foundGenre.name,
          language
        );
        setSelectedGenreName(translatedName);
      } else {
        // Se não encontrou na lista, traduzir diretamente
        const translatedName = translateGenre(selectedGenre, language);
        setSelectedGenreName(translatedName);
      }
    } else {
      setSelectedGenreName('');
    }
  }, [selectedGenre, initialGenres, language]);

  // Traduzir gêneros para exibição
  const translatedGenres = genres.map((genre) => ({
    ...genre,
    translatedName: translateGenre(genre.originalName || genre.name, language),
    originalName: genre.originalName || genre.name,
  }));

  // Buscar gêneros com debounce usando Server Action - BUSCA BILÍNGUE OTIMIZADA
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(async () => {
      if (searchTerm.length > 0) {
        setIsLoading(true);
        try {
          // A busca bilíngue agora é feita no server action
          const result = await searchGenresAction(searchTerm, 20);

          if (result.success) {
            // Filtrar resultados localmente também para incluir gêneros iniciais
            const localFilteredGenres = initialGenres.filter((genre) =>
              matchesGenreSearch(
                genre.originalName || genre.name,
                searchTerm,
                language
              )
            );

            // Combinar resultados do servidor com resultados locais
            const allResults = new Map<string, any>();

            // Adicionar resultados do servidor
            result.data.forEach((genre: any) => {
              allResults.set(genre.id, genre);
            });

            // Adicionar resultados locais (para garantir que não perdemos nenhum)
            localFilteredGenres.forEach((genre) => {
              allResults.set(genre.id, genre);
            });

            // Converter para array e ordenar por relevância
            const finalResults = Array.from(allResults.values()).sort(
              (a, b) => {
                const aName = (a.originalName || a.name).toLowerCase();
                const bName = (b.originalName || b.name).toLowerCase();
                const aTranslated = translateGenre(
                  a.originalName || a.name,
                  language
                ).toLowerCase();
                const bTranslated = translateGenre(
                  b.originalName || b.name,
                  language
                ).toLowerCase();
                const searchTermLower = searchTerm.toLowerCase();

                // Priorizar matches exatos
                const aExactMatch =
                  aName === searchTermLower || aTranslated === searchTermLower;
                const bExactMatch =
                  bName === searchTermLower || bTranslated === searchTermLower;

                if (aExactMatch && !bExactMatch) return -1;
                if (!aExactMatch && bExactMatch) return 1;

                // Priorizar matches que começam com o termo
                const aStartsWith =
                  aName.startsWith(searchTermLower) ||
                  aTranslated.startsWith(searchTermLower);
                const bStartsWith =
                  bName.startsWith(searchTermLower) ||
                  bTranslated.startsWith(searchTermLower);

                if (aStartsWith && !bStartsWith) return -1;
                if (!aStartsWith && bStartsWith) return 1;

                // Ordenar alfabeticamente pela tradução
                return aTranslated.localeCompare(bTranslated);
              }
            );

            setGenres(finalResults);
          }
        } catch (error) {
          console.error('Erro ao buscar gêneros:', error);
          // Em caso de erro, usar apenas filtro local
          const localFilteredGenres = initialGenres.filter((genre) =>
            matchesGenreSearch(
              genre.originalName || genre.name,
              searchTerm,
              language
            )
          );
          setGenres(localFilteredGenres);
        } finally {
          setIsLoading(false);
        }
      } else {
        setGenres(initialGenres);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, initialGenres, language]);

  // Fechar dropdown quando pressionar Escape
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen]);

  const handleGenreSelect = (genre: Genre & { translatedName?: string }) => {
    // Sempre passar o nome original (português) para o filtro
    const originalName = genre.originalName || genre.name;
    onGenreSelect(originalName);
    setSelectedGenreName(
      genre.translatedName || translateGenre(originalName, language)
    );
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onGenreSelect('');
    setSelectedGenreName('');
    setSearchTerm('');
  };

  const handleViewAllGenres = () => {
    router.push('/genres');
  };

  return (
    <div className="relative z-[115]">
      {/* Input Field */}
      <div className="relative">
        <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />

        <input
          ref={inputRef}
          type="text"
          placeholder={selectedGenreName || t('genre_search_jsx_placeholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="input-classical pl-11 pr-16 w-full capitalize"
          disabled={isDisabled}
        />

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          {selectedGenre && (
            <button
              onClick={handleClear}
              className="text-theme-tertiary hover:text-theme-primary transition-colors"
              title="Limpar seleção"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-theme-tertiary hover:text-theme-primary transition-colors"
          >
            <FiChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Backdrop (para garantir que cliques fora fechem o dropdown) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[300]"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute classical-card-simple top-full left-0 right-0 mt-2 bg-theme-surface border border-theme-primary rounded-lg shadow-theme-glow z-[400] max-h-80 overflow-hidden"
          style={{
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Search Header */}
          {searchTerm && (
            <div className="px-4 py-2 border-b border-theme-secondary bg-theme-elevated">
              <div className="flex items-center text-sm text-theme-secondary">
                <FiSearch className="w-4 h-4 mr-2" />
                {t('genre_search_jsx_searching_for')}{' '}
                <span className="font-medium text-theme-primary ml-1">
                  &quot;{searchTerm}&quot;
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-center text-theme-secondary">
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                {t('genre_search_jsx_loading')}
              </div>
            </div>
          )}

          {/* Genres List */}
          {!isLoading && (
            <div className="max-h-64 overflow-y-auto">
              {translatedGenres.length > 0 ? (
                <>
                  {translatedGenres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre)}
                      className={`w-full px-4 py-3 text-left hover:bg-interactive-hover transition-colors border-b border-theme-secondary/50 last:border-b-0 ${
                        genre.originalName === selectedGenre ||
                        genre.name === selectedGenre
                          ? 'bg-brand-primary/10 text-brand-primary font-medium'
                          : 'text-theme-primary'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="capitalize">
                          {genre.translatedName}
                        </span>
                        {(genre.originalName === selectedGenre ||
                          genre.name === selectedGenre) && (
                          <div className="ml-auto w-2 h-2 bg-brand-primary rounded-full"></div>
                        )}
                      </div>
                    </button>
                  ))}

                  {/* "Ver todos os gêneros" button */}
                  <button
                    onClick={handleViewAllGenres}
                    className="w-full px-4 py-3 text-left hover:bg-interactive-hover transition-colors border-t border-theme-secondary bg-theme-elevated"
                  >
                    <div className="flex items-center text-brand-primary">
                      <FiExternalLink className="w-4 h-4 mr-3" />
                      <span className="font-medium">
                        {t('genre_search_jsx_view_all')}
                      </span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center text-theme-secondary">
                  <FiTag className="w-8 h-8 mx-auto mb-2 text-theme-tertiary" />
                  <p className="font-medium">
                    {t('genre_search_jsx_no_results')}
                  </p>
                  <p className="text-sm mt-1">
                    {t('genre_search_jsx_adjust_search')}
                  </p>
                  <button
                    onClick={handleViewAllGenres}
                    className="text-brand-primary hover:text-brand-secondary underline text-sm mt-2"
                  >
                    {t('genre_search_jsx_view_all_available')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
