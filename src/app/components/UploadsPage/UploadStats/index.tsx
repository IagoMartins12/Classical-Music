// app/components/uploads/UploadStats.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiCalendarBlank,
  PiFile,
  PiMedal,
  PiMusicNotes,
  PiPulse,
  PiTrendUp,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import { AnimatedCard } from '../../animation/AnimatedComponents';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
          <Card densidade="compacta" key={i} className="animate-pulse">
            <div className="h-12 bg-theme-secondary rounded mb-2"></div>
            <div className="h-8 bg-theme-secondary rounded mb-2"></div>
            <div className="h-4 bg-theme-secondary rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 fill-ouro rounded-xl flex items-center justify-center">
            <PiTrendUp className="w-5 h-5 text-theme-primary" />
          </div>
          <Text papel="legenda" tom="fraco">
            Total
          </Text>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.totalUploads}
        </div>
        <Text papel="rotulo" tom="suave" as="div">
          Uploads realizados
        </Text>
        {stats.monthlyGrowth && (
          <div className="text-xs text-ok mt-1">
            +{stats.monthlyGrowth}% este mês
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 fill-ouro rounded-xl flex items-center justify-center">
            <PiUser className="w-5 h-5 text-theme-primary" />
          </div>
          <Text papel="legenda" tom="fraco">
            Compositores
          </Text>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.composerCount}
        </div>
        <Text papel="rotulo" tom="suave" as="div">
          Criados
        </Text>
        {stats.averageComposerQuality && (
          <div className="text-xs text-aviso mt-1">
            {stats.averageComposerQuality.toFixed(1)}% qualidade média
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-aviso rounded-xl flex items-center justify-center">
            <PiMusicNotes className="w-5 h-5 text-theme-primary" />
          </div>
          <Text papel="legenda" tom="fraco">
            Obras
          </Text>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.workCount}
        </div>
        <Text papel="rotulo" tom="suave" as="div">
          Adicionadas
        </Text>
        {stats.popularWorkCount && (
          <div className="text-xs text-ok mt-1">
            {stats.popularWorkCount} populares
          </div>
        )}
      </AnimatedCard>

      <AnimatedCard className="classical-card p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-10 h-10 bg-ok rounded-xl flex items-center justify-center">
            <PiFile className="w-5 h-5 text-theme-primary" />
          </div>
          <Text papel="legenda" tom="fraco">
            Partituras
          </Text>
        </div>
        <div className="text-2xl font-bold text-theme-primary">
          {stats.scoreCount}
        </div>
        <Text papel="rotulo" tom="suave" as="div">
          Submetidas
        </Text>
        {stats.totalFileSize && (
          <Text papel="legenda" tom="fraco" as="div" className="mt-1">
            {stats.totalFileSize} total
          </Text>
        )}
      </AnimatedCard>

      {isAdmin && (
        <>
          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-atencao rounded-xl flex items-center justify-center">
                <PiUsers className="w-5 h-5 text-theme-primary" />
              </div>
              <Text papel="legenda" tom="fraco">
                Usuários
              </Text>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.activeUsers}
            </div>
            <Text papel="rotulo" tom="suave" as="div">
              Ativos
            </Text>
            {stats.newUsersThisMonth && (
              <div className="text-xs text-ok mt-1">
                +{stats.newUsersThisMonth} este mês
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-erro rounded-xl flex items-center justify-center">
                <PiPulse className="w-5 h-5 text-theme-primary" />
              </div>
              <Text papel="legenda" tom="fraco">
                Atividade
              </Text>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.dailyActivity}
            </div>
            <Text papel="rotulo" tom="suave" as="div">
              Hoje
            </Text>
            {stats.weeklyGrowth && (
              <div className="text-xs text-ok mt-1">
                +{stats.weeklyGrowth}% esta semana
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 fill-ouro rounded-xl flex items-center justify-center">
                <PiMedal className="w-5 h-5 text-theme-primary" />
              </div>
              <Text papel="legenda" tom="fraco">
                Qualidade
              </Text>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.averageQuality}%
            </div>
            <Text papel="rotulo" tom="suave" as="div">
              Média geral
            </Text>
            {stats.highQualityCount && (
              <div className="text-xs text-ok mt-1">
                {stats.highQualityCount} alta qualidade
              </div>
            )}
          </AnimatedCard>

          <AnimatedCard className="classical-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 fill-ouro rounded-xl flex items-center justify-center">
                <PiCalendarBlank className="w-5 h-5 text-theme-primary" />
              </div>
              <Text papel="legenda" tom="fraco">
                Pendências
              </Text>
            </div>
            <div className="text-2xl font-bold text-theme-primary">
              {stats.pendingModerations}
            </div>
            <Text papel="rotulo" tom="suave" as="div">
              Para moderar
            </Text>
            {stats.urgentModerations && (
              <div className="text-xs text-erro mt-1">
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
