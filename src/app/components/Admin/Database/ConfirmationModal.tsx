// app/components/Admin/Database/ConfirmationModal.tsx
'use client';

import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';

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
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      text: 'text-red-500',
      button: 'bg-red-500 hover:bg-red-600',
    },
    warning: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      button: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      button: 'bg-blue-500 hover:bg-blue-600',
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
            <FiAlertTriangle className={`w-6 h-6 ${colorScheme.text}`} />
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
              className={error ? 'border-red-500' : ''}
              autoFocus
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-500 mt-2 flex items-center space-x-1">
                <FiAlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Avisos adicionais */}
          <div
            className={`p-4 rounded-lg border ${colorScheme.border} ${colorScheme.bg}`}
          >
            <div className="flex items-start space-x-2">
              <FiAlertTriangle
                className={`w-5 h-5 ${colorScheme.text} mt-0.5`}
              />
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
        <div className="flex items-center justify-end space-x-3 mt-6">
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
        </div>
      </div>
    </Modal>
  );
}
