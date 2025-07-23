// app/admin/newsletter/components/CreateCampaignModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiSend,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiEye,
  FiSave,
  FiRefreshCw,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import {
  getAllEmailTemplates,
  previewTemplate,
} from '@/app/libs/newsletter/emailTemplates2';
import Modal from '@/app/components/Modal';

interface CreateCampaignModalProps {
  onClose: () => void;
  onSuccess: (campaign: any) => void;
  editCampaign?: any;
}

interface CampaignForm {
  name: string;
  subject: string;
  templateId: string;
  templateType: string;
  customContent?: string;
  scheduledAt?: string;
  targetSegments?: any;
  status: 'DRAFT' | 'SCHEDULED';
}

export default function CreateCampaignModal({
  onClose,
  onSuccess,
  editCampaign,
}: CreateCampaignModalProps) {
  const { templates, createCampaign, updateCampaign, fetchTemplates } =
    useNewsletterAdmin();

  const [form, setForm] = useState<CampaignForm>({
    name: '',
    subject: '',
    templateId: '',
    templateType: 'WEEKLY_DIGEST',
    status: 'DRAFT',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const emailTemplates = getAllEmailTemplates();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (editCampaign) {
      setForm({
        name: editCampaign.name,
        subject: editCampaign.subject,
        templateId: editCampaign.templateId,
        templateType: editCampaign.template?.type || 'WEEKLY_DIGEST',
        customContent: editCampaign.customContent,
        scheduledAt: editCampaign.scheduledAt
          ? new Date(editCampaign.scheduledAt).toISOString().slice(0, 16)
          : undefined,
        status: editCampaign.status,
      });
    }
  }, [editCampaign]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const campaignData = {
        ...form,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null,
      };

      let result;
      if (editCampaign) {
        result = await updateCampaign(editCampaign.id, campaignData);
      } else {
        result = await createCampaign(campaignData);
      }

      onSuccess(result);
    } catch (error: any) {
      console.error('Erro ao salvar campanha:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    const preview = previewTemplate(form.templateType);
    if (preview) {
      setPreviewData(preview);
      setShowPreview(true);
    }
  };

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: FiFileText },
    { id: 2, title: 'Template e Conteúdo', icon: FiEye },
    { id: 3, title: 'Agendamento', icon: FiCalendar },
    { id: 4, title: 'Segmentação', icon: FiUsers },
  ];

  return (
    <Modal isOpen onClose={onClose} maxWidth="4xl">
      <div className=" rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
          <h2 className="text-xl font-bold text-theme-primary">
            {editCampaign ? 'Editar Campanha' : 'Nova Campanha'}
          </h2>
          <button
            onClick={onClose}
            className="text-theme-tertiary hover:text-theme-primary transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 py-4 border-b border-theme-secondary">
          <div className="flex items-center space-x-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                  currentStep === step.id
                    ? 'bg-brand-primary text-white'
                    : currentStep > step.id
                    ? 'bg-green-700 text-white'
                    : 'bg-theme-secondary text-theme-tertiary'
                }`}
                onClick={() => setCurrentStep(step.id)}
              >
                <step.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Informações Básicas */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Nome da Campanha *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="input-classical-2 w-full"
                  placeholder="Ex: Newsletter Semanal - Janeiro 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Assunto do Email *
                </label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, subject: e.target.value }))
                  }
                  className="input-classical-2 w-full"
                  placeholder="Ex: 🎼 Descobertas musicais desta semana"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Status da Campanha
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      status: e.target.value as any,
                    }))
                  }
                  className="input-classical-2 w-full"
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="SCHEDULED">Agendada</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Template e Conteúdo */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Tipo de Template *
                </label>
                <select
                  value={form.templateType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      templateType: e.target.value,
                    }))
                  }
                  className="input-classical-2 w-full"
                >
                  {emailTemplates.map(({ type, template }) => (
                    <option key={type} value={type}>
                      {template.description}
                    </option>
                  ))}
                </select>
              </div>

              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Template Personalizado (Opcional)
                  </label>
                  <select
                    value={form.templateId}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        templateId: e.target.value,
                      }))
                    }
                    className="input-classical-2 w-full"
                  >
                    <option value="">Usar template padrão</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {form.templateType === 'CAMPAIGN_CUSTOM' && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Conteúdo Personalizado (HTML)
                  </label>
                  <textarea
                    value={form.customContent || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        customContent: e.target.value,
                      }))
                    }
                    className="input-classical-2 w-full h-40"
                    placeholder="Digite o conteúdo HTML personalizado..."
                  />
                </div>
              )}

              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  leftIcon={<FiEye />}
                  onClick={handlePreview}
                >
                  Preview Template
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Agendamento */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="p-4 bg-theme-secondary rounded-lg">
                <h3 className="font-medium text-theme-primary mb-2">
                  Opções de Envio
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="sendOption"
                      checked={!form.scheduledAt}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          scheduledAt: undefined,
                          status: 'DRAFT',
                        }))
                      }
                      className="text-brand-primary"
                    />
                    <span>
                      Salvar como rascunho (enviar manualmente depois)
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="sendOption"
                      checked={!!form.scheduledAt}
                      onChange={() =>
                        setForm((prev) => ({ ...prev, status: 'SCHEDULED' }))
                      }
                      className="text-brand-primary"
                    />
                    <span>Agendar envio automático</span>
                  </label>
                </div>
              </div>

              {form.status === 'SCHEDULED' && (
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Data e Hora do Envio *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt || ''}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        scheduledAt: e.target.value,
                      }))
                    }
                    className="input-classical-2 w-full"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-sm text-theme-tertiary mt-1">
                    A campanha será enviada automaticamente na data e hora
                    especificadas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Segmentação */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="p-4 bg-theme-secondary rounded-lg">
                <h3 className="font-medium text-theme-primary mb-2">
                  Segmentação de Audiência
                </h3>
                <p className="text-sm text-theme-tertiary mb-4">
                  Por padrão, a campanha será enviada para todos os subscribers
                  ativos.
                </p>

                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="rounded border-theme-primary text-brand-primary"
                    />
                    <span>Apenas novos subscribers (últimos 30 dias)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="rounded border-theme-primary text-brand-primary"
                    />
                    <span>Subscribers com alto engajamento</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      className="rounded border-theme-primary text-brand-primary"
                    />
                    <span>Específicos interesses musicais</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                <h4 className="font-medium text-accent-blue mb-2">
                  📊 Estimativa de Alcance
                </h4>
                <p className="text-sm text-accent-blue/80">
                  Com as configurações atuais, esta campanha será enviada para
                  aproximadamente <strong>todos os subscribers ativos</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-theme-secondary">
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Anterior
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>

            {currentStep < steps.length ? (
              <Button
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={
                  (currentStep === 1 && (!form.name || !form.subject)) ||
                  (currentStep === 2 && !form.templateType) ||
                  (currentStep === 3 &&
                    form.status === 'SCHEDULED' &&
                    !form.scheduledAt)
                }
              >
                Próximo
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon={<FiSave />}
                onClick={handleSubmit}
                disabled={saving || !form.name || !form.subject}
              >
                {saving ? (
                  <>
                    <FiRefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : editCampaign ? (
                  'Atualizar Campanha'
                ) : (
                  'Criar Campanha'
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <Modal isOpen onClose={() => setShowPreview(false)} maxWidth="4xl">
          <div className="bg-theme-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
              <h3 className="text-lg font-bold text-theme-primary">
                Preview do Template
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="mb-4">
                <h4 className="font-medium text-theme-primary mb-2">
                  Assunto:
                </h4>
                <p className="text-theme-secondary bg-theme-secondary px-3 py-2 rounded">
                  {previewData.subject}
                </p>
              </div>

              <div className="border border-theme-secondary rounded-lg overflow-hidden">
                <div
                  dangerouslySetInnerHTML={{ __html: previewData.html }}
                  className="bg-white"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
