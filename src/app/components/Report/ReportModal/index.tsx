// app/components/Report/ReportModal.tsx
'use client';

import { useState } from 'react';
import { FiFlag, FiAlertTriangle } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Modal from '../../Modal';
import { useToast } from '@/app/hooks/useToast';
import { useTranslation } from '@/app/hooks/useTranslation';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
}

export default function ReportModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}: ReportModalProps) {
  const { t, language } = useTranslation({
    sections: ['components/reportModal'],
  });
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toaster = useToast();

  // Traduções dos motivos de report
  const REPORT_REASONS = [
    {
      value: 'inappropriate_content',
      label: t('report_reason_inappropriate'),
      description: t('report_reason_inappropriate_desc'),
    },
    {
      value: 'copyright_violation',
      label: t('report_reason_copyright'),
      description: t('report_reason_copyright_desc'),
    },
    {
      value: 'false_information',
      label: t('report_reason_false_info'),
      description: t('report_reason_false_info_desc'),
    },
    {
      value: 'spam',
      label: t('report_reason_spam'),
      description: t('report_reason_spam_desc'),
    },
    {
      value: 'duplicate_content',
      label: t('report_reason_duplicate'),
      description: t('report_reason_duplicate_desc'),
    },
    {
      value: 'other',
      label: t('report_reason_other'),
      description: t('report_reason_other_desc'),
    },
  ];

  const getEntityTypeLabel = () => {
    const mapping = {
      pt: {
        composer: 'Compositor',
        work: 'Peça',
        score: 'Partitura',
      },
      en: {
        composer: 'Composer',
        work: 'Work',
        score: 'Score',
      },
    };

    return mapping[language][entityType];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toaster.error('Erro', t('report_modal_selecione_motivo'));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entityType,
          entityId,
          reason: selectedReason,
          description: description.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toaster.success(data.message);
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        toaster.error(error.error || t('report_modal_erro_enviar'));
      }
    } catch (error) {
      console.log('error', error);
      toaster.error(t('report_modal_erro_enviar'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedReason('');
    setDescription('');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick maxWidth="3xl">
      <AnimatedItem direction="scale" springType="bouncy">
        <div className="w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center">
                <FiFlag className="w-5 h-5 text-accent-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  {t('report_modal_titulo')} {getEntityTypeLabel()}
                </h2>
                <p className="text-sm text-theme-secondary">
                  &quot;{entityName}&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-3">
                {t('report_modal_motivo')}
              </label>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedReason === reason.value
                        ? 'border-accent-red bg-accent-red/5'
                        : 'border-theme-secondary hover:border-theme-primary hover:bg-theme-secondary'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason.value}
                      checked={selectedReason === reason.value}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-theme-primary">
                        {reason.label}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {reason.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                {selectedReason === 'other'
                  ? t('report_modal_descricao_obrigatoria')
                  : t('report_modal_descricao')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o problema com mais detalhes..."
                rows={4}
                className="input-classical w-full resize-none"
                required={selectedReason === 'other'}
              />
            </div>

            {/* Warning */}
            <div className="p-4 bg-accent-amber/10 border border-accent-amber/30 rounded-lg">
              <div className="flex items-start space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent-amber mb-1">
                    {t('report_modal_importante')}
                  </p>
                  <p className="text-theme-secondary">
                    {t('report_modal_aviso')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                {t('report_modal_cancelar')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !selectedReason}
                leftIcon={<FiFlag />}
              >
                {isSubmitting
                  ? t('report_modal_enviando')
                  : t('report_modal_enviar')}
              </Button>
            </div>
          </form>
        </div>
      </AnimatedItem>
    </Modal>
  );
}
