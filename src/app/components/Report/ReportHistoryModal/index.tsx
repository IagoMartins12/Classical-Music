// app/components/Report/ReportHistoryModal.tsx - Modal para histórico de reports
'use client';

import { useState, useEffect } from 'react';
import { PiFlag, PiUser } from 'react-icons/pi';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import ReportPriorityBadge from '../ReportPriorityBadge';
import Modal from '../../Modal';
import { getReportHistory } from '@/app/requests/moderation';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
      const response = await getReportHistory(entityType, entityId);
      if (response.ok) {
        setReports((response.data.reports as ReportRecord[]) || []);
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
        color: 'text-atencao bg-atencao/10',
      },
      approved: {
        label: 'Aprovado',
        color: 'text-ok bg-ok/10',
      },
      rejected: {
        label: 'Rejeitado',
        color: 'text-erro bg-erro/10',
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
            <Inline gap={3}>
              <div className="w-10 h-10 bg-aviso/20 rounded-xl flex items-center justify-center">
                <PiFlag className="w-5 h-5 text-aviso" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Histórico de Reports
                </h2>
                <Text papel="rotulo" tom="suave" as="p">
                  {entityName}
                </Text>
              </div>
            </Inline>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-ouro/30 border-t-ouro rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-theme-secondary">Carregando histórico...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <PiFlag className="w-12 h-12 text-theme-tertiary mx-auto mb-4 opacity-50" />
              <p className="text-theme-secondary">Nenhum report encontrado</p>
            </div>
          ) : (
            <Stack>
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-theme-secondary rounded-lg border border-theme-primary"
                >
                  <div className="flex items-start justify-between mb-3">
                    <Inline gap={3}>
                      <ReportPriorityBadge
                        priority={report.priority as any}
                        createdAt={report.createdAt}
                      />
                      {getStatusBadge(report.status)}
                    </Inline>
                    <Text papel="rotulo" tom="fraco" as="div">
                      {formatDistanceToNow(new Date(report.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </Text>
                  </div>

                  <div className="mb-3">
                    <h4 className="font-medium text-theme-primary mb-1">
                      {getReasonLabel(report.reason)}
                    </h4>
                    {report.description && (
                      <Text
                        papel="rotulo"
                        tom="suave"
                        as="p"
                        className="italic"
                      >
                        &quot;{report.description}&quot;
                      </Text>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <Inline gap={1} className="text-theme-tertiary">
                      <PiUser className="w-4 h-4" />
                      <span>
                        {report.reporter.firstName || report.reporter.email}
                      </span>
                    </Inline>
                    {report.moderator && (
                      <Inline gap={1} className="text-theme-tertiary">
                        <span>Moderado por:</span>
                        <span className="font-medium">
                          {report.moderator.firstName ||
                            report.moderator.lastName}
                        </span>
                      </Inline>
                    )}
                  </div>

                  {report.moderationNotes && (
                    <div className="mt-3 p-2 bg-theme-elevated rounded border border-theme-primary">
                      <Text papel="rotulo" tom="forte" as="p">
                        <strong>Notas da moderação:</strong>{' '}
                        {report.moderationNotes}
                      </Text>
                    </div>
                  )}
                </div>
              ))}
            </Stack>
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
