// app/genres/GenresClient.tsx
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiTag,
  FiSearch,
  FiX,
  FiArrowLeft,
  FiMusic,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi';
import AnimatedMusicalNotes2 from '../../components/AnimatedMusicalNotes2';
import ViewModeToggle from '../../components/ViewModeToggle';

interface Genre {
  id: string;
  name: string;
}

interface GenresClientProps {
  genres: Genre[];
}

export default function GenresClient({ genres }: GenresClientProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  );

  // Filtrar gêneros baseado na busca
  const filteredGenres = useMemo(() => {
    if (!searchTerm) return genres;

    return genres.filter((genre) =>
      genre.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [genres, searchTerm]);

  // Agrupar gêneros por letra inicial
  const groupedGenres = useMemo(() => {
    const grouped = filteredGenres.reduce((acc, genre) => {
      const firstLetter = genre.name.charAt(0).toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(genre);
      return acc;
    }, {} as Record<string, Genre[]>);

    // Ordenar as chaves alfabeticamente
    const sortedKeys = Object.keys(grouped).sort();
    const sortedGrouped: Record<string, Genre[]> = {};

    sortedKeys.forEach((key) => {
      sortedGrouped[key] = grouped[key];
    });

    return sortedGrouped;
  }, [filteredGenres]);

  const handleGenreSelect = (genreId: string, genreName: string) => {
    // Redirecionar para /works com o gênero selecionado
    router.push(`/works?workGenresArr=${genreName}`);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const goBack = () => {
    router.back();
  };

  // Função para colapsar/expandir seções
  const toggleSection = (letter: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (collapsedSections.has(letter)) {
      newCollapsed.delete(letter);
    } else {
      newCollapsed.add(letter);
    }
    setCollapsedSections(newCollapsed);
  };

  // Função para colapsar/expandir todas as seções
  const toggleAllSections = () => {
    const allLetters = Object.keys(groupedGenres);
    if (collapsedSections.size === allLetters.length) {
      // Se todas estão colapsadas, expandir todas
      setCollapsedSections(new Set());
    } else {
      // Se nem todas estão colapsadas, colapsar todas
      setCollapsedSections(new Set(allLetters));
    }
  };

  // Verifica se uma seção está colapsada
  const isSectionCollapsed = (letter: string) => {
    return collapsedSections.has(letter);
  };

  // Verifica se todas as seções estão colapsadas
  const areAllSectionsCollapsed = () => {
    const allLetters = Object.keys(groupedGenres);
    return (
      collapsedSections.size === allLetters.length && allLetters.length > 0
    );
  };

  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header */}
        <div className="relative text-center py-16">
          <AnimatedMusicalNotes2 />

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <FiTag className="w-8 h-8 text-theme-primary" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Gêneros Musicais
            </h1>
            <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle">
              Explore todos os {genres.length} gêneros de música clássica
              disponíveis
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="classical-card p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={goBack}
              className="btn-classical-secondary flex items-center space-x-2"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span className="">Voltar</span>
            </button>

            <div className="flex items-center space-x-4">
              {/* Expand/Collapse All Button */}
              {Object.keys(groupedGenres).length > 0 && (
                <button
                  onClick={toggleAllSections}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  {areAllSectionsCollapsed() ? (
                    <>
                      <FiChevronDown className="w-4 h-4" />
                      <span>Expandir Todas</span>
                    </>
                  ) : (
                    <>
                      <FiChevronUp className="w-4 h-4" />
                      <span>Colapsar Todas</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
            <input
              type="text"
              placeholder="Buscar gêneros (ex: sonata, concerto, sinfonia...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-classical pl-12 pr-12 w-full"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="text-theme-secondary">
              {searchTerm ? (
                <>
                  <span className="font-medium text-theme-primary">
                    {filteredGenres.length}
                  </span>{' '}
                  gêneros encontrados para &quot;
                  <span className="font-medium text-theme-primary">
                    {searchTerm}
                  </span>
                  &quot;
                </>
              ) : (
                <>
                  Mostrando todos os{' '}
                  <span className="font-medium text-theme-primary">
                    {genres.length}
                  </span>{' '}
                  gêneros disponíveis
                </>
              )}
            </div>

            {/* View Mode Toggle */}
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>

        {/* Genres Display */}
        {filteredGenres.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedGenres).map(([letter, genresInGroup]) => (
              <div key={letter} className="classical-card p-6">
                {/* Section Header - Clicável para expandir/colapsar */}
                <button
                  onClick={() => toggleSection(letter)}
                  className="flex items-center mb-4 w-full text-left hover:bg-interactive-hover rounded-lg p-2 -m-2 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center mr-4">
                    <span className="text-xl font-bold text-theme-primary">
                      {letter}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Letra {letter}
                    </h2>
                    <p className="text-theme-secondary text-sm">
                      {genresInGroup.length} gênero
                      {genresInGroup.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="ml-4 transition-transform duration-300 group-hover:scale-110">
                    {isSectionCollapsed(letter) ? (
                      <FiChevronDown className="w-5 h-5 text-theme-secondary" />
                    ) : (
                      <FiChevronUp className="w-5 h-5 text-theme-secondary" />
                    )}
                  </div>
                </button>

                {/* Section Content - Condicionalmente renderizado */}
                {!isSectionCollapsed(letter) && (
                  <div className="animate-fade-in-up">
                    {viewMode === 'cards' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {genresInGroup.map((genre, index) => (
                          <button
                            key={genre.id}
                            onClick={() =>
                              handleGenreSelect(genre.id, genre.name)
                            }
                            className="classical-card p-4 text-left hover:shadow-theme-glow hover:scale-105 transition-all duration-300 group animate-fade-in-up"
                            style={{
                              animationDelay: `${index * 0.05}s`,
                              animationFillMode: 'backwards',
                            }}
                          >
                            <div className="flex cursor-pointer items-center">
                              <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-accent-purple/30 transition-colors">
                                <FiMusic className="w-5 h-5 text-accent-purple" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium capitalize text-theme-primary group-hover:text-brand-primary transition-colors truncate">
                                  {genre.name}
                                </h3>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-4 h-4 text-brand-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {genresInGroup.map((genre, index) => (
                          <button
                            key={genre.id}
                            onClick={() =>
                              handleGenreSelect(genre.id, genre.name)
                            }
                            className="w-full p-4 text-left hover:bg-interactive-hover transition-all duration-300 rounded-lg group animate-fade-in-up border border-transparent hover:border-theme-primary"
                            style={{
                              animationDelay: `${index * 0.02}s`,
                              animationFillMode: 'backwards',
                            }}
                          >
                            <div className="flex items-center">
                              <FiMusic className="w-5 h-5 text-accent-purple mr-4" />
                              <span className="font-medium capitalize text-theme-primary group-hover:text-brand-primary transition-colors">
                                {genre.name}
                              </span>
                              <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg
                                  className="w-4 h-4 text-brand-primary"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Empty State
          <div className="classical-card p-12 text-center">
            <div className="w-16 h-16 bg-theme-tertiary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiTag className="w-8 h-8 text-theme-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
              Nenhum gênero encontrado
            </h3>
            <p className="text-theme-secondary mb-6">
              Não encontramos gêneros que correspondam à sua busca por &quot;
              <strong>{searchTerm}</strong>&quot;.
            </p>
            <button onClick={clearSearch} className="btn-classical-primary">
              Limpar Busca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
