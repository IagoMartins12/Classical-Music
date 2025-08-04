// app/difficulty/components/DifficultyStats.tsx

'use client';

import { FiTrendingUp, FiUsers, FiBarChart2, FiAward } from 'react-icons/fi';
import { AnimatedItem, AnimatedCard } from '../animation/AnimatedComponents';

interface DifficultyStatsProps {
  stats: {
    totalWorks: number;
    totalInstruments: number;
    averageLevel: number;
    mostCommonLevel: string;
    systemDistribution: { system: string; count: number; percentage: number }[];
  };
}

export default function DifficultyStats({ stats }: DifficultyStatsProps) {
  return (
    <AnimatedCard hover="lift" className="classical-card p-6 mb-8">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center mr-4">
          <FiBarChart2 className="w-6 h-6 text-theme-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-theme-primary classical-title">
            Estatísticas de Dificuldade
          </h3>
          <p className="text-theme-secondary">
            Visão geral da classificação de dificuldade em nossa coleção
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Obras */}
        <AnimatedItem direction="up" hover="lift">
          <div className="bg-theme-elevated rounded-xl p-4 border border-theme-secondary">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-brand-primary/20 rounded-lg flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-brand-primary" />
              </div>
              <span className="text-2xl font-bold text-brand-primary">
                {stats.totalWorks.toLocaleString()}
              </span>
            </div>
            <p className="text-sm font-medium text-theme-primary">
              Total de Obras
            </p>
            <p className="text-xs text-theme-tertiary">
              Com dificuldade classificada
            </p>
          </div>
        </AnimatedItem>

        {/* Instrumentos */}
        <AnimatedItem direction="up" hover="lift" delay={0.1}>
          <div className="bg-theme-elevated rounded-xl p-4 border border-theme-secondary">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-accent-blue" />
              </div>
              <span className="text-2xl font-bold text-accent-blue">
                {stats.totalInstruments}
              </span>
            </div>
            <p className="text-sm font-medium text-theme-primary">
              Instrumentos
            </p>
            <p className="text-xs text-theme-tertiary">
              Com obras classificadas
            </p>
          </div>
        </AnimatedItem>

        {/* Nível Médio */}
        <AnimatedItem direction="up" hover="lift" delay={0.2}>
          <div className="bg-theme-elevated rounded-xl p-4 border border-theme-secondary">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                <FiBarChart2 className="w-5 h-5 text-accent-green" />
              </div>
              <span className="text-2xl font-bold text-accent-green">
                {stats.averageLevel}
              </span>
            </div>
            <p className="text-sm font-medium text-theme-primary">
              Nível Médio
            </p>
            <p className="text-xs text-theme-tertiary">Dificuldade geral</p>
          </div>
        </AnimatedItem>

        {/* Nível Mais Comum */}
        <AnimatedItem direction="up" hover="lift" delay={0.3}>
          <div className="bg-theme-elevated rounded-xl p-4 border border-theme-secondary">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                <FiAward className="w-5 h-5 text-accent-purple" />
              </div>
              <span className="text-2xl font-bold text-accent-purple">
                {stats.mostCommonLevel}
              </span>
            </div>
            <p className="text-sm font-medium text-theme-primary">Mais Comum</p>
            <p className="text-xs text-theme-tertiary">Nível predominante</p>
          </div>
        </AnimatedItem>
      </div>

      {/* Distribuição por Sistema */}
      {stats.systemDistribution.length > 1 && (
        <div className="mt-6 pt-6 border-t border-theme-secondary">
          <h4 className="text-lg font-semibold text-theme-primary mb-4">
            Distribuição por Sistema
          </h4>
          <div className="space-y-3">
            {stats.systemDistribution.map((system, index) => (
              <AnimatedItem
                key={system.system}
                direction="left"
                delay={index * 0.1}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-theme-secondary">
                    {system.system}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-theme-elevated rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-brand-gradient transition-all duration-1000"
                        style={{ width: `${system.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-theme-primary min-w-[3rem] text-right">
                      {system.count}
                    </span>
                  </div>
                </div>
              </AnimatedItem>
            ))}
          </div>
        </div>
      )}
    </AnimatedCard>
  );
}
