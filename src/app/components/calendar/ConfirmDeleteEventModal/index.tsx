'use client';

import ConfirmModal from '@/app/components/ConfirmModal';

/**
 * Confirmação de apagar evento. O `ConfirmModal` já abre na camada de topo
 * (é um `<dialog>`); o portal e o "montado?" que havia aqui eram de antes
 * disso.
 */
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
  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      type="danger"
      title="Apagar o evento?"
      confirmText="Apagar"
      message={
        <>
          <strong className="text-texto">{eventTitle}</strong> sai da agenda.
          Não dá para desfazer.
        </>
      }
    />
  );
}
