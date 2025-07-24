// app/components/Admin/Newsletter/TestEmailListsManager.tsx
'use client';

import React, { useState } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiSearch,
  FiSend,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  LoadingSpinner,
  SequentialGrid,
} from '@/app/components/animation/AnimatedComponents';

import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Modal from '@/app/components/Modal';
import {
  useTestEmailLists,
  useTestEmailSending,
} from '@/app/hooks/admin/useTestEmailLists';

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  list?: any;
  onSuccess: () => void;
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({
  isOpen,
  onClose,
  list,
  onSuccess,
}) => {
  const { createList, updateList } = useTestEmailLists();
  const isEditing = !!list;

  const [formData, setFormData] = useState({
    name: list?.name || '',
    description: list?.description || '',
    emails: list?.emails?.join('\n') || '',
    color: list?.color || '#6366f1',
    isActive: list?.isActive ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro quando usuário digita
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar emails se fornecidos
    if (formData.emails.trim()) {
      const emailLines = formData.emails
        .split('\n')
        .filter((line) => line.trim());
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const invalidEmails = emailLines.filter(
        (email) => !emailRegex.test(email.trim())
      );

      if (invalidEmails.length > 0) {
        newErrors.emails = `${invalidEmails.length} email(s) inválido(s) encontrado(s)`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const emailList = formData.emails
      ? formData.emails
          .split('\n')
          .filter((line) => line.trim())
          .map((email) => email.trim())
      : [];

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      emails: emailList,
      color: formData.color,
      isActive: formData.isActive,
    };

    try {
      const result = isEditing
        ? await updateList(list.id, data)
        : await createList(data);

      if (result.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: '',
          description: '',
          emails: '',
          color: '#6366f1',
          isActive: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: list?.name || '',
      description: list?.description || '',
      emails: list?.emails?.join('\n') || '',
      color: list?.color || '#6366f1',
      isActive: list?.isActive ?? true,
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="2xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            {isEditing ? (
              <FiEdit2 className="w-8 h-8 text-white" />
            ) : (
              <FiPlus className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            {isEditing ? 'Editar Lista' : 'Nova Lista de Teste'}
          </h2>
          <p className="text-theme-secondary">
            {isEditing
              ? 'Atualize os dados da lista'
              : 'Crie uma nova lista para envios de teste'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <Input
            label="Nome da Lista"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: Lista VIPs, Equipe de Teste"
            error={errors.name}
            disabled={loading}
            required
          />

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o propósito desta lista..."
              rows={3}
              disabled={loading}
              className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-none"
            />
          </div>

          {/* Emails */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Emails (um por linha)
            </label>
            <textarea
              value={formData.emails}
              onChange={(e) => handleInputChange('emails', e.target.value)}
              placeholder={`exemplo1@email.com\nexemplo2@email.com\nexemplo3@email.com`}
              rows={8}
              disabled={loading}
              className={`w-full px-4 py-3 bg-theme-tertiary border ${
                errors.emails ? 'border-accent-red' : 'border-theme-secondary'
              } rounded-lg text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-brand-primary transition-colors resize-none font-mono text-sm`}
            />
            {errors.emails && (
              <p className="text-accent-red text-sm mt-1">{errors.emails}</p>
            )}
            {formData.emails.trim() && (
              <p className="text-theme-tertiary text-sm mt-1">
                {
                  formData.emails.split('\n').filter((line) => line.trim())
                    .length
                }{' '}
                email(s)
              </p>
            )}
          </div>

          {/* Cor e Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Cor da Lista
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  disabled={loading}
                  className="w-12 h-12 rounded-lg border-2 border-theme-secondary cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#6366f1"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Status
              </label>
              <div className="flex items-center space-x-2 mt-3">
                <button
                  type="button"
                  onClick={() =>
                    handleInputChange('isActive', !formData.isActive)
                  }
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isActive ? 'bg-accent-green' : 'bg-theme-secondary'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className="text-sm text-theme-primary">
                  {formData.isActive ? 'Ativa' : 'Inativa'}
                </span>
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
              className="flex-1"
            >
              {isEditing ? 'Atualizar Lista' : 'Criar Lista'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleClose}
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

interface SendTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLists: string[];
  availableLists: any[];
}

const SendTestModal: React.FC<SendTestModalProps> = ({
  isOpen,
  onClose,
  selectedLists,
  availableLists,
}) => {
  const { sendTestEmails, loading, result, error, getAvailableTemplates } =
    useTestEmailSending();

  const [formData, setFormData] = useState({
    templateType: 'WELCOME',
    customSubject: '',
    sendMode: 'bulk' as 'bulk' | 'individual',
    testVariables: {
      firstName: 'Usuário de Teste',
      testMessage: 'Este é um email de teste',
    },
  });

  const [templates, setTemplates] = useState<any[]>([]);
  const [step, setStep] = useState<'form' | 'sending' | 'result'>('form');

  React.useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    const data = await getAvailableTemplates();
    if (data) {
      setTemplates(data.templates);
    }
  };

  const getSelectedListsInfo = () => {
    const selected = availableLists.filter((list) =>
      selectedLists.includes(list.id)
    );
    const totalEmails = selected.reduce(
      (sum, list) => sum + list.totalEmails,
      0
    );
    return { lists: selected, totalEmails };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('sending');

    const result = await sendTestEmails({
      testListIds: selectedLists,
      templateType: formData.templateType,
      customSubject: formData.customSubject || undefined,
      testVariables: formData.testVariables,
      sendMode: formData.sendMode,
    });

    setStep('result');
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      templateType: 'WELCOME',
      customSubject: '',
      sendMode: 'bulk',
      testVariables: {
        firstName: 'Usuário de Teste',
        testMessage: 'Este é um email de teste',
      },
    });
    onClose();
  };

  const renderFormStep = () => {
    const { lists, totalEmails } = getSelectedListsInfo();

    return (
      <>
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-glow">
            <FiSend className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
            Enviar Email de Teste
          </h2>
          <p className="text-theme-secondary">
            Configure o envio para {totalEmails} email(s) em {lists.length}{' '}
            lista(s)
          </p>
        </div>

        {/* Listas Selecionadas */}
        <div className="bg-theme-secondary rounded-lg p-4 mb-6">
          <h4 className="font-medium text-theme-primary mb-3">
            Listas Selecionadas:
          </h4>
          <div className="space-y-2">
            {lists.map((list) => (
              <div key={list.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="text-theme-primary font-medium">
                    {list.name}
                  </span>
                </div>
                <span className="text-theme-tertiary text-sm">
                  {list.totalEmails} emails
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Template de Email
            </label>
            <select
              value={formData.templateType}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  templateType: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-brand-primary"
            >
              {templates.map((template) => (
                <option key={template.type} value={template.type}>
                  {template.name} - {template.subject}
                </option>
              ))}
            </select>
          </div>

          {/* Assunto Customizado */}
          <Input
            label="Assunto Personalizado (opcional)"
            type="text"
            value={formData.customSubject}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customSubject: e.target.value,
              }))
            }
            placeholder="Deixe vazio para usar o assunto padrão do template"
          />

          {/* Variáveis de Teste */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Variáveis de Teste
            </label>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nome do Teste"
                type="text"
                value={formData.testVariables.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    testVariables: {
                      ...prev.testVariables,
                      firstName: e.target.value,
                    },
                  }))
                }
              />
              <Input
                label="Mensagem de Teste"
                type="text"
                value={formData.testVariables.testMessage}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    testVariables: {
                      ...prev.testVariables,
                      testMessage: e.target.value,
                    },
                  }))
                }
              />
            </div>
          </div>

          {/* Modo de Envio */}
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-3">
              Modo de Envio
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                  formData.sendMode === 'bulk'
                    ? 'border-brand-primary bg-brand-primary bg-opacity-10'
                    : 'border-theme-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="sendMode"
                  value="bulk"
                  checked={formData.sendMode === 'bulk'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sendMode: e.target.value as any,
                    }))
                  }
                  className="sr-only"
                />
                <div className="text-center">
                  <FiUsers className="w-6 h-6 mx-auto mb-2 text-theme-primary" />
                  <div className="font-medium text-theme-primary">Lote</div>
                  <div className="text-sm text-theme-tertiary">Mais rápido</div>
                </div>
              </label>

              <label
                className={`cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                  formData.sendMode === 'individual'
                    ? 'border-brand-primary bg-brand-primary bg-opacity-10'
                    : 'border-theme-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="sendMode"
                  value="individual"
                  checked={formData.sendMode === 'individual'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sendMode: e.target.value as any,
                    }))
                  }
                  className="sr-only"
                />
                <div className="text-center">
                  <FiMail className="w-6 h-6 mx-auto mb-2 text-theme-primary" />
                  <div className="font-medium text-theme-primary">
                    Individual
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    Mais controle
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
            >
              Enviar Teste ({totalEmails} emails)
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </>
    );
  };

  const renderSendingStep = () => (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-accent-amber to-accent-red rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow animate-pulse">
        <FiSend className="w-10 h-10 text-white animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
        Enviando Emails...
      </h2>
      <p className="text-theme-secondary mb-6">
        Processando envio para as listas selecionadas
      </p>
      <div className="w-32 h-1 bg-theme-secondary rounded-full mx-auto overflow-hidden">
        <div className="h-full bg-gradient-to-r from-accent-amber to-accent-red animate-pulse"></div>
      </div>
    </div>
  );

  const renderResultStep = () => (
    <div className="text-center">
      <div
        className={`w-20 h-20 bg-gradient-to-br ${
          result?.results.successful === result?.results.total
            ? 'from-accent-green to-accent-blue'
            : 'from-accent-amber to-accent-red'
        } rounded-full flex items-center justify-center mx-auto mb-6 shadow-theme-glow`}
      >
        {result?.results.successful === result?.results.total ? (
          <FiCheckCircle className="w-10 h-10 text-white" />
        ) : (
          <FiAlertCircle className="w-10 h-10 text-white" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-theme-primary classical-title mb-4">
        {result?.results.successful === result?.results.total
          ? '✅ Envio Concluído!'
          : '⚠️ Envio Parcial'}
      </h2>

      <p className="text-theme-secondary mb-6">{result?.message}</p>

      {result && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-accent-green bg-opacity-10 border border-accent-green rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-green">
              {result.results.successful}
            </div>
            <div className="text-sm text-accent-green">Enviados</div>
          </div>
          <div className="bg-accent-red bg-opacity-10 border border-accent-red rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-red">
              {result.results.failed}
            </div>
            <div className="text-sm text-accent-red">Falhas</div>
          </div>
          <div className="bg-accent-blue bg-opacity-10 border border-accent-blue rounded-lg p-4">
            <div className="text-2xl font-bold text-accent-blue">
              {result.results.successRate}%
            </div>
            <div className="text-sm text-accent-blue">Taxa</div>
          </div>
        </div>
      )}

      <Button
        variant="primary"
        size="lg"
        onClick={handleClose}
        className="w-full"
      >
        Fechar
      </Button>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 'form':
        return renderFormStep();
      case 'sending':
        return renderSendingStep();
      case 'result':
        return renderResultStep();
      default:
        return renderFormStep();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'sending' ? () => {} : handleClose}
      maxWidth="2xl"
      showCloseButton={step !== 'sending'}
    >
      {renderContent()}
    </Modal>
  );
};

export default function TestEmailListsManager() {
  const {
    lists,
    stats,
    loading,
    error,
    selectedLists,
    fetchLists,
    deleteLists,
    performAction,
    selectList,
    selectAllLists,
    clearSelection,
  } = useTestEmailLists();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | 'all'>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);

  // Filtrar e ordenar listas
  const filteredLists = lists.filter((list) => {
    const matchesSearch =
      !searchTerm ||
      list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      list.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' || list.isActive === filterActive;

    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    fetchLists({
      search: searchTerm || undefined,
      isActive: filterActive !== 'all' ? filterActive : undefined,
      sortBy,
      sortOrder,
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedLists.length === 0) return;

    if (
      confirm(
        `Deletar ${selectedLists.length} lista(s)? Esta ação não pode ser desfeita.`
      )
    ) {
      await deleteLists(selectedLists);
    }
  };

  const handleEdit = (list: any) => {
    setEditingList(list);
    setEditModalOpen(true);
  };

  const handleDuplicate = async (list: any) => {
    await performAction(list.id, 'duplicate');
  };

  const handleToggleStatus = async (list: any) => {
    await performAction(list.id, 'toggle-status');
  };

  if (loading && lists.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-theme-primary font-medium mt-6 text-lg">
              Carregando listas de teste...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer showBackground={true}>
        <div className="text-center py-16">
          <FiAlertCircle className="w-16 h-16 text-accent-red mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-theme-primary mb-2">
            Erro ao Carregar
          </h2>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Button variant="primary" onClick={handleRefresh}>
            Tentar Novamente
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <div className="space-y-8">
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <FiMail className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Listas de Teste de Email
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Gerencie múltiplas listas para envios de teste
              </p>
            </div>
          </AnimatedItem>

          {/* Stats */}
          {stats && (
            <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Total de Listas
                    </p>
                    <p className="text-3xl font-bold text-theme-primary">
                      {stats.total}
                    </p>
                  </div>
                  <FiMail className="w-8 h-8 text-accent-blue" />
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Listas Ativas
                    </p>
                    <p className="text-3xl font-bold text-accent-green">
                      {stats.active}
                    </p>
                  </div>
                  <FiCheckCircle className="w-8 h-8 text-accent-green" />
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Total de Emails
                    </p>
                    <p className="text-3xl font-bold text-accent-purple">
                      {stats.totalEmails}
                    </p>
                  </div>
                  <FiUsers className="w-8 h-8 text-accent-purple" />
                </div>
              </AnimatedCard>

              <AnimatedCard className="classical-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-theme-tertiary mb-1">
                      Usos Totais
                    </p>
                    <p className="text-3xl font-bold text-accent-amber">
                      {stats.totalUses}
                    </p>
                  </div>
                  <FiSend className="w-8 h-8 text-accent-amber" />
                </div>
              </AnimatedCard>
            </SequentialGrid>
          )}

          {/* Controls */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search and Filters */}
              <div className="flex-1 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar listas..."
                    leftIcon={<FiSearch className="w-4 h-4" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3">
                  <select
                    value={filterActive.toString()}
                    onChange={(e) =>
                      setFilterActive(
                        e.target.value === 'all'
                          ? 'all'
                          : e.target.value === 'true'
                      )
                    }
                    className="px-4 py-2 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-brand-primary"
                  >
                    <option value="all">Todas</option>
                    <option value="true">Ativas</option>
                    <option value="false">Inativas</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field);
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="px-4 py-2 bg-theme-tertiary border border-theme-secondary rounded-lg text-theme-primary focus:outline-none focus:border-brand-primary"
                  >
                    <option value="name-asc">Nome A-Z</option>
                    <option value="name-desc">Nome Z-A</option>
                    <option value="totalEmails-desc">Mais Emails</option>
                    <option value="totalEmails-asc">Menos Emails</option>
                    <option value="timesUsed-desc">Mais Usadas</option>
                    <option value="createdAt-desc">Mais Recentes</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {selectedLists.length > 0 && (
                  <>
                    <Button
                      variant="primary"
                      leftIcon={<FiSend />}
                      onClick={() => setSendModalOpen(true)}
                    >
                      Enviar Teste ({selectedLists.length})
                    </Button>
                    <Button
                      variant="delete"
                      leftIcon={<FiTrash2 />}
                      onClick={handleDeleteSelected}
                    >
                      Deletar ({selectedLists.length})
                    </Button>
                  </>
                )}

                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Nova Lista
                </Button>
              </div>
            </div>

            {/* Selection Controls */}
            {lists.length > 0 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-theme-secondary">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedLists.length === filteredLists.length &&
                        filteredLists.length > 0
                      }
                      onChange={(e) => selectAllLists(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-theme-primary">
                      Selecionar todos ({filteredLists.length})
                    </span>
                  </label>

                  {selectedLists.length > 0 && (
                    <button
                      onClick={clearSelection}
                      className="text-sm text-brand-primary hover:underline"
                    >
                      Limpar seleção
                    </button>
                  )}
                </div>

                <p className="text-sm text-theme-tertiary">
                  {selectedLists.length} de {filteredLists.length}{' '}
                  selecionada(s)
                </p>
              </div>
            )}
          </AnimatedCard>

          {/* Lists Grid */}
          {filteredLists.length > 0 ? (
            <SequentialGrid cols={1} gap={4} delayBetweenItems={0.05}>
              {filteredLists.map((list) => (
                <AnimatedCard key={list.id} className="classical-card">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedLists.includes(list.id)}
                          onChange={() => selectList(list.id)}
                          className="mt-1"
                        />

                        {/* Color Indicator */}
                        <div
                          className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: list.color }}
                        />

                        {/* List Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-theme-primary truncate">
                              {list.name}
                            </h3>

                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                list.isActive
                                  ? 'bg-accent-green bg-opacity-20 text-accent-green'
                                  : 'bg-theme-secondary text-theme-tertiary'
                              }`}
                            >
                              {list.isActive ? 'Ativa' : 'Inativa'}
                            </div>
                          </div>

                          {list.description && (
                            <p className="text-theme-secondary text-sm mb-3">
                              {list.description}
                            </p>
                          )}

                          {/* Stats */}
                          <div className="flex items-center space-x-6 text-sm text-theme-tertiary">
                            <div className="flex items-center">
                              <FiMail className="w-4 h-4 mr-1" />
                              <span>{list.totalEmails} emails</span>
                            </div>

                            <div className="flex items-center">
                              <FiSend className="w-4 h-4 mr-1" />
                              <span>{list.timesUsed} usos</span>
                            </div>

                            {list.lastUsed && (
                              <div className="flex items-center">
                                <FiClock className="w-4 h-4 mr-1" />
                                <span>
                                  Usado em{' '}
                                  {new Date(list.lastUsed).toLocaleDateString(
                                    'pt-BR'
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center">
                              <FiUsers className="w-4 h-4 mr-1" />
                              <span>Por {list.creator.firstName}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiEdit2 />}
                          onClick={() => handleEdit(list)}
                        >
                          Editar
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<FiCopy />}
                          onClick={() => handleDuplicate(list)}
                        >
                          Duplicar
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={list.isActive ? <FiEyeOff /> : <FiEye />}
                          onClick={() => handleToggleStatus(list)}
                        >
                          {list.isActive ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              ))}
            </SequentialGrid>
          ) : (
            <AnimatedCard className="classical-card p-12 text-center">
              <FiMail className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-theme-primary mb-2">
                {searchTerm || filterActive !== 'all'
                  ? 'Nenhuma lista encontrada'
                  : 'Nenhuma lista criada'}
              </h3>
              <p className="text-theme-secondary mb-6">
                {searchTerm || filterActive !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira lista de teste para começar'}
              </p>
              {!searchTerm && filterActive === 'all' && (
                <Button
                  variant="primary"
                  leftIcon={<FiPlus />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Criar Primeira Lista
                </Button>
              )}
            </AnimatedCard>
          )}
        </AnimatedContainer>
      </div>

      {/* Modals */}
      <CreateEditModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          handleRefresh();
          setCreateModalOpen(false);
        }}
      />

      <CreateEditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingList(null);
        }}
        list={editingList}
        onSuccess={() => {
          handleRefresh();
          setEditModalOpen(false);
          setEditingList(null);
        }}
      />

      <SendTestModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        selectedLists={selectedLists}
        availableLists={lists}
      />
    </PageContainer>
  );
}
