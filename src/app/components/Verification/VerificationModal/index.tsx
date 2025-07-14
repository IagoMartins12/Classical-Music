// app/components/Verification/VerificationModal.tsx
'use client';

import { useState } from 'react';
import { FiCheck, FiShield } from 'react-icons/fi';
import { useNotifications } from '@/app/hooks/useNotifications';
import Button from '@/app/components/Common/Button';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Modal from '../../Modal';

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
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { notifySuccess, notifyError } = useNotifications();

  const handleSubmit = async (verified: boolean) => {
    setIsSubmitting(true);

    try {
      let response: Response;
      if (currentItem === 'composer') {
        response = await fetch(`/api/composers/${itemId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verified,
            notes: notes.trim(),
          }),
        });
      } else {
        response = await fetch(`/api/works/${itemId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verified,
            notes: notes.trim(),
          }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        notifySuccess('Sucesso', data.message);
        onVerificationChange(verified);
        onClose();
        setNotes('');
      } else {
        const error = await response.json();
        notifyError('Erro', error.error || 'Erro ao alterar verificação');
      }
    } catch (error) {
      console.error('Erro ao alterar verificação:', error);
      notifyError('Erro', 'Erro ao alterar verificação');
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                <FiShield className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Verificação de Compositor
                </h2>
                <p className="text-sm text-theme-secondary">{composerName}</p>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="mb-6">
            <div className="p-3 bg-theme-secondary rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-theme-tertiary">
                  Status atual:
                </span>
                <span
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    currentVerificationStatus
                      ? 'bg-accent-blue/20 text-accent-blue'
                      : 'bg-theme-tertiary text-theme-secondary'
                  }`}
                >
                  {currentVerificationStatus ? (
                    <>
                      <FiCheck className="w-3 h-3" />
                      <span>Verificado</span>
                    </>
                  ) : (
                    <span>Não verificado</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione notas sobre esta verificação..."
              rows={3}
              className="input-classical w-full resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            {currentVerificationStatus ? (
              <Button
                variant="delete"
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Removendo...' : 'Remover Verificação'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                leftIcon={<FiCheck />}
              >
                {isSubmitting ? 'Verificando...' : 'Verificar'}
              </Button>
            )}
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
}
