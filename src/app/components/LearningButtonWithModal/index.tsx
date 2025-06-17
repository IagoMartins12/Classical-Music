// components/LearningButton/LearningButtonWithModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiBookOpen,
  FiCheckCircle,
  FiTarget,
  FiStar,
  FiEdit3,
  FiX,
} from 'react-icons/fi';
import {
  LearnedItem,
  useLearningStore,
  WantToLearnItem,
} from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';
import LearningModal from '../LearningModal';

export type LearningType = 'want-to-learn' | 'learned';

interface LearningButtonWithModalProps {
  workId: string;
  workTitle: string;
  composerName: string;
  type: LearningType;
  variant?: 'default' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
}

const LearningButtonWithModal = ({
  workId,
  workTitle,
  composerName,
  type,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  style,
}: LearningButtonWithModalProps) => {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const {
    isWantToLearn,
    isLearned,
    removeWantToLearn,
    removeLearned,
    loading,
    getWantToLearnItem,
    getLearnedItem,
  } = useLearningStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estados derivados
  const isActive = mounted
    ? type === 'want-to-learn'
      ? isWantToLearn(workId)
      : isLearned(workId)
    : false;

  const isLoading = mounted
    ? type === 'want-to-learn'
      ? loading.wantToLearn.has(workId)
      : loading.learned.has(workId)
    : false;

  // Obter dados do item atual
  const currentItem = mounted
    ? (() => {
        if (type === 'want-to-learn') {
          return getWantToLearnItem(workId);
        } else {
          return getLearnedItem(workId);
        }
      })()
    : null;

  const currentLevel = currentItem
    ? type === 'want-to-learn'
      ? (currentItem as WantToLearnItem).priority
      : (currentItem as LearnedItem).mastery
    : 3;

  // Configurações baseadas no tipo
  const config =
    type === 'want-to-learn'
      ? {
          labels: {
            active: 'Quero estudar',
            inactive: 'Quero estudar',
            remove: 'Remover da lista',
          },
          icon: isActive ? FiTarget : FiBookOpen,
          colors: {
            active:
              'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-600 shadow-blue-500/20',
            inactive:
              'border-theme-primary/30 text-theme-primary hover:border-blue-500/50 hover:text-blue-600',
            levelBg: 'bg-blue-50 border-blue-200',
            levelText: 'text-blue-700',
          },
          levelLabels: ['Baixa', 'Baixa-Média', 'Média', 'Média-Alta', 'Alta'],
        }
      : {
          labels: {
            active: 'Já aprendi',
            inactive: 'Marcar como aprendida',
            remove: 'Remover da lista',
          },
          icon: isActive ? FiCheckCircle : FiBookOpen,
          colors: {
            active:
              'from-green-500/20 to-green-600/20 border-green-500/50 text-green-600 shadow-green-500/20',
            inactive:
              'border-theme-primary/30 text-theme-primary hover:border-green-500/50 hover:text-green-600',
            levelBg: 'bg-green-50 border-green-200',
            levelText: 'text-green-700',
          },
          levelLabels: [
            'Iniciante',
            'Básico',
            'Intermediário',
            'Avançado',
            'Expert',
          ],
        };

  // Tamanhos responsivos
  const sizes = {
    sm: { button: 'h-8 px-3 text-sm', icon: 'w-3 h-3', text: 'text-xs' },
    md: { button: 'h-10 px-4 text-sm', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { button: 'h-12 px-6 text-base', icon: 'w-5 h-5', text: 'text-base' },
  };

  // Classes do botão principal
  const getButtonClasses = () => {
    const baseClasses = `
      ${sizes[size].button}
      rounded-xl
      transition-all 
      duration-300 
      hover:scale-105 
      active:scale-95
      flex 
      items-center 
      justify-center
      border
      font-medium
      relative
      overflow-hidden
      group
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    if (isActive) {
      return `${baseClasses} bg-gradient-to-r ${config.colors.active} shadow-lg`;
    } else {
      return `${baseClasses} bg-theme-elevated/80 ${config.colors.inactive}`;
    }
  };

  // Handler para abrir modal ou remover
  const handleClick = () => {
    if (disabled || isLoading || !isAuthenticated) {
      return;
    }

    // Sempre abrir o modal (para adicionar ou editar)
    setShowModal(true);
  };

  // Stars indicator for compact view
  const StarsIndicator = () => {
    if (!isActive || variant !== 'compact') return null;

    return (
      <div className="flex items-center space-x-0.5 ml-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-2.5 h-2.5 ${
              i < currentLevel
                ? 'fill-current text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
    </div>
  );

  const Icon = config.icon;

  if (!mounted) {
    return (
      <div className={`${getButtonClasses()} ${className}`} style={style}>
        <FiBookOpen className={`${sizes[size].icon} opacity-50`} />
        <span className="ml-2 opacity-50">Carregando...</span>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={handleClick}
          disabled={disabled || isLoading}
          className={`${getButtonClasses()} ${className}`}
          style={style}
          title={isActive ? config.labels.active : config.labels.inactive}
        >
          {/* Loading overlay */}
          {isLoading && <LoadingSpinner />}

          {/* Main content */}
          <div
            className={`flex items-center ${
              isLoading ? 'opacity-0' : 'opacity-100'
            } transition-opacity`}
          >
            <Icon
              className={`${sizes[size].icon} transition-transform group-hover:scale-110`}
            />

            {variant !== 'compact' && (
              <span className="ml-2 font-medium">
                {isActive ? config.labels.active : config.labels.inactive}
              </span>
            )}

            <StarsIndicator />
          </div>

          {/* Gradient overlay */}
          <div className="absolute rounded-xl inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>
      </div>

      {/* Modal */}
      <LearningModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        workId={workId}
        workTitle={workTitle}
        composerName={composerName}
        type={type}
      />
    </>
  );
};

export default LearningButtonWithModal;
