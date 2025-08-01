// components/ui/ConfirmationModal.tsx - MODAL DE CONFIRMAÇÃO CUSTOMIZADO
'use client';

import React from 'react';
import { FiAlertTriangle, FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import Modal from '..';
import Button from '../../Common/Button';
import { ConfirmationConfig } from '@/app/hooks/useModalConfirmation';

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
  // 🎯 CONFIGURAÇÕES PADRÃO BASEADAS NO TIPO
  const getDefaultConfig = (type: ConfirmationConfig['type']) => {
    switch (type) {
      case 'unsaved-changes':
        return {
          title: 'Descartar alterações?',
          message:
            'Você tem alterações não salvas. Se fechar agora, todas as alterações serão perdidas.',
          confirmLabel: 'Descartar e Fechar',
          cancelLabel: 'Continuar Editando',
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-6 h-6 text-white" />
            </div>
          ),
          confirmVariant: 'danger' as const,
        };

      case 'ongoing-process':
        return {
          title: 'Interromper processo?',
          message: config.processName
            ? `O processo de ${config.processName} está em andamento. Se fechar agora, o processo será interrompido e o progresso será perdido.`
            : 'Um processo está em andamento. Se fechar agora, o processo será interrompido.',
          confirmLabel: 'Interromper e Fechar',
          cancelLabel: 'Continuar Processo',
          icon: (
            <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-purple rounded-full flex items-center justify-center">
              <FiX className="w-6 h-6 text-white" />
            </div>
          ),
          confirmVariant: 'danger' as const,
        };

      case 'danger':
        return {
          title: 'Ação perigosa',
          message:
            'Esta ação não pode ser desfeita. Tem certeza que deseja continuar?',
          confirmLabel: 'Confirmar',
          cancelLabel: 'Cancelar',
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
          title: 'Confirmar ação',
          message: 'Tem certeza que deseja continuar?',
          confirmLabel: 'Confirmar',
          cancelLabel: 'Cancelar',
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
      <div className="p-6">
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
                  Processo Ativo
                </h4>
                <p className="text-sm text-accent-red/80">
                  {config.processName ? (
                    <>
                      O processo de <strong>{config.processName}</strong> será
                      interrompido permanentemente.
                    </>
                  ) : (
                    'O processo atual será interrompido permanentemente.'
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
                  Alterações Detectadas
                </h4>
                <p className="text-sm text-accent-amber/80">
                  Salve suas alterações antes de fechar para não perdê-las.
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
                  Possíveis Alterações Detectadas
                </h4>
                <p className="text-sm text-accent-amber/80">
                  Salve suas alterações antes de fechar para não perdê-las.
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
