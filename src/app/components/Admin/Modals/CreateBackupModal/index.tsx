// app/components/Admin/Modals/CreateBackupModal.tsx
'use client';

import { useState } from 'react';
import {
  FiX,
  FiSave,
  FiDownload,
  FiDatabase,
  FiHardDrive,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';

interface CreateBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (config: BackupConfig) => Promise<void>;
}

interface BackupConfig {
  name: string;
  type: 'full' | 'incremental' | 'differential';
  includeDatabase: boolean;
  includeFiles: boolean;
  compression: boolean;
  encryption: boolean;
  retentionDays: number;
  scheduleType: 'once' | 'daily' | 'weekly' | 'monthly';
  scheduleTime?: string;
}

export default function CreateBackupModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateBackupModalProps) {
  const [config, setConfig] = useState<BackupConfig>({
    name: `Backup_${new Date().toISOString().split('T')[0]}`,
    type: 'full',
    includeDatabase: true,
    includeFiles: true,
    compression: true,
    encryption: false,
    retentionDays: 30,
    scheduleType: 'once',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(config);
      onClose();
    } catch (error) {
      console.error('Erro ao criar backup:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
      <div className="classical-card max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
              <FiDownload className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                Criar Backup
              </h2>
              <p className="text-sm text-theme-tertiary">
                Configure um novo backup do sistema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary">
              Configurações Básicas
            </h3>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Nome do Backup
              </label>
              <Input
                type="text"
                value={config?.name}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, name: e.target.value }))
                }
                className="input-classical-2 w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Tipo de Backup
              </label>
              <Select
                value={config?.type}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    type: e.target.value as any,
                  }))
                }
                options={[
                  { value: 'full', label: 'Completo - Todos os dados' },
                  {
                    value: 'incremental',
                    label: 'Incremental - Apenas alterações',
                  },
                  {
                    value: 'differential',
                    label: 'Diferencial - Mudanças desde o último completo',
                  },
                ]}
                className="input-classical-2 w-full"
              />
            </div>
          </div>

          {/* Content Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary">Conteúdo</h3>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-all cursor-pointer">
                <Input
                  type="checkbox"
                  checked={config?.includeDatabase}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeDatabase: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                />
                <FiDatabase className="w-5 h-5 text-accent-blue" />
                <div>
                  <div className="font-medium text-theme-primary">Database</div>
                  <div className="text-xs text-theme-tertiary">
                    Dados da aplicação
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-theme-secondary rounded-xl hover:bg-theme-primary/50 transition-all cursor-pointer">
                <Input
                  type="checkbox"
                  checked={config?.includeFiles}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      includeFiles: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                />
                <FiHardDrive className="w-5 h-5 text-accent-green" />
                <div>
                  <div className="font-medium text-theme-primary">Arquivos</div>
                  <div className="text-xs text-theme-tertiary">
                    PDFs e uploads
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary">Opções</h3>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-3">
                <Input
                  type="checkbox"
                  checked={config?.compression}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      compression: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                />
                <span className="text-theme-primary">Compressão</span>
              </label>

              <label className="flex items-center space-x-3">
                <Input
                  type="checkbox"
                  checked={config?.encryption}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      encryption: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                />
                <span className="text-theme-primary">Criptografia</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Retenção (dias)
              </label>
              <Input
                type="number"
                value={config?.retentionDays}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    retentionDays: parseInt(e.target.value),
                  }))
                }
                className="input-classical-2 w-full"
                min="1"
                max="365"
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-theme-primary">
              Agendamento
            </h3>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Frequência
              </label>
              <Select
                value={config?.scheduleType}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    scheduleType: e.target.value as any,
                  }))
                }
                options={[
                  { value: 'once', label: 'Executar uma vez' },
                  { value: 'daily', label: 'Diário' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensal' },
                ]}
                className="input-classical-2 w-full"
              />
            </div>

            {config?.scheduleType !== 'once' && (
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Horário
                </label>
                <Input
                  type="time"
                  value={config?.scheduleTime || '03:00'}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      scheduleTime: e.target.value,
                    }))
                  }
                  className="input-classical-2 w-full"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-theme-secondary">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<FiSave />}
              disabled={submitting}
            >
              Criar Backup
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
