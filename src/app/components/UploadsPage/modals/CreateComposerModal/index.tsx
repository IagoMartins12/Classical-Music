'use client';

// app/components/modals/CreateComposerModal.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiUser,
  FiSearch,
  FiExternalLink,
  FiSave,
  FiLoader,
  FiImage,
  FiCalendar,
  FiGlobe,
  FiTag,
  FiInfo,
} from 'react-icons/fi';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';

interface CreateComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  epochs: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string }>;
  editingComposer?: any;
}

const CreateComposerModal = ({
  isOpen,
  onClose,
  epochs,
  roles,
  editingComposer,
}: CreateComposerModalProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchingExternal, setSearchingExternal] = useState(false);
  const [externalSources, setExternalSources] = useState<any[]>([]);
  const [showExternalResults, setShowExternalResults] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    otherName: '',
    alternativeNames: '',
    namesInOtherLangs: '',
    pseudonyms: '',
    birthDate: '',
    deathDate: '',
    portraitUrl: '',
    epochId: '',
    bio: '',
    diverseInfo: '',
    externalLinks: '',
    imslpId: '',
    wikipediaLink: '',
    nationality: '',
    instruments: '',
    imslpCategories: '',
    primaryRoleId: '',
    roles: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editingComposer) {
      setFormData({
        name: editingComposer.name || '',
        fullName: editingComposer.fullName || '',
        otherName: editingComposer.otherName || '',
        alternativeNames: editingComposer.alternativeNames || '',
        namesInOtherLangs: editingComposer.namesInOtherLangs || '',
        pseudonyms: editingComposer.pseudonyms || '',
        birthDate: editingComposer.birthDate || '',
        deathDate: editingComposer.deathDate || '',
        portraitUrl: editingComposer.portraitUrl || '',
        epochId: editingComposer.epochId || '',
        bio: editingComposer.bio || '',
        diverseInfo: editingComposer.diverseInfo || '',
        externalLinks: editingComposer.externalLinks || '',
        imslpId: editingComposer.imslpId || '',
        wikipediaLink: editingComposer.wikipediaLink || '',
        nationality: editingComposer.nationality || '',
        instruments: editingComposer.instruments || '',
        imslpCategories: editingComposer.imslpCategories || '',
        primaryRoleId: editingComposer.primaryRoleId || '',
        roles: editingComposer.roles || '',
      });
    }
  }, [editingComposer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }
    if (!formData.epochId) {
      newErrors.epochId = 'Época é obrigatória';
    }
    if (!formData.primaryRoleId) {
      newErrors.primaryRoleId = 'Papel principal é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingComposer
        ? `/api/uploads/composer/${editingComposer.id}`
        : '/api/uploads/composer';

      const method = editingComposer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        onClose();
        // Mostrar notificação de sucesso
        alert(data.message || 'Compositor salvo com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar compositor');
      }
    } catch (error) {
      console.error('Erro ao salvar compositor:', error);
      alert(
        error instanceof Error ? error.message : 'Erro ao salvar compositor'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchExternalSources = async () => {
    if (!formData.name.trim()) {
      alert('Digite um nome para buscar');
      return;
    }

    setSearchingExternal(true);
    setShowExternalResults(false);

    try {
      const response = await fetch(
        `/api/uploads/external-sources?query=${encodeURIComponent(
          formData.name
        )}&type=composer`
      );

      if (response.ok) {
        const data = await response.json();
        setExternalSources(data.sources || []);
        setShowExternalResults(true);
      }
    } catch (error) {
      console.error('Erro ao buscar fontes externas:', error);
      alert('Erro ao buscar fontes externas');
    } finally {
      setSearchingExternal(false);
    }
  };

  const fillFromExternalSource = (source: any, result: any) => {
    if (source.name === 'MusicBrainz') {
      setFormData((prev) => ({
        ...prev,
        fullName: result.title,
        nationality: result.additionalInfo?.country || '',
        birthDate: result.additionalInfo?.lifeSpan?.begin || '',
        deathDate: result.additionalInfo?.lifeSpan?.end || '',
        alternativeNames:
          result.additionalInfo?.aliases?.map((a: any) => a.name).join(', ') ||
          '',
        externalLinks: result.url,
      }));
    } else if (source.name === 'Wikipedia') {
      setFormData((prev) => ({
        ...prev,
        bio: result.description,
        portraitUrl: result.thumbnail || '',
        wikipediaLink: result.url,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-overlay backdrop-blur-sm">
      <AnimatedItem
        direction="scale"
        springType="bouncy"
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="classical-card">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-secondary">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                <FiUser className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingComposer ? 'Editar Compositor' : 'Novo Compositor'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingComposer
                    ? 'Atualize as informações do compositor'
                    : 'Adicione um novo compositor à enciclopédia'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-theme-secondary hover:bg-theme-tertiary text-theme-tertiary hover:text-theme-primary transition-colors flex items-center justify-center"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* External Search */}
              <AnimatedCard className="classical-card-2 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FiSearch className="w-4 h-4 text-theme-tertiary" />
                    <span className="text-sm font-medium text-theme-primary">
                      Buscar em Fontes Externas
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    leftIcon={
                      searchingExternal ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiSearch />
                      )
                    }
                    onClick={searchExternalSources}
                    disabled={searchingExternal}
                  >
                    {searchingExternal ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>

                {showExternalResults && (
                  <div className="space-y-3">
                    {externalSources.map((source, idx) => (
                      <div key={idx} className="space-y-2">
                        <h4 className="text-sm font-medium text-brand-primary">
                          {source.name}
                        </h4>
                        {source.results.map(
                          (result: any, resultIdx: number) => (
                            <div
                              key={resultIdx}
                              className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-theme-primary">
                                  {result.title}
                                </div>
                                <div className="text-sm text-theme-tertiary">
                                  {result.description}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  fillFromExternalSource(source, result)
                                }
                              >
                                Usar
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AnimatedCard>

              {/* Basic Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome *"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors.name}
                    placeholder="Mozart"
                    required
                  />

                  <Input
                    label="Nome Completo *"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    error={errors.fullName}
                    placeholder="Wolfgang Amadeus Mozart"
                    required
                  />

                  <Input
                    label="Nome Alternativo"
                    value={formData.otherName}
                    onChange={(e) =>
                      handleInputChange('otherName', e.target.value)
                    }
                    placeholder="Outro nome conhecido"
                  />

                  <Input
                    label="Nomes Alternativos"
                    value={formData.alternativeNames}
                    onChange={(e) =>
                      handleInputChange('alternativeNames', e.target.value)
                    }
                    placeholder="Separados por vírgula"
                  />

                  <Input
                    label="Nomes em Outras Línguas"
                    value={formData.namesInOtherLangs}
                    onChange={(e) =>
                      handleInputChange('namesInOtherLangs', e.target.value)
                    }
                    placeholder="Separados por vírgula"
                  />

                  <Input
                    label="Pseudônimos"
                    value={formData.pseudonyms}
                    onChange={(e) =>
                      handleInputChange('pseudonyms', e.target.value)
                    }
                    placeholder="Separados por vírgula"
                  />
                </div>
              </AnimatedCard>

              {/* Dates and Images */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiCalendar className="w-5 h-5" />
                  <span>Datas e Imagens</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Data de Nascimento"
                    value={formData.birthDate}
                    onChange={(e) =>
                      handleInputChange('birthDate', e.target.value)
                    }
                    placeholder="27 de janeiro de 1756"
                  />

                  <Input
                    label="Data de Morte"
                    value={formData.deathDate}
                    onChange={(e) =>
                      handleInputChange('deathDate', e.target.value)
                    }
                    placeholder="5 de dezembro de 1791"
                  />

                  <Input
                    label="URL do Retrato"
                    value={formData.portraitUrl}
                    onChange={(e) =>
                      handleInputChange('portraitUrl', e.target.value)
                    }
                    placeholder="https://..."
                    leftIcon={<FiImage />}
                  />

                  <Input
                    label="Nacionalidade"
                    value={formData.nationality}
                    onChange={(e) =>
                      handleInputChange('nationality', e.target.value)
                    }
                    placeholder="Austríaco"
                  />
                </div>
              </AnimatedCard>

              {/* Classification */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Classificação</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Época *
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'Selecione uma época' },
                        ...epochs.map((epoch) => ({
                          value: epoch.id,
                          label: epoch.name,
                        })),
                      ]}
                      value={formData.epochId}
                      onChange={(e) =>
                        handleInputChange('epochId', e.target.value)
                      }
                      error={errors.epochId}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Papel Principal *
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'Selecione um papel' },
                        ...roles.map((role) => ({
                          value: role.id,
                          label: role.name,
                        })),
                      ]}
                      value={formData.primaryRoleId}
                      onChange={(e) =>
                        handleInputChange('primaryRoleId', e.target.value)
                      }
                      error={errors.primaryRoleId}
                      required
                    />
                  </div>

                  <Input
                    label="Instrumentos"
                    value={formData.instruments}
                    onChange={(e) =>
                      handleInputChange('instruments', e.target.value)
                    }
                    placeholder="Piano, Violino, Orquestra"
                  />

                  <Input
                    label="Categorias IMSLP"
                    value={formData.imslpCategories}
                    onChange={(e) =>
                      handleInputChange('imslpCategories', e.target.value)
                    }
                    placeholder="Romantic composers, German composers"
                  />
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiGlobe className="w-5 h-5" />
                  <span>Links Externos</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID IMSLP"
                    value={formData.imslpId}
                    onChange={(e) =>
                      handleInputChange('imslpId', e.target.value)
                    }
                    placeholder="Category:Mozart,_Wolfgang_Amadeus"
                    leftIcon={<FiExternalLink />}
                  />

                  <Input
                    label="Link da Wikipedia"
                    value={formData.wikipediaLink}
                    onChange={(e) =>
                      handleInputChange('wikipediaLink', e.target.value)
                    }
                    placeholder="https://en.wikipedia.org/wiki/..."
                    leftIcon={<FiExternalLink />}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Links Externos"
                      value={formData.externalLinks}
                      onChange={(e) =>
                        handleInputChange('externalLinks', e.target.value)
                      }
                      placeholder="Links separados por vírgula"
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Biography */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiUser className="w-5 h-5" />
                  <span>Biografia</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Biografia
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="input-classical-2 w-full resize-none"
                      placeholder="Breve biografia do compositor..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Informações Detalhadas
                    </label>
                    <textarea
                      value={formData.diverseInfo}
                      onChange={(e) =>
                        handleInputChange('diverseInfo', e.target.value)
                      }
                      rows={4}
                      className="input-classical-2 w-full resize-none"
                      placeholder="Informações detalhadas e diversas..."
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-theme-secondary">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  leftIcon={
                    isSubmitting ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiSave />
                    )
                  }
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : editingComposer
                    ? 'Atualizar Compositor'
                    : 'Criar Compositor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AnimatedItem>
    </div>
  );
};

export default CreateComposerModal;
