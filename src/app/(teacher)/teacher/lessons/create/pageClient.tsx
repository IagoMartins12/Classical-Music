// app/teacher/lessons/create/pageClient.tsx - Client Component para Criar Nova Aula com Recorrência Melhorada

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiClock,
  FiUser,
  FiSave,
  FiX,
  FiPlus,
  FiTarget,
  FiRepeat,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { CreateLessonData } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeacherLessons } from '@/app/hooks/lessonsSystem/useTeacherLessons';
import Modal from '@/app/components/Modal';

interface CreateLessonPageClientProps {
  initialData: CreateLessonData;
  errorMessage?: string;
}

type RecurrenceType =
  | 'NONE'
  | 'WEEKLY'
  | 'BIWEEKLY'
  | 'TWICE_WEEKLY'
  | 'MONTHLY';
type LessonType =
  | 'INDIVIDUAL'
  | 'GROUP'
  | 'THEORY'
  | 'PRACTICE'
  | 'MASTERCLASS';

const recurrenceOptions = [
  { value: 'NONE', label: 'Sem recorrência' },
  { value: 'WEEKLY', label: 'Toda semana' },
  { value: 'BIWEEKLY', label: 'A cada 2 semanas' },
  { value: 'TWICE_WEEKLY', label: '2x por semana' },
  { value: 'MONTHLY', label: 'Mensal' },
];

const lessonTypeOptions = [
  { value: 'INDIVIDUAL', label: 'Individual' },
  { value: 'GROUP', label: 'Grupo' },
  { value: 'THEORY', label: 'Teoria' },
  { value: 'PRACTICE', label: 'Prática' },
  { value: 'MASTERCLASS', label: 'Masterclass' },
];

// Função para calcular data máxima (3 meses)
const getMaxRecurrenceDate = (startDate: string): string => {
  if (!startDate) return '';
  const start = new Date(startDate);
  const maxDate = new Date(start);
  maxDate.setMonth(maxDate.getMonth() + 3);
  return maxDate.toISOString().split('T')[0];
};

// Função para calcular quantas aulas serão criadas
const calculateLessonCount = (
  startDate: string,
  endDate: string,
  recurrenceType: RecurrenceType
): number => {
  if (!startDate || !endDate || recurrenceType === 'NONE') return 1;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  switch (recurrenceType) {
    case 'WEEKLY':
      return Math.floor(diffDays / 7) + 1;
    case 'BIWEEKLY':
      return Math.floor(diffDays / 14) + 1;
    case 'TWICE_WEEKLY':
      return Math.floor((diffDays / 7) * 2) + 1;
    case 'MONTHLY':
      return Math.floor(diffDays / 30) + 1;
    default:
      return 1;
  }
};

