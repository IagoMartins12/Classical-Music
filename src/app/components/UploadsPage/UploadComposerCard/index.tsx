// app/components/uploads/UploadComposerCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUser,
  FiCalendar,
  FiExternalLink,
  FiEdit,
  FiTrash2,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { UserUpload } from '@/app/requests/upload';
import ConfirmDeleteUploadModal from '../../ConfirmDeleteUploadModal';

interface UploadComposerCardProps {
  item: UserUpload;
  onEdit: () => void;
  onDelete: () => void;
  isAdmin: boolean;
  viewMode: 'cards' | 'list';
  isDeleting?: boolean;
}

const UploadComposerCard = ({
  item,
  onEdit,
  onDelete,
  viewMode,
  isDeleting = false,
}: UploadComposerCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  const formatDates = () => {
    // Assuming dates are in item data - adjust based on your schema
    if (!item.createdAt) return null;
    return new Date(item.createdAt).getFullYear();
  };

  const hasExternalLinks = item.imslpId;

  // Assumindo que a imagem está em item.portraitUrl ou similar
  const portraitUrl = (item as any).portraitUrl;

  if (viewMode === 'list') {
    return (
      <div className="classical-card group relative p-4 hover:shadow-theme-glow transition-all duration-300">
        <div className="flex items-center justify-between w-full">
          {/* Left section - Portrait and basic info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Portrait */}
            <div className="relative w-12 h-12 flex-shrink-0">
              {!imageLoaded && !imageError && portraitUrl && (
                <div className="absolute inset-0 loading-skeleton rounded-full"></div>
              )}

              {portraitUrl && !imageError ? (
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-300">
                  <Image
                    src={portraitUrl}
                    alt={item.title}
                    fill
                    className={`object-cover transition-opacity duration-300 ${
                      imageLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => setImageError(true)}
                    sizes="48px"
                  />
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                      <FiUser className="w-5 h-5 text-theme-inverse" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-300">
                  <FiUser className="w-5 h-5 text-theme-inverse" />
                </div>
              )}
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/composer/${item.id}`}
                className="block group/link"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-base font-bold text-theme-primary classical-title group-hover/link:text-brand-primary transition-colors duration-300 truncate hover:underline">
                  {item.title}
                </h3>
              </Link>

              <div className="flex items-center space-x-4 mt-1">
                {/* Period */}
                {item.epochName && (
                  <span className="inline-flex items-center text-xs text-brand-primary font-medium">
                    <GiMusicalNotes className="w-3 h-3 mr-1" />
                    {item.epochName}
                  </span>
                )}

                {/* Date */}
                {formatDates() && (
                  <span className="inline-flex items-center text-xs text-theme-tertiary">
                    <FiCalendar className="w-3 h-3 mr-1" />
                    {formatDates()}
                  </span>
                )}

                {/* Status badges */}
                {item.isIMSLP && (
                  <span className="text-xs font-medium text-accent-blue px-2 py-1 bg-accent-blue/10 rounded-full">
                    IMSLP
                  </span>
                )}

                {item.verificationStatus === 'verified' && (
                  <span className="text-xs font-medium text-accent-green px-2 py-1 bg-accent-green/10 rounded-full">
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {hasExternalLinks && (
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
      <div className="classical-card h-full overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2 hover:shadow-theme-glow">
        {/* Portrait Section */}
        <div className="relative p-6 pb-4">
          <Link
            href={`/composer/${item.id}`}
            className="block"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4 group/portrait">
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                {/* Loading skeleton */}
                {!imageLoaded && !imageError && portraitUrl && (
                  <div className="absolute inset-0 loading-skeleton rounded-full"></div>
                )}

                {portraitUrl && !imageError ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20 group-hover/portrait:border-brand-primary/50 transition-all duration-500 group-hover/portrait:scale-110">
                    <Image
                      src={portraitUrl}
                      alt={item.title}
                      fill
                      className={`object-cover transition-all duration-500 group-hover/portrait:scale-110 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageError(true)}
                      sizes="(max-width: 768px) 96px, 112px"
                    />
                    {!imageLoaded && (
                      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                        <FiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20 group-hover/portrait:border-brand-primary/50 transition-all duration-500 group-hover/portrait:scale-110">
                    <FiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Floating action buttons */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
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
        </div>

        {/* Content Section */}
        <div className="px-6 pb-6 relative">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5 music-note-background"></div>

          <div className="relative z-10 space-y-3">
            {/* Name */}
            <div className="text-center">
              <Link
                href={`/composer/${item.id}`}
                className="block group/link"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-theme-primary classical-title group-hover/link:text-brand-primary transition-colors duration-300 line-clamp-2 hover:underline">
                  {item.title}
                </h3>
              </Link>
            </div>

            {/* Status badges */}
            <div className="flex justify-center space-x-2">
              {item.isIMSLP && (
                <span className="text-xs font-medium text-accent-blue px-2 py-1 bg-accent-blue/10 rounded-full flex items-center space-x-1">
                  <FiExternalLink className="w-3 h-3" />
                  <span>IMSLP</span>
                </span>
              )}

              {item.verificationStatus === 'verified' && (
                <span className="text-xs font-medium text-accent-green px-2 py-1 bg-accent-green/10 rounded-full">
                  Verificado
                </span>
              )}

              {item.dataQuality && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.dataQuality === 'high'
                      ? 'text-accent-green bg-accent-green/10'
                      : item.dataQuality === 'medium'
                      ? 'text-accent-amber bg-accent-amber/10'
                      : 'text-accent-red bg-accent-red/10'
                  }`}
                >
                  {item.dataQuality === 'high'
                    ? 'Alta qualidade'
                    : item.dataQuality === 'medium'
                    ? 'Qualidade média'
                    : 'Baixa qualidade'}
                </span>
              )}
            </div>

            {/* Period info */}
            {item.epochName && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary rounded-full text-xs font-medium hover:bg-brand-primary/20 transition-colors duration-300">
                  <GiMusicalNotes className="w-3 h-3 mr-1" />
                  {item.epochName}
                </span>
              </div>
            )}

            {/* External links */}
            {hasExternalLinks && (
              <div className="flex justify-center space-x-2 pt-2">
                <a
                  href={`https://imslp.org/wiki/${item.imslpId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-full text-xs font-medium hover:bg-accent-green/20 hover:scale-105 transition-all duration-300 group/link"
                  onClick={(e) => e.stopPropagation()}
                >
                  IMSLP
                  <FiExternalLink className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>
            )}

            {/* Date info */}
            <div className="flex items-center justify-center pt-4 border-t border-theme-secondary mt-4">
              <div className="flex items-center space-x-2 text-theme-tertiary text-xs">
                <FiCalendar className="w-3 h-3" />
                <span>
                  Adicionado em{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-b-2xl"></div>
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
        itemType="composer"
      />
    </div>
  );
};

export default UploadComposerCard;
