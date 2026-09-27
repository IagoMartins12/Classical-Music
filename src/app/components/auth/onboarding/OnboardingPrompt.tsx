// components/onboarding/OnboardingPrompt.tsx
'use client';

import React from 'react';
import { PiArrowRight, PiUser, PiX } from 'react-icons/pi';
import { useOnboardingModal, usePromptModal } from '@/app/stores/authStore';
import { useUser } from '@/app/hooks/userStore';
import { useTranslation } from '@/app/context/TranslationContext';
import Button from '../../Common/Button';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

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
          ? 'fixed bottom-0  right-0 z-aviso'
          : 'hidden'
      } p-4 border-atencao !rounded-b-none bg-atencao/5 `}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-atencao/20 rounded-full flex items-center justify-center flex-shrink-0">
          <PiUser className="w-5 h-5 text-atencao" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-theme-primary mb-1">
            {t('prompt_title')}
          </h4>
          <Text papel="rotulo" tom="suave" as="p" className="mb-3">
            {t('prompt_description')}
          </Text>

          <Stack className="mb-8">
            <div className="flex items-center justify-between">
              <Text papel="rotulo" tom="fraco">
                {t('prompt_step_of')} {step} {t('onboarding_modal_step_of')} 6
              </Text>
            </div>

            <div className="w-full bg-theme-secondary rounded-full h-2">
              <div
                className="fill-ouro bg-[#d4af37] h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </Stack>

          <Inline gap={3}>
            <Button
              size="sm"
              onClick={() => {
                closePrompt();
                openOnboarding();
              }}
              rightIcon={<PiArrowRight />}
            >
              {t('prompt_configure_now')}
            </Button>

            <Button variant="ghost" size="sm" onClick={closePrompt}>
              {t('prompt_later')}
            </Button>
          </Inline>
        </div>
        <button
          onClick={closePrompt}
          className="p-1 text-theme-tertiary hover:text-texto-suave transition-colors"
        >
          <PiX className="w-4 h-4" />
          <NomeAcao acao="fechar" />
        </button>
      </div>
    </div>
  );
};

export default OnboardingPrompt;
