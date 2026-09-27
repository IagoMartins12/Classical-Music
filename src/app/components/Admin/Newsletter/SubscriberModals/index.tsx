// app/components/Admin/Newsletter/SubscriberModals.tsx
'use client';

import React, { useState } from 'react';
import {
  PiChartBar,
  PiNotePencil,
  PiPaperPlaneRight,
  PiUser,
} from 'react-icons/pi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { Stack } from '@/app/components/ui/Layout';

// Modal de Detalhes do Subscriber
interface SubscriberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: any;
}

export const SubscriberDetailsModal: React.FC<SubscriberDetailsModalProps> = ({
  isOpen,
  onClose,
  subscriber,
}) => {
  if (!subscriber) return null;

  const getEngagementLevel = (score: number) => {
    if (score >= 75) return { label: 'Alto', color: '' };
    if (score >= 50) return { label: 'Médio', color: '' };
    if (score >= 25) return { label: 'Baixo', color: '' };
    return { label: 'Nenhum', color: 'text-theme-tertiary bg-theme-secondary' };
  };

  const engagement = getEngagementLevel(subscriber.avgEngagementScore || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <Stack gap={6}>
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <PiUser className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Detalhes do Subscriber
          </h2>
          <p className="text-theme-secondary">{subscriber.email}</p>
        </div>

        {/* Informações Básicas */}
        <div className="grid md:grid-cols-2 gap-6">
          <Stack className="bg-theme-secondary p-6 rounded-lg">
            <h3 className="font-bold text-theme-primary flex items-center">
              <PiUser className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h3>
            <Stack gap={3}>
              <div>
                <label className="text-sm text-theme-tertiary">Nome</label>
                <p className="font-medium text-theme-primary">
                  {subscriber.firstName || subscriber.lastName
                    ? `${subscriber.firstName || ''} ${
                        subscriber.lastName || ''
                      }`.trim()
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <label className="text-sm text-theme-tertiary">Status</label>
                <p
                  className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${
                    subscriber.status === 'ACTIVE'
                      ? ''
                      : subscriber.status === 'PENDING'
                        ? ''
                        : ''
                  }`}
                >
                  {subscriber.status === 'ACTIVE'
                    ? 'Ativo'
                    : subscriber.status === 'PENDING'
                      ? 'Pendente'
                      : subscriber.status === 'UNSUBSCRIBED'
                        ? 'Cancelado'
                        : subscriber.status}
                </p>
              </div>
              <div>
                <label className="text-sm text-theme-tertiary">
                  Data de Inscrição
                </label>
                <p className="font-medium text-theme-primary">
                  {new Date(subscriber.subscribedAt).toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-theme-tertiary">
                  Frequência
                </label>
                <p className="font-medium text-theme-primary capitalize">
                  {subscriber.frequency || 'weekly'}
                </p>
              </div>
            </Stack>
          </Stack>

          <Stack className="bg-theme-secondary p-6 rounded-lg">
            <h3 className="font-bold text-theme-primary flex items-center">
              <PiChartBar className="w-5 h-5 mr-2" />
              Engajamento
            </h3>
            <Stack gap={3}>
              <div>
                <label className="text-sm text-theme-tertiary">Nível</label>
                <p
                  className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${engagement.color}`}
                >
                  {engagement.label} (
                  {(subscriber.avgEngagementScore || 0).toFixed(1)}%)
                </p>
              </div>
              <div>
                <label className="text-sm text-theme-tertiary">
                  Emails Abertos
                </label>
                <p className="font-medium text-theme-primary">
                  {subscriber.emailOpenCount || 0}
                </p>
              </div>
              <div>
                <label className="text-sm text-theme-tertiary">
                  Links Clicados
                </label>
                <p className="font-medium text-theme-primary">
                  {subscriber.emailClickCount || 0}
                </p>
              </div>
              <div>
                <label className="text-sm text-theme-tertiary">
                  Último Email Aberto
                </label>
                <p className="font-medium text-theme-primary">
                  {subscriber.lastEmailOpenedAt
                    ? new Date(subscriber.lastEmailOpenedAt).toLocaleDateString(
                        'pt-BR'
                      )
                    : 'Nunca'}
                </p>
              </div>
            </Stack>
          </Stack>
        </div>

        {/* Interesses e Preferências */}
        <Stack className="bg-theme-secondary p-6 rounded-lg">
          <h3 className="font-bold text-theme-primary">
            Interesses e Preferências
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-theme-tertiary">Interesses</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {subscriber.interests && subscriber.interests.length > 0 ? (
                  subscriber.interests.map(
                    (interest: string, index: number) => (
                      <Text
                        papel="legenda"
                        tom="ouro"
                        key={index}
                        className="px-2 py-1 rounded-full"
                      >
                        {interest}
                      </Text>
                    )
                  )
                ) : (
                  <Text papel="rotulo" tom="fraco">
                    Nenhum interesse especificado
                  </Text>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-theme-tertiary">Timezone</label>
              <p className="font-medium text-theme-primary">
                {subscriber.timezone || 'America/Sao_Paulo'}
              </p>
            </div>
          </div>
        </Stack>

        {/* Usuário Vinculado */}
        {subscriber.user && (
          <Stack className="bg-theme-secondary p-6 rounded-lg">
            <h3 className="font-bold text-theme-primary">Usuário Vinculado</h3>
            <Stack gap={2}>
              <p>
                <span className="text-theme-tertiary">Nome:</span>{' '}
                {subscriber.user.firstName} {subscriber.user.lastName}
              </p>
              <p>
                <span className="text-theme-tertiary">Tipo:</span>{' '}
                {subscriber.user.role === 0
                  ? 'Usuário'
                  : subscriber.user.role === 1
                    ? 'Professor'
                    : 'Admin'}
              </p>
            </Stack>
          </Stack>
        )}

        {/* Footer */}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </Stack>
    </Modal>
  );
};

