// app/admin/newsletter/automation/NewsletterAutomationClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiClock,
  FiPlay,
  FiPause,
  FiSettings,
  FiMail,
  FiUsers,
  FiRefreshCw,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiCpu,
  FiZap,
  FiTarget,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useNewsletterAutomation } from '@/app/hooks/admin/useNewsletterAutomation';

interface AutomationRule {
  id: string;
  name: string;
  type: 'WELCOME' | 'DRIP_CAMPAIGN' | 'BEHAVIOR_TRIGGER' | 'SCHEDULED';
  trigger: string;
  isActive: boolean;
  conditions: any;
  actions: any;
  schedule?: string;
  lastRun?: string;
  nextRun?: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  createdAt: string;
}

export default function NewsletterAutomationClient() {
  const {
    automations,
    stats,
    loading,
    fetchAutomations,

    deleteAutomation,
    toggleAutomation,
    executeAutomation,
  } = useNewsletterAutomation();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] =
    useState<AutomationRule | null>(null);

  useEffect(() => {
    fetchAutomations();
  }, []);

  const getAutomationTypeIcon = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return FiMail;
      case 'DRIP_CAMPAIGN':
        return FiTarget;
      case 'BEHAVIOR_TRIGGER':
        return FiZap;
      case 'SCHEDULED':
        return FiClock;
      default:
        return FiCpu;
    }
  };

  const getAutomationTypeColor = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return 'text-accent-green bg-accent-green/10';
      case 'DRIP_CAMPAIGN':
        return 'text-accent-blue bg-accent-blue/10';
      case 'BEHAVIOR_TRIGGER':
        return 'text-accent-purple bg-accent-purple/10';
      case 'SCHEDULED':
        return 'text-accent-amber bg-accent-amber/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getAutomationTypeLabel = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return 'Boas-vindas';
      case 'DRIP_CAMPAIGN':
        return 'Campanha Drip';
      case 'BEHAVIOR_TRIGGER':
        return 'Trigger Comportamental';
      case 'SCHEDULED':
        return 'Agendada';
      default:
        return type;
    }
  };

  const handleToggleAutomation = async (automation: AutomationRule) => {
    try {
      await toggleAutomation(automation.id, !automation.isActive);
    } catch (error: any) {
      console.error('Erro ao alternar automação:', error);
    }
  };

  const handleExecuteAutomation = async (automation: AutomationRule) => {
    if (
      confirm(
        `Tem certeza que deseja executar manualmente a automação "${automation.name}"?`
      )
    ) {
      try {
        await executeAutomation(automation.id);
      } catch (error: any) {
        console.error('Erro ao executar automação:', error);
      }
    }
  };

  const handleDeleteAutomation = async (automation: AutomationRule) => {
    if (
      confirm(
        `Tem certeza que deseja deletar a automação "${automation.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await deleteAutomation(automation.id);
      } catch (error: any) {
        console.error('Erro ao deletar automação:', error);
      }
    }
  };

  if (loading && !automations) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando automações...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiClock className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Automação da Newsletter
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Configure e gerencie automações de email
              </p>
            </div>
          </AnimatedItem>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Total de Automações
                    </p>
                    <p className="text-3xl font-bold text-theme-primary">
                      {stats.totalAutomations}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiCpu className="w-6 h-6 text-accent-blue" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">Ativas</p>
                    <p className="text-3xl font-bold text-accent-green">
                      {stats.activeAutomations}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                    <FiPlay className="w-6 h-6 text-accent-green" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Execuções Hoje
                    </p>
                    <p className="text-3xl font-bold text-accent-purple">
                      {stats.executionsToday}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                    <FiZap className="w-6 h-6 text-accent-purple" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Taxa de Sucesso
                    </p>
                    <p className="text-3xl font-bold text-accent-amber">
                      {stats.successRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                    <FiCheckCircle className="w-6 h-6 text-accent-amber" />
                  </div>
                </div>
              </AnimatedCard>
            </div>
          )}

          {/* Controls */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-theme-primary mb-2">
                  Automações Configuradas
                </h3>
                <p className="text-theme-tertiary">
                  Gerencie regras de automação para emails da newsletter
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  }
                  onClick={fetchAutomations}
                  disabled={loading}
                >
                  Atualizar
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Nova Automação
                </Button>
              </div>
            </div>
          </AnimatedCard>

          {/* Automations List */}
          <AnimatedCard className="classical-card p-6">
            {automations && automations.length > 0 ? (
              <div className="space-y-4">
                {automations.map((automation) => {
                  const TypeIcon = getAutomationTypeIcon(automation.type);
                  const typeColor = getAutomationTypeColor(automation.type);
                  const typeLabel = getAutomationTypeLabel(automation.type);

                  return (
                    <div
                      key={automation.id}
                      className="border border-theme-primary rounded-lg p-6 hover:bg-theme-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColor}`}
                            >
                              <TypeIcon className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-theme-primary">
                                {automation.name}
                              </h4>
                              <div className="flex items-center space-x-3 text-sm text-theme-tertiary">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}
                                >
                                  {typeLabel}
                                </span>
                                <span>Trigger: {automation.trigger}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-theme-tertiary">
                                Status
                              </p>
                              <div className="flex items-center space-x-2">
                                {automation.isActive ? (
                                  <FiCheckCircle className="w-4 h-4 text-accent-green" />
                                ) : (
                                  <FiPause className="w-4 h-4 text-accent-red" />
                                )}
                                <span
                                  className={`text-sm font-medium ${
                                    automation.isActive
                                      ? 'text-accent-green'
                                      : 'text-accent-red'
                                  }`}
                                >
                                  {automation.isActive ? 'Ativa' : 'Inativa'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-theme-tertiary">
                                Execuções
                              </p>
                              <p className="text-sm font-medium text-theme-primary">
                                {automation.totalExecutions} total
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-theme-tertiary">
                                Taxa de Sucesso
                              </p>
                              <p className="text-sm font-medium text-theme-primary">
                                {automation.totalExecutions > 0
                                  ? (
                                      (automation.successfulExecutions /
                                        automation.totalExecutions) *
                                      100
                                    ).toFixed(1)
                                  : 0}
                                %
                              </p>
                            </div>

                            <div>
                              <p className="text-sm text-theme-tertiary">
                                {automation.lastRun
                                  ? 'Última Execução'
                                  : 'Próxima Execução'}
                              </p>
                              <p className="text-sm font-medium text-theme-primary">
                                {automation.lastRun
                                  ? new Date(
                                      automation.lastRun
                                    ).toLocaleDateString('pt-BR')
                                  : automation.nextRun
                                  ? new Date(
                                      automation.nextRun
                                    ).toLocaleDateString('pt-BR')
                                  : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {automation.failedExecutions > 0 && (
                            <div className="flex items-center space-x-2 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg mb-4">
                              <FiAlertTriangle className="w-4 h-4 text-accent-red" />
                              <span className="text-sm text-accent-red">
                                {automation.failedExecutions} execução(ões)
                                falharam
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEye />}
                            onClick={() => setSelectedAutomation(automation)}
                            title="Ver detalhes"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEdit />}
                            onClick={() => {
                              /* Modal de edição */
                            }}
                            title="Editar"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiPlay />}
                            onClick={() => handleExecuteAutomation(automation)}
                            title="Executar manualmente"
                            className="text-accent-green hover:text-accent-green"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={
                              automation.isActive ? <FiPause /> : <FiPlay />
                            }
                            onClick={() => handleToggleAutomation(automation)}
                            title={automation.isActive ? 'Pausar' : 'Ativar'}
                            className={
                              automation.isActive
                                ? 'text-accent-amber hover:text-accent-amber'
                                : 'text-accent-green hover:text-accent-green'
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiTrash2 />}
                            onClick={() => handleDeleteAutomation(automation)}
                            className="text-accent-red hover:text-accent-red"
                            title="Deletar"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiClock className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-medium text-theme-primary mb-2">
                  Nenhuma automação configurada
                </h3>
                <p className="text-theme-tertiary mb-6">
                  Crie sua primeira automação para começar a enviar emails
                  automaticamente
                </p>
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Criar Primeira Automação
                </Button>
              </div>
            )}
          </AnimatedCard>

          {/* Predefined Automation Templates */}
          <AnimatedCard className="classical-card p-6">
            <h3 className="text-xl font-bold text-theme-primary mb-6">
              Templates de Automação
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="border border-theme-secondary rounded-lg p-6 hover:border-brand-primary transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-accent-green/20 rounded-lg flex items-center justify-center">
                    <FiMail className="w-5 h-5 text-accent-green" />
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-primary">
                      Email de Boas-vindas
                    </h4>
                    <p className="text-sm text-theme-tertiary">
                      Envio automático para novos subscribers
                    </p>
                  </div>
                </div>
                <p className="text-sm text-theme-secondary mb-4">
                  Envia um email de boas-vindas personalizado imediatamente após
                  a inscrição.
                </p>
                <Button variant="ghost" size="sm" leftIcon={<FiPlus />}>
                  Usar Template
                </Button>
              </div>

              <div className="border border-theme-secondary rounded-lg p-6 hover:border-brand-primary transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-accent-blue/20 rounded-lg flex items-center justify-center">
                    <FiTarget className="w-5 h-5 text-accent-blue" />
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-primary">
                      Série de Introdução
                    </h4>
                    <p className="text-sm text-theme-tertiary">
                      Campanha drip de 7 dias
                    </p>
                  </div>
                </div>
                <p className="text-sm text-theme-secondary mb-4">
                  Série de emails introdutórios enviados ao longo de 7 dias para
                  novos usuários.
                </p>
                <Button variant="ghost" size="sm" leftIcon={<FiPlus />}>
                  Usar Template
                </Button>
              </div>

              <div className="border border-theme-secondary rounded-lg p-6 hover:border-brand-primary transition-colors cursor-pointer">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-accent-amber/20 rounded-lg flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-accent-amber" />
                  </div>
                  <div>
                    <h4 className="font-medium text-theme-primary">
                      Newsletter Semanal
                    </h4>
                    <p className="text-sm text-theme-tertiary">
                      Envio automático toda segunda-feira
                    </p>
                  </div>
                </div>
                <p className="text-sm text-theme-secondary mb-4">
                  Newsletter semanal com resumo de atividades e novos conteúdos.
                </p>
                <Button variant="ghost" size="sm" leftIcon={<FiPlus />}>
                  Usar Template
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </div>

      {/* Automation Details Modal */}
      {selectedAutomation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-primary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
              <h3 className="text-lg font-bold text-theme-primary">
                {selectedAutomation.name}
              </h3>
              <button
                onClick={() => setSelectedAutomation(null)}
                className="text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-theme-primary mb-2">
                    Condições
                  </h4>
                  <div className="bg-theme-secondary p-4 rounded-lg">
                    <pre className="text-sm text-theme-secondary whitespace-pre-wrap">
                      {JSON.stringify(selectedAutomation.conditions, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-theme-primary mb-2">Ações</h4>
                  <div className="bg-theme-secondary p-4 rounded-lg">
                    <pre className="text-sm text-theme-secondary whitespace-pre-wrap">
                      {JSON.stringify(selectedAutomation.actions, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-theme-primary mb-2">
                    Estatísticas
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-theme-secondary p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent-green">
                        {selectedAutomation.successfulExecutions}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Sucessos
                      </div>
                    </div>
                    <div className="bg-theme-secondary p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent-red">
                        {selectedAutomation.failedExecutions}
                      </div>
                      <div className="text-sm text-theme-tertiary">Falhas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-theme-secondary">
              <Button
                variant="ghost"
                onClick={() => setSelectedAutomation(null)}
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
