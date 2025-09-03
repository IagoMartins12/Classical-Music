// app/components/Admin/Newsletter/SubscriberModals.tsx
'use client';

import React, { useState } from 'react';
import { FiUser, FiBarChart2, FiEdit, FiSend } from 'react-icons/fi';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';

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
    if (score >= 75)
      return { label: 'Alto', color: 'text-accent-green bg-accent-green/10' };
    if (score >= 50)
      return { label: 'Médio', color: 'text-accent-amber bg-accent-amber/10' };
    if (score >= 25)
      return { label: 'Baixo', color: 'text-accent-red bg-accent-red/10' };
    return { label: 'Nenhum', color: 'text-theme-tertiary bg-theme-secondary' };
  };

  const engagement = getEngagementLevel(subscriber.avgEngagementScore || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiUser className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Detalhes do Subscriber
          </h2>
          <p className="text-theme-secondary">{subscriber.email}</p>
        </div>

        {/* Informações Básicas */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-theme-secondary p-6 rounded-lg">
            <h3 className="font-bold text-theme-primary mb-4 flex items-center">
              <FiUser className="w-5 h-5 mr-2" />
              Informações Pessoais
            </h3>
            <div className="space-y-3">
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
                      ? 'text-accent-green bg-accent-green/10'
                      : subscriber.status === 'PENDING'
                      ? 'text-accent-amber bg-accent-amber/10'
                      : 'text-accent-red bg-accent-red/10'
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
            </div>
          </div>

          <div className="bg-theme-secondary p-6 rounded-lg">
            <h3 className="font-bold text-theme-primary mb-4 flex items-center">
              <FiBarChart2 className="w-5 h-5 mr-2" />
              Engajamento
            </h3>
            <div className="space-y-3">
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
            </div>
          </div>
        </div>

        {/* Interesses e Preferências */}
        <div className="bg-theme-secondary p-6 rounded-lg">
          <h3 className="font-bold text-theme-primary mb-4">
            Interesses e Preferências
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-theme-tertiary">Interesses</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {subscriber.interests && subscriber.interests.length > 0 ? (
                  subscriber.interests.map(
                    (interest: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full"
                      >
                        {interest}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-theme-tertiary text-sm">
                    Nenhum interesse especificado
                  </span>
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
        </div>

        {/* Usuário Vinculado */}
        {subscriber.user && (
          <div className="bg-theme-secondary p-6 rounded-lg">
            <h3 className="font-bold text-theme-primary mb-4">
              Usuário Vinculado
            </h3>
            <div className="space-y-2">
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
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiEdit className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Editar Subscriber
          </h2>
          <p className="text-theme-secondary">{subscriber.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Status
              </label>
              <Select
                options={statusOptions}
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Frequência
              </label>
              <Select
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
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Interesses (separados por vírgula)
            </label>
            <textarea
              value={formData.interests}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, interests: e.target.value }))
              }
              placeholder="Piano, Violão, Música Clássica"
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-none"
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
        </form>
      </div>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiSend className="w-8 h-8 text-white" />
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
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Tipo de Email
            </label>
            <Select
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
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Conteúdo
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="Digite o conteúdo do email aqui..."
              rows={10}
              disabled={loading}
              required
              className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-y"
            />
            <p className="text-xs text-theme-tertiary mt-2">
              Você pode usar &quot;FirstName&quot; para personalizar o nome do
              destinatário
            </p>
          </div>

          {/* Preview */}
          <div className="bg-theme-secondary p-4 rounded-lg">
            <h4 className="font-medium text-theme-primary mb-2">Preview:</h4>
            <div className="text-sm text-theme-secondary">
              <p>
                <strong>Para:</strong> {subscriber.email}
              </p>
              <p>
                <strong>Assunto:</strong> {formData.subject || 'Sem assunto'}
              </p>
              <div className="mt-2 p-3 bg-theme-tertiary rounded border-l-4 border-brand-primary">
                <p className="whitespace-pre-wrap">
                  {formData.content.replace(
                    '{{firstName}}',
                    subscriber.firstName || 'Usuário'
                  ) || 'Conteúdo vazio'}
                </p>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              leftIcon={<FiSend />}
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
      </div>
    </Modal>
  );
};
