import React from 'react';
import {
  FiClock,
  FiCalendar,
  FiTarget,
  FiTrendingUp,
  FiBookOpen,
} from 'react-icons/fi';
import { useStudySessions } from '@/app/hooks/useStudySessions';
import Link from 'next/link';

interface StudyStatsWidgetProps {
  className?: string;
  showDetailLink?: boolean;
  compact?: boolean;
}

const StudyStatsWidget: React.FC<StudyStatsWidgetProps> = ({
  className = '',
  showDetailLink = true,
  compact = false,
}) => {
  const {
    stats,
    loading,
    getSessionsThisWeek,
    getSessionsThisMonth,
    getMostStudiedWorks,
  } = useStudySessions();

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Get current streak (simplified - você pode expandir isso)
  // const getCurrentStreak = () => {
  //   const sessionsThisWeek = getSessionsThisWeek();
  //   return sessionsThisWeek.length;
  // };

  const thisWeekSessions = getSessionsThisWeek();
  const thisMonthSessions = getSessionsThisMonth();
  const mostStudiedWorks = getMostStudiedWorks();
  // const currentStreak = getCurrentStreak();

  if (loading) {
    return (
      <div className={`classical-card p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <span className="text-theme-primary">Carregando estatísticas...</span>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`classical-card-simple p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
              <FiClock className="w-5 h-5 text-theme-inverse" />
            </div>
            <div>
              <div className="text-lg font-bold text-theme-primary">
                {formatTime(stats.totalMinutes)}
              </div>
              <div className="text-sm text-theme-secondary">
                {stats.totalSessions} sessões
              </div>
            </div>
          </div>

          {showDetailLink && (
            <Link
              href="/profile/study-sessions"
              className="text-brand-primary hover:text-brand-secondary transition-colors text-sm font-medium"
            >
              Ver detalhes →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`classical-card p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
            <FiBookOpen className="w-5 h-5 text-theme-inverse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-primary classical-title">
              Estatísticas de Estudo
            </h3>
            <p className="text-sm text-theme-secondary">
              Seu progresso nos estudos
            </p>
          </div>
        </div>

        {showDetailLink && (
          <Link
            href="/profile/study-sessions"
            className="btn-classical-secondary text-sm flex items-center space-x-2"
          >
            <span>Ver todas</span>
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-theme-elevated rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiClock className="w-4 h-4 text-accent-blue" />
          </div>
          <div className="text-xl font-bold text-theme-primary">
            {formatTime(stats.totalMinutes)}
          </div>
          <div className="text-xs text-theme-tertiary">Tempo Total</div>
        </div>

        <div className="bg-theme-elevated rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-accent-green/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiTarget className="w-4 h-4 text-accent-green" />
          </div>
          <div className="text-xl font-bold text-theme-primary">
            {stats.totalSessions}
          </div>
          <div className="text-xs text-theme-tertiary">Sessões</div>
        </div>

        <div className="bg-theme-elevated rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-accent-purple/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiCalendar className="w-4 h-4 text-accent-purple" />
          </div>
          <div className="text-xl font-bold text-theme-primary">
            {thisWeekSessions.length}
          </div>
          <div className="text-xs text-theme-tertiary">Esta Semana</div>
        </div>

        <div className="bg-theme-elevated rounded-xl p-4 text-center">
          <div className="w-8 h-8 bg-brand-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
            <FiTrendingUp className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-xl font-bold text-theme-primary">
            {formatTime(stats.averageMinutes)}
          </div>
          <div className="text-xs text-theme-tertiary">Média/Sessão</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        {/* Esta Semana */}
        <div className="bg-theme-elevated rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-theme-primary">Esta Semana</h4>
            <span className="text-sm text-theme-secondary">
              {thisWeekSessions.length} sessões
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-theme-tertiary">Tempo estudado:</span>
            <span className="font-medium text-theme-primary">
              {formatTime(
                thisWeekSessions.reduce((total, s) => total + s.durationMin, 0)
              )}
            </span>
          </div>
        </div>

        {/* Obra Mais Estudada */}
        {mostStudiedWorks.length > 0 && (
          <div className="bg-theme-elevated rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-theme-primary">Obra Favorita</h4>
              <span className="text-sm text-theme-secondary">
                {mostStudiedWorks[0].sessionCount} sessões
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-theme-tertiary truncate pr-2">
                {mostStudiedWorks[0].workTitle}
              </span>
              <span className="font-medium text-theme-primary">
                {formatTime(mostStudiedWorks[0].totalMinutes)}
              </span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalSessions === 0 && (
          <div className="text-center py-8">
            <FiBookOpen className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
            <h4 className="font-medium text-theme-primary mb-2">
              Comece a estudar!
            </h4>
            <p className="text-sm text-theme-secondary mb-4">
              Use o modo estudo para registrar suas sessões de prática.
            </p>
            <Link href="/works" className="btn-classical-primary text-sm">
              Explorar Obras
            </Link>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      {stats.totalSessions > 0 && (
        <div className="mt-6 pt-4 border-t border-theme-secondary">
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-tertiary">Progresso este mês:</span>
            <span className="font-medium text-brand-primary">
              {thisMonthSessions.length} /{' '}
              {Math.max(thisMonthSessions.length, 20)} sessões
            </span>
          </div>
          <div className="mt-2 bg-theme-elevated rounded-full h-2">
            <div
              className="bg-brand-gradient h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  (thisMonthSessions.length / 20) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyStatsWidget;
