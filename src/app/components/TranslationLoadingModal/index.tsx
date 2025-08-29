'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiGlobe, FiRefreshCw } from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano, GiGClef } from 'react-icons/gi';
import Modal from '../Modal';

interface TranslationLoadingModalProps {
  isOpen: boolean;
  currentLanguage: 'pt' | 'en';
  onComplete?: () => void; // Callback quando modal completar
}

export function TranslationLoadingModal({
  isOpen,
  currentLanguage,
  onComplete,
}: TranslationLoadingModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garantir que está montado no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  const steps = [
    {
      pt: 'Salvando preferência de idioma...',
      en: 'Saving language preference...',
      icon: FiGlobe,
    },
    {
      pt: 'Carregando dados traduzidos...',
      en: 'Loading translated data...',
      icon: GiMusicalNotes,
    },
    {
      pt: 'Atualizando interface...',
      en: 'Updating interface...',
      icon: FiRefreshCw,
    },
    {
      pt: 'Finalizando...',
      en: 'Finalizing...',
      icon: GiGrandPiano,
    },
  ];

  // Controlar visibilidade com delay de entrada
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setHasStarted(true);
      setProgress(0);
      setCurrentStep(0);
    }
  }, [isOpen]);

  // ✅ Lógica de progresso MUITO mais rápida (2-3 segundos total)
  useEffect(() => {
    if (!isVisible || !hasStarted) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // ✅ Modal completou - fechar após pequeno delay
          setTimeout(() => {
            setIsVisible(false);
            setHasStarted(false);
            onComplete?.();
          }, 200); // Delay menor
          return 100;
        }

        // ✅ Progresso muito mais rápido - completa em ~2.5 segundos
        let increment;
        if (prev < 25) {
          increment = 15; // Primeiro quarto: muito rápido
        } else if (prev < 50) {
          increment = 12; // Segundo quarto: rápido
        } else if (prev < 75) {
          increment = 10; // Terceiro quarto: moderado
        } else {
          increment = 8; // Último quarto: um pouco mais devagar para dar sensação de finalização
        }

        const newProgress = Math.min(prev + increment, 100);

        // Atualizar step baseado no progresso
        const newStep = Math.floor((newProgress / 100) * (steps.length - 1));
        if (newStep !== currentStep) {
          setCurrentStep(newStep);
        }

        return newProgress;
      });
    }, 150); // ✅ Intervalo menor = mais rápido (era 300ms, agora 150ms)

    return () => clearInterval(interval);
  }, [isVisible, hasStarted, currentStep, steps.length, onComplete]);

  // ✅ Portal para renderizar no body
  if (!mounted || !isVisible) return null;

  const currentStepData = steps[currentStep];
  const CurrentIcon = currentStepData.icon;

  const modalContent = (
    <Modal
      maxWidth="md"
      isOpen={isOpen}
      showCloseButton={false}
      confirmOnClose={false}
      className="classical-card "
    >
      {/* Modal */}
      <div className="p-8 relative overflow-hidden animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-4 right-4 text-6xl text-brand-primary animate-pulse">
            <GiGClef />
          </div>
          <div
            className="absolute bottom-4 left-4 text-4xl text-accent-purple animate-pulse"
            style={{ animationDelay: '1s' }}
          >
            <GiMusicalNotes />
          </div>
        </div>

        {/* Gradiente decorativo */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-brand-gradient rounded-full blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-20 -left-20 w-32 h-32 bg-accent-purple/30 rounded-full blur-2xl opacity-30 animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />

        <div className="relative z-10 text-center">
          {/* Ícone principal animado */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              {/* Círculo externo rotativo */}
              <div className="w-20 h-20 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />

              {/* Ícone central */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                  <CurrentIcon className="w-6 h-6 text-theme-primary animate-pulse" />
                </div>
              </div>

              {/* Partículas musicais flutuantes */}
              <div
                className="absolute -top-2 -right-2 w-4 h-4 text-accent-purple animate-bounce"
                style={{ animationDelay: '0.2s' }}
              >
                <GiMusicalNotes />
              </div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 text-accent-blue animate-bounce"
                style={{ animationDelay: '0.8s' }}
              >
                <GiMusicalNotes />
              </div>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            {currentLanguage === 'pt' ? 'Traduzindo...' : 'Translating...'}
          </h2>

          {/* Subtítulo com bandeiras */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="flex items-center space-x-2">
              {currentLanguage === 'pt' ? (
                // Bandeira do Brasil
                <span>🇧🇷</span>
              ) : (
                // Bandeira dos EUA
                <span>🇺🇸</span>
              )}
              <span className="text-theme-secondary text-sm font-medium">
                {currentLanguage === 'pt'
                  ? 'English → Português'
                  : 'Português → English'}
              </span>
            </div>
          </div>

          {/* Step atual */}
          <p className="text-theme-secondary mb-6 classical-subtitle">
            {currentLanguage === 'pt' ? currentStepData.pt : currentStepData.en}
          </p>

          {/* Barra de progresso */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-theme-tertiary mb-2">
              <span>{currentLanguage === 'pt' ? 'Progresso' : 'Progress'}</span>
              <span>{progress}%</span>
            </div>

            <div className="w-full h-2 bg-theme-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-gradient rounded-full transition-all duration-200 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect mais rápido */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer-fast" />
              </div>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index <= currentStep
                    ? 'bg-brand-primary shadow-theme-glow'
                    : 'bg-theme-secondary'
                }`}
              />
            ))}
          </div>

          {/* Nota motivacional */}
          <div className="mt-6 p-4 bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 border-l-4 border-brand-primary rounded-xl">
            <p className="text-sm text-theme-secondary italic">
              {currentLanguage === 'pt'
                ? '"A música é a linguagem universal da humanidade."'
                : '"Music is the universal language of mankind."'}
            </p>
            <cite className="text-xs text-brand-primary font-medium block mt-1">
              — Henry Wadsworth Longfellow
            </cite>
          </div>
        </div>
      </div>

      {/* CSS personalizado para animações */}
      <style jsx>{`
        @keyframes shimmer-fast {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-shimmer-fast {
          animation: shimmer-fast 1s infinite;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out;
        }
      `}</style>
    </Modal>
  );

  // ✅ Renderizar via Portal no body
  return createPortal(modalContent, document.body);
}
