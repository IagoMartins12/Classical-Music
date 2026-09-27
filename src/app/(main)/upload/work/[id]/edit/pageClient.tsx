// app/components/EditWorkClient.tsx - Layout atualizado
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import {
  PiArrowSquareOut,
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiEye,
  PiFloppyDisk,
  PiMapPin,
  PiMetronome,
  PiMusicNotes,
  PiPencilLine,
  PiSpinnerGap,
  PiStack,
  PiTag,
  PiTarget,
  PiTrash,
  PiUser,
} from 'react-icons/pi';

import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../../../../../components/animation/AnimatedComponents';
import Button from '../../../../../components/Common/Button';
import CreateWorkModal from '../../../../../components/UploadsPage/modals/CreateWorkModal';
import { useToast } from '@/app/hooks/useToast';
import { deleteUpload } from '@/app/requests/uploads-client';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

interface EditWorkClientProps {
  work: any;
  composers: any[];
  instruments: any[];
  epochs: any[];
  isAdmin: boolean;
  userId: string;
}

const EditWorkClient = ({
  work,
  composers,
  instruments,
  epochs,
  isAdmin,
  userId,
}: EditWorkClientProps) => {
  const router = useRouter();
  const { t } = useTranslation({ sections: ['pages/uploads'] });
  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDuration = (duration?: string) => {
    if (!duration) return null;
    return duration;
  };

  const toast = useToast();

  const getWorkTypeLabel = (type: string) => {
    return t(`work_types_${type}`) || type;
  };

  const getDifficultyLabel = (level?: string) => {
    if (!level) return null;
    return t(`work_difficulty_${level.toLowerCase()}`) || level;
  };

  const getDifficultyColor = (level?: string) => {
    const colors = {
      BEGINNER: '',
      INTERMEDIATE: '',
      ADVANCED: '',
    };
    return level ? colors[level as keyof typeof colors] || '' : '';
  };

  const handleDelete = async () => {
    if (!confirm(t('delete_confirm_work').replace('{title}', work.title))) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await deleteUpload('work', work.id);

      if (response.ok) {
        router.push('/upload');
      } else {
        throw new Error(response.error || 'Erro ao excluir obra');
      }
    } catch (error) {
      console.error('Erro ao excluir obra:', error);
      toast.error(
        error instanceof Error ? error.message : 'Erro ao excluir obra'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <Inline
            as="nav"
            gap={2}
            className="text-sm text-theme-tertiary mb-6 pt-4"
          >
            <Link
              href="/upload"
              className="transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_uploads')}
            </Link>
            <svg
              className="w-4 h-4"
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
            <Link
              href="/upload"
              className="transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_works')}
            </Link>
            <svg
              className="w-4 h-4"
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
            <span className="text-theme-primary font-medium">
              {t('breadcrumb_edit').replace('{name}', work.title)}
            </span>
          </Inline>
        </AnimatedItem>

        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Principal */}
          <AnimatedCard
            hover="lift"
            className="classical-card overflow-hidden relative"
          >
            <div className="p-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Informações Principais */}
                <Stack gap={6} className="lg:col-span-3">
                  {/* Título e Header */}
                  <Stack>
                    <div className="flex flex-col sm:flex-row items-start justify-between">
                      <div className="flex-1">
                        <Inline gap={3} className="mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                            <PiPencilLine className="w-5 h-5 text-theme-primary" />
                          </div>
                          <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title leading-tight">
                              {t('edit_work_title')}
                            </h1>
                          </div>
                        </Inline>

                        <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title leading-tight">
                          {work.title}
                        </h1>

                        {/* Subtitle */}
                        {work.subtitle && (
                          <h2 className="text-2xl md:text-3xl text-theme-secondary mt-2 classical-subtitle font-medium">
                            {work.subtitle}
                          </h2>
                        )}

                        <Inline
                          gap={2}
                          className="text-xl text-theme-secondary mt-3"
                        >
                          <span>{t('score_info_by_composer')}</span>
                          <Link
                            href={`/composer/${work.composer.id}`}
                            className="text-ouro-texto font-semibold transition-colors duration-300 classical-subtitle"
                          >
                            {work.composer.fullName || work.composer.name}
                          </Link>
                        </Inline>
                        {work.opOrCatalog && (
                          <p className="text-lg text-theme-tertiary mt-2 font-medium">
                            {work.opOrCatalog}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <Inline
                        gap={3}
                        className="flex-wrap justify-center gap-3 sm:gap-0 mt-4 sm:mt-0 ml-4"
                      >
                        <Link href={`/works/${work.id}`} className="ml-2">
                          <Button variant="primary" leftIcon={<PiEye />}>
                            {t('view_work_button')}
                          </Button>
                        </Link>

                        {(isAdmin || work.createdBy === userId) && (
                          <>
                            <Button
                              variant="primary"
                              leftIcon={<PiFloppyDisk />}
                              onClick={() => setShowEditModal(true)}
                            >
                              {t('edit_button')}
                            </Button>
                            <Button
                              variant="delete"
                              leftIcon={
                                isDeleting ? (
                                  <PiSpinnerGap className="animate-spin" />
                                ) : (
                                  <PiTrash />
                                )
                              }
                              onClick={handleDelete}
                              disabled={isDeleting}
                            >
                              {isDeleting
                                ? t('deleting_button')
                                : t('delete_button')}
                            </Button>
                          </>
                        )}
                      </Inline>
                    </div>

                    {/* Difficulty Level Badge */}
                    {work.difficultyLevel && (
                      <Inline gap={3}>
                        <div
                          className={`px-4 py-2 bg-gradient-to-r ${getDifficultyColor(
                            work.difficultyLevel
                          )} rounded-full flex items-center space-x-2 shadow-lg`}
                        >
                          <PiTarget className="w-4 h-4 text-theme-primary" />
                          <Text
                            papel="rotulo"
                            tom="forte"
                            className="font-semibold"
                          >
                            {t('work_difficulty_level')}:{' '}
                            {getDifficultyLabel(work.difficultyLevel)}
                          </Text>
                        </div>
                      </Inline>
                    )}
                  </Stack>

                  {/* Grid de Informações Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Ano de Composição */}
                    {work.compositionYear && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiCalendarBlank className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_info_composition_year')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {work.compositionYear}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Duração */}
                    {work.mediaDuration && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiClock className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_info_duration')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {formatDuration(work.mediaDuration)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tom */}
                    {work.tone && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMusicNotes className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_info_tone')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {work.tone}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tempo Marking */}
                    {work.tempoMarking && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <PiMetronome className="w-4 h-4 text-theme-primary" />
                        </div>
                        <div>
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="font-medium"
                          >
                            {t('work_info_tempo_marking')}
                          </Text>
                          <p className="text-theme-primary font-semibold">
                            {work.tempoMarking}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Instrumento */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <PiMusicNotes className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <Text
                          papel="rotulo"
                          tom="fraco"
                          as="p"
                          className="font-medium"
                        >
                          {t('work_info_instrument')}
                        </Text>
                        <p className="text-theme-primary font-semibold">
                          {work.instrument.name}
                        </p>
                      </div>
                    </div>

                    {/* Época */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <PiMapPin className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <Text
                          papel="rotulo"
                          tom="fraco"
                          as="p"
                          className="font-medium"
                        >
                          {t('work_info_epoch')}
                        </Text>
                        <p className="text-ouro-texto font-semibold">
                          {work.epoch.name}
                        </p>
                      </div>
                    </div>

                    {/* Tipo de Obra */}
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <PiStack className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <Text
                          papel="rotulo"
                          tom="fraco"
                          as="p"
                          className="font-medium"
                        >
                          {t('work_info_type')}
                        </Text>
                        <p className="text-theme-primary font-semibold">
                          {getWorkTypeLabel(work.workType)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  {(work.firstPublishDate ||
                    work.dedicateTo ||
                    work.workStyle ||
                    work.instrumentation) && (
                    <Stack className="border-t border-theme-secondary pt-6">
                      <Inline
                        as="h3"
                        gap={2}
                        className="text-lg font-semibold text-theme-primary classical-title"
                      >
                        <PiBookOpen className="w-5 h-5" />
                        <span>{t('work_info_additional_info')}</span>
                      </Inline>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {work.firstPublishDate && (
                          <Inline gap={2}>
                            <span className="font-medium text-theme-tertiary">
                              {t('work_info_first_publication')}:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.firstPublishDate}
                            </span>
                          </Inline>
                        )}
                        {work.dedicateTo && (
                          <Inline gap={2}>
                            <span className="font-medium text-theme-tertiary">
                              {t('work_info_dedicated_to')}:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.dedicateTo}
                            </span>
                          </Inline>
                        )}
                        {work.workStyle && (
                          <Inline gap={2}>
                            <span className="font-medium text-theme-tertiary">
                              {t('work_info_style')}:
                            </span>
                            <span className="text-theme-primary font-semibold">
                              {work.workStyle}
                            </span>
                          </Inline>
                        )}
                        {work.instrumentation && (
                          <div className="md:col-span-2 p-3 rounded-xl bg-sup-2">
                            <span className="font-medium text-theme-tertiary block mb-1">
                              {t('work_info_instrumentation')}:
                            </span>
                            <span className="text-theme-primary whitespace-pre-line">
                              {work.instrumentation}
                            </span>
                          </div>
                        )}
                      </div>
                    </Stack>
                  )}

                  {/* Tags de Categorias e Gêneros */}
                  {(work.categoryNames?.length > 0 ||
                    work.workGenresArr?.length > 0) && (
                    <Stack className="border-t border-theme-secondary pt-6">
                      <Inline
                        as="h3"
                        gap={2}
                        className="text-lg font-semibold text-theme-primary classical-title"
                      >
                        <PiTag className="w-5 h-5" />
                        <span>{t('work_info_categories_genres')}</span>
                      </Inline>
                      <Stack>
                        {work.categoryNames?.length > 0 && (
                          <Stack gap={3}>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              className="font-medium block"
                            >
                              {t('work_info_categories')}:
                            </Text>
                            <div className="flex flex-wrap gap-2">
                              {work.categoryNames.map(
                                (categoryName: string, index: number) => (
                                  <Text
                                    papel="rotulo"
                                    tom="ouro"
                                    key={index}
                                    className="px-4 py-2 bg-gradient-to-r rounded-full font-medium bg-sup-2"
                                  >
                                    {categoryName}
                                  </Text>
                                )
                              )}
                            </div>
                          </Stack>
                        )}

                        {work.workGenresArr?.length > 0 && (
                          <Stack gap={3}>
                            <Text
                              papel="rotulo"
                              tom="fraco"
                              className="font-medium block"
                            >
                              {t('work_info_work_types')}:
                            </Text>
                            <div className="flex flex-wrap gap-2">
                              {work.workGenresArr.map(
                                (workGenre: string, index: number) => (
                                  <span
                                    key={index}
                                    className="capitalize px-4 py-2 rounded-full text-sm font-medium bg-sup-2"
                                  >
                                    {workGenre}
                                  </span>
                                )
                              )}
                            </div>
                          </Stack>
                        )}
                      </Stack>
                    </Stack>
                  )}

                  {/* Link IMSLP */}
                  {work.imslpPermlink && (
                    <div className="border-t border-theme-secondary pt-6">
                      <Inline
                        as="h3"
                        gap={2}
                        className="text-lg font-semibold text-theme-primary classical-title mb-4"
                      >
                        <PiArrowSquareOut className="w-5 h-5" />
                        <span>{t('work_info_external_link')}</span>
                      </Inline>
                      <Inline
                        as="a"
                        gap={2}
                        href={work.imslpPermlink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-classical-primary group/btn w-fit"
                      >
                        <PiBookOpen className="w-4 h-4" />
                        <span>{t('work_info_view_imslp')}</span>
                        <svg
                          className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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
                      </Inline>
                    </div>
                  )}
                </Stack>

                {/* Sidebar com Foto do Compositor */}
                <Stack gap={6}>
                  {/* Foto do Compositor */}
                  <Card nivel={2}>
                    <Inline gap={3} className="mb-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiUser className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        {t('work_info_composer')}
                      </h3>
                    </Inline>

                    <div className="text-center space-y-4">
                      {work.composer.portraitUrl && !imageError ? (
                        <div className="relative w-32 h-40 mx-auto rounded-xl overflow-hidden shadow-theme-medium">
                          <Image
                            src={work.composer.portraitUrl}
                            alt={work.composer.fullName || work.composer.name}
                            fill
                            sizes="128px"
                            className="object-cover"
                            onError={() => setImageError(true)}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-40 mx-auto rounded-xl flex items-center justify-center">
                          <PiUser className="w-8 h-8 text-theme-tertiary opacity-50" />
                        </div>
                      )}

                      <div>
                        <Link
                          href={`/composer/${work.composer.id}`}
                          className="text-ouro-texto font-semibold transition-colors duration-300 block"
                        >
                          {work.composer.fullName || work.composer.name}
                        </Link>
                        <Text
                          papel="rotulo"
                          tom="suave"
                          as="p"
                          className="mt-1"
                        >
                          {work.epoch.name}
                        </Text>
                      </div>
                    </div>
                  </Card>

                  {/* Detalhes Técnicos */}
                  <Card nivel={2}>
                    <Inline gap={3} className="mb-4">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center">
                        <PiBookOpen className="w-4 h-4 text-theme-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-theme-primary classical-title">
                        {t('work_info_technical_details')}
                      </h3>
                    </Inline>
                    <Stack gap={3} className="text-sm">
                      {work.movementNumber && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-theme-tertiary">
                            {t('work_info_movement')}:
                          </span>
                          <span className="text-theme-primary font-semibold">
                            #{work.movementNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                        <span className="font-medium text-theme-tertiary">
                          {t('work_info_cataloged_on')}:
                        </span>
                        <Text
                          papel="legenda"
                          tom="forte"
                          className="font-semibold"
                        >
                          {new Date(work.createdAt).toLocaleDateString('pt-BR')}
                        </Text>
                      </div>
                    </Stack>
                  </Card>
                </Stack>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </div>

      {/* Edit Modal */}
      <CreateWorkModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        composers={composers}
        instruments={instruments}
        epochs={epochs}
        editingWork={work}
      />
    </div>
  );
};

export default EditWorkClient;
