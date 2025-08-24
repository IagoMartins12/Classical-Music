// hooks/useMobile.ts
'use client';

import { useState, useEffect } from 'react';

// Hook para detectar se é mobile
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check inicial
    checkMobile();

    // Listen para mudanças
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
};

// Hook para visibilidade de stats com comportamento diferente no mobile
export const useStatsVisibility = (key: string) => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const saved = localStorage.getItem(`stats-visible-${key}`);

    // No mobile, padrão é escondido sempre
    // No desktop, usa o valor salvo ou escondido como padrão
    if (isMobile) {
      setIsVisible(false);
    } else {
      setIsVisible(saved === 'true');
    }
  }, [key, isMobile]);

  const toggleVisibility = () => {
    const newValue = !isVisible;
    setIsVisible(newValue);
    localStorage.setItem(`stats-visible-${key}`, newValue.toString());
  };

  return { isVisible, toggleVisibility, isMobile };
};

// Hook para adaptar o comportamento dos stats no mobile
export const useAdaptiveStats = (key: string) => {
  const { isVisible, toggleVisibility, isMobile } = useStatsVisibility(key);

  // No mobile, sempre usar modal/fullscreen para stats
  // No desktop, usar inline expansion
  const showInModal = isMobile && isVisible;
  const showInline = !isMobile && isVisible;

  return {
    isVisible,
    toggleVisibility,
    isMobile,
    showInModal,
    showInline,
  };
};

// Hook para otimizar re-renders de stats
export const useStatsOptimization = () => {
  const [isStatsCalculating, setIsStatsCalculating] = useState(false);

  const withStatsCalculation = async <T,>(
    fn: () => Promise<T> | T
  ): Promise<T> => {
    setIsStatsCalculating(true);
    try {
      const result = await fn();
      return result;
    } finally {
      // Usar timeout para evitar flicker
      setTimeout(() => setIsStatsCalculating(false), 100);
    }
  };

  return {
    isStatsCalculating,
    withStatsCalculation,
  };
};
