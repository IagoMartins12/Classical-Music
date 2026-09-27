// ScoreCard.tsx - VERSÃO OTIMIZADA com Portal para thumbnail sempre no topo
import { PiClock, PiDownloadSimple, PiFileText, PiUser } from 'react-icons/pi';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from '@/app/components/SmartImage';
import FavoriteScoreButton from '../../FavoriteScoreButton';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import type { WorkScore } from '@/app/types/catalog';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface ScoreCardProps {
  score: WorkScore;
  workId: string;
  isSelected: boolean;
  onSelect: () => void;
  isLastInGroup?: boolean;
  groupSize?: number;
  // Props para favoritos
  showFavoriteStats?: boolean;
  showFavor?: boolean;
  showMostFavoritedBadge?: boolean;
  // 🆕 Receber diretamente se é a mais favoritada (evita hook interno)
  isMostFavorited?: boolean;
  favoriteStats?: {
    totalFavorites: number;
    avgRating?: number;
    isMostFavorited?: boolean;
  };

  // 🆕 Props para modo de seleção
  isSelectionMode?: boolean;
  selectionType?: 'want-to-learn' | 'learned' | null;
  isTempSelected?: boolean;
  tempSelectedWorkScore?: { id: string; title: string; source: string } | null;
  isTablet?: boolean;
}

