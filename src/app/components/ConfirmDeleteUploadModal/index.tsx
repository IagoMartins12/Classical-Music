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
} from 'react-icons/fi';

interface ConfirmDeleteUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  itemTitle: string;
  itemType: 'composer' | 'work' | 'score';
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
}: ConfirmDeleteUploadModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const typeConfig = TYPE_CONFIG[itemType];
  const TypeIcon = typeConfig.icon;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
      />

      <AnimatedCard
        hover="none"
        className="relative bg-theme-primary rounded-xl shadow-xl max-w-md w-full p-6 border border-theme-secondary"
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

        <div className="mb-6">
          <p className="text-theme-secondary mb-2">
            Tem certeza que deseja deletar{' '}
            {typeConfig.label === 'obra' ? 'a' : 'o'} {typeConfig.label}{' '}
            <strong>&quot;{itemTitle}&quot;</strong>?
          </p>

          <div className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-3 mt-3">
            <div className="flex items-start space-x-2">
              <FiAlertTriangle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
              <div className="text-sm text-accent-red">
                <p className="font-medium">Atenção:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  {itemType === 'composer' && (
                    <>
                      <li>• Todas as obras associadas serão mantidas</li>
                      <li>• O compositor será removido permanentemente</li>
                    </>
                  )}
                  {itemType === 'work' && (
                    <>
                      <li>• Todas as partituras associadas serão mantidas</li>
                      <li>• A obra será removida permanentemente</li>
                    </>
                  )}
                  {itemType === 'score' && (
                    <>
                      <li>• A partitura será removida permanentemente</li>
                      <li>• A obra associada será mantida</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
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
            disabled={isLoading}
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
                <span>Deletar {typeConfig.label}</span>
              </>
            )}
          </button>
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
}
