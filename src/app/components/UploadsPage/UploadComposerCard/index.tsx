// app/components/uploads/UploadComposerCard.tsx - TRADUZIDO
'use client';
import { Button } from '@/app/components/ui/Button';

import { useState } from 'react';
import Image from '@/app/components/SmartImage';
import Link from 'next/link';
import {
  PiArrowSquareOut,
  PiCalendarBlank,
  PiMusicNotes,
  PiNotePencil,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import type { UserUpload } from '@/app/requests/my-uploads';
import ConfirmDeleteUploadModal from '../../ConfirmDeleteUploadModal';
import VerificationBadge from '../../Verification/VerificationBadge';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

interface UploadComposerCardProps {
  item: UserUpload;
  onEdit: () => void;
  onDelete: () => void;
  onBulkInsertWorks?: () => void;
  isAdmin: boolean;
  viewMode: 'cards' | 'list';
  isDeleting?: boolean;
}

const UploadComposerCard = ({
  item,
  onEdit,
  onDelete,
  onBulkInsertWorks,
  viewMode,
  isDeleting = false,
}: UploadComposerCardProps) => {
  const { t } = useTranslation({ sections: ['pages/uploads'] });
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
    if (!item.createdAt) return null;
    return new Date(item.createdAt).getFullYear();
  };

  const hasExternalLinks = item.imslpId;
  const portraitUrl = (item as any).portraitUrl;

  const getDataQualityText = (quality: string) => {
    switch (quality) {
      case 'high':
        return t('data_quality_high');
      case 'medium':
        return t('data_quality_medium');
      case 'low':
        return t('data_quality_low');
      default:
        return quality;
    }
  };

  if (viewMode === 'list') {
    return (
      <Card
        densidade="compacta"
        className="group relative transition-all duration-300"
      >
        <div className="flex flex-col-reverse md:flex-row gap-2 items-center justify-between w-full">
          {/* Left section - Portrait and basic info */}
          <Inline gap={4} className="self-start md:self-auto flex-1 min-w-0">
            {/* Portrait */}
            <div className="relative w-12 h-12 flex-shrink-0">
              {!imageLoaded && !imageError && portraitUrl && (
                <div className="absolute inset-0 loading-skeleton rounded-full"></div>
              )}

              {portraitUrl && !imageError ? (
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 transition-all duration-300">
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
                    <div className="absolute inset-0 rounded-full flex items-center justify-center">
                      <PiUser className="w-5 h-5 text-theme-inverse" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center border-2 transition-all duration-300">
                  <PiUser className="w-5 h-5 text-theme-inverse" />
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
                <h3 className="text-base font-bold text-theme-primary classical-title transition-colors duration-300 truncate hover:underline">
                  {item.title}
                </h3>
                {item.isVerified && (
                  <VerificationBadge verified={true} size="sm" variant="icon" />
                )}
              </Link>

              <div className="flex flex-wrap items-start md:items-center space-x-4 mt-1">
                {/* Period */}
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

                {/* Date */}
                {formatDates() && (
                  <Text
                    papel="legenda"
                    tom="fraco"
                    className="inline-flex items-center"
                  >
                    <PiCalendarBlank className="w-3 h-3 mr-1" />
                    {formatDates()}
                  </Text>
                )}

                {/* Badge para compositor com obras importáveis */}
                {item.isIMSLP && (
                  <Inline
                    as="span"
                    gap={1}
                    className="text-xs font-medium md:px-2 md:py-1 rounded-full"
                  >
                    <PiMusicNotes className="w-3 h-3" />
                    <span>{t('card_works_badge')}</span>
                  </Inline>
                )}

                {item.verificationStatus === 'verified' && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full">
                    {t('card_verified_badge')}
                  </span>
                )}
              </div>
            </div>
          </Inline>

          {/* Right section - Actions */}
          <Inline gap={2} className="self-end md:self-auto flex-shrink-0">
            {hasExternalLinks && (
              <a
                href={`https://imslp.org/wiki/${item.imslpId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="items-center hidden md:inline-flex px-2 py-1 rounded-md text-xs font-medium hover:scale-105 transition-all duration-300 bg-sup-2"
                onClick={(e) => e.stopPropagation()}
              >
                IMSLP
                <PiArrowSquareOut className="w-2.5 h-2.5 ml-1" />
              </a>
            )}

            <Inline gap={1} className="transition-opacity duration-300">
              {/* Botão de Bulk Insert de Obras */}
              {item.isIMSLP && onBulkInsertWorks && (
                <Button
                  variante="fantasma"
                  tamanho="p"
                  onClick={onBulkInsertWorks}
                  title={t('card_import_all_works')}
                  icone={PiMusicNotes}
                  rotulo={t('card_import_all_works')}
                />
              )}

              <Button
                variante="fantasma"
                tamanho="p"
                onClick={onEdit}
                icone={PiNotePencil}
              >
                <NomeAcao acao="editar" />
              </Button>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className={`w-8 h-8 rounded-lg bg-theme-secondary transition-colors flex items-center justify-center !text-erro ${
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
      <div className="classical-card h-full overflow-hidden transition-all duration-700 ease-out group-hover:scale-105 group-hover:-translate-y-2">
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
                  <div className="relative w-full h-full rounded-full overflow-hidden border-3 transition-all duration-500 group-hover/portrait:scale-110">
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
                      <div className="absolute inset-0 rounded-full flex items-center justify-center">
                        <PiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full flex items-center justify-center border-3 transition-all duration-500 group-hover/portrait:scale-110">
                    <PiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Floating action buttons */}
          <Stack
            gap={2}
            className="absolute top-4 right-4 opacity-100 md: transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            {/* Botão de Bulk Insert de Obras */}
            {item.isIMSLP && onBulkInsertWorks && (
              <Button
                variante="fantasma"
                tamanho="p"
                onClick={onBulkInsertWorks}
                title={t('card_import_all_works')}
                icone={PiMusicNotes}
                rotulo={t('card_import_all_works')}
              />
            )}

            <Button
              variante="fantasma"
              tamanho="p"
              onClick={onEdit}
              icone={PiNotePencil}
            >
              <NomeAcao acao="editar" />
            </Button>

            <button
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className={`w-8 h-8 rounded-lg bg-theme-elevated transition-colors flex items-center justify-center shadow-theme-medium !text-erro ${
                isDeleting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <PiTrash className="w-4 h-4" />
              <NomeAcao acao="excluir" />
            </button>
          </Stack>
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
                <h3 className="text-lg font-bold text-theme-primary classical-title transition-colors duration-300 line-clamp-2 hover:underline">
                  {item.title}
                </h3>
              </Link>
            </div>

            {/* Status badges */}
            <div className="flex justify-center space-x-2">
              {item.isIMSLP && (
                <Inline
                  as="span"
                  gap={1}
                  className="text-xs font-medium px-2 py-1 rounded-full"
                >
                  <PiArrowSquareOut className="w-3 h-3" />
                  <span>IMSLP</span>
                </Inline>
              )}

              {/* Badge para compositor com obras importáveis */}
              {item.isIMSLP && (
                <Inline
                  as="span"
                  gap={1}
                  className="text-xs font-medium px-2 py-1 rounded-full"
                >
                  <PiMusicNotes className="w-3 h-3" />
                  <span>{t('card_works_badge')}</span>
                </Inline>
              )}

              {item.verificationStatus === 'verified' && (
                <span className="text-xs font-medium px-2 py-1 rounded-full">
                  {t('card_verified_badge')}
                </span>
              )}

              {item.dataQuality && (
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    item.dataQuality === 'high'
                      ? ''
                      : item.dataQuality === 'medium'
                        ? ''
                        : ''
                  }`}
                >
                  {getDataQualityText(item.dataQuality)}
                </span>
              )}
            </div>

            {/* Period info */}
            {item.epochName && (
              <div className="text-center">
                <Text
                  papel="legenda"
                  tom="ouro"
                  className="inline-flex items-center px-3 py-1 rounded-full font-medium transition-colors duration-300 bg-sup-2"
                >
                  <PiMusicNotes className="w-3 h-3 mr-1" />
                  {item.epochName}
                </Text>
              </div>
            )}

            {/* External links */}
            {hasExternalLinks && (
              <div className="flex justify-center space-x-2 pt-2">
                <a
                  href={`https://imslp.org/wiki/${item.imslpId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium hover:scale-105 transition-all duration-300 group/link bg-sup-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  IMSLP
                  <PiArrowSquareOut className="w-2.5 h-2.5 ml-1 opacity-60 group-hover/link:opacity-100 transition-opacity" />
                </a>
              </div>
            )}

            {/* Date info */}
            <div className="flex items-center justify-center pt-4 border-t border-theme-secondary mt-4">
              <Inline gap={2} className="text-theme-tertiary text-xs">
                <PiCalendarBlank className="w-3 h-3" />
                <span>
                  {t('card_added_on')}{' '}
                  {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </Inline>
            </div>
          </div>

          {/* Hover glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-b-2xl"></div>
        </div>

        {/* Floating mini indicator */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full transition-all duration-300 scale-50 group-hover:scale-100"></div>
      </div>

      {/* Modal de confirmação de delete */}
      <ConfirmDeleteUploadModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        itemTitle={item.title}
        itemId={item.id}
        itemType="composer"
      />
    </div>
  );
};

export default UploadComposerCard;
