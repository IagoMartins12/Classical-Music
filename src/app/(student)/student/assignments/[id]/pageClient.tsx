// app/student/assignments/[id]/pageClient.tsx - ATUALIZADO COM UPLOAD DE VÍDEO

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiUser,
  FiStar,
  FiX,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiTarget,
  FiBookOpen,
  FiSave,
  FiUpload,
  FiPlay,
  FiMusic,
  FiTrendingUp,
  FiCheckCircle,
  FiCircle,
  FiUsers,
  FiAlertTriangle,
  FiVideo,
  FiTrash2,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { StudentAssignmentDetailsData } from './pageServer';
import Image from 'next/image';
import Link from 'next/link';
import { useStudentAssignments } from '@/app/hooks/lessonsSystem/useStudentAssignments';
import MusicalPiecesSection from '@/app/components/TeacherSystem/MusicalPiecesSection';
import Modal from '@/app/components/Modal';
import { useAssignmentVideo } from '@/app/hooks/lessonsSystem/useAssignmentVideo';
import { useTranslation } from '@/app/hooks/useTranslation';

interface StudentAssignmentDetailsPageClientProps {
  initialData: StudentAssignmentDetailsData | null;
  errorMessage?: string;
}

const ASSIGNMENT_TYPES = {
  practice: 'student_assignment_details_type_practice',
  theory: 'student_assignment_details_type_theory',
  listening: 'student_assignment_details_type_listening',
  composition: 'student_assignment_details_type_composition',
  performance: 'student_assignment_details_type_performance',
  reading: 'student_assignment_details_type_reading',
};

const PRIORITY_COLORS = {
  low: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  medium: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
  high: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
};

const PRIORITY_LABELS = {
  low: 'student_assignment_details_priority_low',
  medium: 'student_assignment_details_priority_medium',
  high: 'student_assignment_details_priority_high',
};

// Progress Milestones Configuration
const PROGRESS_MILESTONES = [
  {
    key: 'learnedLeftHand',
    labelKey: 'student_assignment_details_milestone_learned_left_hand',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 15,
  },
  {
    key: 'learnedRightHand',
    labelKey: 'student_assignment_details_milestone_learned_right_hand',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 15,
  },
  {
    key: 'playedWithMetronome',
    labelKey: 'student_assignment_details_milestone_metronome',
    icon: FiClock,
    color: 'text-accent-purple',
    weight: 20,
  },
  {
    key: 'memorized',
    labelKey: 'student_assignment_details_milestone_memorized',
    icon: FiTarget,
    color: 'text-accent-green',
    weight: 15,
  },
  {
    key: 'playedAtTempo',
    labelKey: 'student_assignment_details_milestone_tempo',
    icon: FiTrendingUp,
    color: 'text-accent-yellow',
    weight: 20,
  },
  {
    key: 'masteredDynamics',
    labelKey: 'student_assignment_details_milestone_dynamics',
    icon: FiMusic,
    color: 'text-accent-purple',
    weight: 10,
  },
  {
    key: 'performedForOthers',
    labelKey: 'student_assignment_details_milestone_performed',
    icon: FiUsers,
    color: 'text-accent-red',
    weight: 5,
  },
];

interface ProgressMilestones {
  learnedLeftHand: boolean;
  learnedRightHand: boolean;
  playedWithMetronome: boolean;
  memorized: boolean;
  playedAtTempo: boolean;
  masteredDynamics: boolean;
  performedForOthers: boolean;
  [key: string]: boolean;
}

