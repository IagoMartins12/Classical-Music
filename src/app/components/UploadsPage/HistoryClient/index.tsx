// app/components/HistoryClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiClock,
  FiUser,
  FiMusic,
  FiFile,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiCalendar,
  FiActivity,
  FiX,
  FiInfo,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Select from '@/app/components/Common/Select';

interface HistoryClientProps {
  page: number;
  type: string;
  action: string;
  userId: string;
  isAdmin: boolean;
}

const HistoryClient = ({
  page,
  type,
  action,
  userId,
  isAdmin,
}: HistoryClientProps) => {
  const router = useRouter();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(type);
  const [selectedAction, setSelectedAction] = useState(action);

  const typeOptions = [
    { value: 'all', label: 'Todos os tipos' },
    { value: 'composer', label: 'Compositores' },
    { value: 'work', label: 'Obras' },
    { value: 'score', label: 'Partituras' },
  ];

  const actionOptions = [
    { value: 'all', label: 'Todas as ações' },
    { value: 'create', label: 'Criação' },
    { value: 'update', label: 'Atualização' },
    { value: 'delete', label: 'Exclusão' },
  ];

  useEffect(() => {
    fetchHistory();
  }, [page, type, action, userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        type,
        action,
        userId,
      });

      const response = await fetch(`/api/uploads/history?${params}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = () => {
    const params = new URLSearchParams();
    if (selectedType !== 'all') params.set('type', selectedType);
    if (selectedAction !== 'all') params.set('action', selectedAction);
    if (page !== 1) params.set('page', '1');

    router.push(`/uploads/history?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedAction('all');
    router.push('/uploads/history');
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case 'composer':
        return <FiUser className="w-5 h-5" />;
      case 'work':
        return <FiMusic className="w-5 h-5" />;
      case 'score':
        return <FiFile className="w-5 h-5" />;
      default:
        return <FiActivity className="w-5 h-5" />;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create':
        return <FiPlus className="w-4 h-4 text-accent-green" />;
      case 'update':
        return <FiEdit className="w-4 h-4 text-accent-blue" />;
      case 'delete':
        return <FiTrash2 className="w-4 h-4 text-accent-red" />;
      default:
        return <FiActivity className="w-4 h-4 text-theme-tertiary" />;
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
        return 'bg-accent-green/10 text-accent-green';
      case 'update':
        return 'bg-accent-blue/10 text-accent-blue';
      case 'delete':
        return 'bg-accent-red/10 text-accent-red';
      default:
        return 'bg-theme-secondary text-theme-tertiary';
    }
  };

  const formatChanges = (changes: any) => {
    if (!changes || typeof changes !== 'object') return null;

    const changesList = Object.entries(changes)
      .filter(([key, value]) => value !== undefined && value !== null)
      .slice(0, 3); // Mostrar apenas os 3 primeiros

    if (changesList.length === 0) return null;

    return (
      <div className="mt-2 space-y-1">
        {changesList.map(([key, value]) => (
          <div key={key} className="text-xs text-theme-tertiary">
            <span className="font-medium">{key}:</span>{' '}
            {String(value).substring(0, 50)}
            {String(value).length > 50 && '...'}
          </div>
        ))}
        {Object.keys(changes).length > 3 && (
          <div className="text-xs text-theme-tertiary">
            +{Object.keys(changes).length - 3} alterações
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiClock className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Histórico de Uploads
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Acompanhe todas as alterações nos seus uploads
            </p>
          </div>
        </AnimatedItem>

        {/* Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-6 mb-8">
            <div className="space-y-4">
              {/* Filter Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">
                    Filtros
                  </h3>
                  <p className="text-sm text-theme-tertiary">
                    {totalCount} registros encontrados
                  </p>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-4 py-2 bg-theme-secondary hover:bg-theme-tertiary text-theme-primary rounded-lg transition-colors"
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filtros</span>
                </button>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <AnimatedItem direction="scale" springType="gentle">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme-secondary">
                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Tipo de Item
                      </label>
                      <Select
                        options={typeOptions}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Ação
                      </label>
                      <Select
                        options={actionOptions}
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4">
                    <button
                      onClick={updateFilters}
                      className="btn-classical-primary"
                    >
                      Aplicar Filtros
                    </button>
                    <button
                      onClick={clearFilters}
                      className="btn-classical-secondary"
                    >
                      Limpar
                    </button>
                  </div>
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* History Timeline */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-6">
            {history.length === 0 ? (
              <div className="classical-card p-12 text-center">
                <FiClock className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Nenhum registro encontrado
                </h3>
                <p className="text-theme-secondary">
                  Não há registros no histórico com os filtros aplicados.
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-theme-secondary"></div>

                {history.map((record, index) => (
                  <AnimatedItem
                    key={record.id}
                    direction="left"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <div className="relative flex items-start space-x-4 pb-6">
                      {/* Timeline Dot */}
                      <div className="relative z-10 w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center shadow-theme-glow">
                        {getEntityIcon(record.entityType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <AnimatedCard className="classical-card-2 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(record.action)}
                              <span className="text-sm font-medium text-theme-primary">
                                {getActionLabel(record.action)}{' '}
                                {getEntityLabel(record.entityType)}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                                  record.action
                                )}`}
                              >
                                {record.action.charAt(0).toUpperCase() +
                                  record.action.slice(1)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2 text-xs text-theme-tertiary">
                              <FiCalendar className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(
                                  new Date(record.createdAt),
                                  {
                                    addSuffix: true,
                                    locale: ptBR,
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm text-theme-secondary">
                              <span className="font-medium">ID:</span>{' '}
                              {record.entityId}
                            </div>

                            {isAdmin && record.user && (
                              <div className="text-sm text-theme-secondary">
                                <span className="font-medium">Usuário:</span>{' '}
                                {record.user.firstName || record.user.email}
                              </div>
                            )}

                            {record.reason && (
                              <div className="text-sm text-theme-secondary">
                                <span className="font-medium">Motivo:</span>{' '}
                                {record.reason}
                              </div>
                            )}

                            {record.ipAddress && isAdmin && (
                              <div className="text-sm text-theme-tertiary">
                                <span className="font-medium">IP:</span>{' '}
                                {record.ipAddress}
                              </div>
                            )}
                          </div>

                          {/* Changes Details */}
                          {formatChanges(record.changes)}
                        </AnimatedCard>
                      </div>
                    </div>
                  </AnimatedItem>
                ))}
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Pagination */}
        {totalPages > 1 && (
          <AnimatedItem direction="up" className="mt-8">
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const params = new URLSearchParams();
                      params.set('page', (i + 1).toString());
                      if (type !== 'all') params.set('type', type);
                      if (action !== 'all') params.set('action', action);
                      router.push(`/uploads/history?${params.toString()}`);
                    }}
                    className={`px-4 py-2 rounded-lg ${
                      page === i + 1
                        ? 'bg-brand-primary text-theme-primary'
                        : 'bg-theme-secondary text-theme-tertiary hover:bg-theme-tertiary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
};

export default HistoryClient;
