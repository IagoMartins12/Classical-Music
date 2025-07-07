// app/components/ModerationClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiFlag,
  FiCheck,
  FiX,
  FiTrash2,
  FiUser,
  FiMusic,
  FiFile,
  FiCalendar,
  FiShield,
  FiAlertTriangle,
  FiExternalLink,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications } from '@/app/hooks/useNotifications';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  LoadingSpinner,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import NotificationSystem from '@/app/components/Notifications/NotificationSystem';

interface ModerationClientProps {
  page: number;
  status: string;
}

const ModerationClient = ({ page, status }: ModerationClientProps) => {
  const router = useRouter();
  const { notifications, removeNotification, notifySuccess, notifyError } =
    useNotifications();

  const [moderations, setModerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  // const [totalCount, setTotalCount] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedModeration, setSelectedModeration] = useState<any>(null);
  const [moderationNotes, setModerationNotes] = useState('');

  useEffect(() => {
    fetchModerations();
  }, [page, status]);

  const fetchModerations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/uploads/moderation?page=${page}&status=${status}`
      );
      if (response.ok) {
        const data = await response.json();
        setModerations(data.moderations);
        setTotalPages(data.pagination.totalPages);
        // setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error('Erro ao carregar moderações:', error);
      notifyError('Erro', 'Não foi possível carregar as moderações');
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (moderationId: string, action: string) => {
    setProcessingId(moderationId);
    try {
      const response = await fetch('/api/uploads/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moderationId,
          action,
          notes: moderationNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        notifySuccess('Sucesso', data.message);
        await fetchModerations();
        setShowModal(false);
        setModerationNotes('');
        setSelectedModeration(null);
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error) {
      console.error('Erro ao processar moderação:', error);
      notifyError(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao processar moderação'
      );
    } finally {
      setProcessingId(null);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'composer':
        return <FiUser className="w-5 h-5" />;
      case 'work':
        return <FiMusic className="w-5 h-5" />;
      case 'score':
        return <FiFile className="w-5 h-5" />;
      default:
        return <FiFlag className="w-5 h-5" />;
    }
  };

  const getEntityTitle = (moderation: any) => {
    if (!moderation.entityDetails) return 'Item não encontrado';

    switch (moderation.entityType) {
      case 'composer':
        return (
          moderation.entityDetails.fullName || moderation.entityDetails.name
        );
      case 'work':
        return moderation.entityDetails.title;
      case 'score':
        return moderation.entityDetails.title;
      default:
        return 'Item desconhecido';
    }
  };

  const getEntitySubtitle = (moderation: any) => {
    if (!moderation.entityDetails) return '';

    switch (moderation.entityType) {
      case 'composer':
        return 'Compositor';
      case 'work':
        return `Obra de ${
          moderation.entityDetails.composer?.name || 'compositor desconhecido'
        }`;
      case 'score':
        return `Partitura de ${
          moderation.entityDetails.work?.title || 'obra desconhecida'
        }`;
      default:
        return '';
    }
  };

  const getReason = (reason: string) => {
    const reasons: Record<string, string> = {
      inappropriate_content: 'Conteúdo inadequado',
      copyright_violation: 'Violação de direitos autorais',
      spam: 'Spam',
      fake_information: 'Informações falsas',
      other: 'Outros',
    };
    return reasons[reason] || reason;
  };

  const getUrgencyLevel = (createdAt: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (days > 7) return 'urgent';
    if (days > 3) return 'high';
    return 'normal';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent':
        return 'text-accent-red bg-accent-red/10';
      case 'high':
        return 'text-accent-amber bg-accent-amber/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const openModerationModal = (moderation: any) => {
    setSelectedModeration(moderation);
    setShowModal(true);
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
              <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiShield className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Moderação de Uploads
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Gerencie reports e mantenha a qualidade do conteúdo
            </p>
          </div>
        </AnimatedItem>

        {/* Status Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex justify-center mb-8">
            <div className="flex bg-theme-secondary rounded-xl p-1">
              {['pending', 'approved', 'rejected'].map((statusOption) => (
                <button
                  key={statusOption}
                  onClick={() =>
                    router.push(`/uploads/moderation?status=${statusOption}`)
                  }
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all capitalize ${
                    status === statusOption
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  {statusOption === 'pending' && 'Pendentes'}
                  {statusOption === 'approved' && 'Aprovadas'}
                  {statusOption === 'rejected' && 'Rejeitadas'}
                  {statusOption === 'pending' && (
                    <span className="ml-2 px-2 py-1 bg-accent-red text-white text-xs rounded-full">
                      {moderations.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </AnimatedItem>

        {/* Moderations List */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-4">
            {moderations.length === 0 ? (
              <div className="classical-card p-12 text-center">
                <FiShield className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Nenhuma moderação encontrada
                </h3>
                <p className="text-theme-secondary">
                  Não há moderações com status &quot;{status}&quot; no momento.
                </p>
              </div>
            ) : (
              moderations.map((moderation, index) => {
                const urgency = getUrgencyLevel(moderation.createdAt);
                return (
                  <AnimatedItem
                    key={moderation.id}
                    direction="left"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                      animationFillMode: 'backwards',
                    }}
                  >
                    <AnimatedCard className="classical-card p-6 hover:shadow-theme-glow transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-amber rounded-xl flex items-center justify-center">
                            {getEntityIcon(moderation.entityType)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(
                                  urgency
                                )}`}
                              >
                                {urgency === 'urgent' && 'Urgente'}
                                {urgency === 'high' && 'Alta'}
                                {urgency === 'normal' && 'Normal'}
                              </span>
                              <span className="text-xs text-theme-tertiary">
                                {moderation.entityType.charAt(0).toUpperCase() +
                                  moderation.entityType.slice(1)}
                              </span>
                            </div>

                            <h3 className="text-lg font-bold text-theme-primary mb-1">
                              {getEntityTitle(moderation)}
                            </h3>
                            <p className="text-sm text-theme-secondary mb-2">
                              {getEntitySubtitle(moderation)}
                            </p>

                            <div className="flex items-center space-x-4 text-sm text-theme-tertiary mb-2">
                              <span className="flex items-center space-x-1">
                                <FiFlag className="w-4 h-4" />
                                <span>{getReason(moderation.reason)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiCalendar className="w-4 h-4" />
                                <span>
                                  {formatDistanceToNow(
                                    new Date(moderation.createdAt),
                                    { addSuffix: true, locale: ptBR }
                                  )}
                                </span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <FiUser className="w-4 h-4" />
                                <span>
                                  {moderation.reporter.firstName ||
                                    moderation.reporter.email}
                                </span>
                              </span>
                            </div>

                            {moderation.description && (
                              <p className="text-sm text-theme-secondary italic">
                                &quot;{moderation.description}&quot;
                              </p>
                            )}

                            {moderation.moderationNotes && (
                              <div className="mt-2 p-2 bg-theme-secondary rounded-lg">
                                <p className="text-sm text-theme-primary">
                                  <strong>Notas da moderação:</strong>{' '}
                                  {moderation.moderationNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {moderation.status === 'pending' && (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<FiCheck />}
                                onClick={() =>
                                  handleModeration(moderation.id, 'approve')
                                }
                                disabled={processingId === moderation.id}
                              >
                                Aprovar
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                leftIcon={<FiX />}
                                onClick={() =>
                                  handleModeration(moderation.id, 'reject')
                                }
                                disabled={processingId === moderation.id}
                              >
                                Rejeitar
                              </Button>
                              <Button
                                variant="delete"
                                size="sm"
                                leftIcon={<FiTrash2 />}
                                onClick={() => openModerationModal(moderation)}
                                disabled={processingId === moderation.id}
                              >
                                Deletar
                              </Button>
                            </>
                          )}

                          {moderation.entityDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiExternalLink />}
                              onClick={() => {
                                const url = `/uploads/${moderation.entityType}/${moderation.entityId}`;
                                window.open(url, '_blank');
                              }}
                            >
                              Ver Item
                            </Button>
                          )}
                        </div>
                      </div>
                    </AnimatedCard>
                  </AnimatedItem>
                );
              })
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
                    onClick={() =>
                      router.push(
                        `/uploads/moderation?page=${i + 1}&status=${status}`
                      )
                    }
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

      {/* Delete Confirmation Modal */}
      {showModal && selectedModeration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-overlay backdrop-blur-sm">
          <AnimatedItem direction="scale" springType="bouncy">
            <div className="classical-card p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiAlertTriangle className="w-8 h-8 text-accent-red" />
                </div>

                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Confirmar Exclusão
                </h3>

                <p className="text-theme-secondary mb-6">
                  Tem certeza que deseja deletar &quot;
                  {getEntityTitle(selectedModeration)}&quot;? Esta ação não pode
                  ser desfeita.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-theme-tertiary mb-2">
                    Notas da moderação (opcional)
                  </label>
                  <textarea
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                    rows={3}
                    className="input-classical-2 w-full resize-none"
                    placeholder="Explique o motivo da exclusão..."
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedModeration(null);
                      setModerationNotes('');
                    }}
                  >
                    Cancelar
                  </Button>

                  <Button
                    variant="delete"
                    onClick={() =>
                      handleModeration(selectedModeration.id, 'delete')
                    }
                    disabled={processingId === selectedModeration.id}
                  >
                    Confirmar Exclusão
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedItem>
        </div>
      )}

      {/* Notification System */}
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </PageContainer>
  );
};

export default ModerationClient;
