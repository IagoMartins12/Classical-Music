// hooks/useModalConfirmation.ts - HOOK PARA CONFIRMAÇÃO DE FECHAMENTO DE MODALS
'use client';

import { useState, useCallback, useMemo } from 'react';
import { ConfirmationConfig } from '../components/Modal/ConfirmationModal';

export interface UseModalConfirmationOptions {
  // 🎯 DETECÇÃO DE MUDANÇAS
  hasUnsavedChanges?: boolean;

  // 🎯 DETECÇÃO DE PROCESSOS
  hasOngoingProcess?: boolean;
  processName?: string; // Nome do processo para mostrar na mensagem

  // 🎯 CONFIGURAÇÃO CUSTOMIZADA
  customConfirmation?: ConfirmationConfig;

  // 🎯 CALLBACKS
  onConfirmClose?: () => void | Promise<void>; // Executado quando usuário confirma o fechamento
  onCancelClose?: () => void; // Executado quando usuário cancela o fechamento

  // 🎯 CONTROLES
  enabled?: boolean; // Permite desabilitar completamente a funcionalidade (default: true)
  showUnsavedWarning?: boolean; // Mostrar avisos de alterações não salvas (default: true)
  showProcessWarning?: boolean; // Mostrar avisos de processo em andamento (default: true)
}

export interface UseModalConfirmationReturn {
  // 🎯 HANDLERS
  requestClose: () => boolean; // Para usar no onRequestClose do Modal
  forceClose: () => void; // Para forçar fechamento sem confirmação

  // 🎯 ESTADO
  showConfirmation: boolean;
  isConfirming: boolean;

  // 🎯 COMPONENTE
  ConfirmationModal: React.FC<{ onClose: () => void }>;

  // 🎯 UTILIDADES
  hasBlockingConditions: boolean; // Se tem condições que impedem fechamento
}

