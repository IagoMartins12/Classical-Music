// app/components/Admin/Moderation/ModerationDetail.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiArrowLeft,
  FiCheck,
  FiX,
  FiUser,
  FiCalendar,
  FiEye,
  FiDownload,
  FiShare2,
  FiAlertTriangle,
  FiInfo,
  FiFileText,
  FiMusic,
  FiUsers,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useAdminModeration } from '@/app/hooks/admin/useAdminModeration';
import { useToast } from '@/app/hooks/useToast';

interface ModerationDetailProps {
  itemId: string;
}

export default function ModerationDetail({ itemId }: ModerationDetailProps) {
  const router = useRouter();
  const { approveItem, rejectItem } = useAdminModeration();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const toast = useToast();
  // Mock data para demonstração
  useEffect(() => {
    // Simular carregamento do item
    setTimeout(() => {
      setItem({
        id: itemId,
        type: 'composer',
        title: 'Claude Debussy',
        uploader: {
          id: 'user123',
          name: 'João Silva',
          email: 'joao@email.com',
          uploadScore: 4.7,
        },
        status: 'pending',
        priority: 'high',
        submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        reportCount: 2,
        qualityScore: 8.5,
        issues: ['Biografia incompleta', 'Falta verificação de datas'],
        content: {
          description:
            'Compositor francês do período impressionista, nascido em 1862...',
          metadata: {
            birthYear: 1862,
            deathYear: 1918,
            nationality: 'French',
            epoch: 'Impressionist',
          },
        },
        reports: [
          {
            id: '1',
            reporter: 'Maria Santos',
            reason: 'Informações incorretas',
            description: 'As datas de nascimento e morte estão inconsistentes.',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            id: '2',
            reporter: 'Pedro Costa',
            reason: 'Biografia insuficiente',
            description:
              'A biografia está muito resumida e falta contexto histórico.',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
          },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [itemId]);

  const handleApprove = async () => {
    setProcessing(true);
    const success = await approveItem(itemId, notes);
    setProcessing(false);

    if (success) {
      router.push('/uploads/moderation');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Por favor, forneça uma razão para a rejeição.');
      return;
    }

    setProcessing(true);
    const success = await rejectItem(itemId, rejectionReason, notes);
    setProcessing(false);

    if (success) {
      router.push('/uploads/moderation');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'composer':
        return FiUsers;
      case 'work':
        return FiMusic;
      case 'score':
        return FiFileText;
      default:
        return FiFileText;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-accent-red bg-accent-red/10';
      case 'high':
        return 'text-accent-amber bg-accent-amber/10';
      case 'normal':
        return 'text-accent-blue bg-accent-blue/10';
      case 'low':
        return 'text-theme-tertiary bg-theme-secondary';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  if (loading) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando item para revisão...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!item) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Item não encontrado
          </h2>
          <p className="text-theme-secondary mb-6">
            O item solicitado não existe ou você não tem permissão para
            visualizá-lo.
          </p>
          <Button
            variant="primary"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.push('/uploads/moderation')}
          >
            Voltar à Moderação
          </Button>
        </div>
      </PageContainer>
    );
  }

  const TypeIcon = getTypeIcon(item.type);

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                leftIcon={<FiArrowLeft />}
                onClick={() => router.push('/uploads/moderation')}
              >
                Voltar
              </Button>
              <div className="h-6 w-px bg-theme-secondary" />
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <TypeIcon className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-theme-primary">
                    {item.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span
                      className={`px-2 py-1 rounded-full ${getPriorityColor(
                        item.priority
                      )}`}
                    >
                      {item.priority === 'urgent'
                        ? 'URGENTE'
                        : item.priority === 'high'
                          ? 'ALTA'
                          : item.priority === 'normal'
                            ? 'NORMAL'
                            : 'BAIXA'}{' '}
                      PRIORIDADE
                    </span>
                    <span>•</span>
                    <span>{item.reportCount} reports</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="secondary" leftIcon={<FiShare2 />} size="sm">
                Compartilhar
              </Button>
              <Button variant="secondary" leftIcon={<FiDownload />} size="sm">
                Exportar
              </Button>
            </div>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Item Details */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6">
                Detalhes do Item
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-theme-primary mb-2">
                    Descrição
                  </h4>
                  <p className="text-theme-secondary bg-theme-secondary p-4 rounded-xl">
                    {item.content.description}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-theme-primary mb-2">
                    Metadados
                  </h4>
                  <div className="bg-theme-secondary p-4 rounded-xl">
                    <pre className="text-sm text-theme-secondary">
                      {JSON.stringify(item.content.metadata, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-theme-primary mb-2">
                    Problemas Identificados
                  </h4>
                  <div className="space-y-2">
                    {item.issues.map((issue: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-accent-amber/10 border border-accent-amber rounded-lg"
                      >
                        <FiAlertTriangle className="w-4 h-4 text-accent-amber" />
                        <span className="text-theme-primary">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Reports */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6">
                Reports Recebidos
              </h3>

              <div className="space-y-4">
                {item.reports.map((report: any) => (
                  <div
                    key={report.id}
                    className="p-4 bg-theme-secondary rounded-xl"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h5 className="font-medium text-theme-primary">
                          {report.reporter}
                        </h5>
                        <p className="text-sm text-theme-tertiary">
                          {report.reason}
                        </p>
                      </div>
                      <span className="text-xs text-theme-tertiary">
                        {report.timestamp.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-theme-secondary">{report.description}</p>
                  </div>
                ))}
              </div>
            </AnimatedCard>

            {/* Moderation Actions */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6">
                Ações de Moderação
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Notas da Moderação
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione suas observações sobre esta revisão..."
                    className="input-classical-2 w-full h-24 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Razão para Rejeição (se aplicável)
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="input-classical-2 w-full"
                  >
                    <option value="">Selecione uma razão...</option>
                    <option value="insufficient_data">
                      Dados insuficientes
                    </option>
                    <option value="incorrect_information">
                      Informações incorretas
                    </option>
                    <option value="duplicate_content">
                      Conteúdo duplicado
                    </option>
                    <option value="quality_issues">
                      Problemas de qualidade
                    </option>
                    <option value="copyright_violation">
                      Violação de direitos autorais
                    </option>
                    <option value="inappropriate_content">
                      Conteúdo inadequado
                    </option>
                    <option value="other">Outro motivo</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t border-theme-secondary">
                  <Button
                    variant="primary"
                    leftIcon={<FiCheck />}
                    onClick={handleApprove}
                    disabled={processing}
                    className="flex-1"
                  >
                    Aprovar Item
                  </Button>

                  <Button
                    variant="secondary"
                    leftIcon={<FiX />}
                    onClick={handleReject}
                    disabled={processing || !rejectionReason}
                    className="flex-1 text-accent-red hover:bg-accent-red/10"
                  >
                    Rejeitar Item
                  </Button>
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Uploader Info */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
                <FiUser className="w-5 h-5 text-accent-blue" />
                <span>Informações do Uploader</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-theme-primary">
                      {item.uploader.name}
                    </p>
                    <p className="text-sm text-theme-tertiary">
                      {item.uploader.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="text-center p-2 bg-theme-secondary rounded-lg">
                    <div className="font-bold text-accent-green">
                      {item.uploader.uploadScore.toFixed(1)}
                    </div>
                    <div className="text-theme-tertiary">Score</div>
                  </div>
                  <div className="text-center p-2 bg-theme-secondary rounded-lg">
                    <div className="font-bold text-accent-blue">
                      {item.qualityScore.toFixed(1)}
                    </div>
                    <div className="text-theme-tertiary">Qualidade</div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  leftIcon={<FiEye />}
                  onClick={() =>
                    router.push(`/admin/users/${item.uploader.id}`)
                  }
                >
                  Ver Perfil Completo
                </Button>
              </div>
            </AnimatedCard>

            {/* Timeline */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
                <FiCalendar className="w-5 h-5 text-accent-green" />
                <span>Timeline</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent-blue rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-theme-primary">
                      Item enviado
                    </p>
                    <p className="text-xs text-theme-tertiary">
                      {item.submittedAt.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {item.reports.map((report: any) => (
                  <div key={report.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-accent-amber rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium text-theme-primary">
                        Report recebido
                      </p>
                      <p className="text-xs text-theme-tertiary">
                        {report.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}

                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent-green rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-theme-primary">
                      Em revisão
                    </p>
                    <p className="text-xs text-theme-tertiary">Agora</p>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Quick Stats */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
                <FiInfo className="w-5 h-5 text-accent-purple" />
                <span>Estatísticas Rápidas</span>
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-secondary">Tempo na fila</span>
                  <span className="font-medium text-theme-primary">
                    2h 15min
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-secondary">
                    Reports similares
                  </span>
                  <span className="font-medium text-theme-primary">3</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-theme-secondary">Score automático</span>
                  <span className="font-medium text-accent-green">8.5/10</span>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
