// components/auth/OnboardingModal.tsx - Versão com sistema completo atualizado
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getOnboardingOptions, completeOnboarding } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import { FiAlertCircle } from 'react-icons/fi';

import { useOnboardingModal } from '@/app/stores/authStore';
import Button from '../../Common/Button';
import Modal, { ModalRef } from '../../Modal';
import WelcomeStep from '../onboarding/WelcomeStep';
import UserTypeStep from '../onboarding/UserTypeStep';
import InstrumentsStep from '../onboarding/InstrumentsStep';
import PreferencesStep from '../onboarding/PreferencesStep';
import ProfileStep from '../onboarding/ProfileStep';
import CompletionStep from '../onboarding/CompletionStep';
import { useUserStore } from '@/app/hooks/userStore';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { useRouter } from 'next/navigation';

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
  const { user } = useAuth(); // Usar useAuth em vez de useUserStore diretamente
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
  const { updateUserSession } = useSessionUpdate();
  const router = useRouter();

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

  // 🔄 FUNÇÃO HANDLE COMPLETE ATUALIZADA
  const handleComplete = async () => {
    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    console.log('🎯 Iniciando finalização do onboarding com dados:', {
      userId: user.id,
      data,
      hasLocation: !!data.location,
      hasPhone: !!data.phone,
    });

    setLoading(true);

    try {
      // 1. Completar onboarding no backend
      const result = await completeOnboarding(user.id, data);

      if (result.success) {
        console.log('✅ Onboarding completado no backend:', result.user);

        // 2. Atualizar sessão e store local
        const sessionUpdated = await updateUserSession();

        if (sessionUpdated) {
          console.log('✅ Sessão atualizada com sucesso');

          // 3. Limpar dados do onboarding e fechar modal
          complete();

          // 4. Mostrar sucesso
          toast.success('🎉 Onboarding finalizado com sucesso!');

          // 5. Refresh para garantir que tudo está atualizado
          router.refresh();
        } else {
          console.warn(
            '⚠️ Problema ao atualizar sessão, mas onboarding foi salvo'
          );
          toast.success(
            'Perfil salvo! Recarregue a página para ver as mudanças.'
          );
          complete();
        }
      } else {
        console.error('❌ Erro no backend:', result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao completar onboarding:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Pulando onboarding (salvando progresso)');
    close();
    toast.success(
      'Progresso salvo! Você pode continuar depois nas configurações.'
    );
  };

  const handleClose = () => {
    console.log('❌ Fechando onboarding');
    close();
  };

  const handleStartOver = () => {
    if (
      window.confirm(
        'Tem certeza que deseja recomeçar? Todo o progresso será perdido.'
      )
    ) {
      console.log('🔄 Recomeçando onboarding do zero');
      resetData();
      toast.success('Progresso removido. Começando do início...');
    }
  };

  // Função para avançar step (o useEffect cuida do scroll)
  const handleNextStep = () => {
    console.log(`➡️ Avançando do step ${step} para ${step + 1}`);
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

  // 🐛 Debug para verificar dados do onboarding
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isOpen) {
      console.log('🔍 OnboardingModal Estado:', {
        step,
        data,
        hasLocation: !!data.location,
        hasPhone: !!data.phone,
        canProceed: canProceed(),
        isLoading,
        user: user?.id,
      });
    }
  }, [step, data, isLoading, user]);

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

      {/* 🐛 Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && isOpen && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">
            🔍 Debug - Estado do Onboarding:
          </h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Step: {step}/6</div>
            <div>UserType: {data.userType || 'não definido'}</div>
            <div>Localização: {data.location ? '✅' : '❌'}</div>
            <div>Telefone: {data.phone ? '✅' : '❌'}</div>
            <div>Pode prosseguir: {canProceed() ? '✅' : '❌'}</div>
            <div>Loading: {isLoading ? '⏳' : '✅'}</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default OnboardingModal;
