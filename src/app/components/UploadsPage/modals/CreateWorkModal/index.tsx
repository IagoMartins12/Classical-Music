'use client';

// app/components/modals/CreateWorkModal.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FiX,
  FiMusic,
  FiExternalLink,
  FiSave,
  FiLoader,
  FiInfo,
  FiTag,
  FiPlay,
} from 'react-icons/fi';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import Checkbox from '@/app/components/Common/Checkbox';

interface CreateWorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  composers: Array<{ id: string; name: string; fullName: string }>;
  instruments: Array<{ id: string; name: string; category: string }>;
  epochs: Array<{ id: string; name: string }>;
  editingWork?: any;
}

const workTypeOptions = [
  { value: 'INDIVIDUAL', label: 'Obra Individual' },
  { value: 'COMPLETE_WORK', label: 'Obra Completa' },
  { value: 'ARRANGEMENT', label: 'Arranjo' },
  { value: 'COLLECTION', label: 'Coleção' },
  { value: 'COLLABORATION', label: 'Colaboração' },
  { value: 'COMPOSITION', label: 'Composição' },
  { value: 'COLLECTED_WORKS', label: 'Obras Coletadas' },
  { value: 'COLLECTIONS_WITH', label: 'Coleções com' },
];

const difficultyOptions = [
  { value: '', label: 'Não especificado' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const CreateWorkModal = ({
  isOpen,
  onClose,
  composers,
  instruments,
  epochs,
  editingWork,
}: CreateWorkModalProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    composerId: '',
    instrumentId: '',
    epochId: '',
    videoUrl: '',
    imslpId: '',
    opOrCatalog: '',
    compositionYear: '',
    firstPublishDate: '',
    tone: '',
    mediaDuration: '',
    workStyle: '',
    moviment: '',
    categoryNames: '',
    workGenresArr: '',
    dedicateTo: '',
    dedicationComposerLink: '',
    instrumentation: '',
    workType: 'INDIVIDUAL',
    isPartOfCollection: false,
    parentWorkId: '',
    movementNumber: '',
    subtitle: '',
    timeSignature: '',
    tempoMarking: '',
    movementsDetailed: '',
    imslpTags: '',
    difficultyLevel: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when editing
  useEffect(() => {
    if (editingWork) {
      setFormData({
        title: editingWork.title || '',
        composerId: editingWork.composerId || '',
        instrumentId: editingWork.instrumentId || '',
        epochId: editingWork.epochId || '',
        videoUrl: editingWork.videoUrl || '',
        imslpId: editingWork.imslpId || '',
        opOrCatalog: editingWork.opOrCatalog || '',
        compositionYear: editingWork.compositionYear || '',
        firstPublishDate: editingWork.firstPublishDate || '',
        tone: editingWork.tone || '',
        mediaDuration: editingWork.mediaDuration || '',
        workStyle: editingWork.workStyle || '',
        moviment: editingWork.moviment || '',
        categoryNames: editingWork.categoryNames?.join(', ') || '',
        workGenresArr: editingWork.workGenresArr?.join(', ') || '',
        dedicateTo: editingWork.dedicateTo || '',
        dedicationComposerLink: editingWork.dedicationComposerLink || '',
        instrumentation: editingWork.instrumentation || '',
        workType: editingWork.workType || 'INDIVIDUAL',
        isPartOfCollection: editingWork.isPartOfCollection || false,
        parentWorkId: editingWork.parentWorkId || '',
        movementNumber: editingWork.movementNumber?.toString() || '',
        subtitle: editingWork.subtitle || '',
        timeSignature: editingWork.timeSignature || '',
        tempoMarking: editingWork.tempoMarking || '',
        movementsDetailed: editingWork.movementsDetailed
          ? JSON.stringify(editingWork.movementsDetailed)
          : '',
        imslpTags: editingWork.imslpTags?.join(', ') || '',
        difficultyLevel: editingWork.difficultyLevel || '',
      });
    }
  }, [editingWork]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }
    if (!formData.composerId) {
      newErrors.composerId = 'Compositor é obrigatório';
    }
    if (!formData.instrumentId) {
      newErrors.instrumentId = 'Instrumento é obrigatório';
    }
    if (!formData.epochId) {
      newErrors.epochId = 'Época é obrigatória';
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
      // Convert string arrays back to arrays
      const submitData = {
        ...formData,
        categoryNames: formData.categoryNames
          ? formData.categoryNames.split(',').map((s) => s.trim())
          : [],
        workGenresArr: formData.workGenresArr
          ? formData.workGenresArr.split(',').map((s) => s.trim())
          : [],
        imslpTags: formData.imslpTags
          ? formData.imslpTags.split(',').map((s) => s.trim())
          : [],
        movementNumber: formData.movementNumber
          ? parseInt(formData.movementNumber)
          : null,
        movementsDetailed: formData.movementsDetailed
          ? JSON.parse(formData.movementsDetailed)
          : null,
      };

      const url = editingWork
        ? `/api/uploads/work/${editingWork.id}`
        : '/api/uploads/work';

      const method = editingWork ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh();
        onClose();
        alert(data.message || 'Obra salva com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao salvar obra');
      }
    } catch (error) {
      console.error('Erro ao salvar obra:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar obra');
    } finally {
      setIsSubmitting(false);
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
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-green rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {editingWork ? 'Editar Obra' : 'Nova Obra'}
                </h2>
                <p className="text-theme-secondary text-sm">
                  {editingWork
                    ? 'Atualize as informações da obra'
                    : 'Adicione uma nova obra à enciclopédia'}
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
              {/* Basic Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Informações Básicas</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Título *"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    error={errors.title}
                    placeholder="Sinfonia No. 40 em Sol menor"
                    required
                  />

                  <Input
                    label="Subtítulo"
                    value={formData.subtitle}
                    onChange={(e) =>
                      handleInputChange('subtitle', e.target.value)
                    }
                    placeholder="Subtítulo da obra"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Compositor *
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'Selecione um compositor' },
                        ...composers.map((composer) => ({
                          value: composer.id,
                          label: composer.fullName || composer.name,
                        })),
                      ]}
                      value={formData.composerId}
                      onChange={(e) =>
                        handleInputChange('composerId', e.target.value)
                      }
                      error={errors.composerId}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Instrumento *
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'Selecione um instrumento' },
                        ...instruments.map((instrument) => ({
                          value: instrument.id,
                          label: `${instrument.name} (${instrument.category})`,
                        })),
                      ]}
                      value={formData.instrumentId}
                      onChange={(e) =>
                        handleInputChange('instrumentId', e.target.value)
                      }
                      error={errors.instrumentId}
                      required
                    />
                  </div>

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
                      Tipo de Obra
                    </label>
                    <Select
                      options={workTypeOptions}
                      value={formData.workType}
                      onChange={(e) =>
                        handleInputChange('workType', e.target.value)
                      }
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Catalog Information */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Informações de Catálogo</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Op. ou Catálogo"
                    value={formData.opOrCatalog}
                    onChange={(e) =>
                      handleInputChange('opOrCatalog', e.target.value)
                    }
                    placeholder="K. 550, Op. 67"
                  />

                  <Input
                    label="Ano de Composição"
                    value={formData.compositionYear}
                    onChange={(e) =>
                      handleInputChange('compositionYear', e.target.value)
                    }
                    placeholder="1788"
                  />

                  <Input
                    label="Primeira Publicação"
                    value={formData.firstPublishDate}
                    onChange={(e) =>
                      handleInputChange('firstPublishDate', e.target.value)
                    }
                    placeholder="1794"
                  />

                  <Input
                    label="Tonalidade"
                    value={formData.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    placeholder="G minor"
                  />

                  <Input
                    label="Duração"
                    value={formData.mediaDuration}
                    onChange={(e) =>
                      handleInputChange('mediaDuration', e.target.value)
                    }
                    placeholder="35 minutos"
                  />

                  <div>
                    <label className="block text-sm font-medium text-theme-tertiary mb-2">
                      Dificuldade
                    </label>
                    <Select
                      options={difficultyOptions}
                      value={formData.difficultyLevel}
                      onChange={(e) =>
                        handleInputChange('difficultyLevel', e.target.value)
                      }
                    />
                  </div>
                </div>
              </AnimatedCard>

              {/* Musical Details */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiMusic className="w-5 h-5" />
                  <span>Detalhes Musicais</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Compasso"
                    value={formData.timeSignature}
                    onChange={(e) =>
                      handleInputChange('timeSignature', e.target.value)
                    }
                    placeholder="4/4"
                  />

                  <Input
                    label="Andamento"
                    value={formData.tempoMarking}
                    onChange={(e) =>
                      handleInputChange('tempoMarking', e.target.value)
                    }
                    placeholder="Allegro molto"
                  />

                  <Input
                    label="Estilo"
                    value={formData.workStyle}
                    onChange={(e) =>
                      handleInputChange('workStyle', e.target.value)
                    }
                    placeholder="Classical"
                  />

                  <Input
                    label="Movimento"
                    value={formData.moviment}
                    onChange={(e) =>
                      handleInputChange('moviment', e.target.value)
                    }
                    placeholder="I. Allegro molto"
                  />

                  <Input
                    label="Instrumentação"
                    value={formData.instrumentation}
                    onChange={(e) =>
                      handleInputChange('instrumentation', e.target.value)
                    }
                    placeholder="2 flautas, 2 oboés, 2 clarinetes..."
                  />

                  <Input
                    label="Dedicado a"
                    value={formData.dedicateTo}
                    onChange={(e) =>
                      handleInputChange('dedicateTo', e.target.value)
                    }
                    placeholder="Nome do dedicatário"
                  />
                </div>
              </AnimatedCard>

              {/* Categories and Tags */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiTag className="w-5 h-5" />
                  <span>Categorias e Tags</span>
                </h3>

                <div className="space-y-4">
                  <Input
                    label="Categorias"
                    value={formData.categoryNames}
                    onChange={(e) =>
                      handleInputChange('categoryNames', e.target.value)
                    }
                    placeholder="Sinfonia, Orquestra, Clássico (separadas por vírgula)"
                  />

                  <Input
                    label="Gêneros"
                    value={formData.workGenresArr}
                    onChange={(e) =>
                      handleInputChange('workGenresArr', e.target.value)
                    }
                    placeholder="Sinfônico, Clássico, Dramático (separados por vírgula)"
                  />

                  <Input
                    label="Tags IMSLP"
                    value={formData.imslpTags}
                    onChange={(e) =>
                      handleInputChange('imslpTags', e.target.value)
                    }
                    placeholder="Symphonies, Orchestral works (separadas por vírgula)"
                  />
                </div>
              </AnimatedCard>

              {/* External Links */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiExternalLink className="w-5 h-5" />
                  <span>Links Externos</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="ID IMSLP"
                    value={formData.imslpId}
                    onChange={(e) =>
                      handleInputChange('imslpId', e.target.value)
                    }
                    placeholder="Symphony_No.40_(Mozart,_Wolfgang_Amadeus)"
                    leftIcon={<FiExternalLink />}
                  />

                  <Input
                    label="URL do Vídeo"
                    value={formData.videoUrl}
                    onChange={(e) =>
                      handleInputChange('videoUrl', e.target.value)
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    leftIcon={<FiPlay />}
                  />
                </div>
              </AnimatedCard>

              {/* Collection Settings */}
              <AnimatedCard className="classical-card-2 p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                  <FiInfo className="w-5 h-5" />
                  <span>Configurações de Coleção</span>
                </h3>

                <div className="space-y-4">
                  <Checkbox
                    label="Parte de uma coleção"
                    checked={formData.isPartOfCollection}
                    onChange={(e) =>
                      handleInputChange('isPartOfCollection', e.target.checked)
                    }
                  />

                  {formData.isPartOfCollection && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Número do Movimento"
                        value={formData.movementNumber}
                        onChange={(e) =>
                          handleInputChange('movementNumber', e.target.value)
                        }
                        placeholder="1"
                        type="number"
                      />

                      <Input
                        label="ID da Obra Pai"
                        value={formData.parentWorkId}
                        onChange={(e) =>
                          handleInputChange('parentWorkId', e.target.value)
                        }
                        placeholder="ID da obra principal"
                      />
                    </div>
                  )}
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
                    : editingWork
                    ? 'Atualizar Obra'
                    : 'Criar Obra'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </AnimatedItem>
    </div>
  );
};

export default CreateWorkModal;
