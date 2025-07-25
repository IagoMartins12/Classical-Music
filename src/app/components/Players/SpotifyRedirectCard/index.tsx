// app/components/Players/SpotifyRedirectCard.tsx
'use client';

import React from 'react';
import { FiExternalLink, FiClock, FiTrendingUp } from 'react-icons/fi';
import { SiSpotify } from 'react-icons/si';
import { AnimatedItem } from '../../animation/AnimatedComponents';

interface SpotifyRedirectCardProps {
  spotify: {
    trackId: string;
    trackUrl: string;
    previewUrl: string | null;
    albumArt: string | null;
    artists: string[];
    albumName: string;
    duration: number;
    popularity: number;
  };
}

const SpotifyRedirectCard: React.FC<SpotifyRedirectCardProps> = ({
  spotify,
}) => {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getPopularityColor = (popularity: number) => {
    if (popularity >= 70) return 'text-green-400';
    if (popularity >= 40) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getPopularityLabel = (popularity: number) => {
    if (popularity >= 80) return 'Muito Popular';
    if (popularity >= 60) return 'Popular';
    if (popularity >= 40) return 'Moderado';
    return 'Descoberta';
  };

  return (
    <AnimatedItem hover="scale" springType="bouncy">
      <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/30 rounded-xl overflow-hidden hover:border-green-600/50 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
        {/* Header com Logo Spotify */}
        <div className="p-4 border-b border-green-700/30 bg-green-900/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#1db954] rounded-lg flex items-center justify-center">
              <SiSpotify className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-theme-primary font-semibold text-sm">
                Disponível no Spotify
              </h4>
              <p className="text-green-400 text-xs">Ouça a música completa</p>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-4">
          <div className="flex space-x-4">
            {/* Capa do Álbum */}
            <div className="flex-shrink-0">
              {spotify.albumArt ? (
                <img
                  src={spotify.albumArt}
                  alt={spotify.albumName}
                  className="w-20 h-20 rounded-lg object-cover shadow-lg border border-green-700/30"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-green-800/50 to-green-700/50 rounded-lg flex items-center justify-center border border-green-700/30">
                  <SiSpotify className="w-8 h-8 text-green-400" />
                </div>
              )}
            </div>

            {/* Informações da Música */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {/* Artistas */}
                <div>
                  <p className="text-theme-primary font-medium text-sm truncate">
                    {spotify.artists.join(', ')}
                  </p>
                  <p className="text-theme-secondary text-xs truncate">
                    {spotify.albumName}
                  </p>
                </div>

                {/* Métricas */}
                <div className="flex items-center space-x-4 text-xs">
                  {/* Duração */}
                  <div className="flex items-center space-x-1">
                    <FiClock className="w-3 h-3 text-theme-tertiary" />
                    <span className="text-theme-secondary">
                      {formatDuration(spotify.duration)}
                    </span>
                  </div>

                  {/* Popularidade */}
                  <div className="flex items-center space-x-1">
                    <FiTrendingUp className="w-3 h-3 text-theme-tertiary" />
                    <span
                      className={`font-medium ${getPopularityColor(
                        spotify.popularity
                      )}`}
                    >
                      {getPopularityLabel(spotify.popularity)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Redirecionamento */}
          <div className="mt-4">
            <a
              href={spotify.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1db954] hover:bg-[#1ed760] text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <SiSpotify className="w-4 h-4" />
              <span>Ouvir no Spotify</span>
              <FiExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Preview Notice */}
          {spotify.previewUrl && (
            <div className="mt-3 text-center">
              <p className="text-xs text-theme-tertiary">
                Preview de 30s disponível • Música completa no Spotify
              </p>
            </div>
          )}
        </div>

        {/* Footer com Badge Premium */}
        <div className="px-4 pb-4">
          <div className="bg-green-900/30 border border-green-700/40 rounded-lg p-2 text-center">
            <p className="text-green-300 text-xs font-medium">
              🎵 Experiência completa com Spotify Premium
            </p>
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
};

export default SpotifyRedirectCard;
