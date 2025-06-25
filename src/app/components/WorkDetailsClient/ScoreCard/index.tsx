// components/ScoreCardEnhanced.tsx
'use client';

import React from 'react';
import {
  FiFileText,
  FiDownload,
  FiStar,
  FiBookmark,
  FiClock,
  FiUser,
  FiCheck,
  FiHeart,
} from 'react-icons/fi';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper';

interface ScoreCardEnhancedProps {
  score: IMSLPScore;
  isSelected?: boolean;
  isSaved?: boolean; // Nova prop para indicar se está salva no banco
  onSelect?: () => void;
  isLastInGroup?: boolean;
  groupSize?: number;
  showSavedIndicator?: boolean;
  className?: string;
}

const ScoreCard: React.FC<ScoreCardEnhancedProps> = ({
  score,
  isSelected = false,
  isSaved = false,
  onSelect,
  isLastInGroup = false,
  groupSize = 1,
  showSavedIndicator = false,
  className = '',
}) => {
  // Formatação de dados
  const formatFileSize = (size: string) => {
    if (!size) return '';
    return size.includes('MB') || size.includes('KB') ? size : `${size} MB`;
  };

  const formatPageCount = (pages: string) => {
    if (!pages) return '';
    const num = parseInt(pages);
    return num ? `${num} pág${num > 1 ? 's' : ''}` : '';
  };

  const formatRating = (rating?: number, count?: number) => {
    if (!rating) return null;
    const stars = Math.round(rating);
    return { stars, count: count || 0 };
  };

  const ratingData = formatRating(score.rating, score.ratingsCount);

  return (
    <div
      className={`
        group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer
        ${
          isSelected
            ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border-brand-primary shadow-theme-glow'
            : 'bg-theme-elevated border-theme-secondary hover:border-theme-primary hover:bg-interactive-hover'
        }
        ${!isLastInGroup && groupSize > 1 ? 'mb-2' : ''}
        ${className}
      `}
      onClick={onSelect}
    >
      {/* Indicadores de status */}
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        {/* Indicador de partitura salva */}
        {isSaved && showSavedIndicator && (
          <div
            className="w-6 h-6 bg-accent-green/20 border border-accent-green/40 rounded-full flex items-center justify-center"
            title="Partitura salva na sua biblioteca"
          >
            <FiBookmark className="w-3 h-3 text-accent-green" />
          </div>
        )}

        {/* Indicador de seleção atual */}
        {isSelected && (
          <div className="w-6 h-6 bg-brand-primary/20 border border-brand-primary/40 rounded-full flex items-center justify-center">
            <FiCheck className="w-3 h-3 text-brand-primary" />
          </div>
        )}

        {/* Indicador de alta qualidade (rating alto) */}
        {ratingData && ratingData.stars >= 4 && (
          <div
            className="w-6 h-6 bg-accent-yellow/20 border border-accent-yellow/40 rounded-full flex items-center justify-center"
            title={`${ratingData.stars}/5 estrelas (${ratingData.count} avaliações)`}
          >
            <FiStar className="w-3 h-3 text-accent-yellow" />
          </div>
        )}
      </div>

      {/* Conteúdo principal */}
      <div className="flex items-start space-x-4">
        {/* Ícone do tipo de arquivo */}
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300
            ${
              isSelected
                ? 'bg-gradient-to-br from-brand-primary to-brand-secondary text-theme-primary shadow-theme-glow'
                : 'bg-theme-primary border border-theme-secondary text-theme-tertiary group-hover:text-theme-primary'
            }
          `}
        >
          <FiFileText className="w-6 h-6" />
        </div>

        {/* Informações da partitura */}
        <div className="flex-1 min-w-0">
          {/* Título */}
          <h3
            className={`
              font-semibold text-lg leading-tight mb-2 line-clamp-2 transition-colors duration-300
              ${
                isSelected
                  ? 'text-brand-primary'
                  : 'text-theme-primary group-hover:text-brand-primary'
              }
            `}
          >
            {score.title}
          </h3>

          {/* Metadados principais */}
          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm">
            {/* Tamanho do arquivo */}
            {score.fileSize && (
              <span className="flex items-center space-x-1 text-theme-tertiary">
                <FiDownload className="w-3 h-3" />
                <span>{formatFileSize(score.fileSize)}</span>
              </span>
            )}

            {/* Número de páginas */}
            {score.pageCount && (
              <span className="flex items-center space-x-1 text-theme-tertiary">
                <FiFileText className="w-3 h-3" />
                <span>{formatPageCount(score.pageCount)}</span>
              </span>
            )}

            {/* Formato do arquivo */}
            <span className="px-2 py-1 bg-theme-primary border border-theme-secondary rounded text-theme-secondary text-xs font-medium">
              {score.fileFormat || 'PDF'}
            </span>

            {/* Tipo de partitura */}
            {score.type && (
              <span
                className={`
                  px-2 py-1 rounded text-xs font-medium capitalize
                  ${getTypeStyle(score.type)}
                `}
              >
                {getTypeLabel(score.type)}
              </span>
            )}
          </div>

          {/* Rating */}
          {ratingData && (
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-3 h-3 ${
                      i < ratingData.stars
                        ? 'text-accent-yellow fill-current'
                        : 'text-theme-tertiary'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-theme-tertiary">
                ({ratingData.count}{' '}
                {ratingData.count === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          )}

          {/* Informações detalhadas */}
          <div className="space-y-1 text-xs text-theme-tertiary">
            {/* Editor */}
            {score.editor && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Editor:</span>
                <span>{score.editor}</span>
              </div>
            )}

            {/* Publisher */}
            {score.publisher && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">Editora:</span>
                <span>{score.publisher}</span>
              </div>
            )}

            {/* Upload info */}
            {score.uploader && (
              <div className="flex items-center space-x-2">
                <FiUser className="w-3 h-3" />
                <span>Por {score.uploader}</span>
                {score.uploadDate && (
                  <>
                    <FiClock className="w-3 h-3" />
                    <span>{score.uploadDate}</span>
                  </>
                )}
              </div>
            )}

            {/* Downloads count */}
            {score.downloadCount && score.downloadCount > 0 && (
              <div className="flex items-center space-x-2">
                <FiDownload className="w-3 h-3" />
                <span>{score.downloadCount} downloads</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions overlay (aparece no hover) */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 rounded-xl
          flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300
          ${isSelected ? 'opacity-100' : ''}
        `}
      >
        <div className="text-center">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300
              ${
                isSelected
                  ? 'bg-brand-primary text-theme-primary shadow-lg'
                  : 'bg-theme-primary border-2 border-brand-primary text-brand-primary group-hover:bg-brand-primary group-hover:text-theme-primary'
              }
            `}
          >
            {isSelected ? (
              <FiCheck className="w-8 h-8" />
            ) : (
              <FiHeart className="w-8 h-8" />
            )}
          </div>
          <p className="text-sm font-medium text-theme-primary">
            {isSelected ? 'Selecionada' : 'Selecionar para estudo'}
          </p>
          {isSaved && !isSelected && (
            <p className="text-xs text-accent-green mt-1">
              ★ Salva na biblioteca
            </p>
          )}
        </div>
      </div>

      {/* Bottom gradient border */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-1 rounded-b-xl transition-all duration-300
          ${
            isSelected
              ? 'bg-gradient-to-r from-brand-primary to-brand-secondary'
              : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-brand-primary/50 group-hover:to-brand-secondary/50'
          }
        `}
      />
    </div>
  );
};

// Funções auxiliares
function getTypeStyle(type: string): string {
  const styles = {
    scores:
      'bg-brand-primary/20 text-brand-primary border border-brand-primary/30',
    parts: 'bg-accent-blue/20 text-accent-blue border border-accent-blue/30',
    arrangements:
      'bg-accent-green/20 text-accent-green border border-accent-green/30',
    librettos:
      'bg-accent-purple/20 text-accent-purple border border-accent-purple/30',
    others: 'bg-accent-red/20 text-accent-red border border-accent-red/30',
    sources:
      'bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30',
  };
  return styles[type as keyof typeof styles] || styles.others;
}

function getTypeLabel(type: string): string {
  const labels = {
    scores: 'Partitura',
    parts: 'Parte',
    arrangements: 'Arranjo',
    librettos: 'Libreto',
    others: 'Outro',
    sources: 'Fonte',
  };
  return labels[type as keyof typeof labels] || 'Outro';
}

export default ScoreCard;
