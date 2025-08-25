// app/teacher/students/[studentId]/pageClient.tsx - Client Component ATUALIZADO
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPause,
  FiPlay,
  FiEdit3,
  FiBookOpen,
  FiBarChart2,
  FiArrowLeft,
  FiPlus,
  FiEye,
  FiActivity,
  FiMessageSquare,
  FiFileText,
  FiSettings,
  FiRefreshCw,
  FiChevronRight,
  FiX,
  FiSave,
  FiUserCheck,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../../components/animation/AnimatedComponents';
import { useTeacherStudentDetail } from '@/app/hooks/lessonsSystem/useTeacherStudentDetail';
import { StudentDetailData } from './pageServer';
import { translateNivel } from '@/app/utils';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';
import { useTranslation } from '@/app/hooks/useTranslation';

interface TeacherStudentDetailPageClientProps {
  studentData: StudentDetailData;
}

interface EditRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  relationship: StudentDetailData['relationship'];
  onSave: (updates: RelationshipUpdates) => Promise<boolean>;
  loading: boolean;
  t: (key: string, params?: Record<string, any>) => string;
}

interface RelationshipUpdates {
  maxLessonsPerWeek: number;
  lessonDuration: number;
  preferredDays: string[];
  preferredTimes: string[];
  learningPlan?: string;
  currentFocus: string[];
  teacherNotes?: string;
}

const TIME_SLOTS = [
  { value: '07:00', label: '07:00' },
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' },
];

// Common focus areas will be translated dynamically

