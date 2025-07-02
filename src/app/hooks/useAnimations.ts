// hooks/useAnimations.ts - Hooks reutilizáveis para animações (Versão Corrigida)
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
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

  const resetSequence = useCallback(() => {
    setCurrentStep(0);
    setIsComplete(false);
  }, []);

  const isStepActive = useCallback(
    (step: number) => currentStep >= step,
    [currentStep]
  );

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

  const finishLoading = useCallback(() => {
    setIsLoading(false);
    // Delay para transição suave
    setTimeout(() => setShowContent(true), 300);
  }, []);

  const resetLoading = useCallback(() => {
    setIsLoading(true);
    setShowContent(false);
  }, []);

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

  const getItemDelay = useCallback(
    (index: number) => index * baseDelay,
    [baseDelay]
  );

  const getStaggerConfig = useCallback(
    (speed: 'fast' | 'normal' | 'slow' = 'normal') => {
      const multipliers = { fast: 0.5, normal: 1, slow: 1.5 };
      return baseDelay * multipliers[speed];
    },
    [baseDelay]
  );

  return {
    getItemDelay,
    getStaggerConfig,
    totalDuration: itemCount * baseDelay,
  };
};

// Hook para controlar animações em grids/listas
export const useGridAnimation = (items: any[], cols: number = 4) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  useEffect(() => {
    // Animar itens por linha
    const totalRows = Math.ceil(items.length / cols);

    for (let row = 0; row < totalRows; row++) {
      setTimeout(() => {
        const startIndex = row * cols;
        const endIndex = Math.min(startIndex + cols, items.length);
        const newVisibleItems = Array.from(
          { length: endIndex - startIndex },
          (_, i) => startIndex + i
        );

        setVisibleItems((prev) => [...prev, ...newVisibleItems]);
      }, row * 100); // 100ms delay between rows
    }
  }, [items.length, cols]);

  const isItemVisible = useCallback(
    (index: number) => {
      return visibleItems.includes(index);
    },
    [visibleItems]
  );

  const resetAnimation = useCallback(() => {
    setVisibleItems([]);
  }, []);

  return {
    isItemVisible,
    resetAnimation,
    allVisible: visibleItems.length === items.length,
  };
};

// Hook para transições entre páginas
export const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<
    'forward' | 'backward'
  >('forward');

  const startTransition = useCallback(
    (direction: 'forward' | 'backward' = 'forward') => {
      setTransitionDirection(direction);
      setIsTransitioning(true);
    },
    []
  );

  const endTransition = useCallback(() => {
    setIsTransitioning(false);
  }, []);

  return {
    isTransitioning,
    transitionDirection,
    startTransition,
    endTransition,
  };
};

// Hook para animações de scroll reveal
export const useScrollReveal = (options?: {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}) => {
  const { threshold = 0.1, triggerOnce = true } = options || {};

  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: threshold,
    // Removido margin pois não é compatível com todas as versões
    // Use threshold e rootMargin via Intersection Observer se necessário
  });

  return { ref, isInView };
};

// Hook para animações de typing effect
export const useTypingEffect = (text: string, speed: number = 50) => {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (text) {
      setDisplayText('');
      setIsComplete(false);

      let currentIndex = 0;
      const timer = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          setIsComplete(true);
          clearInterval(timer);
        }
      }, speed);

      return () => clearInterval(timer);
    }
  }, [text, speed]);

  return { displayText, isComplete };
};

// Hook para gerenciar estados de animação de loading
export const useLoadingStates = () => {
  const [loadingState, setLoadingState] = useState<
    'loading' | 'success' | 'error' | 'idle'
  >('idle');
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingState('loading');
    setProgress(0);
  }, []);

  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(100, Math.max(0, newProgress)));
  }, []);

  const finishLoading = useCallback((success: boolean = true) => {
    setProgress(100);
    setTimeout(() => {
      setLoadingState(success ? 'success' : 'error');
    }, 200);
  }, []);

  const resetLoading = useCallback(() => {
    setLoadingState('idle');
    setProgress(0);
  }, []);

  return {
    loadingState,
    progress,
    startLoading,
    updateProgress,
    finishLoading,
    resetLoading,
    isLoading: loadingState === 'loading',
    isSuccess: loadingState === 'success',
    isError: loadingState === 'error',
    isIdle: loadingState === 'idle',
  };
};

// Hook para animações de count up
export const useCountUp = (
  endValue: number,
  duration: number = 2000,
  startOnMount: boolean = true
) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    setIsAnimating(true);
    setCurrentValue(0);

    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease out)
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(easedProgress * endValue);

      setCurrentValue(value);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrentValue(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [endValue, duration]);

  useEffect(() => {
    if (startOnMount) {
      startAnimation();
    }
  }, [startOnMount, startAnimation]);

  return {
    currentValue,
    isAnimating,
    startAnimation,
  };
};

// Hook para debounce em animações
export const useAnimationDebounce = <T extends any[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  const debouncedCallback = useCallback(
    (...args: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};
