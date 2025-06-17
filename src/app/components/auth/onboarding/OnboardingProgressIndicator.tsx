// components/auth/onboarding/OnboardingProgressIndicator.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiSave,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiWifi,
  FiWifiOff,
  FiRotateCcw,
} from 'react-icons/fi';
import {
  useOnboardingPersistence,
  useOnboardingValidation,
} from '@/app/hooks/useOnboardingPersistence';
import { useOnboardingModal } from '@/app/stores/authStore';

interface OnboardingProgressIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const OnboardingProgressIndicator: React.FC<
  OnboardingProgressIndicatorProps
> = ({ className = '', showDetails = true, compact = false }) => {
  const { step, data } = useOnboardingModal();
  const { isSaving, lastSaved, hasUnsavedChanges, getProgressSummary } =
    useOnboardingPersistence();
  const { getCompletionPercentage, validateCurrentStep } =
    useOnboardingValidation();

  const [isOnline, setIsOnline] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  // Monitor connection status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const validation = validateCurrentStep();
  const completionPercentage = getCompletionPercentage();

  const formatTime = (date: Date | null) => {
    if (!date) return 'Nunca';

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'agora mesmo';
    if (minutes < 60) return `${minutes} min atrás`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;

    return date.toLocaleDateString('pt-BR');
  };

  const getSaveStatus = () => {
    if (isSaving) {
      return {
        icon: FiRotateCcw,
        text: 'Salvando...',
        color: 'text-accent-blue',
        bgColor: 'bg-accent-blue',
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: FiClock,
        text: 'Alterações não salvas',
        color: 'text-accent-amber',
        bgColor: 'bg-accent-amber',
      };
    }

    if (lastSaved) {
      return {
        icon: FiCheckCircle,
        text: `Salvo ${formatTime(lastSaved)}`,
        color: 'text-accent-green',
        bgColor: 'bg-accent-green',
      };
    }

    return {
      icon: FiSave,
      text: 'Não salvo',
      color: 'text-theme-tertiary',
      bgColor: 'bg-theme-tertiary',
    };
  };

  const saveStatus = getSaveStatus();
  const StatusIcon = saveStatus.icon;

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <StatusIcon
            className={`w-3 h-3 ${saveStatus.color} ${
              isSaving ? 'animate-spin' : ''
            }`}
          />
          {!isOnline && <FiWifiOff className="w-3 h-3 text-accent-red" />}
        </div>

        <span className="text-xs text-theme-tertiary">
          {completionPercentage}% concluído
        </span>
      </div>
    );
  }

  return (
    <div
      className={`classical-card bg-theme-elevated border border-theme-secondary ${className}`}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-theme-primary">
            Progresso do Onboarding
          </h4>

          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            {isOnline ? (
              <FiWifi className="w-4 h-4 text-accent-green" title="Online" />
            ) : (
              <FiWifiOff className="w-4 h-4 text-accent-red" title="Offline" />
            )}

            {/* Save Status */}
            <div
              className="relative"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <div
                className={`w-2 h-2 rounded-full ${saveStatus.bgColor} bg-opacity-20`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${saveStatus.bgColor} ${
                    isSaving ? 'animate-pulse' : ''
                  }`}
                />
              </div>

              {showTooltip && (
                <div className="absolute right-0 top-full mt-1 z-50 bg-theme-elevated border border-theme-secondary rounded px-2 py-1 text-xs whitespace-nowrap shadow-lg">
                  {saveStatus.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-theme-secondary">
              Etapa {step} de 6
            </span>
            <span className="text-xs text-theme-secondary">
              {completionPercentage}%
            </span>
          </div>

          <div className="w-full bg-theme-secondary rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-brand-primary to-accent-purple h-1.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {showDetails && (
          <>
            {/* Current Step Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-theme-secondary">
                Status atual:
              </span>
              <div className="flex items-center space-x-1">
                {validation.isValid ? (
                  <FiCheckCircle className="w-3 h-3 text-accent-green" />
                ) : (
                  <FiAlertCircle className="w-3 h-3 text-accent-amber" />
                )}
                <span
                  className={`text-xs ${
                    validation.isValid
                      ? 'text-accent-green'
                      : 'text-accent-amber'
                  }`}
                >
                  {validation.isValid ? 'Válido' : 'Pendente'}
                </span>
              </div>
            </div>

            {/* Save Status */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-theme-secondary">Último save:</span>
              <div className="flex items-center space-x-1">
                <StatusIcon
                  className={`w-3 h-3 ${saveStatus.color} ${
                    isSaving ? 'animate-spin' : ''
                  }`}
                />
                <span className={`text-xs ${saveStatus.color}`}>
                  {formatTime(lastSaved)}
                </span>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="pt-2 border-t border-theme-secondary">
              <p className="text-xs text-theme-tertiary leading-relaxed">
                {getProgressSummary()}
              </p>
            </div>

            {/* Validation Errors */}
            {!validation.isValid && validation.errors.length > 0 && (
              <div className="mt-2 pt-2 border-t border-accent-amber border-opacity-20">
                {validation.errors.map((error, index) => (
                  <p key={index} className="text-xs text-accent-amber">
                    • {error}
                  </p>
                ))}
              </div>
            )}

            {/* Offline Warning */}
            {!isOnline && (
              <div className="mt-2 pt-2 border-t border-accent-red border-opacity-20">
                <div className="flex items-center space-x-1">
                  <FiWifiOff className="w-3 h-3 text-accent-red" />
                  <p className="text-xs text-accent-red">
                    Sem conexão. Dados salvos localmente.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OnboardingProgressIndicator;

// Hook para usar o indicador em outros componentes
export function useOnboardingProgress() {
  const { step, data, hasProgress } = useOnboardingModal();
  const { lastSaved, hasUnsavedChanges } = useOnboardingPersistence();
  const { getCompletionPercentage } = useOnboardingValidation();

  return {
    currentStep: step,
    totalSteps: 6,
    completionPercentage: getCompletionPercentage(),
    hasProgress,
    lastSaved,
    hasUnsavedChanges,
    isComplete: step === 6 && getCompletionPercentage() === 100,
  };
}
