// app/components/common/RefreshIndicator.tsx
'use client';

import { FiRefreshCw, FiCheck, FiX } from 'react-icons/fi';
import { useState, useEffect } from 'react';

interface RefreshIndicatorProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated?: Date;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  showLastUpdated?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function RefreshIndicator({
  isRefreshing,
  onRefresh,
  lastUpdated,
  error,
  size = 'md',
  showLastUpdated = true,
  className = '',
  disabled = false,
}: RefreshIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  // Mostrar indicador de sucesso brevemente após refresh
  useEffect(() => {
    if (!isRefreshing && !error && lastUpdated) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isRefreshing, error, lastUpdated]);

  // Definir tamanhos
  const sizes = {
    sm: {
      button: 'w-6 h-6',
      icon: 'w-3 h-3',
      text: 'text-xs',
    },
    md: {
      button: 'w-8 h-8',
      icon: 'w-4 h-4',
      text: 'text-sm',
    },
    lg: {
      button: 'w-10 h-10',
      icon: 'w-5 h-5',
      text: 'text-base',
    },
  };

  const currentSize = sizes[size];

  // Função para formatar tempo relativo
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d atrás`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Botão de refresh */}
      <button
        onClick={onRefresh}
        disabled={disabled || isRefreshing}
        className={`
          ${currentSize.button} 
          rounded-lg bg-theme-elevated border border-theme-secondary 
          hover:border-brand-primary transition-all flex items-center justify-center 
          group relative
          ${
            disabled || isRefreshing
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-interactive-hover'
          }
        `}
        title={isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
      >
        {/* Estado de erro */}
        {error && !isRefreshing ? (
          <FiX className={`${currentSize.icon} text-accent-red`} />
        ) : showSuccess ? (
          <FiCheck className={`${currentSize.icon} text-accent-green`} />
        ) : (
          <FiRefreshCw
            className={`
              ${
                currentSize.icon
              } text-theme-tertiary group-hover:text-brand-primary 
              transition-all ${
                isRefreshing ? 'animate-spin text-brand-primary' : ''
              }
            `}
          />
        )}

        {/* Loading overlay */}
        {isRefreshing && (
          <div className="absolute inset-0 bg-theme-elevated/80 rounded-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
          </div>
        )}
      </button>

      {/* Status text */}
      {showLastUpdated && (
        <div className="flex flex-col">
          <span
            className={`${currentSize.text} text-theme-tertiary transition-colors`}
          >
            {isRefreshing ? (
              'Atualizando...'
            ) : error ? (
              <span className="text-accent-red">Erro ao atualizar</span>
            ) : showSuccess ? (
              <span className="text-accent-green">Atualizado!</span>
            ) : lastUpdated ? (
              `Atualizado ${formatRelativeTime(lastUpdated)}`
            ) : (
              ''
            )}
          </span>

          {/* Error message */}
          {error && (
            <span className={`${currentSize.text} text-accent-red mt-1`}>
              {error}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Componente compacto apenas com o ícone
export function RefreshButton({
  isRefreshing,
  onRefresh,
  error,
  disabled = false,
  className = '',
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onRefresh}
      disabled={disabled || isRefreshing}
      className={`
        w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary 
        hover:border-brand-primary transition-all flex items-center justify-center 
        group ${
          disabled || isRefreshing
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-interactive-hover'
        }
        ${className}
      `}
      title={
        error
          ? 'Erro ao atualizar - clique para tentar novamente'
          : isRefreshing
          ? 'Atualizando...'
          : 'Atualizar dados'
      }
    >
      {error && !isRefreshing ? (
        <FiX className="w-4 h-4 text-accent-red" />
      ) : (
        <FiRefreshCw
          className={`
            w-4 h-4 text-theme-tertiary group-hover:text-brand-primary 
            transition-all ${
              isRefreshing ? 'animate-spin text-brand-primary' : ''
            }
          `}
        />
      )}
    </button>
  );
}

// Hook para usar com estado de atualização
export function useRefreshState() {
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>();
  const [error, setError] = useState<string | undefined>();

  const markAsUpdated = () => {
    setLastUpdated(new Date());
    setError(undefined);
  };

  const markAsError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(undefined);
  };

  return {
    lastUpdated,
    error,
    markAsUpdated,
    markAsError,
    clearError,
  };
}
