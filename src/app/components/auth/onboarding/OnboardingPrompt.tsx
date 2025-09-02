// components/onboarding/OnboardingPrompt.tsx
'use client';

import React from 'react';
import { FiUser, FiArrowRight, FiX } from 'react-icons/fi';
import { useOnboardingModal, usePromptModal } from '@/app/stores/authStore';
import { useUser } from '@/app/hooks/userStore';
import { useTranslation } from '@/app/context/TranslationContext';
import Button from '../../Common/Button';

const OnboardingPrompt = () => {
  const user = useUser();
  const { close: closePrompt, isOpen } = usePromptModal();
  const {
    open: openOnboarding,
    isOpen: isOnboardingModalOpen,
    step,
  } = useOnboardingModal();
  const { t } = useTranslation({ sections: ['components/onboarding'] });

  // Don't show if user has completed onboarding
  if (!user || user.onboardingCompleted) {
    return null;
  }

  return (
    <div
      className={`classical-card ${
        isOpen && !isOnboardingModalOpen
          ? 'fixed bottom-0  right-0 z-50'
          : 'hidden'
      } p-4 border-accent-amber !rounded-b-none bg-accent-amber bg-opacity-5 `}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-accent-amber bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
          <FiUser className="w-5 h-5 text-accent-amber" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-theme-primary mb-1">
            {t('prompt_title')}
          </h4>
          <p className="text-sm text-theme-secondary mb-3">
            {t('prompt_description')}
          </p>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-theme-tertiary">
                {t('prompt_step_of')} {step} {t('onboarding_modal_step_of')} 6
              </span>
            </div>

            <div className="w-full bg-theme-secondary rounded-full h-2">
              <div
                className="bg-brand-gradient bg-[#d4af37] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              onClick={() => {
                closePrompt();
                openOnboarding();
              }}
              rightIcon={<FiArrowRight />}
            >
              {t('prompt_configure_now')}
            </Button>

            <Button variant="ghost" size="sm" onClick={closePrompt}>
              {t('prompt_later')}
            </Button>
          </div>
        </div>
        <button
          onClick={closePrompt}
          className="p-1 text-theme-tertiary hover:text-theme-secondary transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingPrompt;