export default function CreateLessonPageClient({
  initialData,
  errorMessage,
}: CreateLessonPageClientProps) {
  const router = useRouter();
  const { createLesson, loading, error, clearError } = useTeacherLessons();

  // Form state
  const [formData, setFormData] = useState({
    studentUserId: '',
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    type: 'INDIVIDUAL' as LessonType,
    location: '',
    objectives: [''],
    topics: [''],
    techniques: [''],
    homework: '',
    teacherNotes: '',
    publicNotes: '',
    // Recorrência melhorada
    isRecurring: false,
    recurrenceType: 'NONE' as RecurrenceType,
    recurrenceEnd: '',
  });

  const [selectedStudent, setSelectedStudent] = useState<
    (typeof initialData.students)[0] | null
  >(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  // Update selected student when form changes
  useEffect(() => {
    const student = initialData.students.find(
      (s) => s.id === formData.studentUserId
    );
    setSelectedStudent(student || null);

    // Update default duration based on student settings
    if (student) {
      setFormData((prev) => ({
        ...prev,
        duration: student.relationship.lessonDuration,
      }));
    }
  }, [formData.studentUserId, initialData.students]);

  // Update recurrence end date when start date or recurrence type changes
  useEffect(() => {
    if (formData.isRecurring && formData.scheduledAt) {
      const maxDate = getMaxRecurrenceDate(formData.scheduledAt);
      if (
        !formData.recurrenceEnd ||
        new Date(formData.recurrenceEnd) > new Date(maxDate)
      ) {
        setFormData((prev) => ({
          ...prev,
          recurrenceEnd: maxDate,
        }));
      }
    }
  }, [formData.scheduledAt, formData.recurrenceType, formData.isRecurring]);

  // Form handlers
  const updateFormData = useCallback((field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addArrayField = useCallback((field: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), ''],
    }));
  }, []);

  const updateArrayField = useCallback(
    (field: string, index: number, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) =>
          i === index ? value : item
        ),
      }));
    },
    []
  );

  const removeArrayField = useCallback((field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter(
        (_, i) => i !== index
      ),
    }));
  }, []);

  // Generate default title
  useEffect(() => {
    if (selectedStudent && !formData.title) {
      const lessonDate = formData.scheduledAt
        ? new Date(formData.scheduledAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })
        : '';

      const defaultTitle = `Aula ${selectedStudent.name}${
        lessonDate ? ` - ${lessonDate}` : ''
      }`;
      updateFormData('title', defaultTitle);
    }
  }, [selectedStudent, formData.scheduledAt, formData.title, updateFormData]);

  // Calculate lesson preview
  const lessonCount = formData.isRecurring
    ? calculateLessonCount(
        formData.scheduledAt,
        formData.recurrenceEnd,
        formData.recurrenceType
      )
    : 1;

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      // Validation
      if (!formData.studentUserId || !formData.title || !formData.scheduledAt) {
        return;
      }

      // Validate recurrence end date
      if (formData.isRecurring && !formData.recurrenceEnd) {
        return;
      }

      // Clean up array fields
      const cleanData = {
        ...formData,
        objectives: formData.objectives.filter((obj) => obj.trim()),
        topics: formData.topics.filter((topic) => topic.trim()),
        techniques: formData.techniques.filter((tech) => tech.trim()),
      };

      const success = await createLesson(cleanData);

      if (success) {
        router.push('/teacher/lessons');
      }
    },
    [formData, createLesson, clearError, router]
  );

  // Handle conflicts confirmation
  const handleConflictConfirmation = useCallback(async () => {
    setShowConflictModal(false);
    setPendingSubmission(true);

    // Force submit despite conflicts
    const cleanData = {
      ...formData,
      objectives: formData.objectives.filter((obj) => obj.trim()),
      topics: formData.topics.filter((topic) => topic.trim()),
      techniques: formData.techniques.filter((tech) => tech.trim()),
      forceCreate: false, // Flag to ignore conflicts
    };

    const success = await createLesson(cleanData);
    setPendingSubmission(false);

    if (success) {
      router.push('/teacher/lessons');
    } else {
      setConflicts(['Erro ao criar aula']);
    }
  }, [formData, createLesson, router]);

  // Render error state
  if (errorMessage && initialData.students.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Dados
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage}
            </p>
            <Link href="/teacher/lessons" className="btn-classical-primary">
              Voltar às Aulas
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/teacher/lessons"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient-brand classical-title">
                  Criar Nova Aula
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  Agende uma nova aula e configure todos os detalhes
                </p>
              </div>
            </div>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Student Selection */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Informações Básicas
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Aluno *
                      </label>
                      <Select
                        options={[
                          { value: '', label: 'Selecione um aluno...' },
                          ...initialData.students.map((student) => ({
                            value: student.id,
                            label: `${student.name} (${student.level})`,
                          })),
                        ]}
                        value={formData.studentUserId}
                        onChange={(e) =>
                          updateFormData('studentUserId', e.target.value)
                        }
                        className="input-classical w-full"
                        required
                      />
                    </div>

                    {selectedStudent && (
                      <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          {selectedStudent.image ? (
                            <div className="w-12 h-12 relative rounded-full overflow-hidden">
                              <Image
                                src={selectedStudent.image}
                                alt={selectedStudent.name}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                              <FiUser className="w-6 h-6 text-theme-primary" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-theme-primary">
                              {selectedStudent.name}
                            </div>
                            <div className="text-sm text-theme-tertiary">
                              Nível: {selectedStudent.level} • Duração padrão:{' '}
                              {selectedStudent.relationship.lessonDuration}min •
                              Max:{' '}
                              {selectedStudent.relationship.maxLessonsPerWeek}
                              /semana
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Título da Aula *
                        </label>
                        <Input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            updateFormData('title', e.target.value)
                          }
                          className="input-classical w-full"
                          placeholder="Ex: Aula de Piano - Chopin"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Tipo de Aula
                        </label>
                        <Select
                          options={lessonTypeOptions}
                          value={formData.type}
                          onChange={(e) =>
                            updateFormData('type', e.target.value)
                          }
                          className="input-classical w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        rows={3}
                        className="input-classical w-full"
                        placeholder="Descreva o conteúdo e objetivos da aula..."
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary classical-title">
                      Agendamento
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Data e Hora *
                        </label>
                        <Input
                          type="datetime-local"
                          value={formData.scheduledAt}
                          onChange={(e) =>
                            updateFormData('scheduledAt', e.target.value)
                          }
                          className="input-classical w-full"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Duração (min)
                        </label>
                        <Input
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            updateFormData('duration', parseInt(e.target.value))
                          }
                          min={15}
                          max={180}
                          step={15}
                          className="input-classical w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Local
                        </label>
                        <Input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            updateFormData('location', e.target.value)
                          }
                          className="input-classical w-full"
                          placeholder="Ex: Online, Estúdio A"
                        />
                      </div>
                    </div>

                    {/* Recurrence - MELHORADO */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="isRecurring"
                          checked={formData.isRecurring}
                          onChange={(e) =>
                            updateFormData('isRecurring', e.target.checked)
                          }
                          className="w-4 h-4 text-brand-primary bg-theme-elevated border-theme-secondary rounded focus:ring-brand-primary"
                        />
                        <label
                          htmlFor="isRecurring"
                          className="text-theme-primary font-medium flex items-center space-x-2"
                        >
                          <FiRepeat className="w-4 h-4" />
                          <span>Aula recorrente</span>
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <div className="space-y-4 p-6 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <FiInfo className="w-5 h-5 text-brand-primary" />
                            <div className="text-sm text-theme-secondary">
                              <p className="font-medium">
                                Sistema de Recorrência Inteligente
                              </p>
                              <p>
                                Criamos aulas por até 3 meses. Após esse
                                período, você pode renovar facilmente!
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-theme-primary mb-2">
                                Frequência *
                              </label>
                              <Select
                                options={recurrenceOptions.filter(
                                  (opt) => opt.value !== 'NONE'
                                )}
                                value={formData.recurrenceType || 'WEEKLY'}
                                onChange={(e) =>
                                  updateFormData(
                                    'recurrenceType',
                                    e.target.value
                                  )
                                }
                                className="input-classical w-full"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-theme-primary mb-2">
                                Até quando *
                              </label>
                              <Input
                                type="date"
                                value={formData.recurrenceEnd}
                                onChange={(e) =>
                                  updateFormData(
                                    'recurrenceEnd',
                                    e.target.value
                                  )
                                }
                                min={
                                  formData.scheduledAt
                                    ? formData.scheduledAt.split('T')[0]
                                    : ''
                                }
                                max={
                                  formData.scheduledAt
                                    ? getMaxRecurrenceDate(formData.scheduledAt)
                                    : ''
                                }
                                className="input-classical w-full"
                                required
                              />
                              <p className="text-xs text-theme-tertiary mt-1">
                                Máximo:{' '}
                                {formData.scheduledAt
                                  ? getMaxRecurrenceDate(formData.scheduledAt)
                                  : 'Selecione uma data'}
                              </p>
                            </div>
                          </div>

                          {/* Preview de aulas */}
                          {formData.scheduledAt &&
                            formData.recurrenceEnd &&
                            formData.recurrenceType !== 'NONE' && (
                              <div className="bg-theme-elevated/50 rounded-lg p-4 border border-theme-secondary/30">
                                <div className="flex items-center space-x-3">
                                  <FiCalendar className="w-5 h-5 text-brand-primary" />
                                  <div>
                                    <p className="font-medium text-theme-primary">
                                      Será criado:{' '}
                                      <span className="text-brand-primary">
                                        {lessonCount} aula
                                        {lessonCount !== 1 ? 's' : ''}
                                      </span>
                                    </p>
                                    <p className="text-sm text-theme-tertiary">
                                      De{' '}
                                      {new Date(
                                        formData.scheduledAt
                                      ).toLocaleDateString('pt-BR')}{' '}
                                      até{' '}
                                      {new Date(
                                        formData.recurrenceEnd
                                      ).toLocaleDateString('pt-BR')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                          {/* Renovação fácil info */}
                          <div className="bg-accent-green/10 border border-accent-green/30 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <FiCheckCircle className="w-5 h-5 text-accent-green mt-0.5" />
                              <div className="text-sm">
                                <p className="font-medium text-accent-green mb-1">
                                  Renovação Simplificada
                                </p>
                                <p className="text-theme-secondary">
                                  Ao final do período, você receberá uma
                                  notificação para renovar com apenas 1 clique!
                                  Nada de remarcar aula por aula.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title">
                        Objetivos da Aula
                      </h3>
                      <button
                        type="button"
                        onClick={() => addArrayField('objectives')}
                        className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                      >
                        <FiPlus className="w-3 h-3" />
                        <span>Adicionar</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.objectives.map((objective, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            type="text"
                            value={objective}
                            onChange={(e) =>
                              updateArrayField(
                                'objectives',
                                index,
                                e.target.value
                              )
                            }
                            className="input-classical flex-1"
                            placeholder="Ex: Trabalhar digitação da mão direita"
                          />
                          {formData.objectives.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayField('objectives', index)
                              }
                              className="text-accent-red"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-brand-primary hover:text-brand-secondary"
                    >
                      <span>Opções Avançadas</span>
                      <div
                        className={`transform transition-transform ${
                          showAdvanced ? 'rotate-180' : ''
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {showAdvanced && (
                      <div className="space-y-6 p-4 bg-theme-secondary/5 rounded-lg">
                        {/* Topics */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              Tópicos a Abordar
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('topics')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>Adicionar</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {formData.topics.map((topic, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  type="text"
                                  value={topic}
                                  onChange={(e) =>
                                    updateArrayField(
                                      'topics',
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="input-classical flex-1"
                                  placeholder="Ex: Escala de Dó maior"
                                />
                                {formData.topics.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeArrayField('topics', index)
                                    }
                                    className="text-accent-red"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Homework */}
                        <div>
                          <label className="block text-sm font-medium text-theme-primary mb-2">
                            Lição de Casa
                          </label>
                          <textarea
                            value={formData.homework}
                            onChange={(e) =>
                              updateFormData('homework', e.target.value)
                            }
                            rows={3}
                            className="input-classical w-full"
                            placeholder="Descreva as tarefas para casa..."
                          />
                        </div>

                        {/* Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              Notas do Professor (privadas)
                            </label>
                            <textarea
                              value={formData.teacherNotes}
                              onChange={(e) =>
                                updateFormData('teacherNotes', e.target.value)
                              }
                              rows={3}
                              className="input-classical w-full"
                              placeholder="Notas pessoais sobre a aula..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              Notas Públicas (aluno vê)
                            </label>
                            <textarea
                              value={formData.publicNotes}
                              onChange={(e) =>
                                updateFormData('publicNotes', e.target.value)
                              }
                              rows={3}
                              className="input-classical w-full"
                              placeholder="Informações para o aluno..."
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <FiAlertCircle className="w-5 h-5 text-accent-red" />
                        <div>
                          <p className="text-accent-red font-medium">
                            Erro ao criar aula
                          </p>
                          <p className="text-accent-red/80 text-sm">{error}</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearError}
                          className="ml-auto text-accent-red"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-theme-secondary">
                    <Link
                      href="/teacher/lessons"
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={
                        loading.createLesson ||
                        pendingSubmission ||
                        !formData.studentUserId ||
                        !formData.title ||
                        !formData.scheduledAt ||
                        (formData.isRecurring && !formData.recurrenceEnd)
                      }
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {loading.createLesson || pendingSubmission ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>
                        {loading.createLesson || pendingSubmission
                          ? formData.isRecurring
                            ? 'Criando Série...'
                            : 'Criando Aula...'
                          : formData.isRecurring
                          ? `Criar ${lessonCount} Aula${
                              lessonCount !== 1 ? 's' : ''
                            }`
                          : 'Criar Aula'}
                      </span>
                    </button>
                  </div>
                </form>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            {selectedStudent && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                    Informações do Aluno
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      {selectedStudent.image ? (
                        <div className="w-12 h-12 relative rounded-full overflow-hidden">
                          <Image
                            src={selectedStudent.image}
                            alt={selectedStudent.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                          <FiUser className="w-6 h-6 text-theme-primary" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-theme-primary">
                          {selectedStudent.name}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Nível: {selectedStudent.level}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Duração padrão:
                        </span>
                        <span className="text-theme-primary">
                          {selectedStudent.relationship.lessonDuration} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          Limite semanal:
                        </span>
                        <span className="text-theme-primary">
                          {selectedStudent.relationship.maxLessonsPerWeek}
                          /semana
                        </span>
                      </div>
                      {selectedStudent.relationship.preferredDays &&
                        selectedStudent.relationship.preferredDays.length >
                          0 && (
                          <div className="flex justify-between">
                            <span className="text-theme-tertiary">
                              Dias preferidos:
                            </span>
                            <span className="text-theme-primary">
                              {selectedStudent.relationship.preferredDays.join(
                                ', '
                              )}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Tips */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Dicas
                </h3>
                <div className="space-y-3 text-sm text-theme-secondary">
                  <div className="flex items-start space-x-2">
                    <FiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Defina objetivos claros para cada aula</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiRepeat className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Use aulas recorrentes para economizar tempo</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiClock className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Respeite os limites de aulas por semana do aluno</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiCalendar className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>
                      Recorrência funciona por 3 meses - renovação é automática!
                    </p>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      {/* Conflict Modal */}
      {showConflictModal && (
        <Modal
          isOpen
          onClose={() => setShowConflictModal(false)}
          maxWidth="2xl"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-accent-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Conflitos de Horário Detectados
                </h2>
                <p className="text-theme-secondary">
                  Algumas aulas podem entrar em conflito com horários já
                  agendados
                </p>
              </div>
            </div>

            {conflicts.length > 0 && (
              <div className="space-y-3 mb-6">
                {conflicts.map((conflict, index) => (
                  <div
                    key={index}
                    className="bg-accent-red/5 border border-accent-red/20 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-accent-red">
                          {conflict.title}
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          {new Date(conflict.scheduledAt).toLocaleString(
                            'pt-BR'
                          )}{' '}
                          - {conflict.studentName}
                        </p>
                      </div>
                      <FiAlertCircle className="w-5 h-5 text-accent-red" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FiInfo className="w-5 h-5 text-accent-yellow mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent-yellow mb-1">
                    O que acontece ao continuar?
                  </p>
                  <p className="text-theme-secondary">
                    As aulas serão criadas mesmo com conflitos. Você pode
                    reorganizar posteriormente ou cancelar as aulas
                    conflitantes.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowConflictModal(false)}
                className="btn-classical-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleConflictConfirmation}
                className="btn-classical-primary bg-accent-red hover:bg-accent-red/80"
              >
                Criar Mesmo Assim
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
