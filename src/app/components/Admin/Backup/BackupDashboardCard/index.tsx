// app/components/Admin/BackupDashboardCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiDatabase,
  FiHardDrive,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiActivity,
  FiArrowRight,
  FiDownload,
  FiRefreshCw,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import {
  useBackupManagement,
  formatBackupDate,
  getBackupAge,
} from '@/app/hooks/admin/useBackupManagement';
import Button from '@/app/components/Common/Button';

interface BackupDashboardCardProps {
  className?: string;
}

export default function BackupDashboardCard({
  className = '',
}: BackupDashboardCardProps) {
  const {
    backups,
    stats,
    loading,
    error,
    isCreatingBackup,
    createBackup,
    refreshBackups,
    lastUpdated,
  } = useBackupManagement();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (isRunning: boolean, hasError: boolean) => {
    if (hasError) return 'text-accent-red';
    if (isRunning) return 'text-accent-amber';
    return 'text-accent-green';
  };

  const getStatusText = (isRunning: boolean, hasError: boolean) => {
    if (hasError) return 'Erro';
    if (isRunning) return 'Em execução';
    return 'Operacional';
  };

  const recentBackups = backups.slice(0, 3);
  const successfulBackups = backups.filter(
    (b) => b.status === 'completed'
  ).length;
  const failedBackups = backups.filter((b) => b.status === 'failed').length;

  return (
    <AnimatedCard className={`classical-card p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
            <FiDatabase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-primary">
              Sistema de Backup
            </h3>
            <p className="text-theme-secondary">
              Gerenciamento e monitoramento
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              stats?.isBackupRunning
                ? 'bg-accent-amber animate-pulse'
                : 'bg-accent-green'
            }`}
          ></div>
          <span
            className={`text-sm font-medium ${getStatusColor(
              stats?.isBackupRunning || false,
              !!error
            )}`}
          >
            {getStatusText(stats?.isBackupRunning || false, !!error)}
          </span>
        </div>
      </div>

      {error ? (
        <div className="text-center py-8">
          <FiAlertTriangle className="w-12 h-12 text-accent-red mx-auto mb-3" />
          <p className="text-accent-red font-medium mb-3">
            Erro ao carregar dados
          </p>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<FiRefreshCw />}
            onClick={refreshBackups}
          >
            Tentar Novamente
          </Button>
        </div>
      ) : loading && !stats ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-theme-secondary">Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FiHardDrive className="w-4 h-4 text-accent-blue mr-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Total
                </span>
              </div>
              <div className="text-xl font-bold text-theme-primary">
                {stats?.totalBackups || 0}
              </div>
              <div className="text-xs text-theme-tertiary">
                de {stats?.maxBackups || 5}
              </div>
            </div>

            <div className="text-center p-3 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FiCheckCircle className="w-4 h-4 text-accent-green mr-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Sucesso
                </span>
              </div>
              <div className="text-xl font-bold text-accent-green">
                {successfulBackups}
              </div>
              <div className="text-xs text-theme-tertiary">backups</div>
            </div>

            <div className="text-center p-3 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FiAlertTriangle className="w-4 h-4 text-accent-red mr-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Falhas
                </span>
              </div>
              <div className="text-xl font-bold text-accent-red">
                {failedBackups}
              </div>
              <div className="text-xs text-theme-tertiary">backups</div>
            </div>

            <div className="text-center p-3 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FiClock className="w-4 h-4 text-accent-amber mr-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Último
                </span>
              </div>
              <div className="text-sm font-bold text-theme-primary">
                {mounted && stats?.lastBackupDate
                  ? getBackupAge(stats.lastBackupDate)
                  : 'Nunca'}
              </div>
              <div className="text-xs text-theme-tertiary">atrás</div>
            </div>
          </div>

          {/* Status do Sistema */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-theme-primary">
                Status do Sistema
              </h4>
              <span className="text-xs text-theme-tertiary">
                {mounted && lastUpdated
                  ? `Atualizado ${getBackupAge(lastUpdated)}`
                  : 'Carregando...'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-theme-secondary rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                  <span className="text-sm text-theme-primary">
                    Armazenamento
                  </span>
                </div>
                <span className="text-sm font-medium text-theme-primary">
                  {stats?.totalSize || '0 MB'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-theme-secondary rounded-lg">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      stats?.isBackupRunning
                        ? 'bg-accent-amber animate-pulse'
                        : 'bg-accent-green'
                    }`}
                  ></div>
                  <span className="text-sm text-theme-primary">
                    Backup Automático
                  </span>
                </div>
                <span className="text-sm font-medium text-accent-green">
                  {stats?.scheduledBackupStatus === 'active'
                    ? 'Ativo'
                    : 'Inativo'}
                </span>
              </div>
            </div>
          </div>

          {/* Backups Recentes */}
          <div className="mb-6">
            <h4 className="font-medium text-theme-primary mb-3">
              Backups Recentes
            </h4>

            {recentBackups.length === 0 ? (
              <div className="text-center py-4">
                <FiDatabase className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                <p className="text-sm text-theme-secondary">
                  Nenhum backup encontrado
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentBackups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {backup.status === 'completed' && (
                          <FiCheckCircle className="w-4 h-4 text-accent-green" />
                        )}
                        {backup.status === 'failed' && (
                          <FiAlertTriangle className="w-4 h-4 text-accent-red" />
                        )}
                        {backup.status === 'in_progress' && (
                          <FiActivity className="w-4 h-4 text-accent-amber animate-pulse" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-theme-primary truncate">
                          {backup.size}
                        </p>
                        <p className="text-xs text-theme-tertiary">
                          {mounted
                            ? formatBackupDate(backup.date)
                            : 'Carregando...'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-theme-tertiary">
                        {mounted ? getBackupAge(backup.date) : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiDownload />}
                onClick={createBackup}
                disabled={isCreatingBackup || stats?.isBackupRunning}
                loading={isCreatingBackup}
                className="flex-1"
              >
                {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                }
                onClick={refreshBackups}
                disabled={loading}
              >
                <span className="sr-only">Atualizar</span>
              </Button>
            </div>

            <Link href="/admin/backup">
              <Button
                variant="ghost"
                size="sm"
                rightIcon={<FiArrowRight />}
                className="w-full"
              >
                Gerenciar Backups
              </Button>
            </Link>
          </div>

          {/* Alerta de Backup em Execução */}
          {stats?.isBackupRunning && (
            <div className="mt-4 p-3 bg-accent-amber/10 border border-accent-amber/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiActivity className="w-4 h-4 text-accent-amber animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-accent-amber">
                    Backup em Progresso
                  </p>
                  <p className="text-xs text-theme-secondary">
                    Sistema será atualizado automaticamente
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AnimatedCard>
  );
}
