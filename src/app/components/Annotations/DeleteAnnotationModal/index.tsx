import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { PiTrash, PiWarning } from 'react-icons/pi';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <PiWarning className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-theme-primary">
              {t('delete_modal_confirm_deletion')}
            </h3>
            <Text papel="rotulo" tom="suave" as="p">
              {t('delete_modal_cannot_be_undone')}
            </Text>
          </div>
        </Inline>

        <div className="mb-6">
          <p className="text-theme-secondary">
            {t('delete_modal_confirm_question')}{' '}
            <strong>&quot;{annotationTitle}&quot;</strong>?
          </p>
        </div>

        <Inline gap={3} className="justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-theme-secondary text-theme-secondary transition-colors disabled:opacity-50"
          >
            {t('delete_modal_cancel')}
          </button>
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
                <span>{t('delete_modal_deleting')}</span>
              </>
            ) : (
              <>
                <PiTrash className="w-4 h-4" />
                <span>{t('delete_modal_delete')}</span>
              </>
            )}
          </Inline>
        </Inline>
      </AnimatedCard>
    </div>
  );

  return createPortal(modalContent, document.body);
}
