// app/components/uploads/UploadWorkCard.tsx - TRADUZIDO
'use client';

import { useState } from 'react';
import {
  FiClock,
  FiMusic,
  FiUser,
  FiCalendar,
  FiBookOpen,
  FiEdit,
  FiTrash2,
  FiShield,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { UserUpload } from '@/app/requests/upload';
import ConfirmDeleteUploadModal from '../../ConfirmDeleteUploadModal';
import Link from 'next/link';
import { useTranslation } from '@/app/context/TranslationContext';

interface UploadWorkCardProps {
  item: UserUpload;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
  viewMode: 'cards' | 'list';
  isDeleting?: boolean;
}

const UploadWorkCard = ({
  item,
  onEdit,
  onDelete,
  viewMode,
  isDeleting = false,
}: UploadWorkCardProps) => {
  const { t } = useTranslation({ sections: ['pages/uploads'] });
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  if (viewMode === 'list') {
    return (
      <div className="classical-card group relative p-4 hover:shadow-theme-glow transition-all duration-300">
        <Link
          href={`/works/${item.id}`}
          className="flex items-center justify-between w-full"
        >
          {/* Left section - Work info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Icon */}
            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center flex-shrink-0">
              <FiMusic className="w-6 h-6 text-theme-primary" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 truncate">
                {item.title}
              </h3>

              <div className="flex items-center space-x-4 mt-1 flex-wrap">
                {/* Composer */}
                {item.composerName && (
                  <span className="inline-flex items-center text-sm text-accent-blue font-medium">
                    <FiUser className="w-3 h-3 mr-1" />
                    {item.composerName}
                  </span>
                )}

                {/* Instrument */}
                {item.instrumentName && (
                  <span className="inline-flex items-center text-xs text-theme-tertiary">
                    <FiMusic className="w-3 h-3 mr-1" />
                    {item.instrumentName}
                  </span>
                )}

                {/* Epoch */}
                {item.epochName && (
                  <span className="inline-flex items-center text-xs text-brand-primary font-medium">
                    <GiMusicalNotes className="w-3 h-3 mr-1" />
                    {item.epochName}
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

          {/* Right section - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {item.imslpId && (
              <div
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-md text-xs font-medium hover:bg-accent-green/20 hover:scale-105 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                IMSLP
              </div>
            )}

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleEditClick}
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
        </Link>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer select-none h-full">
      <Link href={`/works/${item.id}`} className="block h-full">
        <div className="classical-card h-full flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2 hover:shadow-theme-glow">
          {/* Header Section */}
          <div className="relative p-6 pb-4 border-b border-theme-secondary">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 music-note-background"></div>

            {/* Floating action buttons */}
            <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button
                onClick={handleEditClick}
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
              {/* Title */}
              <h3 className="text-lg font-bold text-theme-primary classical-title mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors duration-300 leading-tight">
                {item.title}
              </h3>

              {/* Composer */}
              {item.composerName && (
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-2">
                    <FiUser className="w-3 h-3 text-theme-primary" />
                  </div>
                  <span className="text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium">
                    {item.composerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 flex-1 w-full flex flex-col">
            {/* Work Details */}
            <div className="space-y-3 mb-4 flex-1">
              {/* Instrument */}
              {item.instrumentName && (
                <div className="flex items-center">
                  <FiMusic className="w-4 h-4 text-brand-primary mr-2 flex-shrink-0" />
                  <span className="text-sm text-theme-secondary">
                    {item.instrumentName}
                  </span>
                </div>
              )}

              {/* Epoch */}
              {item.epochName && (
                <div className="flex items-center">
                  <GiMusicalNotes className="w-4 h-4 text-brand-secondary mr-2 flex-shrink-0" />
                  <span className="text-sm text-theme-secondary">
                    {item.epochName}
                  </span>
                </div>
              )}

              {/* Genres */}
              {item.workGenres && item.workGenres.length > 0 && (
                <div className="flex items-center">
                  <FiBookOpen className="w-4 h-4 text-brand-secondary mr-2 flex-shrink-0" />
                  <span className="text-sm text-theme-secondary capitalize">
                    {item.workGenres.slice(0, 2).join(', ')}
                    {item.workGenres.length > 2 &&
                      ` +${item.workGenres.length - 2} mais`}
                  </span>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.epochName && (
                <span className="inline-flex items-center px-2 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-xs font-medium">
                  <FiClock className="w-2.5 h-2.5 mr-1" />
                  {item.epochName}
                </span>
              )}

              {item.isIMSLP && (
                <span className="inline-flex items-center px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-xs font-medium">
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

                {item.imslpId && (
                  <div
                    className="text-accent-green hover:text-accent-blue text-sm font-medium transition-colors flex items-center space-x-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>IMSLP</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hover glow effect */}
            <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
          </div>

          {/* Floating mini indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-gradient rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100 shadow-brand-glow"></div>
        </div>
      </Link>

      {/* Modal de confirmação de delete */}
      <ConfirmDeleteUploadModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        itemTitle={item.title}
        itemType="work"
        itemId={item.id}
      />
    </div>
  );
};

export default UploadWorkCard;