export default function StudentAssignmentDetailsPageClient({
  initialData,
  errorMessage,
}: StudentAssignmentDetailsPageClientProps) {
  const { t } = useTranslation({ sections: ['student/assignmentsId'] });

  const { updateAssignment, completeAssignment, loading, error, clearError } =
    useStudentAssignments();

  // 🆕 Hook de upload de vídeo
  const {
    selectedVideo,
    videoPreviewUrl,
    isUploading,
    uploadError,
    selectVideo,
    removeVideo,
    clearError: clearVideoError,
    uploadVideo,
  } = useAssignmentVideo();

  // Estados do progresso e milestones
  const [progressMilestones, setProgressMilestones] =
    useState<ProgressMilestones>(
      initialData?.assignment?.progressMilestones || {
        learnedLeftHand: false,
        learnedRightHand: false,
        playedWithMetronome: false,
        memorized: false,
        playedAtTempo: false,
        masteredDynamics: false,
        performedForOthers: false,
      }
    );

  // Estados do formulário de submissão
  const [studentNotes, setStudentNotes] = useState(
    initialData?.assignment?.studentNotes || ''
  );
  const [studentRating, setStudentRating] = useState(
    initialData?.assignment?.studentRating || 0
  );

  // Estados para controle de mudanças
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados iniciais para comparação
  const [initialStudentNotes] = useState(
    initialData?.assignment?.studentNotes || ''
  );
  const [initialStudentRating] = useState(
    initialData?.assignment?.studentRating || 0
  );

  // Modal states
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // 🆕 Estado do vídeo atual
  const currentVideoSubmission =
    initialData?.assignment?.submissions?.videoSubmission;

  // Detectar mudanças nos campos editáveis
  useEffect(() => {
    const hasChanges =
      studentNotes !== initialStudentNotes ||
      studentRating !== initialStudentRating;

    setHasUnsavedChanges(hasChanges);
  }, [studentNotes, studentRating, initialStudentNotes, initialStudentRating]);

  // Calcular progresso baseado nos milestones
  const calculateProgress = useCallback((milestones: any) => {
    const completedMilestones = PROGRESS_MILESTONES.filter(
      (milestone) => milestones[milestone.key]
    );
    const totalWeight = completedMilestones.reduce(
      (sum, milestone) => sum + milestone.weight,
      0
    );
    return Math.min(100, totalWeight);
  }, []);

  // Handle milestone toggle
  const handleMilestoneToggle = useCallback(
    async (milestoneKey: string) => {
      if (!initialData?.assignment?.id) return;

      const newMilestones = {
        ...progressMilestones,
        [milestoneKey]: !progressMilestones[milestoneKey],
      };

      // Calcular novo progresso
      const newProgress = calculateProgress(newMilestones);

      // Atualizar estado local imediatamente
      setProgressMilestones(newMilestones);

      // Determinar novo status baseado no progresso
      let newStatus = 'PENDING';
      if (newProgress >= 100) {
        newStatus = 'COMPLETED';
      } else if (newProgress > 0) {
        newStatus = 'IN_PROGRESS';
      }

      // Preparar submissions com progressMilestones
      const updatedSubmissions = {
        ...((initialData.assignment.submissions as any) || {}),
        progressMilestones: newMilestones,
      };

      // Atualizar no backend
      const success = await updateAssignment(initialData.assignment.id, {
        progressMilestones: newMilestones,
        submissions: updatedSubmissions,
        progress: newProgress,
        status: newStatus,
        isCompleted: newProgress >= 100,
        completedAt: newProgress >= 100 ? new Date().toISOString() : null,
      });

      if (!success) {
        // Reverter estado local se falhou
        setProgressMilestones(progressMilestones);
      }
    },
    [initialData, progressMilestones, calculateProgress, updateAssignment]
  );

  // Handle save changes (salvar alterações manuais)
  const handleSaveChanges = useCallback(async () => {
    if (!initialData?.assignment?.id) return;

    setIsSaving(true);

    try {
      const updates: any = {};

      if (studentNotes !== initialStudentNotes) {
        updates.studentNotes = studentNotes;
      }

      if (studentRating !== initialStudentRating) {
        updates.studentRating = studentRating;
      }

      if (Object.keys(updates).length === 0) {
        setHasUnsavedChanges(false);
        return;
      }

      const success = await updateAssignment(
        initialData.assignment.id,
        updates
      );

      if (success) {
        setHasUnsavedChanges(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    initialData,
    studentNotes,
    studentRating,
    initialStudentNotes,
    initialStudentRating,
    updateAssignment,
  ]);

  // 🆕 Handle upload de vídeo
  const handleVideoUpload = useCallback(async () => {
    if (!initialData?.assignment?.id || !selectedVideo) return;

    const success = await uploadVideo(initialData.assignment.id);

    if (success) {
      // Refresh da página ou atualizar estado local
      window.location.reload();
    }
  }, [initialData, selectedVideo, uploadVideo]);

  // 🆕 Handle file input change
  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      selectVideo(file);
    },
    [selectVideo]
  );

  // 🆕 Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  // Handle complete assignment
  const handleCompleteAssignment = useCallback(async () => {
    if (!initialData?.assignment?.id) return;

    const success = await completeAssignment(
      initialData.assignment.id,
      studentNotes.trim() || 'Tarefa concluída pelo aluno',
      studentRating || undefined
    );

    if (success) {
      setShowCompleteModal(false);
      // Marcar todos os milestones como completados
      const allCompleted: ProgressMilestones = {
        learnedLeftHand: true,
        learnedRightHand: true,
        playedWithMetronome: true,
        memorized: true,
        playedAtTempo: true,
        masteredDynamics: true,
        performedForOthers: true,
      };
      setProgressMilestones(allCompleted);
      setHasUnsavedChanges(false);
    }
  }, [initialData, studentNotes, studentRating, completeAssignment]);

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status info
  const getStatusColor = (assignment: any) => {
    if (!assignment) return '';

    if (assignment.isOverdue) return 'border-red-400 text-red-500';
    if (assignment.isCompleted) return 'border-green-400 text-green-400';
    if (assignment.status === 'IN_PROGRESS')
      return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
    return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
  };

  const getStatusText = (assignment: any) => {
    if (!assignment) return '';

    if (assignment.isOverdue)
      return t('student_assignment_details_status_overdue');
    if (assignment.isCompleted)
      return t('student_assignment_details_status_completed');
    if (assignment.status === 'IN_PROGRESS')
      return t('student_assignment_details_status_in_progress');
    return t('student_assignment_details_status_pending');
  };

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
              {t('student_assignment_details_error_title')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage ||
                t('student_assignment_details_error_description')}
            </p>
            <Link href="/student/assignments" className="btn-classical-primary">
              {t('student_assignment_details_back_to_assignments')}
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const assignment = initialData.assignment;
  const currentProgress = calculateProgress(progressMilestones);

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/student/assignments"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <FiArrowLeft className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient-brand classical-title">
                  {assignment.title}
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  {t('assignment_by')} {assignment.lesson.teacher.name}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  assignment
                )}`}
              >
                {getStatusText(assignment)}
              </span>

              {/* Botão de Salvar Alterações */}
              {hasUnsavedChanges && (
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="btn-classical-secondary flex items-center space-x-2 bg-accent-blue border-accent-blue text-white hover:bg-accent-blue/90"
                >
                  {isSaving ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiSave className="w-4 h-4" />
                  )}
                  <span>
                    {isSaving
                      ? t('student_assignment_details_saving')
                      : t('student_assignment_details_save_changes')}
                  </span>
                </button>
              )}

              {!assignment.isCompleted && initialData.canSubmit && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="btn-classical-primary flex items-center space-x-2 bg-accent-green border-accent-green hover:bg-accent-green/90"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>
                    {t('student_assignment_details_complete_assignment')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </AnimatedItem>

        {/* Alerta de mudanças não salvas */}
        {hasUnsavedChanges && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="mb-6 p-4 bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg flex items-center space-x-3">
              <FiAlertTriangle className="w-5 h-5 text-accent-yellow" />
              <div className="flex-1">
                <p className="text-accent-yellow font-medium">
                  {t('student_assignment_details_unsaved_changes_title')}
                </p>
                <p className="text-theme-secondary text-sm">
                  {t('student_assignment_details_unsaved_changes_desc')}
                </p>
              </div>
            </div>
          </AnimatedItem>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-xl font-bold text-theme-primary classical-title mb-6">
                  {t('student_assignment_details_section_title')}
                </h2>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_assignment_details_type')}
                      </label>
                      <div className="text-theme-primary">
                        {t(
                          ASSIGNMENT_TYPES[
                            assignment.type as keyof typeof ASSIGNMENT_TYPES
                          ] || assignment.type
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_assignment_details_priority')}
                      </label>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          PRIORITY_COLORS[
                            assignment.priority as keyof typeof PRIORITY_COLORS
                          ]
                        }`}
                      >
                        {t(
                          PRIORITY_LABELS[
                            assignment.priority as keyof typeof PRIORITY_LABELS
                          ]
                        )}
                      </span>
                    </div>

                    {assignment.dueDate && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary block mb-2">
                          {t('student_assignment_details_due_date')}
                        </label>
                        <div className="flex items-center space-x-2 text-theme-primary">
                          <FiCalendar className="w-4 h-4" />
                          <span>{formatDate(assignment.dueDate)}</span>
                          {assignment.daysUntilDue !== null && (
                            <span
                              className={`text-sm ${
                                assignment.isOverdue
                                  ? 'text-red-400 font-semibold'
                                  : assignment.daysUntilDue ?? 0 <= 1
                                  ? 'text-accent-yellow'
                                  : 'text-theme-tertiary'
                              }`}
                            >
                              {assignment.isOverdue
                                ? t('student_assignment_details_days_overdue', {
                                    days: Math.abs(
                                      assignment.daysUntilDue ?? 0
                                    ),
                                  })
                                : assignment.daysUntilDue === 0
                                ? t('student_assignment_details_due_today')
                                : t(
                                    'student_assignment_details_days_remaining',
                                    {
                                      days: `${assignment.daysUntilDue}`,
                                    }
                                  )}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      {t('student_assignment_details_description')}
                    </label>
                    <div className="text-theme-primary whitespace-pre-wrap">
                      {assignment.description}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      {t('student_assignment_details_your_progress')}
                    </label>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex-1">
                        <div className="w-full bg-theme-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              currentProgress >= 100
                                ? 'bg-green-400'
                                : currentProgress >= 50
                                ? 'bg-blue-400'
                                : 'bg-yellow-400'
                            }`}
                            style={{ width: `${currentProgress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-theme-primary font-medium">
                        {currentProgress}%
                      </span>
                    </div>

                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="btn-classical-secondary flex items-center mt-4 space-x-2"
                    >
                      <FiTarget className="w-4 h-4" />
                      <span>
                        {t('student_assignment_details_mark_achievements')}
                      </span>
                    </button>
                  </div>

                  {/* Goals */}
                  {assignment.practiceGoals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_assignment_details_practice_goals')}
                      </label>
                      <div className="space-y-2">
                        {assignment.practiceGoals.map((goal, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-theme-primary"
                          >
                            <FiTarget className="w-4 h-4 text-accent-blue" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.technicalGoals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_assignment_details_technical_goals')}
                      </label>
                      <div className="space-y-2">
                        {assignment.technicalGoals.map((goal, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-theme-primary"
                          >
                            <FiTarget className="w-4 h-4 text-accent-green" />
                            <span>{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {assignment.exercises.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {t('student_assignment_details_exercises')}
                      </label>
                      <div className="space-y-2">
                        {assignment.exercises.map((exercise, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-theme-primary"
                          >
                            <FiBookOpen className="w-4 h-4 text-accent-purple" />
                            <span>{exercise}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* 🆕 SEÇÃO DE UPLOAD DE VÍDEO */}
            {!assignment.isCompleted && initialData.canSubmit && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary classical-title mb-4">
                    {t('student_assignment_details_upload_video_title')}
                  </h3>

                  {/* Vídeo Atual */}
                  {currentVideoSubmission && (
                    <div className="mb-6 p-4 bg-theme-elevated rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-theme-primary mb-1">
                            {t('student_assignment_details_current_video')}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                            <span>{currentVideoSubmission.originalName}</span>

                            <span>
                              {t('student_assignment_details_uploaded_at')}{' '}
                              {formatDateTime(
                                currentVideoSubmission.uploadedAt
                              )}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowVideoModal(true)}
                          className="btn-classical-secondary flex items-center space-x-2"
                        >
                          <FiPlay className="w-4 h-4" />
                          <span>
                            {t('student_assignment_details_view_video')}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {currentVideoSubmission
                          ? t('student_assignment_details_replace_video')
                          : t('student_assignment_details_choose_video')}
                      </label>

                      {!selectedVideo ? (
                        <div className="border-2 border-dashed border-theme-secondary rounded-lg p-8 text-center hover:border-brand-primary transition-colors">
                          <input
                            type="file"
                            id="video-upload"
                            accept="video/mp4,video/webm,video/mov,video/quicktime"
                            onChange={handleFileInputChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="video-upload"
                            className="cursor-pointer"
                          >
                            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center mx-auto mb-4">
                              <FiVideo className="w-8 h-8 text-theme-primary" />
                            </div>
                            <h4 className="text-lg font-medium text-theme-primary mb-2">
                              {t('student_assignment_details_click_to_choose')}
                            </h4>
                            <p className="text-theme-secondary">
                              {t('student_assignment_details_formats_accepted')}
                            </p>
                          </label>
                        </div>
                      ) : (
                        <div className="border border-theme-secondary rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-accent-blue/10 border border-accent-blue/30 rounded-lg flex items-center justify-center">
                                <FiVideo className="w-6 h-6 text-accent-blue" />
                              </div>
                              <div>
                                <div className="font-medium text-theme-primary">
                                  {selectedVideo.name}
                                </div>
                                <div className="text-sm text-theme-secondary">
                                  {formatFileSize(selectedVideo.size)}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={removeVideo}
                              className="text-accent-red hover:text-accent-red/80 transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {videoPreviewUrl && (
                            <div className="mt-4">
                              <video
                                src={videoPreviewUrl}
                                controls
                                className="w-full max-h-64 rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Error Display */}
                    {uploadError && (
                      <div className="p-3 bg-accent-red/10 border border-accent-red/30 rounded-lg flex items-center space-x-2">
                        <FiAlertCircle className="w-4 h-4 text-accent-red" />
                        <span className="text-accent-red text-sm">
                          {uploadError}
                        </span>
                        <button
                          onClick={clearVideoError}
                          className="ml-auto text-accent-red hover:text-accent-red/80"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Upload Button */}
                    {selectedVideo && (
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={removeVideo}
                          disabled={isUploading}
                          className="btn-classical-secondary"
                        >
                          {t('student_assignment_details_cancel')}
                        </button>
                        <button
                          onClick={handleVideoUpload}
                          disabled={isUploading}
                          className="btn-classical-primary flex items-center space-x-2"
                        >
                          {isUploading ? (
                            <FiRefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiUpload className="w-4 h-4" />
                          )}
                          <span>
                            {isUploading
                              ? t('student_assignment_details_uploading')
                              : currentVideoSubmission
                              ? t('student_assignment_details_replace_video')
                              : t('student_assignment_details_upload_video')}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Seção de Peças Musicais */}
            {assignment.workScores && assignment.workScores.length > 0 && (
              <MusicalPiecesSection
                workScores={assignment.workScores}
                title={t('student_assignment_details_musical_pieces_title')}
                emptyMessage={t(
                  'student_assignment_details_musical_pieces_empty'
                )}
              />
            )}

            {/* Teacher Feedback */}
            {assignment.teacherFeedback && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary classical-title mb-4">
                    {t('student_assignment_details_teacher_feedback')}
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-theme-elevated rounded-lg">
                      <p className="text-theme-primary whitespace-pre-wrap">
                        {assignment.teacherFeedback}
                      </p>
                    </div>

                    {assignment.teacherRating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-theme-tertiary">
                          {t('student_assignment_details_teacher_rating')}
                        </span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={`w-5 h-5 ${
                              star <= assignment.teacherRating!
                                ? 'text-accent-yellow fill-current'
                                : 'text-theme-tertiary'
                            }`}
                          />
                        ))}
                        <span className="text-theme-primary ml-2">
                          {assignment.teacherRating}/5
                        </span>
                      </div>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Student Notes */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-xl font-bold text-theme-primary classical-title mb-4">
                  {t('student_assignment_details_student_notes')}
                </h3>

                <div className="space-y-4">
                  <textarea
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    rows={4}
                    className="input-classical w-full"
                    placeholder={t(
                      'student_assignment_details_notes_placeholder'
                    )}
                  />

                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      {t('student_assignment_details_difficulty_question')}
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setStudentRating(star)}
                          className="w-6 h-6 hover:scale-110 transition-transform"
                        >
                          <FiStar
                            className={`w-6 h-6 ${
                              star <= studentRating
                                ? 'text-accent-yellow fill-current'
                                : 'text-theme-tertiary'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-theme-primary ml-2">
                        {studentRating === 0
                          ? t('student_assignment_details_rating_not_rated')
                          : studentRating === 1
                          ? t('student_assignment_details_rating_very_easy')
                          : studentRating === 2
                          ? t('student_assignment_details_rating_easy')
                          : studentRating === 3
                          ? t('student_assignment_details_rating_medium')
                          : studentRating === 4
                          ? t('student_assignment_details_rating_hard')
                          : t('student_assignment_details_rating_very_hard')}
                      </span>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('student_assignment_details_teacher_section')}
                </h3>

                <div className="flex items-center space-x-3 mb-4">
                  {assignment.lesson.teacher.image ? (
                    <div className="w-12 h-12 relative rounded-full overflow-hidden">
                      <Image
                        src={assignment.lesson.teacher.image}
                        alt={assignment.lesson.teacher.name}
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
                      {assignment.lesson.teacher.name}
                    </div>
                    <Link
                      href={`/student/lessons/${assignment.lesson.id}`}
                      className="text-sm text-brand-primary hover:text-brand-secondary"
                    >
                      {t('student_assignment_details_view_related_lesson')}
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('student_assignment_details_information')}
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">
                      {t('student_assignment_details_created_at')}
                    </span>
                    <span className="text-theme-primary">
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>

                  {assignment.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        {t('student_assignment_details_completed_at')}
                      </span>
                      <span className="text-theme-primary">
                        {formatDate(assignment.completedAt)}
                      </span>
                    </div>
                  )}

                  {/* 🆕 Info do vídeo */}
                  {currentVideoSubmission && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        {t('student_assignment_details_video_sent')}
                      </span>
                      <span className="text-accent-green">
                        {formatDate(currentVideoSubmission.uploadedAt)}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-theme-tertiary">
                      {t('student_assignment_details_related_lesson')}
                    </span>
                    <Link
                      href={`/student/lessons/${assignment.lesson.id}`}
                      className="block text-brand-primary hover:text-brand-secondary mt-1"
                    >
                      {assignment.lesson.title}
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Progress Milestones Preview */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('student_assignment_details_achievements')}
                </h3>
                <div className="space-y-2">
                  {PROGRESS_MILESTONES.slice(0, 4).map((milestone) => {
                    const isCompleted = progressMilestones[milestone.key];
                    return (
                      <div
                        key={milestone.key}
                        className={`flex items-center space-x-2 text-sm ${
                          isCompleted
                            ? 'text-theme-primary'
                            : 'text-theme-tertiary'
                        }`}
                      >
                        {isCompleted ? (
                          <FiCheckCircle className="w-4 h-4 text-accent-green" />
                        ) : (
                          <FiCircle className="w-4 h-4" />
                        )}
                        <span>{t(milestone.labelKey)}</span>
                      </div>
                    );
                  })}
                  {PROGRESS_MILESTONES.length > 4 && (
                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="text-sm text-brand-primary hover:text-brand-secondary"
                    >
                      {t('student_assignment_details_see_all_achievements', {
                        count: PROGRESS_MILESTONES.length,
                      })}
                    </button>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-6 right-6 bg-accent-red/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-md">
            <div className="flex items-center space-x-3">
              <FiAlertCircle className="w-5 h-5 text-white" />
              <div>
                <p className="font-medium">Erro</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto text-white hover:text-gray-200"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Complete Assignment Modal */}
        {showCompleteModal && (
          <Modal
            isOpen={showCompleteModal}
            onClose={() => setShowCompleteModal(false)}
            maxWidth="lg"
          >
            <AnimatedCard hover="none">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    {t('student_assignment_details_complete_modal_title')}
                  </h2>
                </div>

                <p className="text-theme-secondary mb-6">
                  {t('student_assignment_details_complete_modal_description')}
                </p>

                <div className="flex items-center justify-between space-x-3">
                  <button
                    onClick={() => setShowCompleteModal(false)}
                    className="btn-classical-secondary"
                    disabled={loading.updateAssignment}
                  >
                    {t('student_assignment_details_complete_modal_cancel')}
                  </button>
                  <button
                    onClick={handleCompleteAssignment}
                    disabled={loading.updateAssignment}
                    className="btn-classical-primary bg-accent-green border-accent-green hover:bg-accent-green/90 flex items-center space-x-2"
                  >
                    {loading.updateAssignment ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiCheck className="w-4 h-4" />
                    )}
                    <span>
                      {loading.updateAssignment
                        ? t('student_assignment_details_completing')
                        : t(
                            'student_assignment_details_complete_modal_confirm'
                          )}
                    </span>
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </Modal>
        )}

        {/* Progress Milestones Modal */}
        {showProgressModal && (
          <Modal
            isOpen={showProgressModal}
            onClose={() => setShowProgressModal(false)}
            maxWidth="4xl"
          >
            <AnimatedCard hover="none">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    {t('student_assignment_details_progress_modal_title')}
                  </h2>
                </div>

                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex-1">
                      <div className="w-full bg-theme-secondary rounded-full h-3">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            currentProgress >= 100
                              ? 'bg-green-400'
                              : currentProgress >= 50
                              ? 'bg-blue-400'
                              : 'bg-yellow-400'
                          }`}
                          style={{ width: `${currentProgress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-theme-primary font-medium">
                      {currentProgress}%
                    </span>
                  </div>
                  <p className="text-sm text-theme-tertiary">
                    {t('student_assignment_details_progress_modal_description')}
                  </p>
                </div>

                <div className="space-y-3 overflow-y-auto">
                  {PROGRESS_MILESTONES.map((milestone) => {
                    const Icon = milestone.icon;
                    const isCompleted = progressMilestones[milestone.key];

                    return (
                      <div
                        key={milestone.key}
                        className={`flex items-center space-x-3 p-3 mx-2 rounded-lg transition-all cursor-pointer shadow-md ${
                          isCompleted
                            ? 'bg-accent-green/5 border-green-400 border'
                            : 'border-theme-secondary'
                        }`}
                        onClick={() => handleMilestoneToggle(milestone.key)}
                      >
                        <div className={`flex-shrink-0 ${milestone.color}`}>
                          {isCompleted ? (
                            <FiCheckCircle className="w-5 h-5 text-accent-green" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-theme-primary">
                            {t(milestone.labelKey)}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            {t(
                              'student_assignment_details_milestone_progress',
                              { weight: milestone.weight }
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <FiCheckCircle className="w-5 h-5 text-accent-green" />
                          ) : (
                            <FiCircle className="w-5 h-5 text-theme-tertiary" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowProgressModal(false)}
                    className="btn-classical-primary"
                  >
                    {t('student_assignment_details_progress_modal_close')}
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </Modal>
        )}

        {/* 🆕 Video Modal */}
        {showVideoModal && currentVideoSubmission && (
          <Modal
            isOpen={showVideoModal}
            onClose={() => setShowVideoModal(false)}
            maxWidth="4xl"
          >
            <AnimatedCard hover="none">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-theme-primary classical-title">
                    {t('student_assignment_details_video_modal_title')}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                    <span>{currentVideoSubmission.originalName}</span>
                    <span>
                      {formatFileSize(currentVideoSubmission.fileSize)}
                    </span>
                    <span>
                      {t('student_assignment_details_uploaded_at')}{' '}
                      {formatDateTime(currentVideoSubmission.uploadedAt)}
                    </span>
                  </div>

                  <video
                    src={currentVideoSubmission.filePath}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '70vh' }}
                  >
                    {t('student_assignment_details_video_not_supported')}
                  </video>
                </div>
              </div>
            </AnimatedCard>
          </Modal>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
