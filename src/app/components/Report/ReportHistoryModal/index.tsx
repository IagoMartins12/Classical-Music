// app/components/Report/ReportHistoryModal.tsx - Modal para histórico de reports
'use client';

import { useState, useEffect } from 'react';
import { FiUser, FiFlag } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import ReportPriorityBadge from '../ReportPriorityBadge';
import Modal from '../../Modal';

interface ReportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  entityName: string;
}

interface ReportRecord {
  id: string;
  reason: string;
  description?: string;
  status: string;
  priority: string;
  createdAt: string;
  resolvedAt?: string;
  reporter: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
  moderator?: {
    firstName?: string;
    lastName?: string;
  };
  moderationNotes?: string;
}

export default function ReportHistoryModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityName,
}: ReportHistoryModalProps) {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchReports();
    }
  }, [isOpen, entityId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/reports/history?entityType=${entityType}&entityId=${entityId}`
      );
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate_content: 'Conteúdo inadequado',
      copyright_violation: 'Violação de direitos autorais',
      false_information: 'Informações falsas',
      spam: 'Spam',
      duplicate_content: 'Conteúdo duplicado',
      other: 'Outros',
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: {
        label: 'Pendente',
        color: 'text-accent-amber bg-accent-amber/10',
      },
      approved: {
        label: 'Aprovado',
        color: 'text-accent-green bg-accent-green/10',
      },
      rejected: {
        label: 'Rejeitado',
        color: 'text-accent-red bg-accent-red/10',
      },
    };
    const statusConfig =
      config[status as keyof typeof config] || config.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
      >
        {statusConfig.label}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <AnimatedItem direction="scale" springType="bouncy">
        <div className=" p-6 ">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                <FiFlag className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Histórico de Reports
                </h2>
                <p className="text-sm text-theme-secondary">{entityName}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-theme-secondary">Carregando histórico...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FiFlag className="w-12 h-12 text-theme-tertiary mx-auto mb-4 opacity-50" />
              <p className="text-theme-secondary">Nenhum report encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-theme-secondary rounded-lg border border-theme-primary"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <ReportPriorityBadge
                        priority={report.priority as any}
                        createdAt={report.createdAt}
                      />
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-theme-primary mb-1">
                      {getReasonLabel(report.reason)}
                    </h4>
                    {report.description && (
                      <p className="text-sm text-theme-secondary italic">
                        &quot;{report.description}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-theme-tertiary">
                      <FiUser className="w-4 h-4" />
                      <span>
                        {report.reporter.firstName || report.reporter.email}
                      </span>
                    </div>
                    {report.moderator && (
                      <div className="flex items-center space-x-1 text-theme-tertiary">
                        <span>Moderado por:</span>
                        <span className="font-medium">
                          {report.moderator.firstName ||
                            report.moderator.lastName}
                        </span>
                      </div>
                    )}
                  </div>

                  {report.moderationNotes && (
                    <div className="mt-3 p-2 bg-theme-elevated rounded border border-theme-primary">
                      <p className="text-sm text-theme-primary">
                        <strong>Notas da moderação:</strong>{' '}
                        {report.moderationNotes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end mt-6">
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </AnimatedItem>
    </Modal>
  );
}
