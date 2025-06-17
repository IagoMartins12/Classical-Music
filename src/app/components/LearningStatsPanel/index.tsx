// Exemplo de como usar as novas funcionalidades do store atualizado

// components/LearningStatsPanel.tsx
'use client';

import { useLearningStore } from '@/app/stores/useLearningStore';
import {
  FiTrendingUp,
  FiStar,
  FiHeart,
  FiUsers,
  FiClock,
  FiAward,
} from 'react-icons/fi';

export default function LearningStatsPanel() {
  const {
    wantToLearn,
    learned,
    getWantToLearnCount,
    getLearnedCount,
    getWantToLearnByDifficulty,
    getLearnedByDifficulty,
    getLearnedByEnjoyment,
    getPublicPerformances,
    getRecommendedWorks,
    getAverageStudyTime,
    getAverageEnjoyment,
  } = useLearningStore();

  // Estatísticas básicas
  const basicStats = {
    totalWantToLearn: getWantToLearnCount(),
    totalLearned: getLearnedCount(),
    averageStudyTime: getAverageStudyTime(),
    averageEnjoyment: getAverageEnjoyment(),
  };

  // Estatísticas por dificuldade
  const difficultyStats = {
    wantToLearn: {
      beginner: getWantToLearnByDifficulty('BEGINNER').length,
      intermediate: getWantToLearnByDifficulty('INTERMEDIATE').length,
      advanced: getWantToLearnByDifficulty('ADVANCED').length,
    },
    learned: {
      beginner: getLearnedByDifficulty('BEGINNER').length,
      intermediate: getLearnedByDifficulty('INTERMEDIATE').length,
      advanced: getLearnedByDifficulty('ADVANCED').length,
    },
  };

  // Estatísticas especiais
  const specialStats = {
    publicPerformances: getPublicPerformances().length,
    recommendedWorks: getRecommendedWorks().length,
    highSatisfaction: getLearnedByEnjoyment(5).length, // 5 estrelas
    veryHighSatisfaction:
      getLearnedByEnjoyment(4).length + getLearnedByEnjoyment(5).length,
  };

  // Análise de motivações mais comuns
  const motivations = wantToLearn
    .filter((item) => item.motivation)
    .map((item) => item.motivation!)
    .reduce((acc, motivation) => {
      const key = motivation.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Análise de contextos mais comuns
  const contexts = wantToLearn
    .filter((item) => item.context)
    .map((item) => item.context!)
    .reduce((acc, context) => {
      const key = context.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // Desafios técnicos mais comuns
  const technicalChallenges = learned
    .filter((item) => item.technicalChallenges)
    .map((item) => item.technicalChallenges!)
    .reduce((acc, challenge) => {
      const key = challenge.toLowerCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = 'blue',
  }: {
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700',
      green: 'from-green-500 to-green-600 bg-green-50 text-green-700',
      purple: 'from-purple-500 to-purple-600 bg-purple-50 text-purple-700',
      orange: 'from-orange-500 to-orange-600 bg-orange-50 text-orange-700',
      red: 'from-red-500 to-red-600 bg-red-50 text-red-700',
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${
              colorClasses[color].split(' ')[0]
            } ${
              colorClasses[color].split(' ')[1]
            } flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Estatísticas Básicas */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Visão Geral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FiTrendingUp}
            title="Quero Estudar"
            value={basicStats.totalWantToLearn}
            subtitle="Obras na lista"
            color="blue"
          />
          <StatCard
            icon={FiAward}
            title="Já Aprendi"
            value={basicStats.totalLearned}
            subtitle="Obras dominadas"
            color="green"
          />
          <StatCard
            icon={FiClock}
            title="Tempo Médio"
            value={`${Math.round(basicStats.averageStudyTime)} dias`}
            subtitle="Para aprender"
            color="purple"
          />
          <StatCard
            icon={FiHeart}
            title="Satisfação"
            value={`${basicStats.averageEnjoyment.toFixed(1)}/5`}
            subtitle="Média geral"
            color="red"
          />
        </div>
      </section>

      {/* Estatísticas por Dificuldade */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Por Dificuldade
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quero Estudar por Dificuldade */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiTrendingUp className="w-5 h-5 text-blue-500" />
              <span>Quero Estudar</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Iniciante</span>
                <span className="font-semibold text-green-600">
                  {difficultyStats.wantToLearn.beginner}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Intermediário</span>
                <span className="font-semibold text-yellow-600">
                  {difficultyStats.wantToLearn.intermediate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Avançado</span>
                <span className="font-semibold text-red-600">
                  {difficultyStats.wantToLearn.advanced}
                </span>
              </div>
            </div>
          </div>

          {/* Já Aprendi por Dificuldade */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FiAward className="w-5 h-5 text-green-500" />
              <span>Já Aprendi</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Iniciante</span>
                <span className="font-semibold text-green-600">
                  {difficultyStats.learned.beginner}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Intermediário</span>
                <span className="font-semibold text-yellow-600">
                  {difficultyStats.learned.intermediate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Avançado</span>
                <span className="font-semibold text-red-600">
                  {difficultyStats.learned.advanced}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas Especiais */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Conquistas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FiUsers}
            title="Performances"
            value={specialStats.publicPerformances}
            subtitle="Obras tocadas em público"
            color="purple"
          />
          <StatCard
            icon={FiStar}
            title="Recomendações"
            value={specialStats.recommendedWorks}
            subtitle="Obras que recomendaria"
            color="orange"
          />
          <StatCard
            icon={FiHeart}
            title="Alta Satisfação"
            value={specialStats.veryHighSatisfaction}
            subtitle="4-5 estrelas"
            color="red"
          />
          <StatCard
            icon={FiAward}
            title="Excelentes"
            value={specialStats.highSatisfaction}
            subtitle="5 estrelas"
            color="green"
          />
        </div>
      </section>

      {/* Insights Textuais */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Motivações Mais Comuns */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Motivações Comuns
            </h3>
            <div className="space-y-2">
              {Object.entries(motivations)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([motivation, count]) => (
                  <div
                    key={motivation}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 capitalize">
                      {motivation}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Contextos Mais Comuns */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contextos Comuns
            </h3>
            <div className="space-y-2">
              {Object.entries(contexts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([context, count]) => (
                  <div
                    key={context}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 capitalize">
                      {context}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Desafios Técnicos */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Desafios Comuns
            </h3>
            <div className="space-y-2">
              {Object.entries(technicalChallenges)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([challenge, count]) => (
                  <div
                    key={challenge}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-700 capitalize">
                      {challenge}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Obras com Maior Satisfação */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Favoritas (5 Estrelas)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getLearnedByEnjoyment(5).map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <h4 className="font-semibold text-gray-900">
                {item.work?.title}
              </h4>
              <p className="text-sm text-gray-600">
                {item.work?.composer?.fullName}
              </p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-3 h-3 fill-current text-yellow-400"
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {item.publicPerformance && <span>🎭 Público</span>}
                  {item.wouldRecommend && <span>👍 Recomenda</span>}
                </div>
              </div>
              {item.musicalInsights && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  "{item.musicalInsights}"
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Hook personalizado para acessar estatísticas facilmente
export function useLearningStats() {
  const store = useLearningStore();

  return {
    // Dados básicos
    wantToLearn: store.wantToLearn,
    learned: store.learned,

    // Contadores
    totalWantToLearn: store.getWantToLearnCount(),
    totalLearned: store.getLearnedCount(),

    // Médias
    averageStudyTime: store.getAverageStudyTime(),
    averageEnjoyment: store.getAverageEnjoyment(),

    // Filtros especiais
    publicPerformances: store.getPublicPerformances(),
    recommendedWorks: store.getRecommendedWorks(),

    // Filtros por dificuldade
    getWantByDifficulty: store.getWantToLearnByDifficulty,
    getLearnedByDifficulty: store.getLearnedByDifficulty,

    // Filtros por satisfação
    getByEnjoyment: store.getLearnedByEnjoyment,

    // Filtros por prioridade/maestria
    getByPriority: store.getWantToLearnByPriority,
    getByMastery: store.getLearnedByMastery,
  };
}
