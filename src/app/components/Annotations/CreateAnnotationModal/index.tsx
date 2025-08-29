// app/annotations/components/CreateAnnotationModal.tsx - VERSÃO COM SELEÇÃO DE OBRA
'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { z } from 'zod';
import {
  FiMessageSquare,
  FiMusic,
  FiTarget,
  FiLayers,
  FiBookOpen,
  FiAward,
  FiTag,
  FiEye,
  FiEyeOff,
  FiX,
  FiPlus,
  FiSearch,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import { toast } from 'react-hot-toast';
import {
  useAnnotationsStore,
  AnnotationCategory,
  AnnotationDifficulty,
  AnnotationScope,
  WorkAnnotation,
} from '@/app/stores/useAnnotationsStore';
import { useAuth } from '@/app/hooks/useAuth';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Common/Button';
import Select from '@/app/components/Common/Select';
import { useSmartFormChanges } from '@/app/hooks/useFormChanges';
import Input from '../../Common/Inputs';
import { useTranslation } from '@/app/context/TranslationContext';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

interface CreateAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId?: string;
  workTitle?: string;
  composerName?: string;
  editingAnnotation?: WorkAnnotation;
}

// Schema de validação atualizado
const annotationSchema = z.object({
  workId: z.string().min(1, 'Obra é obrigatória'),
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  content: z
    .string()
    .min(1, 'Conteúdo é obrigatório')
    .min(10, 'Conteúdo deve ter pelo menos 10 caracteres')
    .max(2000, 'Conteúdo deve ter no máximo 2000 caracteres'),
  category: z.enum([
    'TECHNIQUE',
    'INTERPRETATION',
    'PRACTICE_TIP',
    'THEORY',
    'PERFORMANCE',
    'HISTORICAL',
    'GENERAL',
  ]),
  difficulty: z.enum(['ALL_LEVELS', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  scope: z.enum(['ENTIRE_WORK', 'MOVEMENT', 'SECTION', 'SPECIFIC_MEASURE']),
  measureStart: z.string().optional(),
  measureEnd: z.string().optional(),
  movement: z.string().optional(),
  section: z.string().optional(),
  pageNumber: z.string().optional(),
  hand: z.string().optional(),
  voice: z.string().optional(),
  instrument: z.string().optional(),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags permitidas'),
  isPublic: z.boolean(),
});

// Interface para obras na busca
interface WorkSearchResult {
  id: string;
  title: string;
  composer: {
    name: string;
    fullName: string;
  };
  opOrCatalog?: string;
}

// Tags sugeridas por categoria (mantidas iguais)
const SUGGESTED_TAGS_BY_CATEGORY: Record<AnnotationCategory, string[]> = {
  TECHNIQUE: [
    'dedilhado',
    'articulação',
    'postura',
    'legato',
    'staccato',
    'pedal',
    'velocidade',
    'precisão',
    'relaxamento',
    'força',
    'agilidade',
    'coordenação',
  ],
  INTERPRETATION: [
    'dinâmica',
    'fraseado',
    'expressão',
    'rubato',
    'agógica',
    'caráter',
    'estilo',
    'crescendo',
    'diminuendo',
    'cantabile',
    'espressivo',
    'dolce',
  ],
  PRACTICE_TIP: [
    'estudo-lento',
    'metrônomo',
    'repetição',
    'isolamento',
    'mãos-separadas',
    'memorização',
    'análise',
    'escalas',
    'exercícios',
    'aquecimento',
    'concentração',
    'paciência',
  ],
  THEORY: [
    'harmonia',
    'análise',
    'cadência',
    'modulação',
    'tonalidade',
    'forma',
    'estrutura',
    'progressão',
    'acorde',
    'contraponto',
    'fuga',
    'variação',
  ],
  PERFORMANCE: [
    'palco',
    'nervosismo',
    'confiança',
    'presença',
    'comunicação',
    'público',
    'concentração',
    'respiração',
    'postura-cênica',
    'entrada',
    'final',
    'expressão-corporal',
  ],
  HISTORICAL: [
    'barroco',
    'clássico',
    'romântico',
    'impressionista',
    'contexto',
    'época',
    'estilo-período',
    'influências',
    'tradição',
    'escola',
    'manuscrito',
    'edição',
  ],
  GENERAL: [
    'importante',
    'dificuldade',
    'beleza',
    'curiosidade',
    'atenção',
    'fundamental',
    'interessante',
    'útil',
    'prático',
    'essencial',
    'recomendado',
    'destaque',
  ],
};

const SUGGESTED_TAGS_BY_CATEGORY_EN: Record<AnnotationCategory, string[]> = {
  TECHNIQUE: [
    'fingering',
    'articulation',
    'posture',
    'legato',
    'staccato',
    'pedal',
    'speed',
    'precision',
    'relaxation',
    'strength',
    'agility',
    'coordination',
  ],
  INTERPRETATION: [
    'dynamics',
    'phrasing',
    'expression',
    'rubato',
    'agogic',
    'character',
    'style',
    'crescendo',
    'diminuendo',
    'cantabile',
    'espressivo',
    'dolce',
  ],
  PRACTICE_TIP: [
    'slow-study',
    'metronome',
    'repetition',
    'isolation',
    'separate hands',
    'memorization',
    'analysis',
    'scales',
    'exercises',
    'warm-up',
    'concentration',
    'patience',
  ],
  THEORY: [
    'harmony',
    'analysis',
    'cadence',
    'modulation',
    'tonality',
    'form',
    'structure',
    'progression',
    'chord',
    'counterpoint',
    'fugue',
    'variation',
  ],
  PERFORMANCE: [
    'stage',
    'nervousness',
    'confidence',
    'presence',
    'communication',
    'audience',
    'concentration',
    'breathing',
    'stage posture',
    'entrance',
    'finale',
    'body language',
  ],
  HISTORICAL: [
    'baroque',
    'classical',
    'romantic',
    'impressionist',
    'context',
    'era',
    'style-period',
    'influences',
    'tradition',
    'school',
    'manuscript',
    'edition',
  ],
  GENERAL: [
    'important',
    'difficulty',
    'beauty',
    'curiosity',
    'attention',
    'fundamental',
    'interesting',
    'useful',
    'practical',
    'essential',
    'recommended',
    'highlight',
  ],
};

export default function CreateAnnotationModal({
  isOpen,
  onClose,
  workId = '',
  workTitle = '',
  composerName = '',
  editingAnnotation,
}: CreateAnnotationModalProps) {
  const { t } = useTranslation({ sections: ['pages/annotations'] });
  const { user } = useAuth();
  const { createAnnotation, updateAnnotation, loading } = useAnnotationsStore();
  const isEditing = !!editingAnnotation;
  const isSubmitting =
    loading.create || (isEditing && loading.update.has(editingAnnotation.id));

  // Estados para busca de obras
  const [workSearchTerm, setWorkSearchTerm] = useState('');
  const [workSearchResults, setWorkSearchResults] = useState<
    WorkSearchResult[]
  >([]);
  const [showWorkSearch, setShowWorkSearch] = useState(!workId);
  const [selectedWork, setSelectedWork] = useState<WorkSearchResult | null>(
    null
  );
  const [loadingWorks, setLoadingWorks] = useState(false);

  // Refs para scroll automático
  const fieldRefs = {
    title: useRef<HTMLInputElement>(null),
    content: useRef<HTMLTextAreaElement>(null),
    category: useRef<HTMLSelectElement>(null),
    measureStart: useRef<HTMLInputElement>(null),
    measureEnd: useRef<HTMLInputElement>(null),
    movement: useRef<HTMLInputElement>(null),
    section: useRef<HTMLInputElement>(null),
  };

  // Form state
  const [formData, setFormData] = useState({
    workId: workId,
    title: '',
    content: '',
    category: 'GENERAL' as AnnotationCategory,
    difficulty: 'ALL_LEVELS' as AnnotationDifficulty,
    scope: 'ENTIRE_WORK' as AnnotationScope,
    measureStart: '',
    measureEnd: '',
    movement: '',
    section: '',
    pageNumber: '',
    hand: '',
    voice: '',
    instrument: '',
    tags: [] as string[],
    isPublic: true,
  });

  const originalData = useMemo(() => {
    if (!editingAnnotation) return null;

    return {
      workId: editingAnnotation.workId,
      title: editingAnnotation.title,
      content: editingAnnotation.content,
      category: editingAnnotation.category,
      difficulty: editingAnnotation.difficulty,
      scope: editingAnnotation.scope,
      measureStart: editingAnnotation.measureStart?.toString() || '',
      measureEnd: editingAnnotation.measureEnd?.toString() || '',
      movement: editingAnnotation.movement || '',
      section: editingAnnotation.section || '',
      pageNumber: editingAnnotation.pageNumber?.toString() || '',
      hand: editingAnnotation.hand || '',
      voice: editingAnnotation.voice || '',
      instrument: editingAnnotation.instrument || '',
      tags: editingAnnotation.tags || [],
      isPublic: editingAnnotation.isPublic,
    };
  }, [editingAnnotation]);

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasChanges = useSmartFormChanges(
    formData,
    originalData, // Se null = modo criação, se preenchido = modo edição
    ['category', 'difficulty', 'scope', 'workId', 'isPublic']
  );

  // Dynamic options with translations
  const CATEGORY_OPTIONS = useMemo(
    () => [
      {
        value: 'TECHNIQUE',
        label: t('category_technique'),
        icon: FiTarget,
        description: 'Dedilhado, articulação, postura',
      },
      {
        value: 'INTERPRETATION',
        label: t('category_interpretation'),
        icon: GiMusicalNotes,
        description: 'Dinâmica, fraseado, expressão',
      },
      {
        value: 'PRACTICE_TIP',
        label: t('category_practice_tip'),
        icon: FiBookOpen,
        description: 'Métodos e estratégias de prática',
      },
      {
        value: 'THEORY',
        label: t('category_theory'),
        icon: FiLayers,
        description: 'Análise harmônica e formal',
      },
      {
        value: 'PERFORMANCE',
        label: t('category_performance'),
        icon: FiMusic,
        description: 'Apresentação e palco',
      },
      {
        value: 'HISTORICAL',
        label: t('category_historical'),
        icon: FiAward,
        description: 'História e contexto cultural',
      },
      {
        value: 'GENERAL',
        label: t('category_general'),
        icon: FiMessageSquare,
        description: 'Comentários gerais',
      },
    ],
    [t]
  );

  const DIFFICULTY_OPTIONS = useMemo(
    () => [
      { value: 'ALL_LEVELS', label: t('difficulty_all_levels') },
      { value: 'BEGINNER', label: t('difficulty_beginner') },
      { value: 'INTERMEDIATE', label: t('difficulty_intermediate') },
      { value: 'ADVANCED', label: t('difficulty_advanced') },
    ],
    [t]
  );

  const SCOPE_OPTIONS = useMemo(
    () => [
      { value: 'ENTIRE_WORK', label: t('scope_entire_work') },
      { value: 'MOVEMENT', label: t('scope_movement') },
      { value: 'SECTION', label: t('scope_section') },
      { value: 'SPECIFIC_MEASURE', label: t('scope_specific_measure') },
    ],
    [t]
  );

  const HAND_OPTIONS = useMemo(
    () => [
      { value: '', label: t('create_modal_hand_not_specified') },
      { value: 'left', label: t('create_modal_hand_left') },
      { value: 'right', label: t('create_modal_hand_right') },
      { value: 'both', label: t('create_modal_hand_both') },
    ],
    [t]
  );

  // Função para buscar obras
  const searchWorks = async (query: string) => {
    if (query.length < 2) {
      setWorkSearchResults([]);
      return;
    }

    setLoadingWorks(true);
    try {
      const response = await fetch(
        `/api/works/search?q=${encodeURIComponent(query)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setWorkSearchResults(data.works || []);
      }
    } catch (error) {
      console.error('Erro ao buscar obras:', error);
    } finally {
      setLoadingWorks(false);
    }
  };

  // Effect para busca de obras
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (workSearchTerm && showWorkSearch) {
        searchWorks(workSearchTerm);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [workSearchTerm, showWorkSearch]);

  // Handler para selecionar obra
  const handleWorkSelect = (work: WorkSearchResult) => {
    setSelectedWork(work);
    setFormData((prev) => ({ ...prev, workId: work.id }));
    setShowWorkSearch(false);
    setWorkSearchTerm('');
    setWorkSearchResults([]);
  };

  // Função para scroll automático para o primeiro erro
  const scrollToFirstError = (errorFields: string[]) => {
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0] as keyof typeof fieldRefs;
      const fieldRef = fieldRefs[firstErrorField];

      if (fieldRef?.current) {
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        setTimeout(() => {
          fieldRef.current?.focus();
        }, 500);
      }
    }
  };

  // Validação com Zod + validações condicionais
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      annotationSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
      }
    }

    // Validações condicionais específicas
    if (formData.scope === 'SPECIFIC_MEASURE') {
      if (!formData.measureStart.trim()) {
        newErrors.measureStart = 'Compasso inicial é obrigatório';
      } else if (parseInt(formData.measureStart) < 1) {
        newErrors.measureStart = 'Compasso deve ser maior que 0';
      }

      if (
        formData.measureEnd &&
        formData.measureStart &&
        parseInt(formData.measureEnd) < parseInt(formData.measureStart)
      ) {
        newErrors.measureEnd = 'Compasso final deve ser maior que o inicial';
      }
    }

    if (formData.scope === 'MOVEMENT' && !formData.movement.trim()) {
      newErrors.movement = 'Nome do movimento é obrigatório';
    }

    if (formData.scope === 'SECTION' && !formData.section.trim()) {
      newErrors.section = 'Nome da seção é obrigatório';
    }

    setErrors(newErrors);

    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      setTimeout(() => {
        scrollToFirstError(errorFields);
      }, 100);
    }

    return Object.keys(newErrors).length === 0;
  };

  // Initialize form with editing data
  useEffect(() => {
    if (isEditing && editingAnnotation) {
      setFormData({
        workId: editingAnnotation.workId,
        title: editingAnnotation.title,
        content: editingAnnotation.content,
        category: editingAnnotation.category,
        difficulty: editingAnnotation.difficulty,
        scope: editingAnnotation.scope,
        measureStart: editingAnnotation.measureStart?.toString() || '',
        measureEnd: editingAnnotation.measureEnd?.toString() || '',
        movement: editingAnnotation.movement || '',
        section: editingAnnotation.section || '',
        pageNumber: editingAnnotation.pageNumber?.toString() || '',
        hand: editingAnnotation.hand || '',
        voice: editingAnnotation.voice || '',
        instrument: editingAnnotation.instrument || '',
        tags: editingAnnotation.tags || [],
        isPublic: editingAnnotation.isPublic,
      });

      // Configurar obra selecionada para edição
      if (editingAnnotation.work) {
        setSelectedWork({
          id: editingAnnotation.workId,
          title: editingAnnotation.work.title,
          composer: editingAnnotation.work.composer,
        });
        setShowWorkSearch(false);
      }
    } else {
      // Reset form for new annotation
      setFormData({
        workId: workId,
        title: '',
        content: '',
        category: 'GENERAL',
        difficulty: 'ALL_LEVELS',
        scope: 'ENTIRE_WORK',
        measureStart: '',
        measureEnd: '',
        movement: '',
        section: '',
        pageNumber: '',
        hand: '',
        voice: '',
        instrument: '',
        tags: [],
        isPublic: true,
      });

      // Configurar obra selecionada para nova anotação
      if (workId && workTitle && composerName) {
        setSelectedWork({
          id: workId,
          title: workTitle,
          composer: {
            name: composerName.split(' ')[0] || composerName,
            fullName: composerName,
          },
        });
        setShowWorkSearch(false);
      } else {
        setSelectedWork(null);
        setShowWorkSearch(true);
      }
    }
    setErrors({});
    setNewTag('');
  }, [isEditing, editingAnnotation, isOpen, workId, workTitle, composerName]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      toast.error('Você precisa estar logado para criar anotações');
      return;
    }

    const submitData = {
      workId: formData.workId,
      userId: user.id,
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      difficulty: formData.difficulty,
      scope: formData.scope,
      measureStart: formData.measureStart
        ? parseInt(formData.measureStart)
        : undefined,
      measureEnd: formData.measureEnd
        ? parseInt(formData.measureEnd)
        : undefined,
      movement: formData.movement.trim() || undefined,
      section: formData.section.trim() || undefined,
      pageNumber: formData.pageNumber
        ? parseInt(formData.pageNumber)
        : undefined,
      hand: formData.hand || undefined,
      voice: formData.voice.trim() || undefined,
      instrument: formData.instrument.trim() || undefined,
      tags: formData.tags.filter((tag) => tag.trim().length > 0),
      isPublic: formData.isPublic,
      // Incluir dados da obra
      work: selectedWork
        ? {
            id: selectedWork.id,
            title: selectedWork.title,
            composer: selectedWork.composer,
          }
        : undefined,
    };

    try {
      let result;
      if (isEditing) {
        result = await updateAnnotation(editingAnnotation.id, submitData);
      } else {
        result = await createAnnotation(submitData);
      }

      console.log('RESULT', isEditing);

      if (result) {
        toast.success(
          isEditing
            ? 'Anotação atualizada com sucesso!'
            : 'Anotação criada com sucesso!',
          { icon: isEditing ? '✏️' : '🎵' }
        );
        onClose();
      } else {
        toast.error('Erro ao salvar anotação. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar anotação:', error);
      toast.error('Erro ao salvar anotação. Tente novamente.');
    }
  };

  const addTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim().toLowerCase();
    if (
      tagToAdd &&
      !formData.tags.includes(tagToAdd) &&
      formData.tags.length < 10
    ) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagToAdd],
      }));
      if (!tag) setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      e.target === document.querySelector('input[placeholder*="tag"]')
    ) {
      e.preventDefault();
      addTag();
    }
  };

  const { language } = useLanguageStore();
  const currentTags =
    language === 'en'
      ? SUGGESTED_TAGS_BY_CATEGORY_EN
      : SUGGESTED_TAGS_BY_CATEGORY;
  // Get suggested tags for current category
  const suggestedTags = currentTags[formData.category] || [];
  const availableSuggestedTags = suggestedTags.filter(
    (tag) => !formData.tags.includes(tag)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isEditing && originalData) {
          setFormData(originalData);
        }
        onClose();
      }}
      maxWidth="2xl"
      showCloseButton={true}
      className="max-h-[90vh] overflow-hidden"
      confirmOnClose={true} // Ativa confirmação
      hasChanges={hasChanges} // Detecta mudanças
      isProcessing={isSubmitting} // Detecta processo
      processName="Criação de anotação."
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-theme-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center shadow-theme-glow">
            <FiMessageSquare className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {isEditing
                ? t('create_modal_edit_title')
                : t('create_modal_new_title')}
            </h2>
            <p className="text-sm text-theme-secondary">
              {isEditing
                ? t('create_modal_edit_subtitle')
                : t('create_modal_new_subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Work Info/Selection */}
      <div className="px-6 py-4 bg-theme-elevated/50 border-b border-theme-secondary">
        {selectedWork ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiMusic className="w-5 h-5 text-theme-tertiary" />
              <div>
                <h3 className="font-semibold text-theme-primary">
                  {selectedWork.title}
                </h3>
                <p className="text-sm text-theme-secondary">
                  {selectedWork.composer.fullName}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <FiSearch className="w-4 h-4 text-theme-tertiary" />
              <span className="text-sm font-medium text-theme-primary">
                {t('create_modal_select_work')}
              </span>
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder={t('create_modal_search_works')}
                value={workSearchTerm}
                onChange={(e) => setWorkSearchTerm(e.target.value)}
                className="w-full input-classical-2"
              />
              {loadingWorks && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin text-theme-tertiary"></div>
                </div>
              )}
            </div>

            {workSearchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-theme-elevated border border-theme-primary/30 rounded-xl">
                {workSearchResults.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => handleWorkSelect(work)}
                    className="w-full p-3 text-left hover:bg-interactive-hover border-b border-theme-primary/20 last:border-b-0 transition-colors"
                  >
                    <div className="font-medium text-theme-primary text-sm">
                      {work.title}
                    </div>
                    <div className="text-xs text-theme-secondary">
                      {work.composer.fullName}
                      {work.opOrCatalog && ` • ${work.opOrCatalog}`}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.workId && (
              <p className="text-accent-red text-sm mt-1">{errors.workId}</p>
            )}
          </div>
        )}
      </div>

      {/* Form Content - Scrollable */}
      <div className="px-6 py-6 space-y-6 overflow-y-auto">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            {t('create_modal_annotation_title')} *
          </label>
          <Input
            ref={fieldRefs.title}
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={`w-full input-classical-2 ${
              errors.title ? '!border-red-400' : ''
            }`}
            placeholder={t('create_modal_annotation_title_placeholder')}
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-theme-tertiary text-xs mt-1">
            {formData.title.length}/100 {t('create_modal_characters')}
          </p>
        </div>

        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              {t('create_modal_category')} *
            </label>
            <Select
              options={CATEGORY_OPTIONS}
              ref={fieldRefs.category}
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  category: e.target.value as AnnotationCategory,
                }))
              }
              className={`w-full input-classical-2 ${
                errors.category ? 'border-accent-red' : ''
              }`}
            />
            {errors.category && (
              <p className="text-accent-red text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              {t('create_modal_difficulty_level')}
            </label>
            <Select
              options={DIFFICULTY_OPTIONS}
              value={formData.difficulty}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty: e.target.value as AnnotationDifficulty,
                }))
              }
              className="w-full input-classical-2"
            />
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            {t('create_modal_annotation_scope')}
          </label>
          <Select
            options={SCOPE_OPTIONS}
            value={formData.scope}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                scope: e.target.value as AnnotationScope,
              }))
            }
            className="w-full input-classical-2"
          />
        </div>

        {/* Conditional location fields */}
        {formData.scope === 'SPECIFIC_MEASURE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                {t('create_modal_initial_measure')} *
              </label>
              <Input
                ref={fieldRefs.measureStart}
                type="number"
                min="1"
                value={formData.measureStart}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    measureStart: e.target.value,
                  }))
                }
                className={`w-full input-classical-2 ${
                  errors.measureStart ? 'border-accent-red' : ''
                }`}
                placeholder={t('create_modal_measure_placeholder')}
              />
              {errors.measureStart && (
                <p className="text-accent-red text-sm mt-1">
                  {errors.measureStart}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                {t('create_modal_final_measure')}
              </label>
              <Input
                ref={fieldRefs.measureEnd}
                type="number"
                min="1"
                value={formData.measureEnd}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    measureEnd: e.target.value,
                  }))
                }
                className={`w-full input-classical-2 ${
                  errors.measureEnd ? 'border-accent-red' : ''
                }`}
                placeholder={t('create_modal_measure_end_placeholder')}
              />
              {errors.measureEnd && (
                <p className="text-accent-red text-sm mt-1">
                  {errors.measureEnd}
                </p>
              )}
            </div>
          </div>
        )}

        {formData.scope === 'MOVEMENT' && (
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              {t('create_modal_movement_name')} *
            </label>
            <Input
              ref={fieldRefs.movement}
              type="text"
              value={formData.movement}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, movement: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.movement ? 'border-accent-red' : ''
              }`}
              placeholder={t('create_modal_movement_placeholder')}
            />
            {errors.movement && (
              <p className="text-accent-red text-sm mt-1">{errors.movement}</p>
            )}
          </div>
        )}

        {formData.scope === 'SECTION' && (
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              {t('create_modal_section_name')} *
            </label>
            <Input
              ref={fieldRefs.section}
              type="text"
              value={formData.section}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, section: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.section ? 'border-accent-red' : ''
              }`}
              placeholder={t('create_modal_section_placeholder')}
            />
            {errors.section && (
              <p className="text-accent-red text-sm mt-1">{errors.section}</p>
            )}
          </div>
        )}

        {/* Additional details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              {t('create_modal_specific_hand')}
            </label>
            <Select
              options={HAND_OPTIONS}
              value={formData.hand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hand: e.target.value }))
              }
              className="w-full input-classical-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              {t('create_modal_sheet_page')}
            </label>
            <Input
              type="number"
              min="1"
              value={formData.pageNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pageNumber: e.target.value }))
              }
              className="w-full input-classical-2"
              placeholder={t('create_modal_page_placeholder')}
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            {t('create_modal_annotation_content')} *
          </label>
          <textarea
            ref={fieldRefs.content}
            value={formData.content}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, content: e.target.value }))
            }
            className={`w-full input-classical-2 resize-none ${
              errors.content ? '!border-red-400' : ''
            }`}
            rows={6}
            placeholder={t('create_modal_content_placeholder')}
            maxLength={2000}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
          <p className="text-theme-tertiary text-xs mt-1">
            {formData.content.length}/2000 {t('create_modal_characters')}
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            {t('create_modal_tags_optional')}
          </label>

          {/* Current Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm flex items-center space-x-2"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="text-brand-primary hover:text-accent-red transition-colors"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Tag Input */}
          <div className="flex space-x-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 input-classical-2"
              placeholder={t('create_modal_tag_placeholder')}
              maxLength={20}
            />
            <button
              onClick={() => addTag()}
              disabled={!newTag.trim() || formData.tags.length >= 10}
              className="btn-classical-secondary flex items-center space-x-1"
            >
              <FiTag className="w-4 h-4" />
              <span>{t('create_modal_add_tag')}</span>
            </button>
          </div>

          {/* Suggested Tags */}
          {availableSuggestedTags.length > 0 && formData.tags.length < 10 && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <FiPlus className="w-4 h-4 text-theme-tertiary" />
                <span className="text-sm font-medium text-theme-secondary">
                  {t('create_modal_suggested_tags').replace(
                    '{category}',
                    CATEGORY_OPTIONS.find((c) => c.value === formData.category)
                      ?.label || ''
                  )}
                  :
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSuggestedTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 bg-theme-elevated hover:bg-brand-primary/10 border border-theme-secondary hover:border-brand-primary/30 text-theme-secondary hover:text-brand-primary rounded-md text-xs transition-all duration-200 flex items-center space-x-1"
                  >
                    <FiPlus className="w-3 h-3" />
                    <span>#{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errors.tags && (
            <p className="text-accent-red text-sm mt-1">{errors.tags}</p>
          )}
          <p className="text-theme-tertiary text-xs">
            {t('create_modal_max_tags')}
          </p>
        </div>

        {/* Privacy */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
            }
            className={` rounded-lg gap-4 border-2 flex items-center justify-center transition-all ${
              formData.isPublic
                ? 'bg-accent-green border-none text-theme-primary'
                : 'bg-accent-red border-none text-theme-primary'
            }`}
          >
            {formData.isPublic ? (
              <FiEye className="w-4 h-4" />
            ) : (
              <FiEyeOff className="w-4 h-4" />
            )}

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-theme-primary">
                  {formData.isPublic
                    ? t('create_modal_public_annotation')
                    : t('create_modal_private_annotation')}
                </span>
                {formData.isPublic ? (
                  <FiEye className="w-4 h-4 text-accent-green" />
                ) : (
                  <FiEyeOff className="w-4 h-4 text-accent-red" />
                )}
              </div>
              <p className="text-sm text-theme-secondary">
                {formData.isPublic
                  ? t('create_modal_public_description')
                  : t('create_modal_private_description')}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-theme-secondary flex items-center justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          {t('create_modal_cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
          disabled={!selectedWork} // Desabilitar se não há obra selecionada
        >
          {isEditing ? t('create_modal_update') : t('create_modal_create')}
        </Button>
      </div>
    </Modal>
  );
}
