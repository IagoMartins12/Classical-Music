// app/components/uploads/UploadScoreCard.tsx - TRADUZIDO
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiFileText,
  FiMusic,
  FiUser,
  FiCalendar,
  FiDownload,
  FiEdit,
  FiTrash2,
  FiExternalLink,
  FiShield,
  FiStar,
} from 'react-icons/fi';
import { UserUpload } from '@/app/requests/upload';
import ConfirmDeleteUploadModal from '../../ConfirmDeleteUploadModal';
import { useTranslation } from '@/app/context/TranslationContext';

interface UploadScoreCardProps {
  item: UserUpload;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
  viewMode: 'cards' | 'list';
  isDeleting?: boolean;
}

const UploadScoreCard = ({
  item,
  onEdit,
  onDelete,
  viewMode,
  isDeleting = false,
}: UploadScoreCardProps) => {
  const { t } = useTranslation({ sections: ['pages/uploads'] });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  const getDataQualityLabel = (quality: string) => {
    switch (quality) {
      case 'high':
        return t('data_quality_label_high');
      case 'medium':
        return t('data_quality_label_medium');
      case 'low':
        return t('data_quality_label_low');
      default:
        return quality;
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="classical-card group relative p-4 hover:shadow-theme-glow transition-all duration-300">
        <div className="flex items-center justify-between w-full">
          {/* Left section - Score info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-amber rounded-xl flex items-center justify-center flex-shrink-0">
              <FiFileText className="w-6 h-6 text-theme-primary" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 line-clamp-2">
                {item.title}
              </h3>

              <div className="space-y-1 mt-1">
                {/* Work and Composer */}
                <div className="flex items-center space-x-4 flex-wrap">
                  {item.workId && item.workTitle && (
                    <Link
                      href={`/works/${item.workId}`}
                      className="inline-flex items-center text-sm text-accent-blue font-medium hover:text-brand-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiMusic className="w-3 h-3 mr-1" />
                      <span className="hover:underline">{item.workTitle}</span>
                    </Link>
                  )}

                  {!item.workId && (
                    <span className="inline-flex items-center text-sm text-theme-tertiary">
                      <FiMusic className="w-3 h-3 mr-1" />
                      {t('card_work_not_linked')}
                    </span>
                  )}

                  {item.composerId && item.composerName && (
                    <Link
                      href={`/composer/${item.composerId}`}
                      className="inline-flex items-center text-xs text-theme-tertiary hover:text-accent-blue transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiUser className="w-3 h-3 mr-1" />
                      <span className="hover:underline">
                        {item.composerName}
                      </span>
                    </Link>
                  )}

                  {!item.composerId && item.composerName && (
                    <span className="inline-flex items-center text-xs text-theme-tertiary">
                      <FiUser className="w-3 h-3 mr-1" />
                      {item.composerName}
                    </span>
                  )}
                </div>

                {/* File info */}
                <div className="flex items-center space-x-4 flex-wrap">
                  {item.fileSize && (
                    <span className="text-xs text-theme-tertiary">
                      {item.fileSize}
                      {item.pageCount && ` • ${item.pageCount} páginas`}
                    </span>
                  )}

                  {/* Status badges */}
                  {item.isIMSLP && (
                    <span className="text-xs font-medium text-accent-blue px-2 py-1 bg-accent-blue/10 rounded-full">
                      IMSLP
                    </span>
                  )}

                  {item.verificationStatus === 'verified' && (
                    <span className="text-xs font-medium text-accent-green px-2 py-1 bg-accent-green/10 rounded-full flex items-center space-x-1">
                      <FiShield className="w-3 h-3" />
                      <span>{t('card_verified_badge')}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {item.imslpId && (
              <a
                href={`https://imslp.org/wiki/${item.imslpId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-md text-xs font-medium hover:bg-accent-green/20 hover:scale-105 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                IMSLP
                <FiExternalLink className="w-2.5 h-2.5 ml-1" />
              </a>
            )}

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={onEdit}
                className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-accent-blue/10 text-theme-tertiary hover:text-accent-blue transition-colors flex items-center justify-center"
              >
                <FiEdit className="w-4 h-4" />
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`w-8 h-8 rounded-lg bg-theme-secondary hover:bg-accent-red/10 text-theme-tertiary hover:text-accent-red transition-colors flex items-center justify-center ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer select-none h-full">
      <div className="classical-card h-full flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2 hover:shadow-theme-glow">
        {/* Header Section */}
        <div className="relative p-6 pb-4 border-b border-theme-secondary">
          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-accent-blue/10 text-theme-tertiary hover:text-accent-blue transition-colors flex items-center justify-center shadow-theme-medium"
            >
              <FiEdit className="w-4 h-4" />
            </button>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`w-8 h-8 rounded-lg bg-theme-elevated hover:bg-accent-red/10 text-theme-tertiary hover:text-accent-red transition-colors flex items-center justify-center shadow-theme-medium ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-amber rounded-xl flex items-center justify-center">
                <FiFileText className="w-8 h-8 text-theme-primary" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-theme-primary classical-title mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors duration-300 leading-tight text-center">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 w-full flex flex-col">
          {/* Score Details */}
          <div className="space-y-3 mb-4 flex-1">
            {/* Work info */}
            <div className="text-center space-y-2">
              {item.workId && item.workTitle ? (
                <Link
                  href={`/works/${item.workId}`}
                  className="flex items-center justify-center group/link hover:scale-105 transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiMusic className="w-4 h-4 text-accent-blue mr-2" />
                  <span className="text-sm text-accent-blue font-medium hover:text-brand-primary transition-colors hover:underline">
                    {item.workTitle}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center justify-center">
                  <FiMusic className="w-4 h-4 text-theme-tertiary mr-2" />
                  <span className="text-sm text-theme-tertiary">
                    {t('card_work_not_linked')}
                  </span>
                </div>
              )}

              {item.composerId && item.composerName ? (
                <Link
                  href={`/composer/${item.composerId}`}
                  className="flex items-center justify-center group/link hover:scale-105 transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiUser className="w-4 h-4 text-theme-tertiary mr-2 group-hover/link:text-accent-blue transition-colors" />
                  <span className="text-sm text-theme-tertiary group-hover/link:text-accent-blue transition-colors hover:underline">
                    {item.composerName}
                  </span>
                </Link>
              ) : item.composerName ? (
                <div className="flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-theme-tertiary mr-2" />
                  <span className="text-sm text-theme-tertiary">
                    {item.composerName}
                  </span>
                </div>
              ) : null}
            </div>

            {/* File info */}
            {(item.fileSize || item.pageCount) && (
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <FiDownload className="w-4 h-4 text-brand-primary mr-2" />
                  <span className="text-sm text-theme-secondary">
                    {item.fileSize}
                    {item.pageCount && ` • ${item.pageCount} páginas`}
                  </span>
                </div>
              </div>
            )}

            {/* Quality info */}
            {item.dataQuality && (
              <div className="text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    item.dataQuality === 'high'
                      ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                      : item.dataQuality === 'medium'
                      ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/30'
                      : 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                  }`}
                >
                  <FiStar className="w-2.5 h-2.5 mr-1" />
                  {getDataQualityLabel(item.dataQuality)}
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {item.isIMSLP && (
              <span className="inline-flex items-center px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-xs font-medium">
                <FiExternalLink className="w-2.5 h-2.5 mr-1" />
                IMSLP
              </span>
            )}

            {item.verificationStatus === 'verified' && (
              <span className="inline-flex items-center px-2 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                <FiShield className="w-2.5 h-2.5 mr-1" />
                {t('card_verified_badge')}
              </span>
            )}
          </div>

          {/* Action Section */}
          <div className="space-y-3">
            {/* Secondary Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
              <div className="flex items-center space-x-2 text-theme-tertiary text-xs">
                <FiCalendar className="w-3 h-3" />
                <span>
                  {t('card_added_on')}{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* Download link */}
                {item.downloadUrl && (
                  <a
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-accent-blue text-sm font-medium transition-colors flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                    title={t('card_download_score')}
                  >
                    <FiDownload className="w-3 h-3" />
                    <span>{t('card_download')}</span>
                  </a>
                )}

                {/* IMSLP link */}
                {item.imslpId && (
                  <a
                    href={`https://imslp.org/wiki/${item.imslpId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-green hover:text-accent-blue text-sm font-medium transition-colors flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>IMSLP</span>
                    <FiExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gradient rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-brand-glow"></div>
      </div>

      {/* Modal de confirmação de delete */}
      <ConfirmDeleteUploadModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        itemTitle={item.title}
        itemType="score"
        itemId={item.id}
      />
    </div>
  );
};

export default UploadScoreCard;
