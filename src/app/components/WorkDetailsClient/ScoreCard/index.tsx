// ScoreCard.tsx - VERSÃO OTIMIZADA sem múltiplas requisições COM TRADUÇÕES
import { FiClock, FiDownload, FiFileText, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import Image from 'next/image';
import FavoriteScoreButton from '../../FavoriteScoreButton';
import { useLearningModalStore } from '@/app/stores/useLearningModalStore';
import { WorkScore } from '@prisma/client';
import { useTranslation } from '@/app/context/TranslationContext';

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
}

const ScoreCard = ({
  score,
  workId,
  isSelected,
  onSelect,
  isLastInGroup = false,
  groupSize = 1,
  showMostFavoritedBadge = true,
  isMostFavorited = false, // 🆕 Recebido via props
}: ScoreCardProps) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const [showMagnified, setShowMagnified] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { isInSelectionMode, selectedWorkScore, setSelectedWorkScore } =
    useLearningModalStore();

  // Determina se deve mostrar o thumbnail
  const shouldShowThumbnail = groupSize === 1 || isLastInGroup;

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return '';
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  return (
    <div
      className={`
          cursor-pointer transition-all flex flex-col-reverse duration-300 hover:shadow-theme-glow group relative overflow-hidden
          ${
            isSelected ||
            (isInSelectionMode && selectedWorkScore?.sourceId === score.id)
              ? 'classical-card !p-0 border-brand-primary bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 shadow-theme-glow'
              : 'classical-card-simple hover:border-theme-primary hover:bg-interactive-hover'
          }
          ${shouldShowThumbnail ? '' : 'mb-0 border-b-0 rounded-b-none'}
          ${
            isMostFavorited
              ? 'ring-2 ring-accent-gold/50 shadow-accent-gold/20'
              : ''
          }
        `}
      onClick={() => {
        if (isInSelectionMode) {
          setSelectedWorkScore(null);
        }
        onSelect();
      }}
    >
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
        {/* Thumbnail com efeito lupa */}
        {shouldShowThumbnail && score.thumbnailUrl && (
          <div
            className="relative w-24 h-32 flex-shrink-0 group/thumbnail"
            onMouseEnter={() => setShowMagnified(true)}
            onMouseLeave={() => setShowMagnified(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
          >
            <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-theme-primary shadow-theme-medium group-hover/thumbnail:shadow-theme-glow transition-all duration-300 group-hover/thumbnail:scale-105">
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
                <div className="w-8 h-8 bg-theme-inverse rounded-full flex items-center justify-center">
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

            {/* Lupa expandida */}
            {showMagnified && (
              <div
                className="fixed z-[9999] pointer-events-none animate-fade-in-scale"
                style={{
                  left: `${mousePosition.x + 50}px`,
                  top: `${mousePosition.y - 100}px`,
                }}
              >
                <div className="bg-theme-elevated rounded-2xl shadow-theme-large border-2 border-theme-primary p-3 backdrop-blur-md">
                  <Image
                    src={score.thumbnailUrl}
                    alt={`Preview expandido de ${score.title}`}
                    className="w-80 h-96 object-contain rounded-xl"
                    width={80}
                    height={80}
                    priority
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h4 className="font-semibold text-theme-primary text-base leading-tight classical-title mb-2 group-hover:text-brand-primary transition-colors duration-300">
                {score.title}
              </h4>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0">
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
                  className="flex items-center gap-2 bg-brand-gradient text-theme-primary px-4 py-2 rounded-xl text-sm font-medium hover:scale-105 hover:shadow-theme-glow transition-all duration-300 group/download"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiDownload className="w-3 h-3 group-hover/download:animate-bounce" />
                  <span>{t('score_card_download')}</span>
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
                </a>
              )}
            </div>
          </div>

          {/* Detalhes em grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {score.fileSize && (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="w-5 h-5 bg-accent-blue/20 border border-accent-blue/30 rounded-lg flex items-center justify-center">
                  <FiFileText className="w-3 h-3 text-accent-blue" />
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
                <div className="w-5 h-5 bg-accent-green/20 border border-accent-green/30 rounded-lg flex items-center justify-center">
                  <FiUser className="w-3 h-3 text-accent-green" />
                </div>
                <span>
                  {score.uploader}
                  {score.uploadDate && ` • ${score.uploadDate}`}
                </span>
              </div>
            )}

            {shouldShowThumbnail && score.uploadDate && (
              <div className="flex items-center gap-2 text-theme-secondary">
                <div className="w-5 h-5 bg-brand-primary/20 border border-brand-primary/30 rounded-lg flex items-center justify-center">
                  <FiClock className="w-3 h-3 text-theme-primary" />
                </div>
                <span>{score.uploadDate}</span>
              </div>
            )}
          </div>

          {/* Informações adicionais para thumbnail */}
          {shouldShowThumbnail &&
            (score.editor || score.publisher || score.copyright) && (
              <div className="mt-4 pt-4 border-t border-theme-secondary">
                <div className="space-y-2 text-xs text-theme-tertiary">
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
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-xl pointer-events-none"></div>

      {/* 🆕 Badge de mais favoritada - apenas se for verdadeiro */}
      {showMostFavoritedBadge && isMostFavorited && (
        <div className="flex w-fit self-end mt-4 mx-2 mb-0">
          <div className="px-3 py-1.5 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-500/40 text-yellow-600 rounded-full font-medium shadow-lg backdrop-blur-sm animate-pulse hover:animate-none transition-all duration-300 hover:scale-105">
            <div className="flex items-center space-x-1">
              <span className="text-base">👑</span>
              <span className="text-sm font-bold hidden sm:inline">
                {t('score_card_favorita_comunidade')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Efeito especial para a mais favoritada */}
      {isMostFavorited && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 to-accent-orange/5 rounded-xl pointer-events-none"></div>
      )}
    </div>
  );
};

export default ScoreCard;
