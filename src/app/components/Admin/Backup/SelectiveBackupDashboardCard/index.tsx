// app/components/Admin/SelectiveBackupDashboardCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiTarget,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiArrowRight,
  FiLayers,
  FiDatabase,
} from 'react-icons/fi';
import { AnimatedCard } from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useSelectiveBackup } from '@/app/hooks/admin/useSelectiveBackup';

interface SelectiveBackupDashboardCardProps {
  className?: string;
}

export default function SelectiveBackupDashboardCard({
  className = '',
}: SelectiveBackupDashboardCardProps) {
  const {
    selectiveBackups,
    maxBackups,
    totalBackups,
    loading,
    error,
    isCreatingBackup,
    refreshBackups,
    formatBackupDate,
    getBackupAge,
    lastUpdated,
  } = useSelectiveBackup();

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
    if (isRunning) return 'Criando backup';
    return 'Operacional';
  };

  const recentBackups = selectiveBackups.slice(0, 3);
  const successfulBackups = selectiveBackups.filter(
    (b) => b.status === 'completed'
  ).length;
  const failedBackups = selectiveBackups.filter(
    (b) => b.status === 'failed'
  ).length;

  const getLatestBackup = () => {
    const completed = selectiveBackups.filter((b) => b.status === 'completed');
    return completed.length > 0 ? completed[0] : null;
  };

  const latestBackup = getLatestBackup();

  return (
    <AnimatedCard className={`classical-card p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
            <FiTarget className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-theme-primary">
              Backup Seletivo
            </h3>
            <p className="text-theme-secondary">
              Backup de tabelas específicas
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isCreatingBackup
                ? 'bg-accent-amber animate-pulse'
                : error
                  ? 'bg-accent-red'
                  : 'bg-accent-green'
            }`}
          ></div>
          <span
            className={`text-sm font-medium ${getStatusColor(
              isCreatingBackup,
              !!error
            )}`}
          >
            {getStatusText(isCreatingBackup, !!error)}
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
      ) : loading && selectiveBackups.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-theme-secondary">Carregando dados...</p>
        </div>
      ) : (
        <>
          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-theme-secondary rounded-xl">
              <div className="flex items-center justify-center mb-2">
                <FiDatabase className="w-4 h-4 text-accent-purple mr-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Total
                </span>
              </div>
              <div className="text-xl font-bold text-theme-primary">
                {totalBackups}
              </div>
              <div className="text-xs text-theme-tertiary">de {maxBackups}</div>
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
                <FiLayers className="w-4 h-4 text-accent-amber mr-2" />
                <span className="text-sm font-medium text-theme-primary">
                  Último
                </span>
              </div>
              <div className="text-sm font-bold text-theme-primary">
                {mounted && latestBackup
                  ? getBackupAge(latestBackup.date)
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
                    Limite de Backups
                  </span>
                </div>
                <span className="text-sm font-medium text-theme-primary">
                  {totalBackups}/{maxBackups}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 bg-theme-secondary rounded-lg">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isCreatingBackup
                        ? 'bg-accent-amber animate-pulse'
                        : 'bg-accent-green'
                    }`}
                  ></div>
                  <span className="text-sm text-theme-primary">
                    Sistema de Backup
                  </span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCreatingBackup ? 'text-accent-amber' : 'text-accent-green'
                  }`}
                >
                  {isCreatingBackup ? 'Ativo' : 'Pronto'}
                </span>
              </div>
            </div>
          </div>

          {/* Backups Recentes */}
          <div className="mb-6">
            <h4 className="font-medium text-theme-primary mb-3">
              Backups Seletivos Recentes
            </h4>

            {recentBackups.length === 0 ? (
              <div className="text-center py-4">
                <FiTarget className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                <p className="text-sm text-theme-secondary">
                  Nenhum backup seletivo encontrado
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
                          {backup.collections.length} tabelas - {backup.size}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-theme-tertiary">
                          <span>
                            {mounted
                              ? formatBackupDate(backup.date)
                              : 'Carregando...'}
                          </span>
                          <span>•</span>
                          <span>{backup.collections.length} tabelas</span>
                        </div>
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
            <Link href="/admin/backup">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<FiDownload />}
                className="w-full"
                disabled={isCreatingBackup}
              >
                {isCreatingBackup
                  ? 'Criando Backup...'
                  : 'Novo Backup Seletivo'}
              </Button>
            </Link>

            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                }
                onClick={refreshBackups}
                disabled={loading}
                className="flex-1"
              >
                Atualizar
              </Button>

              <Link href="/admin/backup" className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<FiArrowRight />}
                  className="w-full"
                >
                  Ver Todos
                </Button>
              </Link>
            </div>
          </div>

          {/* Alerta de Backup em Execução */}
          {isCreatingBackup && (
            <div className="mt-4 p-3 bg-accent-amber/10 border border-accent-amber/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <FiActivity className="w-4 h-4 text-accent-amber animate-pulse" />
                <div>
                  <p className="text-sm font-medium text-accent-amber">
                    Backup Seletivo em Progresso
                  </p>
                  <p className="text-xs text-theme-secondary">
                    Sistema será atualizado automaticamente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informação sobre Limite */}
          <div className="mt-4 p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <FiTarget className="w-4 h-4 text-accent-blue mt-0.5" />
              <div>
                <p className="text-sm font-medium text-accent-blue">
                  Backup Seletivo
                </p>
                <p className="text-xs text-theme-secondary">
                  Permite backup de tabelas específicas com limite de{' '}
                  {maxBackups} backups. Ideal para backups rápidos e focados.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatedCard>
  );
}
