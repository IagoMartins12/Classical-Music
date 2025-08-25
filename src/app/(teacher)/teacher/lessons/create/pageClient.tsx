// app/teacher/lessons/create/pageClient.tsx - ATUALIZADO COM VALIDAÇÃO E SCROLL

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
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
  FiMusic,
  FiAlertTriangle,
  FiXCircle,
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
import WorkSelectionSection, {
  LessonWork,
} from '@/app/components/TeacherSystem/WorkSelectionSection';
import { translateNivel } from '@/app/utils';
import { useTranslation } from '@/app/hooks/useTranslation';

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

// Tipos para conflitos
interface LessonConflict {
  id: string;
  title: string;
  scheduledAt: Date;
  duration: number;
  studentName: string;
  studentEmail: string;
}

interface WeeklyLimitWarning {
  currentLessons: number;
  maxLessonsPerWeek: number;
  studentName: string;
  weekStart: Date;
  weekEnd: Date;
  upcomingLessons: Array<{
    id: string;
    title: string;
    scheduledAt: Date;
  }>;
}

interface ConflictCheckResult {
  hasTimeConflicts: boolean;
  hasWeeklyLimitExceeded: boolean;
  timeConflicts: LessonConflict[];
  weeklyLimitWarning: WeeklyLimitWarning | null;
  warnings: string[];
}

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

// Modal de conflitos
interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictCheckResult;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  t: (key: string) => string;
}

