// app/hooks/notifications/usePageVisibility.ts - HOOK APRIMORADO PARA DETECTAR FOCO NA ABA
'use client';

import { useState, useEffect, useCallback } from 'react';

interface UsePageVisibilityOptions {
  onVisible?: () => void;
  onHidden?: () => void;
  debounceMs?: number;
}

export const usePageVisibility = (options?: UsePageVisibilityOptions) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastVisibleTime, setLastVisibleTime] = useState<Date | null>(null);

  const { onVisible, onHidden, debounceMs = 1000 } = options || {};

  // Debounce function para evitar múltiplos triggers
  const debounce = useCallback((func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(func, delay);
    };
  }, []);

  // Handlers com debounce
  const debouncedOnVisible = useCallback(
    debounce(() => {
      console.log('📬 [PAGE-VISIBILITY] ✅ Página ficou visível');
      setLastVisibleTime(new Date());
      onVisible?.();
    }, debounceMs),
    [onVisible, debounceMs]
  );

  const debouncedOnHidden = useCallback(
    debounce(() => {
      console.log('📬 [PAGE-VISIBILITY] 👁️ Página ficou oculta');
      onHidden?.();
    }, debounceMs),
    [onHidden, debounceMs]
  );

  useEffect(() => {
    // Verificar se APIs estão disponíveis
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Função para verificar visibilidade
    const handleVisibilityChange = () => {
      const visible = !document.hidden;

      console.log(
        `📬 [PAGE-VISIBILITY] Estado mudou: ${visible ? 'VISÍVEL' : 'OCULTO'}`
      );

      setIsVisible(visible);

      if (visible) {
        debouncedOnVisible();
      } else {
        debouncedOnHidden();
      }
    };

    // Handlers para eventos de foco da janela
    const handleFocus = () => {
      console.log('📬 [PAGE-VISIBILITY] 🎯 Window focou');
      setIsVisible(true);
      debouncedOnVisible();
    };

    const handleBlur = () => {
      console.log('📬 [PAGE-VISIBILITY] 😴 Window perdeu foco');
      setIsVisible(false);
      debouncedOnHidden();
    };

    // Estado inicial
    setIsVisible(!document.hidden);
    setLastVisibleTime(new Date());

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [debouncedOnVisible, debouncedOnHidden]);

  return {
    isVisible,
    lastVisibleTime,
    isHidden: !isVisible,
  };
};

// Hook simples sem callbacks (para compatibilidade)
export const useSimplePageVisibility = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    setIsVisible(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isVisible;
};
