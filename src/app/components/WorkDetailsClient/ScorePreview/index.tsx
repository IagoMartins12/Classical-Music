// components/ScorePreview.tsx - OTIMIZADO COM BADGES, AUTO SCROLL E ZOOM MELHORADO E TRADUÇÕES
import React, { useCallback, useState } from 'react';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';
import Image from 'next/image';
import { LuDownload, LuFileText, LuStar, LuZoomIn, LuX } from 'react-icons/lu';
import { FiBookOpen, FiTarget, FiExternalLink } from 'react-icons/fi';
import { useTranslation } from '@/app/hooks/useTranslation';

interface ScorePreviewProps {
  score: IMSLPScore & {
    source?: 'IMSLP' | 'UPLOAD' | 'CUSTOM';
  };
}

// ✅ COMPONENTE BADGE MEMOIZADO
const SourceBadge = React.memo(
  ({ source, t }: { source: 'IMSLP' | 'UPLOAD' | 'CUSTOM'; t: any }) => {
    if (source === 'IMSLP') {
      return (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-700">
          <FiBookOpen className="w-3 h-3 mr-1.5" />
          {t('score_preview_imslp')}
        </div>
      );
    }

    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-700">
        <FiTarget className="w-3 h-3 mr-1.5" />
        {t('score_preview_open_atlas')}
      </div>
    );
  }
);
SourceBadge.displayName = 'SourceBadge';

// ✅ COMPONENTE MODAL DE ZOOM
const ImageZoomModal = React.memo(
  ({
    isOpen,
    onClose,
    imageUrl,
    title,
    t,
  }: {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    title: string;
    t: any;
  }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="relative max-w-[90vw] max-h-[90vh] p-4">
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <LuX className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="relative rounded-lg overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
            <Image
              src={imageUrl}
              alt={`${t('score_preview_ampliado')} ${title}`}
              className="w-auto h-auto max-w-full max-h-[80vh] object-contain"
              width={800}
              height={1000}
              quality={95}
              priority
            />
          </div>
        </div>
      </div>
    );
  }
);
ImageZoomModal.displayName = 'ImageZoomModal';

// ✅ COMPONENTE PRINCIPAL OTIMIZADO
const ScorePreview = React.memo(({ score }: ScorePreviewProps) => {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const [imageError, setImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const handleDownload = useCallback(() => {
    if (score.downloadUrl) {
      window.open(score.downloadUrl, '_blank', 'noopener,noreferrer');
    }
  }, [score.downloadUrl]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setIsImageLoading(false);
  }, []);

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const openZoomModal = useCallback(() => {
    setIsZoomModalOpen(true);
  }, []);

  const closeZoomModal = useCallback(() => {
    setIsZoomModalOpen(false);
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
    <>
      <div className="classical-card-simple border rounded-lg p-6 transition-all duration-300 hover:shadow-lg">
        {/* Header com título e badge */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 mr-4">
            <h3 className="text-lg font-semibold text-theme-primary line-clamp-2 mb-2">
              {score.title}
            </h3>
            {score.source && <SourceBadge source={score.source} t={t} />}
          </div>

          <button
            onClick={handleDownload}
            disabled={!score.downloadUrl}
            className="flex items-center gap-2 btn-classical-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 flex-shrink-0"
            title={
              score.downloadUrl
                ? t('score_preview_baixar')
                : t('score_preview_download_indisponivel')
            }
          >
            <LuDownload className="w-4 h-4" />
            <span className="hidden sm:inline">{t('score_card_download')}</span>
          </button>
        </div>

        {/* Preview da Partitura com zoom melhorado */}
        <div className="mb-6">
          {score.thumbnailUrl && !imageError ? (
            <div className="relative group overflow-hidden rounded-lg shadow-sm bg-gray-50 dark:bg-gray-800">
              {/* Loading placeholder */}
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 animate-pulse">
                  <LuFileText className="w-12 h-12 text-gray-400" />
                </div>
              )}

              {/* Imagem principal com melhor qualidade */}
              <div className="relative cursor-zoom-in" onClick={openZoomModal}>
                <Image
                  src={score.thumbnailUrl}
                  alt={`${t('score_preview_preview_de')} ${score.title}`}
                  className="w-full max-w-sm mx-auto rounded-lg transition-all duration-300 group-hover:scale-[1.02] object-contain"
                  width={400}
                  height={600}
                  quality={90}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  priority={true}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Overlay de zoom no hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                  <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                    <LuZoomIn className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                </div>
              </div>

              {/* Indicador de clique para zoom */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <LuZoomIn className="w-3 h-3" />
                  {t('score_preview_clique_ampliar')}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-600">
              <LuFileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
              <p className="text-theme-secondary font-medium">
                {t('score_preview_preview_indisponivel')}
              </p>
              {imageError && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('score_preview_erro_carregar')}
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
                {t('score_preview_tamanho')}
              </span>
              <span className="text-theme-primary font-semibold">
                {formatFileSize(score.fileSize)}
              </span>
            </div>
          )}

          {score.pageCount && (
            <div className="flex flex-col">
              <span className="text-theme-tertiary font-medium mb-1">
                {t('score_preview_paginas')}
              </span>
              <span className="text-theme-primary font-semibold">
                {formatPageCount(score.pageCount)}
              </span>
            </div>
          )}

          {score.rating && (
            <div className="flex flex-col">
              <span className="text-theme-tertiary font-medium mb-1">
                {t('score_preview_avaliacao')}
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
                {t('score_preview_downloads')}
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
                  <span className="text-theme-tertiary font-medium">
                    {t('score_preview_editor')}
                  </span>
                  <span className="text-theme-primary text-right">
                    {score.editor}
                  </span>
                </div>
              )}

              {score.publisher && (
                <div className="flex justify-between">
                  <span className="text-theme-tertiary font-medium">
                    {t('score_preview_editora')}
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
                  {t('score_preview_copyright')}
                </span>
                <span className="text-theme-secondary text-xs leading-relaxed block">
                  {score.copyright}
                </span>
              </div>
            )}

            {score.notes && (
              <div>
                <span className="text-theme-tertiary font-medium block mb-1 text-xs">
                  {t('score_preview_notas')}
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
              className="flex gap-2 px-4 py-2 btn-classical-primary justify-center items-center !w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>{t('score_preview_baixar_partitura')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Modal de Zoom */}
      {score.thumbnailUrl && !imageError && (
        <ImageZoomModal
          isOpen={isZoomModalOpen}
          onClose={closeZoomModal}
          imageUrl={score.thumbnailUrl}
          title={score.title}
          t={t}
        />
      )}
    </>
  );
});

ScorePreview.displayName = 'ScorePreview';

export default ScorePreview;
