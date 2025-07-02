import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  annotationTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  annotationTitle: string;
}) {
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
          <div className="w-12 h-12 bg-accent-red/10 rounded-xl flex items-center justify-center">
            <FiAlertTriangle className="w-6 h-6 text-accent-red" />
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
          <p className="text-theme-secondary">
            Tem certeza que deseja deletar a anotação{' '}
            <strong>&quot;{annotationTitle}&quot;</strong>?
          </p>
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
                <span>Deletar</span>
              </>
            )}
          </button>
        </div>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
}