function ConflictModal({
  isOpen,
  onClose,
  conflicts,
  onConfirm,
  onCancel,
  loading,
  t,
}: ConflictModalProps) {
  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="3xl">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              conflicts.hasTimeConflicts
                ? 'bg-accent-red/10'
                : 'bg-accent-yellow/10'
            }`}
          >
            {conflicts.hasTimeConflicts ? (
              <FiXCircle className="w-6 h-6 " />
            ) : (
              <FiAlertTriangle className="w-6 h-6 " />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary">
              {conflicts.hasTimeConflicts
                ? t('conflicts_detected')
                : t('weekly_limit_warning')}
            </h2>
            <p className="text-theme-secondary">
              {conflicts.hasTimeConflicts
                ? t('conflicts_description')
                : t('weekly_limit_description')}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Conflitos de Horário */}
          {conflicts.hasTimeConflicts && conflicts.timeConflicts.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-theme-primary mb-4 flex items-center space-x-2">
                <FiAlertCircle className="w-5 h-5" />
                <span>
                  {t('time_conflicts')} ({conflicts.timeConflicts.length})
                </span>
              </h3>

              <div className="space-y-3">
                {conflicts.timeConflicts.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="bg-accent-red/5 bg-theme-tertiary rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-accent-red">
                          {conflict.title}
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          {formatDateTime(conflict.scheduledAt)} •{' '}
                          {conflict.duration}min
                        </p>
                        <p className="text-sm text-theme-secondary">
                          {t('student')}: {conflict.studentName}
                        </p>
                      </div>
                      <FiAlertCircle className="w-5 h-5 text-accent-red" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-theme-tertiary rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <FiInfo className="w-5 h-5 text-accent-red mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent-red mb-1">
                      ⚠️ {t('cannot_create_lesson')}
                    </p>
                    <p className="text-theme-secondary">
                      {t('conflict_description')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Limite Semanal */}
          {conflicts.hasWeeklyLimitExceeded && conflicts.weeklyLimitWarning && (
            <div>
              <h3 className="text-lg font-semibold text-accent-yellow mb-4 flex items-center space-x-2">
                <FiAlertTriangle className="w-5 h-5" />
                <span>{t('weekly_limit_exceeded')}</span>
              </h3>

              <div className="bg-theme-tertiary rounded-lg p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-theme-primary font-medium">
                      {conflicts.weeklyLimitWarning.studentName}
                    </span>
                    <span className="text-accent-yellow font-bold">
                      {conflicts.weeklyLimitWarning.currentLessons}/
                      {conflicts.weeklyLimitWarning.maxLessonsPerWeek} aulas
                    </span>
                  </div>

                  <div className="text-sm text-theme-secondary">
                    <p>
                      <strong>{t('week')}</strong>{' '}
                      {formatDate(conflicts.weeklyLimitWarning.weekStart)} a{' '}
                      {formatDate(conflicts.weeklyLimitWarning.weekEnd)}
                    </p>
                  </div>

                  {conflicts.weeklyLimitWarning.upcomingLessons.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-theme-primary mb-2">
                        {t('scheduled_lessons')}
                      </p>
                      <div className="space-y-1">
                        {conflicts.weeklyLimitWarning.upcomingLessons.map(
                          (lesson) => (
                            <div
                              key={lesson.id}
                              className="text-sm text-theme-tertiary"
                            >
                              • {lesson.title} -{' '}
                              {formatDateTime(lesson.scheduledAt)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-theme-tertiary rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-accent-blue mb-1">
                      ℹ️ {t('can_proceed')}
                    </p>
                    <p className="text-theme-secondary">
                      {t('limit_info')}{' '}
                      {conflicts.weeklyLimitWarning.maxLessonsPerWeek}{' '}
                      {t('lesson_per_week')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings Gerais */}
          {conflicts.warnings.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-accent-blue mb-3">
                {t('additional_warnings')}
              </h3>
              <div className="space-y-2">
                {conflicts.warnings.map((warning, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 text-sm text-theme-secondary"
                  >
                    <FiInfo className="w-4 h-4 text-accent-blue" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-theme-secondary mt-6">
          <button
            onClick={onCancel}
            className="btn-classical-secondary"
            disabled={loading}
          >
            {conflicts.hasTimeConflicts ? t('adjust_schedule') : t('cancel')}
          </button>

          {!conflicts.hasTimeConflicts && (
            <button
              onClick={onConfirm}
              disabled={loading}
              className="btn-classical-primary bg-accent-yellow hover:bg-accent-yellow/80 flex items-center space-x-2"
            >
              {loading ? (
                <FiRefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <FiCheckCircle className="w-4 h-4" />
              )}
              <span>{loading ? t('creating') : t('create_anyway')}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default function CreateLessonPageClient({
  initialData,
  errorMessage,
}: CreateLessonPageClientProps) {
  const router = useRouter();
  const { createLesson, loading, error, clearError } = useTeacherLessons();
  const { t } = useTranslation({ sections: ['teacher/lessonsCreate'] });

  // Refs para validação e scroll
  const fieldRefs = {
    studentUserId: useRef<HTMLSelectElement>(null),
    title: useRef<HTMLInputElement>(null),
    scheduledAt: useRef<HTMLInputElement>(null),
    duration: useRef<HTMLInputElement>(null),
    recurrenceEnd: useRef<HTMLInputElement>(null),
  };

  // Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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

  // Estados para peças musicais
  const [selectedWorks, setSelectedWorks] = useState<LessonWork[]>([]);
  const [worksIds, setWorksIds] = useState<string[]>([]);
  const [workScoreIds, setWorkScoreIds] = useState<string[]>([]);

  // Estados para conflitos
  const [conflicts, setConflicts] = useState<ConflictCheckResult | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<
    (typeof initialData.students)[0] | null
  >(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(false);

  // Options traduzidas
  const recurrenceOptions = [
    { value: 'NONE', label: t('recurrence_none') },
    { value: 'WEEKLY', label: t('recurrence_weekly') },
    { value: 'BIWEEKLY', label: t('recurrence_biweekly') },
    { value: 'TWICE_WEEKLY', label: t('recurrence_twice_weekly') },
    { value: 'MONTHLY', label: t('recurrence_monthly') },
  ];

  const lessonTypeOptions = [
    { value: 'INDIVIDUAL', label: t('type_individual') },
    { value: 'GROUP', label: t('type_group') },
    { value: 'THEORY', label: t('type_theory') },
    { value: 'PRACTICE', label: t('type_practice') },
    { value: 'MASTERCLASS', label: t('type_masterclass') },
  ];

  // Função para scroll automático para o primeiro erro
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

  // Função de validação completa
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validação do aluno
    if (!formData.studentUserId.trim()) {
      newErrors.studentUserId = 'Selecione um aluno para a aula';
    }

    // Validação do título
    if (!formData.title.trim()) {
      newErrors.title = 'Título da aula é obrigatório';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }

    // Validação da data e hora melhorada
    if (!formData.scheduledAt.trim()) {
      newErrors.scheduledAt = 'Data e hora da aula são obrigatórias';
    } else {
      const scheduledDate = new Date(formData.scheduledAt);
      const now = new Date();

      // Adiciona 15 minutos de margem mínima
      const minDate = new Date(now.getTime() + 15 * 60 * 1000);

      if (isNaN(scheduledDate.getTime())) {
        newErrors.scheduledAt = 'Data e hora inválidas';
      } else if (scheduledDate <= minDate) {
        const diffMinutes = Math.ceil(
          (minDate.getTime() - scheduledDate.getTime()) / (1000 * 60)
        );
        newErrors.scheduledAt = `A aula deve ser agendada com pelo menos 15 minutos de antecedência (faltam ${diffMinutes} min)`;
      } else {
        // Verificar se não é muito no futuro (máximo 1 ano)
        const maxDate = new Date();
        maxDate.setFullYear(maxDate.getFullYear() + 1);

        if (scheduledDate > maxDate) {
          newErrors.scheduledAt =
            'A aula não pode ser agendada para mais de 1 ano no futuro';
        }
      }
    }

    // Validação da duração
    if (!formData.duration || formData.duration < 15) {
      newErrors.duration = 'Duração mínima é de 15 minutos';
    } else if (formData.duration > 240) {
      newErrors.duration = 'Duração máxima é de 240 minutos';
    }

    // Validação de recorrência
    if (formData.isRecurring) {
      if (!formData.recurrenceEnd.trim()) {
        newErrors.recurrenceEnd = 'Data de fim da recorrência é obrigatória';
      } else if (formData.scheduledAt) {
        const endDate = new Date(formData.recurrenceEnd);
        const startDate = new Date(formData.scheduledAt);

        if (endDate <= startDate) {
          newErrors.recurrenceEnd =
            'Data de fim deve ser posterior à data de início';
        }

        // Verificar se não excede 3 meses
        const maxDate = new Date(startDate);
        maxDate.setMonth(maxDate.getMonth() + 3);

        if (endDate > maxDate) {
          newErrors.recurrenceEnd = 'Recorrência não pode exceder 3 meses';
        }
      }
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
  }, [formData, scrollToFirstError]);

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

    // Limpar erro de aluno quando selecionar um
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

  // Função para verificar conflitos
  const checkForConflicts = useCallback(async () => {
    if (!formData.studentUserId || !formData.scheduledAt || !selectedStudent) {
      return;
    }

    setCheckingConflicts(true);

    try {
      const response = await fetch('/api/lessons/check-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentUserId: formData.studentUserId,
          scheduledAt: formData.scheduledAt,
          duration: formData.duration,
          maxLessonsPerWeek: selectedStudent.relationship.maxLessonsPerWeek,
        }),
      });

      if (response.ok) {
        const conflictData = await response.json();

        if (conflictData.success) {
          setConflicts(conflictData.conflicts);

          // Mostrar modal apenas se houver conflitos ou warnings
          if (
            conflictData.conflicts.hasTimeConflicts ||
            conflictData.conflicts.hasWeeklyLimitExceeded
          ) {
            setShowConflictModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error);
    } finally {
      setCheckingConflicts(false);
    }
  }, [
    formData.studentUserId,
    formData.scheduledAt,
    formData.duration,
    selectedStudent,
  ]);

  // Verificar conflitos quando data/hora mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkForConflicts();
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [checkForConflicts]);

  // Handler para mudanças nas peças musicais
  const handleWorksChange = useCallback((works: LessonWork[]) => {
    console.log('🎵 Peças musicais atualizadas:', works);
    setSelectedWorks(works);

    const newWorksIds = works.map((work) => work.workId);
    const newWorkScoreIds = works
      .filter((work) => work.scoreId)
      .map((work) => work.scoreId!);

    setWorksIds(newWorksIds);
    setWorkScoreIds(newWorkScoreIds);
  }, []);

  // Form handlers
  const updateFormData = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Limpar erro do campo quando usuário digitar
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

  // Função para obter data/hora mínima
  const getMinDateTime = (): string => {
    const now = new Date();
    // Adiciona 30 minutos para dar uma margem mínima
    now.setMinutes(now.getMinutes() + 30);

    // Formato: YYYY-MM-DDTHH:MM
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Função para validação em tempo real
  const handleDateTimeChange = useCallback(
    (value: string) => {
      updateFormData('scheduledAt', value);

      // Validação em tempo real
      if (value) {
        const scheduledDate = new Date(value);
        const now = new Date();
        const minDate = new Date(now.getTime() + 15 * 60 * 1000);

        if (scheduledDate <= minDate) {
          const diffMinutes = Math.ceil(
            (minDate.getTime() - scheduledDate.getTime()) / (1000 * 60)
          );
          setValidationErrors((prev) => ({
            ...prev,
            scheduledAt: `Horário deve ser pelo menos 15 minutos no futuro (faltam ${diffMinutes} min)`,
          }));
        } else {
          // Limpar erro se a data estiver válida
          setValidationErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.scheduledAt;
            return newErrors;
          });
        }
      }
    },
    [updateFormData]
  );

  useEffect(() => {
    // Atualizar o datetime mínimo a cada minuto
    const interval = setInterval(() => {
      // Força re-render para atualizar o min datetime
      setFormData((prev) => ({ ...prev }));
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
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

  // Submit handler atualizado com validação
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      // Validar formulário antes de prosseguir
      if (!validateForm()) {
        return;
      }

      // Verificar conflitos antes de prosseguir
      if (conflicts?.hasTimeConflicts) {
        setShowConflictModal(true);
        return;
      }

      // Se tem limite semanal mas não há conflitos de horário, verificar primeiro
      if (conflicts?.hasWeeklyLimitExceeded && !conflicts?.hasTimeConflicts) {
        setShowConflictModal(true);
        return;
      }

      await submitLesson();
    },
    [formData, conflicts, clearError, validateForm]
  );

  // Função para submeter a aula
  const submitLesson = useCallback(
    async (forceCreate = false) => {
      // Clean up array fields
      const cleanData = {
        ...formData,
        objectives: formData.objectives.filter((obj) => obj.trim()),
        topics: formData.topics.filter((topic) => topic.trim()),
        techniques: formData.techniques.filter((tech) => tech.trim()),
        worksIds: worksIds,
        workScoreIds: workScoreIds,
        forceCreate, // Flag para ignorar warnings (não conflitos)
      };

      console.log('🚀 Enviando dados da aula:', {
        ...cleanData,
        totalPecas: worksIds.length,
        totalPartituras: workScoreIds.length,
        forceCreate,
      });

      const success = await createLesson(cleanData);

      if (success) {
        router.push('/teacher/lessons');
      }
    },
    [formData, worksIds, workScoreIds, createLesson, router]
  );

  // Handle conflicts confirmation
  const handleConflictConfirmation = useCallback(async () => {
    setShowConflictModal(false);
    setPendingSubmission(true);

    await submitLesson(true); // Force create
    setPendingSubmission(false);
  }, [submitLesson]);

  const handleConflictCancel = useCallback(() => {
    setShowConflictModal(false);
  }, []);

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
            <Link href="/teacher/lessons" className="btn-classical-primary">
              {t('back_to_lessons')}
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
                  {/* Student Selection */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('basic_information')}
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-theme-primary mb-2">
                        {t('student_label')} *
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
                        error={validationErrors.studentUserId}
                        required
                      />
                    </div>

                    {selectedStudent && (
                      <div className="bg-theme-tertiary rounded-lg p-4">
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
                              {t('level')}{' '}
                              {translateNivel(selectedStudent.level)} • Duração
                              padrão:{' '}
                              {selectedStudent.relationship.lessonDuration}min •
                              Max:{' '}
                              {selectedStudent.relationship.maxLessonsPerWeek}/
                              {t('per_week')}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('lesson_title')} *
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
                          placeholder={t('lesson_title_placeholder')}
                          required
                          error={validationErrors.title}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('lesson_type')}
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
                        {t('description')}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        rows={3}
                        className="input-classical w-full"
                        placeholder={t('description_placeholder')}
                      />
                    </div>
                  </div>

                  {/* Schedule com INDICADOR DE CONFLITOS */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary classical-title">
                      {t('scheduling')}
                    </h3>

                    {/* Indicador de verificação de conflitos */}
                    {checkingConflicts && (
                      <div className=" rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FiRefreshCw className="w-4 h-4 animate-spin text-accent-blue" />
                          <span className="text-sm text-accent-blue">
                            {t('checking_conflicts')}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Warnings de conflitos */}
                    {conflicts && !checkingConflicts && (
                      <div className="space-y-3">
                        {conflicts.hasTimeConflicts && (
                          <div className="border-red-400 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <FiXCircle className="w-4 h-4 text-accent-red" />
                              <div className="text-sm">
                                <p className="font-medium text-accent-red">
                                  {t('time_conflict_detected')}
                                </p>
                                <p className="text-theme-secondary">
                                  {conflicts.timeConflicts.length}{' '}
                                  {t('conflicting_lessons')}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {conflicts.hasWeeklyLimitExceeded &&
                          !conflicts.hasTimeConflicts && (
                            <div className=" border border-yellow-400 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <FiAlertTriangle className="w-4 h-4 text-accent-yellow" />
                                <div className="text-sm">
                                  <p className="font-medium text-accent-yellow">
                                    {t('weekly_limit_reached')}
                                  </p>
                                  <p className="text-theme-secondary">
                                    {conflicts.weeklyLimitWarning?.studentName}{' '}
                                    {t('already_has_lessons')}{' '}
                                    {
                                      conflicts.weeklyLimitWarning
                                        ?.currentLessons
                                    }{' '}
                                    {t('lessons_this_week')}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                        {!conflicts.hasTimeConflicts &&
                          !conflicts.hasWeeklyLimitExceeded && (
                            <div className=" rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <FiCheckCircle className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-green-300">
                                  {t('no_conflicts_detected')}
                                </span>
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('date_time')} *
                        </label>
                        <Input
                          ref={fieldRefs.scheduledAt}
                          type="datetime-local"
                          value={formData.scheduledAt}
                          onChange={(e) => handleDateTimeChange(e.target.value)}
                          min={getMinDateTime()}
                          className={`input-classical w-full ${
                            validationErrors.scheduledAt
                              ? '!border-red-400'
                              : ''
                          }`}
                          required
                        />
                        {validationErrors.scheduledAt && (
                          <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                            <FiAlertCircle className="w-3 h-3" />
                            <span>{validationErrors.scheduledAt}</span>
                          </p>
                        )}
                        <p className="text-xs text-theme-tertiary mt-1 flex items-center space-x-1">
                          {t('min_advance_notice')}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('duration_minutes')} *
                        </label>
                        <Input
                          ref={fieldRefs.duration}
                          type="number"
                          value={formData.duration}
                          onChange={(e) =>
                            updateFormData('duration', parseInt(e.target.value))
                          }
                          min={15}
                          max={240}
                          step={15}
                          className={`input-classical w-full ${
                            validationErrors.duration ? '!border-red-400' : ''
                          }`}
                        />
                        {validationErrors.duration && (
                          <p className="text-red-500 text-sm mt-1">
                            {validationErrors.duration}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-theme-primary mb-2">
                          {t('location')}
                        </label>
                        <Input
                          type="text"
                          value={formData.location}
                          onChange={(e) =>
                            updateFormData('location', e.target.value)
                          }
                          className="input-classical w-full"
                          placeholder={t('location_placeholder')}
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
                          <span>{t('recurring_lesson')}</span>
                        </label>
                      </div>

                      {formData.isRecurring && (
                        <div className="space-y-4 p-6 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 border border-brand-primary/20 rounded-lg">
                          <div className="flex items-center space-x-3 mb-4">
                            <FiInfo className="w-5 h-5 text-brand-primary" />
                            <div className="text-sm text-theme-secondary">
                              <p className="font-medium">
                                {t('intelligent_recurrence_system')}
                              </p>
                              <p>{t('recurrence_description')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-theme-primary mb-2">
                                {t('frequency')} *
                              </label>
                              <Select
                                options={recurrenceOptions}
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
                                {t('until_when')} *
                              </label>
                              <Input
                                ref={fieldRefs.recurrenceEnd}
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
                                className={`input-classical w-full ${
                                  validationErrors.recurrenceEnd
                                    ? '!border-red-400'
                                    : ''
                                }`}
                                required
                              />
                              {validationErrors.recurrenceEnd && (
                                <p className="text-red-500 text-sm mt-1">
                                  {validationErrors.recurrenceEnd}
                                </p>
                              )}
                              <p className="text-xs text-theme-tertiary mt-1">
                                {t('maximum_date')}{' '}
                                {formData.scheduledAt
                                  ? getMaxRecurrenceDate(formData.scheduledAt)
                                  : t('select_date')}
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
                                      {t('lessons_will_be_created')}{' '}
                                      <span className="text-brand-primary">
                                        {lessonCount}{' '}
                                        {lessonCount !== 1
                                          ? t('lessons')
                                          : t('lesson')}
                                      </span>
                                    </p>
                                    <p className="text-sm text-theme-tertiary">
                                      {t('from')}{' '}
                                      {new Date(
                                        formData.scheduledAt
                                      ).toLocaleDateString('pt-BR')}{' '}
                                      {t('until')}{' '}
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
                                  {t('simplified_renewal')}
                                </p>
                                <p className="text-theme-secondary">
                                  {t('renewal_description')}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Seção de peças musicais */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title flex items-center space-x-2">
                        <FiMusic className="w-5 h-5" />
                        <span>{t('musical_works')}</span>
                      </h3>
                      <div className="text-sm text-theme-secondary">
                        {selectedWorks.length}/4 {t('selected_works')}
                      </div>
                    </div>

                    <WorkSelectionSection
                      selectedWorks={selectedWorks}
                      onWorksChange={handleWorksChange}
                      maxWorks={4}
                      disabled={loading.createLesson || pendingSubmission}
                    />
                  </div>

                  {/* Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title">
                        {t('lesson_objectives')}
                      </h3>
                      <button
                        type="button"
                        onClick={() => addArrayField('objectives')}
                        className="text-brand-primary hover:text-brand-secondary text-sm flex items-center space-x-1"
                      >
                        <FiPlus className="w-3 h-3" />
                        <span>{t('add')}</span>
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
                            placeholder={t('objectives_placeholder')}
                            widhtFull
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
                      <div className="space-y-6 p-4 bg-theme-secondary/5 rounded-lg">
                        {/* Topics */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              {t('topics_to_cover')}
                            </label>
                            <button
                              type="button"
                              onClick={() => addArrayField('topics')}
                              className="text-brand-primary text-sm flex items-center space-x-1"
                            >
                              <FiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
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
                                  placeholder={t('topics_placeholder')}
                                  widhtFull
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
                            {t('homework')}
                          </label>
                          <textarea
                            value={formData.homework}
                            onChange={(e) =>
                              updateFormData('homework', e.target.value)
                            }
                            rows={3}
                            className="input-classical w-full"
                            placeholder={t('homework_placeholder')}
                          />
                        </div>

                        {/* Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              {t('teacher_notes')}
                            </label>
                            <textarea
                              value={formData.teacherNotes}
                              onChange={(e) =>
                                updateFormData('teacherNotes', e.target.value)
                              }
                              rows={3}
                              className="input-classical w-full"
                              placeholder={t('teacher_notes_placeholder')}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-theme-primary mb-2">
                              {t('public_notes')}
                            </label>
                            <textarea
                              value={formData.publicNotes}
                              onChange={(e) =>
                                updateFormData('publicNotes', e.target.value)
                              }
                              rows={3}
                              className="input-classical w-full"
                              placeholder={t('public_notes_placeholder')}
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
                            {t('error_creating_lesson')}
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
                      {t('cancel')}
                    </Link>
                    <button
                      type="submit"
                      disabled={
                        loading.createLesson ||
                        pendingSubmission ||
                        checkingConflicts
                      }
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {loading.createLesson || pendingSubmission ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : checkingConflicts ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>
                        {loading.createLesson || pendingSubmission
                          ? formData.isRecurring
                            ? t('creating_series')
                            : t('creating_lesson')
                          : checkingConflicts
                          ? t('checking')
                          : formData.isRecurring
                          ? `${t('create_lessons')} ${lessonCount} ${
                              lessonCount !== 1 ? t('lessons') : t('lesson')
                            }`
                          : t('create_lesson')}
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
                    {t('student_information')}
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

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          {t('default_duration')}
                        </span>
                        <span className="text-theme-primary">
                          {selectedStudent.relationship.lessonDuration} min
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          {t('weekly_limit')}
                        </span>
                        <span className="text-theme-primary">
                          {selectedStudent.relationship.maxLessonsPerWeek}
                          {t('per_week')}
                        </span>
                      </div>
                      {selectedStudent.relationship.preferredDays &&
                        selectedStudent.relationship.preferredDays.length >
                          0 && (
                          <div className="flex justify-between">
                            <span className="text-theme-tertiary">
                              {t('preferred_days')}
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

            {/* Resumo das peças selecionadas */}
            {selectedWorks.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6 ">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiMusic className="w-5 h-5" />
                    <span>{t('selected_works_title')}</span>
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
                            {work.composerName}
                          </p>
                          {work.scoreId && (
                            <p className="text-xs text-accent-green">
                              ✓ {t('with_score')}
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
                          <span>{t('total_works')}</span>
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

            {/* Tips */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('tips')}
                </h3>
                <div className="space-y-3 text-sm text-theme-secondary">
                  <div className="flex items-start space-x-2">
                    <FiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_clear_objectives')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiMusic className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_link_musical_works')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiRepeat className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_use_recurring')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiClock className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_respect_limits')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiCalendar className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_recurrence_works')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiAlertCircle className="w-4 h-4 text-accent-red mt-0.5 flex-shrink-0" />
                    <p>{t('tip_required_fields')}</p>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      {/* Modal de conflitos */}
      {conflicts && (
        <ConflictModal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          conflicts={conflicts}
          onConfirm={handleConflictConfirmation}
          onCancel={handleConflictCancel}
          loading={pendingSubmission}
          t={t}
        />
      )}
    </PageContainer>
  );
}
