// app/components/Admin/Modals/CreateReportModal.tsx
('use client');

import { useState } from 'react';
import { FiX, FiSave, FiFileText } from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import {
  MetricDefinition,
  ReportTemplate,
} from '@/app/hooks/admin/useAdminReports';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (template: Partial<ReportTemplate>) => Promise<void>;
  metrics: MetricDefinition[];
  editingTemplate?: ReportTemplate | null;
}

export default function CreateReportModal({
  isOpen,
  onClose,
  onSubmit,
  metrics,
  editingTemplate,
}: CreateReportModalProps) {
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    name: editingTemplate?.name || '',
    description: editingTemplate?.description || '',
    category: editingTemplate?.category || 'users',
    type: editingTemplate?.type || 'export',
    isPublic: editingTemplate?.isPublic || false,
    config: editingTemplate?.config || {
      metrics: [],
      filters: {},
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
        preset: 'last30days',
      },
      visualization: 'mixed',
      groupBy: [],
      limit: 100,
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(template);
      onClose();
    } catch (error) {
      console.error('Erro ao criar template:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const updateConfig = (field: string, value: any) => {
    setTemplate((prev) => ({
      ...prev,
      config: {
        ...prev.config!,
        [field]: value,
      },
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-theme-overlay backdrop-blur-sm flex items-center justify-center p-4">
      <div className="classical-card max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
              <FiFileText className="w-5 h-5 text-theme-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                {editingTemplate
                  ? 'Editar Template'
                  : 'Criar Template de Relatório'}
              </h2>
              <p className="text-sm text-theme-tertiary">
                Configure um novo template personalizado
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-theme-primary">
                Informações Básicas
              </h3>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Nome do Template
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) =>
                    setTemplate((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-classical-2 w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Descrição
                </label>
                <textarea
                  value={template.description}
                  onChange={(e) =>
                    setTemplate((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="input-classical-2 w-full h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Categoria
                  </label>
                  <Select
                    value={template.category}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        category: e.target.value as any,
                      }))
                    }
                    options={[
                      { value: 'users', label: 'Usuários' },
                      { value: 'content', label: 'Conteúdo' },
                      { value: 'performance', label: 'Performance' },
                      { value: 'custom', label: 'Personalizado' },
                    ]}
                    className="input-classical-2 w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Tipo
                  </label>
                  <Select
                    value={template.type}
                    onChange={(e) =>
                      setTemplate((prev) => ({
                        ...prev,
                        type: e.target.value as any,
                      }))
                    }
                    options={[
                      { value: 'dashboard', label: 'Dashboard' },
                      { value: 'export', label: 'Exportar' },
                      { value: 'scheduled', label: 'Agendado' },
                    ]}
                    className="input-classical-2 w-full"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={template.isPublic}
                  onChange={(e) =>
                    setTemplate((prev) => ({
                      ...prev,
                      isPublic: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                />
                <span className="text-theme-primary">
                  Template público (visível para outros admins)
                </span>
              </label>
            </div>

            {/* Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-theme-primary">
                Configuração
              </h3>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Métricas
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {metrics
                    .filter((m) => m.available)
                    .map((metric) => (
                      <label
                        key={metric.id}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={template.config?.metrics.includes(metric.id)}
                          onChange={(e) => {
                            const currentMetrics =
                              template.config?.metrics || [];
                            if (e.target.checked) {
                              updateConfig('metrics', [
                                ...currentMetrics,
                                metric.id,
                              ]);
                            } else {
                              updateConfig(
                                'metrics',
                                currentMetrics.filter((m) => m !== metric.id)
                              );
                            }
                          }}
                          className="w-4 h-4 text-brand-primary bg-theme-secondary border-theme-primary rounded focus:ring-brand-primary focus:ring-2"
                        />
                        <div>
                          <div className="text-sm font-medium text-theme-primary">
                            {metric.name}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {metric.description}
                          </div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Período
                </label>
                <Select
                  value={template.config?.dateRange.preset}
                  onChange={(e) =>
                    updateConfig('dateRange', {
                      ...template.config?.dateRange,
                      preset: e.target.value,
                    })
                  }
                  options={[
                    { value: 'last7days', label: 'Últimos 7 dias' },
                    { value: 'last30days', label: 'Últimos 30 dias' },
                    { value: 'last90days', label: 'Últimos 90 dias' },
                    { value: 'custom', label: 'Personalizado' },
                  ]}
                  className="input-classical-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Visualização
                </label>
                <Select
                  value={template.config?.visualization}
                  onChange={(e) =>
                    updateConfig('visualization', e.target.value)
                  }
                  options={[
                    { value: 'chart', label: 'Gráficos' },
                    { value: 'table', label: 'Tabela' },
                    { value: 'cards', label: 'Cards' },
                    { value: 'mixed', label: 'Misto' },
                  ]}
                  className="input-classical-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Limite de Resultados
                </label>
                <input
                  type="number"
                  value={template.config?.limit}
                  onChange={(e) =>
                    updateConfig('limit', parseInt(e.target.value))
                  }
                  className="input-classical-2 w-full"
                  min="10"
                  max="1000"
                />
              </div>
            </div>
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
              disabled={
                submitting || !template.name || !template.config?.metrics.length
              }
            >
              {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
