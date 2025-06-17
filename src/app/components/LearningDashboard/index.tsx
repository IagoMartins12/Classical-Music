// components/LearningDashboard/LearningProgressDashboard.tsx
'use client';

import { useState } from 'react';
import {
  FiTarget,
  FiCheckCircle,
  FiTrendingUp,
  FiStar,
  FiCalendar,
  FiMusic,
  FiAward,
  FiFilter,
  FiBarChart2,
} from 'react-icons/fi';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useAuth } from '@/app/hooks/useAuth';

interface LearningProgressDashboardProps {
  className?: string;
}

export default function LearningProgressDashboard({
  className = '',
}: LearningProgressDashboardProps) {
  const { user } = useAuth();
  const { wantToLearn, learned, getWantToLearnCount, getLearnedCount } =
    useLearningStore();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'want-to-learn' | 'learned'
  >('overview');
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  // Calcular estatísticas
  const stats = {
    totalWantToLearn: getWantToLearnCount(),
    totalLearned: getLearnedCount(),
    avgPriority:
      wantToLearn.reduce((acc, item) => acc + item.priority, 0) /
        wantToLearn.length || 0,
    avgMastery:
      learned.reduce((acc, item) => acc + item.mastery, 0) / learned.length ||
      0,
    recentlyAdded: wantToLearn.filter(
      (item) =>
        new Date(item.addedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    recentlyLearned: learned.filter(
      (item) =>
        new Date(item.learnedAt) >
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
  };

  // Distribuição por prioridade/maestria
  const priorityDistribution = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: wantToLearn.filter((item) => item.priority === level).length,
    label: ['Baixa', 'Baixa-Média', 'Média', 'Média-Alta', 'Alta'][level - 1],
  }));

  const masteryDistribution = [1, 2, 3, 4, 5].map((level) => ({
    level,
    count: learned.filter((item) => item.mastery === level).length,
    label: ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Expert'][
      level - 1
    ],
  }));

  // Filtrar itens baseado no nível selecionado
  const filteredWantToLearn = filterLevel
    ? wantToLearn.filter((item) => item.priority === filterLevel)
    : wantToLearn;

  const filteredLearned = filterLevel
    ? learned.filter((item) => item.mastery === filterLevel)
    : learned;

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = 'blue',
    trend,
  }: {
    icon: React.ComponentType<any>;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'blue' | 'green' | 'purple' | 'orange';
    trend?: { value: number; isPositive: boolean };
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600 bg-blue-50 text-blue-700 border-blue-200',
      green:
        'from-green-500 to-green-600 bg-green-50 text-green-700 border-green-200',
      purple:
        'from-purple-500 to-purple-600 bg-purple-50 text-purple-700 border-purple-200',
      orange:
        'from-orange-500 to-orange-600 bg-orange-50 text-orange-700 border-orange-200',
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              colorClasses[color].split(' ')[0]
            } ${
              colorClasses[color].split(' ')[1]
            } flex items-center justify-center`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div
              className={`flex items-center space-x-1 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <FiTrendingUp
                className={`w-4 h-4 ${!trend.isPositive ? 'rotate-180' : ''}`}
              />
              <span>
                {trend.value > 0 ? '+' : ''}
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const DistributionChart = ({
    data,
    type,
    color = 'blue',
  }: {
    data: Array<{ level: number; count: number; label: string }>;
    type: 'priority' | 'mastery';
    color?: 'blue' | 'green';
  }) => {
    const maxCount = Math.max(...data.map((d) => d.count));
    const colorClass = color === 'blue' ? 'bg-blue-500' : 'bg-green-500';

    return (
      <div className="space-y-3">
        {data.map(({ level, count, label }) => (
          <div key={level} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  {[...Array(level)].map((_, i) => (
                    <FiStar
                      key={i}
                      className="w-3 h-3 fill-current text-yellow-400"
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-700">{label}</span>
              </div>
              <span className="text-gray-600 font-medium">{count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                style={{
                  width: maxCount > 0 ? `${(count / maxCount) * 100}%` : '0%',
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const WorkItem = ({
    item,
    type,
  }: {
    item: any;
    type: 'want-to-learn' | 'learned';
  }) => {
    const level = type === 'want-to-learn' ? item.priority : item.mastery;
    const date = type === 'want-to-learn' ? item.addedAt : item.learnedAt;
    const levelLabel =
      type === 'want-to-learn'
        ? ['Baixa', 'Baixa-Média', 'Média', 'Média-Alta', 'Alta'][level - 1]
        : ['Iniciante', 'Básico', 'Intermediário', 'Avançado', 'Expert'][
            level - 1
          ];

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 mb-1">
              {item.work?.title || 'Obra desconhecida'}
            </h4>
            <p className="text-gray-600 text-sm">
              {item.work?.composer?.fullName}
            </p>
            {item.work?.opOrCatalog && (
              <p className="text-gray-500 text-xs mt-1">
                {item.work.opOrCatalog}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                type === 'want-to-learn'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}
            >
              {levelLabel}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <FiCalendar className="w-3 h-3" />
            <span>{new Date(date).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="flex items-center space-x-1">
            {[...Array(level)].map((_, i) => (
              <FiStar
                key={i}
                className="w-3 h-3 fill-current text-yellow-400"
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className={`bg-gray-50 rounded-xl p-8 text-center ${className}`}>
        <FiMusic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">
          Faça login para ver seu progresso de aprendizado
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Seu Progresso Musical
            </h2>
            <p className="text-gray-600">
              Acompanhe sua jornada de aprendizado em música clássica
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterLevel(null)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filterLevel === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setFilterLevel(level)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filterLevel === level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}★
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
            { id: 'want-to-learn', label: 'Quero Estudar', icon: FiTarget },
            { id: 'learned', label: 'Já Aprendi', icon: FiCheckCircle },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                activeTab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={FiTarget}
              title="Quero Estudar"
              value={stats.totalWantToLearn}
              subtitle={`${stats.recentlyAdded} adicionadas esta semana`}
              color="blue"
              trend={{ value: stats.recentlyAdded, isPositive: true }}
            />
            <StatCard
              icon={FiCheckCircle}
              title="Já Aprendi"
              value={stats.totalLearned}
              subtitle={`${stats.recentlyLearned} no último mês`}
              color="green"
              trend={{ value: stats.recentlyLearned, isPositive: true }}
            />
            <StatCard
              icon={FiStar}
              title="Prioridade Média"
              value={stats.avgPriority.toFixed(1)}
              subtitle="Das obras que quero estudar"
              color="purple"
            />
            <StatCard
              icon={FiAward}
              title="Maestria Média"
              value={stats.avgMastery.toFixed(1)}
              subtitle="Das obras aprendidas"
              color="orange"
            />
          </div>

          {/* Distribution Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiTarget className="w-5 h-5 text-blue-500" />
                <span>Distribuição por Prioridade</span>
              </h3>
              <DistributionChart
                data={priorityDistribution}
                type="priority"
                color="blue"
              />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FiCheckCircle className="w-5 h-5 text-green-500" />
                <span>Distribuição por Maestria</span>
              </h3>
              <DistributionChart
                data={masteryDistribution}
                type="mastery"
                color="green"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'want-to-learn' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Obras que Quero Estudar ({filteredWantToLearn.length})
            </h3>
            {filterLevel && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiFilter className="w-4 h-4" />
                <span>Prioridade {filterLevel} estrelas</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWantToLearn.map((item) => (
              <WorkItem key={item.id} item={item} type="want-to-learn" />
            ))}
          </div>
          {filteredWantToLearn.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <FiTarget className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filterLevel
                  ? `Nenhuma obra com prioridade ${filterLevel} estrelas`
                  : 'Nenhuma obra na sua lista de estudos ainda'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'learned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Obras Aprendidas ({filteredLearned.length})
            </h3>
            {filterLevel && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiFilter className="w-4 h-4" />
                <span>Maestria {filterLevel} estrelas</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLearned.map((item) => (
              <WorkItem key={item.id} item={item} type="learned" />
            ))}
          </div>
          {filteredLearned.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <FiCheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filterLevel
                  ? `Nenhuma obra com maestria ${filterLevel} estrelas`
                  : 'Nenhuma obra aprendida ainda'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
