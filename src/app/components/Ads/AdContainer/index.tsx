// app/components/Ads/AdContainer.tsx - Container atualizado para sistema premium
'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AdDisplay from '../AdDisplay';

interface AdContainerProps {
  placement:
    | 'HEADER'
    | 'SIDEBAR_LEFT'
    | 'SIDEBAR_RIGHT'
    | 'CONTENT_TOP'
    | 'CONTENT_BOTTOM'
    | 'BETWEEN_CONTENT'
    | 'FOOTER'
    | 'MODAL';
  className?: string;
  workId?: string;
  composerId?: string | null;
  instrumentId?: string | null;
  epochId?: string;
  priority?: 'high' | 'normal' | 'low';
  maxAds?: number;
}

export default function AdContainer({
  placement,
  className = '',
  workId,
  composerId,
  instrumentId,
  epochId,
  priority = 'normal',
  maxAds,
}: AdContainerProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Não mostrar ads para super admins
  if (session?.user?.role === 2) {
    return null;
  }

  // Verificar se usuário desabilitou ads (implementar quando houver configurações)
  // if (session?.user?.showAds === false) {
  //   return null;
  // }

  // Determinar targeting baseado na página atual e props
  let targetType = 'GENERAL';
  let selectedInstrumentId: string | undefined;
  let userLevel = 'ALL';

  // Determinar nível do usuário
  if (session?.user?.role === 1) {
    userLevel = 'TEACHER';
  } else if (session?.user?.role === 0) {
    userLevel = 'STUDENT';
  }

  // Targeting inteligente baseado na página e props
  if (instrumentId) {
    targetType = 'INSTRUMENT';
    selectedInstrumentId = instrumentId;
  } else if (pathname.includes('/works/') && workId) {
    // Para páginas de obras, manter targeting geral mas pode evoluir
    targetType = 'GENERAL';
  } else if (pathname.includes('/instruments/')) {
    // Se estiver numa página de instrumento específico
    const instrumentFromPath = pathname
      .split('/instruments/')[1]
      ?.split('/')[0];
    if (instrumentFromPath) {
      targetType = 'INSTRUMENT';
      selectedInstrumentId = instrumentFromPath;
    }
  } else if (pathname.includes('/composers/') && composerId) {
    // Futuro: targeting por compositor específico
    targetType = 'GENERAL';
  } else if (pathname.includes('/admin/')) {
    // Não mostrar ads em páginas admin
    return null;
  }

  // Configurações específicas por posicionamento com design premium
  const getPlacementConfig = () => {
    switch (placement) {
      case 'HEADER':
        return {
          maxAds: 1,
          showTitle: false,
          showAdvertiserName: false,
          className: 'w-full mb-4',
          containerClass: 'ad-premium-header-container',
          priority: 'high',
        };

      case 'SIDEBAR_RIGHT':
        return {
          maxAds: maxAds || 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full space-y-6',
          containerClass: 'ad-premium-sidebar-container sticky top-4',
          priority: priority,
        };

      case 'SIDEBAR_LEFT':
        return {
          maxAds: maxAds || 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full space-y-6',
          containerClass: 'ad-premium-sidebar-container sticky top-4',
          priority: priority,
        };

      case 'CONTENT_TOP':
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full max-w-4xl mx-auto mb-8',
          containerClass: 'ad-premium-content-container',
          priority: 'normal',
        };

      case 'CONTENT_BOTTOM':
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full max-w-4xl mx-auto mt-8',
          containerClass: 'ad-premium-content-container',
          priority: 'low',
        };

      case 'BETWEEN_CONTENT':
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: false,
          className: 'w-full my-12 max-w-5xl mx-auto',
          containerClass: 'ad-premium-between-container',
          priority: 'normal',
        };

      case 'FOOTER':
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full',
          containerClass: 'ad-premium-footer-container mt-8',
          priority: 'low',
        };

      default:
        return {
          maxAds: 1,
          showTitle: true,
          showAdvertiserName: true,
          className: 'w-full',
          containerClass: 'ad-premium-default-container',
          priority: 'normal',
        };
    }
  };

  const config = getPlacementConfig();

  // Context-aware targeting aprimorado
  const getContextualTargeting = () => {
    // Páginas de obras específicas
    if (pathname.includes('/works/') && workId) {
      return {
        context: 'work_detail',
        workId,
        composerId,
        instrumentId: selectedInstrumentId,
      };
    }

    // Páginas de compositores
    if (pathname.includes('/composers/') && composerId) {
      return {
        context: 'composer_detail',
        composerId,
        epochId,
      };
    }

    // Páginas de instrumentos
    if (pathname.includes('/instruments/') && selectedInstrumentId) {
      return {
        context: 'instrument_detail',
        instrumentId: selectedInstrumentId,
      };
    }

    // Página inicial
    if (pathname === '/') {
      return {
        context: 'home',
        priority: 'high',
      };
    }

    // Páginas de busca
    if (pathname.includes('/search')) {
      return {
        context: 'search',
        priority: 'low',
      };
    }

    return {
      context: 'general',
    };
  };

  const contextualData = getContextualTargeting();

  // Condições para não exibir
  const shouldSkipAd = () => {
    // Não mostrar em modais se não for o placement correto
    if (placement === 'MODAL') {
      return true; // Modal ads são gerenciados pelo AdsProvider
    }

    // Não mostrar muitos ads em mobile
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      if (isMobile && placement === 'SIDEBAR_LEFT') {
        return true; // Sidebar esquerda não faz sentido em mobile
      }
    }

    // Rate limiting simples - não mostrar sidebar ads em todas as páginas
    if (
      (placement === 'SIDEBAR_RIGHT' || placement === 'SIDEBAR_LEFT') &&
      Math.random() < 0.1
    ) {
      // 10% chance de não mostrar para não incomodar
      return true;
    }

    return false;
  };

  if (shouldSkipAd()) {
    return null;
  }

  return (
    <div
      className={`ads-premium-wrapper ${config.containerClass} ${className}`}
      data-placement={placement}
      data-priority={config.priority}
      data-context={contextualData.context}
    >
      <AdDisplay
        placement={placement}
        targetType={targetType}
        instrumentId={selectedInstrumentId}
        userLevel={userLevel}
        maxAds={config.maxAds}
        showTitle={config.showTitle}
        showAdvertiserName={config.showAdvertiserName}
        className={config.className}
      />

      {/* Estilos específicos para cada container */}
      <style jsx>{`
        .ads-premium-wrapper {
          position: relative;
          z-index: 10;
        }

        .ad-premium-header-container {
          background: linear-gradient(
            135deg,
            transparent 0%,
            rgba(212, 175, 55, 0.05) 100%
          );
          border-radius: 12px;
          overflow: hidden;
        }

        .ad-premium-sidebar-container {
          max-width: 320px;
        }

        .ad-premium-content-container {
          position: relative;
        }

        .ad-premium-content-container::before {
          content: '';
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--ad-gold-primary),
            transparent
          );
          opacity: 0.5;
        }

        .ad-premium-between-container {
          position: relative;
          margin: 3rem auto;
        }

        .ad-premium-footer-container {
          border-top: 1px solid rgba(212, 175, 55, 0.1);
          padding-top: 2rem;
          margin-top: 3rem;
        }

        /* Loading placeholder */
        .ad-loading-placeholder {
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Intersection observer trigger */
        .ads-premium-wrapper[data-priority='high'] {
          /* Carrega primeiro */
          z-index: 15;
        }

        .ads-premium-wrapper[data-priority='low'] {
          /* Carrega por último */
          z-index: 5;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .ad-premium-sidebar-container {
            max-width: 100%;
            position: static !important;
            margin: 1rem 0;
          }

          .ad-premium-between-container {
            margin: 2rem auto;
          }

          .ad-premium-between-container::before,
          .ad-premium-between-container::after {
            display: none;
          }

          .ad-premium-header-container {
            margin-bottom: 1rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .ad-premium-header-container {
            background: linear-gradient(
              135deg,
              transparent 0%,
              rgba(212, 175, 55, 0.08) 100%
            );
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .ad-premium-content-container::before,
          .ad-premium-between-container::before,
          .ad-premium-between-container::after {
            opacity: 0.8;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ads-premium-wrapper * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Print styles */
        @media print {
          .ads-premium-wrapper {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
