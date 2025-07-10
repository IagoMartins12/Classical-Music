// app/components/Admin/ReportQuickStats.tsx - Widget de estatísticas rápidas
'use client';

import { useState, useEffect } from 'react';
import { FiFlag, FiClock, FiCheck, FiTrendingUp } from 'react-icons/fi';
import {
  AnimatedCard,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';

interface QuickStats {
  pending: number;
  resolved: number;
  total: number;
  trend: number;
}

export default function ReportQuickStats() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickStats();
  }, []);

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/reports/quick-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas rápidas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AnimatedCard className="classical-card p-4">
        <LoadingSpinner size="sm" />
      </AnimatedCard>
    );
  }

  if (!stats) return null;

  return (
    <AnimatedCard className="classical-card p-4">
      <h3 className="text-sm font-medium text-theme-primary mb-3">
        Reports - Resumo
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiClock className="w-4 h-4 text-accent-amber" />
            <span className="text-sm text-theme-secondary">Pendentes</span>
          </div>
          <span className="font-bold text-theme-primary">{stats.pending}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiCheck className="w-4 h-4 text-accent-green" />
            <span className="text-sm text-theme-secondary">Resolvidos</span>
          </div>
          <span className="font-bold text-theme-primary">{stats.resolved}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiFlag className="w-4 h-4 text-accent-blue" />
            <span className="text-sm text-theme-secondary">Total</span>
          </div>
          <span className="font-bold text-theme-primary">{stats.total}</span>
        </div>

        {stats.trend !== 0 && (
          <div className="pt-2 border-t border-theme-secondary">
            <div className="flex items-center space-x-2">
              <FiTrendingUp
                className={`w-4 h-4 ${
                  stats.trend > 0 ? 'text-accent-red' : 'text-accent-green'
                }`}
              />
              <span className="text-xs text-theme-tertiary">
                {stats.trend > 0 ? '+' : ''}
                {stats.trend}% esta semana
              </span>
            </div>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