function EditRelationshipModal({
  isOpen,
  onClose,
  relationship,
  onSave,
  loading,
  t,
}: EditRelationshipModalProps) {
  const [formData, setFormData] = useState<RelationshipUpdates>({
    maxLessonsPerWeek: relationship.maxLessonsPerWeek,
    lessonDuration: relationship.lessonDuration,
    preferredDays: relationship.preferredDays || [],
    preferredTimes: relationship.preferredTimes || [],
    learningPlan: relationship.learningPlan || '',
    currentFocus: relationship.currentFocus || [],
    teacherNotes: relationship.teacherNotes || '',
  });

  // Translated days of week
  const DAYS_OF_WEEK = [
    { value: 'monday', label: t('days_monday') },
    { value: 'tuesday', label: t('days_tuesday') },
    { value: 'wednesday', label: t('days_wednesday') },
    { value: 'thursday', label: t('days_thursday') },
    { value: 'friday', label: t('days_friday') },
    { value: 'saturday', label: t('days_saturday') },
    { value: 'sunday', label: t('days_sunday') },
  ];

  // Translated focus areas
  const COMMON_FOCUS_AREAS = [
    t('focus_basic_technique'),
    t('focus_sheet_reading'),
    t('focus_music_theory'),
    t('focus_classical_repertoire'),
    t('focus_improvisation'),
    t('focus_fingering'),
    t('focus_dynamics'),
    t('focus_phrasing'),
    t('focus_rhythm'),
    t('focus_harmony'),
  ];

  // Reset form when relationship changes
  useEffect(() => {
    setFormData({
      maxLessonsPerWeek: relationship.maxLessonsPerWeek,
      lessonDuration: relationship.lessonDuration,
      preferredDays: relationship.preferredDays || [],
      preferredTimes: relationship.preferredTimes || [],
      learningPlan: relationship.learningPlan || '',
      currentFocus: relationship.currentFocus || [],
      teacherNotes: relationship.teacherNotes || '',
    });
  }, [relationship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSave(formData);
    if (success) {
      onClose();
    }
  };

  const handleMultiSelectChange = (
    field: 'preferredDays' | 'preferredTimes' | 'currentFocus',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleAddFocusArea = (area: string) => {
    if (area.trim() && !formData.currentFocus.includes(area.trim())) {
      setFormData((prev) => ({
        ...prev,
        currentFocus: [...prev.currentFocus, area.trim()],
      }));
    }
  };

  const handleRemoveFocusArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      currentFocus: prev.currentFocus.filter((focus) => focus !== area),
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-theme-primary classical-title">
              {t('edit_relationship_modal_title')}
            </h2>
            <p className="text-theme-tertiary">
              {t('edit_relationship_modal_subtitle')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatedCard className="classical-card p-4">
              <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                <FiCalendar className="w-5 h-5 text-brand-primary" />
                {t('lesson_settings')}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('lessons_per_week')}
                    </label>
                    <Select
                      options={[
                        { value: '1', label: t('lesson_option_1') },
                        { value: '2', label: t('lesson_option_2') },
                        { value: '3', label: t('lesson_option_3') },
                        { value: '4', label: t('lesson_option_4') },
                      ]}
                      value={formData.maxLessonsPerWeek.toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxLessonsPerWeek: parseInt(e.target.value),
                        }))
                      }
                      className="input-classical w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-theme-primary mb-2">
                      {t('duration_minutes')}
                    </label>
                    <Select
                      options={[
                        { value: '30', label: t('duration_30') },
                        { value: '45', label: t('duration_45') },
                        { value: '60', label: t('duration_60') },
                        { value: '90', label: t('duration_90') },
                        { value: '120', label: t('duration_120') },
                      ]}
                      value={formData.lessonDuration.toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          lessonDuration: parseInt(e.target.value),
                        }))
                      }
                      className="input-classical w-full"
                    />
                  </div>
                </div>

                {/* Dias Preferidos */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    {t('preferred_days')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <label
                        key={day.value}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                          formData.preferredDays.includes(day.value)
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-theme-secondary hover:border-theme-primary'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.preferredDays.includes(day.value)}
                          onChange={() =>
                            handleMultiSelectChange('preferredDays', day.value)
                          }
                          className="sr-only"
                        />
                        <span className="text-sm">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Horários Preferidos */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    {t('preferred_times')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {TIME_SLOTS.map((time) => (
                      <label
                        key={time.value}
                        className={`flex items-center justify-center p-2 border rounded-lg cursor-pointer transition-all ${
                          formData.preferredTimes.includes(time.value)
                            ? 'border-brand-primary bg-brand-primary/10 text-brand-primary'
                            : 'border-theme-secondary hover:border-theme-primary'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.preferredTimes.includes(time.value)}
                          onChange={() =>
                            handleMultiSelectChange(
                              'preferredTimes',
                              time.value
                            )
                          }
                          className="sr-only"
                        />
                        <span className="text-sm font-mono">{time.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedCard>

            <AnimatedCard className="classical-card p-4">
              <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                <FiBookOpen className="w-5 h-5 text-brand-primary" />
                {t('study_plan')}
              </h3>

              <div className="space-y-4">
                {/* Áreas de Foco */}
                <div>
                  <label className="block text-sm font-medium text-theme-primary mb-2">
                    {t('focus_areas')}
                  </label>

                  {/* Botões Rápidos */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_FOCUS_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleAddFocusArea(area)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          formData.currentFocus.includes(area)
                            ? 'border-brand-primary bg-brand-primary text-white'
                            : 'border-theme-secondary text-theme-secondary hover:border-brand-primary hover:text-brand-primary'
                        }`}
                        disabled={formData.currentFocus.includes(area)}
                      >
                        {area}
                      </button>
                    ))}
                  </div>

                  {/* Selecionadas */}
                  {formData.currentFocus.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-theme-secondary">
                        {t('selected_areas')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {formData.currentFocus.map((focus) => (
                          <span
                            key={focus}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary text-white text-sm rounded-full"
                          >
                            {focus}
                            <button
                              type="button"
                              onClick={() => handleRemoveFocusArea(focus)}
                              className="hover:text-red-200"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AnimatedCard>
          </div>

          {/* Campos de Texto */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                {t('detailed_learning_plan')}
              </label>
              <textarea
                value={formData.learningPlan}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    learningPlan: e.target.value,
                  }))
                }
                rows={4}
                className="input-classical w-full"
                placeholder={t('detailed_learning_plan_placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-primary mb-2">
                {t('teacher_notes_private')}
              </label>
              <textarea
                value={formData.teacherNotes}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    teacherNotes: e.target.value,
                  }))
                }
                rows={3}
                className="input-classical w-full"
                placeholder={t('teacher_notes_private_placeholder')}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-theme-secondary">
            <button
              type="button"
              onClick={onClose}
              className="btn-classical-secondary"
              disabled={loading}
            >
              {t('btn_cancel')}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-classical-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('btn_saving')}</span>
                </>
              ) : (
                <>
                  <FiSave className="w-4 h-4" />
                  <span>{t('btn_save_changes')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default function TeacherStudentDetailPageClient({
  studentData,
}: TeacherStudentDetailPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/students/[studentId]'] });

  // Initialize hook with server data
  const {
    // State do hook
    studentData: currentStudentData,
    loading,
    error,

    // Actions do hook
    refreshStudentData,
    setInitialData,
    updateTeacherNotes,
    toggleStudentStatus,
    updateRelationship,
    clearError,
  } = useTeacherStudentDetail(studentData);

  const [editingNotes, setEditingNotes] = useState(false);
  const [showEditRelationship, setShowEditRelationship] = useState(false);
  const [teacherNotes, setTeacherNotes] = useState(
    studentData.relationship.teacherNotes || ''
  );

  // Initialize hook data on mount
  useEffect(() => {
    setInitialData(studentData);
  }, [studentData, setInitialData]);

  // Update local notes when studentData changes
  useEffect(() => {
    setTeacherNotes(currentStudentData.relationship.teacherNotes || '');
  }, [currentStudentData.relationship.teacherNotes]);

  const {
    student,
    studentProfile,
    relationship,
    stats,
    recentLessons,
    upcomingLessons,
    assignments,
  } = currentStudentData;

  // Status helpers
  const isActive = relationship.isActive && !relationship.pausedAt;
  const isPaused = relationship.isActive && !!relationship.pausedAt;

  const getStatusColor = () => {
    if (isActive) return 'accent-green';
    if (isPaused) return 'accent-yellow';
    return 'accent-red';
  };

  const getStatusText = () => {
    if (isActive) return t('status_active');
    if (isPaused) return t('status_paused');
    return t('status_inactive');
  };

  // Update teacher notes using hook
  const handleUpdateTeacherNotes = useCallback(async () => {
    const success = await updateTeacherNotes(teacherNotes);

    if (success) {
      setEditingNotes(false);
      console.log('Anotações atualizadas com sucesso!');
    }
  }, [teacherNotes, updateTeacherNotes]);

  // Toggle student status using hook
  const handleToggleStudentStatus = useCallback(async () => {
    const success = await toggleStudentStatus();

    if (success) {
      console.log('Status do aluno atualizado com sucesso!');
    }
  }, [toggleStudentStatus]);

  const handleUpdateRelationship = useCallback(
    async (updates: RelationshipUpdates) => {
      const success = await updateRelationship(updates);

      if (success) {
        console.log('Relação atualizada com sucesso!');
      }

      return success;
    },
    [updateRelationship]
  );

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Breadcrumb */}
        <AnimatedItem direction="down" springType="gentle">
          <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
            <Link
              href="/teacher"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_dashboard')}
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <Link
              href="/teacher/students"
              className="hover:text-brand-primary transition-colors duration-300 font-medium"
            >
              {t('breadcrumb_students')}
            </Link>
            <FiChevronRight className="w-4 h-4" />
            <span className="text-theme-primary font-medium">
              {student.name}
            </span>
          </nav>
        </AnimatedItem>

        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/teacher/students"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gradient-brand classical-title">
                  {student.name}
                </h1>
                <p className="text-theme-secondary">
                  {t('student_since')} {formatDate(relationship.startDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-4 py-2 border rounded-full text-sm font-medium bg-${getStatusColor()}/10 border-${getStatusColor()}/30 text-${getStatusColor()}`}
              >
                {getStatusText()}
              </span>
              <button
                onClick={handleToggleStudentStatus}
                disabled={loading.toggleStatus}
                className={`btn-classical-secondary flex items-center space-x-2 ${
                  isPaused
                    ? 'hover:bg-accent-green/10 hover:border-accent-green/30 hover:text-accent-green'
                    : 'hover:bg-accent-yellow/10 hover:border-accent-yellow/30 hover:text-accent-yellow'
                }`}
              >
                {loading.toggleStatus ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : isPaused ? (
                  <FiPlay className="w-4 h-4" />
                ) : (
                  <FiPause className="w-4 h-4" />
                )}
                <span>
                  {loading.toggleStatus
                    ? t('btn_wait')
                    : isPaused
                    ? t('btn_reactivate')
                    : t('btn_pause')}
                </span>
              </button>
              <Link
                href={`/teacher/lessons/create?studentId=${student.id}`}
                className="btn-classical-primary flex items-center space-x-2"
              >
                <FiPlus className="w-4 h-4" />
                <span>{t('btn_new_lesson')}</span>
              </Link>
            </div>
          </div>
        </AnimatedItem>

        {/* Error Message */}
        {error && (
          <AnimatedItem direction="up" springType="gentle">
            <AnimatedCard
              hover="lift"
              className="classical-card p-4 border-l-4 border-accent-red mb-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FiXCircle className="w-5 h-5 text-accent-red" />
                  <span className="text-accent-red font-medium">{error}</span>
                </div>
                <button
                  onClick={clearError}
                  className="text-accent-red hover:text-accent-red/80 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </AnimatedCard>
          </AnimatedItem>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Student Info Card */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-6 mb-6">
                  {/* Avatar */}
                  <div className="relative w-20 h-20">
                    {student.image ? (
                      <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20">
                        <Image
                          src={student.image}
                          alt={student.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20">
                        <FiUser className="w-10 h-10 text-theme-primary" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-theme-primary classical-title mb-2">
                      {student.name}
                    </h2>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center space-x-2 text-theme-secondary">
                        <FiMail className="w-4 h-4" />
                        <span>{student.email}</span>
                      </div>
                      {student.phone && (
                        <div className="flex items-center space-x-2 text-theme-secondary">
                          <FiPhone className="w-4 h-4" />
                          <span>{student.phone}</span>
                        </div>
                      )}
                      {(student.city || student.state) && (
                        <div className="flex items-center space-x-2 text-theme-secondary">
                          <FiMapPin className="w-4 h-4" />
                          <span>
                            {[student.city, student.state]
                              .filter(Boolean)
                              .join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary">
                        {t('musical_level')}
                      </label>
                      <p className="text-theme-primary font-semibold">
                        {translateNivel(studentProfile.level)}
                      </p>
                    </div>
                    {studentProfile.mainInstrument && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          {t('main_instrument')}
                        </label>
                        <p className="text-theme-primary font-semibold">
                          {studentProfile.mainInstrument}
                        </p>
                      </div>
                    )}
                    {student.experienceLevel && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          {t('experience')}
                        </label>
                        <p className="text-theme-primary font-semibold">
                          {translateNivel(student.experienceLevel)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary">
                        {t('lesson_frequency')}
                      </label>
                      <p className="text-theme-primary font-semibold">
                        {relationship.maxLessonsPerWeek}
                        {t('times_per_week')} • {relationship.lessonDuration}min
                      </p>
                    </div>
                    {studentProfile.practiceTime && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary">
                          {t('practice_time')}
                        </label>
                        <p className="text-theme-primary font-semibold">
                          {studentProfile.practiceTime}
                          {t('min_per_day')}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary">
                        {t('member_since')}
                      </label>
                      <p className="text-theme-primary font-semibold">
                        {formatDate(student.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Musical Goals */}
                {studentProfile.musicalGoals &&
                  typeof studentProfile.musicalGoals === 'string' &&
                  studentProfile.musicalGoals.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-theme-secondary">
                      <label className="text-sm font-medium text-theme-tertiary block mb-3">
                        {t('musical_goals')}
                      </label>
                      <div className="text-theme-primary">
                        {studentProfile.musicalGoals}
                      </div>
                    </div>
                  )}

                {/* Current Focus */}
                {relationship.currentFocus &&
                  relationship.currentFocus.length > 0 && (
                    <div className="mt-4">
                      <label className="text-sm font-medium text-theme-tertiary block mb-3">
                        {t('current_focus')}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {relationship.currentFocus.map((focus, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-sm"
                          >
                            {focus}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Relationship Settings */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                      <FiUserCheck className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-theme-primary classical-title">
                        {t('relationship_settings')}
                      </h3>
                      <p className="text-theme-tertiary text-sm">
                        {t('relationship_settings_subtitle')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowEditRelationship(true)}
                    className="btn-classical-secondary flex items-center space-x-2"
                  >
                    <FiEdit3 className="w-4 h-4" />
                    <span>{t('btn_edit')}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="classical-card-2 p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <FiCalendar className="w-5 h-5 text-brand-primary" />
                        <h4 className="font-semibold text-theme-primary">
                          {t('lesson_frequency_title')}
                        </h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-theme-tertiary">
                            {t('per_week')}
                          </span>
                          <span className="text-theme-primary font-medium">
                            {relationship.maxLessonsPerWeek}{' '}
                            {relationship.maxLessonsPerWeek !== 1
                              ? t('lesson_plural')
                              : t('lesson_singular')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-theme-tertiary">
                            {t('duration')}
                          </span>
                          <span className="text-theme-primary font-medium">
                            {relationship.lessonDuration} {t('minutes')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {relationship.preferredDays &&
                      relationship.preferredDays.length > 0 && (
                        <div className="classical-card-2 p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <FiCalendar className="w-5 h-5 text-accent-green" />
                            <h4 className="font-semibold text-theme-primary">
                              {t('preferred_days')}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {relationship.preferredDays.map((day) => {
                              const dayLabel = t(`days_${day}`) || day;
                              return (
                                <span
                                  key={day}
                                  className="px-2 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded text-sm"
                                >
                                  {dayLabel}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                  </div>

                  <div className="space-y-4">
                    {relationship.preferredTimes &&
                      relationship.preferredTimes.length > 0 && (
                        <div className="classical-card-2 p-4">
                          <div className="flex items-center space-x-3 mb-3">
                            <FiClock className="w-5 h-5 text-accent-blue" />
                            <h4 className="font-semibold text-theme-primary">
                              {t('preferred_times')}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {relationship.preferredTimes.map((time) => (
                              <span
                                key={time}
                                className="px-2 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded text-sm font-mono"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {relationship.learningPlan && (
                      <div className="classical-card-2 p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <FiBookOpen className="w-5 h-5 text-accent-purple" />
                          <h4 className="font-semibold text-theme-primary">
                            {t('learning_plan')}
                          </h4>
                        </div>
                        <p className="text-sm text-theme-secondary line-clamp-3">
                          {relationship.learningPlan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Progress Stats */}
            <AnimatedItem direction="up" springType="gentle">
              <SequentialGrid cols={4} gap={6} delayBetweenItems={0.1}>
                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiBookOpen className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {stats.totalLessons}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {t('total_lessons')}
                  </div>
                </AnimatedCard>

                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiCheckCircle className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {stats.completionRate}%
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {t('completion_rate')}
                  </div>
                </AnimatedCard>

                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiClock className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {formatDuration(stats.totalStudyTime).split(' ')[0]}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {t('study_hours')}
                  </div>
                </AnimatedCard>

                <AnimatedCard
                  hover="scale"
                  className="classical-card p-6 text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FiActivity className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="text-2xl font-bold text-theme-primary mb-1">
                    {stats.streakDays}
                  </div>
                  <div className="text-sm text-theme-tertiary">
                    {t('streak_days')}
                  </div>
                </AnimatedCard>
              </SequentialGrid>
            </AnimatedItem>

            {/* Recent Lessons */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiClock className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-theme-primary classical-title">
                        {t('recent_lessons')}
                      </h3>
                      <p className="text-theme-tertiary text-sm">
                        {t('recent_lessons_subtitle', {
                          count: recentLessons.length,
                        })}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/teacher/lessons?studentId=${student.id}`}
                    className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>{t('see_all')}</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentLessons.slice(0, 5).map((lesson) => (
                    <div key={lesson.id} className="classical-card-2 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-theme-primary">
                              {lesson.title}
                            </h4>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                lesson.status === 'COMPLETED'
                                  ? 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                                  : lesson.status === 'CANCELLED'
                                  ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                                  : 'bg-accent-blue/10 border border-accent-blue/30 text-accent-blue'
                              }`}
                            >
                              {lesson.status === 'COMPLETED'
                                ? t('lesson_completed')
                                : lesson.status === 'CANCELLED'
                                ? t('lesson_cancelled')
                                : lesson.status}
                            </span>
                          </div>

                          <div className="flex items-center space-x-4 text-sm text-theme-tertiary mb-2">
                            <span>{formatDateTime(lesson.scheduledAt)}</span>
                            <span>•</span>
                            <span>{lesson.duration}min</span>
                          </div>

                          {lesson.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {lesson.topics
                                .slice(0, 3)
                                .map((topic, topicIndex) => (
                                  <span
                                    key={topicIndex}
                                    className="px-2 py-1 bg-theme-elevated text-theme-secondary rounded text-xs"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              {lesson.topics.length > 3 && (
                                <span className="px-2 py-1 bg-theme-elevated text-theme-tertiary rounded text-xs">
                                  +{lesson.topics.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {lesson.homework && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded border border-theme-primary/20">
                              <div className="text-xs text-theme-tertiary mb-1">
                                {t('homework_label')}
                              </div>
                              <div className="text-sm text-theme-primary line-clamp-2">
                                {lesson.homework}
                              </div>
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/teacher/lessons/${lesson.id}`}
                          className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center ml-4"
                        >
                          <FiEye className="w-4 h-4 text-theme-tertiary hover:text-brand-primary transition-colors" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {recentLessons.length === 0 && (
                    <div className="text-center py-8">
                      <FiClock className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                      <p className="text-theme-tertiary">
                        {t('no_lessons_completed')}
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Teacher Notes */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center">
                      <FiMessageSquare className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-theme-primary classical-title">
                        {t('teacher_notes')}
                      </h3>
                      <p className="text-theme-tertiary text-sm">
                        {t('teacher_notes_subtitle')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingNotes(!editingNotes)}
                    disabled={loading.updateNotes}
                    className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center"
                  >
                    {loading.updateNotes ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin text-theme-tertiary" />
                    ) : (
                      <FiEdit3 className="w-4 h-4 text-theme-tertiary hover:text-brand-primary transition-colors" />
                    )}
                  </button>
                </div>

                {editingNotes ? (
                  <div className="space-y-4">
                    <textarea
                      value={teacherNotes}
                      onChange={(e) => setTeacherNotes(e.target.value)}
                      placeholder={t('teacher_notes_placeholder')}
                      className="input-classical-2 w-full h-32 resize-none"
                      disabled={loading.updateNotes}
                    />
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleUpdateTeacherNotes}
                        disabled={loading.updateNotes}
                        className="btn-classical-primary text-sm flex items-center space-x-2"
                      >
                        {loading.updateNotes && (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        )}
                        <span>
                          {loading.updateNotes
                            ? t('btn_saving')
                            : t('btn_save')}
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingNotes(false);
                          setTeacherNotes(relationship.teacherNotes || '');
                        }}
                        disabled={loading.updateNotes}
                        className="btn-classical-secondary text-sm"
                      >
                        {t('btn_cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                    {teacherNotes ? (
                      <p className="text-theme-primary whitespace-pre-wrap">
                        {teacherNotes}
                      </p>
                    ) : (
                      <p className="text-theme-tertiary italic">
                        {t('no_notes_yet')}
                      </p>
                    )}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Lessons */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('upcoming_lessons')}
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {upcomingLessons.length} {t('lessons_scheduled')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {upcomingLessons.slice(0, 4).map((lesson) => (
                    <div key={lesson.id} className="classical-card-2 p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-12 bg-brand-primary rounded-full"></div>
                        <div className="flex-1">
                          <div className="font-medium text-theme-primary text-sm">
                            {lesson.title}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {formatDate(lesson.scheduledAt)} •{' '}
                            {formatTime(lesson.scheduledAt)}
                          </div>
                          <div className="text-xs text-accent-blue">
                            {lesson.duration}min
                          </div>
                        </div>
                        <Link
                          href={`/teacher/lessons/${lesson.id}`}
                          className="w-6 h-6 rounded bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                        >
                          <FiEye className="w-3 h-3 text-theme-tertiary" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {upcomingLessons.length === 0 && (
                    <div className="text-center py-6">
                      <FiCalendar className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        {t('no_lessons_scheduled')}
                      </p>
                    </div>
                  )}
                </div>

                {upcomingLessons.length > 0 && (
                  <Link
                    href={`/teacher/lessons?studentId=${student.id}`}
                    className="mt-4 block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                  >
                    {t('see_all_lessons')}
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Current Assignments */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiFileText className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('active_assignments')}
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {assignments.filter((a) => !a.isCompleted).length}{' '}
                      {t('assignments_pending')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {assignments
                    .filter((a) => !a.isCompleted)
                    .slice(0, 4)
                    .map((assignment) => (
                      <div key={assignment.id} className="classical-card-2 p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-theme-primary text-sm line-clamp-1">
                              {assignment.title}
                            </div>
                            <div className="text-xs text-theme-tertiary line-clamp-2">
                              {assignment.description}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                              assignment.priority === 'high'
                                ? 'bg-accent-red/10 border border-accent-red/30 text-accent-red'
                                : assignment.priority === 'medium'
                                ? 'bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow'
                                : 'bg-accent-green/10 border border-accent-green/30 text-accent-green'
                            }`}
                          >
                            {assignment.priority === 'high'
                              ? t('priority_high')
                              : assignment.priority === 'medium'
                              ? t('priority_medium')
                              : t('priority_low')}
                          </span>
                        </div>

                        {assignment.dueDate && (
                          <div className="text-xs text-theme-tertiary mb-2">
                            {t('due_date')} {formatDate(assignment.dueDate)}
                          </div>
                        )}

                        <div className="w-full bg-theme-secondary rounded-full h-2">
                          <div
                            className="progress-bar rounded-full h-2 transition-all"
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}

                  {assignments.filter((a) => !a.isCompleted).length === 0 && (
                    <div className="text-center py-4">
                      <FiCheckCircle className="w-8 h-8 text-accent-green mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        {t('all_assignments_completed')}
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-lg flex items-center justify-center">
                    <FiSettings className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('quick_actions')}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link
                    href={`/teacher/lessons/create?studentId=${student.id}`}
                    className="w-full classical-card-2 p-3 text-left hover:border-brand-primary transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                        <FiPlus className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                          {t('schedule_lesson')}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('schedule_lesson_subtitle')}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/teacher/assignments/create?studentId=${student.id}`}
                    className="w-full classical-card-2 p-3 text-left hover:border-brand-primary transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center">
                        <FiFileText className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                          {t('create_assignment')}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('create_assignment_subtitle')}
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href={`/teacher/students/${student.id}/progress`}
                    className="w-full classical-card-2 p-3 text-left hover:border-brand-primary transition-all group block"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                        <FiBarChart2 className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                          {t('detailed_report')}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {t('detailed_report_subtitle')}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Refresh Button */}
            <AnimatedItem direction="up" springType="gentle">
              <button
                onClick={refreshStudentData}
                disabled={loading.refresh}
                className="w-full btn-classical-secondary flex items-center justify-center space-x-2"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading.refresh ? 'animate-spin' : ''}`}
                />
                <span>
                  {loading.refresh ? t('updating') : t('btn_refresh_data')}
                </span>
              </button>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      <EditRelationshipModal
        isOpen={showEditRelationship}
        onClose={() => setShowEditRelationship(false)}
        relationship={relationship}
        onSave={handleUpdateRelationship}
        loading={loading.updateNotes}
        t={t}
      />
    </PageContainer>
  );
}
