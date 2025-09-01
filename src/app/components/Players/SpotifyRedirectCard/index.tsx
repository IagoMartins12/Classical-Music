// app/components/Players/SpotifyRedirectCard.tsx - ATUALIZADO COM THUMBNAIL PERSISTENTE E TRADUÇÕES
'use client';

import React from 'react';
import { FiExternalLink, FiClock, FiMusic } from 'react-icons/fi';
import { SiSpotify } from 'react-icons/si';
import { AnimatedItem } from '../../animation/AnimatedComponents';
import Image from 'next/image';
import { useTranslation } from '@/app/context/TranslationContext';

interface SpotifyRedirectCardProps {
  spotify: {
    trackId: string;
    trackUrl: string;
    displayTitle?: string | null; // 🆕 "Frédéric Chopin - Yuja Wang"
    previewUrl: string | null;
    albumArt: string | null; // Para compatibilidade
    thumbnail?: string | null; // 🆕 Thumbnail salvo na base de dados
    artists: string[];
    albumName: string;
    duration: number; // 🆕 Duração em ms
    popularity: number;
  };
}

const SpotifyRedirectCard: React.FC<SpotifyRedirectCardProps> = ({
  spotify,
}) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });

  // 🆕 Função para formatar duração
  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 🆕 Função para separar compositor e intérprete
  const parseArtistInfo = () => {
    if (spotify.displayTitle) {
      // Se já tem o título formatado, usar ele
      return {
        display: spotify.displayTitle,
        hasInterpreter: spotify.displayTitle.includes(' - '),
      };
    }

    // Fallback para o formato antigo
    return {
      display: spotify.artists.join(', '),
      hasInterpreter: spotify.artists.length > 1,
    };
  };

  const artistInfo = parseArtistInfo();

  // 🆕 Priorizar thumbnail salvo na base de dados
  const getThumbnailUrl = () => {
    // 1. Thumbnail salvo na base de dados (prioridade máxima)
    if (spotify.thumbnail) {
      return spotify.thumbnail;
    }

    // 2. AlbumArt como fallback
    if (spotify.albumArt) {
      return spotify.albumArt;
    }

    return null;
  };

  const thumbnailUrl = getThumbnailUrl();

  return (
    <AnimatedItem hover="none" springType="bouncy">
      <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-700/30 rounded-xl overflow-hidden hover:border-green-600/50 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
        {/* Header com Logo Spotify */}
        <div className="p-4 border-b border-green-700/30 bg-green-900/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#1db954] rounded-lg flex items-center justify-center">
                <SiSpotify className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-theme-primary font-semibold text-sm">
                  {t('spotify_card_disponivel')}
                </h4>
                <p className="text-green-400 text-xs">
                  {t('spotify_card_ouvir_completa')}
                </p>
              </div>
            </div>

            {/* 🆕 Duração e indicador de thumbnail */}
            <div className="flex items-center space-x-3">
              {/* Duração */}
              {spotify.duration > 0 && (
                <div className="flex items-center space-x-1 text-green-400">
                  <FiClock className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    {formatDuration(spotify.duration)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-4">
          <div className="flex space-x-4">
            {/* Capa do Álbum - 🆕 Com indicador de qualidade */}
            <div className="flex-shrink-0 relative">
              {thumbnailUrl ? (
                <div className="relative">
                  <Image
                    width={80}
                    height={80}
                    src={thumbnailUrl}
                    alt={spotify.albumName}
                    className="w-20 h-20 rounded-lg object-cover shadow-lg border border-green-700/30"
                    onError={(e) => {
                      console.warn(
                        'Erro ao carregar thumbnail do Spotify:',
                        thumbnailUrl
                      );
                      // Fallback para ícone
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />

                  {/* 🆕 Indicador de qualidade da imagem */}
                  {spotify.thumbnail && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#1db954] rounded-full flex items-center justify-center border border-green-900">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-green-800/50 to-green-700/50 rounded-lg flex items-center justify-center border border-green-700/30">
                  <SiSpotify className="w-8 h-8 text-green-400" />
                </div>
              )}
            </div>

            {/* Informações da Música */}
            <div className="flex-1 min-w-0">
              <div className="space-y-2">
                {/* 🆕 Artistas com destaque para compositor/intérprete */}
                <div>
                  <p className="text-theme-primary font-medium text-sm truncate">
                    {artistInfo.display}
                  </p>

                  {/* 🆕 Indicador visual se tem intérprete */}
                  {artistInfo.hasInterpreter && (
                    <p className="text-green-400 text-xs">
                      {t('spotify_card_compositor_interprete')}
                    </p>
                  )}

                  <p className="text-theme-secondary text-xs truncate mt-1">
                    {spotify.albumName}
                  </p>
                </div>

                {/* 🆕 Informações adicionais expandidas */}
                <div className="flex items-center space-x-3 text-xs text-gray-400">
                  {/* Preview disponível */}
                  {spotify.previewUrl && (
                    <div
                      className="flex items-center space-x-1"
                      title={t('spotify_card_preview_disponivel')}
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>{t('spotify_card_preview_30s')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 🆕 Preview Player (se disponível) - Melhorado */}
          {spotify.previewUrl && (
            <div className="mt-4 p-3 bg-green-900/10 rounded-lg border border-green-700/20">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <FiMusic className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-green-300 text-sm font-medium">
                      {t('spotify_card_preview_30s')}
                    </p>
                    {spotify.duration > 0 && (
                      <span className="text-xs text-green-400">
                        {t('spotify_card_musica_completa')}{' '}
                        {formatDuration(spotify.duration)}
                      </span>
                    )}
                  </div>
                  <audio
                    controls
                    className="w-full mt-1 h-8"
                    preload="none"
                    controlsList="nodownload"
                  >
                    <source src={spotify.previewUrl} type="audio/mpeg" />
                    {t('spotify_card_nao_suporta_audio')}
                  </audio>
                </div>
              </div>
            </div>
          )}

          {/* Botão de Redirecionamento - 🆕 Melhorado */}
          <div className="mt-4">
            <a
              href={spotify.trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#1db954] hover:bg-[#1ed760] text-white rounded-lg py-3 px-4 flex items-center justify-center space-x-2 font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg group"
            >
              <SiSpotify className="w-4 h-4" />
              <span>{t('spotify_card_ouvir_spotify')}</span>
              <FiExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>

            {/* 🆕 Link direto para o álbum (se disponível) */}
            {spotify.albumName && (
              <div className="mt-2 text-center">
                <a
                  href={`https://open.spotify.com/search/${encodeURIComponent(
                    spotify.albumName
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  {t('spotify_card_ver_album')} {spotify.albumName}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </AnimatedItem>
  );
};

export default SpotifyRedirectCard;
