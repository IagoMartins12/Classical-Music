// hooks/useOnboardingPersistence.ts - Hook para gerenciar persistência
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useOnboardingModal } from '@/app/stores/authStore';
import { useAuth } from './useAuth';

interface OnboardingPersistenceOptions {
  autoSaveDelay?: number;
  enableLocalBackup?: boolean;
  showSaveIndicator?: boolean;
}

interface OnboardingPersistenceReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  forceSave: () => void;
  clearProgress: () => void;
  getProgressSummary: () => string;
}

const DEFAULT_OPTIONS: OnboardingPersistenceOptions = {
  autoSaveDelay: 1000,
  enableLocalBackup: true,
  showSaveIndicator: true,
};

export function useOnboardingPersistence(
  options: OnboardingPersistenceOptions = {}
): OnboardingPersistenceReturn {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const { isOpen, step, data, lastSaved, hasProgress } = useOnboardingModal();

  const { user, isAuthenticated } = useAuth();

  // Refs para controle de estado
  const isSavingRef = useRef(false);
  const lastDataRef = useRef(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Função de save direto
  const forceSave = useCallback(() => {
    if (!isAuthenticated || !user?.id) return;

    try {
      isSavingRef.current = true;

      // Salvar no localStorage como backup adicional
      if (config.enableLocalBackup) {
        const backupData = {
          userId: user.id,
          step,
          data,
          timestamp: Date.now(),
          version: '1.0',
        };

        localStorage.setItem(
          `onboarding-backup-${user.id}`,
          JSON.stringify(backupData)
        );
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('💾 Onboarding force saved:', { step, data });
      }
    } catch (error) {
      console.error('Erro ao salvar progresso do onboarding:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [isAuthenticated, user?.id, step, data, config.enableLocalBackup]);

  // Função de save com debounce
  const debouncedSave = useCallback(
    debounce(forceSave, config.autoSaveDelay, {
      leading: false,
      trailing: true,
    }),
    [forceSave, config.autoSaveDelay]
  );

  // Auto-save quando dados mudam
  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;

    // Verificar se os dados realmente mudaram
    const hasDataChanged =
      JSON.stringify(lastDataRef.current) !== JSON.stringify(data);

    if (hasDataChanged) {
      lastDataRef.current = data;
      debouncedSave();
    }
  }, [data, isOpen, isAuthenticated, debouncedSave]);

  // Salvar ao mudar de step
  useEffect(() => {
    if (isOpen && isAuthenticated && step > 1) {
      // Salvar imediatamente quando muda de step
      forceSave();
    }
  }, [step, isOpen, isAuthenticated, forceSave]);

  // Salvar ao fechar o modal
  useEffect(() => {
    return () => {
      if (hasProgress) {
        forceSave();
      }
    };
  }, [hasProgress, forceSave]);

  // Limpar timeout ao desmontar
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Função para limpar progresso
  const clearProgress = useCallback(() => {
    if (!user?.id) return;

    try {
      // Limpar backup local
      localStorage.removeItem(`onboarding-backup-${user.id}`);

      if (process.env.NODE_ENV === 'development') {
        console.log('🗑️ Progresso do onboarding limpo');
      }
    } catch (error) {
      console.error('Erro ao limpar progresso:', error);
    }
  }, [user?.id]);

  // Função para obter resumo do progresso
  const getProgressSummary = useCallback(() => {
    if (!hasProgress) return 'Nenhum progresso salvo';

    const completedSteps = step - 1;
    const totalSteps = 6;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    const features = [];
    if (data.userType) features.push('tipo de usuário');
    if (data.instruments?.length)
      features.push(`${data.instruments.length} instrumento(s)`);
    if (data.favoriteComposerId) features.push('compositor favorito');
    if (data.favoriteEpochId) features.push('época favorita');
    if (data.bio) features.push('biografia');
    if (data.location?.city) features.push('localização');

    let summary = `${percentage}% concluído (etapa ${step}/6)`;
    if (features.length > 0) {
      summary += ` • ${features.join(', ')} configurado(s)`;
    }

    return summary;
  }, [hasProgress, step, data]);

  // Restaurar backup se necessário
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !config.enableLocalBackup) return;

    try {
      const backupKey = `onboarding-backup-${user.id}`;
      const backup = localStorage.getItem(backupKey);

      if (backup) {
        const backupData = JSON.parse(backup);

        // Verificar se o backup é válido e recente (menos de 7 dias)
        const isRecentBackup =
          Date.now() - backupData.timestamp < 7 * 24 * 60 * 60 * 1000;

        if (isRecentBackup && backupData.userId === user.id) {
          console.log('🔄 Backup local encontrado e restaurado');
        } else {
          // Limpar backup antigo
          localStorage.removeItem(backupKey);
        }
      }
    } catch (error) {
      console.error('Erro ao restaurar backup local:', error);
    }
  }, [isAuthenticated, user?.id, config.enableLocalBackup]);

  return {
    isSaving: isSavingRef.current,
    lastSaved: lastSaved ? new Date(lastSaved) : null,
    hasUnsavedChanges:
      JSON.stringify(lastDataRef.current) !== JSON.stringify(data),
    forceSave,
    clearProgress,
    getProgressSummary,
  };
}

