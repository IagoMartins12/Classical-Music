// components/auth/OnboardingModal.tsx - Versão usando Modal com ref
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getOnboardingOptions, completeOnboarding } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';

import { useOnboardingModal } from '@/app/stores/authStore';
import Button from '../../Common/Button';
import Modal, { ModalRef } from '../../Modal'; // Importar o tipo ModalRef
import WelcomeStep from '../onboarding/WelcomeStep';
import UserTypeStep from '../onboarding/UserTypeStep';
import InstrumentsStep from '../onboarding/InstrumentsStep';
import PreferencesStep from '../onboarding/PreferencesStep';
import ProfileStep from '../onboarding/ProfileStep';
import CompletionStep from '../onboarding/CompletionStep';
import { useUserStore } from '@/app/hooks/userStore';

interface OnboardingOptions {
  instruments: Array<{ id: string; name: string; category: string | null }>;
  composers: Array<{
    id: string;
    name: string;
    fullName: string;
    portraitUrl: string | null;
    epochName: string | null;
  }>;
  epochs: Array<{ id: string; name: string }>;
}

const OnboardingModal: React.FC = () => {
  const user = useUserStore();
  const {
    isOpen,
    close,
    step,
    data,
    isLoading,
    hasProgress,
    nextStep,
    prevStep,
    resetData,
    setLoading,
    complete,
  } = useOnboardingModal();

  const [options, setOptions] = useState<OnboardingOptions | null>(null);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Ref para controlar o scroll do modal
  const modalRef = useRef<ModalRef>(null);

  // Load onboarding options when modal opens
  useEffect(() => {
    if (isOpen && !options) {
      loadOptions();
    }
  }, [isOpen, options]);

  // Scroll suave para o topo sempre que o step mudar
  useEffect(() => {
    if (modalRef.current && isOpen) {
      modalRef.current.scrollToTop();
    }
  }, [step, isOpen]);

  const loadOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const result = await getOnboardingOptions();
      if (result.success && result.data) {
        setOptions(result.data);
      } else {
        toast.error('Erro ao carregar opções. Tente novamente.');
      }
    } catch (error) {
      console.error('Error loading onboarding options:', error);
      toast.error('Erro ao carregar opções. Tente novamente.');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleComplete = async () => {
    if (!user.user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    setLoading(true);

    try {
      const result = await completeOnboarding(user.user?.id, data);

      if (result.success) {
        toast.success(result.message);
        complete();
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    close();
  };

  const handleClose = () => {
    close();
  };

  const handleStartOver = () => {
    if (
      window.confirm(
        'Tem certeza que deseja recomeçar? Todo o progresso será perdido.'
      )
    ) {
      resetData();
      toast.success('Progresso removido. Começando do início...');
    }
  };

  // Função para avançar step (o useEffect cuida do scroll)
  const handleNextStep = () => {
    nextStep();
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!data.userType;
      case 3:
        return (
          data.userType !== 'MUSIC_STUDENT' ||
          (data.instruments && data.instruments.length > 0)
        );
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    if (isLoadingOptions) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-theme-secondary">Carregando opções...</p>
          </div>
        </div>
      );
    }

    if (!options) {
      return (
        <div className="text-center py-20">
          <p className="text-theme-secondary mb-4">Erro ao carregar opções.</p>
          <Button onClick={loadOptions} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      );
    }

    switch (step) {
      case 1:
        return <WelcomeStep />;
      case 2:
        return <UserTypeStep />;
      case 3:
        return <InstrumentsStep instruments={options.instruments} />;
      case 4:
        return (
          <PreferencesStep
            composers={options.composers}
            epochs={options.epochs}
          />
        );
      case 5:
        return <ProfileStep />;
      case 6:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Bem-vindo!';
      case 2:
        return 'Conte-nos sobre você';
      case 3:
        return 'Seus instrumentos';
      case 4:
        return 'Suas preferências';
      case 5:
        return 'Perfil pessoal';
      case 6:
        return 'Quase pronto!';
      default:
        return 'Configuração';
    }
  };

  return (
    <Modal
      ref={modalRef}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="3xl"
      showCloseButton={true}
      closeOnOverlayClick={false}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              {getStepTitle()}
            </h2>
          </div>
          <span className="text-sm text-theme-tertiary">{step} de 6</span>
        </div>

        <div className="w-full bg-theme-secondary rounded-full h-2">
          <div
            className="bg-brand-gradient bg-[#d4af37] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="">{renderStep()}</div>

      {/* Navigation */}
      {step < 6 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-theme-secondary">
          <div className="flex space-x-3">
            {step > 1 && (
              <Button variant="ghost" onClick={prevStep} disabled={isLoading}>
                Voltar
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isLoading}
              title="Salva o progresso e fecha o modal"
            >
              Continuar depois
            </Button>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={!canProceed() || isLoading}
            >
              {step === 6 ? 'Finalizar' : 'Continuar'}
            </Button>
          </div>
        </div>
      )}

      {/* Reset Progress Option */}
      {hasProgress && step === 1 && (
        <div className="mt-4 pt-4 border-t border-theme-secondary">
          <div className="flex items-center justify-center">
            <button
              onClick={handleStartOver}
              className="text-xs text-theme-tertiary hover:text-accent-red transition-colors flex items-center space-x-1"
            >
              <FiAlertCircle className="w-3 h-3" />
              <span>Recomeçar do zero</span>
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OnboardingModal;
