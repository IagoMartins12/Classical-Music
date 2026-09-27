// app/components/uploads/UploadScoreCard.tsx - TRADUZIDO
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiDownloadSimple,
  PiFileText,
  PiMusicNotes,
  PiNotePencil,
  PiShield,
  PiStar,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import type { UserUpload } from '@/app/requests/my-uploads';
import ConfirmDeleteUploadModal from '../../ConfirmDeleteUploadModal';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

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
      <Card
        densidade="compacta"
        className="group relative hover:shadow-[var(--sombra-2)] transition-all duration-300"
      >
        <div className="flex items-center justify-between w-full">
          {/* Left section - Score info */}
          <Inline gap={4} className="flex-1 min-w-0">
            {/* Icon */}
            <div className="w-12 h-12 bg-ok rounded-xl flex items-center justify-center flex-shrink-0">
              <PiFileText className="w-6 h-6 text-theme-primary" />
            </div>

            {/* Main info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-theme-primary classical-title group-hover:text-ouro-texto transition-colors duration-300 line-clamp-2">
                {item.title}
              </h3>

              <Stack gap={1} className="mt-1">
                {/* Work and Composer */}
                <Inline gap={4} className="flex-wrap">
                  {item.workId && item.workTitle && (
                    <Link
                      href={`/works/${item.workId}`}
                      className="inline-flex items-center text-sm text-aviso font-medium hover:text-ouro-texto transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PiMusicNotes className="w-3 h-3 mr-1" />
                      <span className="hover:underline">{item.workTitle}</span>
                    </Link>
                  )}

                  {!item.workId && (
                    <Text
                      papel="rotulo"
                      tom="fraco"
                      className="inline-flex items-center"
                    >
                      <PiMusicNotes className="w-3 h-3 mr-1" />
                      {t('card_work_not_linked')}
                    </Text>
                  )}

                  {item.composerId && item.composerName && (
                    <Link
                      href={`/composer/${item.composerId}`}
                      className="inline-flex items-center text-xs text-theme-tertiary hover:text-aviso transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PiUser className="w-3 h-3 mr-1" />
                      <span className="hover:underline">
                        {item.composerName}
                      </span>
                    </Link>
                  )}

                  {!item.composerId && item.composerName && (
                    <Text
                      papel="legenda"
                      tom="fraco"
                      className="inline-flex items-center"
                    >
                      <PiUser className="w-3 h-3 mr-1" />
                      {item.composerName}
                    </Text>
                  )}
                </Inline>

                {/* File info */}
                <Inline gap={4} className="flex-wrap">
                  {item.fileSize && (
                    <Text papel="legenda" tom="fraco">
                      {item.fileSize}
                      {item.pageCount && ` • ${item.pageCount} páginas`}
                    </Text>
                  )}

                  {/* Status badges */}
                  {item.isIMSLP && (
                    <span className="text-xs font-medium text-aviso px-2 py-1 bg-aviso/10 rounded-full">
                      IMSLP
                    </span>
                  )}

                  {item.verificationStatus === 'verified' && (
                    <Inline
                      as="span"
                      gap={1}
                      className="text-xs font-medium text-ok px-2 py-1 bg-ok/10 rounded-full"
                    >
                      <PiShield className="w-3 h-3" />
                      <span>{t('card_verified_badge')}</span>
                    </Inline>
                  )}
                </Inline>
              </Stack>
            </div>
          </Inline>

          {/* Right section - Actions */}
          <Inline gap={2} className="flex-shrink-0">
            {item.imslpId && (
              <a
                href={`https://imslp.org/wiki/${item.imslpId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-2 py-1 bg-ok/10 border border-ok/20 text-ok rounded-md text-xs font-medium hover:bg-ok/20 hover:scale-105 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                IMSLP
                <PiArrowSquareOut className="w-2.5 h-2.5 ml-1" />
              </a>
            )}

            <Inline gap={1} className="duration-300">
              <button
                onClick={onEdit}
                className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-aviso/10 text-theme-tertiary hover:text-aviso transition-colors flex items-center justify-center"
              >
                <PiNotePencil className="w-4 h-4" />
                <NomeAcao acao="editar" />
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`w-8 h-8 rounded-lg bg-theme-secondary hover:bg-erro/10 text-theme-tertiary hover:text-erro transition-colors flex items-center justify-center ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <PiTrash className="w-4 h-4" />
                <NomeAcao acao="excluir" />
              </button>
            </Inline>
          </Inline>
        </div>
      </Card>
    );
  }

  return (
    <div className="group cursor-pointer select-none h-full">
      <div className="classical-card h-full flex flex-col overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2 hover:shadow-[var(--sombra-2)]">
        {/* Header Section */}
        <div className="relative p-6 pb-4 border-b border-theme-secondary">
          {/* Floating action buttons */}
          <Stack
            gap={2}
            className="absolute top-4 right-4 z-50 opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg bg-theme-elevated hover:bg-aviso/10 text-theme-tertiary hover:text-aviso transition-colors flex items-center justify-center shadow-theme-medium"
            >
              <PiNotePencil className="w-4 h-4" />
              <NomeAcao acao="editar" />
            </button>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`w-8 h-8 rounded-lg bg-theme-elevated hover:bg-erro/10 text-theme-tertiary hover:text-erro transition-colors flex items-center justify-center shadow-theme-medium ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PiTrash className="w-4 h-4" />
              <NomeAcao acao="excluir" />
            </button>
          </Stack>

          <div className="relative z-10">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-ok rounded-xl flex items-center justify-center">
                <PiFileText className="w-8 h-8 text-theme-primary" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-theme-primary classical-title mb-3 line-clamp-2 group-hover:text-ouro-texto transition-colors duration-300 leading-tight text-center">
              {item.title}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex-1 w-full flex flex-col">
          {/* Score Details */}
          <div className="space-y-3 mb-4 flex-1">
            {/* Work info */}
            <Stack gap={2} className="text-center">
              {item.workId && item.workTitle ? (
                <Link
                  href={`/works/${item.workId}`}
                  className="flex items-center justify-center group/link hover:scale-105 transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PiMusicNotes className="w-4 h-4 text-aviso mr-2" />
                  <span className="text-sm text-aviso font-medium hover:text-ouro-texto transition-colors hover:underline">
                    {item.workTitle}
                  </span>
                </Link>
              ) : (
                <div className="flex items-center justify-center">
                  <PiMusicNotes className="w-4 h-4 text-theme-tertiary mr-2" />
                  <Text papel="rotulo" tom="fraco">
                    {t('card_work_not_linked')}
                  </Text>
                </div>
              )}

              {item.composerId && item.composerName ? (
                <Link
                  href={`/composer/${item.composerId}`}
                  className="flex items-center justify-center group/link hover:scale-105 transition-transform"
                  onClick={(e) => e.stopPropagation()}
                >
                  <PiUser className="w-4 h-4 text-theme-tertiary mr-2 group-hover/link:text-aviso transition-colors" />
                  <Text
                    papel="rotulo"
                    tom="fraco"
                    className="group-hover/link:text-aviso transition-colors hover:underline"
                  >
                    {item.composerName}
                  </Text>
                </Link>
              ) : item.composerName ? (
                <div className="flex items-center justify-center">
                  <PiUser className="w-4 h-4 text-theme-tertiary mr-2" />
                  <Text papel="rotulo" tom="fraco">
                    {item.composerName}
                  </Text>
                </div>
              ) : null}
            </Stack>

            {/* File info */}
            {(item.fileSize || item.pageCount) && (
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <PiDownloadSimple className="w-4 h-4 text-brand-primary mr-2" />
                  <Text papel="rotulo" tom="suave">
                    {item.fileSize}
                    {item.pageCount && ` • ${item.pageCount} páginas`}
                  </Text>
                </div>
              </div>
            )}

            {/* Quality info */}
            {item.dataQuality && (
              <div className="text-center">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    item.dataQuality === 'high'
                      ? 'bg-ok/10 text-ok border border-ok/30'
                      : item.dataQuality === 'medium'
                        ? 'bg-atencao/10 text-atencao border border-atencao/30'
                        : 'bg-erro/10 text-erro border border-erro/30'
                  }`}
                >
                  <PiStar className="w-2.5 h-2.5 mr-1" />
                  {getDataQualityLabel(item.dataQuality)}
                </span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {item.isIMSLP && (
              <span className="inline-flex items-center px-2 py-1 bg-aviso/10 border border-aviso/30 text-aviso rounded-full text-xs font-medium">
                <PiArrowSquareOut className="w-2.5 h-2.5 mr-1" />
                IMSLP
              </span>
            )}

            {item.verificationStatus === 'verified' && (
              <span className="inline-flex items-center px-2 py-1 bg-ok/10 border border-ok/30 text-ok rounded-full text-xs font-medium">
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

              <Inline gap={2}>
                {/* Download link */}
                {item.downloadUrl && (
                  <Inline
                    as="a"
                    gap={1}
                    href={item.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-primary hover:text-aviso text-sm font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                    title={t('card_download_score')}
                  >
                    <PiDownloadSimple className="w-3 h-3" />
                    <span>{t('card_download')}</span>
                  </Inline>
                )}

                {/* IMSLP link */}
                {item.imslpId && (
                  <Inline
                    as="a"
                    gap={1}
                    href={`https://imslp.org/wiki/${item.imslpId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ok hover:text-aviso text-sm font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>IMSLP</span>
                    <PiArrowSquareOut className="w-3 h-3" />
                  </Inline>
                )}
              </Inline>
            </div>
          </Stack>

          {/* Hover glow effect */}
          <div className="absolute inset-0 fill-ouro opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 fill-ouro rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100"></div>
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