// Modal de Edição do Subscriber
interface EditSubscriberModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: any;
  onSave: (subscriberId: string, data: any) => Promise<void>;
}

export const EditSubscriberModal: React.FC<EditSubscriberModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: subscriber?.firstName || '',
    lastName: subscriber?.lastName || '',
    status: subscriber?.status || 'ACTIVE',
    frequency: subscriber?.frequency || 'weekly',
    interests: subscriber?.interests?.join(', ') || '',
  });

  const statusOptions = [
    { value: 'ACTIVE', label: 'Ativo' },
    { value: 'PENDING', label: 'Pendente' },
    { value: 'UNSUBSCRIBED', label: 'Cancelado' },
    { value: 'BOUNCED', label: 'Bounce' },
    { value: 'BLOCKED', label: 'Bloqueado' },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        ...formData,
        interests: formData.interests
          .split(',')
          .map((i: string) => i.trim())
          .filter((i: string) => i.length > 0),
      };

      await onSave(subscriber.id, updateData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!subscriber) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <Stack gap={6}>
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <PiNotePencil className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Editar Subscriber
          </h2>
          <p className="text-theme-secondary">{subscriber.email}</p>
        </div>

        <Stack gap={6} as="form" onSubmit={handleSubmit}>
          {/* Nome */}
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Primeiro Nome"
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, firstName: e.target.value }))
              }
              disabled={loading}
            />
            <Input
              label="Sobrenome"
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, lastName: e.target.value }))
              }
              disabled={loading}
            />
          </div>

          {/* Status e Frequência */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Status"
                options={statusOptions}
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div>
              <Select
                label="Frequência"
                options={frequencyOptions}
                value={formData.frequency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    frequency: e.target.value,
                  }))
                }
                disabled={loading}
              />
            </div>
          </div>

          {/* Interesses */}
          <div>
            <Field.Area
              label="Interesses (separados por vírgula)"
              classeCampo="resize-none"
              value={formData.interests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, interests: e.target.value }))
              }
              placeholder="Piano, Violão, Música Clássica"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="flex-1"
            >
              Salvar Alterações
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
        </Stack>
      </Stack>
    </Modal>
  );
};

// Modal de Envio de Email Individual
interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriber: any;
  onSend: (subscriberId: string, emailData: any) => Promise<void>;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  subscriber,
  onSend,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    templateType: 'CUSTOM_CAMPAIGN',
  });

  const templateOptions = [
    { value: 'CUSTOM_CAMPAIGN', label: 'Email Personalizado' },
    { value: 'WELCOME', label: 'Email de Boas-vindas' },
    { value: 'STUDY_REMINDER', label: 'Lembrete de Estudo' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.content.trim()) return;

    setLoading(true);

    try {
      await onSend(subscriber.id, {
        ...formData,
        recipientName: subscriber.firstName || 'Usuário',
      });
      onClose();
      setFormData({
        subject: '',
        content: '',
        templateType: 'CUSTOM_CAMPAIGN',
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!subscriber) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <Stack gap={6}>
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <PiPaperPlaneRight className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Enviar Email Individual
          </h2>
          <p className="text-theme-secondary">
            Para: {subscriber.email}
            {(subscriber.firstName || subscriber.lastName) && (
              <span>
                {' '}
                ({subscriber.firstName} {subscriber.lastName})
              </span>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Template */}
          <div>
            <Select
              label="Tipo de Email"
              options={templateOptions}
              value={formData.templateType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  templateType: e.target.value,
                }))
              }
              disabled={loading}
            />
          </div>

          {/* Assunto */}
          <Input
            label="Assunto"
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, subject: e.target.value }))
            }
            placeholder="Assunto do email"
            disabled={loading}
            required
          />

          {/* Conteúdo */}
          <div>
            <Field.Area
              label="Conteúdo"
              classeCampo="resize-y"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Digite o conteúdo do email aqui..."
              rows={10}
              disabled={loading}
              required
            />
            <Text papel="legenda" tom="fraco" as="p" className="mt-2">
              Você pode usar &quot;FirstName&quot; para personalizar o nome do
              destinatário
            </Text>
          </div>

          {/* Preview */}
          <Stack gap={2} className="bg-theme-secondary p-4 rounded-lg">
            <h4 className="font-medium text-theme-primary">Preview:</h4>
            <Text papel="rotulo" tom="suave" as="div">
              <p>
                <strong>Para:</strong> {subscriber.email}
              </p>
              <p>
                <strong>Assunto:</strong> {formData.subject || 'Sem assunto'}
              </p>
              <div className="mt-2 p-3 bg-theme-tertiary rounded">
                <p className="whitespace-pre-wrap">
                  {formData.content.replace(
                    '{{firstName}}',
                    subscriber.firstName || 'Usuário'
                  ) || 'Conteúdo vazio'}
                </p>
              </div>
            </Text>
          </Stack>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              leftIcon={<PiPaperPlaneRight />}
              className="flex-1"
              disabled={!formData.subject.trim() || !formData.content.trim()}
            >
              Enviar Email
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
      </Stack>
    </Modal>
  );
};