const ScoreCard = ({
  score,
  workId,
  isSelected,
  onSelect,
  isLastInGroup = false,
  groupSize = 1,
  isMostFavorited = false,
  isTablet = true,
}: ScoreCardProps) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const [showMagnified, setShowMagnified] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { isInSelectionMode, selectedWorkScore, setSelectedWorkScore } =
    useLearningModalStore();
  const isDesktop = !isTablet; // Desktop = tela >= 1080px
  // Determina se deve mostrar o thumbnail
  const shouldShowThumbnail = groupSize === 1 || isLastInGroup;

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <>
      <div
        className={`
          cursor-pointer transition-all flex flex-col-reverse duration-300 group relative overflow-hidden
          ${
            isSelected ||
            (isInSelectionMode && selectedWorkScore?.sourceId === score.id)
              ? 'classical-card !p-0 shadow-theme-glow'
              : 'classical-card-simple'
          }
          ${shouldShowThumbnail ? '' : 'mb-0 border-b-0 rounded-b-none'}
         
        `}
        onClick={() => {
          if (isInSelectionMode) {
            setSelectedWorkScore(null);
          }
          onSelect();
        }}
      >
        {/* 🆕 Badge de mais favoritada - FORA DO CARD NA BORDA ESQUERDA */}

        <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
          {/* Thumbnail com efeito lupa */}
          {shouldShowThumbnail && score.thumbnailUrl && (
            <div
              className="relative w-24 h-32 flex-shrink-0 group/thumbnail"
              onMouseEnter={() => setShowMagnified(true)}
              onMouseLeave={() => setShowMagnified(false)}
              onMouseMove={(e) => {
                setMousePosition({
                  x: e.clientX,
                  y: e.clientY,
                });
              }}
            >
              <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-theme-primary shadow-theme-medium transition-all duration-300 group-hover/thumbnail:scale-105">
                <Image
                  src={score.thumbnailUrl}
                  alt={`Preview de ${score.title}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/thumbnail:scale-110"
                  width={60}
                  height={60}
                  priority
                />

                {/* Overlay com ícone de zoom */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-theme-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center md:items-start justify-between gap-4 mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-theme-primary text-base leading-tight classical-title mb-2 transition-colors duration-300">
                  {score.title}
                </h4>
              </div>

              {/* Action buttons */}
              <Inline gap={2} className="flex-shrink-0">
                {/* Botão de favoritar */}
                <FavoriteScoreButton
                  workId={workId}
                  score={score}
                  variant="default"
                  size="md"
                  showToast={true}
                  onFavoriteChange={(isFavorited) => {
                    console.log(
                      `Partitura ${score.title} ${
                        isFavorited ? 'favoritada' : 'desfavoritada'
                      }`
                    );
                  }}
                />

                {/* Download button */}
                {score.downloadUrl && (
                  <a
                    href={score.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-theme-primary px-0 md:px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 transition-all duration-300 group/download"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <PiDownloadSimple className="w-3  hidden md:block h-3 group-hover/download:animate-bounce" />
                    <span className="text-xs">Download</span>
                    <div className="">
                      <svg
                        className="w-3 h-3 transition-transform group-hover/download:translate-x-0.5"
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
                  </a>
                )}
              </Inline>
            </div>

            {/* Detalhes em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {score.fileSize && (
                <div className="flex items-center gap-2 text-theme-secondary">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center">
                    <PiFileText className="w-3 h-3" />
                  </div>
                  <span>
                    {score.fileSize}
                    {score.pageCount &&
                      ` • ${score.pageCount} ${t('score_card_paginas')}`}
                  </span>
                </div>
              )}

              {shouldShowThumbnail && score.uploader && (
                <div className="flex items-center gap-2 text-theme-secondary">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center">
                    <PiUser className="w-3 h-3" />
                  </div>
                  <span>
                    {score.uploader}
                    {score.uploadDate && ` • ${score.uploadDate}`}
                  </span>
                </div>
              )}

              {shouldShowThumbnail && score.uploadDate && (
                <div className="flex items-center gap-2 text-theme-secondary">
                  <div className="w-5 h-5 rounded-lg flex items-center justify-center">
                    <PiClock className="w-3 h-3 text-theme-primary" />
                  </div>
                  <span>{score.uploadDate}</span>
                </div>
              )}
            </div>

            {/* Informações adicionais para thumbnail */}
            {shouldShowThumbnail &&
              (score.editor || score.publisher || score.copyright) && (
                <div className="mt-4 pt-4 border-t border-theme-secondary">
                  <Text
                    papel="legenda"
                    tom="fraco"
                    as="div"
                    className="space-y-2"
                  >
                    {score.editor && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <span className="font-medium text-theme-secondary w-2/12 sm:w-1/12">
                          {t('score_preview_editor')}
                        </span>
                        <span className="w-full sm:w-11/12 text-center sm:text-start">
                          {score.editor}
                        </span>
                      </div>
                    )}
                    {score.publisher && (
                      <div className="flex pt-2 sm:pt-0 flex-col sm:flex-row items-center justify-between gap-2">
                        <span className="font-medium text-theme-secondary w-2/12 sm:w-1/12">
                          {t('score_preview_editora')}
                        </span>
                        <span className="w-full sm:w-11/12 text-center sm:text-start">
                          {truncateText(score.publisher, 300)}
                        </span>
                      </div>
                    )}
                    {score.copyright && (
                      <div className="flex pt-2 sm:pt-0 flex-col sm:flex-row items-center justify-between gap-2">
                        <span className="font-medium text-theme-secondary w-3/12 sm:w-1/12">
                          {t('score_preview_copyright')}
                        </span>
                        <span className="w-full sm:w-11/12 text-center sm:text-start">
                          {score.copyright}
                        </span>
                      </div>
                    )}
                  </Text>
                </div>
              )}
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl pointer-events-none"></div>

        {/* Efeito especial para a mais favoritada */}
        {isMostFavorited && (
          <div className="absolute inset-0 rounded-xl pointer-events-none"></div>
        )}
      </div>

      {/* ⭐ LUPA EXPANDIDA USANDO PORTAL - APENAS PARA DESKTOP ⭐ */}
      {shouldShowThumbnail &&
        score.thumbnailUrl &&
        showMagnified &&
        isDesktop &&
        typeof window !== 'undefined' &&
        createPortal(
          <div
            className="fixed pointer-events-none animate-fade-in-scale"
            style={{
              left: `${mousePosition.x + 20}px`,
              top: `${mousePosition.y - 200}px`,
              zIndex: 'var(--z-menu)',
              isolation: 'isolate',
            }}
          >
            <div
              className="bg-theme-elevated rounded-2xl shadow-theme-large border-2 border-theme-primary p-3 backdrop-blur-md"
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              <Image
                src={score.thumbnailUrl}
                alt={`Preview expandido de ${score.title}`}
                className="w-80 h-96 object-contain rounded-xl"
                width={320}
                height={384}
                priority
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ScoreCard;
