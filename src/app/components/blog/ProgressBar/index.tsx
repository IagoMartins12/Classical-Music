'use client';

import { useState, useEffect } from 'react';
import { BsArrowUp } from 'react-icons/bs';

export function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Verificação segura para SSR
      if (typeof window === 'undefined') return;

      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const totalHeight = documentHeight - windowHeight;
      const scrollProgress = (scrollTop / totalHeight) * 100;

      setProgress(Math.min(100, Math.max(0, scrollProgress)));
      setIsVisible(scrollTop > 300);
      setRemainingTime(Math.ceil((100 - scrollProgress) / 5));
    };

    // Verificação inicial
    if (typeof window !== 'undefined') {
      handleScroll();
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getProgressText = () => {
    if (progress < 25) return 'Começando...';
    if (progress < 50) return 'Indo bem!';
    if (progress < 75) return 'Quase lá!';
    if (progress < 100) return 'Finalizando...';
    return 'Concluído! 🎉';
  };

  return (
    <div className="sticky top-24">
      <div className="classical-card p-4">
        {/* Progress Circle */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90">
            {/* Background circle */}
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="var(--border-secondary)"
              strokeWidth="4"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              cx="48"
              cy="48"
              r="44"
              stroke="var(--brand-primary)"
              strokeWidth="4"
              fill="none"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 * (1 - (progress || 0) / 100)}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-brand-primary">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Labels */}
        <div className="text-center space-y-1">
          <div className="text-xs text-theme-tertiary">Progresso</div>
          <div className="text-sm font-medium text-theme-secondary">
            {getProgressText()}
          </div>
        </div>

        {/* Scroll to Top Button */}
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="mt-4 w-full py-2 btn-classical-primary flex items-center justify-center space-x-2"
            aria-label="Voltar ao topo"
          >
            <BsArrowUp className="w-4 h-4" />
            <span>Topo</span>
          </button>
        )}

        {/* Reading Stats */}
        <div className="mt-6 pt-4 border-t border-theme-secondary space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-theme-tertiary">Tempo estimado</span>
            <span className="text-theme-secondary font-medium">
              {remainingTime} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
