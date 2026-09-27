// app/components/uploads/UploadWorkCard.tsx - TRADUZIDO
'use client';

import { useState } from 'react';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiMusicNotes,
  PiNotePencil,
  PiShield,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import type { UserUpload } from '@/app/requests/my-uploads';
import ConfirmDeleteUploadModal from '../../ConfirmDeleteUploadModal';
import Link from 'next/link';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

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
      <Card
        densidade="compacta"
        className="group relative transition-all duration-300"
      >
        <Link
          href={`/works/${item.id}`}
          className="flex items-center justify-between w-full"
        >
          {/* Left section - Work info */}
          <Inline gap={4} className="flex-1 min-w-0">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <PiMusicNotes className="w-6 h-6 text-theme-primary" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-theme-primary classical-title transition-colors duration-300 truncate">
                {item.title}
              </h3>

              <Inline gap={4} className="mt-1 flex-wrap">
                {/* Composer */}
                {item.composerName && (
                  <span className="inline-flex items-center text-sm font-medium">
                    <PiUser className="w-3 h-3 mr-1" />
                    {item.composerName}
                  </span>
                )}

                {/* Instrument */}
                {item.instrumentName && (
                  <Text
                    papel="legenda"
                    tom="fraco"
                    className="inline-flex items-center"
                  >
                    <PiMusicNotes className="w-3 h-3 mr-1" />
                    {item.instrumentName}
                  </Text>
                )}

                {/* Epoch */}
                {item.epochName && (
                  <Text
                    papel="legenda"
                    tom="ouro"
                    className="inline-flex items-center font-medium"
                  >
                    <PiMusicNotes className="w-3 h-3 mr-1" />
                    {item.epochName}
                  </Text>
                )}

                {/* Status badges */}
                {item.isIMSLP && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full">
                    IMSLP
                  </span>
                )}

                {item.verificationStatus === 'verified' && (
                  <Inline
                    as="span"
                    gap={1}
                    className="text-xs font-medium px-2 py-1 rounded-full"
                  >
                    <PiShield className="w-3 h-3" />
                    <span>{t('card_verified_badge')}</span>
                  </Inline>
                )}
              </Inline>
            </div>
          </Inline>

          {/* Right section - Actions */}
          <Inline gap={2} className="flex-shrink-0">
            {item.imslpId && (
              <div
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 border rounded-md text-xs font-medium hover:scale-105 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                IMSLP
              </div>
            )}

            <Inline gap={1} className="-300">
              <button
                onClick={handleEditClick}
                className="w-8 h-8 rounded-lg bg-theme-secondary text-theme-tertiary transition-colors flex items-center justify-center"
              >
                <PiNotePencil className="w-4 h-4" />
                <NomeAcao acao="editar" />
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`w-8 h-8 rounded-lg bg-theme-secondary text-theme-tertiary transition-colors flex items-center justify-center ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PiTrash className="w-4 h-4" />
                <NomeAcao acao="excluir" />
              </button>
            </Inline>
          </Inline>
        </Link>
      </Card>
    );
  }

  return (
    <div className="group cursor-pointer select-none h-full">
      <Link href={`/works/${item.id}`} className="block h-full">
        <div className="classical-card h-full flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2">
          {/* Header Section */}
          <div className="relative p-2 md:p-6 pb-4 border-b border-theme-secondary">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5 music-note-background"></div>

            {/* Floating action buttons */}
            <Stack
              gap={2}
              className="absolute top-0 sm:top-4 right-4 z-50 opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
            >
              <button
                onClick={handleEditClick}
                className="w-8 h-8 rounded-lg bg-theme-elevated text-theme-tertiary transition-colors flex items-center justify-center shadow-theme-medium"
              >
                <PiNotePencil className="w-4 h-4" />
                <NomeAcao acao="editar" />
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`w-8 h-8 rounded-lg bg-theme-elevated text-theme-tertiary transition-colors flex items-center justify-center shadow-theme-medium ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PiTrash className="w-4 h-4" />
                <NomeAcao acao="excluir" />
              </button>
            </Stack>

            <div className="relative z-10">
              {/* Title */}
              <h3 className="text-lg font-bold text-theme-primary classical-title mb-3 line-clamp-2 transition-colors duration-300 leading-tight">
                {item.title}
              </h3>

              {/* Composer */}
              {item.composerName && (
                <div className="flex items-center mb-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                    <PiUser className="w-3 h-3 text-theme-primary" />
                  </div>
                  <span className="text-sm transition-colors font-medium">
                    {item.composerName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-2 md:p-6 flex-1 w-full flex flex-col">
            {/* Work Details */}
            <div className="space-y-3 mb-4 flex-1">
              {/* Instrument */}
              {item.instrumentName && (
                <div className="flex items-center">
                  <PiMusicNotes className="w-4 h-4 text-ouro-texto mr-2 flex-shrink-0" />
                  <Text papel="rotulo" tom="suave">
                    {item.instrumentName}
                  </Text>
                </div>
              )}

              {/* Epoch */}
              {item.epochName && (
                <div className="flex items-center">
                  <PiMusicNotes className="w-4 h-4 text-ouro-texto mr-2 flex-shrink-0" />
                  <Text papel="rotulo" tom="suave">
                    {item.epochName}
                  </Text>
                </div>
              )}

              {/* Genres */}
              {item.workGenres && item.workGenres.length > 0 && (
                <div className="flex items-center">
                  <PiBookOpen className="w-4 h-4 text-ouro-texto mr-2 flex-shrink-0" />
                  <Text papel="rotulo" tom="suave" className="capitalize">
                    {item.workGenres.slice(0, 2).join(', ')}
                    {item.workGenres.length > 2 &&
                      ` +${item.workGenres.length - 2} mais`}
                  </Text>
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.epochName && (
                <Text
                  papel="legenda"
                  tom="ouro"
                  className="inline-flex items-center px-2 py-1 border rounded-full font-medium"
                >
                  <PiClock className="w-2.5 h-2.5 mr-1" />
                  {item.epochName}
                </Text>
              )}

              {item.isIMSLP && (
                <span className="inline-flex items-center px-2 py-1 border rounded-full text-xs font-medium">
                  IMSLP
                </span>
              )}

              {item.verificationStatus === 'verified' && (
                <span className="inline-flex items-center px-2 py-1 border rounded-full text-xs font-medium">
                  <PiShield className="w-2.5 h-2.5 mr-1" />
                  {t('card_verified_badge')}
                </span>
              )}
            </div>

            {/* Action Section */}
            <Stack gap={3}>
              {/* Secondary Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-theme-secondary">
                <Inline gap={2} className="text-theme-tertiary text-xs">
                  <PiCalendarBlank className="w-3 h-3" />
                  <span>
                    {t('card_added_on')}{' '}
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </Inline>

                {item.imslpId && (
                  <Inline
                    gap={1}
                    className="text-sm font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>IMSLP</span>
                  </Inline>
                )}
              </div>
            </Stack>

            {/* Hover glow effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
          </div>

          {/* Floating mini indicator */}
          <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100"></div>
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
