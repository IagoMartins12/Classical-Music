// ComposerWorks.tsx - Premium version with theme system
'use client';

import { ComposerWork } from '@/app/requests/composer-details';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  FiMusic,
  FiPlay,
  FiSearch,
  FiFilter,
  FiClock,
  FiX,
  FiBookOpen,
  FiRefreshCw,
  FiCalendar,
} from 'react-icons/fi';
import {
  GiViolin,
  GiFlute,
  GiTrumpet,
  GiSaxophone,
  GiHarp,
  GiDrum,
  GiMusicalNotes,
  GiGrandPiano,
} from 'react-icons/gi';
import { MdLibraryMusic } from 'react-icons/md';
import FavoriteButton from '../../FavoriteButton';

interface ComposerWorksProps {
  works: ComposerWork[];
  composerName: string;
}

// Função para determinar o ícone do instrumento
const getInstrumentIcon = (instrumentName: string) => {
  const instrument = instrumentName.toLowerCase();

  if (instrument.includes('piano')) return <GiGrandPiano className="w-5 h-5" />;
  if (instrument.includes('violin')) return <GiViolin className="w-5 h-5" />;
  if (instrument.includes('cello')) return <GiViolin className="w-5 h-5" />;
  if (instrument.includes('flute') || instrument.includes('flauta'))
    return <GiFlute className="w-5 h-5" />;
  if (instrument.includes('trumpet') || instrument.includes('trompete'))
    return <GiTrumpet className="w-5 h-5" />;
  if (instrument.includes('saxophone') || instrument.includes('saxofone'))
    return <GiSaxophone className="w-5 h-5" />;
  if (instrument.includes('harp') || instrument.includes('harpa'))
    return <GiHarp className="w-5 h-5" />;
  if (
    instrument.includes('guitar') ||
    instrument.includes('violão') ||
    instrument.includes('guitarra')
  )
    return <GiMusicalNotes className="w-5 h-5" />;
  if (
    instrument.includes('drum') ||
    instrument.includes('bateria') ||
    instrument.includes('percussão')
  )
    return <GiDrum className="w-5 h-5" />;
  if (instrument.includes('orchestra') || instrument.includes('orquestra'))
    return <GiMusicalNotes className="w-5 h-5" />;

  return <FiMusic className="w-5 h-5" />;
};

// Função para formatar duração
const formatDuration = (duration?: string) => {
  if (!duration) return null;

  // Se já está no formato MM:SS ou HH:MM:SS
  if (duration.includes(':')) return duration;

  // Se é apenas número (assumindo minutos)
  const minutes = parseInt(duration);
  if (!isNaN(minutes)) {
    return `${minutes}min`;
  }

  return duration;
};

