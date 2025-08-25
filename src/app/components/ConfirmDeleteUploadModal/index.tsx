// app/components/uploads/ConfirmDeleteUploadModal.tsx - TRADUZIDO
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatedCard } from '../animation/AnimatedComponents';
import {
  FiAlertTriangle,
  FiTrash2,
  FiUser,
  FiMusic,
  FiFileText,
  FiInfo,
  FiLoader,
} from 'react-icons/fi';
import { useTranslation } from '@/app/hooks/useTranslation';
import Button from '../Common/Button';

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
    icon: FiUser,
    color: 'from-accent-purple to-accent-blue',
  },
  work: {
    icon: FiMusic,
    color: 'from-accent-blue to-accent-green',
  },
  score: {
    icon: FiFileText,
    color: 'from-accent-green to-accent-amber',
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
      const response = await fetch(
        `/api/uploads/${itemType}/${itemId}/cascade-info`
      );
      if (response.ok) {
        const info = await response.json();
        setCascadeInfo(info);
      }
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
      />

      <AnimatedCard
        hover="none"
        className="relative bg-theme-primary rounded-xl shadow-xl max-w-lg w-full p-6 border border-theme-secondary overflow-y-auto"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-accent-red/10 rounded-xl flex items-center justify-center relative">
            <FiAlertTriangle className="w-6 h-6 text-accent-red" />
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
            <p className="text-sm text-theme-secondary">
              {t('delete_modal_subtitle')}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-theme-secondary">
            {t('delete_modal_confirm_text', {
              article: getItemTypeArticle(),
              type: getItemTypeLabel(),
              title: itemTitle,
            })}
          </p>

          {/* Loading cascade info */}
          {loadingCascadeInfo ? (
            <div className="flex items-center space-x-2 p-3 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
              <FiLoader className="w-4 h-4 text-accent-blue animate-spin" />
              <span className="text-sm text-accent-blue">
                {t('delete_modal_checking_related')}
              </span>
            </div>
          ) : null}

          {/* Cascade information */}
          {!loadingCascadeInfo && hasCascadeItems ? (
            <div className="p-4 bg-accent-amber/10 rounded-lg border border-accent-amber/20">
              <div className="flex items-start space-x-2 mb-3">
                <FiInfo className="w-4 h-4 text-accent-amber mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-accent-amber mb-1">
                    {t('delete_modal_cascade_warning')}
                  </div>
                  <p className="text-xs text-theme-secondary mb-3">
                    {t('delete_modal_cascade_description')}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {/* Para compositor: mostrar obras */}
                {itemType === 'composer' &&
                cascadeInfo?.works &&
                cascadeInfo.works.length > 0 ? (
                  <div>
                    <p className="font-medium text-theme-primary mb-2 flex items-center">
                      {t('delete_modal_works_count', {
                        count: cascadeInfo.works.length,
                      })}
                    </p>
                    <div className="space-y-1  overflow-y-auto bg-theme-secondary/30 rounded p-2">
                      {cascadeInfo.works.slice(0, 4).map((work) => (
                        <div
                          key={work.id}
                          className="text-xs text-theme-tertiary flex justify-between"
                        >
                          <span>• {work.title}</span>
                          {work.scoresCount > 0 ? (
                            <span className="text-accent-amber">
                              {work.scoresCount}{' '}
                              {getScoreText(work.scoresCount)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                      {cascadeInfo.works.length > 4 ? (
                        <div className="text-xs text-theme-tertiary">
                          {t('delete_modal_and_more_works', {
                            count: cascadeInfo.works.length - 4,
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Para obra: mostrar partituras */}
                {itemType === 'work' &&
                cascadeInfo?.scores &&
                cascadeInfo.scores.length > 0 ? (
                  <div>
                    <p className="font-medium text-theme-primary mb-2 flex items-center">
                      {t('delete_modal_scores_count', {
                        count: cascadeInfo.scores.length,
                      })}
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto bg-theme-secondary/30 rounded p-2">
                      {cascadeInfo.scores.slice(0, 4).map((score) => (
                        <div
                          key={score.id}
                          className="text-xs text-theme-tertiary"
                        >
                          • {score.title}
                        </div>
                      ))}
                      {cascadeInfo.scores.length > 4 ? (
                        <div className="text-xs text-theme-tertiary">
                          {t('delete_modal_and_more_scores', {
                            count: cascadeInfo.scores.length - 4,
                          })}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {/* Obras filhas */}
                {cascadeInfo?.childWorks &&
                cascadeInfo.childWorks.length > 0 ? (
                  <div>
                    <p className="font-medium text-theme-primary mb-2">
                      {t('delete_modal_child_works_count', {
                        count: cascadeInfo.childWorks.length,
                      })}
                    </p>
                    <div className="space-y-1 max-h-20 overflow-y-auto bg-theme-secondary/30 rounded p-2">
                      {cascadeInfo.childWorks.slice(0, 3).map((childWork) => (
                        <div
                          key={childWork.id}
                          className="text-xs text-theme-tertiary flex justify-between"
                        >
                          <span>• {childWork.title}</span>
                          {childWork.scoresCount > 0 ? (
                            <span className="text-accent-amber">
                              {childWork.scoresCount}{' '}
                              {getScoreText(childWork.scoresCount)}
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Total geral */}
                {cascadeInfo?.totalScores !== undefined &&
                cascadeInfo.totalScores >= 0 ? (
                  <div className="pt-2 border-t border-accent-amber/20">
                    <p className="text-xs font-medium text-accent-amber">
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
              </div>
            </div>
          ) : null}

          {/* No cascade items */}
          {!loadingCascadeInfo &&
          !hasCascadeItems &&
          (itemType === 'composer' || itemType === 'work') ? (
            <div className="p-3 bg-accent-green/10 rounded-lg border border-accent-green/20">
              <div className="flex items-center space-x-2">
                <FiInfo className="w-4 h-4 text-accent-green" />
                <span className="text-sm text-accent-green">
                  {t('delete_modal_no_related_items')}
                </span>
              </div>
            </div>
          ) : null}

          {/* Warning for score */}
          {itemType === 'score' ? (
            <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <FiAlertTriangle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                <div className="text-sm text-accent-red">
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
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary hover:bg-theme-secondary transition-colors disabled:opacity-50"
          >
            {t('delete_modal_cancel')}
          </button>
          <Button
            variant="delete"
            onClick={onConfirm}
            leftIcon={<FiTrash2 />}
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
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
}
