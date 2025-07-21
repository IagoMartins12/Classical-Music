// app/hooks/useMediaQuery.ts - Hook para detectar media queries e tipo de dispositivo

import { useState, useEffect } from 'react';

/**
 * Hook para detectar media queries
 * @param query - Media query string (ex: "(max-width: 768px)")
 * @returns boolean indicando se a query é verdadeira
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  useEffect(() => {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);

    // Set inicial
    setMatches(mediaQuery.matches);

    // Listener para mudanças
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Adicionar listener (suporte a métodos antigos e novos)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback para navegadores mais antigos
      mediaQuery.addListener(handler);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback para navegadores mais antigos
        mediaQuery.removeListener(handler);
      }
    };
  }, [query]);

  return matches;
}

/**
 * Hook para detectar breakpoints específicos
 */
export function useBreakpoints() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isLargeDesktop = useMediaQuery('(min-width: 1280px)');
  const isXLDesktop = useMediaQuery('(min-width: 1536px)');

  return {
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    isXLDesktop,
    // Aliases convenientes
    isSmall: isMobile,
    isMedium: isTablet,
    isLarge: isDesktop,
    isXL: isLargeDesktop,
    is2XL: isXLDesktop,
  };
}

/**
 * Hook para detectar tipo de dispositivo específico
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}

/**
 * Hook para detectar orientação do dispositivo
 */
export function useOrientation(): 'portrait' | 'landscape' {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * Hook para detectar se o usuário prefere movimento reduzido
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Hook para detectar tema preferido do sistema
 */
export function usePrefersColorScheme(): 'light' | 'dark' {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDark ? 'dark' : 'light';
}

/**
 * Hook para detectar se o dispositivo suporta hover
 */
export function useCanHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/**
 * Hook para detectar densidade de pixels
 */
export function usePixelRatio(): number {
  const [pixelRatio, setPixelRatio] = useState<number>(1);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updatePixelRatio = () => {
      setPixelRatio(window.devicePixelRatio || 1);
    };

    updatePixelRatio();

    // Listener para mudanças na densidade
    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`
    );

    const handler = () => {
      updatePixelRatio();
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      mediaQuery.addListener(handler);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);

  return pixelRatio;
}

/**
 * Hook para detectar largura da viewport
 */
export function useViewportWidth(): number {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    updateWidth();

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return width;
}

/**
 * Hook para detectar altura da viewport
 */
export function useViewportHeight(): number {
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateHeight = () => {
      setHeight(window.innerHeight);
    };

    updateHeight();

    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return height;
}

/**
 * Hook combinado para detectar todas as informações do dispositivo
 */
export function useDeviceInfo() {
  const deviceType = useDeviceType();
  const breakpoints = useBreakpoints();
  const orientation = useOrientation();
  const prefersReducedMotion = usePrefersReducedMotion();
  const prefersColorScheme = usePrefersColorScheme();
  const canHover = useCanHover();
  const pixelRatio = usePixelRatio();
  const viewportWidth = useViewportWidth();
  const viewportHeight = useViewportHeight();

  return {
    deviceType,
    ...breakpoints,
    orientation,
    prefersReducedMotion,
    prefersColorScheme,
    canHover,
    pixelRatio,
    viewport: {
      width: viewportWidth,
      height: viewportHeight,
    },
    // Funções utilitárias
    isRetina: pixelRatio >= 2,
    isTouchDevice: !canHover,
    isLandscapePhone: deviceType === 'mobile' && orientation === 'landscape',
    isPortraitTablet: deviceType === 'tablet' && orientation === 'portrait',
  };
}

/**
 * Hook para detectar mudanças no tamanho da tela com debounce
 */
export function useDebouncedResize(delay: number = 250) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timeoutId: NodeJS.Timeout;

    const updateSize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    updateSize(); // Set inicial

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return size;
}
