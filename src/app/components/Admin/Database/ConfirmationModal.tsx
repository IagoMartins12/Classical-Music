// app/components/Admin/Database/ConfirmationModal.tsx
'use client';

import { useState } from 'react';
import { PiWarning } from 'react-icons/pi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import { Inline } from '@/app/components/ui/Layout';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  const isValid = inputValue === keyword;

  const handleConfirm = () => {
    if (!isValid) {
      setError(`Você deve digitar "${keyword}" para confirmar`);
      return;
    }

    onConfirm();
  };

  const handleClose = () => {
    setInputValue('');
    setError('');
    onClose();
  };

  const colors = {
    danger: {
      bg: 'bg-erro/10',
      border: 'border-erro/20',
      text: 'text-erro',
      button: 'bg-erro hover:bg-erro',
    },
    warning: {
      bg: 'bg-atencao/10',
      border: 'border-atencao/20',
      text: 'text-atencao',
      button: 'bg-atencao hover:bg-atencao',
    },
    info: {
      bg: 'bg-aviso/10',
      border: 'border-aviso/20',
      text: 'text-aviso',
      button: 'bg-aviso hover:bg-aviso',
    },
  };

  const colorScheme = colors[type];

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="md">
      <div className="p-6">
        {/* Header com ícone */}
        <div className="flex items-start space-x-4 mb-6">
          <div
            className={`w-12 h-12 ${colorScheme.bg} rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <PiWarning className={`w-6 h-6 ${colorScheme.text}`} />
          </div>
          <div className="flex-1">
            <h2 className={`text-xl font-bold ${colorScheme.text} mb-2`}>
              {title}
            </h2>
            <p className="text-theme-secondary">{message}</p>
          </div>
        </div>

        {/* Input de confirmação */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              Para confirmar, digite:{' '}
              <span className="font-mono font-bold text-theme-primary">
                {keyword}
              </span>
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              placeholder={placeholder || `Digite ${keyword}`}
              className={error ? 'border-erro' : ''}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <Inline as="p" gap={1} className="text-sm text-erro mt-2">
                <PiWarning className="w-4 h-4" />
                <span>{error}</span>
              </Inline>
            )}
          </div>

          {/* Avisos adicionais */}
          <div
            className={`p-4 rounded-lg border ${colorScheme.border} ${colorScheme.bg}`}
          >
            <div className="flex items-start space-x-2">
              <PiWarning className={`w-5 h-5 ${colorScheme.text} mt-0.5`} />
              <div className="flex-1">
                <p className={`text-sm font-medium ${colorScheme.text} mb-1`}>
                  Atenção!
                </p>
                <ul className="text-sm text-theme-secondary space-y-1">
                  <li>• Esta ação não pode ser desfeita</li>
                  <li>• Os dados podem ser permanentemente perdidos</li>
                  <li>• Verifique se você está certo antes de confirmar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <Inline gap={3} className="justify-end mt-6">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <button
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              colorScheme.button
            } ${isValid && !isLoading ? 'shadow-lg' : ''}`}
          >
            {isLoading ? 'Processando...' : 'Confirmar'}
          </button>
        </Inline>
      </div>
    </Modal>
  );
}
