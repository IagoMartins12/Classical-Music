// app/components/Dashboard/RecentHistoryWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiClock,
  FiUser,
  FiMusic,
  FiFile,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiActivity,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AnimatedCard,
  AnimatedItem,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';

interface RecentHistoryItem {
  id: string;
  entityType: string;
  action: string;
  createdAt: string;
  reason?: string;
}

interface RecentHistoryWidgetProps {
  userId?: string;
  limit?: number;
  showTitle?: boolean;
  className?: string;
}

const RecentHistoryWidget = ({
  userId,
  limit = 5,
  showTitle = true,
  className = '',
}: RecentHistoryWidgetProps) => {
  const [history, setHistory] = useState<RecentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentHistory();
  }, [userId, limit]);

  const fetchRecentHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(userId && { userId }),
      });

      const response = await fetch(`/api/uploads/history/recent?${params}`);

      if (!response.ok) {
        throw new Error('Erro ao carregar histórico');
      }

      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error('Erro ao carregar histórico recente:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'composer':
        return <FiUser className="w-4 h-4" />;
      case 'work':
        return <FiMusic className="w-4 h-4" />;
      case 'score':
        return <FiFile className="w-4 h-4" />;
      default:
        return <FiActivity className="w-4 h-4" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FiPlus className="w-3 h-3 text-accent-green" />;
      case 'update':
        return <FiEdit className="w-3 h-3 text-accent-blue" />;
      case 'delete':
        return <FiTrash2 className="w-3 h-3 text-accent-red" />;
      default:
        return <FiActivity className="w-3 h-3 text-theme-tertiary" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create':
        return 'Criou';
      case 'update':
        return 'Atualizou';
      case 'delete':
        return 'Excluiu';
      default:
        return 'Modificou';
    }
  };

  const getEntityLabel = (entityType: string) => {
    switch (entityType) {
      case 'composer':
        return 'compositor';
      case 'work':
        return 'obra';
      case 'score':
        return 'partitura';
      default:
        return 'item';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'text-accent-green';
      case 'update':
        return 'text-accent-blue';
      case 'delete':
        return 'text-accent-red';
      default:
        return 'text-theme-tertiary';
    }
  };

  if (loading) {
    return (
      <AnimatedCard className={`classical-card p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <FiClock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold text-theme-primary">
              Atividade Recente
            </h3>
          </div>
        )}
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      </AnimatedCard>
    );
  }

  if (error) {
    return (
      <AnimatedCard className={`classical-card p-6 ${className}`}>
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            <FiClock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold text-theme-primary">
              Atividade Recente
            </h3>
          </div>
        )}
        <div className="text-center py-6">
          <p className="text-theme-secondary text-sm mb-4">{error}</p>
          <button
            onClick={fetchRecentHistory}
            className="btn-classical-secondary text-sm"
          >
            <FiRefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className={`classical-card p-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FiClock className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-semibold text-theme-primary">
              Atividade Recente
            </h3>
          </div>
          <Link
            href="/uploads/history"
            className="text-sm text-brand-primary hover:text-brand-secondary transition-colors flex items-center space-x-1"
          >
            <span>Ver Tudo</span>
            <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-6">
          <FiActivity className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
          <p className="text-theme-secondary text-sm">
            Nenhuma atividade recente
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <AnimatedItem
              key={item.id}
              direction="left"
              style={{
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'backwards',
              }}
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-theme-secondary/30 hover:bg-theme-secondary/50 transition-colors">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    {getEntityIcon(item.entityType)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getActionIcon(item.action)}
                    <span
                      className={`text-sm font-medium ${getActionColor(
                        item.action
                      )}`}
                    >
                      {getActionLabel(item.action)}{' '}
                      {getEntityLabel(item.entityType)}
                    </span>
                  </div>

                  {item.reason && (
                    <p className="text-xs text-theme-secondary mb-1 line-clamp-1">
                      {item.reason}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-theme-tertiary">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>

                    <span className="text-xs text-theme-tertiary">
                      ID: {item.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedItem>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-theme-secondary">
          <Link
            href="/uploads/history"
            className="w-full btn-classical-secondary text-sm justify-center"
          >
            Ver Histórico Completo
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
};

export default RecentHistoryWidget;
