// app/admin/newsletter/campaigns/EditCampaignModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  FiEdit2,
  FiSettings,
  FiAlertTriangle,
  FiClock,
} from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';

interface EditCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
  onSuccess: () => void;
}

const EditCampaignModal: React.FC<EditCampaignModalProps> = ({
  isOpen,
  onClose,
  campaign,
  onSuccess,
}) => {
  const { templates, fetchTemplates, updateCampaign } = useNewsletterAdmin();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    subject: campaign?.subject || '',
    templateId: campaign?.templateId || '',
    scheduledAt: campaign?.scheduledAt
      ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
      : '',
    senderName: campaign?.senderName || 'Opus Atlas',
    senderEmail: campaign?.senderEmail || 'noreply@opusatlas.com',
    replyToEmail: campaign?.replyToEmail || '',
    customSubject: campaign?.customSubject || '',
    customHtmlContent: campaign?.customHtmlContent || '',
    notes: campaign?.notes || '',
  });

  // Determinar quais campos podem ser editados baseado no status
  const getEditableFields = () => {
    switch (campaign?.status) {
      case 'DRAFT':
        return {
          name: true,
          subject: true,
          templateId: true,
          scheduledAt: true,
          senderName: true,
          senderEmail: true,
          replyToEmail: true,
          customSubject: true,
          customHtmlContent: true,
          notes: true,
        };
      case 'SCHEDULED':
        return {
          name: false,
          subject: false,
          templateId: false,
          scheduledAt: true, // Pode reagendar
          senderName: false,
          senderEmail: false,
          replyToEmail: false,
          customSubject: false,
          customHtmlContent: false,
          notes: true, // Pode adicionar notas
        };
      case 'PAUSED':
        return {
          name: false,
          subject: false,
          templateId: false,
          scheduledAt: true, // Pode reagendar
          senderName: false,
          senderEmail: false,
          replyToEmail: false,
          customSubject: false,
          customHtmlContent: false,
          notes: true,
        };
      case 'CANCELLED':
      case 'FAILED':
        return {
          name: true, // Pode editar para reenviar
          subject: true,
          templateId: true,
          scheduledAt: true,
          senderName: true,
          senderEmail: true,
          replyToEmail: true,
          customSubject: true,
          customHtmlContent: true,
          notes: true,
        };
      default: // SENDING, SENT
        return {
          name: false,
          subject: false,
          templateId: false,
          scheduledAt: false,
          senderName: false,
          senderEmail: false,
          replyToEmail: false,
          customSubject: false,
          customHtmlContent: false,
          notes: true, // Apenas notas podem ser adicionadas
        };
    }
  };

  const editableFields = getEditableFields();

  useEffect(() => {
    if (isOpen && campaign) {
      setFormData({
        name: campaign.name || '',
        subject: campaign.subject || '',
        templateId: campaign.templateId || '',
        scheduledAt: campaign.scheduledAt
          ? new Date(campaign.scheduledAt).toISOString().slice(0, 16)
          : '',
        senderName: campaign.senderName || 'Opus Atlas',
        senderEmail: campaign.senderEmail || 'noreply@opusatlas.com',
        replyToEmail: campaign.replyToEmail || '',
        customSubject: campaign.customSubject || '',
        customHtmlContent: campaign.customHtmlContent || '',
        notes: campaign.notes || '',
      });
      fetchTemplates();
    }
  }, [isOpen, campaign]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (editableFields.name && !formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (editableFields.subject && !formData.subject.trim()) {
      newErrors.subject = 'Assunto é obrigatório';
    }

    if (editableFields.senderEmail && formData.senderEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.senderEmail)) {
        newErrors.senderEmail = 'Email do remetente inválido';
      }
    }

    if (editableFields.replyToEmail && formData.replyToEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.replyToEmail)) {
        newErrors.replyToEmail = 'Email de resposta inválido';
      }
    }

    if (editableFields.scheduledAt && formData.scheduledAt) {
      const scheduledDate = new Date(formData.scheduledAt);
      if (scheduledDate <= new Date()) {
        newErrors.scheduledAt = 'Data deve ser no futuro';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const updateData: any = {};

      // Apenas incluir campos que são editáveis e foram alterados
      Object.keys(editableFields).forEach((field) => {
        if (editableFields[field as keyof typeof editableFields]) {
          if (
            field === 'scheduledAt' &&
            formData[field as keyof typeof formData]
          ) {
            updateData[field] = new Date(
              formData[field as keyof typeof formData] as string
            );
          } else if (
            formData[field as keyof typeof formData] !== campaign[field]
          ) {
            updateData[field] = formData[field as keyof typeof formData];
          }
        }
      });

      // Se a campanha foi cancelada ou falhou, alterar status para DRAFT
      if (campaign.status === 'CANCELLED' || campaign.status === 'FAILED') {
        updateData.status = 'DRAFT';
      }

      const result = await updateCampaign(campaign.id, updateData);

      if (result) {
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      setErrors({ general: 'Erro ao atualizar campanha. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    switch (campaign?.status) {
      case 'DRAFT':
        return {
          icon: FiEdit2,
          color: 'text-accent-blue',
          message: 'Campanha em rascunho - todos os campos podem ser editados',
        };
      case 'SCHEDULED':
        return {
          icon: FiClock,
          color: 'text-accent-purple',
          message:
            'Campanha agendada - apenas data de envio e notas podem ser alteradas',
        };
      case 'PAUSED':
        return {
          icon: FiAlertTriangle,
          color: 'text-accent-amber',
          message: 'Campanha pausada - pode reagendar ou adicionar notas',
        };
      case 'CANCELLED':
      case 'FAILED':
        return {
          icon: FiAlertTriangle,
          color: 'text-accent-red',
          message: 'Campanha pode ser editada para reenvio',
        };
      case 'SENT':
        return {
          icon: FiSettings,
          color: 'text-accent-green',
          message: 'Campanha enviada - apenas notas podem ser adicionadas',
        };
      default:
        return {
          icon: FiSettings,
          color: 'text-theme-tertiary',
          message: 'Edição limitada baseada no status da campanha',
        };
    }
  };

  const statusInfo = getStatusMessage();

  if (!campaign) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiEdit2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Editar Campanha
          </h2>
          <p className="text-theme-secondary">{campaign.name}</p>
        </div>

        {/* Status Info */}
        <div
          className={`bg-theme-secondary p-4 rounded-lg flex items-center space-x-3 ${statusInfo.color}`}
        >
          <statusInfo.icon className="w-5 h-5" />
          <span className="text-sm">{statusInfo.message}</span>
        </div>

        {errors.general && (
          <div className="bg-accent-red/10 border border-accent-red p-4 rounded-lg">
            <p className="text-accent-red text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Nome da Campanha"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={errors.name}
              disabled={loading || !editableFields.name}
              required={editableFields.name}
            />

            <Input
              label="Assunto do Email"
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              error={errors.subject}
              disabled={loading || !editableFields.subject}
              required={editableFields.subject}
            />
          </div>

          {/* Template */}
          {editableFields.templateId && (
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Template
              </label>
              <Select
                options={[
                  { value: '', label: 'Selecione um template' },
                  ...templates.map((template) => ({
                    value: template.id,
                    label: `${template.name} - ${template.subject}`,
                  })),
                ]}
                value={formData.templateId}
                onChange={(e) =>
                  handleInputChange('templateId', e.target.value)
                }
                disabled={loading}
              />
            </div>
          )}

          {/* Agendamento */}
          {editableFields.scheduledAt && (
            <Input
              label="Agendar Envio (opcional)"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
              error={errors.scheduledAt}
              disabled={loading}
              min={new Date().toISOString().slice(0, 16)}
            />
          )}

          {/* Configurações de Remetente */}
          {(editableFields.senderName ||
            editableFields.senderEmail ||
            editableFields.replyToEmail) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                Configurações de Remetente
              </h3>

              <div className="grid md:grid-cols-2 gap-4">
                {editableFields.senderName && (
                  <Input
                    label="Nome do Remetente"
                    type="text"
                    value={formData.senderName}
                    onChange={(e) =>
                      handleInputChange('senderName', e.target.value)
                    }
                    disabled={loading}
                  />
                )}

                {editableFields.senderEmail && (
                  <Input
                    label="Email do Remetente"
                    type="email"
                    value={formData.senderEmail}
                    onChange={(e) =>
                      handleInputChange('senderEmail', e.target.value)
                    }
                    error={errors.senderEmail}
                    disabled={loading}
                  />
                )}
              </div>

              {editableFields.replyToEmail && (
                <Input
                  label="Email para Resposta (opcional)"
                  type="email"
                  value={formData.replyToEmail}
                  onChange={(e) =>
                    handleInputChange('replyToEmail', e.target.value)
                  }
                  error={errors.replyToEmail}
                  disabled={loading}
                />
              )}
            </div>
          )}

          {/* Personalização */}
          {(editableFields.customSubject ||
            editableFields.customHtmlContent) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-theme-primary">
                Personalização
              </h3>

              {editableFields.customSubject && (
                <Input
                  label="Assunto Personalizado (opcional)"
                  type="text"
                  value={formData.customSubject}
                  onChange={(e) =>
                    handleInputChange('customSubject', e.target.value)
                  }
                  placeholder="Sobrescrever assunto do template"
                  disabled={loading}
                />
              )}

              {editableFields.customHtmlContent && (
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Conteúdo HTML Customizado (opcional)
                  </label>
                  <textarea
                    value={formData.customHtmlContent}
                    onChange={(e) =>
                      handleInputChange('customHtmlContent', e.target.value)
                    }
                    placeholder="HTML personalizado para esta campanha"
                    rows={6}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-y font-mono text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Notas */}
          {editableFields.notes && (
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Notas da Campanha (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Observações sobre esta campanha..."
                rows={3}
                disabled={loading}
                className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-none"
              />
            </div>
          )}

          {/* Informações da Campanha */}
          <div className="bg-theme-secondary p-4 rounded-lg">
            <h4 className="font-semibold text-theme-primary mb-3">
              Informações da Campanha
            </h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-theme-tertiary">Status:</span>
                <span
                  className={`ml-2 font-medium ${
                    campaign.status === 'SENT'
                      ? 'text-accent-green'
                      : campaign.status === 'SCHEDULED'
                      ? 'text-accent-purple'
                      : campaign.status === 'DRAFT'
                      ? 'text-accent-blue'
                      : 'text-theme-primary'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
              <div>
                <span className="text-theme-tertiary">Criada em:</span>
                <span className="ml-2 text-theme-primary">
                  {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {campaign.sentAt && (
                <div>
                  <span className="text-theme-tertiary">Enviada em:</span>
                  <span className="ml-2 text-theme-primary">
                    {new Date(campaign.sentAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
              {campaign.template && (
                <div>
                  <span className="text-theme-tertiary">Template:</span>
                  <span className="ml-2 text-theme-primary">
                    {campaign.template.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              leftIcon={<FiEdit2 />}
              className="flex-1"
              disabled={Object.values(editableFields).every((field) => !field)}
            >
              {campaign.status === 'CANCELLED' || campaign.status === 'FAILED'
                ? 'Salvar e Reativar'
                : 'Salvar Alterações'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditCampaignModal;
