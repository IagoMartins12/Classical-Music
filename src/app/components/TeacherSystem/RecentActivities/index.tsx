// app/components/Dashboard/RecentActivities.tsx - Componente compartilhado para atividades recentes

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiActivity,
  FiPlus,
  FiEdit,
  FiUser,
  FiCalendar,
  FiFileText,
  FiMessageSquare,
  FiRefreshCw,
  FiChevronRight,
  FiEye,
  FiUpload,
  FiCheckCircle,
  FiX,
  FiRotateCcw,
  FiUserPlus,
  FiVideo,
  FiFile,
  FiStar,
  FiAward,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';

interface Activity {
  id: string;
  action: string;
  entityId: string;
  entityType: string;
  entityName?: string;
  title: string;
  description?: string;
  changes?: any;
  metadata?: any;
  createdAt: string;
  timeAgo: string;
  entityExists: boolean;
  entityDisplayName: string;
}

interface RecentActivitiesProps {
  userType: 'teacher' | 'student';
  userId: string;
  className?: string;
}

const RecentActivities = ({
  userType,
  userId,
  className,
}: RecentActivitiesProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentActivities();
  }, [userType, userId]);

  const fetchRecentActivities = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        '/api/school-activities?recent=true&limit=5'
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar atividades');
      }

      const data = await response.json();

      if (data.success) {
        setActivities(data.activities || []);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter ícone da ação
  const getActionIcon = (action: string, metadata?: any) => {
    // Ícones específicos para professor
    if (userType === 'teacher') {
      switch (action) {
        // Para professores
        case 'WELCOME_NEW_TEACHER':
          return <FiAward className="w-4 h-4 text-purple-600" />; // Precisará importar FiAward
        case 'STUDENT_DECLINED_INVITE':
          return <FiX className="w-4 h-4 text-red-600" />;
        case 'STUDENT_ADDED':
          return <FiUserPlus className="w-4 h-4 text-green-600" />;
        case 'LESSON_CREATED':
          return <FiPlus className="w-4 h-4 text-blue-600" />;
        case 'LESSON_UPDATED':
          return <FiEdit className="w-4 h-4 text-orange-600" />;
        case 'LESSON_STATUS_CHANGED':
          return <FiRotateCcw className="w-4 h-4 text-purple-600" />;
        case 'ASSIGNMENT_CREATED':
          return <FiFileText className="w-4 h-4 text-blue-600" />;
        case 'ASSIGNMENT_UPDATED':
          return <FiEdit className="w-4 h-4 text-orange-600" />;
        case 'ASSIGNMENT_FEEDBACK_GIVEN':
          return <FiStar className="w-4 h-4 text-yellow-600" />;
        case 'LESSON_NOTES_ADDED':
          return <FiMessageSquare className="w-4 h-4 text-indigo-600" />;
        case 'TEACHER_PROFILE_UPDATED':
        case 'USER_PROFILE_UPDATED':
          return <FiUser className="w-4 h-4 text-gray-600" />;
        default:
          return <FiActivity className="w-4 h-4 text-gray-600" />;
      }
    }

    // Ícones específicos para aluno
    if (userType === 'student') {
      switch (action) {
        case 'ASSIGNMENT_SUBMISSION':
          if (metadata?.submissionType === 'video') {
            return <FiVideo className="w-4 h-4 text-purple-600" />;
          } else if (metadata?.submissionType === 'file') {
            return <FiFile className="w-4 h-4 text-blue-600" />;
          }
          return <FiUpload className="w-4 h-4 text-green-600" />;
        case 'WELCOME_NEW_STUDENT':
          return <FiStar className="w-4 h-4 text-yellow-600" />;
        case 'ASSIGNMENT_COMPLETED':
          return <FiCheckCircle className="w-4 h-4 text-green-600" />;
        case 'LESSON_FEEDBACK_GIVEN':
          return <FiMessageSquare className="w-4 h-4 text-blue-600" />;
        case 'LESSON_RESCHEDULE_REQUESTED':
          return <FiCalendar className="w-4 h-4 text-orange-600" />;
        case 'LESSON_ABSENCE_INFORMED':
          return <FiX className="w-4 h-4 text-red-600" />;
        case 'STUDENT_PROFILE_UPDATED':
          return <FiUser className="w-4 h-4 text-gray-600" />;
        default:
          return <FiActivity className="w-4 h-4 text-gray-600" />;
      }
    }

    return <FiActivity className="w-4 h-4 text-gray-600" />;
  };

  // Função para obter rótulo amigável da ação
  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      // Professor
      STUDENT_ADDED: 'Novo Aluno',
      LESSON_CREATED: 'Aula Criada',
      LESSON_UPDATED: 'Aula Editada',
      LESSON_STATUS_CHANGED: 'Status Alterado',
      ASSIGNMENT_CREATED: 'Tarefa Criada',
      ASSIGNMENT_UPDATED: 'Tarefa Editada',
      ASSIGNMENT_FEEDBACK_GIVEN: 'Feedback Dado',
      LESSON_NOTES_ADDED: 'Anotações',
      TEACHER_PROFILE_UPDATED: 'Perfil Atualizado',
      USER_PROFILE_UPDATED: 'Dados Atualizados',
      WELCOME_NEW_STUDENT: 'Boas-vindas',
      WELCOME_NEW_TEACHER: 'Novo Professor',
      STUDENT_DECLINED_INVITE: 'Convite Recusado',

      // Aluno
      ASSIGNMENT_SUBMISSION: 'Submissão Enviada',
      ASSIGNMENT_COMPLETED: 'Tarefa Concluída',
      LESSON_FEEDBACK_GIVEN: 'Feedback Dado',
      LESSON_RESCHEDULE_REQUESTED: 'Reagendamento',
      LESSON_ABSENCE_INFORMED: 'Ausência Informada',
      STUDENT_PROFILE_UPDATED: 'Perfil Atualizado',
    };

    return labels[action] || action;
  };

  // Função para obter link da entidade
  const getEntityLink = (activity: Activity) => {
    if (!activity.entityExists || !activity.entityId) return null;

    const basePath = userType === 'teacher' ? '/teacher' : '/student';

    switch (activity.entityType) {
      case 'lesson':
        return `${basePath}/lessons/${activity.entityId}`;
      case 'assignment':
        return `${basePath}/assignments/${activity.entityId}`;
      case 'student':
        return userType === 'teacher'
          ? `/teacher/students/${activity.entityId}`
          : null;
      case 'profile':
        return `${basePath}/profile`;
      default:
        return null;
    }
  };

  // Função para formatar mudanças
  const formatChanges = (changes: any) => {
    if (!changes || typeof changes !== 'object') return null;

    const changedFields = Object.keys(changes);
    if (changedFields.length === 0) return null;

    const firstField = changedFields[0];
    const change = changes[firstField];

    if (typeof change === 'object' && 'from' in change && 'to' in change) {
      return (
        <div className="text-xs text-theme-tertiary mt-1">
          <span className="font-medium">{firstField}:</span>{' '}
          {String(change.from)} → {String(change.to)}
          {changedFields.length > 1 &&
            ` (+${changedFields.length - 1} alterações)`}
        </div>
      );
    }

    return (
      <div className="text-xs text-theme-tertiary mt-1">
        {changedFields.length === 1
          ? '1 campo alterado'
          : `${changedFields.length} campos alterados`}
      </div>
    );
  };

  if (loading) {
    return (
      <AnimatedCard className={`classical-card p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard className={`classical-card p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-orange rounded-lg flex items-center justify-center">
              <FiActivity className="w-4 h-4 text-theme-primary" />
            </div>
            <div>
              <h3 className="font-bold text-theme-primary">
                Atividades Recentes
              </h3>
              <p className="text-xs text-theme-tertiary">Erro ao carregar</p>
            </div>
          </div>
          <button
            onClick={fetchRecentActivities}
            className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-accent-red transition-all flex items-center justify-center group"
          >
            <FiRefreshCw className="w-4 h-4 text-theme-tertiary group-hover:text-accent-red transition-colors" />
          </button>
        </div>

        <div className="text-center py-4">
          <p className="text-sm text-theme-secondary">{error}</p>
          <button
            onClick={fetchRecentActivities}
            className="mt-2 text-sm text-accent-blue hover:text-accent-purple transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className={`classical-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center">
            <FiActivity className="w-4 h-4 text-theme-primary" />
          </div>
          <div>
            <h3 className="font-bold text-theme-primary">
              Atividades Recentes
            </h3>
            <p className="text-xs text-theme-tertiary">
              {activities.length > 0 ? 'Últimos 7 dias' : 'Nenhuma atividade'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchRecentActivities}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
          >
            <FiRefreshCw
              className={`w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-all ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>

          {activities.length > 0 && (
            <Link
              href={`/${userType}/history`}
              className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>Ver todas</span>
              <FiChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <FiActivity className="w-12 h-12 text-theme-tertiary mx-auto mb-2" />
            <p className="text-sm text-theme-tertiary">
              Nenhuma atividade nos últimos 7 dias
            </p>
            <p className="text-xs text-theme-tertiary mt-1">
              Suas ações aparecerão aqui
            </p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <AnimatedItem
              key={activity.id}
              direction="left"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="classical-card-2 p-3 group">
                <div className="flex items-start space-x-3">
                  {/* Ícone da ação */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary flex items-center justify-center">
                      {getActionIcon(activity.action, activity.metadata)}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span
                            className={`py-1 rounded-full text-xs font-extrabold `}
                          >
                            {getActionLabel(activity.action)}
                          </span>
                          <span className="text-xs text-theme-tertiary">
                            {activity.timeAgo}
                          </span>
                        </div>

                        <h4 className="text-sm font-medium text-theme-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
                          {activity.title}
                        </h4>

                        {activity.description && (
                          <p className="text-xs text-theme-secondary mt-1 line-clamp-2">
                            {activity.description}
                          </p>
                        )}

                        {/* Mostrar mudanças se existirem */}
                        {formatChanges(activity.changes)}

                        {/* Nome da entidade se existir */}
                        {activity.entityDisplayName &&
                          activity.entityDisplayName !== activity.title && (
                            <div className="text-xs text-theme-tertiary mt-1">
                              {activity.entityDisplayName}
                            </div>
                          )}
                      </div>

                      {/* Link para ver detalhes */}
                      {getEntityLink(activity) && (
                        <Link
                          href={getEntityLink(activity)!}
                          className="w-6 h-6 rounded bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                        >
                          <FiEye className="w-3 h-3 text-theme-tertiary" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          ))
        )}
      </div>

      {/* Link para ver histórico completo */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-theme-secondary">
          <Link
            href={`/${userType}/history`}
            className="block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
          >
            Ver histórico completo de atividades
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
};

export default RecentActivities;
