// app/teacher/assignments/create/pageClient.tsx - ATUALIZADO COM VALIDAÇÃO, SCROLL E TRADUÇÕES

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
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
import { CreateAssignmentData } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTeacherAssignments } from '@/app/hooks/lessonsSystem/useTeacherAssignments';
import WorkSelectionSection, {
  LessonWork,
} from '@/app/components/TeacherSystem/WorkSelectionSection';
import { translateNivel } from '@/app/utils';
import { useTranslation } from '@/app/context/TranslationContext';

interface CreateAssignmentPageClientProps {
  initialData: CreateAssignmentData;
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

// const ASSIGNMENT_TYPES = {
//   practice: 'assignment_type_practice',
//   theory: 'assignment_type_theory',
//   listening: 'assignment_type_listening',
//   composition: 'assignment_type_composition',
//   performance: 'assignment_type_performance',
//   reading: 'assignment_type_reading',
// };

export default function CreateAssignmentPageClient({
  initialData,
  errorMessage,
}: CreateAssignmentPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/assignmentsCreate'] });

  const router = useRouter();
  const { createAssignment, loading, error, clearError } =
    useTeacherAssignments();

  // 🆕 REFS PARA VALIDAÇÃO E SCROLL AUTOMÁTICO
  const fieldRefs = {
    studentUserId: useRef<HTMLSelectElement>(null),
    title: useRef<HTMLInputElement>(null),
    description: useRef<HTMLTextAreaElement>(null),
    dueDate: useRef<HTMLInputElement>(null),
    estimatedTime: useRef<HTMLInputElement>(null),
  };

  // 🆕 ESTADO PARA ERROS DE VALIDAÇÃO
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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
  });

  // 🆕 ESTADOS PARA PEÇAS MUSICAIS
  const [selectedWorks, setSelectedWorks] = useState<LessonWork[]>([]);
  const [worksIds, setWorksIds] = useState<string[]>([]);
  const [workScoreIds, setWorkScoreIds] = useState<string[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<
    (typeof initialData.students)[0] | null
  >(null);

  const [showAdvanced, setShowAdvanced] = useState(false);

  // 🆕 FUNÇÃO PARA SCROLL AUTOMÁTICO PARA O PRIMEIRO ERRO
  const scrollToFirstError = useCallback((errorFields: string[]) => {
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
  }, []);

  // 🆕 FUNÇÃO DE VALIDAÇÃO COMPLETA
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validação do aluno
    if (!formData.studentUserId.trim()) {
      newErrors.studentUserId = t('validation_select_student');
    }

    // Validação do título
    if (!formData.title.trim()) {
      newErrors.title = t('validation_title_required');
    } else if (formData.title.trim().length < 3) {
      newErrors.title = t('validation_title_min_length');
    } else if (formData.title.trim().length > 100) {
      newErrors.title = t('validation_title_max_length');
    }

    // Validação da descrição
    if (!formData.description.trim()) {
      newErrors.description = t('validation_description_required');
    } else if (formData.description.trim().length < 10) {
      newErrors.description = t('validation_description_min_length');
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = t('validation_description_max_length');
    }

    // Validação do prazo (se preenchido)
    if (formData.dueDate.trim()) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();

      // normalizar para só pegar a parte de data
      const dueDateStr = dueDate.toISOString().slice(0, 10);
      const todayStr = today.toISOString().slice(0, 10);

      if (dueDateStr < todayStr) {
        newErrors.dueDate = t('validation_due_date_past');
      }
    }

    // Validação do tempo estimado
    if (!formData.estimatedTime || formData.estimatedTime < 5) {
      newErrors.estimatedTime = t('validation_time_min');
    } else if (formData.estimatedTime > 300) {
      newErrors.estimatedTime = t('validation_time_max');
    }

    setValidationErrors(newErrors);

    // Fazer scroll para o primeiro erro
    const errorFields = Object.keys(newErrors);
    if (errorFields.length > 0) {
      setTimeout(() => {
        scrollToFirstError(errorFields);
      }, 100);
      return false;
    }

    return true;
  }, [formData, scrollToFirstError, t]);

  // Update selected student and lesson when form changes
  useEffect(() => {
    const student = initialData.students.find(
      (s) => s.id === formData.studentUserId
    );
    setSelectedStudent(student || null);

    // 🆕 LIMPAR ERRO DE ALUNO QUANDO SELECIONAR UM
    if (formData.studentUserId && validationErrors.studentUserId) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.studentUserId;
        return newErrors;
      });
    }
  }, [
    formData.studentUserId,
    initialData.students,
    validationErrors.studentUserId,
  ]);

  useEffect(() => {
    const lesson = initialData.recentLessons.find(
      (l) => l.id === formData.lessonId
    );

    // Auto-select student if lesson is selected
    if (lesson && lesson.student.id !== formData.studentUserId) {
      updateFormData('studentUserId', lesson.student.id);
    }
  }, [formData.lessonId, initialData.recentLessons, formData.studentUserId]);

  // 🆕 HANDLER PARA MUDANÇAS NAS PEÇAS MUSICAIS
  const handleWorksChange = useCallback((works: LessonWork[]) => {
    console.log('🎵 Peças musicais atualizadas na tarefa:', works);
    setSelectedWorks(works);

    // 🔥 EXTRAIR worksIds e workScoreIds CORRETAMENTE
    const newWorksIds = works.map((work) => work.workId);
    const newWorkScoreIds = works
      .filter((work) => work.scoreId)
      .map((work) => work.scoreId!);

    setWorksIds(newWorksIds);
    setWorkScoreIds(newWorkScoreIds);

    console.log('📊 IDs extraídos para tarefa:', {
      worksIds: newWorksIds,
      workScoreIds: newWorkScoreIds,
      totalPecas: works.length,
      totalPartituras: newWorkScoreIds.length,
    });
  }, []);

  // 🆕 FORM HANDLERS ATUALIZADOS COM LIMPEZA DE ERROS
  const updateFormData = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // 🆕 LIMPAR ERRO DO CAMPO QUANDO USUÁRIO DIGITAR
      if (validationErrors[field]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

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

  const setDefaultTittle = (newType?: string) => {
    const typeValue = newType || formData.type;
    const typeLabel =
      initialData.assignmentTypes.find((t) => t.value === typeValue)?.label ||
      'Tarefa';

    const currentTitle = formData.title;

    // Regex para identificar o padrão "Tarefa de [Tipo] - [resto]"
    const taskPatternRegex = /^Tarefa de .+ - (.*)$/;
    const match = currentTitle.match(taskPatternRegex);

    if (match) {
      // Se o título segue o padrão, substitui apenas a parte do tipo
      const restOfTitle = match[1]; // Captura tudo após " - "
      const newTitle = `Tarefa de ${typeLabel} - ${restOfTitle}`;
      updateFormData('title', newTitle);
    } else if (selectedStudent && typeValue && !currentTitle) {
      // Se não há título e há aluno selecionado
      const defaultTitle = `Tarefa de ${typeLabel} - ${selectedStudent.name}`;
      updateFormData('title', defaultTitle);
    } else if (typeValue && !currentTitle) {
      // Se não há título
      const defaultTitle = `Tarefa de ${typeLabel} - `;
      updateFormData('title', defaultTitle);
    }
  };
  // 🆕 SUBMIT HANDLER ATUALIZADO COM VALIDAÇÃO
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      // 🆕 VALIDAR FORMULÁRIO ANTES DE PROSSEGUIR
      if (!validateForm()) {
        return;
      }

      // Clean up array fields
      const cleanData = {
        ...formData,
        practiceGoals: formData.practiceGoals.filter((goal) => goal.trim()),
        technicalGoals: formData.technicalGoals.filter((goal) => goal.trim()),
        musicalGoals: formData.musicalGoals.filter((goal) => goal.trim()),
        exercises: formData.exercises.filter((ex) => ex.trim()),
        // 🆕 INCLUIR PEÇAS MUSICAIS
        worksIds: worksIds, // IDs das obras
        workScoreIds: workScoreIds, // IDs das partituras
      };

      console.log('🚀 Enviando dados da tarefa:', {
        ...cleanData,
        totalPecas: worksIds.length,
        totalPartituras: workScoreIds.length,
      });

      const success = await createAssignment(cleanData);

      if (success) {
        router.push('/teacher/assignments');
      }
    },
    [
      formData,
      worksIds,
      workScoreIds,
      createAssignment,
      clearError,
      router,
      validateForm,
    ]
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
              {t('error_loading_data')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage}
            </p>
            <Link href="/teacher/assignments" className="btn-classical-primary">
              {t('back_to_assignments')}
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
                  {t('page_title')}
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  {t('page_subtitle')}
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
                      {t('basic_info')}
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('student_required')}
                      </label>
                      <Select
                        ref={fieldRefs.studentUserId}
                        options={[
                          { value: '', label: t('select_student') },
                          ...initialData.students.map((student) => ({
                            value: student.id,
                            label: `${student.name} (${student.level})`,
                          })),
                        ]}
                        value={formData.studentUserId}
                        onChange={(e) =>
                          updateFormData('studentUserId', e.target.value)
                        }
                        className={`input-classical w-full ${
                          validationErrors.studentUserId
                            ? '!border-red-400'
                            : ''
                        }`}
                        required
                      />
                      {validationErrors.studentUserId && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.studentUserId}
                        </p>
                      )}
                    </div>

                    {/* Lesson Selection (Optional) */}
                    {selectedStudent && filteredLessons.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('related_lesson')}
                        </label>
                        <Select
                          options={[
                            { value: '', label: t('no_specific_lesson') },
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
                          {t('assignment_type')}
                        </label>
                        <Select
                          options={initialData.assignmentTypes.map((type) => ({
                            value: type.value,
                            label: type.label,
                          }))}
                          value={formData.type}
                          onChange={(e) => {
                            updateFormData('type', e.target.value);
                            setDefaultTittle(e.target.value);
                          }}
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
                          {t('priority')}
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
                        {t('assignment_title_required')}
                      </label>
                      <Input
                        ref={fieldRefs.title}
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          updateFormData('title', e.target.value)
                        }
                        className={`input-classical w-full ${
                          validationErrors.title ? '!border-red-400' : ''
                        }`}
                        placeholder={t('title_placeholder')}
                        required
                      />
                      {validationErrors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.title}
                        </p>
                      )}
                      <p className="text-xs text-theme-tertiary mt-1">
                        {t('character_count', {
                          current: formData.title.length,
                          max: 100,
                        })}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('description_required')}
                      </label>
                      <textarea
                        ref={fieldRefs.description}
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        rows={4}
                        className={`input-classical w-full ${
                          validationErrors.description ? '!border-red-400' : ''
                        }`}
                        placeholder={t('description_placeholder')}
                        maxLength={1000}
                        required
                      />
                      {validationErrors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {validationErrors.description}
                        </p>
                      )}
                      <p className="text-xs text-theme-tertiary mt-1">
                        {t('character_count', {
                          current: formData.description.length,
                          max: 1000,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary classical-title">
                      {t('deadline_and_time')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('due_date')}
                        </label>
                        <Input
                          ref={fieldRefs.dueDate}
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) =>
                            updateFormData('dueDate', e.target.value)
                          }
                          className={`input-classical w-full ${
                            validationErrors.dueDate ? '!border-red-400' : ''
                          }`}
                          min={new Date().toISOString().slice(0, 10)}
                        />
                        {validationErrors.dueDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.dueDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('estimated_time_required')}
                        </label>
                        <Input
                          ref={fieldRefs.estimatedTime}
                          type="number"
                          value={formData.estimatedTime}
                          onChange={(e) =>
                            updateFormData(
                              'estimatedTime',
                              parseInt(e.target.value) || 0
                            )
                          }
                          min={5}
                          max={300}
                          step={5}
                          className={`input-classical w-full ${
                            validationErrors.estimatedTime
                              ? '!border-red-400'
                              : ''
                          }`}
                        />
                        {validationErrors.estimatedTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.estimatedTime}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Practice Goals */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title">
                        {t('practice_goals')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => addArrayField('practiceGoals')}
                        className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                      >
                        <FiPlus className="w-3 h-3" />
                        <span>{t('add')}</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.practiceGoals.map((goal, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="text"
                            value={goal}
                            onChange={(e) =>
                              updateArrayField(
                                'practiceGoals',
                                index,
                                e.target.value
                              )
                            }
                            className="input-classical flex-1 w-6/12"
                            placeholder={t('practice_goal_placeholder')}
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

                  {/* 🆕 SEÇÃO DE PEÇAS MUSICAIS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title flex items-center space-x-2">
                        <FiMusic className="w-5 h-5" />
                        <span>{t('musical_pieces')}</span>
                      </h3>
                      <div className="text-sm text-theme-secondary">
                        {t('pieces_count', { count: selectedWorks.length })}
                      </div>
                    </div>

                    <WorkSelectionSection
                      selectedWorks={selectedWorks}
                      onWorksChange={handleWorksChange}
                      maxWorks={4}
                      disabled={loading.createAssignment}
                    />
                  </div>

                  {/* Advanced Options */}
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center space-x-2 text-brand-primary hover:text-brand-secondary"
                    >
                      <span>{t('advanced_options')}</span>
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
                      <div className="space-y-6 p-4 bg-theme-secondary/5 shadow-lg rounded-lg">
                        {/* Technical Goals */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              {t('technical_goals')}
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('technicalGoals')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
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
                                  placeholder={t('technical_goal_placeholder')}
                                  widhtFull
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
                              {t('musical_goals')}
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('musicalGoals')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
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
                                  placeholder={t('musical_goal_placeholder')}
                                  widhtFull
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
                              {t('specific_exercises')}
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('exercises')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
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
                                  placeholder={t('exercise_placeholder')}
                                  widhtFull
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
                            {t('error_creating')}
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
                      {t('cancel')}
                    </Link>
                    <button
                      type="submit"
                      disabled={loading.createAssignment}
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {loading.createAssignment ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>
                        {loading.createAssignment
                          ? t('creating_task')
                          : t('create_task')}
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
                    {t('selected_student')}
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
                          {t('level')} {translateNivel(selectedStudent.level)}
                        </div>
                      </div>
                    </div>

                    {filteredLessons.length > 0 && (
                      <div>
                        <p className="text-sm text-theme-tertiary mb-2">
                          {t('recent_lessons')}
                        </p>
                        <div className="space-y-2">
                          {filteredLessons.slice(0, 3).map((lesson) => (
                            <Link
                              href={`/teacher/lessons/${lesson.id}`}
                              key={lesson.id}
                              className="text-xs p-2 bg-theme-elevated rounded flex flex-col justify-center gap-4"
                            >
                              <div className="font-medium text-theme-primary">
                                {lesson.title}
                              </div>
                              <div className="text-theme-tertiary">
                                <strong>{t('date')} </strong>
                                {new Date(
                                  lesson.scheduledAt
                                ).toLocaleDateString('pt-BR')}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* 🆕 RESUMO DAS PEÇAS SELECIONADAS */}
            {selectedWorks.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiMusic className="w-5 h-5" />
                    <span>{t('selected_pieces')}</span>
                  </h3>

                  <div className="space-y-3">
                    {selectedWorks.map((work, index) => (
                      <div
                        key={work.workId}
                        className="flex items-center space-x-3 p-3 bg-theme-elevated/50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FiMusic className="w-4 h-4 text-accent-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-theme-primary text-sm truncate">
                            {work.workTitle}
                          </p>
                          <p className="text-xs text-theme-tertiary truncate">
                            {t('composer')}: {work.composerName}
                          </p>
                          {work.scoreId && (
                            <p className="text-xs text-accent-green">
                              {t('piece_with_score')}
                            </p>
                          )}
                        </div>
                        <span className="text-xs bg-theme-secondary/20 text-theme-secondary px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    ))}

                    <div className="mt-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                      <div className="text-xs text-theme-secondary">
                        <div className="flex justify-between">
                          <span>{t('total_pieces')}</span>
                          <span className="font-medium">{worksIds.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('with_scores')}</span>
                          <span className="font-medium">
                            {workScoreIds.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Assignment Type Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('assignment_type_info')}
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
                        className={`p-3 rounded-lg bg-theme-elevated transition-all ${
                          isSelected
                            ? 'bg-brand-primary/10  border border-theme-primary'
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
                  {t('tips')}
                </h3>
                <div className="space-y-3 text-sm text-theme-secondary">
                  <div className="flex items-start space-x-2">
                    <FiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('be_specific_goals')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiMusic className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('link_musical_pieces')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiClock className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('realistic_time')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiCalendar className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('clear_deadlines')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiAlertCircle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                    <p>{t('fill_required_fields')}</p>
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
