import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@/app/hooks/useTranslation';
import ConfirmModal from '@/app/components/ConfirmModal';

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
  const { t } = useTranslation({ sections: ['pages/annotations'] });
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
    <ConfirmModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      type="danger"
      title={t('delete_modal_confirm_deletion')}
      cancelText={t('delete_modal_cancel')}
      confirmText={t('delete_modal_delete')}
      message={
        <>
          {t('delete_modal_confirm_question')}{' '}
          <strong className="text-texto">&quot;{annotationTitle}&quot;</strong>?{' '}
          {t('delete_modal_cannot_be_undone')}.
        </>
      }
    />
  );

  return createPortal(modalContent, document.body);
}
