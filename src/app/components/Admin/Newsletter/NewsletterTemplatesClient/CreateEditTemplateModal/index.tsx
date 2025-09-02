// app/components/Admin/Newsletter/CreateEditTemplateModal.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiCode,
  FiFileText,
  FiSettings,
  FiAlertCircle,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Modal from '@/app/components/Modal';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import {
  getAllEmailTemplates,
  extractVariables,
  previewTemplateSync,
} from '@/app/libs/newsletter/emailTemplates';

interface CreateEditTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (template: any) => void;
  template?: any; // Para edição
}

const templateTypeOptions = [
  { value: 'WELCOME', label: 'Boas-vindas' },
  { value: 'ACCOUNT_CONFIRMATION', label: 'Confirmação de Conta' },
  { value: 'PASSWORD_RESET', label: 'Reset de Senha' },
  { value: 'WEEKLY_DIGEST', label: 'Digest Semanal' },
  { value: 'NEW_COMPOSER', label: 'Novo Compositor' },
  { value: 'CAMPAIGN_CUSTOM', label: 'Campanha Customizada' },
];

interface TemplateForm {
  name: string;
  type: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  description: string;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  isActive: boolean;
  isDefault: boolean;
  variables: string[];
}

export default function CreateEditTemplateModal({
  isOpen,
  onClose,
  onSuccess,
  template,
}: CreateEditTemplateModalProps) {
  const { createTemplate, updateTemplate } = useNewsletterAdmin();
  const isEditing = !!template;

  const [form, setForm] = useState<TemplateForm>({
    name: '',
    type: 'CAMPAIGN_CUSTOM',
    subject: '',
    htmlContent: '',
    textContent: '',
    description: '',
    senderName: 'Opus Atlas',
    senderEmail: 'noreply@classicalhub.com',
    replyToEmail: '',
    isActive: true,
    isDefault: false,
    variables: [],
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const builtInTemplates = getAllEmailTemplates();

  useEffect(() => {
    if (template) {
      setForm({
        name: template.name,
        type: template.type,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        description: template.description || '',
        senderName: template.senderName || 'Opus Atlas',
        senderEmail: template.senderEmail || 'noreply@classicalhub.com',
        replyToEmail: template.replyToEmail || '',
        isActive: template.isActive,
        isDefault: template.isDefault,
        variables: template.variables || [],
      });
    }
  }, [template]);

  const handleInputChange = (field: keyof TemplateForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Limpar erro quando usuário digita
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }

    // Auto-extrair variáveis quando conteúdo muda
    if (
      field === 'htmlContent' ||
      field === 'textContent' ||
      field === 'subject'
    ) {
      const allContent = `${
        field === 'htmlContent' ? value : form.htmlContent
      } ${field === 'textContent' ? value : form.textContent} ${
        field === 'subject' ? value : form.subject
      }`;
      const extractedVars = extractVariables(allContent);
      setForm((prev) => ({ ...prev, variables: extractedVars }));
    }
  };

  const loadBuiltInTemplate = (templateType: string) => {
    const builtIn = builtInTemplates.find((t) => t.type === templateType);
    if (builtIn) {
      setForm((prev) => ({
        ...prev,
        subject: builtIn.template.subject,
        htmlContent: builtIn.template.htmlContent,
        textContent: builtIn.template.textContent,
        variables: builtIn.template.variables,
        description: builtIn.template.description,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (form.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!form.subject.trim()) {
      newErrors.subject = 'Assunto é obrigatório';
    }

    if (!form.htmlContent.trim()) {
      newErrors.htmlContent = 'Conteúdo HTML é obrigatório';
    }

    if (!form.senderEmail.trim()) {
      newErrors.senderEmail = 'Email do remetente é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.senderEmail)) {
      newErrors.senderEmail = 'Email do remetente inválido';
    }

    if (
      form.replyToEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.replyToEmail)
    ) {
      newErrors.replyToEmail = 'Email de resposta inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = () => {
    // Tentar usar preview built-in se for template conhecido
    if (
      Object.keys(builtInTemplates.find((t) => t.type === form.type) || {})
        .length > 0
    ) {
      const preview = previewTemplateSync(form.type);
      if (preview) {
        setPreviewData(preview);
        setShowPreview(true);
        return;
      }
    }

    // Preview customizado
    setPreviewData({
      html: form.htmlContent,
      text: form.textContent,
      subject: form.subject,
    });
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);

    try {
      const templateData = {
        name: form.name.trim(),
        type: form.type,
        subject: form.subject.trim(),
        htmlContent: form.htmlContent.trim(),
        textContent: form.textContent.trim(),
        description: form.description.trim() || undefined,
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
        replyToEmail: form.replyToEmail.trim() || undefined,
        isActive: form.isActive,
        isDefault: form.isDefault,
        variables: form.variables,
      };

      let result;
      if (isEditing) {
        result = await updateTemplate(template.id, templateData);
      } else {
        result = await createTemplate(templateData);
      }

      onSuccess(result);
    } catch (error: any) {
      console.error('Erro ao salvar template:', error);
      setErrors({ submit: error.message || 'Erro ao salvar template' });
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    { id: 1, title: 'Informações Básicas', icon: FiFileText },
    { id: 2, title: 'Conteúdo', icon: FiCode },
    { id: 3, title: 'Configurações', icon: FiSettings },
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        maxWidth="5xl"
        confirmOnClose
        withouVerification
      >
        <div className="rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
            <h2 className="text-xl font-bold text-theme-primary">
              {isEditing ? 'Editar Template' : 'Novo Template'}
            </h2>
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
                    Nome do Template *
                  </label>
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Newsletter Semanal Personalizada"
                    error={errors.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Tipo do Template *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="input-classical-2 w-full"
                  >
                    {templateTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {form.type !== 'CAMPAIGN_CUSTOM' && (
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<FiCode />}
                        onClick={() => loadBuiltInTemplate(form.type)}
                      >
                        Carregar template built-in como base
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Assunto do Email *
                  </label>
                  <Input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      handleInputChange('subject', e.target.value)
                    }
                    placeholder="Ex: 🎼 Sua dose semanal de música clássica"
                    error={errors.subject}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Descreva o propósito deste template..."
                    rows={3}
                    className="input-classical-2 w-full resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Conteúdo */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Conteúdo HTML *
                  </label>
                  <textarea
                    value={form.htmlContent}
                    onChange={(e) =>
                      handleInputChange('htmlContent', e.target.value)
                    }
                    placeholder="<h2>Olá {{firstName}}!</h2><p>Bem-vindo ao nosso site...</p>"
                    rows={12}
                    className="input-classical-2 w-full font-mono text-sm resize-none"
                  />
                  {errors.htmlContent && (
                    <p className="text-accent-red text-sm mt-1">
                      {errors.htmlContent}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Conteúdo em Texto (alternativa) *
                  </label>
                  <textarea
                    value={form.textContent}
                    onChange={(e) =>
                      handleInputChange('textContent', e.target.value)
                    }
                    placeholder="Olá {{firstName}}! Bem-vindo ao nosso site..."
                    rows={8}
                    className="input-classical-2 w-full font-mono text-sm resize-none"
                  />
                </div>

                {/* Variáveis detectadas */}
                {form.variables.length > 0 && (
                  <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <h4 className="font-medium text-accent-blue mb-2">
                      🔧 Variáveis detectadas ({form.variables.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {form.variables.map((variable) => (
                        <span
                          key={variable}
                          className="px-2 py-1 bg-accent-blue text-white text-xs rounded-full font-mono"
                        >
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
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

            {/* Step 3: Configurações */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Nome do Remetente *
                    </label>
                    <Input
                      type="text"
                      value={form.senderName}
                      onChange={(e) =>
                        handleInputChange('senderName', e.target.value)
                      }
                      placeholder="Opus Atlas"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Email do Remetente *
                    </label>
                    <Input
                      type="email"
                      value={form.senderEmail}
                      onChange={(e) =>
                        handleInputChange('senderEmail', e.target.value)
                      }
                      placeholder="noreply@classicalhub.com"
                      error={errors.senderEmail}
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
                      handleInputChange('replyToEmail', e.target.value)
                    }
                    placeholder="contato@classicalhub.com"
                    error={errors.replyToEmail}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Template Ativo
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Templates ativos podem ser usados em campanhas
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('isActive', !form.isActive)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.isActive ? 'bg-accent-green' : 'bg-theme-secondary'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                    <div>
                      <h4 className="font-medium text-theme-primary">
                        Template Padrão
                      </h4>
                      <p className="text-sm text-theme-tertiary">
                        Usado por padrão para este tipo de template
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleInputChange('isDefault', !form.isDefault)
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        form.isDefault
                          ? 'bg-accent-amber'
                          : 'bg-theme-secondary'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          form.isDefault ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-accent-red/10 border border-accent-red/20 rounded-lg">
                    <div className="flex items-center">
                      <FiAlertCircle className="w-5 h-5 text-accent-red mr-2" />
                      <span className="text-accent-red">{errors.submit}</span>
                    </div>
                  </div>
                )}
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
                    (currentStep === 2 && !form.htmlContent)
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
                  disabled={
                    saving || !form.name || !form.subject || !form.htmlContent
                  }
                >
                  {saving
                    ? 'Salvando...'
                    : isEditing
                    ? 'Atualizar Template'
                    : 'Criar Template'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <Modal
          isOpen
          onClose={() => setShowPreview(false)}
          maxWidth="4xl"
          confirmOnClose
          withouVerification
        >
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

              {previewData.text && (
                <div className="mt-6">
                  <h4 className="font-medium text-theme-primary mb-2">
                    Versão em Texto:
                  </h4>
                  <pre className="text-theme-secondary bg-theme-secondary p-4 rounded text-sm whitespace-pre-wrap font-mono">
                    {previewData.text}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
