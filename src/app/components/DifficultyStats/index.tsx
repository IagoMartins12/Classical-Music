// app/difficulty/components/DifficultyStats.tsx

'use client';

import { PiChartBar, PiMedal, PiTrendUp, PiUsers } from 'react-icons/pi';
import { AnimatedItem, AnimatedCard } from '../animation/AnimatedComponents';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mr-4">
          <PiChartBar className="w-6 h-6 text-theme-primary" />
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
          <div className="bg-theme-elevated rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <PiTrendUp className="w-5 h-5 text-ouro-texto" />
              </div>
              <span className="text-2xl font-bold text-ouro-texto">
                {stats.totalWorks.toLocaleString()}
              </span>
            </div>
            <Text papel="rotulo" tom="forte" as="p" className="font-medium">
              Total de Obras
            </Text>
            <Text papel="legenda" tom="fraco" as="p">
              Com dificuldade classificada
            </Text>
          </div>
        </AnimatedItem>

        {/* Instrumentos */}
        <AnimatedItem direction="up" hover="lift" delay={0.1}>
          <div className="bg-theme-elevated rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <PiUsers className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">
                {stats.totalInstruments}
              </span>
            </div>
            <Text papel="rotulo" tom="forte" as="p" className="font-medium">
              Instrumentos
            </Text>
            <Text papel="legenda" tom="fraco" as="p">
              Com obras classificadas
            </Text>
          </div>
        </AnimatedItem>

        {/* Nível Médio */}
        <AnimatedItem direction="up" hover="lift" delay={0.2}>
          <div className="bg-theme-elevated rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <PiChartBar className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">{stats.averageLevel}</span>
            </div>
            <Text papel="rotulo" tom="forte" as="p" className="font-medium">
              Nível Médio
            </Text>
            <Text papel="legenda" tom="fraco" as="p">
              Dificuldade geral
            </Text>
          </div>
        </AnimatedItem>

        {/* Nível Mais Comum */}
        <AnimatedItem direction="up" hover="lift" delay={0.3}>
          <div className="bg-theme-elevated rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <PiMedal className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold">
                {stats.mostCommonLevel}
              </span>
            </div>
            <Text papel="rotulo" tom="forte" as="p" className="font-medium">
              Mais Comum
            </Text>
            <Text papel="legenda" tom="fraco" as="p">
              Nível predominante
            </Text>
          </div>
        </AnimatedItem>
      </div>

      {/* Distribuição por Sistema */}
      {stats.systemDistribution.length > 1 && (
        <Stack className="mt-6 pt-6 border-t border-theme-secondary">
          <h4 className="text-lg font-semibold text-theme-primary">
            Distribuição por Sistema
          </h4>
          <Stack gap={3}>
            {stats.systemDistribution.map((system, index) => (
              <AnimatedItem
                key={system.system}
                direction="left"
                delay={index * 0.1}
              >
                <div className="flex items-center justify-between">
                  <Text papel="rotulo" tom="suave" className="font-medium">
                    {system.system}
                  </Text>
                  <Inline gap={3}>
                    <div className="w-32 bg-theme-elevated rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000"
                        style={{ width: `${system.percentage}%` }}
                      />
                    </div>
                    <Text
                      papel="rotulo"
                      tom="forte"
                      className="font-semibold min-w-[3rem] text-right"
                    >
                      {system.count}
                    </Text>
                  </Inline>
                </div>
              </AnimatedItem>
            ))}
          </Stack>
        </Stack>
      )}
    </AnimatedCard>
  );
}
