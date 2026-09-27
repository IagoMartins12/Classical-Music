// app/components/UploadsPage/HistoryClient.tsx - MELHORADO PARA BULK IMPORT
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiCalendarBlank,
  PiCaretDown,
  PiCaretUp,
  PiCheck,
  PiClock,
  PiDatabase,
  PiEye,
  PiFile,
  PiFunnel,
  PiMapPin,
  PiMonitor,
  PiMusicNotes,
  PiNotePencil,
  PiPlus,
  PiPulse,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
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
import { formatChangesForDisplay } from '@/app/utils/historyFormat';
import { getUploadHistory } from '@/app/requests/uploads-client';
import { useTranslation } from '@/app/context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';

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
  const { t } = useTranslation({ sections: ['pages/uploads'] });

  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedType, setSelectedType] = useState(type);
  const [selectedAction, setSelectedAction] = useState(action);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const typeOptions = [
    { value: 'all', label: t('history_type_all') },
    { value: 'composer', label: t('history_type_composer') },
    { value: 'work', label: t('history_type_work') },
    { value: 'score', label: t('history_type_score') },
  ];

  const actionOptions = [
    { value: 'all', label: t('history_action_all') },
    { value: 'create', label: t('history_action_create') },
    { value: 'update', label: t('history_action_update') },
    { value: 'delete', label: t('history_action_delete') },
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

      const response = await getUploadHistory<HistoryRecord>(params);
      if (response.ok) {
        const data = response.data;
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

    router.push(`/upload/history?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedType('all');
    setSelectedAction('all');
    router.push('/upload/history');
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
        return <PiUser className="w-5 h-5" />;
      case 'work':
        return <PiMusicNotes className="w-5 h-5" />;
      case 'score':
        return <PiFile className="w-5 h-5" />;
      default:
        return <PiPulse className="w-5 h-5" />;
    }
  };

  const getActionIcon = (action: string, changes?: any) => {
    // Ícone especial para bulk import
    if (changes?.bulkImport) {
      return <PiDatabase className="w-4 h-4 text-purple-600" />;
    }

    switch (action) {
      case 'create':
        return <PiPlus className="w-4 h-4 text-green-600" />;
      case 'update':
        return <PiNotePencil className="w-4 h-4 text-blue-600" />;
      case 'delete':
        return <PiTrash className="w-4 h-4 text-red-600" />;
      default:
        return <PiPulse className="w-4 h-4 text-theme-tertiary" />;
    }
  };

  const getActionLabel = (action: string, changes?: any) => {
    // Label especial para bulk import
    if (changes?.bulkImport) {
      return t('history_action_bulk_import');
    }

    switch (action) {
      case 'create':
        return t('history_action_created');
      case 'update':
        return t('history_action_updated');
      case 'delete':
        return t('history_action_deleted');
      default:
        return t('history_action_modified');
    }
  };

  const getEntityLabel = (entityType: string, changes?: any) => {
    // Label especial para bulk import
    if (changes?.bulkImport) {
      const count = changes.bulkImport.successfulWorks;
      return count === 1
        ? t('history_entity_works_singular').replace(
            '{count}',
            count.toString()
          )
        : t('history_entity_works_plural').replace('{count}', count.toString());
    }

    return t(`history_entity_${entityType}`) || entityType;
  };

  const getActionColor = (action: string, changes?: any) => {
    // Cor especial para bulk import
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
        return 'bg-theme-secondary text-theme-tertiary';
    }
  };

  const getTimelineDotColor = (action: string, changes?: any) => {
    // Cor especial para bulk import
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
        return '';
    }
  };

  const getCardBorderColor = (action: string, changes?: any) => {
    // Cor especial para bulk import
    if (changes?.bulkImport) {
      return '';
    }

    switch (action) {
      case 'create':
        return '';
      case 'update':
        return '';
      case 'delete':
        return '';
      default:
        return '';
    }
  };

  const formatChanges = (changes: any, action: string) => {
    if (!changes || typeof changes !== 'object') return null;

    // FORMATAÇÃO ESPECIAL PARA BULK IMPORT
    if (changes.bulkImport) {
      const bulk = changes.bulkImport;
      return (
        <div className="mt-3 p-3 bg-purple-50 rounded-lg">
          <h5 className="text-sm font-medium text-purple-700 mb-3 flex items-center">
            <PiDatabase className="w-4 h-4 mr-1" />
            {t('history_bulk_import_title')}
          </h5>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-green-600">
                {bulk.successfulWorks}
              </div>
              <div className="text-xs text-green-700">
                {t('history_bulk_stats_success')}
              </div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-red-600">
                {bulk.failedWorks}
              </div>
              <div className="text-xs text-red-700">
                {t('history_bulk_stats_errors')}
              </div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-yellow-600">
                {bulk.duplicateWorks}
              </div>
              <div className="text-xs text-yellow-700">
                {t('history_bulk_stats_duplicates')}
              </div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-purple-600">
                {bulk.totalWorks}
              </div>
              <div className="text-xs text-purple-700">
                {t('history_bulk_stats_total')}
              </div>
            </div>
          </div>

          {/* Compositor */}
          <div className="text-sm text-purple-700 mb-2">
            <span className="font-medium">
              {t('history_bulk_composer_label')}
            </span>{' '}
            {bulk.composerName}
          </div>

          {/* Lista de obras criadas (primeiras 5) */}
          {bulk.worksCreated && bulk.worksCreated.length > 0 && (
            <Stack gap={1}>
              <div className="text-xs font-medium text-purple-700">
                {t('history_bulk_works_created')}
              </div>
              <Stack gap={1}>
                {bulk.worksCreated
                  .slice(0, 5)
                  .map((work: any, index: number) => (
                    <div
                      key={index}
                      className="text-xs text-purple-600 flex items-center"
                    >
                      <PiCheck className="w-3 h-3 mr-1 text-green-500" />
                      {work.title}
                    </div>
                  ))}
                {bulk.worksCreated.length > 5 && (
                  <div className="text-xs text-purple-600">
                    {t('history_bulk_additional_works').replace(
                      '{count}',
                      (bulk.worksCreated.length - 5).toString()
                    )}
                  </div>
                )}
              </Stack>
            </Stack>
          )}
        </div>
      );
    }

    if (action === 'create' && changes.created) {
      return (
        <Stack gap={2} className="mt-3 p-3 bg-green-50 rounded-lg">
          <h5 className="text-sm font-medium text-green-700 flex items-center">
            <PiPlus className="w-4 h-4 mr-1" />
            {t('history_changes_created_title')}
          </h5>
          <Stack gap={1}>
            {Object.entries(changes.created)
              .slice(0, 5)
              .map(([key, value]) => (
                <div key={key} className="text-xs text-green-600">
                  <span className="font-medium">{formatFieldName(key)}:</span>{' '}
                  {formatValue(value)}
                </div>
              ))}
          </Stack>
        </Stack>
      );
    }

    if (action === 'delete' && changes.deleted) {
      return (
        <Stack gap={2} className="mt-3 p-3 bg-red-50 rounded-lg">
          <h5 className="text-sm font-medium text-red-700 flex items-center">
            <PiTrash className="w-4 h-4 mr-1" />
            {t('history_changes_deleted_title')}
          </h5>
          <Stack gap={1}>
            {Object.entries(changes.deleted)
              .slice(0, 5)
              .map(([key, value]) => (
                <div key={key} className="text-xs text-red-600">
                  <span className="font-medium">{formatFieldName(key)}:</span>{' '}
                  {formatValue(value)}
                </div>
              ))}
          </Stack>
        </Stack>
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
        <Stack gap={2} className="mt-3 p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-700 flex items-center">
            <PiNotePencil className="w-4 h-4 mr-1" />
            {t('history_changes_updated_title')}
          </h5>
          <Stack gap={2}>
            {changesList.slice(0, 5).map(([key, change]: [string, any]) => (
              <Stack gap={1} key={key} className="text-xs">
                <div className="font-medium text-blue-700">
                  {formatFieldName(key)}:
                </div>
                <div className="pl-2 border-l-2 border-blue-300">
                  <div className="text-red-600 flex items-center">
                    <span className="w-8 text-xs">
                      {t('history_changes_from')}
                    </span>
                    <span>{formatValue(change.from)}</span>
                  </div>
                  <div className="text-green-600 flex items-center">
                    <span className="w-8 text-xs">
                      {t('history_changes_to')}
                    </span>
                    <span>{formatValue(change.to)}</span>
                  </div>
                </div>
              </Stack>
            ))}
            {changesList.length > 5 && (
              <div className="text-xs text-blue-600">
                {t('history_changes_additional').replace(
                  '{count}',
                  (changesList.length - 5).toString()
                )}
              </div>
            )}
          </Stack>
        </Stack>
      );
    }

    return null;
  };

  const formatFieldName = (field: string): string => {
    // Primeiro tenta buscar na tradução, se não encontrar usa o mapa padrão
    const translationKey = `history_field_${field}`;
    const translated = t(translationKey);

    if (translated !== translationKey) {
      return translated;
    }

    return field.charAt(0).toUpperCase() + field.slice(1);
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return t('history_field_empty');
    }

    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : t('history_field_empty');
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
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiClock className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              {t('history_page_title')}
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              {t('history_page_subtitle')}
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
                    {t('history_filters_title')}
                  </h3>
                  <Text papel="rotulo" tom="fraco" as="p">
                    {t('history_records_found').replace(
                      '{count}',
                      totalCount.toString()
                    )}
                  </Text>
                </div>
                <Inline
                  as="button"
                  gap={2}
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg transition-colors"
                >
                  <PiFunnel className="w-4 h-4" />
                  <span>{t('history_filters_button')}</span>
                  {showFilters ? (
                    <PiCaretUp className="w-4 h-4" />
                  ) : (
                    <PiCaretDown className="w-4 h-4" />
                  )}
                </Inline>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <AnimatedItem direction="scale" springType="gentle">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-theme-secondary">
                    <div>
                      <Select
                        label={t('history_filter_type_label')}
                        options={typeOptions}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>

                    <div>
                      <Select
                        label={t('history_filter_action_label')}
                        options={actionOptions}
                        value={selectedAction}
                        onChange={(e) => setSelectedAction(e.target.value)}
                        className="input-classical-2 w-full"
                      />
                    </div>
                  </div>

                  <Inline gap={3} className="pt-4">
                    <Button
                      variante="primario"
                      type="submit"
                      onClick={updateFilters}
                    >
                      {t('history_apply_filters')}
                    </Button>
                    <Button
                      variante="secundario"
                      type="submit"
                      onClick={clearFilters}
                    >
                      {t('history_clear_filters')}
                    </Button>
                  </Inline>
                </AnimatedItem>
              )}
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* History Timeline */}
        <AnimatedItem direction="up" springType="gentle">
          <Stack gap={6}>
            {history.length === 0 ? (
              <div className="classical-card p-12 text-center">
                <PiClock className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  {t('history_no_records_title')}
                </h3>
                <p className="text-theme-secondary">
                  {t('history_no_records_subtitle')}
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
                        className={`relative hidden md:flex  z-10 w-12 h-12 bg-gradient-to-br ${getTimelineDotColor(
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
                            <Inline gap={2}>
                              {getActionIcon(record.action, record.changes)}
                              <Text
                                papel="rotulo"
                                tom="forte"
                                className="font-medium"
                              >
                                {getActionLabel(record.action, record.changes)}{' '}
                                {getEntityLabel(
                                  record.entityType,
                                  record.changes
                                )}
                              </Text>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium bg-sup-2 ${getActionColor(
                                  record.action,
                                  record.changes
                                )}`}
                              >
                                {record.changes?.bulkImport
                                  ? 'Bulk Import'
                                  : record.action.charAt(0).toUpperCase() +
                                    record.action.slice(1)}
                              </span>
                            </Inline>

                            <Inline gap={2}>
                              <Inline
                                gap={2}
                                className="text-xs text-theme-tertiary"
                              >
                                <PiCalendarBlank className="w-3 h-3" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(record.createdAt),
                                    {
                                      addSuffix: true,
                                      locale: ptBR,
                                    }
                                  )}
                                </span>
                              </Inline>

                              {record.changes && (
                                <button
                                  onClick={() => toggleExpanded(record.id)}
                                  className="w-6 h-6 rounded-full bg-theme-secondary text-theme-tertiary transition-colors flex items-center justify-center"
                                >
                                  {expandedItems.has(record.id) ? (
                                    <PiCaretUp className="w-3 h-3" />
                                  ) : (
                                    <PiEye className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </Inline>
                          </div>

                          <div className="space-y-2">
                            {/* ID apenas para não bulk imports */}
                            {!record.changes?.bulkImport && (
                              <Text papel="rotulo" tom="suave" as="div">
                                <span className="font-medium">ID:</span>{' '}
                                {record.entityId}
                              </Text>
                            )}

                            {isAdmin && record.user && (
                              <Text papel="rotulo" tom="suave" as="div">
                                <span className="font-medium">
                                  {t('history_user_label')}
                                </span>{' '}
                                {record.user.firstName || record.user.email}
                              </Text>
                            )}

                            {record.reason && (
                              <Text papel="rotulo" tom="suave" as="div">
                                <span className="font-medium">
                                  {t('history_reason_label')}
                                </span>{' '}
                                {record.reason}
                              </Text>
                            )}

                            {/* Basic changes summary */}
                            {record.changes &&
                              !expandedItems.has(record.id) && (
                                <Text
                                  papel="legenda"
                                  tom="fraco"
                                  as="div"
                                  className="break-words"
                                >
                                  {formatChangesForDisplay(record.changes)}
                                </Text>
                              )}

                            {/* Technical details for admins */}
                            {isAdmin && expandedItems.has(record.id) && (
                              <div className="mt-3 pt-3 border-t border-theme-secondary">
                                <Text
                                  papel="legenda"
                                  tom="fraco"
                                  as="div"
                                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                  {record.ipAddress && (
                                    <Inline gap={2}>
                                      <PiMapPin className="w-3 h-3" />
                                      <span>
                                        {t('history_ip_label')}{' '}
                                        {record.ipAddress}
                                      </span>
                                    </Inline>
                                  )}

                                  {record.userAgent && (
                                    <Inline gap={2}>
                                      <PiMonitor className="w-3 h-3" />
                                      <span title={record.userAgent}>
                                        {record.userAgent.length > 30
                                          ? record.userAgent.substring(0, 30) +
                                            '...'
                                          : record.userAgent}
                                      </span>
                                    </Inline>
                                  )}
                                </Text>
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
          </Stack>
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
                      router.push(`/upload/history?${params.toString()}`);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      page === i + 1
                        ? 'text-theme-primary'
                        : 'bg-theme-secondary text-theme-tertiary'
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
