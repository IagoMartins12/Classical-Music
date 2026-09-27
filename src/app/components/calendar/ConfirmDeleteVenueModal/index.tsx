// ==================== app/components/calendar/ConfirmDeleteVenueModal.tsx ====================
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '@/app/components/ConfirmModal';

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

  if (!mounted || !isOpen) return null;

  const hasEvents = eventCount && eventCount > 0;

  const modalContent = (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      type={hasEvents ? 'warning' : 'danger'}
      semConfirmar={!!hasEvents}
      title={hasEvents ? 'Não é Possível Deletar' : 'Confirmar Exclusão'}
      cancelText={hasEvents ? 'Entendi' : 'Cancelar'}
      confirmText="Deletar"
      message={
        hasEvents ? (
          <>
            O local{' '}
            <strong className="text-texto">&quot;{venueName}&quot;</strong>{' '}
            possui{' '}
            <strong className="text-texto">{eventCount} evento(s)</strong>{' '}
            associado(s). Para deletar este local, primeiro remova ou transfira
            todos os eventos associados.
          </>
        ) : (
          <>
            Tem certeza que deseja deletar o local{' '}
            <strong className="text-texto">&quot;{venueName}&quot;</strong>?
            Todos os dados relacionados ao local serão permanentemente
            removidos.
          </>
        )
      }
    />
  );

  return createPortal(modalContent, document.body);
}
