// components/ui/ConfirmationModal.tsx - MODAL DE CONFIRMAÇÃO CUSTOMIZADO TRADUZIDO
'use client';

import React from 'react';
import { FiAlertTriangle, FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import Modal from '..';
import Button from '../../Common/Button';
import { ConfirmationConfig } from '@/app/hooks/useModalConfirmation';
import { useTranslation } from '@/app/hooks/useTranslation';

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
            <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-white" />
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
            <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-full flex items-center justify-center">
              <FiX className="w-6 h-6 text-white" />
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
            <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-full flex items-center justify-center">
              <FiTrash2 className="w-6 h-6 text-white" />
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
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-white" />
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
        {config.type === 'ongoing-process' && (
          <div className="bg-accent-red/10 border border-accent-red/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-accent-red rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="font-medium text-accent-red mb-1">
                  {t('process_active_title')}
                </h4>
                <p className="text-sm text-accent-red/80">
                  {config.processName ? (
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
              </div>
            </div>
          </div>
        )}

        {/* Informações adicionais para alterações não salvas */}
        {config.type === 'unsaved-changes' && (
          <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <FiSave className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-accent-amber mb-1">
                  {t('changes_detected_title')}
                </h4>
                <p className="text-sm text-accent-amber/80">
                  {t('changes_detected_description')}
                </p>
              </div>
            </div>
          </div>
        )}

        {config.type === 'general-no-verification' && (
          <div className="bg-accent-amber/10 border border-accent-amber/20 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <FiSave className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-accent-amber mb-1">
                  {t('possible_changes_title')}
                </h4>
                <p className="text-sm text-accent-amber/80">
                  {t('possible_changes_description')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex items-center justify-end space-x-3">
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
                ? 'bg-gradient-to-r from-accent-red to-accent-red/80 hover:from-accent-red/90 hover:to-accent-red/70 text-white border-accent-red shadow-lg hover:shadow-accent-red/25'
                : finalConfig.confirmVariant === 'warning'
                ? 'bg-gradient-to-r from-accent-amber to-accent-amber/80 hover:from-accent-amber/90 hover:to-accent-amber/70 text-white border-accent-amber shadow-lg hover:shadow-accent-amber/25'
                : ''
            }`}
          >
            {finalConfig.confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