export const useModalConfirmation = ({
  hasUnsavedChanges = false,
  hasOngoingProcess = false,
  processName,
  customConfirmation,
  onConfirmClose,
  onCancelClose,
  enabled = true,
  showUnsavedWarning = true,
  showProcessWarning = true,
}: UseModalConfirmationOptions = {}): UseModalConfirmationReturn => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingCloseCallback, setPendingCloseCallback] = useState<
    (() => void) | null
  >(null);

  // 🎯 DETECTAR CONDIÇÕES QUE IMPEDEM FECHAMENTO
  const hasBlockingConditions = useMemo(() => {
    if (!enabled) return false;

    const hasUnsaved = showUnsavedWarning && hasUnsavedChanges;
    const hasProcess = showProcessWarning && hasOngoingProcess;

    return hasUnsaved || hasProcess || !!customConfirmation;
  }, [
    enabled,
    showUnsavedWarning,
    hasUnsavedChanges,
    showProcessWarning,
    hasOngoingProcess,
    customConfirmation,
  ]);

  // 🎯 CONFIGURAÇÃO DINÂMICA DO MODAL DE CONFIRMAÇÃO
  const confirmationConfig = useMemo((): ConfirmationConfig => {
    // Usar configuração customizada se fornecida
    if (customConfirmation) {
      return customConfirmation;
    }

    // Priorizar processo em andamento sobre alterações não salvas
    if (showProcessWarning && hasOngoingProcess) {
      return {
        type: 'ongoing-process',
        processName,
      };
    }

    // Mostrar aviso de alterações não salvas
    if (showUnsavedWarning && hasUnsavedChanges) {
      return {
        type: 'unsaved-changes',
      };
    }

    // Fallback (não deveria chegar aqui em condições normais)
    return {
      type: 'custom',
      title: 'Confirmar fechamento',
      message: 'Tem certeza que deseja fechar?',
    };
  }, [
    customConfirmation,
    showProcessWarning,
    hasOngoingProcess,
    processName,
    showUnsavedWarning,
    hasUnsavedChanges,
  ]);

  // 🎯 HANDLER PRINCIPAL - Usado no onRequestClose do Modal
  const requestClose = useCallback(
    (closeCallback?: () => void) => {
      console.log('🚪 [useModalConfirmation] requestClose called', {
        enabled,
        hasBlockingConditions,
        hasUnsavedChanges,
        hasOngoingProcess,
      });

      if (!hasBlockingConditions) {
        // Não há impedimentos, pode fechar imediatamente
        if (closeCallback) closeCallback();
        return true;
      }

      // Há impedimentos, mostrar confirmação
      if (closeCallback) {
        setPendingCloseCallback(() => closeCallback);
      }
      setShowConfirmation(true);

      return false; // Impede fechamento imediato
    },
    [hasBlockingConditions]
  );

  // 🎯 FORÇAR FECHAMENTO SEM CONFIRMAÇÃO
  const forceClose = useCallback((closeCallback?: () => void) => {
    console.log('🔓 [useModalConfirmation] forceClose called');

    setShowConfirmation(false);
    setIsConfirming(false);
    setPendingCloseCallback(null);

    if (closeCallback) closeCallback();
  }, []);

  // 🎯 CONFIRMAR FECHAMENTO
  const handleConfirmClose = useCallback(async () => {
    console.log('✅ [useModalConfirmation] handleConfirmClose called');

    setIsConfirming(true);

    try {
      // Executar callback de confirmação se fornecido
      if (onConfirmClose) {
        await onConfirmClose();
      }

      // Executar callback de fechamento pendente
      if (pendingCloseCallback) {
        pendingCloseCallback();
      }

      // Limpar estado
      setShowConfirmation(false);
      setPendingCloseCallback(null);
    } catch (error) {
      console.error(
        '❌ [useModalConfirmation] Erro ao confirmar fechamento:',
        error
      );
      // Em caso de erro, não fechar o modal
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirmClose, pendingCloseCallback]);

  // 🎯 CANCELAR FECHAMENTO
  const handleCancelClose = useCallback(() => {
    console.log('❌ [useModalConfirmation] handleCancelClose called');

    setShowConfirmation(false);
    setPendingCloseCallback(null);

    // Executar callback de cancelamento se fornecido
    if (onCancelClose) {
      onCancelClose();
    }
  }, [onCancelClose]);

  // 🎯 COMPONENTE DE CONFIRMAÇÃO
  const ConfirmationModal = useCallback<React.FC<{ onClose: () => void }>>(
    ({ onClose }) => {
      // Importação dinâmica para evitar problemas de SSR
      const ConfirmationModalComponent =
        require('@/app/components/Modal/ConfirmationModal').default;

      return (
        <ConfirmationModalComponent
          isOpen={showConfirmation}
          config={confirmationConfig}
          onConfirm={() => {
            setPendingCloseCallback(() => onClose);
            handleConfirmClose();
          }}
          onCancel={handleCancelClose}
          isLoading={isConfirming}
        />
      );
    },
    [
      showConfirmation,
      confirmationConfig,
      handleConfirmClose,
      handleCancelClose,
      isConfirming,
    ]
  );

  return {
    requestClose,
    forceClose,
    showConfirmation,
    isConfirming,
    ConfirmationModal,
    hasBlockingConditions,
  };
};

// 🎯 VERSÃO SIMPLIFICADA PARA CASOS COMUNS
export const useSimpleModalConfirmation = (
  hasChanges: boolean,
  processName?: string
) => {
  return useModalConfirmation({
    hasUnsavedChanges: hasChanges,
    hasOngoingProcess: !!processName,
    processName,
  });
};

// 🎯 VERSÃO PARA APENAS PROCESSOS
export const useProcessModalConfirmation = (
  isProcessing: boolean,
  processName: string
) => {
  return useModalConfirmation({
    hasUnsavedChanges: false,
    hasOngoingProcess: isProcessing,
    processName,
    showUnsavedWarning: false,
  });
};

// 🎯 VERSÃO DESABILITADA (para modals que não precisam de confirmação)
export const useDisabledModalConfirmation = () => {
  return useModalConfirmation({
    enabled: false,
  });
};
