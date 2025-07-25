// app/components/Admin/System/BackupMaintenance.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiTrash2,
  FiClock,
  FiHardDrive,
  FiDatabase,
  FiShield,
  FiPlay,
  FiPause,
  FiCheckCircle,
  FiAlertTriangle,
  FiX,
  FiFileText,
  FiArchive,
  FiTool,
  FiZap,
  FiActivity,
  FiEdit,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
  size: string;
  duration: number; // minutes
  createdAt: Date;
  scheduledAt?: Date;
  retentionDays: number;
  includeFiles: boolean;
  includeDatabase: boolean;
  compression: boolean;
  encryption: boolean;
  progress?: number;
  error?: string;
}

interface MaintenanceTask {
  id: string;
  name: string;
  type: 'cleanup' | 'optimization' | 'reindex' | 'vacuum' | 'analyze';
  category: 'database' | 'files' | 'cache' | 'logs';
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRun?: Date;
  nextRun?: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'manual';
  impact: 'low' | 'medium' | 'high';
  estimatedDuration: number; // minutes
  description: string;
  enabled: boolean;
  progress?: number;
}

interface SystemHealth {
  diskSpace: {
    total: number;
    used: number;
    available: number;
    percentage: number;
  };
  database: {
    size: number;
    tables: number;
    indexes: number;
    deadTuples: number;
    fragmentationLevel: number;
  };
  cache: {
    size: number;
    hitRate: number;
    evictions: number;
    memory: number;
  };
  logs: {
    size: number;
    errorCount: number;
    warningCount: number;
    oldestEntry: Date;
  };
}

