// ==================== app/components/calendar/ConfirmDeleteEventModal.tsx ====================
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmModal from '@/app/components/ConfirmModal';

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

  if (!mounted || !isOpen) return null;

  const modalContent = (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      type="danger"
      title="Confirmar Exclusão"
      confirmText="Deletar"
      message={
        <>
          Tem certeza que deseja deletar o evento{' '}
          <strong className="text-texto">&quot;{eventTitle}&quot;</strong>?
          Todos os dados relacionados ao evento serão permanentemente removidos.
        </>
      }
    />
  );

  return createPortal(modalContent, document.body);
}
