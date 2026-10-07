'use client';

import { useState } from 'react';
import ConfirmModal from '@/app/components/ConfirmModal';
import { Field } from '@/app/components/ui/Field';

/**
 * Confirmação com frase: o `ConfirmModal` de sempre, mais um campo onde se
 * digita a palavra-chave. O botão só destrava com a frase exata — não há
 * mensagem de erro a mostrar, porque não há como confirmar errado.
 *
 * Era um modal próprio, com vermelho, âmbar e azul por tipo, um quadro de
 * "Atenção!" com três avisos genéricos e um botão feito à mão.
 */

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  keyword: string;
  placeholder?: string;
  isLoading?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  keyword,
  placeholder,
  isLoading = false,
  type = 'danger',
}: ConfirmationModalProps) {
  const [frase, setFrase] = useState('');

  const fechar = () => {
    setFrase('');
    onClose();
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={fechar}
      onConfirm={onConfirm}
      title={title}
      message={message}
      type={type}
      confirmText="Confirmar"
      isLoading={isLoading}
      confirmarBloqueado={frase !== keyword}
    >
      <Field
        label={`Para confirmar, digite ${keyword}`}
        value={frase}
        onChange={(e) => setFrase(e.target.value)}
        placeholder={placeholder ?? keyword}
        autoComplete="off"
        spellCheck={false}
        autoFocus
        disabled={isLoading}
      />
    </ConfirmModal>
  );
}
