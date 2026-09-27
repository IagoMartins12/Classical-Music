// components/ui/ConfirmationModal.tsx - MODAL DE CONFIRMAÇÃO CUSTOMIZADO TRADUZIDO
'use client';

import React from 'react';
import { PiFloppyDisk, PiTrash, PiWarning, PiX } from 'react-icons/pi';
import Modal from '..';
import Button from '../../Common/Button';
import { ConfirmationConfig } from '@/app/hooks/useModalConfirmation';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Stack, Inline } from '@/app/components/ui/Layout';

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
  const { t } = useTranslation({
    sections: ['components/confimationModal'],
  });

  // 🎯 CONFIGURAÇÕES PADRÃO BASEADAS NO TIPO - AGORA TRADUZIDAS
  const getDefaultConfig = (type: ConfirmationConfig['type']) => {
    switch (type) {
      case 'unsaved-changes':
        return {
          title: t('unsaved_changes_title'),
          message: t('unsaved_changes_message'),
          confirmLabel: t('unsaved_changes_confirm'),
          cancelLabel: t('unsaved_changes_cancel'),
          icon: (
            <div className="w-12 h-12 bg-atencao rounded-full flex items-center justify-center">
              <PiWarning className="w-6 h-6 text-white" />
            </div>
          ),
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
          icon: (
            <div className="w-12 h-12 bg-erro rounded-full flex items-center justify-center">
              <PiX className="w-6 h-6 text-white" />
            </div>
          ),
          confirmVariant: 'danger' as const,
        };

      case 'danger':
        return {
          title: t('danger_title'),
          message: t('danger_message'),
          confirmLabel: t('danger_confirm'),
          cancelLabel: t('danger_cancel'),
          icon: (
            <div className="w-12 h-12 bg-erro rounded-full flex items-center justify-center">
              <PiTrash className="w-6 h-6 text-white" />
            </div>
          ),
          confirmVariant: 'danger' as const,
        };

      case 'custom':
      default:
        return {
          title: t('custom_title'),
          message: t('custom_message'),
          confirmLabel: t('custom_confirm'),
          cancelLabel: t('custom_cancel'),
          icon: (
            <div className="w-12 h-12 fill-ouro rounded-full flex items-center justify-center">
              <PiWarning className="w-6 h-6 text-white" />
            </div>
          ),
          confirmVariant: 'primary' as const,
        };
    }
  };

  const defaultConfig = getDefaultConfig(config.type);
  const finalConfig = { ...defaultConfig, ...config };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      maxWidth="md"
      showCloseButton={false}
      preventBodyScroll={true}
      className="!max-h-auto"
    >
      <div className="p-4 md:p-6">
        {/* Icon e Header */}
        <div className="flex flex-col items-center text-center mb-6">
          {finalConfig.icon}

          <h3 className="text-xl font-bold text-theme-primary mt-4 mb-2">
            {finalConfig.title}
          </h3>

          <p className="text-theme-secondary leading-relaxed max-w-md">
            {finalConfig.message}
          </p>
        </div>

        {/* Informações adicionais para processo em andamento */}
        {config?.type === 'ongoing-process' && (
          <div className="bg-erro/10 border border-erro/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-erro rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <Stack gap={1}>
                <h4 className="font-medium text-erro">
                  {t('process_active_title')}
                </h4>
                <p className="text-sm text-erro/80">
                  {config?.processName ? (
                    <>
                      {t('process_active_description').replace(
                        '{processName}',
                        config.processName
                      )}
                    </>
                  ) : (
                    t('process_active_description_generic')
                  )}
                </p>
              </Stack>
            </div>
          </div>
        )}

        {/* Informações adicionais para alterações não salvas */}
        {config?.type === 'unsaved-changes' && (
          <div className="bg-atencao/10 border border-atencao/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <PiFloppyDisk className="w-5 h-5 text-atencao flex-shrink-0 mt-0.5" />
              <Stack gap={1}>
                <h4 className="font-medium text-atencao">
                  {t('changes_detected_title')}
                </h4>
                <p className="text-sm text-atencao/80">
                  {t('changes_detected_description')}
                </p>
              </Stack>
            </div>
          </div>
        )}

        {config?.type === 'general-no-verification' && (
          <div className="bg-atencao/10 border border-atencao/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <PiFloppyDisk className="w-5 h-5 text-atencao flex-shrink-0 mt-0.5" />
              <Stack gap={1}>
                <h4 className="font-medium text-atencao">
                  {t('possible_changes_title')}
                </h4>
                <p className="text-sm text-atencao/80">
                  {t('possible_changes_description')}
                </p>
              </Stack>
            </div>
          </div>
        )}

        {/* Botões */}
        <Inline gap={3} className="justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {finalConfig.cancelLabel}
          </Button>

          <Button
            variant={
              finalConfig.confirmVariant === 'danger' ? 'secondary' : 'primary'
            }
            onClick={onConfirm}
            isLoading={isLoading}
            className={`min-w-[140px] ${
              finalConfig.confirmVariant === 'danger'
                ? 'bg-erro text-white border-erro shadow-lg'
                : finalConfig.confirmVariant === 'warning'
                  ? 'bg-atencao text-white border-atencao shadow-lg'
                  : ''
            }`}
          >
            {finalConfig.confirmLabel}
          </Button>
        </Inline>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
