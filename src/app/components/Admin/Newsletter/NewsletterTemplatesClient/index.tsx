// app/components/Admin/Newsletter/NewsletterTemplatesClient.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PiArrowsClockwise,
  PiCheckCircle,
  PiCode,
  PiCopy,
  PiEnvelopeSimple,
  PiEye,
  PiFileText,
  PiMagnifyingGlass,
  PiNotePencil,
  PiPlus,
  PiStar,
  PiTrash,
  PiWarningCircle,
} from 'react-icons/pi';
import {
  AnimatedCard,
  AnimatedContainer,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import { useNewsletterAdmin } from '@/app/hooks/admin/useNewsletterAdmin';
import { getAllEmailTemplates } from '@/app/libs/newsletter/emailTemplates';
import CreateEditTemplateModal from './CreateEditTemplateModal';
import TemplatePreviewModal from './TemplatePreviewModal';
import LoadingAdminState from '../../Common/LoadingState';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

interface FilterState {
  type: string;
  search: string;
  status: string;
}

const templateTypeOptions = [
  { value: '', label: 'Todos os tipos' },
  { value: 'WELCOME', label: 'Boas-vindas' },
  { value: 'ACCOUNT_CONFIRMATION', label: 'Confirmação de Conta' },
  { value: 'PASSWORD_RESET', label: 'Reset de Senha' },
  { value: 'WEEKLY_DIGEST', label: 'Digest Semanal' },
  { value: 'NEW_COMPOSER', label: 'Novo Compositor' },
  { value: 'CAMPAIGN_CUSTOM', label: 'Campanha Customizada' },
];

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
  { value: 'default', label: 'Padrão' },
];

