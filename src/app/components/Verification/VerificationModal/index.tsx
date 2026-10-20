'use client';

import { useState } from 'react';
import { PiCheck, PiSealCheck } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { Field } from '@/app/components/ui/Field';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { useToast } from '@/app/hooks/useToast';
import { useTx } from '@/app/hooks/useTx';
import { setVerificationRequest } from '@/app/requests/verification';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentItem: 'work' | 'composer';
  itemId: string;
  composerName: string;
  currentVerificationStatus: boolean;
  onVerificationChange: (verified: boolean) => void;
}

/**
 * The administrator marks a composer or a work as checked, or takes the
 * mark off, with an optional note for the history.
 */
export default function VerificationModal({
  isOpen,
  currentItem,
  onClose,
  itemId,
  composerName,
  currentVerificationStatus,
  onVerificationChange,
}: VerificationModalProps) {
  const tx = useTx();
  const toast = useToast();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const failed = tx(
    'Não foi possível mudar a verificação.',
    'Could not change the verification.'
  );

  const close = () => {
    if (isSubmitting) return;
    setNotes('');
    onClose();
  };

  const submit = async (verified: boolean) => {
    setIsSubmitting(true);
    try {
      const response = await setVerificationRequest(
        currentItem,
        itemId,
        verified,
        notes.trim()
      );
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        toast.error(error.error || failed);
        return;
      }
      toast.success(
        verified
          ? tx('Marcado como verificado.', 'Marked as verified.')
          : tx('Verificação removida.', 'Verification removed.')
      );
      onVerificationChange(verified);
      setNotes('');
      onClose();
    } catch {
      toast.error(failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet
      aberto={isOpen}
      aoFechar={close}
      titulo={tx('Verificação', 'Verification')}
      descricao={composerName}
      largura="m"
      rodape={
        <div className="flex justify-end gap-2">
          <Button variante="fantasma" onClick={close} disabled={isSubmitting}>
            {tx('Cancelar', 'Cancel')}
          </Button>
          {currentVerificationStatus ? (
            <Button
              variante="perigo"
              carregando={isSubmitting}
              onClick={() => void submit(false)}
            >
              {tx('Remover a verificação', 'Remove the verification')}
            </Button>
          ) : (
            <Button
              variante="primario"
              icone={PiCheck}
              carregando={isSubmitting}
              onClick={() => void submit(true)}
            >
              {tx('Marcar como verificado', 'Mark as verified')}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="flex items-center gap-3 rounded-card bg-sup-2 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full tint-ouro text-ouro-na-tinta">
            <Icon de={PiSealCheck} tamanho="m" />
          </span>
          <span className="flex flex-col">
            <span className="t-legenda">{tx('Agora', 'Now')}</span>
            <span className="font-medium">
              {currentVerificationStatus
                ? tx('Verificado', 'Verified')
                : tx('Não verificado', 'Not verified')}
            </span>
          </span>
        </p>
        <Field.Area
          label={tx('Nota (opcional)', 'Note (optional)')}
          ajuda={tx(
            'Fica no histórico, para quem conferir depois.',
            'Kept in the history, for whoever checks later.'
          )}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Sheet>
  );
}
