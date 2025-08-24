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
  const [shouldAccelerate, setShouldAccelerate] = useState(false);
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
      setShouldAccelerate(false);
    } else if (hasStarted) {
      // ✅ Se isOpen vira false, acelerar para finalizar
      setShouldAccelerate(true);
    }
  }, [isOpen, hasStarted]);

  // ✅ Lógica de progresso melhorada com timing controlado
  useEffect(() => {
    if (!isVisible || !hasStarted) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // ✅ Modal completou - fechar após delay
          setTimeout(() => {
            setIsVisible(false);
            setHasStarted(false);
            onComplete?.();
          }, 500);
          return 100;
        }

        // ✅ Velocidade baseada no estado
        let increment;
        if (shouldAccelerate) {
          // Se tradução já acabou, acelerar para finalizar
          increment = 25; // Muito rápido
        } else if (prev < 30) {
          increment = 8; // Início moderado
        } else if (prev < 70) {
          increment = 6; // Meio mais lento
        } else {
          increment = 4; // Final mais devagar
        }

        const newProgress = Math.min(prev + increment, 100);

        // Atualizar step baseado no progresso
        const newStep = Math.floor((newProgress / 100) * (steps.length - 1));
        setCurrentStep(newStep);

        return newProgress;
      });
    }, 300); // Intervalo menor quando acelerando

    return () => clearInterval(interval);
  }, [isVisible, hasStarted, shouldAccelerate, steps.length, onComplete]);

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
                <div className="w-12 h-12  rounded-xl flex items-center justify-center shadow-theme-glow group-hover:scale-110 transition-transform duration-500">
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
              <div className="w-6 h-6 relative overflow-hidden rounded border border-theme-secondary">
                {currentLanguage === 'pt' ? (
                  // Bandeira do Brasil
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-green-500" />
                    <div
                      className="absolute inset-0 bg-yellow-400"
                      style={{ top: '30%', bottom: '30%' }}
                    />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  </div>
                ) : (
                  // Bandeira dos EUA
                  <div className="absolute inset-0">
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <div
                        key={i}
                        className={`absolute left-0 right-0 h-1/7 ${
                          i % 2 === 0 ? 'bg-red-600' : 'bg-white'
                        }`}
                        style={{ top: `${(i / 7) * 100}%` }}
                      />
                    ))}
                    <div className="absolute top-0 left-0 bg-blue-800 w-2/5 h-2/5" />
                  </div>
                )}
              </div>
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
                className="h-full bg-brand-gradient rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Steps indicator */}
          <div className="flex justify-center space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-shimmer {
          animation: shimmer 1.5s infinite;
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
          animation: fade-in-up 0.5s ease-out;
        }
      `}</style>
    </Modal>
  );

  // ✅ Renderizar via Portal no body
  return createPortal(modalContent, document.body);
}
