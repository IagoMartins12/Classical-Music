// app/teacher/lessons/[id]/edit/pageClient.tsx - Client Component para Editar Aula

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSave,
  FiX,
  FiPlus,
  FiMapPin,
  FiTarget,
  FiBookOpen,
  FiRepeat,
  FiAlertCircle,
  FiCheck,
  FiRefreshCw,
  FiArrowLeft,
  FiTrash2,
  FiRotateCcw,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../../components/animation/AnimatedComponents';
import { EditLessonData, TeacherProfile } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditLesson } from '@/app/hooks/lessonsSystem/useEditLesson';

interface EditLessonPageClientProps {
  initialData: EditLessonData | null;
  teacherProfile: TeacherProfile;
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

const statusOptions = [
  { value: 'SCHEDULED', label: 'Agendada' },
  { value: 'COMPLETED', label: 'Concluída' },
  { value: 'CANCELLED', label: 'Cancelada' },
  { value: 'NO_SHOW', label: 'Falta do aluno' },
  { value: 'RESCHEDULED', label: 'Reagendada' },
];

export default function EditLessonPageClient({
  initialData,
  teacherProfile,
  errorMessage,
}: EditLessonPageClientProps) {
  const router = useRouter();
  const { updateLesson, cancelLesson, loading, error, clearError } =
    useEditLesson();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    type: 'INDIVIDUAL' as LessonType,
    location: '',
    status: 'SCHEDULED',
    objectives: [''],
    topics: [''],
    techniques: [''],
    homework: '',
    teacherNotes: '',
    publicNotes: '',
    // Recorrência
    isRecurring: false,
    recurrenceType: 'NONE' as RecurrenceType,
    recurrenceEnd: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Initialize form data
  useEffect(() => {
    if (initialData?.lesson) {
      const lesson = initialData.lesson;

      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        scheduledAt: new Date(lesson.scheduledAt).toISOString().slice(0, 16),
        duration: lesson.duration,
        type: lesson.type as LessonType,
        location: lesson.location || '',
        status: lesson.status,
        objectives: lesson.objectives.length > 0 ? lesson.objectives : [''],
        topics: lesson.topics.length > 0 ? lesson.topics : [''],
        techniques: lesson.techniques.length > 0 ? lesson.techniques : [''],
        homework: lesson.homework || '',
        teacherNotes: lesson.teacherNotes || '',
        publicNotes: lesson.publicNotes || '',
        // Recorrência
        isRecurring: lesson.isRecurring,
        recurrenceType: (lesson.recurrenceType || 'NONE') as RecurrenceType,
        recurrenceEnd: lesson.recurrenceEnd
          ? new Date(lesson.recurrenceEnd).toISOString().slice(0, 10)
          : '',
      });

      // Show advanced if there's advanced data
      if (
        lesson.topics.length > 0 ||
        lesson.techniques.length > 0 ||
        lesson.homework ||
        lesson.teacherNotes ||
        lesson.publicNotes
      ) {
        setShowAdvanced(true);
      }
    }
  }, [initialData]);

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

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      if (
        !initialData?.lesson?.id ||
        !formData.title ||
        !formData.scheduledAt
      ) {
        return;
      }

      // Clean up array fields
      const cleanData = {
        ...formData,
        objectives: formData.objectives.filter((obj) => obj.trim()),
        topics: formData.topics.filter((topic) => topic.trim()),
        techniques: formData.techniques.filter((tech) => tech.trim()),
      };

      const success = await updateLesson(initialData.lesson.id, cleanData);

      if (success) {
        router.push('/teacher/lessons');
      }
    },
    [formData, updateLesson, clearError, router, initialData]
  );

  // Cancel lesson handler
  const handleCancelLesson = useCallback(async () => {
    if (!initialData?.lesson?.id) return;

    const success = await cancelLesson(
      initialData.lesson.id,
      cancelReason || 'Cancelada pelo professor'
    );

    if (success) {
      setShowCancelModal(false);
      router.push('/teacher/lessons');
    }
  }, [cancelLesson, initialData, cancelReason, router]);

  // Render error state
  if (!initialData || errorMessage) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Aula
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage || 'Aula não encontrada ou sem permissão de acesso'}
            </p>
            <Link href="/teacher/lessons" className="btn-classical-primary">
              Voltar às Aulas
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const lesson = initialData.lesson;
  const canEdit = lesson.permissions.canEdit && lesson.status === 'SCHEDULED';
  const canCancel =
    lesson.permissions.canCancel && lesson.status === 'SCHEDULED';

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
                  Editar Aula
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  Modifique os detalhes da aula: {lesson.title}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10 flex items-center space-x-2"
              >
                <FiX className="w-4 h-4" />
                <span>Cancelar Aula</span>
              </button>
            )}
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      Informações Básicas
                    </h2>

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
                          disabled={!canEdit}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Status
                        </label>
                        <Select
                          options={statusOptions}
                          value={formData.status}
                          onChange={(e) =>
                            updateFormData('status', e.target.value)
                          }
                          className="input-classical w-full"
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          disabled={!canEdit}
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
                          disabled={!canEdit}
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
                        disabled={!canEdit}
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary classical-title">
                      Agendamento
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          disabled={!canEdit}
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
                          disabled={!canEdit}
                        />
                      </div>
                    </div>

                    {/* Recurrence Info */}
                    {lesson.isRecurring && (
                      <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-accent-blue mb-2">
                          <FiRepeat className="w-4 h-4" />
                          <span className="font-medium">Aula Recorrente</span>
                        </div>
                        <p className="text-sm text-theme-secondary">
                          Esta aula faz parte de uma série recorrente.
                          {lesson.parentLessonId
                            ? ' Esta é uma aula filha da série.'
                            : ' Esta é a aula pai da série.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title">
                        Objetivos da Aula
                      </h3>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => addArrayField('objectives')}
                          className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                        >
                          <FiPlus className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      )}
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
                            disabled={!canEdit}
                          />
                          {canEdit && formData.objectives.length > 1 && (
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
                      <div className="space-y-6 p-4 bg-theme-secondary/5 border border-theme-secondary/20 rounded-lg">
                        {/* Topics */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              Tópicos Abordados
                            </label>
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => addArrayField('topics')}
                                className="text-brand-primary text-sm flex items-center space-x-1"
                              >
                                <FiPlus className="w-3 h-3" />
                                <span>Adicionar</span>
                              </button>
                            )}
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
                                  disabled={!canEdit}
                                />
                                {canEdit && formData.topics.length > 1 && (
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
                            disabled={!canEdit}
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
                              disabled={!canEdit}
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
                              disabled={!canEdit}
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
                            Erro ao atualizar aula
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
                    {canEdit && (
                      <button
                        type="submit"
                        disabled={
                          loading.updateLesson ||
                          !formData.title ||
                          !formData.scheduledAt
                        }
                        className="btn-classical-primary flex items-center space-x-2"
                      >
                        {loading.updateLesson ? (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        <span>
                          {loading.updateLesson
                            ? 'Salvando...'
                            : 'Salvar Alterações'}
                        </span>
                      </button>
                    )}
                  </div>
                </form>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Student Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Informações do Aluno
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {lesson.student.image ? (
                      <div className="w-12 h-12 relative rounded-full overflow-hidden">
                        <Image
                          src={lesson.student.image}
                          alt={lesson.student.name}
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
                        {lesson.student.name}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Nível: {lesson.student.level}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Email:</span>
                      <span className="text-theme-primary">
                        {lesson.student.email}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Lesson Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Informações da Aula
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Criada em:</span>
                    <span className="text-theme-primary">
                      {new Date(lesson.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Atualizada em:</span>
                    <span className="text-theme-primary">
                      {new Date(lesson.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Status:</span>
                    <span
                      className={`text-theme-primary px-2 py-1 rounded text-xs ${
                        lesson.status === 'COMPLETED'
                          ? 'bg-accent-green/20'
                          : lesson.status === 'CANCELLED'
                          ? 'bg-accent-red/20'
                          : 'bg-accent-blue/20'
                      }`}
                    >
                      {statusOptions.find((opt) => opt.value === lesson.status)
                        ?.label || lesson.status}
                    </span>
                  </div>
                  {lesson.isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Recorrência:</span>
                      <span className="text-theme-primary">
                        {recurrenceOptions.find(
                          (opt) => opt.value === lesson.recurrenceType
                        )?.label || 'Sim'}
                      </span>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Ações Rápidas
                </h3>
                <div className="space-y-2">
                  <Link
                    href={`/teacher/lessons/${lesson.id}`}
                    className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                  >
                    <FiBookOpen className="w-4 h-4" />
                    <span>Ver Detalhes</span>
                  </Link>

                  {lesson.status === 'SCHEDULED' && (
                    <Link
                      href={`/teacher/lessons/${lesson.id}/reschedule`}
                      className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
                    >
                      <FiRotateCcw className="w-4 h-4" />
                      <span>Reagendar</span>
                    </Link>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <AnimatedCard
              hover="none"
              className="classical-card w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    Cancelar Aula
                  </h2>
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="text-theme-tertiary hover:text-theme-primary"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-theme-secondary mb-4">
                  Tem certeza que deseja cancelar esta aula? Esta ação não pode
                  ser desfeita.
                </p>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    Motivo do cancelamento (opcional)
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="input-classical w-full"
                    placeholder="Ex: Indisponibilidade do professor..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    className="btn-classical-secondary"
                    disabled={loading.cancelLesson}
                  >
                    Manter Aula
                  </button>
                  <button
                    onClick={handleCancelLesson}
                    disabled={loading.cancelLesson}
                    className="btn-classical-primary bg-accent-red border-accent-red hover:bg-accent-red/90 flex items-center space-x-2"
                  >
                    {loading.cancelLesson ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span>
                      {loading.cancelLesson ? 'Cancelando...' : 'Cancelar Aula'}
                    </span>
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
