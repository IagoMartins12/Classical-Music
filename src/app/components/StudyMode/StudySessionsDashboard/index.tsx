import React, { useState } from 'react';
import {
  FiClock,
  FiMusic,
  FiCalendar,
  FiTrendingUp,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiBarChart2,
} from 'react-icons/fi';
import { useStudySessions } from '@/app/hooks/useStudySessions';

interface StudySessionsDashboardProps {
  workId?: string; // Para filtrar por obra específica
  className?: string;
}

const StudySessionsDashboard: React.FC<StudySessionsDashboardProps> = ({
  workId,
  className = '',
}) => {
  const {
    sessions,
    stats,
    loading,
    pagination,
    fetchSessions,
    deleteSession,
    getSessionsThisWeek,
    getSessionsThisMonth,
    getMostStudiedWorks,
  } = useStudySessions(workId);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'sessions' | 'analytics'
  >('overview');
  const [filterFocus, setFilterFocus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'rating'>('date');

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (filterFocus === 'all') return true;
    return session.focus.toLowerCase() === filterFocus.toLowerCase();
  });

  // Sort sessions
  const sortedSessions = [...filteredSessions].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'duration':
        return b.durationMin - a.durationMin;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get focus color
  const getFocusColor = (focus: string) => {
    const colors = {
      TECHNICAL: 'text-accent-blue bg-accent-blue/20 border-accent-blue/30',
      EXPRESSIVITY:
        'text-accent-purple bg-accent-purple/20 border-accent-purple/30',
      PRECISION: 'text-accent-green bg-accent-green/20 border-accent-green/30',
      SIGHT_READING:
        'text-brand-primary bg-brand-primary/20 border-brand-primary/30',
      MEMORIZATION: 'text-accent-red bg-accent-red/20 border-accent-red/30',
      PERFORMANCE:
        'text-brand-secondary bg-brand-secondary/20 border-brand-secondary/30',
      REVIEW:
        'text-theme-tertiary bg-theme-tertiary/20 border-theme-tertiary/30',
    };
    return colors[focus as keyof typeof colors] || colors.TECHNICAL;
  };

  const thisWeekSessions = getSessionsThisWeek();
  const thisMonthSessions = getSessionsThisMonth();
  const mostStudiedWorks = getMostStudiedWorks();

  if (loading && sessions.length === 0) {
    return (
      <div className={`classical-card p-8 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
          <span className="text-theme-primary font-medium">
            Carregando sessões de estudo...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="classical-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-theme-primary classical-title">
              Sessões de Estudo
            </h2>
            <p className="text-theme-secondary">
              {workId
                ? 'Histórico para esta obra'
                : 'Seu histórico completo de estudos'}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">
                {stats.totalSessions}
              </div>
              <div className="text-xs text-theme-tertiary">Sessões</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">
                {formatTime(stats.totalMinutes)}
              </div>
              <div className="text-xs text-theme-tertiary">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary">
                {formatTime(stats.averageMinutes)}
              </div>
              <div className="text-xs text-theme-tertiary">Média</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1">
          {[
            { id: 'overview', label: 'Visão Geral', icon: FiBarChart2 },
            { id: 'sessions', label: 'Sessões', icon: FiClock },
            { id: 'analytics', label: 'Análises', icon: FiTrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-brand-gradient text-theme-inverse shadow-theme-glow'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-interactive-hover'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Esta Semana */}
          <div className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                <FiCalendar className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">
                  Esta Semana
                </h3>
                <p className="text-sm text-theme-secondary">
                  {thisWeekSessions.length} sessões
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-theme-tertiary">Tempo total:</span>
                <span className="font-medium text-theme-primary">
                  {formatTime(
                    thisWeekSessions.reduce(
                      (total, s) => total + s.durationMin,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-tertiary">Média por sessão:</span>
                <span className="font-medium text-theme-primary">
                  {formatTime(
                    Math.round(
                      thisWeekSessions.reduce(
                        (total, s) => total + s.durationMin,
                        0
                      ) / (thisWeekSessions.length || 1)
                    )
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Este Mês */}
          <div className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                <FiTrendingUp className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">
                  Este Mês
                </h3>
                <p className="text-sm text-theme-secondary">
                  {thisMonthSessions.length} sessões
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-theme-tertiary">Tempo total:</span>
                <span className="font-medium text-theme-primary">
                  {formatTime(
                    thisMonthSessions.reduce(
                      (total, s) => total + s.durationMin,
                      0
                    )
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-theme-tertiary">Média por sessão:</span>
                <span className="font-medium text-theme-primary">
                  {formatTime(
                    Math.round(
                      thisMonthSessions.reduce(
                        (total, s) => total + s.durationMin,
                        0
                      ) / (thisMonthSessions.length || 1)
                    )
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Obras Mais Estudadas */}
          <div className="classical-card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-theme-primary">
                  Mais Estudadas
                </h3>
                <p className="text-sm text-theme-secondary">Top 3 obras</p>
              </div>
            </div>

            <div className="space-y-3">
              {mostStudiedWorks.slice(0, 3).map((work, index) => (
                <div
                  key={work.workId}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 bg-brand-primary/20 text-brand-primary rounded-full text-xs flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="text-theme-primary font-medium truncate">
                        {work.workTitle}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-theme-primary">
                      {formatTime(work.totalMinutes)}
                    </div>
                    <div className="text-xs text-theme-tertiary">
                      {work.sessionCount} sessões
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions Tab */}
      {activeTab === 'sessions' && (
        <div className="classical-card p-6">
          {/* Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FiFilter className="w-4 h-4 text-theme-tertiary" />
                <select
                  value={filterFocus}
                  onChange={(e) => setFilterFocus(e.target.value)}
                  className="input-classical-2 text-sm"
                >
                  <option value="all">Todos os focos</option>
                  <option value="technical">Técnico</option>
                  <option value="expressivity">Expressividade</option>
                  <option value="precision">Precisão</option>
                  <option value="sight_reading">Leitura</option>
                  <option value="memorization">Memorização</option>
                  <option value="performance">Performance</option>
                  <option value="review">Revisão</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-classical-2 text-sm"
              >
                <option value="date">Ordenar por data</option>
                <option value="duration">Ordenar por duração</option>
                <option value="rating">Ordenar por avaliação</option>
              </select>
            </div>

            <div className="text-sm text-theme-tertiary">
              {sortedSessions.length} sessões encontradas
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className="bg-theme-elevated rounded-xl border border-theme-secondary p-4 hover:border-theme-primary transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-theme-primary">
                        {session.work.title}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getFocusColor(
                          session.focus
                        )}`}
                      >
                        {session.focus}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-theme-secondary mb-3">
                      <div className="flex items-center space-x-1">
                        <FiClock className="w-3 h-3" />
                        <span>{formatTime(session.durationMin)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>{formatDate(session.date)}</span>
                      </div>
                      {session.metronomeUsed && (
                        <div className="flex items-center space-x-1">
                          <FiMusic className="w-3 h-3" />
                          <span>Metrônomo</span>
                        </div>
                      )}
                      {session.rating && (
                        <div className="flex items-center space-x-1">
                          <span>⭐</span>
                          <span>{session.rating}/5</span>
                        </div>
                      )}
                    </div>

                    {session.notes && (
                      <p className="text-sm text-theme-tertiary bg-theme-primary/5 rounded-lg p-3 mb-3">
                        {session.notes}
                      </p>
                    )}

                    {session.sectionsWorked.length > 0 && (
                      <div className="mb-3">
                        <div className="text-xs text-theme-tertiary mb-2">
                          Seções trabalhadas:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {session.sectionsWorked.map((section, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full"
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {session.practiceGoals.length > 0 && (
                      <div>
                        <div className="text-xs text-theme-tertiary mb-2">
                          Objetivos:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {session.practiceGoals.map((goal, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-accent-green/10 text-accent-green text-xs rounded-full"
                            >
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => {
                        // TODO: Implement edit functionality
                        console.log('Edit session', session.id);
                      }}
                      className="w-8 h-8 bg-interactive-hover rounded-lg hover:bg-accent-blue/20 hover:text-accent-blue transition-colors flex items-center justify-center"
                    >
                      <FiEdit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="w-8 h-8 bg-interactive-hover rounded-lg hover:bg-accent-red/20 hover:text-accent-red transition-colors flex items-center justify-center"
                    >
                      <FiTrash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {sortedSessions.length === 0 && (
              <div className="text-center py-12">
                <FiClock className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  Nenhuma sessão encontrada
                </h3>
                <p className="text-theme-secondary">
                  {filterFocus === 'all'
                    ? 'Você ainda não tem sessões de estudo registradas.'
                    : 'Nenhuma sessão encontrada com os filtros aplicados.'}
                </p>
              </div>
            )}
          </div>

          {/* Load more */}
          {pagination.hasNext && (
            <div className="text-center pt-6">
              <button
                onClick={() =>
                  fetchSessions(
                    workId,
                    pagination.limit,
                    pagination.offset + pagination.limit
                  )
                }
                disabled={loading}
                className="btn-classical-secondary"
              >
                {loading ? 'Carregando...' : 'Carregar mais sessões'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="classical-card p-6">
          <div className="text-center py-12">
            <FiBarChart2 className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              Analytics em desenvolvimento
            </h3>
            <p className="text-theme-secondary">
              Gráficos e análises detalhadas estarão disponíveis em breve.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySessionsDashboard;
