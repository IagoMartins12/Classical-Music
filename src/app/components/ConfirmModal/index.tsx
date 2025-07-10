// app/components/Common/ConfirmModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatedCard, AnimatedItem } from '../animation/AnimatedComponents';
import {
  FiAlertTriangle,
  FiTrash2,
  FiCheck,
  FiX,
  FiInfo,
  FiHelpCircle,
  FiLoader,
} from 'react-icons/fi';
import Button from '../Common/Button';

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
    icon: FiTrash2,
    color: 'text-accent-red',
    bgColor: 'bg-accent-red/10',
    borderColor: 'border-accent-red/30',
    buttonVariant: 'delete' as const,
    defaultConfirmText: 'Deletar',
  },
  warning: {
    icon: FiAlertTriangle,
    color: 'text-accent-amber',
    bgColor: 'bg-accent-amber/10',
    borderColor: 'border-accent-amber/30',
    buttonVariant: 'primary' as const,
    defaultConfirmText: 'Continuar',
  },
  info: {
    icon: FiInfo,
    color: 'text-accent-blue',
    bgColor: 'bg-accent-blue/10',
    borderColor: 'border-accent-blue/30',
    buttonVariant: 'primary' as const,
    defaultConfirmText: 'OK',
  },
  question: {
    icon: FiHelpCircle,
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
    borderColor: 'border-brand-primary/30',
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={!isLoadingState ? onClose : undefined}
      />

      <AnimatedItem direction="scale" springType="bouncy" className="relative">
        <AnimatedCard
          hover="none"
          className="relative bg-theme-primary rounded-xl shadow-xl max-w-md w-full p-6 border border-theme-secondary"
        >
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${config.bgColor} ${config.borderColor} border
              `}
            >
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-theme-primary">{title}</h3>
              <p className="text-sm text-theme-secondary">
                {type === 'danger' && 'Esta ação não pode ser desfeita'}
                {type === 'warning' && 'Verifique antes de continuar'}
                {type === 'info' && 'Informação importante'}
                {type === 'question' && 'Confirme sua escolha'}
              </p>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-theme-secondary leading-relaxed">{message}</p>
          </div>

          {/* Additional content */}
          {children && <div className="mb-6">{children}</div>}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isLoadingState}
            >
              {cancelText}
            </Button>

            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              disabled={isLoadingState}
              leftIcon={
                isLoadingState ? (
                  <FiLoader className="animate-spin" />
                ) : type === 'danger' ? (
                  <FiTrash2 />
                ) : type === 'question' ? (
                  <FiCheck />
                ) : undefined
              }
            >
              {isLoadingState ? 'Processando...' : finalConfirmText}
            </Button>
          </div>
        </AnimatedCard>
      </AnimatedItem>
    </div>
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
