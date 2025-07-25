// app/components/Players/SpotifyRedirectCard.tsx
'use client';

import React from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { SiSpotify } from 'react-icons/si';
import { AnimatedItem } from '../../animation/AnimatedComponents';
import Image from 'next/image';

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
                <Image
                  width={20}
                  height={20}
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
        </div>
      </div>
    </AnimatedItem>
  );
};

export default SpotifyRedirectCard;