export default function NewsletterTemplatesClient() {
  const {
    templates,
    templatesLoading,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useNewsletterAdmin();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [filters, setFilters] = useState<FilterState>({
    type: '',
    search: '',
    status: '',
  });

  const builtInTemplates = getAllEmailTemplates();

  useEffect(() => {
    fetchTemplates(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setShowEditModal(true);
  };

  const handlePreview = (template: any) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleDuplicate = async (template: any) => {
    try {
      await createTemplate({
        name: `${template.name} (Cópia)`,
        type: template.type,
        subject: template.subject,
        htmlContent: template.htmlContent,
        textContent: template.textContent,
        description: `Cópia de: ${template.description}`,
        isActive: false, // Criar como inativo
      });
    } catch (error: any) {
      console.error('Erro ao duplicar template:', error);
    }
  };

  const handleDelete = async (template: any) => {
    if (
      confirm(
        `Tem certeza que deseja deletar o template "${template.name}"? Esta ação não pode ser desfeita.`
      )
    ) {
      try {
        await deleteTemplate(template.id);
      } catch (error: any) {
        console.error('Erro ao deletar template:', error);
      }
    }
  };

  const handleToggleDefault = async (template: any) => {
    try {
      await updateTemplate(template.id, {
        isDefault: !template.isDefault,
      });
    } catch (error: any) {
      console.error('Erro ao alterar status padrão:', error);
    }
  };

  const handleToggleStatus = async (template: any) => {
    try {
      await updateTemplate(template.id, {
        isActive: !template.isActive,
      });
    } catch (error: any) {
      console.error('Erro ao alterar status:', error);
    }
  };

  const getTemplateTypeName = (type: string) => {
    const option = templateTypeOptions.find((opt) => opt.value === type);
    return option ? option.label : type;
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'WELCOME':
        return 'text-ok bg-ok/10';
      case 'ACCOUNT_CONFIRMATION':
        return 'text-aviso bg-aviso/10';
      case 'PASSWORD_RESET':
        return 'text-erro bg-erro/10';
      case 'WEEKLY_DIGEST':
        return 'text-ouro-texto bg-ouro/10';
      case 'NEW_COMPOSER':
        return 'text-atencao bg-atencao/10';
      case 'CAMPAIGN_CUSTOM':
        return 'text-theme-primary bg-theme-secondary';
      default:
        return 'text-theme-tertiary bg-theme-secondary';
    }
  };

  // Filtrar templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !filters.search ||
      template.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      template.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesType = !filters.type || template.type === filters.type;

    const matchesStatus =
      !filters.status ||
      (filters.status === 'active' && template.isActive) ||
      (filters.status === 'inactive' && !template.isActive) ||
      (filters.status === 'default' && template.isDefault);

    return matchesSearch && matchesType && matchesStatus;
  });

  if (templatesLoading && templates.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <LoadingAdminState loadingName="templates" />
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <Stack gap={8}>
        <AnimatedContainer
          delay={0.1}
          staggerSpeed="normal"
          className="flex flex-col gap-4"
        >
          {/* Header */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-8">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-ok rounded-3xl flex items-center justify-center shadow-theme-glow">
                  <PiFileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Templates de Email
              </h1>
              <p className="text-lg md:text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
                Crie e gerencie templates personalizados para suas campanhas
              </p>
            </div>
          </AnimatedItem>

          {/* Stats Cards */}
          <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Total de Templates
                  </Text>
                  <p className="text-3xl font-bold text-theme-primary">
                    {templates.length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-aviso/20 rounded-xl flex items-center justify-center">
                  <PiFileText className="w-6 h-6 text-aviso" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Templates Ativos
                  </Text>
                  <p className="text-3xl font-bold text-ok">
                    {templates.filter((t) => t.isActive).length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-ok/20 rounded-xl flex items-center justify-center">
                  <PiCheckCircle className="w-6 h-6 text-ok" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Templates Padrão
                  </Text>
                  <p className="text-3xl font-bold text-atencao">
                    {templates.filter((t) => t.isDefault).length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-atencao/20 rounded-xl flex items-center justify-center">
                  <PiStar className="w-6 h-6 text-atencao" />
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-6">
              <div className="flex items-center justify-between">
                <Stack gap={1}>
                  <Text papel="rotulo" tom="fraco" as="p">
                    Built-in
                  </Text>
                  <p className="text-3xl font-bold text-ouro-texto">
                    {builtInTemplates.length}
                  </p>
                </Stack>
                <div className="w-12 h-12 bg-ouro/20 rounded-xl flex items-center justify-center">
                  <PiCode className="w-6 h-6 text-ouro-texto" />
                </div>
              </div>
            </AnimatedCard>
          </SequentialGrid>

          {/* Built-in Templates Info */}
          <AnimatedCard className="classical-card p-6">
            <div className="flex items-center justify-between mb-4">
              <Inline gap={3}>
                <PiCode className="w-5 h-5 text-ouro-texto" />
                <h3 className="text-lg font-bold text-theme-primary">
                  Templates Built-in Disponíveis
                </h3>
              </Inline>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {builtInTemplates.map(({ type, template }) => (
                <div
                  key={type}
                  className="p-4 bg-theme-secondary rounded-lg border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(
                        type
                      )}`}
                    >
                      {getTemplateTypeName(type)}
                    </span>
                    <PiCode className="w-4 h-4 text-ouro-texto" />
                  </div>
                  <h4 className="font-medium text-theme-primary text-sm mb-1">
                    {template.description}
                  </h4>
                  <Text papel="legenda" tom="fraco" as="p">
                    {template.variables.length} variáveis disponíveis
                  </Text>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-aviso/10 border border-aviso/20 rounded-lg">
              <p className="text-sm text-aviso">
                <strong>ℹ️ Dica:</strong> Templates built-in são criados
                automaticamente quando você usa um tipo de template nas
                campanhas. Você pode criar templates personalizados baseados
                neles.
              </p>
            </div>
          </AnimatedCard>

          {/* Controls */}
          <AnimatedCard className="classical-card p-6" hover="none">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar templates..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange('search', e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 bg-theme-secondary border border-theme-primary rounded-lg text-theme-primary placeholder-texto-fraco focus:outline-none focus:ring-2 focus:ring-ouro"
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-2">
                  <Select
                    options={templateTypeOptions}
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  />

                  <Select
                    options={statusOptions}
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange('status', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={
                    <PiArrowsClockwise
                      className={templatesLoading ? 'animate-spin' : ''}
                    />
                  }
                  onClick={() => fetchTemplates(filters)}
                  disabled={templatesLoading}
                >
                  Atualizar
                </Button>

                <Button
                  variant="primary"
                  leftIcon={<PiPlus />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Novo Template
                </Button>
              </div>
            </div>

            {/* Templates Grid */}
            {filteredTemplates.length > 0 ? (
              <SequentialGrid cols={1} gap={4} delayBetweenItems={0.05}>
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="classical-card">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 mr-4">
                          <Inline gap={3} className="mb-3">
                            <h3 className="text-lg font-semibold text-theme-primary truncate">
                              {template.name}
                            </h3>

                            <Inline gap={2}>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getTemplateTypeColor(
                                  template.type
                                )}`}
                              >
                                {getTemplateTypeName(template.type)}
                              </span>

                              {template.isDefault && (
                                <span className="px-2 py-1 bg-atencao/10 text-atencao rounded-full text-xs font-medium flex items-center">
                                  <PiStar className="w-3 h-3 mr-1" />
                                  Padrão
                                </span>
                              )}

                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  template.isActive
                                    ? 'bg-ok/10 text-ok'
                                    : 'bg-theme-secondary text-theme-tertiary'
                                }`}
                              >
                                {template.isActive ? 'Ativo' : 'Inativo'}
                              </span>
                            </Inline>
                          </Inline>

                          <div className="mb-3">
                            <Text
                              papel="rotulo"
                              tom="forte"
                              as="p"
                              className="font-medium mb-1"
                            >
                              Assunto: {template.subject}
                            </Text>
                            {template.description && (
                              <Text papel="rotulo" tom="suave" as="p">
                                {template.description}
                              </Text>
                            )}
                          </div>

                          {/* Stats */}
                          <Inline
                            gap={6}
                            className="text-sm text-theme-tertiary"
                          >
                            <div className="flex items-center">
                              <PiEnvelopeSimple className="w-4 h-4 mr-1" />
                              <span>{template.timesUsed || 0} usos</span>
                            </div>

                            {template.avgOpenRate && (
                              <div className="flex items-center">
                                <PiEye className="w-4 h-4 mr-1" />
                                <span>
                                  {(template.avgOpenRate * 100).toFixed(1)}%
                                  abertura
                                </span>
                              </div>
                            )}

                            <div className="flex items-center">
                              <PiCode className="w-4 h-4 mr-1" />
                              <span>
                                {template.variables?.length || 0} variáveis
                              </span>
                            </div>
                          </Inline>
                        </div>

                        {/* Actions */}
                        <Inline gap={1}>
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiEye />}
                            onClick={() => handlePreview(template)}
                            title="Preview"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiNotePencil />}
                            onClick={() => handleEdit(template)}
                            title="Editar"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiCopy />}
                            onClick={() => handleDuplicate(template)}
                            title="Duplicar"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiStar />}
                            onClick={() => handleToggleDefault(template)}
                            className={template.isDefault ? 'text-atencao' : ''}
                            title={
                              template.isDefault
                                ? 'Remover como padrão'
                                : 'Marcar como padrão'
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={
                              template.isActive ? (
                                <PiWarningCircle />
                              ) : (
                                <PiCheckCircle />
                              )
                            }
                            onClick={() => handleToggleStatus(template)}
                            className={
                              template.isActive ? 'text-erro' : 'text-ok'
                            }
                            title={template.isActive ? 'Desativar' : 'Ativar'}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            leftIcon={<PiTrash />}
                            onClick={() => handleDelete(template)}
                            className="text-erro hover:text-erro"
                            title="Deletar"
                          />
                        </Inline>
                      </div>
                    </div>
                  </div>
                ))}
              </SequentialGrid>
            ) : (
              <div className="text-center py-12">
                <PiFileText className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-xl font-medium text-theme-primary mb-2">
                  {filters.search || filters.type || filters.status
                    ? 'Nenhum template encontrado'
                    : 'Nenhum template criado'}
                </h3>
                <p className="text-theme-tertiary mb-6">
                  {filters.search || filters.type || filters.status
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro template personalizado'}
                </p>
                {!filters.search && !filters.type && !filters.status && (
                  <Button
                    variant="primary"
                    leftIcon={<PiPlus />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Criar Primeiro Template
                  </Button>
                )}
              </div>
            )}
          </AnimatedCard>
        </AnimatedContainer>
      </Stack>

      {/* Modals */}
      {showCreateModal && (
        <CreateEditTemplateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTemplates(filters);
          }}
        />
      )}

      {showEditModal && selectedTemplate && (
        <CreateEditTemplateModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
            fetchTemplates(filters);
          }}
        />
      )}

      {showPreviewModal && selectedTemplate && (
        <TemplatePreviewModal
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedTemplate(null);
          }}
          template={selectedTemplate}
        />
      )}
    </PageContainer>
  );
}
