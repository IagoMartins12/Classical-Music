// app/components/Common/ConfirmModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  PiCheck,
  PiInfo,
  PiQuestion,
  PiSpinnerGap,
  PiTrash,
  PiWarning,
} from 'react-icons/pi';
import Button from '../Common/Button';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import Modal from '@/app/components/Modal';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'question';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  children?: React.ReactNode; // Para conteúdo adicional
}

const TYPE_CONFIG = {
  danger: {
    icon: PiTrash,
    color: '',
    bgColor: '',
    borderColor: '',
    buttonVariant: 'delete' as const,
    defaultConfirmText: 'Deletar',
  },
  warning: {
    icon: PiWarning,
    color: '',
    bgColor: '',
    borderColor: '',
    buttonVariant: 'primary' as const,
    defaultConfirmText: 'Continuar',
  },
  info: {
    icon: PiInfo,
    color: '',
    bgColor: '',
    borderColor: '',
    buttonVariant: 'primary' as const,
    defaultConfirmText: 'OK',
  },
  question: {
    icon: PiQuestion,
    color: 'text-ouro-texto',
    bgColor: '',
    borderColor: '',
    buttonVariant: 'primary' as const,
    defaultConfirmText: 'Sim',
  },
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'question',
  confirmText,
  cancelText = 'Cancelar',
  isLoading = false,
  children,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);
  const [processing, setProcessing] = useState(false);

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

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      await onConfirm();
    } finally {
      setProcessing(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  const finalConfirmText = confirmText || config.defaultConfirmText;
  const isLoadingState = isLoading || processing;

  const modalContent = (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      showCloseButton={false}
    >
      {/* Header */}
      <Inline gap={3} className="mb-4">
        <div
          className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${config?.bgColor} ${config?.borderColor} border
              `}
        >
          <Icon className={`w-6 h-6 ${config?.color}`} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
          <Text papel="rotulo" tom="suave" as="p">
            {type === 'danger' && 'Esta ação não pode ser desfeita'}
            {type === 'warning' && 'Verifique antes de continuar'}
            {type === 'info' && 'Informação importante'}
            {type === 'question' && 'Confirme sua escolha'}
          </Text>
        </div>
      </Inline>

      {/* Message */}
      <div className="mb-6">
        <p className="text-theme-secondary leading-relaxed">{message}</p>
      </div>

      {/* Additional content */}
      {children && <div className="mb-6">{children}</div>}

      {/* Actions */}
      <Inline gap={3} className="justify-end">
        <Button variant="secondary" onClick={onClose} disabled={isLoadingState}>
          {cancelText}
        </Button>

        <Button
          variant={config?.buttonVariant}
          onClick={handleConfirm}
          disabled={isLoadingState}
          leftIcon={
            isLoadingState ? (
              <PiSpinnerGap className="animate-spin" />
            ) : type === 'danger' ? (
              <PiTrash />
            ) : type === 'question' ? (
              <PiCheck />
            ) : undefined
          }
        >
          {isLoadingState ? 'Processando...' : finalConfirmText}
        </Button>
      </Inline>
    </Modal>
  );

  return createPortal(modalContent, document.body);
}

// Hook para usar o modal de confirmação de forma mais simples
export const useConfirmModal = () => {
  const [modalProps, setModalProps] = useState<ConfirmModalProps | null>(null);

  const confirm = (props: Omit<ConfirmModalProps, 'isOpen' | 'onClose'>) => {
    return new Promise<boolean>((resolve) => {
      setModalProps({
        ...props,
        isOpen: true,
        onClose: () => {
          setModalProps(null);
          resolve(false);
        },
        onConfirm: async () => {
          try {
            await props.onConfirm();
            setModalProps(null);
            resolve(true);
          } catch (error) {
            console.error('Erro na confirmação:', error);
            setModalProps(null);
            resolve(false);
          }
        },
      });
    });
  };

  const ConfirmModalComponent = modalProps ? (
    <ConfirmModal {...modalProps} />
  ) : null;

  return {
    confirm,
    ConfirmModalComponent,
  };
};