// Hook para monitorar performance do onboarding
export function useOnboardingPerformance() {
  const startTimeRef = useRef<number>();
  const stepTimesRef = useRef<Record<number, number>>({});

  const { isOpen, step } = useOnboardingModal();

  useEffect(() => {
    if (isOpen && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      console.log('⏱️ Onboarding iniciado');
    }

    if (!isOpen && startTimeRef.current) {
      const totalTime = Date.now() - startTimeRef.current;
      console.log(
        `⏱️ Onboarding finalizado em ${Math.round(totalTime / 1000)}s`
      );

      // Reset
      startTimeRef.current = undefined;
      stepTimesRef.current = {};
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && step > 1) {
      stepTimesRef.current[step] = Date.now();

      // Log tempo de cada step
      if (process.env.NODE_ENV === 'development') {
        const stepTime =
          stepTimesRef.current[step] -
          (stepTimesRef.current[step - 1] || startTimeRef.current || 0);
        console.log(
          `⏱️ Step ${step - 1} → ${step}: ${Math.round(stepTime / 1000)}s`
        );
      }
    }
  }, [step, isOpen]);

  const getPerformanceReport = useCallback(() => {
    if (!startTimeRef.current) return null;

    const totalTime = Date.now() - startTimeRef.current;
    const stepsCompleted = Object.keys(stepTimesRef.current).length;
    const averageStepTime = stepsCompleted > 0 ? totalTime / stepsCompleted : 0;

    return {
      totalTime: Math.round(totalTime / 1000),
      stepsCompleted,
      averageStepTime: Math.round(averageStepTime / 1000),
      currentStep: step,
    };
  }, [step]);

  return {
    getPerformanceReport,
  };
}

// Hook para validação de dados do onboarding
export function useOnboardingValidation() {
  const { data, step } = useOnboardingModal();

  const validateStep = useCallback(
    (stepNumber: number) => {
      switch (stepNumber) {
        case 1:
          return { isValid: true, errors: [] };

        case 2:
          const userTypeErrors = [];
          if (!data.userType) {
            userTypeErrors.push('Tipo de usuário é obrigatório');
          }
          return {
            isValid: userTypeErrors.length === 0,
            errors: userTypeErrors,
          };

        case 3:
          const instrumentErrors = [];
          if (
            data.userType === 'MUSIC_STUDENT' &&
            (!data.instruments || data.instruments.length === 0)
          ) {
            instrumentErrors.push(
              'Estudantes devem selecionar pelo menos um instrumento'
            );
          }
          return {
            isValid: instrumentErrors.length === 0,
            errors: instrumentErrors,
          };

        case 4:
        case 5:
          return { isValid: true, errors: [] }; // Opcionais

        case 6:
          // Validação final
          const finalErrors = [];
          if (!data.userType) finalErrors.push('Tipo de usuário é obrigatório');
          if (
            data.userType === 'MUSIC_STUDENT' &&
            (!data.instruments || data.instruments.length === 0)
          ) {
            finalErrors.push('Instrumentos são obrigatórios para estudantes');
          }

          return { isValid: finalErrors.length === 0, errors: finalErrors };

        default:
          return { isValid: false, errors: ['Step inválido'] };
      }
    },
    [data]
  );

  const validateCurrentStep = useCallback(() => {
    return validateStep(step);
  }, [step, validateStep]);

  const validateAllSteps = useCallback(() => {
    const results = [];
    for (let i = 1; i <= 6; i++) {
      results.push({ step: i, ...validateStep(i) });
    }
    return results;
  }, [validateStep]);

  const getCompletionPercentage = useCallback(() => {
    const validSteps = validateAllSteps().filter(
      (result) => result.isValid
    ).length;
    return Math.round((validSteps / 6) * 100);
  }, [validateAllSteps]);

  return {
    validateStep,
    validateCurrentStep,
    validateAllSteps,
    getCompletionPercentage,
  };
}
