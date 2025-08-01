// app/components/Admin/Newsletter/CreateCampaignModal.tsx - VERSÃO ATUALIZADA
'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiEye,
  FiSave,
  FiRefreshCw,
  FiCode,
  FiMail,
  FiStar,
  FiEdit,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Modal from '@/app/components/Modal';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import {
  getAllEmailTemplates,
  previewTemplate,
  processTemplate,
} from '@/app/libs/newsletter/emailTemplates';

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
  useCustomTemplate: boolean;
  customContent?: string;
  customSubject?: string;
  scheduledAt?: string;
  targetSegments?: any;
  status: 'DRAFT' | 'SCHEDULED';
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
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
    useCustomTemplate: false,
    status: 'DRAFT',
    senderName: 'Opus Atlas',
    senderEmail: 'noreply@classicalhub.com',
    replyToEmail: '',
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const emailTemplates = getAllEmailTemplates();

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  useEffect(() => {
    if (editCampaign) {
      setForm({
        name: editCampaign.name,
        subject: editCampaign.subject,
        templateId: editCampaign.templateId || '',
        templateType: editCampaign.template?.type || 'WEEKLY_DIGEST',
        useCustomTemplate: !!editCampaign.templateId,
        customContent: editCampaign.customHtmlContent,
        customSubject: editCampaign.customSubject,
        scheduledAt: editCampaign.scheduledAt
          ? new Date(editCampaign.scheduledAt).toISOString().slice(0, 16)
          : undefined,
        status: editCampaign.status,
        senderName: editCampaign.senderName || 'Opus Atlas',
        senderEmail: editCampaign.senderEmail || 'noreply@classicalhub.com',
        replyToEmail: editCampaign.replyToEmail || '',
      });
    }
  }, [editCampaign]);

  // Buscar template selecionado
  useEffect(() => {
    if (form.templateId) {
      const template = templates.find((t) => t.id === form.templateId);
      setSelectedTemplate(template);

      if (template) {
        // Auto-preencher campos do template
        setForm((prev) => ({
          ...prev,
          subject: prev.customSubject || template.subject,
          senderName: template.senderName || 'Opus Atlas',
          senderEmail: template.senderEmail || 'noreply@classicalhub.com',
          replyToEmail: template.replyToEmail || '',
        }));
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [form.templateId, templates]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const campaignData = {
        name: form.name,
        subject: form.subject,
        templateType: form.templateType,
        templateId: form.useCustomTemplate ? form.templateId : '',
        customHtmlContent: form.customContent,
        customSubject: form.customSubject,
        scheduledAt: form.scheduledAt
          ? new Date(form.scheduledAt).toISOString()
          : null,
        status: form.status,
        senderName: form.senderName,
        senderEmail: form.senderEmail,
        replyToEmail: form.replyToEmail || undefined,
        targetSegments: form.targetSegments,
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
    let preview = null;

    if (form.useCustomTemplate && selectedTemplate) {
      // Preview de template personalizado
      const sampleData = {
        firstName: 'João',
        siteUrl: 'https://classicalhub.com',
        unsubscribeUrl: 'https://classicalhub.com/unsubscribe',
        // ... outros dados de exemplo
      };

      try {
        preview = {
          html: processTemplate(selectedTemplate.htmlContent, sampleData),
          text: processTemplate(selectedTemplate.textContent, sampleData),
          subject: processTemplate(
            form.customSubject || selectedTemplate.subject,
            sampleData
          ),
        };
      } catch (error) {
        console.log(error);
        preview = {
          html: selectedTemplate.htmlContent,
          text: selectedTemplate.textContent,
          subject: form.customSubject || selectedTemplate.subject,
        };
      }
    } else {
      // Preview de template built-in
      preview = previewTemplate(form.templateType);
    }

    if (preview) {
      setPreviewData(preview);
      setShowPreview(true);
    }
  };

  const getTemplateOptions = () => {
    return templates.filter((t) => t.isActive && t.type === form.templateType);
  };

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: FiFileText },
    { id: 2, title: 'Template e Conteúdo', icon: FiEye },
    { id: 3, title: 'Configurações de Envio', icon: FiMail },
    { id: 4, title: 'Agendamento', icon: FiCalendar },
    { id: 5, title: 'Segmentação', icon: FiUsers },
  ];

  return (
    <>
      <Modal
        isOpen
        onClose={onClose}
        maxWidth="4xl"
        confirmOnClose
        withouVerification
      >
        <div className="rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
            <h2 className="text-xl font-bold text-theme-primary">
              {editCampaign ? 'Editar Campanha' : 'Nova Campanha'}
            </h2>
          </div>

          {/* Steps */}
          <div className="px-6 py-4 border-b border-theme-secondary">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg cursor-pointer transition-colors whitespace-nowrap ${
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
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Ex: Newsletter Semanal - Janeiro 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Assunto do Email *
                  </label>
                  <Input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, subject: e.target.value }))
                    }
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
                        templateId: '', // Reset template personalizado
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

                {/* Opção de usar template personalizado */}
                <div className="p-4 bg-theme-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Template Personalizado
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Use um template customizado em vez do template built-in
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          useCustomTemplate: !prev.useCustomTemplate,
                          templateId: '',
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.useCustomTemplate
                          ? 'bg-brand-primary'
                          : 'bg-theme-secondary'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.useCustomTemplate
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {form.useCustomTemplate && (
                    <div className="space-y-4">
                      {getTemplateOptions().length > 0 ? (
                        <div>
                          <label className="block text-sm font-medium text-theme-secondary mb-2">
                            Selecionar Template
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
                            <option value="">Selecione um template...</option>
                            {getTemplateOptions().map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name}
                                {template.isDefault && ' (Padrão)'}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <FiFileText className="w-12 h-12 text-theme-tertiary mx-auto mb-3" />
                          <p className="text-theme-tertiary mb-4">
                            Nenhum template personalizado disponível para o tipo
                            &quot;{form.templateType}&quot;
                          </p>
                          <Button
                            variant="ghost"
                            leftIcon={<FiEdit />}
                            onClick={() =>
                              window.open(
                                '/admin/newsletter/templates',
                                '_blank'
                              )
                            }
                          >
                            Criar Template
                          </Button>
                        </div>
                      )}

                      {selectedTemplate && (
                        <div className="p-4 bg-theme-primary border border-theme-secondary rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h5 className="font-medium text-theme-primary">
                                  {selectedTemplate.name}
                                </h5>
                                {selectedTemplate.isDefault && (
                                  <span className="px-2 py-1 bg-accent-amber/20 text-accent-amber rounded-full text-xs flex items-center">
                                    <FiStar className="w-3 h-3 mr-1" />
                                    Padrão
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-theme-secondary mb-2">
                                {selectedTemplate.description}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-theme-tertiary">
                                <span>📧 {selectedTemplate.subject}</span>
                                <span>
                                  🔧 {selectedTemplate.variables?.length || 0}{' '}
                                  variáveis
                                </span>
                                <span>
                                  📊 {selectedTemplate.timesUsed || 0} usos
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={<FiCode />}
                              onClick={() =>
                                window.open(
                                  `/admin/newsletter/templates?preview=${selectedTemplate.id}`,
                                  '_blank'
                                )
                              }
                            >
                              Ver Template
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Customização de assunto */}
                {form.useCustomTemplate && selectedTemplate && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Assunto Personalizado (opcional)
                    </label>
                    <Input
                      type="text"
                      value={form.customSubject || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          customSubject: e.target.value,
                        }))
                      }
                      placeholder={selectedTemplate.subject}
                    />
                    <p className="text-xs text-theme-tertiary mt-1">
                      Deixe vazio para usar o assunto padrão do template
                    </p>
                  </div>
                )}

                {form.templateType === 'CAMPAIGN_CUSTOM' &&
                  !form.useCustomTemplate && (
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
                        className="input-classical-2 w-full h-40 font-mono text-sm"
                        placeholder="<h2>Olá {{firstName}}!</h2><p>Conteúdo da sua campanha...</p>"
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

            {/* Step 3: Configurações de Envio */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nome do Remetente
                    </label>
                    <Input
                      type="text"
                      value={form.senderName}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          senderName: e.target.value,
                        }))
                      }
                      placeholder="Opus Atlas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Email do Remetente
                    </label>
                    <Input
                      type="email"
                      value={form.senderEmail}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          senderEmail: e.target.value,
                        }))
                      }
                      placeholder="noreply@classicalhub.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Email de Resposta (opcional)
                  </label>
                  <Input
                    type="email"
                    value={form.replyToEmail}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        replyToEmail: e.target.value,
                      }))
                    }
                    placeholder="contato@classicalhub.com"
                  />
                </div>

                {selectedTemplate && (
                  <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <p className="text-sm text-accent-blue">
                      <strong>💡 Configurações do Template:</strong> As
                      configurações acima sobrescreverão as configurações padrão
                      do template selecionado.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Agendamento */}
            {currentStep === 4 && (
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
                    <Input
                      type="datetime-local"
                      value={form.scheduledAt || ''}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          scheduledAt: e.target.value,
                        }))
                      }
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

            {/* Step 5: Segmentação */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="p-4 bg-theme-secondary rounded-lg">
                  <h3 className="font-medium text-theme-primary mb-2">
                    Segmentação de Audiência
                  </h3>
                  <p className="text-sm text-theme-tertiary mb-4">
                    Por padrão, a campanha será enviada para todos os
                    subscribers ativos.
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
                    aproximadamente <strong>todos os subscribers ativos</strong>
                    .
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
                  disabled={saving}
                >
                  Anterior
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>

              {currentStep < steps.length ? (
                <Button
                  variant="primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={
                    (currentStep === 1 && (!form.name || !form.subject)) ||
                    (currentStep === 2 && !form.templateType) ||
                    (currentStep === 4 &&
                      form.status === 'SCHEDULED' &&
                      !form.scheduledAt)
                  }
                >
                  Próximo
                </Button>
              ) : (
                <Button
                  variant="primary"
                  leftIcon={
                    saving ? (
                      <FiRefreshCw className="animate-spin" />
                    ) : (
                      <FiSave />
                    )
                  }
                  onClick={handleSubmit}
                  disabled={saving || !form.name || !form.subject}
                >
                  {saving
                    ? 'Salvando...'
                    : editCampaign
                    ? 'Atualizar Campanha'
                    : 'Criar Campanha'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <Modal isOpen onClose={() => setShowPreview(false)} maxWidth="4xl">
          <div className="bg-theme-primary rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
              <h3 className="text-lg font-bold text-theme-primary">
                Preview da Campanha
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
    </>
  );
}
