// app/components/Verification/VerificationModal.tsx
'use client';

import { useState } from 'react';
import { PiCheck, PiShield } from 'react-icons/pi';
import Button from '@/app/components/Common/Button';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Modal from '../../Modal';
import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';
import { setVerificationRequest } from '@/app/requests/verification';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: 'work' | 'composer';
  itemId: string;
  composerName: string;
  currentVerificationStatus: boolean;
  onVerificationChange: (verified: boolean) => void;
}

export default function VerificationModal({
  isOpen,
  currentItem,
  onClose,
  itemId,
  composerName,
  currentVerificationStatus,
  onVerificationChange,
}: VerificationModalProps) {
  const { t } = useTranslation({ sections: ['pages/workId'] });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const handleSubmit = async (verified: boolean) => {
    setIsSubmitting(true);

    try {
      const response = await setVerificationRequest(
        currentItem,
        itemId,
        verified,
        notes.trim()
      );

      if (response.ok) {
        const data = await response.json();
        toast.success(t('verification_modal_sucesso'), data.message);
        onVerificationChange(verified);
        onClose();
        setNotes('');
      } else {
        const error = await response.json();
        toast.error(
          t('verification_modal_erro'),
          error.error || t('verification_modal_erro_alterar')
        );
      }
    } catch (error) {
      console.error('Erro ao alterar verificação:', error);
      toast.error(
        t('verification_modal_erro'),
        t('verification_modal_erro_alterar')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setNotes('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick>
      <AnimatedItem direction="scale" springType="bouncy">
        <div className="">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Inline gap={3}>
              <div className="w-10 h-10 bg-aviso/20 rounded-xl flex items-center justify-center">
                <PiShield className="w-5 h-5 text-aviso" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  {t('verification_modal_titulo')}
                </h2>
                <Text papel="rotulo" tom="suave" as="p">
                  {composerName}
                </Text>
              </div>
            </Inline>
          </div>

          {/* Current Status */}
          <div className="mb-6">
            <div className="p-3 bg-theme-secondary rounded-lg">
              <Inline gap={2}>
                <Text papel="rotulo" tom="fraco" className="font-medium">
                  {t('verification_modal_status_atual')}
                </Text>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    currentVerificationStatus
                      ? 'bg-aviso/10 text-aviso'
                      : 'bg-theme-tertiary text-theme-secondary'
                  }`}
                >
                  {currentVerificationStatus ? (
                    <>
                      <PiCheck className="w-3 h-3" />
                      <span>{t('verification_modal_verificado')}</span>
                    </>
                  ) : (
                    <span>{t('verification_modal_nao_verificado')}</span>
                  )}
                </span>
              </Inline>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <Field.Area
              label={t('verification_modal_notas')}
              classeCampo="resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('verification_modal_placeholder')}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t('verification_modal_cancelar')}
            </Button>

            {currentVerificationStatus ? (
              <Button
                variant="delete"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t('verification_modal_removendo')
                  : t('verification_modal_remover')}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                leftIcon={<PiCheck />}
              >
                {isSubmitting
                  ? t('verification_modal_verificando')
                  : t('verification_modal_verificar')}
              </Button>
            )}
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
}
