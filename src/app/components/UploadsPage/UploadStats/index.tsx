// app/components/uploads/UploadStats.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiUsers,
  FiMusic,
  FiUser,
  FiFile,
  FiCalendar,
  FiActivity,
  FiAward,
} from 'react-icons/fi';
import { AnimatedCard, AnimatedItem } from '../../animation/AnimatedComponents';

interface UploadStatsProps {
  userId: string;
  isAdmin: boolean;
}

const UploadStats = ({ userId, isAdmin }: UploadStatsProps) => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `/api/uploads/stats?userId=${userId}&admin=${isAdmin}`
        );
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId, isAdmin]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="classical-card p-4 animate-pulse">
            <div className="h-12 bg-theme-secondary rounded mb-2"></div>
            <div className="h-8 bg-theme-secondary rounded mb-2"></div>
            <div className="h-4 bg-theme-secondary rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
            <FiTrendingUp className="w-5 h-5 text-theme-primary" />
          </div>
          <span className="text-xs text-theme-tertiary">Total</span>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.totalUploads}
        </div>
        <div className="text-sm text-theme-secondary">Uploads realizados</div>
        {stats.monthlyGrowth && (
          <div className="text-xs text-accent-green mt-1">
            +{stats.monthlyGrowth}% este mês
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
            <FiUser className="w-5 h-5 text-theme-primary" />
          </div>
          <span className="text-xs text-theme-tertiary">Compositores</span>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.composerCount}
        </div>
        <div className="text-sm text-theme-secondary">Criados</div>
        {stats.averageComposerQuality && (
          <div className="text-xs text-accent-blue mt-1">
            {stats.averageComposerQuality.toFixed(1)}% qualidade média
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
            <FiMusic className="w-5 h-5 text-theme-primary" />
          </div>
          <span className="text-xs text-theme-tertiary">Obras</span>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.workCount}
        </div>
        <div className="text-sm text-theme-secondary">Adicionadas</div>
        {stats.popularWorkCount && (
          <div className="text-xs text-accent-green mt-1">
            {stats.popularWorkCount} populares
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-amber rounded-xl flex items-center justify-center">
            <FiFile className="w-5 h-5 text-theme-primary" />
          </div>
          <span className="text-xs text-theme-tertiary">Partituras</span>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.scoreCount}
        </div>
        <div className="text-sm text-theme-secondary">Submetidas</div>
        {stats.totalFileSize && (
          <div className="text-xs text-theme-tertiary mt-1">
            {stats.totalFileSize} total
          </div>
        )}
      </AnimatedCard>

      {isAdmin && (
        <>
          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-amber to-accent-red rounded-xl flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-theme-primary" />
              </div>
              <span className="text-xs text-theme-tertiary">Usuários</span>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.activeUsers}
            </div>
            <div className="text-sm text-theme-secondary">Ativos</div>
            {stats.newUsersThisMonth && (
              <div className="text-xs text-accent-green mt-1">
                +{stats.newUsersThisMonth} este mês
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-red to-brand-primary rounded-xl flex items-center justify-center">
                <FiActivity className="w-5 h-5 text-theme-primary" />
              </div>
              <span className="text-xs text-theme-tertiary">Atividade</span>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.dailyActivity}
            </div>
            <div className="text-sm text-theme-secondary">Hoje</div>
            {stats.weeklyGrowth && (
              <div className="text-xs text-accent-green mt-1">
                +{stats.weeklyGrowth}% esta semana
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-accent-purple rounded-xl flex items-center justify-center">
                <FiAward className="w-5 h-5 text-theme-primary" />
              </div>
              <span className="text-xs text-theme-tertiary">Qualidade</span>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.averageQuality}%
            </div>
            <div className="text-sm text-theme-secondary">Média geral</div>
            {stats.highQualityCount && (
              <div className="text-xs text-accent-green mt-1">
                {stats.highQualityCount} alta qualidade
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-theme-primary" />
              </div>
              <span className="text-xs text-theme-tertiary">Pendências</span>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.pendingModerations}
            </div>
            <div className="text-sm text-theme-secondary">Para moderar</div>
            {stats.urgentModerations && (
              <div className="text-xs text-accent-red mt-1">
                {stats.urgentModerations} urgentes
              </div>
            )}
          </AnimatedCard>
        </>
      )}
    </div>
  );
};

export default UploadStats;
