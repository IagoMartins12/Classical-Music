// app/components/UploadsPage/HistoryClient.tsx - MELHORADO PARA BULK IMPORT
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
  FiChevronDown,
  FiChevronUp,
  FiEye,
  FiMapPin,
  FiMonitor,
  FiDatabase,
  FiCheck,
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
import { formatChangesForDisplay } from '@/app/utils/historyUtils';

interface HistoryRecord {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

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

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(type);
  const [selectedAction, setSelectedAction] = useState(action);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
    // fetchStats();
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

  // const fetchStats = async () => {
  //   try {
  //     const response = await fetch(
  //       `/api/uploads/history/stats?userId=${userId}`
  //     );
  //     if (response.ok) {
  //       const data = await response.json();
  //       setStats(data);
  //     }
  //   } catch (error) {
  //     console.error('Erro ao carregar estatísticas:', error);
  //   }
  // };

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

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
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

  const getActionIcon = (action: string, changes?: any) => {
    // 🆕 Ícone especial para bulk import
    if (changes?.bulkImport) {
      return <FiDatabase className="w-4 h-4 text-purple-600" />;
    }

    switch (action) {
      case 'create':
        return <FiPlus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <FiEdit className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <FiTrash2 className="w-4 h-4 text-red-600" />;
      default:
        return <FiActivity className="w-4 h-4 text-theme-tertiary" />;
    }
  };

