// components/LearningButton/LearningButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { FiBookOpen, FiCheckCircle, FiTarget, FiStar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/hooks/useAuth';
import { useLearningStore } from '@/app/stores/useLearningStore';

export type LearningType = 'want-to-learn' | 'learned';

interface LearningButtonProps {
  // Identificadores
  workId: string;
  type: LearningType;

  // Aparência
  variant?: 'default' | 'small' | 'large' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;

  // Comportamento
  showToast?: boolean;
  disabled?: boolean;
  showLevel?: boolean; // Mostrar prioridade/maestria no botão

  // Callbacks opcionais
  onToggle?: (isActive: boolean, level?: number) => void;
  onError?: (error: Error) => void;
  onLevelChange?: (level: number) => void;

  // Dados para exibição
  workTitle?: string;

  // Níveis (prioridade para want-to-learn, maestria para learned)
  defaultLevel?: number; // 1-5
  allowLevelChange?: boolean;

  // Estilo customizado
  style?: React.CSSProperties;
}

const LearningButton = ({
  workId,
  type,
  variant = 'default',
  size = 'md',
  className = '',
  showToast = true,
  disabled = false,
  showLevel = false,
  allowLevelChange = false,
  onToggle,
  onError,
  onLevelChange,
  workTitle,
  defaultLevel = 3,
  style,
}: LearningButtonProps) => {
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);

  // Store actions baseadas no tipo
  const {
    isWantToLearn,
    isLearned,
    toggleWantToLearn,
    toggleLearned,
    updateWantToLearnPriority,
    updateLearnedMastery,
    loading,
    wantToLearn,
    learned,
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

  // Obter nível atual (prioridade ou maestria)
  const currentLevel = mounted
    ? (() => {
        if (type === 'want-to-learn') {
          const item = wantToLearn.find((item) => item.workId === workId);
          return item?.priority || defaultLevel;
        } else {
          const item = learned.find((item) => item.workId === workId);
          return item?.mastery || defaultLevel;
        }
      })()
    : defaultLevel;

  // Tamanhos
  const sizeClasses = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Ícones baseados no tipo
  const getIcon = () => {
    if (type === 'want-to-learn') {
      return isActive ? FiTarget : FiBookOpen;
    } else {
      return isActive ? FiCheckCircle : FiBookOpen;
    }
  };

  // Labels baseados no tipo
  const getLabels = () => {
    if (type === 'want-to-learn') {
      return {
        active: 'Quero estudar',
        inactive: 'Quero estudar',
        loading: 'Atualizando...',
      };
    } else {
      return {
        active: 'Já aprendi',
        inactive: 'Marcar como aprendida',
        loading: 'Atualizando...',
      };
    }
  };

  // Cores baseadas no tipo e estado
  const getVariantClasses = () => {
    const baseClasses = `
      ${sizeClasses[size]} 
      rounded-xl
      transition-all 
      duration-300 
      hover:scale-105 
      active:scale-95
      flex 
      items-center 
      justify-center
      space-x-2
      border
      font-medium
      relative
      overflow-hidden
      group
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    `;

    if (type === 'want-to-learn') {
      const variants = {
        default: isActive
          ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-600 shadow-blue-500/20 shadow-lg'
          : 'bg-theme-elevated/80 border-theme-primary/30 text-theme-primary hover:bg-blue-500/10 hover:border-blue-500/50 hover:text-blue-600',

        small: isActive
          ? 'bg-blue-500/20 border-blue-500/40 text-blue-600'
          : 'bg-theme-elevated/60 border-theme-secondary/40 text-theme-tertiary hover:text-blue-600 hover:border-blue-500/40',

        large: isActive
          ? 'bg-gradient-to-br from-blue-500/15 to-blue-600/15 border-blue-500/40 text-blue-600 shadow-theme-glow'
          : 'bg-gradient-to-br from-theme-elevated to-interactive-hover border-theme-primary text-theme-primary hover:border-blue-500/50 hover:text-blue-600 shadow-theme-medium',

        minimal: isActive
          ? 'bg-transparent border-transparent text-blue-600'
          : 'bg-transparent border-transparent text-theme-tertiary hover:text-blue-600',
      };
      return `${baseClasses} ${variants[variant]}`;
    } else {
      const variants = {
        default: isActive
          ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/50 text-green-600 shadow-green-500/20 shadow-lg'
          : 'bg-theme-elevated/80 border-theme-primary/30 text-theme-primary hover:bg-green-500/10 hover:border-green-500/50 hover:text-green-600',

        small: isActive
          ? 'bg-green-500/20 border-green-500/40 text-green-600'
          : 'bg-theme-elevated/60 border-theme-secondary/40 text-theme-tertiary hover:text-green-600 hover:border-green-500/40',

        large: isActive
          ? 'bg-gradient-to-br from-green-500/15 to-green-600/15 border-green-500/40 text-green-600 shadow-theme-glow'
          : 'bg-gradient-to-br from-theme-elevated to-interactive-hover border-theme-primary text-theme-primary hover:border-green-500/50 hover:text-green-600 shadow-theme-medium',

        minimal: isActive
          ? 'bg-transparent border-transparent text-green-600'
          : 'bg-transparent border-transparent text-theme-tertiary hover:text-green-600',
      };
      return `${baseClasses} ${variants[variant]}`;
    }
  };

  // Handler de clique principal
  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('oi');

    if (disabled || isLoading || !user?.id || !isAuthenticated) {
      if (!isAuthenticated && showToast) {
        toast.error('Faça login para gerenciar seu aprendizado');
      }
      return;
    }

    try {
      const newState =
        type === 'want-to-learn'
          ? await toggleWantToLearn(workId, user.id, defaultLevel)
          : await toggleLearned(workId, user.id, defaultLevel);

      // Callback personalizado
      onToggle?.(newState, currentLevel);

      // Toast de feedback
      if (showToast) {
        const action = newState ? 'adicionada à' : 'removida da';
        const listName =
          type === 'want-to-learn'
            ? 'lista de estudos'
            : 'lista de obras aprendidas';
        const name = workTitle || 'Obra';

        toast.success(`${name} ${action} ${listName}`, {
          icon: newState ? (type === 'want-to-learn' ? '🎯' : '✅') : '📝',
          duration: 2000,
          style: {
            background: newState
              ? 'linear-gradient(135deg, #f0f9ff, #e0f2fe)'
              : 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
            color: newState ? '#0369a1' : '#6b7280',
            border: newState ? '1px solid #7dd3fc' : '1px solid #d1d5db',
          },
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar aprendizado:', error);
      onError?.(error as Error);

      if (showToast) {
        toast.error('Erro ao atualizar. Tente novamente.');
      }
    }
  };

  // Handler para mudança de nível
  const handleLevelChange = async (newLevel: number) => {
    if (!user?.id || !isActive) return;

    try {
      const success =
        type === 'want-to-learn'
          ? await updateWantToLearnPriority(workId, newLevel)
          : await updateLearnedMastery(workId, newLevel);

      if (success) {
        onLevelChange?.(newLevel);
        setShowLevelSelector(false);

        if (showToast) {
          const levelType =
            type === 'want-to-learn' ? 'prioridade' : 'maestria';
          toast.success(`${levelType} atualizada para ${newLevel}`, {
            duration: 1500,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar nível:', error);
      if (showToast) {
        toast.error('Erro ao atualizar nível');
      }
    }
  };

  // Loading spinner
  const LoadingSpinner = () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
    </div>
  );

  // Level indicator
  const LevelIndicator = () => {
    if (!showLevel || !isActive) return null;

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <FiStar
            key={i}
            className={`w-2 h-2 ${
              i < currentLevel
                ? 'fill-current text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Level selector
  const LevelSelector = () => {
    if (!showLevelSelector || !allowLevelChange) return null;

    return (
      <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="text-xs font-medium text-gray-600 mb-2">
          {type === 'want-to-learn' ? 'Prioridade' : 'Maestria'}
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                level === currentLevel
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-blue-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const labels = getLabels();
  const Icon = getIcon();

  if (!mounted) {
    return (
      <div
        className={`
          ${sizeClasses[size]} 
          rounded-xl
          bg-theme-elevated/60 
          border 
          border-theme-secondary/40 
          text-theme-tertiary 
          flex 
          items-center 
          justify-center
          space-x-2
          ${className}
        `}
        style={style}
      >
        <FiBookOpen className={`${iconSizes[size]} opacity-50`} />
        <span className="text-sm font-medium opacity-50">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onContextMenu={(e) => {
          if (allowLevelChange && isActive) {
            e.preventDefault();
            setShowLevelSelector(!showLevelSelector);
          }
        }}
        disabled={disabled || isLoading}
        className={`${getVariantClasses()} ${className}`}
        style={style}
        title={isActive ? labels.active : labels.inactive}
        aria-label={isActive ? labels.active : labels.inactive}
      >
        {/* Loading state */}
        {isLoading && <LoadingSpinner />}

        {/* Ícone principal */}
        <Icon
          className={`
            ${iconSizes[size]} 
            transition-all 
            duration-300 
            ${isActive ? 'scale-110' : 'group-hover:scale-110'}
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
        />

        {/* Texto do botão */}
        <span
          className={`
            text-sm font-medium
            ${isLoading ? 'opacity-0' : 'opacity-100'}
            transition-opacity duration-300
          `}
        >
          {isLoading
            ? labels.loading
            : isActive
            ? labels.active
            : labels.inactive}
        </span>

        {/* Level indicator */}
        <LevelIndicator />

        {/* Gradient overlay para efeito premium */}
        <div className="absolute rounded-xl inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>

      {/* Level selector */}
      <LevelSelector />
    </div>
  );
};

export default LearningButton;
