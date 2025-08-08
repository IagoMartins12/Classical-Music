// app/components/Admin/Logs/LogsCleanup/index.tsx
'use client';

import { useState } from 'react';
import {
  FiTrash2,
  FiDownload,
  FiCalendar,
  FiClock,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiLoader,
  FiFilter,
  FiArchive,
} from 'react-icons/fi';
import {
  useAdminLogs,
  DeleteLogsResult,
  CleanupResult,
} from '@/app/hooks/admin/useAdminLogs';
import Button from '@/app/components/Common/Button';
import { AnimatedCard } from '@/app/components/animation/AnimatedComponents';
import toast from 'react-hot-toast';

interface LogsCleanupProps {
  onClose?: () => void;
}

export default function LogsCleanup({ onClose }: LogsCleanupProps) {
  const {
    stats,
    loading,
    deleteLogs,
    cleanupOldLogs,
    exportLogs,
    refreshLogs,
  } = useAdminLogs();

  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(14);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const availableDates = stats?.availableDates || [];

  // Selecionar/deselecionar data
  const toggleDateSelection = (date: string) => {
    const newSelected = new Set(selectedDates);
    if (newSelected.has(date)) {
      newSelected.delete(date);
    } else {
      newSelected.add(date);
    }
    setSelectedDates(newSelected);
  };

  // Selecionar todas as datas
  const selectAllDates = () => {
    setSelectedDates(new Set(availableDates));
  };

  // Limpar seleção
  const clearSelection = () => {
    setSelectedDates(new Set());
  };

  // Selecionar datas antigas (mais de X dias)
  const selectOldDates = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const oldDates = availableDates.filter((date) => date < cutoffDateStr);
    setSelectedDates(new Set(oldDates));

    toast.success(`${oldDates.length} datas antigas selecionadas`);
  };

  // Exportar antes de deletar
  const handleExportBeforeDelete = async () => {
    if (selectedDates.size === 0) {
      toast.error('Selecione pelo menos uma data para exportar');
      return;
    }

    try {
      setActionLoading('export');

      await exportLogs('json');
      toast.success('Logs exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar logs');
      console.error('Erro ao exportar:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Deletar logs selecionados
  const handleDeleteSelected = async () => {
    if (selectedDates.size === 0) {
      toast.error('Selecione pelo menos uma data para deletar');
      return;
    }

    try {
      setActionLoading('delete');

      const result: DeleteLogsResult = await deleteLogs(
        Array.from(selectedDates)
      );

      toast.success(`${result.deletedCount} arquivos deletados`);

      if (result.errors?.length > 0) {
        toast.error(`${result.errors.length} erros durante a exclusão`);
      }

      setSelectedDates(new Set());
      setShowConfirmDialog(false);
    } catch (error) {
      toast.error('Erro ao deletar logs');
      console.error('Erro ao deletar:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Limpeza automática
  const handleAutoCleanup = async () => {
    try {
      setActionLoading('cleanup');

      const result: CleanupResult = await cleanupOldLogs(cleanupDays);

      toast.success(`${result.deletedCount} arquivos antigos deletados`);

      if (result.errors?.length > 0) {
        toast.error(`${result.errors.length} erros durante a limpeza`);
      }
    } catch (error) {
      toast.error('Erro na limpeza automática');
      console.error('Erro na limpeza:', error);
    } finally {
      setActionLoading(null);
    }
  };

  // Formatação de data
  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calcular tamanho estimado
  const getEstimatedSize = (dates: string[]) => {
    // Estimativa baseada na média de logs por dia
    const avgLogsPerDay = stats?.overview.totalLogs || 1000;
    const totalEstimated = dates.length * avgLogsPerDay;

    if (totalEstimated < 1000) return `~${totalEstimated} logs`;
    if (totalEstimated < 1000000)
      return `~${(totalEstimated / 1000).toFixed(1)}K logs`;
    return `~${(totalEstimated / 1000000).toFixed(1)}M logs`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-theme-primary">
            Gerenciar Logs
          </h2>
          <p className="text-theme-secondary mt-1">
            Exporte, archive ou delete logs do sistema
          </p>
        </div>

        {onClose && (
          <Button variant="ghost" onClick={onClose} leftIcon={<FiX />}>
            Fechar
          </Button>
        )}
      </div>

      {/* Limpeza Automática */}
      <AnimatedCard className="classical-card p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-amber to-accent-red rounded-xl flex items-center justify-center">
            <FiClock className="w-6 h-6 text-theme-primary" />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-theme-primary mb-2">
              Limpeza Automática
            </h3>
            <p className="text-theme-secondary mb-4">
              Delete automaticamente logs mais antigos que o período
              especificado
            </p>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-theme-primary">
                  Deletar logs mais antigos que:
                </label>
                <select
                  value={cleanupDays}
                  onChange={(e) => setCleanupDays(parseInt(e.target.value))}
                  className="input-classical-2 w-auto"
                >
                  <option value={7}>7 dias</option>
                  <option value={14}>14 dias</option>
                  <option value={30}>30 dias</option>
                  <option value={60}>60 dias</option>
                  <option value={90}>90 dias</option>
                </select>
              </div>

              <Button
                variant="primary"
                leftIcon={
                  actionLoading === 'cleanup' ? (
                    <FiLoader className="animate-spin" />
                  ) : (
                    <FiTrash2 />
                  )
                }
                onClick={handleAutoCleanup}
                disabled={!!actionLoading}
              >
                {actionLoading === 'cleanup'
                  ? 'Limpando...'
                  : 'Limpar Automaticamente'}
              </Button>
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* Seleção Manual */}
      <AnimatedCard className="classical-card p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-theme-primary">
              Seleção Manual de Datas
            </h3>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-theme-tertiary">
                {selectedDates.size} de {availableDates.length} selecionadas
              </span>
            </div>
          </div>

          {/* Ações de Seleção */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={selectAllDates}
              leftIcon={<FiCheck />}
            >
              Selecionar Todas
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={clearSelection}
              leftIcon={<FiX />}
            >
              Limpar Seleção
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => selectOldDates(30)}
              leftIcon={<FiFilter />}
            >
              Selecionar +30 dias
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => selectOldDates(14)}
              leftIcon={<FiFilter />}
            >
              Selecionar +14 dias
            </Button>
          </div>

          {/* Lista de Datas */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {availableDates.length === 0 ? (
              <div className="text-center py-8 text-theme-tertiary">
                <FiCalendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum arquivo de log encontrado</p>
              </div>
            ) : (
              availableDates.map((date) => (
                <div
                  key={date}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedDates.has(date)
                      ? 'bg-accent-blue/10 border-accent-blue'
                      : 'bg-theme-secondary border-theme-secondary hover:bg-theme-primary/50'
                  }`}
                  onClick={() => toggleDateSelection(date)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedDates.has(date)}
                      onChange={() => toggleDateSelection(date)}
                      className="w-4 h-4 text-accent-blue rounded focus:ring-accent-blue"
                    />
                    <div>
                      <p className="font-medium text-theme-primary">
                        {formatDate(date)}
                      </p>
                      <p className="text-sm text-theme-tertiary">
                        {date} - {getEstimatedSize([date])}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm text-theme-tertiary">
                    {(() => {
                      const today = new Date().toISOString().split('T')[0];
                      const daysDiff = Math.floor(
                        (new Date(today).getTime() - new Date(date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      );

                      if (daysDiff === 0) return 'Hoje';
                      if (daysDiff === 1) return 'Ontem';
                      return `${daysDiff} dias atrás`;
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Ações para Seleção */}
          {selectedDates.size > 0 && (
            <div className="flex items-center justify-between p-4 bg-accent-blue/10 border border-accent-blue rounded-xl">
              <div>
                <p className="font-medium text-accent-blue">
                  {selectedDates.size} arquivo(s) selecionado(s)
                </p>
                <p className="text-sm text-theme-tertiary">
                  Tamanho estimado:{' '}
                  {getEstimatedSize(Array.from(selectedDates))}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={
                    actionLoading === 'export' ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiDownload />
                    )
                  }
                  onClick={handleExportBeforeDelete}
                  disabled={!!actionLoading}
                >
                  {actionLoading === 'export' ? 'Exportando...' : 'Exportar'}
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<FiTrash2 />}
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!!actionLoading}
                  className="bg-accent-red hover:bg-accent-red/80"
                >
                  Deletar Selecionados
                </Button>
              </div>
            </div>
          )}
        </div>
      </AnimatedCard>

      {/* Dialog de Confirmação */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <AnimatedCard className="classical-card p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-amber rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle className="w-8 h-8 text-theme-primary" />
              </div>

              <h3 className="text-xl font-bold text-theme-primary mb-2">
                Confirmar Exclusão
              </h3>

              <p className="text-theme-secondary mb-6">
                Tem certeza que deseja deletar{' '}
                <strong>{selectedDates.size}</strong> arquivo(s) de log?
                <br />
                <span className="text-accent-red text-sm mt-2 block">
                  Esta ação não pode ser desfeita!
                </span>
              </p>

              <div className="flex items-center space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowConfirmDialog(false)}
                  disabled={!!actionLoading}
                  className="flex-1"
                >
                  Cancelar
                </Button>

                <Button
                  variant="primary"
                  leftIcon={
                    actionLoading === 'delete' ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiTrash2 />
                    )
                  }
                  onClick={handleDeleteSelected}
                  disabled={!!actionLoading}
                  className="flex-1 bg-accent-red hover:bg-accent-red/80"
                >
                  {actionLoading === 'delete' ? 'Deletando...' : 'Deletar'}
                </Button>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
}
