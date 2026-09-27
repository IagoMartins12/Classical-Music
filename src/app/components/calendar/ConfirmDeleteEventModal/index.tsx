// ==================== app/components/calendar/ConfirmDeleteEventModal.tsx ====================
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { PiTrash, PiWarning } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

export default function ConfirmDeleteEventModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  eventTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  eventTitle: string;
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
    <div className="fixed inset-0 z-dialogo flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoading ? onClose : undefined}
      />

      <AnimatedCard
        hover="none"
        className="relative bg-theme-primary rounded-xl shadow-xl max-w-md w-full p-6 border border-theme-secondary"
      >
        <Inline gap={3} className="mb-4">
          <div className="w-12 h-12 bg-erro/10 rounded-xl flex items-center justify-center">
            <PiWarning className="w-6 h-6 text-erro" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-primary">
              Confirmar Exclusão
            </h3>
            <Text papel="rotulo" tom="suave" as="p">
              Esta ação não pode ser desfeita
            </Text>
          </div>
        </Inline>

        <div className="mb-6">
          <p className="text-theme-secondary">
            Tem certeza que deseja deletar o evento{' '}
            <strong>&quot;{eventTitle}&quot;</strong>?
          </p>
          <Text papel="rotulo" tom="fraco" as="p" className="mt-2">
            Todos os dados relacionados ao evento serão permanentemente
            removidos.
          </Text>
        </div>

        <Inline gap={3} className="justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary hover:bg-sup-1 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <Inline
            as="button"
            gap={2}
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-erro text-white rounded-lg hover:bg-erro transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Deletando...</span>
              </>
            ) : (
              <>
                <PiTrash className="w-4 h-4" />
                <span>Deletar</span>
              </>
            )}
          </Inline>
        </Inline>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
}
