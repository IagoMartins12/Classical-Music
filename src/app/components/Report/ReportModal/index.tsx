// app/components/Report/ReportModal.tsx
'use client';

import { useState } from 'react';
import { FiFlag, FiX, FiAlertTriangle } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Modal from '../../Modal';
import { useToast } from '@/app/hooks/useToast';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
}

const REPORT_REASONS = [
  {
    value: 'inappropriate_content',
    label: 'Conteúdo inadequado',
    description: 'Conteúdo ofensivo ou impróprio',
  },
  {
    value: 'copyright_violation',
    label: 'Violação de direitos autorais',
    description: 'Uso não autorizado de material protegido',
  },
  {
    value: 'false_information',
    label: 'Informações falsas',
    description: 'Dados incorretos ou enganosos',
  },
  {
    value: 'spam',
    label: 'Spam',
    description: 'Conteúdo repetitivo ou não relacionado',
  },
  {
    value: 'duplicate_content',
    label: 'Conteúdo duplicado',
    description: 'Item já existe na plataforma',
  },
  {
    value: 'other',
    label: 'Outros',
    description: 'Outro motivo não listado',
  },
];

export default function ReportModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toaster = useToast();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReason) {
      toaster.error('Erro', 'Por favor, selecione um motivo');
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
        toaster.error(error.error || 'Erro ao enviar report');
      }
    } catch (error) {
      toaster.error('Erro ao enviar report');
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

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case 'composer':
        return 'compositor';
      case 'work':
        return 'obra';
      case 'score':
        return 'partitura';
      default:
        return 'item';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick maxWidth="3xl">
      <AnimatedItem direction="scale" springType="bouncy">
        <div className="  w-full ">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-red/20 rounded-xl flex items-center justify-center">
                <FiFlag className="w-5 h-5 text-accent-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Reportar {getEntityTypeLabel()}
                </h2>
                <p className="text-sm text-theme-secondary">"{entityName}"</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Reason Selection */}
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-3">
                Motivo do report *
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
                Descrição adicional
                {selectedReason === 'other' && ' *'}
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
                    Importante
                  </p>
                  <p className="text-theme-secondary">
                    Reports falsos ou mal-intencionados podem resultar em
                    penalidades na sua conta. Use esta função apenas para
                    reportar problemas legítimos.
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
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !selectedReason}
                leftIcon={<FiFlag />}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Report'}
              </Button>
            </div>
          </form>
        </div>
      </AnimatedItem>
    </Modal>
  );
}
