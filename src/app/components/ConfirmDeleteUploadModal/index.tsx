// app/components/uploads/ConfirmDeleteUploadModal.tsx - TRADUZIDO
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PiFileText,
  PiInfo,
  PiMusicNotes,
  PiSpinnerGap,
  PiTrash,
  PiUser,
  PiWarning,
} from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import { getCascadeInfo } from '@/app/requests/uploads-client';
import Button from '../Common/Button';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import Modal from '@/app/components/Modal';

interface CascadeInfo {
  works?: { id: string; title: string; scoresCount: number }[];
  scores?: { id: string; title: string; source?: string }[];
  childWorks?: { id: string; title: string; scoresCount: number }[];
  totalWorks?: number;
  totalScores?: number;
  totalChildWorks?: number;
  directScores?: number;
  childWorksScores?: number;
}

interface ConfirmDeleteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  itemTitle: string;
  itemType: 'composer' | 'work' | 'score';
  itemId?: string;
}

const TYPE_CONFIG = {
  composer: {
    icon: PiUser,
    color: '',
  },
  work: {
    icon: PiMusicNotes,
    color: '',
  },
  score: {
    icon: PiFileText,
    color: '',
  },
};

export default function ConfirmDeleteUploadModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  itemTitle,
  itemType,
  itemId,
}: ConfirmDeleteUploadModalProps) {
  const { t } = useTranslation({ sections: ['pages/uploads'] });
  const [mounted, setMounted] = useState(false);
  const [cascadeInfo, setCascadeInfo] = useState<CascadeInfo | null>(null);
  const [loadingCascadeInfo, setLoadingCascadeInfo] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // Carregar informações de cascata se necessário
      if (itemId && (itemType === 'composer' || itemType === 'work')) {
        loadCascadeInfo();
      }

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, itemId, itemType]);

  const loadCascadeInfo = async () => {
    if (!itemId) return;

    setLoadingCascadeInfo(true);
    try {
      setCascadeInfo(await getCascadeInfo(itemType, itemId));
    } catch (error) {
      console.error('Erro ao carregar informações de cascata:', error);
    } finally {
      setLoadingCascadeInfo(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const typeConfig = TYPE_CONFIG[itemType];
  const TypeIcon = typeConfig.icon;

  // Corrigido para garantir que sempre retorna boolean
  const hasCascadeItems = Boolean(
    cascadeInfo &&
    ((cascadeInfo.totalWorks ?? 0) > 0 || (cascadeInfo.totalScores ?? 0) > 0)
  );

  // Helper functions para textos traduzidos
  const getItemTypeLabel = () => {
    return t(`item_type_${itemType}`);
  };

  const getItemTypeArticle = () => {
    return t(`item_type_article_${itemType}`);
  };

  const getScoreText = (count: number) => {
    return count === 1 ? t('item_score_singular') : t('item_score_plural');
  };

  // const getWorkText = (count: number) => {
  //   return count === 1 ? t('item_work_singular') : t('item_work_plural');
  // };

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      showCloseButton={false}
    >
      <Inline gap={3} className="mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center relative">
          <PiWarning className="w-6 h-6" />
          {/* Ícone do tipo no canto */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br ${typeConfig.color} rounded-full flex items-center justify-center`}
          >
            <TypeIcon className="w-2.5 h-2.5 text-theme-primary" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-theme-primary">
            {t('delete_modal_title')}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {t('delete_modal_subtitle')}
          </Text>
        </div>
      </Inline>

      <Stack className="mb-6">
        <p className="text-theme-secondary">
          {t('delete_modal_confirm_text', {
            article: getItemTypeArticle(),
            type: getItemTypeLabel(),
            title: itemTitle,
          })}
        </p>

        {/* Loading cascade info */}
        {loadingCascadeInfo ? (
          <Inline gap={2} className="p-3 rounded-lg border">
            <PiSpinnerGap className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {t('delete_modal_checking_related')}
            </span>
          </Inline>
        ) : null}

        {/* Cascade information */}
        {!loadingCascadeInfo && hasCascadeItems ? (
          <Stack gap={3} className="p-4 rounded-lg border">
            <div className="flex items-start space-x-2">
              <PiInfo className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium mb-1">
                  {t('delete_modal_cascade_warning')}
                </div>
                <Text papel="legenda" tom="suave" as="p" className="mb-3">
                  {t('delete_modal_cascade_description')}
                </Text>
              </div>
            </div>

            <Stack gap={3} className="text-sm">
              {/* Para compositor: mostrar obras */}
              {itemType === 'composer' &&
              cascadeInfo?.works &&
              cascadeInfo.works.length > 0 ? (
                <Stack gap={2}>
                  <p className="font-medium text-theme-primary flex items-center">
                    {t('delete_modal_works_count', {
                      count: cascadeInfo.works.length,
                    })}
                  </p>
                  <Stack gap={1} className="overflow-y-auto rounded p-2">
                    {cascadeInfo.works.slice(0, 4).map((work) => (
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="div"
                        key={work.id}
                        className="flex justify-between"
                      >
                        <span>• {work.title}</span>
                        {work.scoresCount > 0 ? (
                          <span className="">
                            {work.scoresCount} {getScoreText(work.scoresCount)}
                          </span>
                        ) : null}
                      </Text>
                    ))}
                    {cascadeInfo.works.length > 4 ? (
                      <Text papel="legenda" tom="fraco" as="div">
                        {t('delete_modal_and_more_works', {
                          count: cascadeInfo.works.length - 4,
                        })}
                      </Text>
                    ) : null}
                  </Stack>
                </Stack>
              ) : null}

              {/* Para obra: mostrar partituras */}
              {itemType === 'work' &&
              cascadeInfo?.scores &&
              cascadeInfo.scores.length > 0 ? (
                <Stack gap={2}>
                  <p className="font-medium text-theme-primary flex items-center">
                    {t('delete_modal_scores_count', {
                      count: cascadeInfo.scores.length,
                    })}
                  </p>
                  <div className="space-y-1 max-h-24 overflow-y-auto rounded p-2">
                    {cascadeInfo.scores.slice(0, 4).map((score) => (
                      <Text papel="legenda" tom="fraco" as="div" key={score.id}>
                        • {score.title}
                      </Text>
                    ))}
                    {cascadeInfo.scores.length > 4 ? (
                      <Text papel="legenda" tom="fraco" as="div">
                        {t('delete_modal_and_more_scores', {
                          count: cascadeInfo.scores.length - 4,
                        })}
                      </Text>
                    ) : null}
                  </div>
                </Stack>
              ) : null}

              {/* Obras filhas */}
              {cascadeInfo?.childWorks && cascadeInfo.childWorks.length > 0 ? (
                <Stack gap={2}>
                  <p className="font-medium text-theme-primary">
                    {t('delete_modal_child_works_count', {
                      count: cascadeInfo.childWorks.length,
                    })}
                  </p>
                  <div className="space-y-1 max-h-20 overflow-y-auto rounded p-2">
                    {cascadeInfo.childWorks.slice(0, 3).map((childWork) => (
                      <Text
                        papel="legenda"
                        tom="fraco"
                        as="div"
                        key={childWork.id}
                        className="flex justify-between"
                      >
                        <span>• {childWork.title}</span>
                        {childWork.scoresCount > 0 ? (
                          <span className="">
                            {childWork.scoresCount}{' '}
                            {getScoreText(childWork.scoresCount)}
                          </span>
                        ) : null}
                      </Text>
                    ))}
                  </div>
                </Stack>
              ) : null}

              {/* Total geral */}
              {cascadeInfo?.totalScores !== undefined &&
              cascadeInfo.totalScores >= 0 ? (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium">
                    {cascadeInfo.totalWorks && cascadeInfo.totalWorks > 0
                      ? t('delete_modal_total_summary_with_works', {
                          scores: cascadeInfo.totalScores,
                          works: cascadeInfo.totalWorks,
                        })
                      : t('delete_modal_total_summary', {
                          scores: cascadeInfo.totalScores,
                        })}
                  </p>
                </div>
              ) : null}
            </Stack>
          </Stack>
        ) : null}

        {/* No cascade items */}
        {!loadingCascadeInfo &&
        !hasCascadeItems &&
        (itemType === 'composer' || itemType === 'work') ? (
          <div className="p-3 rounded-lg border">
            <Inline gap={2}>
              <PiInfo className="w-4 h-4" />
              <span className="text-sm">
                {t('delete_modal_no_related_items')}
              </span>
            </Inline>
          </div>
        ) : null}

        {/* Warning for score */}
        {itemType === 'score' ? (
          <div className="border rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <PiWarning className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium">
                  {t('delete_modal_score_warning_title')}
                </p>
                <p className="mt-1 text-xs">
                  {t('delete_modal_score_warning_text')}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </Stack>

      <Inline gap={3} className="justify-end">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary transition-colors disabled:opacity-50"
        >
          {t('delete_modal_cancel')}
        </button>
        <Button
          variant="delete"
          onClick={onConfirm}
          leftIcon={<PiTrash />}
          disabled={isLoading || loadingCascadeInfo}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{t('delete_modal_deleting')}</span>
            </>
          ) : (
            <>
              <span>
                {t('delete_modal_delete_button', {
                  type: getItemTypeLabel(),
                })}
                {hasCascadeItems ? (
                  <span className="text-xs opacity-75">
                    {' '}
                    {t('delete_modal_plus_related')}
                  </span>
                ) : null}
              </span>
            </>
          )}
        </Button>
      </Inline>
    </Modal>
  );

  return createPortal(modalContent, document.body);
}