export default function ComposerWorks({
  works,
  composerName,
}: ComposerWorksProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Extrair instrumentos e gêneros únicos para filtros
  const { instruments, genres } = useMemo(() => {
    const instrumentsSet = new Set<string>();
    const genresSet = new Set<string>();

    works.forEach((work) => {
      if (work.instrument?.name) {
        instrumentsSet.add(work.instrument.name);
      }
    });

    return {
      instruments: Array.from(instrumentsSet).sort(),
      genres: Array.from(genresSet).sort(),
    };
  }, [works]);

  // Filtrar obras
  const filteredWorks = useMemo(() => {
    return works.filter((work) => {
      const matchesSearch =
        work.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.opOrCatalog?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.tone?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesInstrument =
        !selectedInstrument || work.instrument?.name === selectedInstrument;

      return matchesSearch && matchesInstrument;
    });
  }, [works, searchTerm, selectedInstrument, selectedGenre]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInstrument('');
    setSelectedGenre('');
  };

  const hasActiveFilters = searchTerm || selectedInstrument || selectedGenre;

  if (works.length === 0) {
    return (
      <div className="classical-card p-12">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
            <FiBookOpen className="w-6 h-6 text-theme-inverse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Obras Catalogadas
            </h2>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MdLibraryMusic className="w-8 h-8 text-theme-tertiary" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
            Nenhuma obra catalogada
          </h3>
          <p className="text-theme-secondary">
            Ainda não temos obras catalogadas para este compositor em nossa base
            de dados.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="classical-card overflow-hidden">
      {/* Header */}
      <div className="p-8 border-b border-theme-secondary bg-gradient-to-r from-theme-elevated to-interactive-hover">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center">
            <FiBookOpen className="w-6 h-6 text-theme-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Obras Catalogadas
            </h2>
            <p className="text-theme-secondary classical-subtitle">
              {filteredWorks.length} de {works.length} obras de {composerName}
            </p>
          </div>
        </div>

        {/* Barra de busca */}
        <div className="relative mb-4">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título, opus ou tonalidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-classical w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Toggle de filtros */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-classical-secondary flex items-center space-x-2"
          >
            <FiFilter className="w-4 h-4" />
            <span>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</span>
            <div
              className={`transition-transform duration-300 ${
                showFilters ? 'rotate-180' : ''
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* Filtros expandidos */}
        <div
          className={`overflow-hidden transition-all duration-500 ${
            showFilters ? 'max-h-96 opacity-100 mt-6' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-theme-elevated/50 border border-theme-primary rounded-xl">
            {/* Filtro de instrumento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary">
                Instrumento
              </label>
              <div className="relative">
                <FiMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                <select
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                  className="input-classical w-full appearance-none pl-11"
                >
                  <option value="">Todos os instrumentos</option>
                  {instruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-theme-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filtro de gênero */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-secondary">
                Gênero
              </label>
              <div className="relative">
                <MdLibraryMusic className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-tertiary" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="input-classical w-full appearance-none pl-11"
                >
                  <option value="">Todos os gêneros</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-theme-tertiary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="text-sm font-medium text-theme-secondary">
              Filtros ativos:
            </span>

            {searchTerm && (
              <div className="flex items-center gap-2 px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm">
                <span>Busca: &quot;{searchTerm}&quot;</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-brand-secondary transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            {selectedInstrument && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm">
                <span>Instrumento: {selectedInstrument}</span>
                <button
                  onClick={() => setSelectedInstrument('')}
                  className="hover:text-accent-blue/80 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            {selectedGenre && (
              <div className="flex items-center gap-2 px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-sm">
                <span>Gênero: {selectedGenre}</span>
                <button
                  onClick={() => setSelectedGenre('')}
                  className="hover:text-accent-green/80 transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={clearFilters}
              className="text-sm text-accent-red hover:text-accent-red/80 underline font-medium"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de obras */}
      <div className="p-8">
        {filteredWorks.length > 0 ? (
          <div className="space-y-4">
            {filteredWorks.map((work, index) => (
              <Link
                href={`/works/${work.id}`}
                key={work.id}
                className="classical-card-simple hover:shadow-theme-glow transition-all duration-300 group animate-fade-in-up block"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        {work.instrument?.name && (
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center text-theme-primary group-hover:scale-110 transition-transform duration-300">
                            {getInstrumentIcon(work.instrument.name)}
                          </div>
                        )}

                        <div className="flex-1">
                          <span className="text-lg font-semibold text-brand-primary group-hover:text-brand-secondary transition-colors duration-300 classical-title">
                            {work.title}
                          </span>

                          {work.opOrCatalog && (
                            <span className="ml-3 text-sm text-theme-tertiary bg-theme-elevated border border-theme-secondary px-3 py-1 rounded-full">
                              {work.opOrCatalog}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-theme-secondary">
                        {work.instrument?.name && (
                          <div className="flex items-center space-x-2">
                            <FiMusic className="w-4 h-4 text-theme-tertiary" />
                            <span>{work.instrument.name}</span>
                          </div>
                        )}

                        {work.tone && (
                          <div className="flex items-center space-x-2">
                            <GiMusicalNotes className="w-4 h-4 text-theme-tertiary" />
                            <span>{work.tone}</span>
                          </div>
                        )}

                        {work.mediaDuration && (
                          <div className="flex items-center space-x-2">
                            <FiClock className="w-4 h-4 text-theme-tertiary" />
                            <span>{formatDuration(work.mediaDuration)}</span>
                          </div>
                        )}

                        {work.compositionYear && (
                          <div className="flex items-center space-x-2">
                            <FiCalendar className="w-4 h-4 text-theme-tertiary" />
                            <span className="w-4 h-4 text-center text-theme-tertiary text-xs font-bold">
                              Ano
                            </span>
                            <span className="pl-2">{work.compositionYear}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="flex items-center space-x-2 ml-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {work.videoUrl && (
                        <a
                          href={work.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-xl flex items-center justify-center hover:bg-accent-red/20 hover:scale-110 transition-all duration-300"
                          title="Assistir vídeo"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FiPlay className="w-4 h-4" />
                        </a>
                      )}

                      <FavoriteButton
                        id={work.id}
                        type="work"
                        variant="default"
                        size="md"
                        itemName={work.title}
                        showToast={true}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Empty state para resultados filtrados
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FiSearch className="w-8 h-8 text-theme-tertiary" />
            </div>
            <h3 className="text-xl font-bold text-theme-primary classical-title mb-2">
              Nenhuma obra encontrada
            </h3>
            <p className="text-theme-secondary mb-6">
              Tente ajustar os filtros de busca para encontrar mais resultados.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-classical-primary flex items-center space-x-2 mx-auto group"
              >
                <FiRefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
