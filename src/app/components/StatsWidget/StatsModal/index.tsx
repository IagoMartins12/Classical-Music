// components/stats/StatsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiMaximize2,
  FiMinimize2,
  FiShare2,
  FiDownload,
  FiBarChart2,
} from 'react-icons/fi';
import { AnimatedCard } from '../../animation/AnimatedComponents';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  category: 'favorites' | 'learning' | 'annotations';
}

// Hook para detectar orientação do device
const useOrientation = () => {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return isLandscape;
};

export default function StatsModal({
  isOpen,
  onClose,
  title,
  children,
  category,
}: StatsModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const isLandscape = useOrientation();

  // Cores por categoria
  const categoryColors = {
    favorites: {
      gradient: 'from-brand-primary to-brand-secondary',
      accent: 'text-brand-primary',
      bg: 'bg-brand-primary/10',
    },
    learning: {
      gradient: 'from-accent-green to-accent-blue',
      accent: 'text-accent-green',
      bg: 'bg-accent-green/10',
    },
    annotations: {
      gradient: 'from-accent-purple to-accent-blue',
      accent: 'text-accent-purple',
      bg: 'bg-accent-purple/10',
    },
  };

  const colors = categoryColors[category];

  // Função para compartilhar stats (simulada)
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Minhas Estatísticas - ${title}`,
          text: `Confira minhas estatísticas no Opus Atlas!`,
          url: window.location.href,
        });
      } else {
        // Fallback: copiar para clipboard
        await navigator.clipboard.writeText(window.location.href);
        // Aqui você poderia mostrar um toast de sucesso
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  // Função para "download" de relatório (simulada)
  const handleDownload = () => {
    // Implementação futura: gerar PDF ou imagem das stats
    console.log('Download de relatório ainda não implementado');
  };

  // Gesture handlers para swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    const diff = touchY - startY;

    // Apenas permitir arrastar para baixo
    if (diff > 0) {
      setCurrentY(touchY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const diff = currentY - startY;

    // Se arrastou mais que 100px para baixo, fecha o modal
    if (diff > 100) {
      onClose();
    }

    setIsDragging(false);
    setCurrentY(0);
    setStartY(0);
  };

  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 
          ${isFullscreen ? 'top-0' : 'top-16'}
          transition-all duration-300 ease-out
        `}
        style={{
          transform: `translateY(${translateY}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <AnimatedCard
          hover="none"
          className={`
            h-full bg-theme-elevated border-t-4 border-l-4 border-r-4 
            ${
              colors.gradient
                .replace('from-', 'border-')
                .replace('to-', '')
                .split(' ')[0]
            }
            rounded-t-3xl shadow-2xl
            flex flex-col overflow-hidden
          `}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 pb-2">
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-theme-tertiary/30 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center`}
                >
                  <FiBarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-theme-primary">{title}</h3>
                  <p className="text-sm text-theme-tertiary">
                    {isLandscape ? 'Modo paisagem ativo' : 'Toque para navegar'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Action Buttons */}
                <button
                  onClick={handleShare}
                  className="w-10 h-10 bg-theme-secondary rounded-xl flex items-center justify-center hover:bg-theme-primary transition-colors"
                >
                  <FiShare2 className="w-4 h-4 text-theme-tertiary" />
                </button>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="w-10 h-10 bg-theme-secondary rounded-xl flex items-center justify-center hover:bg-theme-primary transition-colors"
                >
                  {isFullscreen ? (
                    <FiMinimize2 className="w-4 h-4 text-theme-tertiary" />
                  ) : (
                    <FiMaximize2 className="w-4 h-4 text-theme-tertiary" />
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-theme-secondary rounded-xl flex items-center justify-center hover:bg-accent-red/20 transition-colors group"
                >
                  <FiX className="w-4 h-4 text-theme-tertiary group-hover:text-accent-red" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-6">{children}</div>
          </div>

          {/* Footer Actions (visible only when not fullscreen) */}
          {!isFullscreen && (
            <div className="flex-shrink-0 p-4 pt-2 border-t border-theme-primary/20">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center space-x-2 py-3 bg-theme-secondary rounded-xl hover:bg-theme-primary transition-colors"
                >
                  <FiDownload className="w-4 h-4 text-theme-tertiary" />
                  <span className="text-sm text-theme-tertiary">Exportar</span>
                </button>

                <button
                  onClick={handleShare}
                  className={`flex items-center justify-center space-x-2 py-3 ${colors.bg} rounded-xl transition-colors`}
                >
                  <FiShare2 className={`w-4 h-4 ${colors.accent}`} />
                  <span className={`text-sm ${colors.accent} font-medium`}>
                    Compartilhar
                  </span>
                </button>
              </div>
            </div>
          )}
        </AnimatedCard>
      </div>
    </div>
  );
}

// Hook para controlar o modal de stats
export const useStatsModal = (
  category: 'favorites' | 'learning' | 'annotations'
) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const Modal = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <StatsModal
      isOpen={isOpen}
      onClose={closeModal}
      title={title}
      category={category}
    >
      {children}
    </StatsModal>
  );

  return {
    isModalOpen: isOpen,
    openModal,
    closeModal,
    Modal,
  };
};
