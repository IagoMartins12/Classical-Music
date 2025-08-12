// components/ScorePreview.tsx - OTIMIZADO COM BADGES
import React, { useCallback, useState } from 'react';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import Image from 'next/image';
import { LuDownload, LuFileText, LuStar } from 'react-icons/lu';
import { FiBookOpen, FiTarget, FiExternalLink } from 'react-icons/fi';

interface ScorePreviewProps {
  score: IMSLPScore & {
    source?: 'IMSLP' | 'UPLOAD' | 'CUSTOM';
  };
}

// ✅ COMPONENTE BADGE MEMOIZADO
const SourceBadge = React.memo(
  ({ source }: { source: 'IMSLP' | 'UPLOAD' | 'CUSTOM' }) => {
    if (source === 'IMSLP') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
          <FiBookOpen className="w-3 h-3 mr-1.5" />
          IMSLP
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
        <FiTarget className="w-3 h-3 mr-1.5" />
        Open Atlas
      </div>
    );
  }
);
SourceBadge.displayName = 'SourceBadge';

// ✅ COMPONENTE PRINCIPAL OTIMIZADO
const ScorePreview = React.memo(({ score }: ScorePreviewProps) => {
  const [imageError, setImageError] = useState(false);

  const handleDownload = useCallback(() => {
    if (score.downloadUrl) {
      window.open(score.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [score.downloadUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const formatFileSize = useCallback((size?: string) => {
    if (!size) return null;
    return size;
  }, []);

  const formatPageCount = useCallback((pages?: string) => {
    if (!pages) return null;
    return pages;
  }, []);

  const formatRating = useCallback((rating?: number) => {
    if (!rating) return null;
    return rating.toFixed(1);
  }, []);

  const formatDownloadCount = useCallback((count?: number) => {
    if (!count) return null;
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }, []);

  return (
    <div
      className="classical-card-simple border rounded-lg p-6 transition-all duration-300 hover:shadow-lg"
      id="preview"
    >
      {/* Header com título e badge */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-semibold text-theme-primary line-clamp-2 mb-2">
            {score.title}
          </h3>
          {score.source && <SourceBadge source={score.source} />}
        </div>

        <button
          onClick={handleDownload}
          disabled={!score.downloadUrl}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
          title={
            score.downloadUrl ? 'Baixar partitura' : 'Download não disponível'
          }
        >
          <LuDownload className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>
      </div>

      {/* Preview da Partitura com tratamento de erro otimizado */}
      <div className="mb-6">
        {score.thumbnailUrl && !imageError ? (
          <div className="relative overflow-hidden rounded-lg border shadow-sm bg-gray-50 dark:bg-gray-800">
            <Image
              src={score.thumbnailUrl}
              alt={`Preview de ${score.title}`}
              className="w-full max-w-sm mx-auto rounded-lg transition-transform duration-300 hover:scale-105"
              width={300}
              height={400}
              style={{ objectFit: 'contain' }}
              onError={handleImageError}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              priority={false}
            />
          </div>
        ) : (
          <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-600">
            <LuFileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-theme-secondary font-medium">
              Preview não disponível
            </p>
            {imageError && (
              <p className="text-xs text-gray-500 mt-1">
                Erro ao carregar imagem
              </p>
            )}
          </div>
        )}
      </div>

      {/* Detalhes organizados em grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {score.fileSize && (
          <div className="flex flex-col">
            <span className="text-theme-tertiary font-medium mb-1">
              Tamanho
            </span>
            <span className="text-theme-primary font-semibold">
              {formatFileSize(score.fileSize)}
            </span>
          </div>
        )}

        {score.pageCount && (
          <div className="flex flex-col">
            <span className="text-theme-tertiary font-medium mb-1">
              Páginas
            </span>
            <span className="text-theme-primary font-semibold">
              {formatPageCount(score.pageCount)}
            </span>
          </div>
        )}

        {score.rating && (
          <div className="flex flex-col">
            <span className="text-theme-tertiary font-medium mb-1">
              Avaliação
            </span>
            <div className="flex items-center gap-1">
              <LuStar className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-theme-primary font-semibold">
                {formatRating(score.rating)}
              </span>
              {score.ratingsCount && (
                <span className="text-theme-tertiary text-xs">
                  ({score.ratingsCount})
                </span>
              )}
            </div>
          </div>
        )}

        {score.downloadCount && (
          <div className="flex flex-col">
            <span className="text-theme-tertiary font-medium mb-1">
              Downloads
            </span>
            <span className="text-theme-primary font-semibold">
              {formatDownloadCount(score.downloadCount)}
            </span>
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      {(score.editor || score.publisher) && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 gap-2 text-sm">
            {score.editor && (
              <div className="flex justify-between">
                <span className="text-theme-tertiary font-medium">Editor:</span>
                <span className="text-theme-primary text-right">
                  {score.editor}
                </span>
              </div>
            )}

            {score.publisher && (
              <div className="flex justify-between">
                <span className="text-theme-tertiary font-medium">
                  Editora:
                </span>
                <span className="text-theme-primary text-right">
                  {score.publisher}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Copyright e notas */}
      {(score.copyright || score.notes) && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
          {score.copyright && (
            <div>
              <span className="text-theme-tertiary font-medium block mb-1 text-xs">
                Copyright:
              </span>
              <span className="text-theme-secondary text-xs leading-relaxed block">
                {score.copyright}
              </span>
            </div>
          )}

          {score.notes && (
            <div>
              <span className="text-theme-tertiary font-medium block mb-1 text-xs">
                Notas:
              </span>
              <span className="text-theme-secondary text-xs leading-relaxed block">
                {score.notes}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Botão de ação adicional se disponível */}
      {score.downloadUrl && (
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
          >
            <FiExternalLink className="w-4 h-4" />
            <span>Baixar Partitura</span>
          </button>
        </div>
      )}
    </div>
  );
});

ScorePreview.displayName = 'ScorePreview';

export default ScorePreview;
