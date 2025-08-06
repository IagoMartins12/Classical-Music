// app/teacher/assignments/create/pageClient.tsx - Client Component para Criar Nova Tarefa

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiClipboard,
  FiUser,
  FiSave,
  FiX,
  FiPlus,
  FiTarget,
  FiBookOpen,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiMusic,
  FiHeadphones,
  FiEdit3,
  FiMic,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { CreateAssignmentData, TeacherProfile } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeacherAssignments } from '@/app/hooks/lessonsSystem/useTeacherAssignments';

interface CreateAssignmentPageClientProps {
  initialData: CreateAssignmentData;
  teacherProfile: TeacherProfile;
  errorMessage?: string;
}

const typeIcons = {
  practice: FiTarget,
  theory: FiBookOpen,
  listening: FiHeadphones,
  composition: FiEdit3,
  performance: FiMic,
  reading: FiMusic,
};

export default function CreateAssignmentuseCreateAssignmentPageClient({
  initialData,
  teacherProfile,
  errorMessage,
}: CreateAssignmentPageClientProps) {
  const router = useRouter();
  const { createAssignment, loading, error, clearError } =
    useTeacherAssignments();

  // Form state
  const [formData, setFormData] = useState({
    lessonId: '',
    studentUserId: '',
    title: '',
    description: '',
    type: 'practice',
    priority: 'medium',
    dueDate: '',
    estimatedTime: 60,
    practiceGoals: [''],
    technicalGoals: [''],
    musicalGoals: [''],
    exercises: [''],
    workScoreIds: [] as string[],
  });

  const [selectedStudent, setSelectedStudent] = useState<
    (typeof initialData.students)[0] | null
  >(null);
  const [selectedLesson, setSelectedLesson] = useState<
    (typeof initialData.recentLessons)[0] | null
  >(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update selected student and lesson when form changes
  useEffect(() => {
    const student = initialData.students.find(
      (s) => s.id === formData.studentUserId
    );
    setSelectedStudent(student || null);
  }, [formData.studentUserId, initialData.students]);

  useEffect(() => {
    const lesson = initialData.recentLessons.find(
      (l) => l.id === formData.lessonId
    );
    setSelectedLesson(lesson || null);

    // Auto-select student if lesson is selected
    if (lesson && lesson.student.id !== formData.studentUserId) {
      updateFormData('studentUserId', lesson.student.id);
    }
  }, [formData.lessonId, initialData.recentLessons, formData.studentUserId]);

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

  // Generate default title based on type and student
  useEffect(() => {
    if (selectedStudent && formData.type && !formData.title) {
      const typeLabel =
        initialData.assignmentTypes.find((t) => t.value === formData.type)
          ?.label || 'Tarefa';
      const defaultTitle = `${typeLabel} - ${selectedStudent.name}`;
      updateFormData('title', defaultTitle);
    }
  }, [
    selectedStudent,
    formData.type,
    formData.title,
    initialData.assignmentTypes,
    updateFormData,
  ]);

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      // Validation
      if (!formData.studentUserId || !formData.title || !formData.description) {
        return;
      }

      // Clean up array fields
      const cleanData = {
        ...formData,
        practiceGoals: formData.practiceGoals.filter((goal) => goal.trim()),
        technicalGoals: formData.technicalGoals.filter((goal) => goal.trim()),
        musicalGoals: formData.musicalGoals.filter((goal) => goal.trim()),
        exercises: formData.exercises.filter((ex) => ex.trim()),
      };

      const success = await createAssignment(cleanData);

      if (success) {
        router.push('/teacher/assignments');
      }
    },
    [formData, createAssignment, clearError, router]
  );

  // Filter lessons by selected student
  const filteredLessons = selectedStudent
    ? initialData.recentLessons.filter(
        (lesson) => lesson.student.id === selectedStudent.id
      )
    : [];

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
            <Link href="/teacher/assignments" className="btn-classical-primary">
              Voltar às Tarefas
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
                href="/teacher/assignments"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient-brand classical-title">
                  Criar Nova Tarefa
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  Crie uma tarefa personalizada para seus alunos
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
                  {/* Basic Info */}
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

                    {/* Lesson Selection (Optional) */}
                    {selectedStudent && filteredLessons.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Aula Relacionada (opcional)
                        </label>
                        <Select
                          options={[
                            { value: '', label: 'Nenhuma aula específica' },
                            ...filteredLessons.map((lesson) => ({
                              value: lesson.id,
                              label: `${lesson.title} - ${new Date(
                                lesson.scheduledAt
                              ).toLocaleDateString('pt-BR')}`,
                            })),
                          ]}
                          value={formData.lessonId}
                          onChange={(e) =>
                            updateFormData('lessonId', e.target.value)
                          }
                          className="input-classical w-full"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Tipo de Tarefa
                        </label>
                        <Select
                          options={initialData.assignmentTypes.map((type) => ({
                            value: type.value,
                            label: type.label,
                          }))}
                          value={formData.type}
                          onChange={(e) =>
                            updateFormData('type', e.target.value)
                          }
                          className="input-classical w-full"
                        />
                        <p className="text-xs text-theme-tertiary mt-1">
                          {
                            initialData.assignmentTypes.find(
                              (t) => t.value === formData.type
                            )?.description
                          }
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Prioridade
                        </label>
                        <Select
                          options={initialData.priorityLevels.map(
                            (priority) => ({
                              value: priority.value,
                              label: priority.label,
                            })
                          )}
                          value={formData.priority}
                          onChange={(e) =>
                            updateFormData('priority', e.target.value)
                          }
                          className="input-classical w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Título da Tarefa *
                      </label>
                      <Input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          updateFormData('title', e.target.value)
                        }
                        className="input-classical w-full"
                        placeholder="Ex: Prática - Escalas de Dó maior"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        Descrição Detalhada *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        rows={4}
                        className="input-classical w-full"
                        placeholder="Descreva detalhadamente o que o aluno deve fazer, como deve praticar, quais técnicas focar..."
                        required
                      />
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary classical-title">
                      Prazo e Tempo
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Prazo de Entrega
                        </label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) =>
                            updateFormData('dueDate', e.target.value)
                          }
                          className="input-classical w-full"
                          min={new Date().toISOString().slice(0, 10)}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          Tempo Estimado (minutos)
                        </label>
                        <Input
                          type="number"
                          value={formData.estimatedTime}
                          onChange={(e) =>
                            updateFormData(
                              'estimatedTime',
                              parseInt(e.target.value)
                            )
                          }
                          min={5}
                          max={300}
                          step={5}
                          className="input-classical w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Practice Goals */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title">
                        Objetivos de Prática
                      </h3>
                      <button
                        type="button"
                        onClick={() => addArrayField('practiceGoals')}
                        className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                      >
                        <FiPlus className="w-3 h-3" />
                        <span>Adicionar</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.practiceGoals.map((goal, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Input
                            type="text"
                            value={goal}
                            onChange={(e) =>
                              updateArrayField(
                                'practiceGoals',
                                index,
                                e.target.value
                              )
                            }
                            className="input-classical flex-1"
                            placeholder="Ex: Tocar em andamento 120 BPM com metrônomo"
                          />
                          {formData.practiceGoals.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayField('practiceGoals', index)
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
                        {/* Technical Goals */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              Objetivos Técnicos
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('technicalGoals')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>Adicionar</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {formData.technicalGoals.map((goal, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  type="text"
                                  value={goal}
                                  onChange={(e) =>
                                    updateArrayField(
                                      'technicalGoals',
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="input-classical flex-1"
                                  placeholder="Ex: Melhorar articulação nos staccatos"
                                />
                                {formData.technicalGoals.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeArrayField('technicalGoals', index)
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

                        {/* Musical Goals */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              Objetivos Musicais
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('musicalGoals')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>Adicionar</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {formData.musicalGoals.map((goal, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  type="text"
                                  value={goal}
                                  onChange={(e) =>
                                    updateArrayField(
                                      'musicalGoals',
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="input-classical flex-1"
                                  placeholder="Ex: Expressar melhor o caráter melancólico"
                                />
                                {formData.musicalGoals.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeArrayField('musicalGoals', index)
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

                        {/* Exercises */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              Exercícios Específicos
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('exercises')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>Adicionar</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {formData.exercises.map((exercise, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <Input
                                  type="text"
                                  value={exercise}
                                  onChange={(e) =>
                                    updateArrayField(
                                      'exercises',
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="input-classical flex-1"
                                  placeholder="Ex: Hanon nº 1, Czerny op. 599 nº 5"
                                />
                                {formData.exercises.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeArrayField('exercises', index)
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
                            Erro ao criar tarefa
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
                      href="/teacher/assignments"
                      className="btn-classical-secondary"
                    >
                      Cancelar
                    </Link>
                    <button
                      type="submit"
                      disabled={
                        loading.createAssignment ||
                        !formData.studentUserId ||
                        !formData.title ||
                        !formData.description
                      }
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {loading.createAssignment ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>
                        {loading.createAssignment
                          ? 'Criando Tarefa...'
                          : 'Criar Tarefa'}
                      </span>
                    </button>
                  </div>
                </form>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Student Info */}
            {selectedStudent && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                    Aluno Selecionado
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

                    {filteredLessons.length > 0 && (
                      <div>
                        <p className="text-sm text-theme-tertiary mb-2">
                          Aulas recentes:
                        </p>
                        <div className="space-y-2">
                          {filteredLessons.slice(0, 3).map((lesson) => (
                            <div
                              key={lesson.id}
                              className="text-xs p-2 bg-theme-secondary/10 rounded border"
                            >
                              <div className="font-medium text-theme-primary">
                                {lesson.title}
                              </div>
                              <div className="text-theme-tertiary">
                                {new Date(
                                  lesson.scheduledAt
                                ).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Assignment Type Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Tipo de Tarefa
                </h3>

                <div className="space-y-3">
                  {initialData.assignmentTypes.map((type) => {
                    const IconComponent =
                      typeIcons[type.value as keyof typeof typeIcons] ||
                      FiTarget;
                    const isSelected = formData.type === type.value;

                    return (
                      <div
                        key={type.value}
                        className={`p-3 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-brand-primary/10 border-brand-primary/30'
                            : 'bg-theme-secondary/5 border-theme-secondary/20'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <IconComponent
                            className={`w-4 h-4 ${
                              isSelected
                                ? 'text-brand-primary'
                                : 'text-theme-tertiary'
                            }`}
                          />
                          <span
                            className={`font-medium ${
                              isSelected
                                ? 'text-brand-primary'
                                : 'text-theme-primary'
                            }`}
                          >
                            {type.label}
                          </span>
                        </div>
                        <p className="text-xs text-theme-secondary">
                          {type.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Tips */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Dicas
                </h3>
                <div className="space-y-3 text-sm text-theme-secondary">
                  <div className="flex items-start space-x-2">
                    <FiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Seja específico nos objetivos para melhor resultado</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiClock className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Defina tempo realista baseado no nível do aluno</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiCalendar className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Prazos claros ajudam na organização</p>
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
