// components/LearningButton/LearningButtonWithModal.tsx - REDESENHADO COM STORE GLOBAL
'use client';

import { useState, useEffect } from 'react';
import {
  FiBookOpen,
  FiCheckCircle,
  FiTarget,
  FiStar,
  FiEdit3,
} from 'react-icons/fi';
import {
  LearnedItem,
  useLearningStore,
  WantToLearnItem,
} from '@/app/stores/useLearningStore';
import {
  useLearningModalStore,
  type LearningType,
  type SelectedWorkScore,
} from '@/app/stores/useLearningModalStore';
import { useAuth } from '@/app/hooks/useAuth';
import { useToast } from '@/app/hooks/useToast';
import { useLoginModal } from '@/app/stores/authStore';

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
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { open: openLoginModal } = useLoginModal();

  const {
    isWantToLearn,
    isLearned,
    loading,
    getWantToLearnItem,
    getLearnedItem,
  } = useLearningStore();

  // ✅ Usar store global do modal
  const { openModal } = useLearningModalStore();

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
            edit: 'Editar estudo',
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
            edit: 'Editar aprendizado',
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

  const toast = useToast();
  // ✅ Handler para abrir modal usando store global
  const handleClick = () => {
    if (disabled || isLoading) {
      return;
    }

    if (!isAuthenticated) {
      toast.error(
        `Faça login para adicionar peça ao ${
          type === 'learned' ? 'Já aprendi' : 'Quero estudar'
        }`
      );
      openLoginModal();
      return;
    }

    console.log(`🎵 [LEARNING-BUTTON] Abrindo modal para ${type}:`, workTitle);

    // ✅ Preparar dados iniciais
    let initialWantToLearnData = {};
    let initialLearnedData = {};
    let initialWorkScore: SelectedWorkScore | null = null;

    if (currentItem) {
      if (type === 'want-to-learn') {
        const item = currentItem as WantToLearnItem;
        initialWantToLearnData = {
          priority: item.priority || 0,
          notes: item.notes || '',
          targetDate: item.targetDate ? item.targetDate.split('T')[0] : '',
          estimatedStudyTime: item.estimatedStudyTime || undefined,
          difficulty: item.difficulty || undefined,
          motivation: item.motivation || '',
          context: item.context || '',
          selectedWorkScoreId: item.selectedWorkScoreId,
        };

        // ✅ Configurar WorkScore se existir
        if (item.selectedWorkScore) {
          initialWorkScore = {
            id: item.selectedWorkScore.id,
            sourceId: item.selectedWorkScore.sourceId,
            source: item.selectedWorkScore.source,
            title: item.selectedWorkScore.title,
            downloadUrl: item.selectedWorkScore.downloadUrl,
            thumbnailUrl: item.selectedWorkScore.thumbnailUrl,
            fileSize: item.selectedWorkScore.fileSize,
            pageCount: item.selectedWorkScore.pageCount,
            fileFormat: item.selectedWorkScore.fileFormat,
            type: item.selectedWorkScore.type,
            editor: item.selectedWorkScore.editor,
            publisher: item.selectedWorkScore.publisher,
            copyright: item.selectedWorkScore.copyright,
            uploadDate: item.selectedWorkScore.uploadDate,
            uploader: item.selectedWorkScore.uploader,
            notes: item.selectedWorkScore.notes,
          };
        }
      } else {
        const item = currentItem as LearnedItem;
        initialLearnedData = {
          mastery: item.mastery || 0,
          studyStartDate: item.studyStartDate
            ? item.studyStartDate.split('T')[0]
            : '',
          studyDuration: item.studyDuration || undefined,
          notes: item.notes || '',
          wouldRecommend: item.wouldRecommend ?? true,
          publicPerformance: item.publicPerformance || false,
          difficulty: item.difficulty || undefined,
          enjoyment: item.enjoyment || undefined,
          technicalChallenges: item.technicalChallenges || '',
          musicalInsights: item.musicalInsights || '',
          selectedWorkScoreId: item.selectedWorkScoreId,
        };

        // ✅ Configurar WorkScore se existir
        if (item.selectedWorkScore) {
          initialWorkScore = {
            id: item.selectedWorkScore.id,
            sourceId: item.selectedWorkScore.sourceId,
            source: item.selectedWorkScore.source,
            title: item.selectedWorkScore.title,
            downloadUrl: item.selectedWorkScore.downloadUrl,
            thumbnailUrl: item.selectedWorkScore.thumbnailUrl,
            fileSize: item.selectedWorkScore.fileSize,
            pageCount: item.selectedWorkScore.pageCount,
            fileFormat: item.selectedWorkScore.fileFormat,
            type: item.selectedWorkScore.type,
            editor: item.selectedWorkScore.editor,
            publisher: item.selectedWorkScore.publisher,
            copyright: item.selectedWorkScore.copyright,
            uploadDate: item.selectedWorkScore.uploadDate,
            uploader: item.selectedWorkScore.uploader,
            notes: item.selectedWorkScore.notes,
          };
        }
      }
    } else {
      // ✅ Dados padrão para novos itens
      if (type === 'want-to-learn') {
        initialWantToLearnData = { priority: 0 };
      } else {
        initialLearnedData = {
          mastery: 0,
          wouldRecommend: true,
          publicPerformance: false,
        };
      }
    }

    // ✅ Abrir modal com dados iniciais
    openModal({
      workId,
      workTitle,
      composerName,
      type,
      isCurrentlyActive: isActive,
      initialWantToLearnData,
      initialLearnedData,
      initialWorkScore,
    });
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
    <div className="absolute inset-0 flex items-center justify-center bg-transparent rounded-xl">
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60"></div>
    </div>
  );

  // ✅ Ícone dinâmico baseado no estado
  const getIcon = () => {
    if (isActive && isHovered && variant === 'detailed') {
      return FiEdit3; // Mostrar ícone de edição no hover se ativo
    }
    return config.icon;
  };

  const Icon = getIcon();

  // ✅ Texto dinâmico baseado no estado
  const getButtonText = () => {
    if (isActive && isHovered && variant === 'detailed') {
      return config.labels.edit;
    }
    return isActive ? config.labels.active : config.labels.inactive;
  };

  if (!mounted) {
    return (
      <div className={`${getButtonClasses()} ${className}`} style={style}>
        <FiBookOpen className={`${sizes[size].icon} opacity-50`} />
        {variant !== 'compact' && (
          <span className="ml-2 opacity-50">Carregando...</span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`${getButtonClasses()} ${className}`}
        style={style}
        title={getButtonText()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
            <span className="ml-2 font-medium">{getButtonText()}</span>
          )}

          <StarsIndicator />
        </div>

        {/* Gradient overlay */}
        <div className="absolute rounded-xl inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {/* ✅ Indicator para edição quando hover em item ativo */}
        {isActive && isHovered && variant !== 'detailed' && (
          <div className="absolute inset-0 bg-black/10 rounded-xl flex items-center justify-center">
            <FiEdit3 className={`${sizes[size].icon} opacity-80`} />
          </div>
        )}
      </button>
    </div>
  );
};

export default LearningButtonWithModal;
