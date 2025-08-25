// hooks/useAdaptiveStats.ts
'use client';

import { useState, useEffect } from 'react';

interface UseAdaptiveStatsReturn {
  isVisible: boolean;
  toggleVisibility: () => void;
  isMobile: boolean;
  showInline: boolean; // true = mostrar inline, false = esconder ou modal
  openModal: () => void;
  isModalOpen: boolean;
  closeModal: () => void;
}

export function useAdaptiveStats(key: string): UseAdaptiveStatsReturn {
  const [isVisible, setIsVisible] = useState(false); // Padrão escondido
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Detectar mobile (lg breakpoint = 1024px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Carregar estado do localStorage apenas para desktop
  useEffect(() => {
    if (!isMobile) {
      const saved = localStorage.getItem(`stats-visible-${key}`);
      if (saved !== null) {
        setIsVisible(saved === 'true');
      }
    }
  }, [key, isMobile]);

  // Salvar estado no localStorage apenas para desktop
  const toggleVisibility = () => {
    if (isMobile) {
      // Mobile: abrir modal
      setIsModalOpen(true);
    } else {
      // Desktop: toggle inline
      const newValue = !isVisible;
      setIsVisible(newValue);
      localStorage.setItem(`stats-visible-${key}`, newValue.toString());
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // showInline: true apenas para desktop quando visível
  const showInline = !isMobile && isVisible;

  return {
    isVisible,
    toggleVisibility,
    isMobile,
    showInline,
    openModal,
    isModalOpen,
    closeModal,
  };
}

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
