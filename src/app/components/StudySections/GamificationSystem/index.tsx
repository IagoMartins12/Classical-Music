import React, { useState, useEffect } from 'react';
import { BiTrophy } from 'react-icons/bi';
import {
  FiAward,
  FiTarget,
  FiTrendingUp,
  FiCalendar,
  FiZap,
  FiStar,
  FiClock,
  FiMusic,
  FiGift,
  FiUsers,
  FiShare2,
  FiChevronRight,
  FiCheckCircle,
  FiLock,
  FiRefreshCw,
  FiActivity,
  FiHeart,
  FiEye,
  FiSettings,
  FiPlus,
  FiEdit3,
  FiTrash2,
} from 'react-icons/fi';
import { GiMedal, GiCrown, GiFireFlower } from 'react-icons/gi';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category:
    | 'practice'
    | 'technical'
    | 'social'
    | 'milestone'
    | 'creative'
    | 'repertoire';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  requirements: {
    type: 'time' | 'sessions' | 'streak' | 'quality' | 'repertoire' | 'custom';
    target: number;
    current: number;
    unit?: string;
  };
  rewards: {
    xp: number;
    badges?: string[];
    unlocks?: string[];
  };
  earned: boolean;
  earnedAt?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  type: 'practice_time' | 'sessions' | 'streak' | 'repertoire' | 'technique';
  target: number;
  current: number;
  unit: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  isActive: boolean;
  createdAt: string;
  completedAt?: string;
  reward: {
    xp: number;
    title?: string;
  };
}

interface UserLevel {
  level: number;
  xp: number;
  xpToNext: number;
  totalXP: number;
  title: string;
  perks: string[];
}

interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar?: string;
  weeklyMinutes: number;
  streak: number;
  level: number;
  instruments: string[];
  rank: number;
}

const GamificationSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'achievements' | 'goals' | 'leaderboard' | 'rewards'
  >('overview');
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    category: 'daily',
    type: 'practice_time',
    priority: 'medium',
  });

  // Dados simulados
  const [userLevel] = useState<UserLevel>({
    level: 12,
    xp: 2850,
    xpToNext: 150,
    totalXP: 3000,
    title: 'Músico Dedicado',
    perks: [
      'Modo avançado de análise',
      '50% de desconto em masterclasses',
      'Acesso ao repertório premium',
    ],
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'Primeiro Passo',
      description: 'Complete sua primeira sessão de estudo',
      icon: '🎵',
      category: 'milestone',
      difficulty: 'bronze',
      requirements: {
        type: 'sessions',
        target: 1,
        current: 1,
        unit: 'sessão',
      },
      rewards: { xp: 50 },
      earned: true,
      earnedAt: '2024-06-01',
      rarity: 'common',
    },
    {
      id: '2',
      title: 'Sequência de Fogo',
      description: 'Pratique por 7 dias consecutivos',
      icon: '🔥',
      category: 'practice',
      difficulty: 'silver',
      requirements: {
        type: 'streak',
        target: 7,
        current: 12,
        unit: 'dias',
      },
      rewards: { xp: 200, badges: ['Consistente'] },
      earned: true,
      earnedAt: '2024-06-15',
      rarity: 'rare',
    },
    {
      id: '3',
      title: 'Maratonista',
      description: 'Acumule 100 horas de prática',
      icon: '🏃‍♂️',
      category: 'milestone',
      difficulty: 'gold',
      requirements: {
        type: 'time',
        target: 6000,
        current: 4080,
        unit: 'minutos',
      },
      rewards: { xp: 500, unlocks: ['Análise avançada de progresso'] },
      earned: false,
      rarity: 'epic',
    },
    {
      id: '4',
      title: 'Perfeccionista',
      description: 'Obtenha nota 9+ em 10 sessões consecutivas',
      icon: '⭐',
      category: 'technical',
      difficulty: 'platinum',
      requirements: {
        type: 'quality',
        target: 10,
        current: 6,
        unit: 'sessões',
      },
      rewards: {
        xp: 1000,
        badges: ['Perfeccionista'],
        unlocks: ['Modo performance'],
      },
      earned: false,
      rarity: 'legendary',
    },
    {
      id: '5',
      title: 'Colecionador',
      description: 'Aprenda 25 peças diferentes',
      icon: '📚',
      category: 'repertoire',
      difficulty: 'gold',
      requirements: {
        type: 'repertoire',
        target: 25,
        current: 18,
        unit: 'peças',
      },
      rewards: { xp: 400, badges: ['Colecionador'] },
      earned: false,
      rarity: 'rare',
    },
  ]);

  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Prática Diária',
      description: 'Pratique pelo menos 30 minutos hoje',
      category: 'daily',
      type: 'practice_time',
      target: 30,
      current: 25,
      unit: 'minutos',
      priority: 'high',
      isActive: true,
      createdAt: '2024-06-24',
      reward: { xp: 50 },
    },
    {
      id: '2',
      title: 'Meta Semanal',
      description: 'Complete 5 horas de prática esta semana',
      category: 'weekly',
      type: 'practice_time',
      target: 300,
      current: 264,
      unit: 'minutos',
      deadline: '2024-06-30',
      priority: 'medium',
      isActive: true,
      createdAt: '2024-06-17',
      reward: { xp: 200, title: 'Dedicado Semanal' },
    },
    {
      id: '3',
      title: 'Técnica Mensal',
      description: 'Domine 3 novas técnicas este mês',
      category: 'monthly',
      type: 'technique',
      target: 3,
      current: 1,
      unit: 'técnicas',
      deadline: '2024-06-30',
      priority: 'medium',
      isActive: true,
      createdAt: '2024-06-01',
      reward: { xp: 300 },
    },
  ]);

  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      userId: '1',
      username: 'Maria Silva',
      weeklyMinutes: 420,
      streak: 15,
      level: 18,
      instruments: ['Piano', 'Violino'],
      rank: 1,
    },
    {
      userId: '2',
      username: 'João Santos',
      weeklyMinutes: 380,
      streak: 12,
      level: 16,
      instruments: ['Piano'],
      rank: 2,
    },
    {
      userId: '3',
      username: 'Ana Costa',
      weeklyMinutes: 340,
      streak: 8,
      level: 14,
      instruments: ['Violino'],
      rank: 3,
    },
    {
      userId: '4',
      username: 'Você',
      weeklyMinutes: 264,
      streak: 12,
      level: 12,
      instruments: ['Piano'],
      rank: 4,
    },
    {
      userId: '5',
      username: 'Pedro Lima',
      weeklyMinutes: 220,
      streak: 5,
      level: 10,
      instruments: ['Trompete'],
      rank: 5,
    },
  ]);

  // Função para calcular progresso
  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  // Componente de conquista
  const AchievementCard: React.FC<{ achievement: Achievement }> = ({
    achievement,
  }) => {
    const progress = getProgress(
      achievement.requirements.current,
      achievement.requirements.target
    );

    const difficultyColors = {
      bronze: 'from-amber-600 to-amber-700',
      silver: 'from-gray-400 to-gray-500',
      gold: 'from-yellow-400 to-yellow-500',
      platinum: 'from-purple-400 to-purple-500',
    };

    const rarityBorders = {
      common: 'border-gray-500',
      rare: 'border-blue-500',
      epic: 'border-purple-500',
      legendary: 'border-yellow-500',
    };

    return (
      <div
        className={`relative rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105 ${
          achievement.earned
            ? `bg-gradient-to-br ${difficultyColors[achievement.difficulty]} ${
                rarityBorders[achievement.rarity]
              }`
            : `bg-white/5 border-white/20 ${
                achievement.requirements.current > 0 ? 'hover:bg-white/10' : ''
              }`
        } ${
          achievement.rarity === 'legendary'
            ? 'shadow-lg shadow-yellow-500/20'
            : ''
        }`}
      >
        {/* Efeito de brilho para conquistas lendárias */}
        {achievement.rarity === 'legendary' && achievement.earned && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className={`text-3xl ${
                  achievement.earned ? '' : 'grayscale opacity-50'
                }`}
              >
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h3
                  className={`font-semibold ${
                    achievement.earned ? 'text-white' : 'text-gray-300'
                  }`}
                >
                  {achievement.title}
                </h3>
                <p
                  className={`text-sm ${
                    achievement.earned ? 'text-gray-200' : 'text-gray-400'
                  }`}
                >
                  {achievement.description}
                </p>
              </div>
            </div>

            {achievement.earned ? (
              <FiCheckCircle className="w-6 h-6 text-green-400" />
            ) : achievement.requirements.current === 0 ? (
              <FiLock className="w-6 h-6 text-gray-600" />
            ) : (
              <div className="text-right">
                <div className="text-sm font-bold text-white">
                  {Math.round(progress)}%
                </div>
              </div>
            )}
          </div>

          {/* Progresso */}
          {!achievement.earned && achievement.requirements.current > 0 && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">
                  {achievement.requirements.current} /{' '}
                  {achievement.requirements.target}{' '}
                  {achievement.requirements.unit}
                </span>
                <span className="text-white font-medium">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="h-2 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Recompensas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                +{achievement.rewards.xp} XP
              </span>
              {achievement.rewards.badges && (
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  Badge
                </span>
              )}
              {achievement.rewards.unlocks && (
                <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                  Desbloqueio
                </span>
              )}
            </div>

            <span
              className={`text-xs px-2 py-1 rounded ${
                achievement.rarity === 'legendary'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : achievement.rarity === 'epic'
                  ? 'bg-purple-500/20 text-purple-400'
                  : achievement.rarity === 'rare'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              {achievement.rarity}
            </span>
          </div>

          {achievement.earned && achievement.earnedAt && (
            <div className="mt-2 text-xs text-gray-300">
              Conquistado em{' '}
              {new Date(achievement.earnedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Componente de meta
  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = getProgress(goal.current, goal.target);
    const isCompleted = goal.current >= goal.target;
    const isOverdue =
      goal.deadline && new Date(goal.deadline) < new Date() && !isCompleted;

    const priorityColors = {
      low: 'border-green-500/30 bg-green-500/10',
      medium: 'border-yellow-500/30 bg-yellow-500/10',
      high: 'border-red-500/30 bg-red-500/10',
    };

    return (
      <div
        className={`rounded-xl p-4 border transition-all duration-300 ${
          isCompleted
            ? 'bg-green-500/20 border-green-500/40'
            : isOverdue
            ? 'bg-red-500/20 border-red-500/40'
            : 'bg-white/5 border-white/20 hover:bg-white/10'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3
              className={`font-semibold ${
                isCompleted ? 'text-green-400' : 'text-white'
              }`}
            >
              {goal.title}
            </h3>
            <p className="text-sm text-gray-400 mb-2">{goal.description}</p>

            <div className="flex items-center space-x-4 text-xs">
              <span
                className={`px-2 py-1 rounded ${priorityColors[goal.priority]}`}
              >
                {goal.priority}
              </span>
              <span className="text-gray-500">{goal.category}</span>
              {goal.deadline && (
                <span
                  className={`${isOverdue ? 'text-red-400' : 'text-gray-500'}`}
                >
                  ⏰ {new Date(goal.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {isCompleted && <FiCheckCircle className="w-6 h-6 text-green-400" />}
        </div>

        {/* Barra de progresso */}
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">
              {goal.current} / {goal.target} {goal.unit}
            </span>
            <span className="text-white font-medium">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-green-400 to-green-500'
                  : 'bg-gradient-to-r from-blue-400 to-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Recompensa */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">+{goal.reward.xp} XP</span>
          {goal.reward.title && (
            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
              {goal.reward.title}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Visão geral
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Nível do usuário */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <GiCrown className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              Nível {userLevel.level}
            </h2>
            <p className="text-blue-300">{userLevel.title}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              {userLevel.xp} XP
            </div>
            <div className="text-sm text-gray-400">
              {userLevel.xpToNext} para próximo nível
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className="h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-500"
              style={{
                width: `${
                  (userLevel.xp / (userLevel.xp + userLevel.xpToNext)) * 100
                }%`,
              }}
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Vantagens do nível:
          </h4>
          <div className="flex flex-wrap gap-2">
            {userLevel.perks.map((perk, index) => (
              <span
                key={index}
                className="text-xs bg-white/10 text-white px-2 py-1 rounded"
              >
                {perk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Metas ativas */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Metas Ativas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals
            .filter((goal) => goal.isActive)
            .slice(0, 4)
            .map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
        </div>
      </div>

      {/* Conquistas recentes */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Últimas Conquistas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements
            .filter((a) => a.earned)
            .slice(0, 3)
            .map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Sistema de Progresso
          </h2>
          <p className="text-gray-400">
            Acompanhe suas conquistas e estabeleça metas
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2">
            <div className="flex items-center space-x-2">
              <FiZap className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium">{userLevel.xp} XP</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateGoal(true)}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Nova Meta</span>
          </button>
        </div>
      </div>

      {/* Navegação */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visão Geral', icon: FiActivity },
          { id: 'achievements', label: 'Conquistas', icon: FiAward },
          { id: 'goals', label: 'Metas', icon: FiTarget },
          { id: 'leaderboard', label: 'Ranking', icon: BiTrophy },
          { id: 'rewards', label: 'Recompensas', icon: FiGift },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo baseado na aba ativa */}
      {activeTab === 'overview' && <OverviewTab />}

      {activeTab === 'achievements' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="all">Todas as categorias</option>
              <option value="practice">Prática</option>
              <option value="technical">Técnica</option>
              <option value="social">Social</option>
              <option value="milestone">Marco</option>
              <option value="creative">Criativo</option>
            </select>
          </div>

          {/* Grid de conquistas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements
              .filter(
                (a) =>
                  selectedCategory === 'all' || a.category === selectedCategory
              )
              .map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Ranking Semanal</h3>
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`rounded-xl p-4 border transition-all duration-300 ${
                  entry.userId === '4'
                    ? 'bg-blue-500/20 border-blue-500/40'
                    : 'bg-white/5 border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      entry.rank === 1
                        ? 'bg-yellow-500 text-white'
                        : entry.rank === 2
                        ? 'bg-gray-400 text-white'
                        : entry.rank === 3
                        ? 'bg-amber-600 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {entry.rank}
                  </div>

                  <div className="flex-1">
                    <h4 className="font-medium text-white">{entry.username}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>
                        ⏱️ {Math.floor(entry.weeklyMinutes / 60)}h{' '}
                        {entry.weeklyMinutes % 60}m
                      </span>
                      <span>🔥 {entry.streak} dias</span>
                      <span>📊 Nv. {entry.level}</span>
                    </div>
                  </div>

                  <div className="flex space-x-1">
                    {entry.instruments.map((instrument, index) => (
                      <span
                        key={index}
                        className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded"
                      >
                        {instrument}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="text-center py-20">
          <FiGift className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Loja de Recompensas
          </h3>
          <p className="text-gray-400">
            Use seus pontos XP para desbloquear conteúdos exclusivos
          </p>
        </div>
      )}

      {/* Modal de criar meta */}
      {showCreateGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl border border-white/20 p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Nova Meta</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={newGoal.title || ''}
                  onChange={(e) =>
                    setNewGoal((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  placeholder="Nome da sua meta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Categoria
                  </label>
                  <select
                    value={newGoal.category}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        category: e.target.value as any,
                      }))
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo
                  </label>
                  <select
                    value={newGoal.type}
                    onChange={(e) =>
                      setNewGoal((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                      }))
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="practice_time">Tempo de prática</option>
                    <option value="sessions">Número de sessões</option>
                    <option value="streak">Sequência</option>
                    <option value="repertoire">Repertório</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meta
                </label>
                <input
                  type="number"
                  value={newGoal.target || ''}
                  onChange={(e) =>
                    setNewGoal((prev) => ({
                      ...prev,
                      target: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                  placeholder="Valor alvo"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateGoal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Aqui adicionaria a lógica para criar a meta
                  setShowCreateGoal(false);
                }}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
              >
                Criar Meta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationSystem;
