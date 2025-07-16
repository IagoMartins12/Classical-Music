// app/admin/backup/BackupManagementClient.tsx
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
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import {
  useBackupManagement,
  formatBackupDate,
  getBackupAge,
  getStatusColor,
  getStatusLabel,
} from '@/app/hooks/admin/useBackupManagement';
import Button from '@/app/components/Common/Button';
import { MetricCard } from '@/app/components/Admin/Charts/AdminCharts';

export default function BackupManagementClient() {
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
    lastUpdated,
  } = useBackupManagement();

  const [mounted, setMounted] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);

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
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando sistema de backup...
            </p>
          </div>
        </div>
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
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
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
                    Ações de Backup
                  </h3>
                  <p className="text-theme-secondary">
                    Gerencie backups do banco de dados
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="primary"
                    leftIcon={<FiDownload />}
                    onClick={createBackup}
                    disabled={isCreatingBackup || stats?.isBackupRunning}
                    loading={isCreatingBackup}
                  >
                    {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
                  </Button>

                  <Button
                    variant="secondary"
                    leftIcon={
                      <FiRefreshCw className={loading ? 'animate-spin' : ''} />
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
                        Um backup está sendo criado. A página será atualizada
                        automaticamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </AnimatedCard>
          </AnimatedItem>

          {/* Backups List */}
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-theme-primary">
                  Lista de Backups
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

          {/* System Info */}
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
                        Máximo de backups:
                      </span>
                      <span className="font-medium text-theme-primary">
                        {stats?.maxBackups || 5}
                      </span>
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
    </PageContainer>
  );
}
