// hooks/useAnimations.ts - Hooks reutilizáveis para animações
'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

// Hook para controlar animações baseadas em scroll
export const useScrollAnimation = (threshold: number = 0.3) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return { ref, isInView };
};

// Hook para sequências de animação
export const useAnimationSequence = (steps: number, delay: number = 100) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentStep < steps) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        if (currentStep + 1 === steps) {
          setIsComplete(true);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [currentStep, steps, delay]);

  const resetSequence = () => {
    setCurrentStep(0);
    setIsComplete(false);
  };

  const isStepActive = (step: number) => currentStep >= step;

  return {
    currentStep,
    isComplete,
    resetSequence,
    isStepActive,
  };
};

// Hook para animações de loading com estados
export const useLoadingAnimation = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const finishLoading = () => {
    setIsLoading(false);
    // Delay para transição suave
    setTimeout(() => setShowContent(true), 300);
  };

  const resetLoading = () => {
    setIsLoading(true);
    setShowContent(false);
  };

  return {
    isLoading,
    showContent,
    finishLoading,
    resetLoading,
  };
};

// Hook para animações de hover mais complexas
export const useHoverAnimation = () => {
  const [isHovered, setIsHovered] = useState(false);

  const hoverProps = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  return { isHovered, hoverProps };
};

// Hook para performance de animações
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
};

// Hook para stagger timing inteligente
export const useStaggerTiming = (
  itemCount: number,
  maxDelay: number = 1000
) => {
  const baseDelay = Math.min(maxDelay / itemCount, 100);

  const getItemDelay = (index: number) => index * baseDelay;

  const getStaggerConfig = (speed: 'fast' | 'normal' | 'slow' = 'normal') => {
    const multipliers = { fast: 0.5, normal: 1, slow: 1.5 };
    return baseDelay * multipliers[speed];
  };

  return {
    getItemDelay,
    getStaggerConfig,
    totalDuration: itemCount * baseDelay,
  };
};
