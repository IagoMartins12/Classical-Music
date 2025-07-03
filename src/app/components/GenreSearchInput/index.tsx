// app/components/GenreSearchInput.tsx - Com Z-index Corrigido
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

interface Genre {
  id: string;
  name: string;
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenreName, setSelectedGenreName] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Encontrar o nome do gênero selecionado
  useEffect(() => {
    if (selectedGenre) {
      setSelectedGenreName(selectedGenre);
    } else {
      setSelectedGenreName('');
    }
  }, [selectedGenre, genres]);

  // Buscar gêneros com debounce usando Server Action
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(async () => {
      if (searchTerm.length > 0) {
        setIsLoading(true);
        try {
          const result = await searchGenresAction(searchTerm, 20);

          if (result.success) {
            setGenres(result.data);
          }
        } catch (error) {
          console.error('Erro ao buscar gêneros:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setGenres(initialGenres);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen, initialGenres]);

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

  const handleGenreSelect = (genre: Genre) => {
    onGenreSelect(genre.name);
    setSelectedGenreName(genre.name);
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
      {' '}
      {/* Z-index corrigido */}
      {/* Input Field */}
      <div className="relative">
        <FiTag className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />

        <input
          ref={inputRef}
          type="text"
          placeholder={selectedGenreName || 'Buscar gênero...'}
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
          className="fixed inset-0 z-[300]" // Z-index alto para backdrop
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
          className="absolute classical-card-simple top-full left-0 right-0 mt-2 bg-theme-surface border border-theme-primary rounded-lg shadow-theme-glow z-[400] max-h-80 overflow-hidden" // Z-index muito alto
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
                Buscando por:{' '}
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
                Buscando gêneros...
              </div>
            </div>
          )}

          {/* Genres List */}
          {!isLoading && (
            <div className="max-h-64 overflow-y-auto">
              {genres.length > 0 ? (
                <>
                  {genres.map((genre) => (
                    <button
                      key={genre.id}
                      onClick={() => handleGenreSelect(genre)}
                      className={`w-full px-4 py-3 text-left hover:bg-interactive-hover transition-colors border-b border-theme-secondary/50 last:border-b-0 ${
                        genre.id === selectedGenre
                          ? 'bg-brand-primary/10 text-brand-primary font-medium'
                          : 'text-theme-primary'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="capitalize">{genre.name}</span>
                        {genre.id === selectedGenre && (
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
                      <span className="font-medium">Ver todos os gêneros</span>
                    </div>
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center text-theme-secondary">
                  <FiTag className="w-8 h-8 mx-auto mb-2 text-theme-tertiary" />
                  <p className="font-medium">Nenhum gênero encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar sua busca ou</p>
                  <button
                    onClick={handleViewAllGenres}
                    className="text-brand-primary hover:text-brand-secondary underline text-sm mt-2"
                  >
                    ver todos os gêneros disponíveis
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
