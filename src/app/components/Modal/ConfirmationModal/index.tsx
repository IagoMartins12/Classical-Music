// components/ui/ConfirmationModal.tsx - MODAL DE CONFIRMAÇÃO CUSTOMIZADO TRADUZIDO
'use client';

import { CONFIRMACAO } from '@/app/conteudo/textos/confirmacao';
import { useTextos } from '@/app/hooks/useTextos';
import React from 'react';
import ConfirmModal from '@/app/components/ConfirmModal';
import { ConfirmationConfig } from '@/app/hooks/useModalConfirmation';
import { Stack } from '@/app/components/ui/Layout';

interface ConfirmationModalProps {
  isOpen: boolean;
  config: ConfirmationConfig;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  config,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const { t, ready } = useTextos(CONFIRMACAO);

  // 🎯 CONFIGURAÇÕES PADRÃO BASEADAS NO TIPO - AGORA TRADUZIDAS
  const getDefaultConfig = (type: ConfirmationConfig['type']) => {
    switch (type) {
      case 'unsaved-changes':
        return {
          title: t('unsaved_changes_title'),
          message: t('unsaved_changes_message'),
          confirmLabel: t('unsaved_changes_confirm'),
          cancelLabel: t('unsaved_changes_cancel'),
          confirmVariant: 'danger' as const,
        };

      case 'ongoing-process':
        return {
          title: t('ongoing_process_title'),
          message: config.processName
            ? t('ongoing_process_message').replace(
                '{processName}',
                config.processName
              )
            : t('ongoing_process_message_generic'),
          confirmLabel: t('ongoing_process_confirm'),
          cancelLabel: t('ongoing_process_cancel'),
          confirmVariant: 'danger' as const,
        };

      case 'danger':
        return {
          title: t('danger_title'),
          message: t('danger_message'),
          confirmLabel: t('danger_confirm'),
          cancelLabel: t('danger_cancel'),
          confirmVariant: 'danger' as const,
        };

      case 'custom':
      default:
        return {
          title: t('custom_title'),
          message: t('custom_message'),
          confirmLabel: t('custom_confirm'),
          cancelLabel: t('custom_cancel'),
          confirmVariant: 'primary' as const,
        };
    }
  };

  const defaultConfig = getDefaultConfig(config.type);
  const finalConfig = { ...defaultConfig, ...config };

  const caixa = (titulo: string, texto: React.ReactNode) => (
    <Stack gap={1} className="rounded-lg bg-sup-2 p-4">
      <p className="t-rotulo font-medium text-texto">{titulo}</p>
      <p className="t-rotulo text-texto-suave">{texto}</p>
    </Stack>
  );

  // Its few words are not here yet: the dialog waits a moment, keyless.
  if (!ready) return null;

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={onCancel}
      onConfirm={onConfirm}
      isLoading={isLoading}
      type={
        config.type === 'danger'
          ? 'danger'
          : config.type === 'custom' || !config.type
            ? 'question'
            : 'warning'
      }
      acaoPerigosa={finalConfig.confirmVariant === 'danger'}
      title={finalConfig.title}
      message={finalConfig.message}
      cancelText={finalConfig.cancelLabel}
      confirmText={finalConfig.confirmLabel}
    >
      {config?.type === 'ongoing-process' &&
        caixa(
          t('process_active_title'),
          config?.processName
            ? t('process_active_description').replace(
                '{processName}',
                config.processName
              )
            : t('process_active_description_generic')
        )}
      {config?.type === 'unsaved-changes' &&
        caixa(t('changes_detected_title'), t('changes_detected_description'))}
      {config?.type === 'general-no-verification' &&
        caixa(t('possible_changes_title'), t('possible_changes_description'))}
    </ConfirmModal>
  );
};

export default ConfirmationModal;
