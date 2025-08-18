// app/components/ModerationClient.tsx - VERSÃO ATUALIZADA com seleção múltipla
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
  FiEye,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  LoadingSpinner,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';

import ReportHistoryModal from '@/app/components/Report/ReportHistoryModal';
import VerificationBadge from '@/app/components/Verification/VerificationBadge';
import { REPORT_REASONS } from '@/app/utils/reportHelpers';
import BulkReportActions from '../../../components/Report/BulkReportActions';
import ReportPriorityBadge from '../../../components/Report/ReportPriorityBadge';
import { useToast } from '@/app/hooks/useToast';
import Input from '../../../components/Common/Inputs';

interface ModerationClientProps {
  page: number;
  status: string;
  isAdmin?: boolean;
}

const ModerationClient = ({
  page,
  status,
  isAdmin = false,
}: ModerationClientProps) => {
  const router = useRouter();

  const [moderations, setModerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedModeration, setSelectedModeration] = useState<any>(null);
  const [moderationNotes, setModerationNotes] = useState('');

  // Estados para seleção múltipla
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Estados para histórico
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyEntity, setHistoryEntity] = useState<any>(null);

  const toast = useToast();

  useEffect(() => {
    fetchModerations();
  }, [page, status]);

  useEffect(() => {
    // Atualizar selectAll baseado na seleção atual
    if (moderations.length > 0) {
      setSelectAll(selectedReports.length === moderations.length);
    }
  }, [selectedReports, moderations]);

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
        // Limpar seleção ao carregar nova página
        setSelectedReports([]);
        setSelectAll(false);
      }
    } catch (error) {
      console.error('Erro ao carregar moderações:', error);
      toast.error('Erro', 'Não foi possível carregar as moderações');
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
        toast.success('Sucesso', data.message);
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
      toast.error(
        'Erro',
        error instanceof Error ? error.message : 'Erro ao processar moderação'
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Funções de seleção múltipla
  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports((prev) => [...prev, reportId]);
    } else {
      setSelectedReports((prev) => prev.filter((id) => id !== reportId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(moderations.map((m) => m.id));
    } else {
      setSelectedReports([]);
    }
    setSelectAll(checked);
  };

  const handleBulkActionComplete = () => {
    fetchModerations();
  };

  const handleClearSelection = () => {
    setSelectedReports([]);
    setSelectAll(false);
  };

  const showHistory = (moderation: any) => {
    setHistoryEntity({
      type: moderation.entityType,
      id: moderation.entityId,
      name: getEntityTitle(moderation),
    });
    setShowHistoryModal(true);
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

    const title = (() => {
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
    })();

    return title;
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

  const getReasonLabel = (reason: string) => {
    const reasonConfig = REPORT_REASONS[reason as keyof typeof REPORT_REASONS];
    return reasonConfig?.label || reason;
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
              Moderação de Reports
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
                  onClick={() => {
                    const url = isAdmin
                      ? `/admin/moderation/moderate?status=${statusOption}`
                      : `/uploads/moderation?status=${statusOption}`;
                    router.push(url);
                  }}
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

        {/* Bulk Selection Header */}
        {moderations.length > 0 && status === 'pending' && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="classical-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Input
                      type="checkbox"
                      checked={selectAll}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-theme-primary"
                    />
                    <span className="text-sm font-medium text-theme-primary">
                      Selecionar todos ({moderations.length})
                    </span>
                  </label>

                  {selectedReports.length > 0 && (
                    <span className="text-sm text-theme-secondary">
                      {selectedReports.length} selecionado(s)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiEye />}
                    onClick={() => router.push('/admin/reports')}
                  >
                    Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </AnimatedItem>
        )}

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
              moderations.map((moderation, index) => (
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
                        {/* Checkbox para seleção múltipla */}
                        {status === 'pending' && (
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selectedReports.includes(moderation.id)}
                              onChange={(e) =>
                                handleSelectReport(
                                  moderation.id,
                                  e.target.checked
                                )
                              }
                              className="rounded border-theme-primary"
                            />
                          </div>
                        )}

                        <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-amber rounded-xl flex items-center justify-center">
                          {getEntityIcon(moderation.entityType)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ReportPriorityBadge
                              priority={moderation.priority || 'normal'}
                              createdAt={moderation.createdAt}
                            />
                            <span className="text-xs text-theme-tertiary">
                              {moderation.entityType.charAt(0).toUpperCase() +
                                moderation.entityType.slice(1)}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-bold text-theme-primary">
                              {getEntityTitle(moderation)}
                            </h3>
                            {moderation.entityType === 'composer' &&
                              moderation.entityDetails?.isVerified && (
                                <VerificationBadge
                                  verified={true}
                                  size="sm"
                                  variant="icon"
                                />
                              )}
                          </div>

                          <p className="text-sm text-theme-secondary mb-2">
                            {getEntitySubtitle(moderation)}
                          </p>

                          <div className="flex items-center space-x-4 text-sm text-theme-tertiary mb-2">
                            <span className="flex items-center space-x-1">
                              <FiFlag className="w-4 h-4" />
                              <span>{getReasonLabel(moderation.reason)}</span>
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
                        {/* Botão de histórico */}
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEye />}
                          onClick={() => showHistory(moderation)}
                          title="Ver histórico"
                        >
                          Ver histórico
                        </Button>

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
                              const url = getViewUrl(moderation);
                              if (url) window.open(url, '_blank');
                            }}
                          >
                            Ver Item
                          </Button>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                </AnimatedItem>
              ))
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
                      const url = isAdmin
                        ? `/admin/moderation/moderate?page=${
                            i + 1
                          }&status=${status}`
                        : `/uploads/moderation?page=${i + 1}&status=${status}`;

                      router.push(url);
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

      {/* Bulk Actions */}
      <BulkReportActions
        selectedReports={selectedReports}
        onActionComplete={handleBulkActionComplete}
        onClearSelection={handleClearSelection}
      />

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

      {/* History Modal */}
      {showHistoryModal && historyEntity && (
        <ReportHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          entityType={historyEntity.type}
          entityId={historyEntity.id}
          entityName={historyEntity.name}
        />
      )}
    </PageContainer>
  );

  function getViewUrl(moderation: any): string | null {
    switch (moderation.entityType) {
      case 'composer':
        return `/composer/${moderation.entityId}`;
      case 'work':
        return `/work/${moderation.entityId}`;
      case 'score':
        return `/work/${moderation.entityDetails?.work?.id}`;
      default:
        return null;
    }
  }
};

export default ModerationClient;