  const getActionLabel = (action: string, changes?: any) => {
    // 🆕 Label especial para bulk import
    if (changes?.bulkImport) {
      return 'Importou em lote';
    }

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

  const getEntityLabel = (entityType: string, changes?: any) => {
    // 🆕 Label especial para bulk import
    if (changes?.bulkImport) {
      const count = changes.bulkImport.successfulWorks;
      return `${count} obra${count !== 1 ? 's' : ''}`;
    }

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

  const getActionColor = (action: string, changes?: any) => {
    // 🆕 Cor especial para bulk import
    if (changes?.bulkImport) {
      return 'bg-purple-50 text-purple-700 border-purple-200';
    }

    switch (action) {
      case 'create':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'update':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delete':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-theme-secondary text-theme-tertiary border-theme-tertiary/30';
    }
  };

  const getTimelineDotColor = (action: string, changes?: any) => {
    // 🆕 Cor especial para bulk import
    if (changes?.bulkImport) {
      return 'from-purple-400 to-purple-600';
    }

    switch (action) {
      case 'create':
        return 'from-green-400 to-green-600';
      case 'update':
        return 'from-blue-400 to-blue-600';
      case 'delete':
        return 'from-red-400 to-red-600';
      default:
        return 'from-accent-blue to-accent-purple';
    }
  };

  const getCardBorderColor = (action: string, changes?: any) => {
    // 🆕 Cor especial para bulk import
    if (changes?.bulkImport) {
      return 'border-l-4 border-l-purple-500';
    }

    switch (action) {
      case 'create':
        return 'border-l-4 border-l-green-500';
      case 'update':
        return 'border-l-4 border-l-blue-500';
      case 'delete':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-gray-300';
    }
  };

  const formatChanges = (changes: any, action: string) => {
    if (!changes || typeof changes !== 'object') return null;

    // 🆕 FORMATAÇÃO ESPECIAL PARA BULK IMPORT
    if (changes.bulkImport) {
      const bulk = changes.bulkImport;
      return (
        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <h5 className="text-sm font-medium text-purple-700 mb-3 flex items-center">
            <FiDatabase className="w-4 h-4 mr-1" />
            Importação em Lote do IMSLP
          </h5>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-green-600">
                {bulk.successfulWorks}
              </div>
              <div className="text-xs text-green-700">Sucesso</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-red-600">
                {bulk.failedWorks}
              </div>
              <div className="text-xs text-red-700">Erros</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-yellow-600">
                {bulk.duplicateWorks}
              </div>
              <div className="text-xs text-yellow-700">Duplicatas</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-purple-600">
                {bulk.totalWorks}
              </div>
              <div className="text-xs text-purple-700">Total</div>
            </div>
          </div>

          {/* Compositor */}
          <div className="text-sm text-purple-700 mb-2">
            <span className="font-medium">Compositor:</span> {bulk.composerName}
          </div>

          {/* Lista de obras criadas (primeiras 5) */}
          {bulk.worksCreated && bulk.worksCreated.length > 0 && (
            <div>
              <div className="text-xs font-medium text-purple-700 mb-1">
                Obras importadas com sucesso:
              </div>
              <div className="space-y-1">
                {bulk.worksCreated
                  .slice(0, 5)
                  .map((work: any, index: number) => (
                    <div
                      key={index}
                      className="text-xs text-purple-600 flex items-center"
                    >
                      <FiCheck className="w-3 h-3 mr-1 text-green-500" />
                      {work.title}
                    </div>
                  ))}
                {bulk.worksCreated.length > 5 && (
                  <div className="text-xs text-purple-600">
                    +{bulk.worksCreated.length - 5} obras adicionais
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (action === 'create' && changes.created) {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="text-sm font-medium text-green-700 mb-2 flex items-center">
            <FiPlus className="w-4 h-4 mr-1" />
            Item criado com:
          </h5>
          <div className="space-y-1">
            {Object.entries(changes.created)
              .slice(0, 5)
              .map(([key, value]) => (
                <div key={key} className="text-xs text-green-600">
                  <span className="font-medium">{formatFieldName(key)}:</span>{' '}
                  {formatValue(value)}
                </div>
              ))}
          </div>
        </div>
      );
    }

    if (action === 'delete' && changes.deleted) {
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="text-sm font-medium text-red-700 mb-2 flex items-center">
            <FiTrash2 className="w-4 h-4 mr-1" />
            Item excluído:
          </h5>
          <div className="space-y-1">
            {Object.entries(changes.deleted)
              .slice(0, 5)
              .map(([key, value]) => (
                <div key={key} className="text-xs text-red-600">
                  <span className="font-medium">{formatFieldName(key)}:</span>{' '}
                  {formatValue(value)}
                </div>
              ))}
          </div>
        </div>
      );
    }

    if (action === 'update') {
      const changesList = Object.entries(changes).filter(
        ([, change]) =>
          typeof change === 'object' &&
          change !== null &&
          'from' in change &&
          'to' in change
      );

      if (changesList.length === 0) return null;

      return (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
            <FiEdit className="w-4 h-4 mr-1" />
            Alterações:
          </h5>
          <div className="space-y-2">
            {changesList.slice(0, 5).map(([key, change]: [string, any]) => (
              <div key={key} className="text-xs">
                <div className="font-medium text-blue-700 mb-1">
                  {formatFieldName(key)}:
                </div>
                <div className="pl-2 border-l-2 border-blue-300">
                  <div className="text-red-600 flex items-center">
                    <span className="w-8 text-xs">De:</span>
                    <span>{formatValue(change.from)}</span>
                  </div>
                  <div className="text-green-600 flex items-center">
                    <span className="w-8 text-xs">Para:</span>
                    <span>{formatValue(change.to)}</span>
                  </div>
                </div>
              </div>
            ))}
            {changesList.length > 5 && (
              <div className="text-xs text-blue-600">
                +{changesList.length - 5} alterações adicionais
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const formatFieldName = (field: string): string => {
    const fieldMap: Record<string, string> = {
      title: 'Título',
      name: 'Nome',
      fullName: 'Nome Completo',
      bio: 'Biografia',
      portraitUrl: 'Foto',
      birthDate: 'Data de Nascimento',
      deathDate: 'Data de Morte',
      nationality: 'Nacionalidade',
      epochName: 'Época',
      instrumentName: 'Instrumento',
      composerName: 'Compositor',
      opOrCatalog: 'Op./Catálogo',
      compositionYear: 'Ano de Composição',
      tone: 'Tonalidade',
      workStyle: 'Estilo',
      categoryNames: 'Categorias',
      workGenresArr: 'Gêneros',
      fileSize: 'Tamanho do Arquivo',
      pageCount: 'Número de Páginas',
      downloadUrl: 'URL de Download',
      fileFormat: 'Formato',
      type: 'Tipo',
      notes: 'Notas',
      editor: 'Editor',
      publisher: 'Editora',
      copyright: 'Copyright',
    };

    return fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'vazio';
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : 'vazio';
    }

    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 47) + '...';
    }

    return String(value);
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
                  {showFilters ? (
                    <FiChevronUp className="w-4 h-4" />
                  ) : (
                    <FiChevronDown className="w-4 h-4" />
                  )}
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
                      {/* Timeline Dot with Action-specific Colors */}
                      <div
                        className={`relative z-10 w-12 h-12 bg-gradient-to-br ${getTimelineDotColor(
                          record.action,
                          record.changes
                        )} rounded-full flex items-center justify-center shadow-lg`}
                      >
                        {getEntityIcon(record.entityType)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <AnimatedCard
                          className={`classical-card-2 p-4 ${getCardBorderColor(
                            record.action,
                            record.changes
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {getActionIcon(record.action, record.changes)}
                              <span className="text-sm font-medium text-theme-primary">
                                {getActionLabel(record.action, record.changes)}{' '}
                                {getEntityLabel(
                                  record.entityType,
                                  record.changes
                                )}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(
                                  record.action,
                                  record.changes
                                )}`}
                              >
                                {record.changes?.bulkImport
                                  ? 'Bulk Import'
                                  : record.action.charAt(0).toUpperCase() +
                                    record.action.slice(1)}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
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

                              {record.changes && (
                                <button
                                  onClick={() => toggleExpanded(record.id)}
                                  className="w-6 h-6 rounded-full bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
                                >
                                  {expandedItems.has(record.id) ? (
                                    <FiChevronUp className="w-3 h-3" />
                                  ) : (
                                    <FiEye className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {/* ID apenas para não bulk imports */}
                            {!record.changes?.bulkImport && (
                              <div className="text-sm text-theme-secondary">
                                <span className="font-medium">ID:</span>{' '}
                                {record.entityId}
                              </div>
                            )}

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

                            {/* Basic changes summary */}
                            {record.changes &&
                              !expandedItems.has(record.id) && (
                                <div className="text-xs text-theme-tertiary">
                                  {formatChangesForDisplay(record.changes)}
                                </div>
                              )}

                            {/* Technical details for admins */}
                            {isAdmin && expandedItems.has(record.id) && (
                              <div className="mt-3 pt-3 border-t border-theme-secondary">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-theme-tertiary">
                                  {record.ipAddress && (
                                    <div className="flex items-center space-x-2">
                                      <FiMapPin className="w-3 h-3" />
                                      <span>IP: {record.ipAddress}</span>
                                    </div>
                                  )}

                                  {record.userAgent && (
                                    <div className="flex items-center space-x-2">
                                      <FiMonitor className="w-3 h-3" />
                                      <span title={record.userAgent}>
                                        {record.userAgent.length > 30
                                          ? record.userAgent.substring(0, 30) +
                                            '...'
                                          : record.userAgent}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Detailed Changes */}
                          {expandedItems.has(record.id) &&
                            formatChanges(record.changes, record.action)}
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
                    className={`px-4 py-2 rounded-lg transition-colors ${
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
