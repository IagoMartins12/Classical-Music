// app/components/uploads/ConfirmDeleteUploadModal.tsx
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
    label: 'compositor',
    icon: FiUser,
    color: 'from-accent-purple to-accent-blue',
  },
  work: {
    label: 'obra',
    icon: FiMusic,
    color: 'from-accent-blue to-accent-green',
  },
  score: {
    label: 'partitura',
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

  const hasCascadeItems =
    cascadeInfo &&
    ((cascadeInfo.totalWorks && cascadeInfo.totalWorks > 0) ||
      (cascadeInfo.totalScores && cascadeInfo.totalScores > 0));

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
      />

      <AnimatedCard
        hover="none"
        className="relative bg-theme-primary rounded-xl shadow-xl max-w-lg w-full p-6 border border-theme-secondary max-h-[90vh] overflow-y-auto"
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
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-theme-secondary">
              Esta ação não pode ser desfeita
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-theme-secondary">
            Tem certeza que deseja deletar{' '}
            {typeConfig.label === 'obra' ? 'a' : 'o'} {typeConfig.label}{' '}
            <strong>&quot;{itemTitle}&quot;</strong>?
          </p>

          {/* Loading cascade info */}
          {loadingCascadeInfo && (
            <div className="flex items-center space-x-2 p-3 bg-accent-blue/10 rounded-lg border border-accent-blue/20">
              <FiLoader className="w-4 h-4 text-accent-blue animate-spin" />
              <span className="text-sm text-accent-blue">
                Verificando itens relacionados...
              </span>
            </div>
          )}

          {/* Cascade information */}
          {!loadingCascadeInfo && hasCascadeItems && (
            <div className="p-4 bg-accent-amber/10 rounded-lg border border-accent-amber/20">
              <div className="flex items-start space-x-2 mb-3">
                <FiInfo className="w-4 h-4 text-accent-amber mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-accent-amber mb-1">
                    ⚠️ Exclusão em Cascata
                  </div>
                  <p className="text-xs text-theme-secondary mb-3">
                    Os seguintes itens também serão excluídos automaticamente:
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {/* Para compositor: mostrar obras */}
                {itemType === 'composer' &&
                  cascadeInfo.works &&
                  cascadeInfo.works.length > 0 && (
                    <div>
                      <p className="font-medium text-theme-primary mb-2 flex items-center">
                        🎼 {cascadeInfo.works.length} obra(s):
                      </p>
                      <div className="space-y-1 max-h-24 overflow-y-auto bg-theme-secondary/30 rounded p-2">
                        {cascadeInfo.works.slice(0, 4).map((work) => (
                          <div
                            key={work.id}
                            className="text-xs text-theme-tertiary flex justify-between"
                          >
                            <span>• {work.title}</span>
                            {work.scoresCount > 0 && (
                              <span className="text-accent-amber">
                                {work.scoresCount} partitura
                                {work.scoresCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        ))}
                        {cascadeInfo.works.length > 4 && (
                          <div className="text-xs text-theme-tertiary">
                            ... e mais {cascadeInfo.works.length - 4} obra(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Para obra: mostrar partituras */}
                {itemType === 'work' &&
                  cascadeInfo.scores &&
                  cascadeInfo.scores.length > 0 && (
                    <div>
                      <p className="font-medium text-theme-primary mb-2 flex items-center">
                        📄 {cascadeInfo.scores.length} partitura(s):
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
                        {cascadeInfo.scores.length > 4 && (
                          <div className="text-xs text-theme-tertiary">
                            ... e mais {cascadeInfo.scores.length - 4}{' '}
                            partitura(s)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Obras filhas */}
                {cascadeInfo.childWorks &&
                  cascadeInfo.childWorks.length > 0 && (
                    <div>
                      <p className="font-medium text-theme-primary mb-2">
                        🎵 {cascadeInfo.childWorks.length} obra(s) filha(s):
                      </p>
                      <div className="space-y-1 max-h-20 overflow-y-auto bg-theme-secondary/30 rounded p-2">
                        {cascadeInfo.childWorks.slice(0, 3).map((childWork) => (
                          <div
                            key={childWork.id}
                            className="text-xs text-theme-tertiary flex justify-between"
                          >
                            <span>• {childWork.title}</span>
                            {childWork.scoresCount > 0 && (
                              <span className="text-accent-amber">
                                {childWork.scoresCount} partitura
                                {childWork.scoresCount > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Total geral */}
                {/* {cascadeInfo.totalScores && cascadeInfo.totalScores >= 0 && (
                  <div className="pt-2 border-t border-accent-amber/20">
                    <p className="text-xs font-medium text-accent-amber">
                      📊 Total: {cascadeInfo.totalScores} partitura(s) serão
                      removidas
                      {cascadeInfo.totalWorks &&
                        cascadeInfo.totalWorks > 0 &&
                        ` • ${cascadeInfo.totalWorks} obra(s) serão removidas`}
                    </p>
                  </div>
                )} */}
              </div>
            </div>
          )}

          {/* No cascade items */}
          {!loadingCascadeInfo &&
            !hasCascadeItems &&
            (itemType === 'composer' || itemType === 'work') && (
              <div className="p-3 bg-accent-green/10 rounded-lg border border-accent-green/20">
                <div className="flex items-center space-x-2">
                  <FiInfo className="w-4 h-4 text-accent-green" />
                  <span className="text-sm text-accent-green">
                    ✅ Nenhum item relacionado será afetado.
                  </span>
                </div>
              </div>
            )}

          {/* Warning for score */}
          {itemType === 'score' && (
            <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <FiAlertTriangle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                <div className="text-sm text-accent-red">
                  <p className="font-medium">Atenção:</p>
                  <p className="mt-1 text-xs">
                    A partitura será removida permanentemente. A obra associada
                    será mantida.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary hover:bg-theme-secondary transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || loadingCascadeInfo}
            className="px-4 py-2 bg-accent-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Deletando...</span>
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                <span>
                  Deletar {typeConfig.label}
                  {hasCascadeItems && (
                    <span className="text-xs opacity-75">
                      {' '}
                      + itens relacionados
                    </span>
                  )}
                </span>
              </>
            )}
          </button>
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
}
