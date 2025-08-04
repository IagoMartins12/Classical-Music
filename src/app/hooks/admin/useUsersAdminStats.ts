// app/hooks/admin/useAdminStats.ts
import { useState, useEffect } from 'react';

// Utilitários de formatação
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes > 0
      ? `${hours}h ${remainingMinutes}min`
      : `${hours}h`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (remainingHours > 0) {
    return `${days}d ${remainingHours}h`;
  }

  return `${days}d`;
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
};

export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}sem atrás`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mes atrás`;
    return `${Math.floor(diffInDays / 365)}a atrás`;
  }

  if (format === 'long') {
    return dateObj.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString('pt-BR');
};

export const calculateGrowthRate = (
  current: number,
  previous: number
): {
  rate: number;
  isPositive: boolean;
  formatted: string;
} => {
  if (previous === 0) {
    return {
      rate: current > 0 ? 100 : 0,
      isPositive: current >= 0,
      formatted: current > 0 ? '+100%' : '0%',
    };
  }

  const rate = ((current - previous) / previous) * 100;
  const isPositive = rate >= 0;
  const formatted = isPositive ? `+${rate.toFixed(1)}%` : `${rate.toFixed(1)}%`;

  return { rate: Math.abs(rate), isPositive, formatted };
};

// Hook para estatísticas em tempo real
export const useAdminStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalUploads: 0,
    totalAnnotations: 0,
    loading: true,
    error: null as string | null,
  });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const data = await response.json();

      if (data.success) {
        setStats((prev) => ({
          ...prev,
          ...data.stats,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      }));
    }
  };

  useEffect(() => {
    fetchStats();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { ...stats, refresh: fetchStats };
};

// Utilitários para cores baseadas em valores
export const getColorByValue = (
  value: number,
  thresholds: { low: number; medium: number; high: number },
  colors: { low: string; medium: string; high: string; excellent: string }
): string => {
  if (value >= thresholds.high) return colors.excellent;
  if (value >= thresholds.medium) return colors.high;
  if (value >= thresholds.low) return colors.medium;
  return colors.low;
};

// Utilitário para status do usuário
export const getUserStatus = (user: {
  lastActive: Date | string;
  onboardingCompleted: boolean;
  totalStudyTime: number;
}) => {
  const lastActive =
    typeof user.lastActive === 'string'
      ? new Date(user.lastActive)
      : user.lastActive;
  const daysSinceActive = Math.floor(
    (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (!user.onboardingCompleted) {
    return {
      status: 'incomplete',
      label: 'Onboarding Incompleto',
      color: 'text-accent-amber',
      bgColor: 'bg-accent-amber/20',
    };
  }

  if (daysSinceActive === 0) {
    return {
      status: 'active_today',
      label: 'Ativo Hoje',
      color: 'text-accent-green',
      bgColor: 'bg-accent-green/20',
    };
  }

  if (daysSinceActive <= 7) {
    return {
      status: 'active_week',
      label: 'Ativo esta Semana',
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/20',
    };
  }

  if (daysSinceActive <= 30) {
    return {
      status: 'active_month',
      label: 'Ativo este Mês',
      color: 'text-accent-purple',
      bgColor: 'bg-accent-purple/20',
    };
  }

  return {
    status: 'inactive',
    label: 'Inativo',
    color: 'text-theme-tertiary',
    bgColor: 'bg-theme-secondary',
  };
};

// Utilitário para level do usuário baseado em atividade
export const getUserLevel = (user: {
  totalStudyTime: number;
  annotationsCount: number;
  uploadsCount: number;
  uploadScore: number;
}) => {
  const totalScore =
    user.totalStudyTime +
    user.annotationsCount * 10 +
    user.uploadsCount * 5 +
    user.uploadScore;

  if (totalScore >= 5000) {
    return {
      level: 'expert',
      label: 'Expert',
      color: 'text-accent-red',
      bgColor: 'bg-accent-red/20',
      icon: '🏆',
    };
  }

  if (totalScore >= 2000) {
    return {
      level: 'advanced',
      label: 'Avançado',
      color: 'text-accent-purple',
      bgColor: 'bg-accent-purple/20',
      icon: '⭐',
    };
  }

  if (totalScore >= 500) {
    return {
      level: 'intermediate',
      label: 'Intermediário',
      color: 'text-accent-blue',
      bgColor: 'bg-accent-blue/20',
      icon: '📈',
    };
  }

  return {
    level: 'beginner',
    label: 'Iniciante',
    color: 'text-accent-green',
    bgColor: 'bg-accent-green/20',
    icon: '🌱',
  };
};
