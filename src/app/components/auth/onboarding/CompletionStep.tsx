// components/auth/onboarding/CompletionStep.tsx
'use client';

import { useOnboardingModal } from '@/app/stores/authStore';
import React from 'react';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { GiGrandPiano, GiMusicalNotes } from 'react-icons/gi';
import Button from '../../Common/Button';

interface CompletionStepProps {
  onComplete: () => void;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ onComplete }) => {
  const { data, isLoading } = useOnboardingModal();

  const getWelcomeMessage = () => {
    switch (data.userType) {
      case 'MUSIC_STUDENT':
        return 'Pronto para acelerar seus estudos musicais!';
      case 'PROFESSIONAL':
        return 'Bem-vindo à nossa comunidade de profissionais!';
      case 'TEACHER':
        return 'Obrigado por educar a próxima geração de músicos!';
      default:
        return 'Sua jornada na música clássica começa agora!';
    }
  };

  const getPersonalizedFeatures = () => {
    const features = [
      'Acesso completo à enciclopédia de música clássica',
      'Recomendações personalizadas baseadas no seu perfil',
      'Sistema de favoritos e listas de reprodução',
    ];

    if (data.userType === 'MUSIC_STUDENT') {
      features.push(
        'Ferramenta de acompanhamento de estudos',
        'Anotações pessoais em partituras'
      );
    }

    if (data.instruments && data.instruments.length > 0) {
      features.push(
        `Repertório recomendado para ${data.instruments
          .map((i) => i.name)
          .join(', ')}`
      );
    }

    if (data.favoriteComposerId) {
      features.push('Conteúdo especial do seu compositor favorito');
    }

    return features;
  };

  return (
    <div className="text-center py-8">
      {/* Success Icon */}
      <div className="mb-8">
        <div className="flex justify-center space-x-2 mb-6">
          <div className="w-20 h-20 bg-brand-gradient rounded-full bg-green-400 flex items-center justify-center">
            <FiCheck className="w-10 h-10 text-white" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-theme-primary classical-title mb-4">
          Perfil configurado! 🎉
        </h3>

        <p className="text-lg text-theme-secondary max-w-md mx-auto">
          {getWelcomeMessage()}
        </p>
      </div>

      {/* Profile Summary */}
      <div className="classical-card-2 p-6 mb-8 max-w-2xl mx-auto text-left">
        <h4 className="font-semibold text-theme-primary mb-4 text-center">
          Recursos disponíveis para você:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getPersonalizedFeatures().map((feature, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-accent-green bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiCheck className="w-3 h-3 text-accent-green" />
              </div>
              <span className="text-sm text-theme-secondary">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="mb-8">
        <h4 className="font-semibold text-theme-primary mb-4">
          Próximos passos recomendados:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="classical-card-2 p-4">
            <GiMusicalNotes className="w-8 h-8 text-accent-blue mx-auto mb-3" />
            <h5 className="font-medium text-theme-primary mb-2">
              Explore o Catálogo
            </h5>
            <p className="text-sm text-theme-secondary">
              Descubra obras e compositores na nossa enciclopédia
            </p>
          </div>

          <div className="classical-card-2 p-4">
            <GiGrandPiano className="w-8 h-8 text-accent-purple mx-auto mb-3" />
            <h5 className="font-medium text-theme-primary mb-2">
              Monte sua Lista
            </h5>
            <p className="text-sm text-theme-secondary">
              Adicione obras aos seus favoritos e lista de desejos
            </p>
          </div>

          <div className="classical-card-2 p-4">
            <FiArrowRight className="w-8 h-8 text-accent-green mx-auto mb-3" />
            <h5 className="font-medium text-theme-primary mb-2">
              Comece a Estudar
            </h5>
            <p className="text-sm text-theme-secondary">
              Use nossas ferramentas para acompanhar seu progresso
            </p>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <Button
        onClick={onComplete}
        isLoading={isLoading}
        size="lg"
        className="px-8"
        rightIcon={<FiArrowRight />}
      >
        {isLoading ? 'Finalizando...' : 'Entrar na Classical Hub'}
      </Button>

      <div className="mt-6">
        <p className="text-sm text-theme-tertiary">
          Você pode alterar essas configurações a qualquer momento no seu
          perfil.
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;
