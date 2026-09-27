// ==================== app/components/calendar/ConfirmDeleteVenueModal.tsx ====================
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PiTrash, PiWarning } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import Modal from '@/app/components/Modal';

export default function ConfirmDeleteVenueModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  venueName,
  eventCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  venueName: string;
  eventCount?: number;
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

  const hasEvents = eventCount && eventCount > 0;

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      <Inline gap={3} className="mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center">
          <PiWarning className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-theme-primary">
            {hasEvents ? 'Não é Possível Deletar' : 'Confirmar Exclusão'}
          </h3>
          <Text papel="rotulo" tom="suave" as="p">
            {hasEvents
              ? 'Este local possui eventos associados'
              : 'Esta ação não pode ser desfeita'}
          </Text>
        </div>
      </Inline>

      <div className="mb-6">
        {hasEvents ? (
          <>
            <p className="text-theme-secondary">
              O local <strong>&quot;{venueName}&quot;</strong> possui{' '}
              <strong>{eventCount} evento(s)</strong> associado(s).
            </p>
            <Text papel="rotulo" tom="fraco" as="p" className="mt-2">
              Para deletar este local, primeiro remova ou transfira todos os
              eventos associados.
            </Text>
          </>
        ) : (
          <>
            <p className="text-theme-secondary">
              Tem certeza que deseja deletar o local{' '}
              <strong>&quot;{venueName}&quot;</strong>?
            </p>
            <Text papel="rotulo" tom="fraco" as="p" className="mt-2">
              Todos os dados relacionados ao local serão permanentemente
              removidos.
            </Text>
          </>
        )}
      </div>

      <Inline gap={3} className="justify-end">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary transition-colors disabled:opacity-50"
        >
          {hasEvents ? 'Entendi' : 'Cancelar'}
        </button>
        {!hasEvents && (
          <Inline
            as="button"
            gap={2}
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
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
        )}
      </Inline>
    </Modal>
  );

  return createPortal(modalContent, document.body);
}