export default function BackupMaintenance() {
  const [activeTab, setActiveTab] = useState('backups');
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(
    []
  );
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());

  // Mock data
  const mockBackups: BackupJob[] = [
    {
      id: '1',
      name: 'Daily Full Backup',
      type: 'full',
      status: 'completed',
      size: '2.4 GB',
      duration: 45,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      retentionDays: 30,
      includeFiles: true,
      includeDatabase: true,
      compression: true,
      encryption: true,
    },
    {
      id: '2',
      name: 'Incremental Backup',
      type: 'incremental',
      status: 'running',
      size: '156 MB',
      duration: 0,
      createdAt: new Date(),
      retentionDays: 7,
      includeFiles: false,
      includeDatabase: true,
      compression: true,
      encryption: false,
      progress: 67,
    },
    {
      id: '3',
      name: 'Weekly Archive',
      type: 'full',
      status: 'scheduled',
      size: '-',
      duration: 0,
      createdAt: new Date(),
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      retentionDays: 90,
      includeFiles: true,
      includeDatabase: true,
      compression: true,
      encryption: true,
    },
  ];

  const mockMaintenanceTasks: MaintenanceTask[] = [
    {
      id: '1',
      name: 'Database Vacuum',
      type: 'vacuum',
      category: 'database',
      status: 'completed',
      lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 12 * 60 * 60 * 1000),
      frequency: 'daily',
      impact: 'medium',
      estimatedDuration: 15,
      description: 'Remove dead tuples and update statistics',
      enabled: true,
    },
    {
      id: '2',
      name: 'Cache Cleanup',
      type: 'cleanup',
      category: 'cache',
      status: 'pending',
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
      frequency: 'daily',
      impact: 'low',
      estimatedDuration: 5,
      description: 'Clear expired cache entries and optimize memory usage',
      enabled: true,
    },
    {
      id: '3',
      name: 'Log Rotation',
      type: 'cleanup',
      category: 'logs',
      status: 'running',
      lastRun: new Date(),
      frequency: 'weekly',
      impact: 'low',
      estimatedDuration: 10,
      description: 'Archive old logs and maintain size limits',
      enabled: true,
      progress: 34,
    },
    {
      id: '4',
      name: 'Index Rebuild',
      type: 'reindex',
      category: 'database',
      status: 'pending',
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000),
      frequency: 'weekly',
      impact: 'high',
      estimatedDuration: 120,
      description: 'Rebuild fragmented indexes for optimal performance',
      enabled: false,
    },
  ];

  const mockSystemHealth: SystemHealth = {
    diskSpace: {
      total: 500,
      used: 245.6,
      available: 254.4,
      percentage: 49.12,
    },
    database: {
      size: 2.4,
      tables: 28,
      indexes: 156,
      deadTuples: 1247,
      fragmentationLevel: 23.5,
    },
    cache: {
      size: 1.2,
      hitRate: 94.7,
      evictions: 234,
      memory: 512,
    },
    logs: {
      size: 0.8,
      errorCount: 23,
      warningCount: 156,
      oldestEntry: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  };

  useEffect(() => {
    setBackups(mockBackups);
    setMaintenanceTasks(mockMaintenanceTasks);
    setSystemHealth(mockSystemHealth);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-accent-blue bg-accent-blue/10';
      case 'completed':
        return 'text-accent-green bg-accent-green/10';
      case 'failed':
        return 'text-accent-red bg-accent-red/10';
      case 'scheduled':
        return 'text-accent-purple bg-accent-purple/10';
      case 'pending':
        return 'text-accent-amber bg-accent-amber/10';
      case 'paused':
        return 'text-theme-tertiary bg-theme-secondary';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return FiRefreshCw;
      case 'completed':
        return FiCheckCircle;
      case 'failed':
        return FiX;
      case 'scheduled':
        return FiClock;
      case 'pending':
        return FiClock;
      case 'paused':
        return FiPause;
      default:
        return FiClock;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-accent-red';
      case 'medium':
        return 'text-accent-amber';
      case 'low':
        return 'text-accent-green';
      default:
        return 'text-theme-tertiary';
    }
  };

  const handleRunTask = async (taskId: string) => {
    setRunningTasks((prev) => new Set(prev).add(taskId));

    // Simular execução da tarefa
    setTimeout(() => {
      setMaintenanceTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? { ...task, status: 'running', progress: 0 }
            : task
        )
      );

      // Simular progresso
      const progressInterval = setInterval(() => {
        setMaintenanceTasks((prev) =>
          prev.map((task) => {
            if (task.id === taskId) {
              const newProgress = (task.progress || 0) + Math.random() * 20;
              if (newProgress >= 100) {
                clearInterval(progressInterval);
                setRunningTasks((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(taskId);
                  return newSet;
                });
                return {
                  ...task,
                  status: 'completed',
                  progress: 100,
                  lastRun: new Date(),
                };
              }
              return { ...task, progress: newProgress };
            }
            return task;
          })
        );
      }, 1000);
    }, 500);
  };

  const formatFileSize = (gb: number) => {
    if (gb < 1) return `${(gb * 1024).toFixed(1)} MB`;
    return `${gb.toFixed(1)} GB`;
  };

  const renderBackups = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-theme-primary">Backups</h3>
        <Button variant="primary" leftIcon={<FiDownload />}>
          Novo Backup
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-theme-primary">
            Configurações Automáticas
          </h4>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
              <div>
                <p className="font-medium text-theme-primary">Backup Diário</p>
                <p className="text-sm text-theme-tertiary">03:00 AM</p>
              </div>
              <div className="w-8 h-4 bg-accent-green rounded-full flex items-center px-1">
                <div className="w-3 h-3 bg-theme-primary rounded-full ml-auto"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
              <div>
                <p className="font-medium text-theme-primary">Backup Semanal</p>
                <p className="text-sm text-theme-tertiary">Domingo 02:00 AM</p>
              </div>
              <div className="w-8 h-4 bg-accent-green rounded-full flex items-center px-1">
                <div className="w-3 h-3 bg-theme-primary rounded-full ml-auto"></div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-theme-secondary rounded-xl">
              <div>
                <p className="font-medium text-theme-primary">Retenção</p>
                <p className="text-sm text-theme-tertiary">30 dias</p>
              </div>
              <Button variant="ghost" size="sm" leftIcon={<FiEdit />}>
                Editar
              </Button>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="font-medium text-theme-primary mb-4">
            Histórico de Backups
          </h4>

          <div className="space-y-3">
            {backups.map((backup) => {
              const StatusIcon = getStatusIcon(backup.status);
              return (
                <div
                  key={backup.id}
                  className="p-4 bg-theme-secondary rounded-xl"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(
                          backup.status
                        )}`}
                      >
                        <StatusIcon
                          className={`w-5 h-5 ${
                            backup.status === 'running' ? 'animate-spin' : ''
                          }`}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h5 className="font-medium text-theme-primary">
                            {backup.name}
                          </h5>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              backup.status
                            )}`}
                          >
                            {backup.status === 'running'
                              ? 'Executando'
                              : backup.status === 'completed'
                              ? 'Concluído'
                              : backup.status === 'failed'
                              ? 'Falhou'
                              : backup.status === 'scheduled'
                              ? 'Agendado'
                              : 'Pausado'}
                          </span>
                          <span className="text-xs text-theme-tertiary capitalize">
                            {backup.type}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-theme-secondary">
                          <div>Size: {backup.size}</div>
                          <div>
                            Duração:{' '}
                            {backup.duration > 0
                              ? `${backup.duration}min`
                              : '-'}
                          </div>
                          <div>
                            Criado:{' '}
                            {backup.createdAt.toLocaleDateString('pt-BR')}
                          </div>
                          <div>Retenção: {backup.retentionDays}d</div>
                        </div>

                        {backup.progress !== undefined &&
                          backup.status === 'running' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-theme-primary">
                                  Progresso
                                </span>
                                <span className="text-sm font-medium text-accent-blue">
                                  {backup.progress.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-500"
                                  style={{ width: `${backup.progress}%` }}
                                />
                              </div>
                            </div>
                          )}

                        <div className="flex items-center space-x-4 mt-3 text-xs text-theme-tertiary">
                          {backup.includeDatabase && <span>✓ Database</span>}
                          {backup.includeFiles && <span>✓ Files</span>}
                          {backup.compression && <span>✓ Compressed</span>}
                          {backup.encryption && <span>✓ Encrypted</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      {backup.status === 'completed' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiDownload />}
                            title="Download"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiUpload />}
                            title="Restore"
                          />
                        </>
                      )}
                      {backup.status === 'running' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiPause />}
                          title="Pausar"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiTrash2 />}
                        className="text-accent-red hover:bg-accent-red/10"
                        title="Deletar"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMaintenance = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-theme-primary">
          Tarefas de Manutenção
        </h3>
        <Button
          variant="primary"
          leftIcon={<FiTool />}
          onClick={() => console.log('Nova tarefa')}
        >
          Nova Tarefa
        </Button>
      </div>

      <div className="space-y-4">
        {maintenanceTasks.map((task) => {
          const StatusIcon = getStatusIcon(task.status);
          const isRunning =
            runningTasks.has(task.id) || task.status === 'running';

          return (
            <div key={task.id} className="p-4 bg-theme-secondary rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(
                      task.status
                    )}`}
                  >
                    <StatusIcon
                      className={`w-5 h-5 ${isRunning ? 'animate-spin' : ''}`}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-medium text-theme-primary">
                        {task.name}
                      </h5>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status === 'running'
                          ? 'Executando'
                          : task.status === 'completed'
                          ? 'Concluído'
                          : task.status === 'failed'
                          ? 'Falhou'
                          : 'Pendente'}
                      </span>
                      <span
                        className={`text-xs font-medium ${getImpactColor(
                          task.impact
                        )}`}
                      >
                        Impacto{' '}
                        {task.impact === 'high'
                          ? 'Alto'
                          : task.impact === 'medium'
                          ? 'Médio'
                          : 'Baixo'}
                      </span>
                      <span className="text-xs text-theme-tertiary capitalize">
                        {task.frequency === 'daily'
                          ? 'Diário'
                          : task.frequency === 'weekly'
                          ? 'Semanal'
                          : task.frequency === 'monthly'
                          ? 'Mensal'
                          : 'Manual'}
                      </span>
                    </div>

                    <p className="text-sm text-theme-secondary mb-3">
                      {task.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-theme-tertiary">
                      <div>Categoria: {task.category}</div>
                      <div>Duração: ~{task.estimatedDuration}min</div>
                      {task.lastRun && (
                        <div>
                          Última: {task.lastRun.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      {task.nextRun && (
                        <div>
                          Próxima: {task.nextRun.toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>

                    {task.progress !== undefined &&
                      task.status === 'running' && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-theme-primary">
                              Progresso
                            </span>
                            <span className="text-sm font-medium text-accent-blue">
                              {task.progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full transition-all duration-500"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={task.enabled}
                      onChange={() => {
                        setMaintenanceTasks((prev) =>
                          prev.map((t) =>
                            t.id === task.id ? { ...t, enabled: !t.enabled } : t
                          )
                        );
                      }}
                      className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                    />
                    <span className="text-xs text-theme-tertiary">Ativo</span>
                  </div>

                  {task.status !== 'running' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<FiPlay />}
                      onClick={() => handleRunTask(task.id)}
                      disabled={!task.enabled || isRunning}
                    >
                      Executar
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<FiEdit />}
                    title="Editar"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-theme-primary">Saúde do Sistema</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Disk Space */}
        <div className="p-4 bg-theme-secondary rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <FiHardDrive className="w-5 h-5 text-accent-blue" />
            <h4 className="font-medium text-theme-primary">Espaço em Disco</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Usado</span>
              <span className="font-medium text-theme-primary">
                {formatFileSize(systemHealth?.diskSpace.used || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Total</span>
              <span className="font-medium text-theme-primary">
                {formatFileSize(systemHealth?.diskSpace.total || 0)}
              </span>
            </div>
            <div className="w-full bg-theme-primary h-2 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
                style={{ width: `${systemHealth?.diskSpace.percentage}%` }}
              />
            </div>
            <div className="text-xs text-center text-theme-tertiary">
              {systemHealth?.diskSpace.percentage.toFixed(1)}% usado
            </div>
          </div>
        </div>

        {/* Database */}
        <div className="p-4 bg-theme-secondary rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <FiDatabase className="w-5 h-5 text-accent-green" />
            <h4 className="font-medium text-theme-primary">Database</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Size</span>
              <span className="font-medium text-theme-primary">
                {formatFileSize(systemHealth?.database.size || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Tables</span>
              <span className="font-medium text-theme-primary">
                {systemHealth?.database.tables}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Dead Tuples</span>
              <span className="font-medium text-accent-amber">
                {systemHealth?.database.deadTuples}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Fragmentação</span>
              <span
                className={`font-medium ${
                  (systemHealth?.database.fragmentationLevel || 0) > 30
                    ? 'text-accent-red'
                    : (systemHealth?.database.fragmentationLevel || 0) > 15
                    ? 'text-accent-amber'
                    : 'text-accent-green'
                }`}
              >
                {systemHealth?.database.fragmentationLevel.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Cache */}
        <div className="p-4 bg-theme-secondary rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <FiZap className="w-5 h-5 text-accent-purple" />
            <h4 className="font-medium text-theme-primary">Cache</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Size</span>
              <span className="font-medium text-theme-primary">
                {formatFileSize(systemHealth?.cache.size || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Hit Rate</span>
              <span className="font-medium text-accent-green">
                {systemHealth?.cache.hitRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Evictions</span>
              <span className="font-medium text-theme-primary">
                {systemHealth?.cache.evictions}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Memory</span>
              <span className="font-medium text-theme-primary">
                {systemHealth?.cache.memory}MB
              </span>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="p-4 bg-theme-secondary rounded-xl">
          <div className="flex items-center space-x-2 mb-3">
            <FiFileText className="w-5 h-5 text-accent-amber" />
            <h4 className="font-medium text-theme-primary">Logs</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Size</span>
              <span className="font-medium text-theme-primary">
                {formatFileSize(systemHealth?.logs.size || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Errors</span>
              <span className="font-medium text-accent-red">
                {systemHealth?.logs.errorCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Warnings</span>
              <span className="font-medium text-accent-amber">
                {systemHealth?.logs.warningCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-theme-secondary">Oldest</span>
              <span className="font-medium text-theme-primary">
                {systemHealth?.logs.oldestEntry.toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="p-6 bg-theme-secondary rounded-xl">
        <h4 className="font-medium text-theme-primary mb-4 flex items-center space-x-2">
          <FiActivity className="w-5 h-5 text-accent-blue" />
          <span>Recomendações</span>
        </h4>

        <div className="space-y-3">
          {systemHealth?.database.fragmentationLevel &&
            systemHealth.database.fragmentationLevel > 20 && (
              <div className="flex items-start space-x-3 p-3 bg-accent-amber/10 border border-accent-amber rounded-lg">
                <FiAlertTriangle className="w-5 h-5 text-accent-amber mt-0.5" />
                <div>
                  <p className="font-medium text-theme-primary">
                    Alta Fragmentação da Database
                  </p>
                  <p className="text-sm text-theme-secondary">
                    Execute VACUUM e REINDEX para otimizar performance
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleRunTask('1')}
                  >
                    Executar Vacuum
                  </Button>
                </div>
              </div>
            )}

          {systemHealth?.logs.size && systemHealth.logs.size > 1 && (
            <div className="flex items-start space-x-3 p-3 bg-accent-blue/10 border border-accent-blue rounded-lg">
              <FiFileText className="w-5 h-5 text-accent-blue mt-0.5" />
              <div>
                <p className="font-medium text-theme-primary">Logs Grandes</p>
                <p className="text-sm text-theme-secondary">
                  Execute rotação de logs para liberar espaço
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleRunTask('3')}
                >
                  Rotacionar Logs
                </Button>
              </div>
            </div>
          )}

          {systemHealth?.cache.hitRate && systemHealth.cache.hitRate < 90 && (
            <div className="flex items-start space-x-3 p-3 bg-accent-purple/10 border border-accent-purple rounded-lg">
              <FiZap className="w-5 h-5 text-accent-purple mt-0.5" />
              <div>
                <p className="font-medium text-theme-primary">
                  Hit Rate do Cache Baixo
                </p>
                <p className="text-sm text-theme-secondary">
                  Considere aumentar o tamanho do cache ou revisar estratégias
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => handleRunTask('2')}
                >
                  Limpar Cache
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'backups', label: 'Backups', icon: FiArchive },
    { id: 'maintenance', label: 'Manutenção', icon: FiTool },
    { id: 'health', label: 'Saúde do Sistema', icon: FiActivity },
  ];

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-green rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiShield className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Backup & Manutenção
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Proteção de dados e otimização do sistema
            </p>
          </div>
        </AnimatedItem>

        {/* Tabs */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-wrap gap-2 mb-8 p-2 bg-theme-elevated rounded-2xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-lg'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </AnimatedItem>

        {/* Content */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard className="classical-card p-8">
            {activeTab === 'backups' && renderBackups()}
            {activeTab === 'maintenance' && renderMaintenance()}
            {activeTab === 'health' && renderSystemHealth()}
          </AnimatedCard>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
