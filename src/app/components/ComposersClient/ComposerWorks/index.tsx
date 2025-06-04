'use client';

import { ComposerWork } from '@/app/requests/composer-details';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import {
  FaGuitar,
  FaMusic,
  FaPlay,
  FaExternalLinkAlt,
  FaSearch,
  FaFilter,
} from 'react-icons/fa';
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
import { MdLibraryMusic, MdAccessTime } from 'react-icons/md';

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
    return <FaGuitar className="w-5 h-5" />;
  if (
    instrument.includes('drum') ||
    instrument.includes('bateria') ||
    instrument.includes('percussão')
  )
    return <GiDrum className="w-5 h-5" />;
  if (instrument.includes('orchestra') || instrument.includes('orquestra'))
    return <GiMusicalNotes className="w-5 h-5" />;

  return <FaMusic className="w-5 h-5" />;
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

  // Extrair instrumentos e gêneros únicos para filtros
  const { instruments, genres } = useMemo(() => {
    const instrumentsSet = new Set<string>();
    const genresSet = new Set<string>();

    works.forEach((work) => {
      if (work.instrument?.name) {
        instrumentsSet.add(work.instrument.name);
      }
      if (work.genre?.name) {
        genresSet.add(work.genre.name);
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
      const matchesGenre = !selectedGenre || work.genre?.name === selectedGenre;

      return matchesSearch && matchesInstrument && matchesGenre;
    });
  }, [works, searchTerm, selectedInstrument, selectedGenre]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedInstrument('');
    setSelectedGenre('');
  };

  if (works.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Obras Catalogadas
        </h2>
        <div className="text-center py-12">
          <MdLibraryMusic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            Nenhuma obra catalogada encontrada
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Obras Catalogadas
          </h2>
          <p className="text-gray-600">
            {filteredWorks.length} de {works.length} obras
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        {/* Barra de busca */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por título, opus ou tonalidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filtros por instrumento e gênero */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedInstrument}
              onChange={(e) => setSelectedInstrument(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os instrumentos</option>
              {instruments.map((instrument) => (
                <option key={instrument} value={instrument}>
                  {instrument}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-400 w-4 h-4" />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os gêneros</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedInstrument || selectedGenre) && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista de obras */}
      <div className="space-y-4">
        {filteredWorks.map((work) => (
          <div
            key={work.id}
            className="border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Obra principal */}
            <div className="p-6 bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {work.instrument?.name && (
                      <div className="text-blue-600">
                        {getInstrumentIcon(work.instrument.name)}
                      </div>
                    )}

                    <Link
                      href={`/works/${work.id}`}
                      className="text-lg font-semibold text-blue-600 underline"
                    >
                      {work.title}
                    </Link>

                    {work.opOrCatalog && (
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                        {work.opOrCatalog}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                    {work.instrument?.name && (
                      <div className="flex items-center space-x-2">
                        <FaMusic className="w-4 h-4 text-gray-400" />
                        <span>{work.instrument.name}</span>
                      </div>
                    )}

                    {work.genre?.name && (
                      <div className="flex items-center space-x-2">
                        <MdLibraryMusic className="w-4 h-4 text-gray-400" />
                        <span>{work.genre.name}</span>
                      </div>
                    )}

                    {work.tone && (
                      <div className="flex items-center space-x-2">
                        <GiMusicalNotes className="w-4 h-4 text-gray-400" />
                        <span>{work.tone}</span>
                      </div>
                    )}

                    {work.mediaDuration && (
                      <div className="flex items-center space-x-2">
                        <MdAccessTime className="w-4 h-4 text-gray-400" />
                        <span>{formatDuration(work.mediaDuration)}</span>
                      </div>
                    )}

                    {work.compositionYear && (
                      <div className="flex items-center space-x-2">
                        <span className="w-4 h-4 text-center text-gray-400 text-xs font-bold">
                          Ano
                        </span>
                        <span>{work.compositionYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {work.videoUrl && (
                    <a
                      href={work.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Assistir vídeo"
                    >
                      <FaPlay className="w-4 h-4" />
                    </a>
                  )}

                  <a
                    href={work.imslpPermlink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Ver partitura no IMSLP"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWorks.length === 0 &&
        (searchTerm || selectedInstrument || selectedGenre) && (
          <div className="text-center py-12">
            <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              Nenhuma obra encontrada
            </p>
            <p className="text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        )}
    </div>
  );
}
