// app/admin/backup/BackupManagementClient.tsx - ATUALIZADO
'use client';

import { useState, useEffect } from 'react';
import {
  FiDatabase,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiHardDrive,
  FiCalendar,
  FiActivity,
  FiSettings,
  FiInfo,
  FiBarChart2,
  FiX,
  FiTarget,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import { useBackupManagement } from '@/app/hooks/admin/useBackupManagement';
import Button from '@/app/components/Common/Button';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';
import { useMaintenanceSystem } from '@/app/hooks/admin/useMaintenanceSystem';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import SelectiveBackupSection from '../SelectiveBackupSection';
import LoadingAdminState from '../../Common/LoadingState';
import Checkbox from '@/app/components/Common/Checkbox';

interface BackupScheduleFormData {
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number; // 0 = domingo, 1 = segunda, etc. (para weekly)
  dayOfMonth?: number; // 1-28 (para monthly)
  collections: string[];
  retentionDays: number;
  enabled: boolean;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const safeDate = (date: any): any => {
  if (!date) return null;
  if (typeof date === 'string') {
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }
  return date instanceof Date ? date : null;
};

export default function BackupManagementClient() {
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleForm, setScheduleForm] = useState<BackupScheduleFormData>({
    name: '',
    frequency: 'daily',
    time: '02:00',
    dayOfWeek: 0, // Domingo por padrão
    dayOfMonth: 1, // Dia 1 por padrão
    collections: [],
    retentionDays: 30,
    enabled: true,
  });

  // Estado para controle de abas
  const [activeTab, setActiveTab] = useState<'general' | 'selective'>(
    'general'
  );

  const {
    backups,
    stats,
    loading,
    error,
    isCreatingBackup,
    isRestoringBackup,
    refreshBackups,
    createBackup,
    restoreBackup,
    deleteBackup,
    formatBackupDate,
    getBackupAge,
    getStatusColor,
    getStatusLabel,
    lastUpdated,
  } = useBackupManagement();
  const maintenance = useMaintenanceSystem();

  const [mounted, setMounted] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

  const handleCreateSchedule = async () => {
    if (!scheduleForm.name.trim()) {
      return;
    }

    // Preparar dados do agendamento com os novos campos
    const scheduleData = {
      ...scheduleForm,
      // Remover campos não utilizados baseado na frequência
      ...(scheduleForm.frequency !== 'weekly' && { dayOfWeek: undefined }),
      ...(scheduleForm.frequency !== 'monthly' && { dayOfMonth: undefined }),
    };

    await maintenance.createBackupSchedule(scheduleData);
    setShowScheduleForm(false);
    setScheduleForm({
      name: '',
      frequency: 'daily',
      time: '02:00',
      dayOfWeek: 0,
      dayOfMonth: 1,
      collections: [],
      retentionDays: 30,
      enabled: true,
    });
  };

  const handleCollectionToggle = (collection: string) => {
    setScheduleForm((prev) => ({
      ...prev,
      collections: prev.collections.includes(collection)
        ? prev.collections.filter((c) => c !== collection)
        : [...prev.collections, collection],
    }));
  };

  // Função para gerar descrição amigável do agendamento
  const getScheduleDescription = (schedule: any) => {
    const time = schedule.time;
    let dayDescription = '';

    switch (schedule.frequency) {
      case 'daily':
        dayDescription = 'Diariamente';
        break;
      case 'weekly':
        const dayName =
          DAYS_OF_WEEK.find((d) => d.value === schedule.dayOfWeek)?.label ||
          'Domingo';
        dayDescription = `Toda ${dayName}`;
        break;
      case 'monthly':
        const day = schedule.dayOfMonth || 1;
        dayDescription = `Todo dia ${day} do mês`;
        break;
    }

    return `${dayDescription} às ${time}`;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const getMinutesSinceUpdate = () => {
    if (!mounted || !lastUpdated) return 0;
    return Math.floor((Date.now() - lastUpdated.getTime()) / (1000 * 60));
  };

  if (loading && !stats) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="sistema de backup" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertTriangle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar Sistema de Backup
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button
            variant="primary"
            leftIcon={<FiRefreshCw />}
            onClick={refreshBackups}
          >
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header Section */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8 lg:py-12">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiDatabase className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Gerenciamento de Backup
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Controle completo dos backups do banco de dados
              </p>

              {/* Status Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      stats?.isBackupRunning
                        ? 'bg-accent-amber animate-pulse'
                        : 'bg-accent-green'
                    }`}
                  ></div>
                  <span className="text-theme-primary font-medium">
                    {stats?.isBackupRunning
                      ? 'Backup em Execução'
                      : 'Sistema Pronto'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-theme-secondary" />
                  <span className="text-theme-secondary">
                    {mounted
                      ? getMinutesSinceUpdate() === 0
                        ? 'Atualizado agora'
                        : `Atualizado há ${getMinutesSinceUpdate()} min`
                      : 'Carregando...'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  }
                  onClick={refreshBackups}
                  disabled={loading}
                >
                  Atualizar
                </Button>
              </div>
            </div>
          </AnimatedItem>

          {/* Navegação por Abas */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex justify-center mb-8">
              <div className="flex space-x-1 bg-theme-secondary p-1 rounded-xl">
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'general'
                      ? 'bg-theme-tertiary text-white shadow-lg'
                      : 'text-theme-primary hover:bg-theme-primary'
                  }`}
                  onClick={() => setActiveTab('general')}
                >
                  <FiDatabase className="w-4 h-4" />
                  <span>Backup Geral</span>
                </button>
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === 'selective'
                      ? 'bg-theme-tertiary text-white shadow-lg'
                      : 'text-theme-primary hover:bg-theme-primary'
                  }`}
                  onClick={() => setActiveTab('selective')}
                >
                  <FiTarget className="w-4 h-4" />
                  <span>Backup Seletivo</span>
                </button>
              </div>
            </div>
          </AnimatedItem>

          {/* Conteúdo das Abas */}
          {activeTab === 'general' ? (
            <>
              {/* Stats Grid */}
              {stats && (
                <AnimatedItem direction="up" springType="gentle">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <MetricCard
                      title="Total de Backups"
                      value={stats.totalBackups}
                      change={{
                        value: stats.totalBackups > 0 ? 100 : 0,
                        isPositive: true,
                      }}
                      icon={FiHardDrive}
                      color="#3B82F6"
                    />

                    <MetricCard
                      title="Tamanho Total"
                      value={stats.totalSize}
                      icon={FiBarChart2}
                      color="#10B981"
                    />

                    <MetricCard
                      title="Último Backup"
                      value={
                        stats.lastBackupDate
                          ? getBackupAge(stats.lastBackupDate)
                          : 'Nunca'
                      }
                      icon={FiClock}
                      color="#F59E0B"
                    />

                    <MetricCard
                      title="Limite Máximo"
                      value={`${stats.totalBackups}/${stats.maxBackups}`}
                      change={{
                        value: (stats.totalBackups / stats.maxBackups) * 100,
                        isPositive: stats.totalBackups < stats.maxBackups,
                      }}
                      icon={FiSettings}
                      color="#8B5CF6"
                    />
                  </div>
                </AnimatedItem>
              )}

              {/* Action Buttons */}
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-theme-primary mb-2">
                        Backup Completo do Banco
                      </h3>
                      <p className="text-theme-secondary">
                        Backup completo de todas as tabelas (Limite: 5 backups)
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="primary"
                        leftIcon={<FiDownload />}
                        onClick={createBackup}
                        disabled={isCreatingBackup || stats?.isBackupRunning}
                        isLoading={isCreatingBackup}
                      >
                        {isCreatingBackup
                          ? 'Criando...'
                          : 'Criar Backup Completo'}
                      </Button>

                      <Button
                        variant="secondary"
                        leftIcon={
                          <FiRefreshCw
                            className={loading ? 'animate-spin' : ''}
                          />
                        }
                        onClick={refreshBackups}
                        disabled={loading}
                      >
                        Atualizar Lista
                      </Button>
                    </div>
                  </div>

                  {/* Status atual */}
                  {stats?.isBackupRunning && (
                    <div className="mt-6 p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-accent-amber rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium text-accent-amber">
                            Backup em Progresso
                          </p>
                          <p className="text-sm text-theme-secondary mt-1">
                            Um backup está sendo criado. A página será
                            atualizada automaticamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </AnimatedCard>
              </AnimatedItem>

              {/* Backup Schedules */}
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-theme-primary">
                      Agendamentos de Backup
                    </h3>
                    <Button
                      variant="secondary"
                      leftIcon={<FiCalendar />}
                      onClick={() => setShowScheduleForm(true)}
                    >
                      Novo Agendamento
                    </Button>
                  </div>

                  {maintenance.backupSchedules.length === 0 ? (
                    <div className="text-center py-8 bg-theme-secondary rounded-xl">
                      <FiCalendar className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <p className="text-theme-secondary">
                        Nenhum backup agendado
                      </p>
                      <Button
                        variant="secondary"
                        className="mt-4"
                        onClick={() => setShowScheduleForm(true)}
                      >
                        Criar Primeiro Agendamento
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {maintenance.backupSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="p-4 border rounded-xl transition-all cursor-pointer "
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  schedule.enabled
                                    ? 'bg-accent-green'
                                    : 'bg-theme-tertiary'
                                }`}
                              />
                              <div>
                                <h5 className="font-medium text-theme-primary">
                                  {schedule.name}
                                </h5>
                                <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                                  <span>
                                    {getScheduleDescription(schedule)}
                                  </span>
                                  <span>
                                    Retenção: {schedule.retentionDays} dias
                                  </span>
                                  {schedule.collections &&
                                    schedule.collections.length > 0 && (
                                      <span>
                                        Collections:{' '}
                                        {schedule.collections.length}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-theme-tertiary">
                                {maintenance.getNextRunFormatted(
                                  safeDate(schedule.nextRun)
                                )}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiTrash2 />}
                                onClick={() =>
                                  maintenance.deleteBackupSchedule(schedule.id)
                                }
                                className="text-accent-red hover:bg-accent-red/10"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedCard>
              </AnimatedItem>

              {/* Backups List */}
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard className="classical-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-theme-primary">
                      Lista de Backups Completos
                    </h3>
                    {stats && (
                      <div className="text-sm text-theme-secondary">
                        {stats.totalBackups} de {stats.maxBackups} backups
                      </div>
                    )}
                  </div>

                  {backups.length === 0 ? (
                    <div className="text-center py-12">
                      <FiDatabase className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-theme-primary mb-2">
                        Nenhum backup encontrado
                      </h4>
                      <p className="text-theme-secondary mb-6">
                        Crie seu primeiro backup para começar
                      </p>
                      <Button
                        variant="primary"
                        leftIcon={<FiDownload />}
                        onClick={createBackup}
                        disabled={isCreatingBackup}
                      >
                        Criar Primeiro Backup
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {backups.map((backup) => (
                        <div
                          key={backup.id}
                          className={`p-4 border rounded-xl transition-all cursor-pointer ${
                            selectedBackup === backup.id
                              ? 'border-brand-primary bg-brand-primary/5'
                              : 'border-theme-primary hover:border-theme-secondary'
                          }`}
                          onClick={() =>
                            setSelectedBackup(
                              selectedBackup === backup.id ? null : backup.id
                            )
                          }
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {backup.status === 'completed' && (
                                  <FiCheckCircle className="w-6 h-6 text-accent-green" />
                                )}
                                {backup.status === 'failed' && (
                                  <FiAlertTriangle className="w-6 h-6 text-accent-red" />
                                )}
                                {backup.status === 'in_progress' && (
                                  <FiActivity className="w-6 h-6 text-accent-amber animate-pulse" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                  <h4 className="font-medium text-theme-primary truncate">
                                    {backup.name}
                                  </h4>
                                  <span
                                    className={`text-sm font-medium ${getStatusColor(
                                      backup.status
                                    )}`}
                                  >
                                    {getStatusLabel(backup.status)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                                  <span className="flex items-center space-x-1">
                                    <FiCalendar className="w-3 h-3" />
                                    <span>{formatBackupDate(backup.date)}</span>
                                  </span>
                                  <span className="flex items-center space-x-1">
                                    <FiHardDrive className="w-3 h-3" />
                                    <span>{backup.size}</span>
                                  </span>
                                  {backup.totalRecords && (
                                    <span className="flex items-center space-x-1">
                                      <FiDatabase className="w-3 h-3" />
                                      <span>
                                        {backup.totalRecords.toLocaleString()}{' '}
                                        registros
                                      </span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-theme-tertiary">
                                {getBackupAge(backup.date)}
                              </span>
                            </div>
                          </div>

                          {/* Detalhes expandidos */}
                          {selectedBackup === backup.id && (
                            <div className="mt-4 pt-4 border-t border-theme-primary">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {backup.collections && (
                                  <div>
                                    <span className="text-xs text-theme-tertiary uppercase tracking-wider">
                                      Collections
                                    </span>
                                    <p className="font-medium text-theme-primary">
                                      {backup.collections}
                                    </p>
                                  </div>
                                )}
                                {backup.duration && (
                                  <div>
                                    <span className="text-xs text-theme-tertiary uppercase tracking-wider">
                                      Duração
                                    </span>
                                    <p className="font-medium text-theme-primary">
                                      {backup.duration}
                                    </p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-xs text-theme-tertiary uppercase tracking-wider">
                                    ID
                                  </span>
                                  <p className="font-mono text-sm text-theme-primary truncate">
                                    {backup.id}
                                  </p>
                                </div>
                              </div>

                              {backup.error && (
                                <div className="mb-4 p-3 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                                  <p className="text-sm text-accent-red">
                                    <strong>Erro:</strong> {backup.error}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <FiInfo className="w-4 h-4 text-theme-tertiary" />
                                  <span className="text-sm text-theme-secondary">
                                    Clique nos botões para gerenciar este backup
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                  {backup.status === 'completed' && (
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      leftIcon={<FiUpload />}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        restoreBackup(backup.id);
                                      }}
                                      disabled={isRestoringBackup}
                                    >
                                      Restaurar
                                    </Button>
                                  )}

                                  <Button
                                    variant="delete"
                                    size="sm"
                                    leftIcon={<FiTrash2 />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteBackup(backup.id);
                                    }}
                                  >
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </AnimatedCard>
              </AnimatedItem>
            </>
          ) : (
            /* Aba de Backup Seletivo */
            <SelectiveBackupSection />
          )}

          {/* System Info - Sempre visível */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-4">
                Informações do Sistema
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-theme-primary mb-3">
                    Configurações de Backup
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Máximo de backups completos:
                      </span>
                      <span className="font-medium text-theme-primary">
                        {stats?.maxBackups || 5}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Máximo de backups seletivos:
                      </span>
                      <span className="font-medium text-theme-primary">25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Backup automático:
                      </span>
                      <span className="font-medium text-accent-green">
                        {stats?.scheduledBackupStatus === 'active'
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Localização:</span>
                      <span className="font-mono text-xs text-theme-primary">
                        ./backups/
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-theme-primary mb-3">
                    Estatísticas
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Backups concluídos:
                      </span>
                      <span className="font-medium text-theme-primary">
                        {backups.filter((b) => b.status === 'completed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Backups com falha:
                      </span>
                      <span className="font-medium text-accent-red">
                        {backups.filter((b) => b.status === 'failed').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">
                        Espaço utilizado:
                      </span>
                      <span className="font-medium text-theme-primary">
                        {stats?.totalSize || '0 MB'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        </AnimatedContainer>
      </div>

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <Modal
          isOpen
          maxWidth="5xl"
          onClose={() => setShowScheduleForm(false)}
          confirmOnClose
          withouVerification
        >
          <div className="bg-theme-elevated p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Agendar Backup
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nome do Agendamento
                </label>
                <Input
                  type="text"
                  value={scheduleForm.name}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Backup Diário do Sistema"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Frequência
                  </label>
                  <Select
                    options={[
                      { value: 'daily', label: 'Diário' },
                      { value: 'weekly', label: 'Semanal' },
                      { value: 'monthly', label: 'Mensal' },
                    ]}
                    value={scheduleForm.frequency}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        frequency: e.target.value as
                          | 'daily'
                          | 'weekly'
                          | 'monthly',
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Horário
                  </label>
                  <Input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Campos condicionais para dia da semana/mês */}
              {scheduleForm.frequency === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Dia da Semana
                  </label>
                  <Select
                    options={DAYS_OF_WEEK.map((day) => ({
                      value: day.value.toString(),
                      label: day.label,
                    }))}
                    value={scheduleForm.dayOfWeek?.toString() || '0'}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        dayOfWeek: parseInt(e.target.value),
                      }))
                    }
                  />
                  <p className="text-xs text-theme-tertiary mt-1">
                    Selecione o dia da semana para executar o backup semanal
                  </p>
                </div>
              )}

              {scheduleForm.frequency === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Dia do Mês
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="28"
                    value={scheduleForm.dayOfMonth || 1}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        dayOfMonth: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                  <p className="text-xs text-theme-tertiary mt-1">
                    Selecione o dia do mês (1-28) para executar o backup mensal.
                    Recomendamos até o dia 28 para garantir execução em todos os
                    meses.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Retenção (dias)
                </label>
                <Input
                  type="number"
                  value={scheduleForm.retentionDays}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      retentionDays: parseInt(e.target.value) || 30,
                    }))
                  }
                  min="1"
                  max="365"
                />
              </div>

              {/* Collections Selection */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Collections (deixe vazio para backup completo)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {maintenance.availableCollections.map((collection) => (
                    <label
                      key={collection.name}
                      className="flex items-center space-x-2 p-2 bg-theme-secondary rounded-lg cursor-pointer hover:bg-theme-primary"
                    >
                      <Checkbox
                        type="checkbox"
                        checked={scheduleForm.collections.includes(
                          collection.name
                        )}
                        onChange={() => handleCollectionToggle(collection.name)}
                        className="rounded text-brand-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-theme-primary truncate">
                          {collection.displayName}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  checked={scheduleForm.enabled}
                  onChange={(e) =>
                    setScheduleForm((prev) => ({
                      ...prev,
                      enabled: e.target.checked,
                    }))
                  }
                  className="rounded text-brand-primary"
                />
                <label className="text-sm text-theme-primary">
                  Ativar agendamento imediatamente
                </label>
              </div>

              {/* Preview do agendamento */}
              <div className="p-4 bg-theme-secondary rounded-lg border border-theme-primary">
                <h4 className="text-sm font-medium text-theme-primary mb-2">
                  Prévia do Agendamento
                </h4>
                <p className="text-sm text-theme-secondary">
                  <strong>{scheduleForm.name || 'Novo Agendamento'}</strong>{' '}
                  será executado{' '}
                  {getScheduleDescription({
                    frequency: scheduleForm.frequency,
                    time: scheduleForm.time,
                    dayOfWeek: scheduleForm.dayOfWeek,
                    dayOfMonth: scheduleForm.dayOfMonth,
                  }).toLowerCase()}
                  {scheduleForm.collections.length > 0
                    ? ` nas collections: ${scheduleForm.collections.join(', ')}`
                    : ' com backup completo'}
                  .
                </p>
                <p className="text-xs text-theme-tertiary mt-1">
                  Backups serão mantidos por {scheduleForm.retentionDays} dias.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="ghost"
                onClick={() => setShowScheduleForm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateSchedule}
                disabled={!scheduleForm.name.trim()}
              >
                Criar Agendamento
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
