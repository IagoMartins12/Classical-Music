// hooks/useModalConfirmation.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import React from 'react';

export interface ConfirmationConfig {
  type:
    | 'unsaved-changes'
    | 'ongoing-process'
    | 'danger'
    | 'custom'
    | 'general-no-verification';
  title?: string;
  message?: string;
  processName?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  icon?: React.ReactNode;
  confirmVariant?: 'primary' | 'danger' | 'warning';
}

export interface UseModalConfirmationOptions {
  hasUnsavedChanges?: boolean;
  hasOngoingProcess?: boolean;
  processName?: string;
  customConfirmation?: ConfirmationConfig;
  onConfirmClose?: () => void | Promise<void>;
  onCancelClose?: () => void;
  enabled?: boolean;
  showUnsavedWarning?: boolean;
  showProcessWarning?: boolean;
  withouVerification?: boolean;
}

export interface UseModalConfirmationReturn {
  requestClose: (closeCallback?: () => void) => boolean;
  forceClose: (closeCallback?: () => void) => void;
  showConfirmation: boolean;
  isConfirming: boolean;
  confirmationConfig: ConfirmationConfig;
  handleConfirmClose: () => void;
  handleCancelClose: () => void;
  hasBlockingConditions: boolean;
}

export const useModalConfirmation = ({
  hasUnsavedChanges = false,
  hasOngoingProcess = false,
  processName,
  customConfirmation,
  onConfirmClose,
  onCancelClose,
  withouVerification = false,
  enabled = true,
  showUnsavedWarning = true,
  showProcessWarning = true,
}: UseModalConfirmationOptions = {}): UseModalConfirmationReturn => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [pendingCloseCallback, setPendingCloseCallback] = useState<any>(null);

  // Detectar condições que impedem fechamento
  const hasBlockingConditions = useMemo(() => {
    if (!enabled) return false;

    if (enabled && withouVerification) return true;

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

  // Configuração dinâmica do modal de confirmação
  const confirmationConfig = useMemo((): ConfirmationConfig => {
    if (customConfirmation) {
      return customConfirmation;
    }

    // Priorizar processo em andamento
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

    if (withouVerification) {
      return {
        type: 'general-no-verification',
      };
    }

    return {
      type: 'unsaved-changes',
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

  // Handler principal
  const requestClose = useCallback(
    (closeCallback?: () => void): boolean => {
      if (!hasBlockingConditions) {
        if (closeCallback) closeCallback();
        return true;
      }

      if (closeCallback) {
        setPendingCloseCallback(() => closeCallback);
      }
      setShowConfirmation(true);

      return false;
    },
    [hasBlockingConditions, hasUnsavedChanges, hasOngoingProcess, enabled]
  );

  // Forçar fechamento
  const forceClose = useCallback((closeCallback?: () => void): void => {
    setShowConfirmation(false);
    setIsConfirming(false);
    setPendingCloseCallback(null);

    if (closeCallback) closeCallback();
  }, []);

  // Confirmar fechamento
  const handleConfirmClose = useCallback(async () => {
    setIsConfirming(true);

    try {
      if (onConfirmClose) {
        await onConfirmClose();
      }

      if (pendingCloseCallback) {
        pendingCloseCallback();
      }

      setShowConfirmation(false);
      setPendingCloseCallback(null);
    } catch {
    } finally {
      setIsConfirming(false);
    }
  }, [onConfirmClose, pendingCloseCallback]);

  // Cancelar fechamento
  const handleCancelClose = useCallback(() => {
    setShowConfirmation(false);
    setPendingCloseCallback(null);

    if (onCancelClose) {
      onCancelClose();
    }
  }, [onCancelClose]);

  return {
    requestClose,
    forceClose,
    showConfirmation,
    isConfirming,
    confirmationConfig,
    handleConfirmClose,
    handleCancelClose,
    hasBlockingConditions,
  };
};
