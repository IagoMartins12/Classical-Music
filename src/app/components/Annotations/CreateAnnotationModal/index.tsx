// components/Annotations/CreateAnnotationModal.tsx - VERSÃO COM ZOD + SCROLL AUTOMÁTICO
'use client';

import { useState, useEffect, useRef } from 'react';
import { z } from 'zod';
import {
  FiMessageSquare,
  FiMusic,
  FiTarget,
  FiLayers,
  FiBookOpen,
  FiAward,
  FiMapPin,
  FiTag,
  FiEye,
  FiEyeOff,
  FiSave,
  FiX,
  FiPlus,
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
import Modal from '../../Modal';
import Button from '../../Common/Button';

interface CreateAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workId: string;
  workTitle: string;
  composerName: string;
  editingAnnotation?: WorkAnnotation;
}

// 🎯 Schema de validação com Zod
const annotationSchema = z.object({
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

const CATEGORY_OPTIONS = [
  {
    value: 'TECHNIQUE',
    label: 'Técnica',
    icon: FiTarget,
    description: 'Dedilhado, articulação, postura',
  },
  {
    value: 'INTERPRETATION',
    label: 'Interpretação',
    icon: GiMusicalNotes,
    description: 'Dinâmica, fraseado, expressão',
  },
  {
    value: 'PRACTICE_TIP',
    label: 'Dicas de Estudo',
    icon: FiBookOpen,
    description: 'Métodos e estratégias de prática',
  },
  {
    value: 'THEORY',
    label: 'Teoria',
    icon: FiLayers,
    description: 'Análise harmônica e formal',
  },
  {
    value: 'PERFORMANCE',
    label: 'Performance',
    icon: FiMusic,
    description: 'Apresentação e palco',
  },
  {
    value: 'HISTORICAL',
    label: 'Contexto',
    icon: FiAward,
    description: 'História e contexto cultural',
  },
  {
    value: 'GENERAL',
    label: 'Geral',
    icon: FiMessageSquare,
    description: 'Comentários gerais',
  },
];

const DIFFICULTY_OPTIONS = [
  { value: 'ALL_LEVELS', label: 'Todos os níveis' },
  { value: 'BEGINNER', label: 'Iniciante' },
  { value: 'INTERMEDIATE', label: 'Intermediário' },
  { value: 'ADVANCED', label: 'Avançado' },
];

const SCOPE_OPTIONS = [
  { value: 'ENTIRE_WORK', label: 'Obra inteira' },
  { value: 'MOVEMENT', label: 'Movimento específico' },
  { value: 'SECTION', label: 'Seção específica' },
  { value: 'SPECIFIC_MEASURE', label: 'Compasso(s) específico(s)' },
];

const HAND_OPTIONS = [
  { value: '', label: 'Não especificado' },
  { value: 'left', label: 'Mão esquerda' },
  { value: 'right', label: 'Mão direita' },
  { value: 'both', label: 'Ambas as mãos' },
];

// Tags sugeridas por categoria
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

export default function CreateAnnotationModal({
  isOpen,
  onClose,
  workId,
  workTitle,
  composerName,
  editingAnnotation,
}: CreateAnnotationModalProps) {
  const { user } = useAuth();
  const { createAnnotation, updateAnnotation, loading } = useAnnotationsStore();
  const isEditing = !!editingAnnotation;
  const isSubmitting =
    loading.create || (isEditing && loading.update.has(editingAnnotation.id));

  // 🎯 Refs para scroll automático
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

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🎯 Função para scroll automático para o primeiro erro
  const scrollToFirstError = (errorFields: string[]) => {
    if (errorFields.length > 0) {
      const firstErrorField = errorFields[0] as keyof typeof fieldRefs;
      const fieldRef = fieldRefs[firstErrorField];

      if (fieldRef?.current) {
        fieldRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

        // Focus no campo após um pequeno delay
        setTimeout(() => {
          fieldRef.current?.focus();
        }, 500);
      }
    }
  };

  // 🎯 Validação com Zod + validações condicionais
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      // Validação básica com Zod
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

    // 🎯 Validações condicionais específicas
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

    // 🎯 Scroll automático para erros
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
    } else {
      // Reset form for new annotation
      setFormData({
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
    }
    setErrors({});
    setNewTag('');
  }, [isEditing, editingAnnotation, isOpen]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user?.id) {
      toast.error('Você precisa estar logado para criar anotações');
      return;
    }

    const submitData = {
      workId,
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
    };

    try {
      let result;
      if (isEditing) {
        result = await updateAnnotation(editingAnnotation.id, submitData);
      } else {
        result = await createAnnotation(submitData);
      }

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

  const addSuggestedTag = (tag: string) => {
    addTag(tag);
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

  // Get suggested tags for current category
  const suggestedTags = SUGGESTED_TAGS_BY_CATEGORY[formData.category] || [];
  const availableSuggestedTags = suggestedTags.filter(
    (tag) => !formData.tags.includes(tag)
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      showCloseButton={true}
      className="max-h-[90vh] overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-theme-secondary">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center shadow-theme-glow">
            <FiMessageSquare className="w-5 h-5 text-theme-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {isEditing ? 'Editar Anotação' : 'Nova Anotação Musical'}
            </h2>
            <p className="text-sm text-theme-secondary">
              {isEditing
                ? 'Atualize sua anotação'
                : 'Compartilhe conhecimento sobre esta obra'}
            </p>
          </div>
        </div>
      </div>

      {/* Work Info */}
      <div className="px-6 py-4 bg-theme-elevated/50 border-b border-theme-secondary">
        <div className="flex items-center space-x-3">
          <FiMusic className="w-5 h-5 text-theme-tertiary" />
          <div>
            <h3 className="font-semibold text-theme-primary">{workTitle}</h3>
            <p className="text-sm text-theme-secondary">{composerName}</p>
          </div>
        </div>
      </div>

      {/* Form Content - Scrollable */}
      <div className="px-6 py-6 space-y-6 overflow-y-auto">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Título da Anotação *
          </label>
          <input
            ref={fieldRefs.title}
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            className={`w-full input-classical-2 ${
              errors.title ? '!border-red-400' : ''
            }`}
            placeholder="Ex: Dedilhado para arpejos nos compassos 15-20"
            maxLength={100}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
          <p className="text-theme-tertiary text-xs mt-1">
            {formData.title.length}/100 caracteres
          </p>
        </div>

        {/* Category and Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Categoria *
            </label>
            <select
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
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-accent-red text-sm mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Nível de Dificuldade
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  difficulty: e.target.value as AnnotationDifficulty,
                }))
              }
              className="w-full input-classical-2"
            >
              {DIFFICULTY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scope */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Abrangência da Anotação
          </label>
          <select
            value={formData.scope}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                scope: e.target.value as AnnotationScope,
              }))
            }
            className="w-full input-classical-2"
          >
            {SCOPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional location fields */}
        {formData.scope === 'SPECIFIC_MEASURE' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Compasso Inicial *
              </label>
              <input
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
                placeholder="Ex: 15"
              />
              {errors.measureStart && (
                <p className="text-accent-red text-sm mt-1">
                  {errors.measureStart}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Compasso Final (opcional)
              </label>
              <input
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
                placeholder="Ex: 20"
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
              Nome do Movimento *
            </label>
            <input
              ref={fieldRefs.movement}
              type="text"
              value={formData.movement}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, movement: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.movement ? 'border-accent-red' : ''
              }`}
              placeholder="Ex: Allegro, Andante, Presto"
            />
            {errors.movement && (
              <p className="text-accent-red text-sm mt-1">{errors.movement}</p>
            )}
          </div>
        )}

        {formData.scope === 'SECTION' && (
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Nome da Seção *
            </label>
            <input
              ref={fieldRefs.section}
              type="text"
              value={formData.section}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, section: e.target.value }))
              }
              className={`w-full input-classical-2 ${
                errors.section ? 'border-accent-red' : ''
              }`}
              placeholder="Ex: Exposição, Desenvolvimento, Recapitulação"
            />
            {errors.section && (
              <p className="text-accent-red text-sm mt-1">{errors.section}</p>
            )}
          </div>
        )}

        {/* Additional details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Mão Específica
            </label>
            <select
              value={formData.hand}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, hand: e.target.value }))
              }
              className="w-full input-classical-2"
            >
              {HAND_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Página da Partitura
            </label>
            <input
              type="number"
              min="1"
              value={formData.pageNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pageNumber: e.target.value }))
              }
              className="w-full input-classical-2"
              placeholder="Ex: 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-primary mb-2">
              Voz/Linha Melódica
            </label>
            <input
              type="text"
              value={formData.voice}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, voice: e.target.value }))
              }
              className="w-full input-classical-2"
              placeholder="Ex: Soprano, Baixo"
            />
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Conteúdo da Anotação *
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
            placeholder="Descreva sua dica, observação ou conhecimento sobre esta parte da obra..."
            maxLength={2000}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
          <p className="text-theme-tertiary text-xs mt-1">
            {formData.content.length}/2000 caracteres
          </p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-theme-primary mb-2">
            Tags (opcional)
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
              placeholder="Digite uma tag e pressione Enter"
              maxLength={20}
            />
            <button
              onClick={() => addTag()}
              disabled={!newTag.trim() || formData.tags.length >= 10}
              className="btn-classical-secondary flex items-center space-x-1"
            >
              <FiTag className="w-4 h-4" />
              <span>Adicionar</span>
            </button>
          </div>

          {/* Suggested Tags */}
          {availableSuggestedTags.length > 0 && formData.tags.length < 10 && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <FiPlus className="w-4 h-4 text-theme-tertiary" />
                <span className="text-sm font-medium text-theme-secondary">
                  Tags sugeridas para{' '}
                  {
                    CATEGORY_OPTIONS.find((c) => c.value === formData.category)
                      ?.label
                  }
                  :
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSuggestedTags.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => addSuggestedTag(tag)}
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
            Máximo 10 tags. Use palavras-chave relevantes para facilitar a
            busca.
          </p>
        </div>

        {/* Privacy */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() =>
              setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
            }
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
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
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-theme-primary">
                {formData.isPublic ? 'Anotação Pública' : 'Anotação Privada'}
              </span>
              {formData.isPublic ? (
                <FiEye className="w-4 h-4 text-accent-green" />
              ) : (
                <FiEyeOff className="w-4 h-4 text-accent-red" />
              )}
            </div>
            <p className="text-sm text-theme-secondary">
              {formData.isPublic
                ? 'Outros usuários poderão ver e votar nesta anotação'
                : 'Apenas você poderá ver esta anotação'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-theme-secondary flex items-center justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          isLoading={isSubmitting}
        >
          {isEditing ? 'Atualizar Anotação' : 'Criar Anotação'}
        </Button>
      </div>
    </Modal>
  );
}
