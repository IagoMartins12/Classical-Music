// app/admin/newsletter/backup/NewsletterBackupClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiHardDrive,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiDatabase,
  FiShield,
  FiCalendar,
  FiFileText,
  FiUsers,
  FiMail,
  FiCheckCircle,
  FiAlertTriangle,
  FiClock,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { useNewsletterBackup } from '@/app/hooks/admin/useNewsletterBackup';

interface BackupStats {
  totalSubscribers: number;
  totalCampaigns: number;
  totalTemplates: number;
  totalEvents: number;
  lastBackup?: string;
  backupSize?: string;
}

export default function NewsletterBackupClient() {
  const {
    backups,
    loading,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    fetchBackups,
  } = useNewsletterBackup();

  const [stats, setStats] = useState<BackupStats | null>(null);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBackups();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/newsletter/backup/stats');
      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      await createBackup({
        includeSubscribers: true,
        includeCampaigns: true,
        includeTemplates: true,
        includeEvents: true,
        includeSettings: true,
      });
      await fetchBackups();
      await fetchStats();
    } catch (error: any) {
      console.error('Erro ao criar backup:', error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleRestoreFromFile = async () => {
    if (!selectedFile) return;

    if (
      confirm(
        'Tem certeza que deseja restaurar este backup? Isso substituirá todos os dados atuais da newsletter.'
      )
    ) {
      try {
        const formData = new FormData();
        formData.append('backup', selectedFile);

        const response = await fetch('/api/admin/newsletter/backup/restore', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.success) {
          alert('Backup restaurado com sucesso!');
          await fetchStats();
          setSelectedFile(null);
        } else {
          throw new Error(result.error || 'Erro ao restaurar backup');
        }
      } catch (error: any) {
        console.error('Erro ao restaurar backup:', error);
        alert(error.message || 'Erro ao restaurar backup');
      }
    }
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case 'FULL':
        return 'text-accent-green bg-accent-green/10';
      case 'PARTIAL':
        return 'text-accent-blue bg-accent-blue/10';
      case 'SCHEDULED':
        return 'text-accent-purple bg-accent-purple/10';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !stats) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando sistema de backup...
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
                <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiHardDrive className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Backup da Newsletter
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Gerencie backups e restore dos dados da newsletter
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
                      Subscribers
                    </p>
                    <p className="text-3xl font-bold text-theme-primary">
                      {stats.totalSubscribers.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-accent-blue" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Campanhas
                    </p>
                    <p className="text-3xl font-bold text-accent-purple">
                      {stats.totalCampaigns}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center">
                    <FiMail className="w-6 h-6 text-accent-purple" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Templates
                    </p>
                    <p className="text-3xl font-bold text-accent-green">
                      {stats.totalTemplates}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-green/20 rounded-xl flex items-center justify-center">
                    <FiFileText className="w-6 h-6 text-accent-green" />
                  </div>
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Último Backup
                    </p>
                    <p className="text-lg font-bold text-theme-primary">
                      {stats.lastBackup
                        ? new Date(stats.lastBackup).toLocaleDateString('pt-BR')
                        : 'Nunca'}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-accent-amber/20 rounded-xl flex items-center justify-center">
                    <FiCalendar className="w-6 h-6 text-accent-amber" />
                  </div>
                </div>
              </AnimatedCard>
            </div>
          )}

          {/* Backup Actions */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create Backup */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center">
                <FiDownload className="w-5 h-5 mr-2 text-accent-blue" />
                Criar Backup
              </h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-theme-secondary rounded-lg">
                  <h4 className="font-medium text-theme-primary mb-2">
                    O backup incluirá:
                  </h4>
                  <ul className="space-y-2 text-sm text-theme-secondary">
                    <li className="flex items-center">
                      <FiCheckCircle className="w-4 h-4 text-accent-green mr-2" />
                      Todos os subscribers e dados de engajamento
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className="w-4 h-4 text-accent-green mr-2" />
                      Campanhas enviadas e agendadas
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className="w-4 h-4 text-accent-green mr-2" />
                      Templates personalizados
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className="w-4 h-4 text-accent-green mr-2" />
                      Eventos de email (opens, clicks, etc.)
                    </li>
                    <li className="flex items-center">
                      <FiCheckCircle className="w-4 h-4 text-accent-green mr-2" />
                      Configurações do sistema
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-accent-amber/10 border border-accent-amber/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FiAlertTriangle className="w-5 h-5 text-accent-amber flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-accent-amber mb-1">
                        Importante
                      </h4>
                      <p className="text-sm text-accent-amber/80">
                        O processo de backup pode levar alguns minutos
                        dependendo da quantidade de dados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                leftIcon={<FiDownload />}
                onClick={handleCreateBackup}
                disabled={creatingBackup}
                className="w-full"
              >
                {creatingBackup ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Criando Backup...
                  </>
                ) : (
                  'Criar Backup Completo'
                )}
              </Button>
            </AnimatedCard>

            {/* Restore Backup */}
            <AnimatedCard className="classical-card p-6">
              <h3 className="text-xl font-bold text-theme-primary mb-6 flex items-center">
                <FiUpload className="w-5 h-5 mr-2 text-accent-green" />
                Restaurar Backup
              </h3>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FiShield className="w-5 h-5 text-accent-red flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-accent-red mb-1">
                        Atenção
                      </h4>
                      <p className="text-sm text-accent-red/80">
                        Restaurar um backup substituirá TODOS os dados atuais da
                        newsletter. Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Selecionar arquivo de backup (.json ou .zip)
                  </label>
                  <input
                    type="file"
                    accept=".json,.zip"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-brand-primary file:text-white hover:file:bg-brand-secondary"
                  />
                  {selectedFile && (
                    <p className="text-sm text-theme-tertiary mt-2">
                      Arquivo selecionado: {selectedFile.name} (
                      {formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              </div>

              <Button
                variant="secondary"
                leftIcon={<FiUpload />}
                onClick={handleRestoreFromFile}
                disabled={!selectedFile}
                className="w-full"
              >
                Restaurar Backup
              </Button>
            </AnimatedCard>
          </div>

          {/* Backup History */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">
                Histórico de Backups
              </h3>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                }
                onClick={fetchBackups}
                disabled={loading}
              >
                Atualizar
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-theme-primary">
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Data/Hora
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Tipo
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Tamanho
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Dados
                    </th>
                    <th className="text-left py-3 px-2 text-theme-primary font-medium">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backups.map((backup) => (
                    <tr
                      key={backup.id}
                      className="border-b border-theme-secondary hover:bg-theme-secondary/50"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <div className="text-theme-primary font-medium">
                            {new Date(backup.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </div>
                          <div className="text-sm text-theme-tertiary">
                            {new Date(backup.createdAt).toLocaleTimeString(
                              'pt-BR'
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getBackupTypeColor(
                            backup.type
                          )}`}
                        >
                          {backup.type === 'FULL'
                            ? 'Completo'
                            : backup.type === 'PARTIAL'
                            ? 'Parcial'
                            : 'Agendado'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-theme-primary">
                          {backup.fileSize
                            ? formatFileSize(backup.fileSize)
                            : 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm text-theme-secondary">
                          {backup.subscribersCount} subs •{' '}
                          {backup.campaignsCount} camps •{' '}
                          {backup.templatesCount} temps
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiEye />}
                            onClick={() => {
                              /* Modal de detalhes */
                            }}
                            title="Ver detalhes"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiDownload />}
                            onClick={() => downloadBackup(backup.id)}
                            title="Download"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiUpload />}
                            onClick={() => restoreBackup(backup.id)}
                            title="Restaurar"
                            className="text-accent-green hover:text-accent-green"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<FiTrash2 />}
                            onClick={() => deleteBackup(backup.id)}
                            className="text-accent-red hover:text-accent-red"
                            title="Deletar"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {backups.length === 0 && !loading && (
                <div className="text-center py-12">
                  <FiHardDrive className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-theme-primary mb-2">
                    Nenhum backup encontrado
                  </h3>
                  <p className="text-theme-tertiary mb-6">
                    Crie seu primeiro backup para manter os dados seguros
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<FiDownload />}
                    onClick={handleCreateBackup}
                    disabled={creatingBackup}
                  >
                    Criar Primeiro Backup
                  </Button>
                </div>
              )}
            </div>
          </AnimatedCard>
        </AnimatedContainer>
      </div>
    </PageContainer>
  );
}
