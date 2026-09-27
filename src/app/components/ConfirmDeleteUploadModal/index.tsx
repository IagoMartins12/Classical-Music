// app/components/uploads/ConfirmDeleteUploadModal.tsx - TRADUZIDO
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiSpinnerGap } from 'react-icons/pi';
import { useTranslation } from '@/app/context/TranslationContext';
import { getCascadeInfo } from '@/app/requests/uploads-client';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import ConfirmModal from '@/app/components/ConfirmModal';

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

  useEffect(() => {
    // Carregar informações de cascata se necessário
    if (isOpen && itemId && (itemType === 'composer' || itemType === 'work')) {
      loadCascadeInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, itemId, itemType]);

  if (!mounted || !isOpen) return null;

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
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      confirmarBloqueado={loadingCascadeInfo}
      type="danger"
      title={t('delete_modal_title')}
      cancelText={t('delete_modal_cancel')}
      confirmText={`${t('delete_modal_delete_button', { type: getItemTypeLabel() })}${
        hasCascadeItems ? ` ${t('delete_modal_plus_related')}` : ''
      }`}
      message={t('delete_modal_confirm_text', {
        article: getItemTypeArticle(),
        type: getItemTypeLabel(),
        title: itemTitle,
      })}
    >
      <Stack gap={3}>
        {/* Loading cascade info */}
        {loadingCascadeInfo ? (
          <Inline gap={2} className="p-3 rounded-lg bg-sup-2">
            <PiSpinnerGap className="w-4 h-4 animate-spin" />
            <span className="text-sm">
              {t('delete_modal_checking_related')}
            </span>
          </Inline>
        ) : null}

        {/* Cascade information */}
        {!loadingCascadeInfo && hasCascadeItems ? (
          <Stack gap={3} className="p-4 rounded-lg bg-sup-2">
            <div className="flex items-start space-x-2">
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
                <div className="pt-2 border-t border-linha">
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
          <div className="p-3 rounded-lg bg-sup-2">
            <Inline gap={2}>
              <span className="text-sm">
                {t('delete_modal_no_related_items')}
              </span>
            </Inline>
          </div>
        ) : null}

        {/* Warning for score */}
        {itemType === 'score' ? (
          <div className="rounded-lg p-3 bg-sup-2">
            <div className="flex items-start space-x-2">
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
    </ConfirmModal>
  );

  return createPortal(modalContent, document.body);
}
