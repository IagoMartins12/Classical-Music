// app/teacher/lessons/create/pageClient.tsx - Client Component para Criar Nova Aula

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
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { CreateLessonData, TeacherProfile } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeacherLessons } from '@/app/hooks/lessonsSystem/useTeacherLessons';

interface CreateLessonPageClientProps {
  initialData: CreateLessonData;
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

export default function CreateLessonPageClient({
  initialData,
  teacherProfile,
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
    // Recorrência
    isRecurring: false,
    recurrenceType: 'NONE' as RecurrenceType,
    recurrenceEnd: '',
  });

  const [selectedStudent, setSelectedStudent] = useState<
    (typeof initialData.students)[0] | null
  >(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);

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

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      // Validation
      if (!formData.studentUserId || !formData.title || !formData.scheduledAt) {
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

                    {/* Recurrence */}
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
                          className="text-theme-primary font-medium"
                        >
                          Aula recorrente
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              Frequência
                            </label>
                            <Select
                              options={recurrenceOptions.filter(
                                (opt) => opt.value !== 'NONE'
                              )}
                              value={formData.recurrenceType}
                              onChange={(e) =>
                                updateFormData('recurrenceType', e.target.value)
                              }
                              className="input-classical w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              Até quando
                            </label>
                            <Input
                              type="date"
                              value={formData.recurrenceEnd}
                              onChange={(e) =>
                                updateFormData('recurrenceEnd', e.target.value)
                              }
                              className="input-classical w-full"
                            />
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
                      <div className="space-y-6 p-4 bg-theme-secondary/5 border border-theme-secondary/20 rounded-lg">
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
                        !formData.studentUserId ||
                        !formData.title ||
                        !formData.scheduledAt
                      }
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {loading.createLesson ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>
                        {loading.createLesson
                          ? formData.isRecurring
                            ? 'Criando Série...'
                            : 'Criando Aula...'
                          : formData.isRecurring
                          ? 'Criar Série de Aulas'
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
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
