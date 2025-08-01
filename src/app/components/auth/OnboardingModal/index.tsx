// components/auth/OnboardingModal.tsx - COM VALIDAÇÃO DE TELEFONE
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getOnboardingOptions, completeOnboarding } from '@/app/actions/auth';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiPhone } from 'react-icons/fi';

import { useOnboardingModal } from '@/app/stores/authStore';
import Button from '../../Common/Button';
import Modal, { ModalRef } from '../../Modal';
import WelcomeStep from '../onboarding/WelcomeStep';
import UserTypeStep from '../onboarding/UserTypeStep';
import InstrumentsStep from '../onboarding/InstrumentsStep';
import PreferencesStep from '../onboarding/PreferencesStep';
import ProfileStep from '../onboarding/ProfileStep';
import CompletionStep from '../onboarding/CompletionStep';
import { useAuth } from '@/app/hooks/useAuth';
import { useSessionUpdate } from '@/app/hooks/useSessionUpdate';
import { useRouter } from 'next/navigation';
import {
  canProceedWithPhone,
  usePhoneValidation,
} from '@/app/utils/phones_and_location/phoneValidation';

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
  const { user } = useAuth();
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

  // 🆕 Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const modalRef = useRef<ModalRef>(null);

  // 🆕 VALIDAÇÃO DE TELEFONE EM TEMPO REAL
  const phoneValidation = usePhoneValidation(data.phone || '');

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

  // 🆕 Atualizar erros de validação quando telefone mudar
  useEffect(() => {
    if (data.phone) {
      if (phoneValidation.showError && phoneValidation.error) {
        setValidationErrors((prev) => ({
          ...prev,
          phone: phoneValidation.error!,
        }));
      } else {
        setValidationErrors((prev) => {
          const { _phone, ...rest } = prev;
          return rest;
        });
      }
    } else {
      // Telefone vazio é válido, remover erro
      setValidationErrors((prev) => {
        const { _phone, ...rest } = prev;
        return rest;
      });
    }
  }, [data.phone, phoneValidation.showError, phoneValidation.error]);

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
    if (!user?.id) {
      toast.error('Usuário não encontrado');
      return;
    }

    console.log('🎯 Iniciando finalização do onboarding com dados:', {
      userId: user.id,
      data,
      hasLocation: !!data.location,
      hasPhone: !!data.phone,
      phoneValidation: phoneValidation,
    });

    setLoading(true);

    try {
      const result = await completeOnboarding(user.id, data);

      if (result.success) {
        console.log('✅ Onboarding completado no backend:', result.user);

        const sessionUpdated = await updateUserSession();

        if (sessionUpdated) {
          console.log('✅ Sessão atualizada com sucesso');
          complete();
          toast.success('🎉 Onboarding finalizado com sucesso!');
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
      setValidationErrors({});
      toast.success('Progresso removido. Começando do início...');
    }
  };

  const handleNextStep = () => {
    console.log(`➡️ Tentando avançar do step ${step} para ${step + 1}`);

    // Validar antes de avançar
    if (!canProceed()) {
      console.log('❌ Não pode prosseguir - validação falhou');

      // Se é erro de telefone, mostrar toast específico
      if (validationErrors.phone) {
        toast.error(validationErrors.phone);
      }

      return;
    }

    console.log('✅ Validação passou - avançando step');
    nextStep();
  };

  // 🔧 FUNÇÃO CANPROCEED ATUALIZADA COM VALIDAÇÃO DE TELEFONE
  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!data.userType;
      case 3:
        return true; // Instrumentos são opcionais
      case 4:
        return true; // Preferências são opcionais
      case 5:
        // 🆕 VALIDAÇÃO DO STEP 5 (ProfileStep) - onde o telefone é coletado
        const hasValidPhone = canProceedWithPhone(data.phone || '');
        console.log('🔍 Validação Step 5:', {
          phone: data.phone,
          hasValidPhone,
          phoneValidation: phoneValidation,
          validationErrors: validationErrors,
        });

        // Telefone deve ser válido (vazio OU completo)
        return hasValidPhone;
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

  // 🐛 Debug aprimorado
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isOpen) {
      console.log('🔍 OnboardingModal Estado:', {
        step,
        data,
        hasLocation: !!data.location,
        hasPhone: !!data.phone,
        phoneValidation: phoneValidation,
        validationErrors,
        canProceed: canProceed(),
        isLoading,
        user: user?.id,
      });
    }
  }, [step, data, isLoading, user, phoneValidation, validationErrors]);

  console.log('step', step);
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

      {/* 🆕 AVISO DE VALIDAÇÃO DE TELEFONE (se houver erro) */}
      {step === 5 && validationErrors.phone && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <FiPhone className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">
              Telefone inválido
            </h4>
            <p className="text-sm text-red-700 mt-1">
              {validationErrors.phone}
            </p>
            {phoneValidation.progressMessage && (
              <p className="text-xs text-red-600 mt-1">
                {phoneValidation.progressMessage}
              </p>
            )}
          </div>
        </div>
      )}

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
            {/* 🆕 FEEDBACK VISUAL DO BOTÃO CONTINUAR */}
            <Button
              variant="primary"
              onClick={handleNextStep}
              disabled={!canProceed() || isLoading}
              title={
                !canProceed() && validationErrors.phone
                  ? validationErrors.phone
                  : undefined
              }
            >
              {step === 5 ? 'Finalizar Perfil' : 'Continuar'}
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
