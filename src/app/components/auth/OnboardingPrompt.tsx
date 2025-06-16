// components/auth/OnboardingPrompt.tsx
'use client';

import React from 'react';
import { FiUser, FiArrowRight, FiX } from 'react-icons/fi';
import Button from '../Common/Button';
import { useOnboardingModal, useUser } from '@/app/stores/authStore';

interface OnboardingPromptProps {
  onDismiss?: () => void;
  className?: string;
}

const OnboardingPrompt: React.FC<OnboardingPromptProps> = ({
  onDismiss,
  className = '',
}) => {
  const user = useUser();
  const { open: openOnboarding } = useOnboardingModal();

  // Don't show if user has completed onboarding
  if (!user || user.onboardingCompleted) {
    return null;
  }

  return (
    <div
      className={`classical-card p-4 border-accent-amber bg-accent-amber bg-opacity-5 ${className}`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-accent-amber bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
          <FiUser className="w-5 h-5 text-accent-amber" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-theme-primary mb-1">
            Complete seu perfil
          </h4>
          <p className="text-sm text-theme-secondary mb-3">
            Configure suas preferências musicais para receber recomendações
            personalizadas.
          </p>

          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={openOnboarding}
              rightIcon={<FiArrowRight />}
            >
              Configurar Agora
            </Button>

            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Depois
              </Button>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-theme-tertiary hover:text-theme-secondary transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPrompt;
