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

interface StudentAssignmentDetailsPageClientProps {
  initialData: StudentAssignmentDetailsData | null;
  errorMessage?: string;
}

const ASSIGNMENT_TYPES = {
  practice: 'Prática',
  theory: 'Teoria',
  listening: 'Escuta',
  composition: 'Composição',
  performance: 'Performance',
  reading: 'Leitura',
};

const PRIORITY_COLORS = {
  low: 'bg-accent-green/10 border-accent-green/30 text-accent-green',
  medium: 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow',
  high: 'bg-accent-red/10 border-accent-red/30 text-accent-red',
};

const PRIORITY_LABELS = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

// Progress Milestones Configuration
const PROGRESS_MILESTONES = [
  {
    key: 'learnedLeftHand',
    label: 'Aprendeu a mão esquerda',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 15,
  },
  {
    key: 'learnedRightHand',
    label: 'Aprendeu a mão direita',
    icon: FiPlay,
    color: 'text-accent-blue',
    weight: 15,
  },
  {
    key: 'playedWithMetronome',
    label: 'Conseguiu tocar no andamento constante com metrônomo',
    icon: FiClock,
    color: 'text-accent-purple',
    weight: 20,
  },
  {
    key: 'memorized',
    label: 'Memorizou a peça',
    icon: FiTarget,
    color: 'text-accent-green',
    weight: 15,
  },
  {
    key: 'playedAtTempo',
    label: 'Conseguiu tocar no andamento original',
    icon: FiTrendingUp,
    color: 'text-accent-yellow',
    weight: 20,
  },
  {
    key: 'masteredDynamics',
    label: 'Dominou dinâmicas e expressividade',
    icon: FiMusic,
    color: 'text-accent-purple',
    weight: 10,
  },
  {
    key: 'performedForOthers',
    label: 'Apresentou para outras pessoas',
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

    if (assignment.isOverdue) return 'Atrasada';
    if (assignment.isCompleted) return 'Concluída';
    if (assignment.status === 'IN_PROGRESS') return 'Em Progresso';
    return 'Pendente';
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
              Erro ao Carregar Tarefa
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage ||
                'Tarefa não encontrada ou sem permissão de acesso'}
            </p>
            <Link href="/student/assignments" className="btn-classical-primary">
              Voltar às Tarefas
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
                  Tarefa de {assignment.lesson.teacher.name}
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
                  <span>{isSaving ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              )}

              {!assignment.isCompleted && initialData.canSubmit && (
                <button
                  onClick={() => setShowCompleteModal(true)}
                  className="btn-classical-primary flex items-center space-x-2 bg-accent-green border-accent-green hover:bg-accent-green/90"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Concluir Tarefa</span>
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
                  Você tem alterações não salvas
                </p>
                <p className="text-theme-secondary text-sm">
                  Clique em &quot;Salvar Alterações&quot; para manter suas
                  modificações.
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
                  Detalhes da Tarefa
                </h2>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        Tipo
                      </label>
                      <div className="text-theme-primary">
                        {ASSIGNMENT_TYPES[
                          assignment.type as keyof typeof ASSIGNMENT_TYPES
                        ] || assignment.type}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        Prioridade
                      </label>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${
                          PRIORITY_COLORS[
                            assignment.priority as keyof typeof PRIORITY_COLORS
                          ]
                        }`}
                      >
                        {
                          PRIORITY_LABELS[
                            assignment.priority as keyof typeof PRIORITY_LABELS
                          ]
                        }
                      </span>
                    </div>

                    {assignment.dueDate && (
                      <div>
                        <label className="text-sm font-medium text-theme-tertiary block mb-2">
                          Prazo
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
                                ? `${Math.abs(
                                    assignment.daysUntilDue ?? 0
                                  )} dias atrasada`
                                : assignment.daysUntilDue === 0
                                ? 'Vence hoje'
                                : `${assignment.daysUntilDue} dias restantes`}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      Descrição
                    </label>
                    <div className="text-theme-primary whitespace-pre-wrap">
                      {assignment.description}
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      Seu Progresso
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

                    {/* <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-3">
                        Tempo de Estudo
                      </label>
                      <div className="rounded-lg p-4 border border-theme-secondary">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <FiClock className="w-4 h-4 text-accent-blue" />
                              <span className="text-sm font-medium text-theme-primary">
                                Tempo Gasto
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={actualTime}
                                onChange={(e) => setActualTime(e.target.value)}
                                className="input-classical w-20 text-center"
                                placeholder="0"
                                min="0"
                                max="999"
                              />
                              <span className="text-theme-secondary text-sm">
                                minutos
                              </span>
                            </div>
                          </div>

                          {assignment.estimatedTime && (
                            <div className="text-right">
                              <div className="text-xs text-theme-tertiary mb-1">
                                Estimado
                              </div>
                              <div className="text-sm font-medium text-theme-primary">
                                {assignment.estimatedTime} min
                              </div>
                            </div>
                          )}
                        </div>

                        {assignment.estimatedTime && actualTime && (
                          <div className="mt-3 pt-3 border-t border-theme-secondary">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-theme-tertiary">
                                Comparação:
                              </span>
                              <span
                                className={
                                  parseInt(actualTime) >
                                  assignment.estimatedTime
                                    ? 'text-accent-yellow'
                                    : parseInt(actualTime) ===
                                      assignment.estimatedTime
                                    ? 'text-accent-green'
                                    : 'text-accent-blue'
                                }
                              >
                                {parseInt(actualTime) > assignment.estimatedTime
                                  ? `+${
                                      parseInt(actualTime) -
                                      assignment.estimatedTime
                                    } min`
                                  : parseInt(actualTime) ===
                                    assignment.estimatedTime
                                  ? 'No prazo'
                                  : `${
                                      assignment.estimatedTime -
                                      parseInt(actualTime)
                                    } min abaixo`}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div> */}

                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="btn-classical-secondary flex items-center mt-4 space-x-2"
                    >
                      <FiTarget className="w-4 h-4" />
                      <span>Marcar Conquistas</span>
                    </button>
                  </div>

                  {/* Goals */}
                  {assignment.practiceGoals.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        Objetivos de Prática
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
                        Objetivos Técnicos
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
                        Exercícios
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
                    Enviar Vídeo da Performance
                  </h3>

                  {/* Vídeo Atual */}
                  {currentVideoSubmission && (
                    <div className="mb-6 p-4 bg-theme-elevated rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-theme-primary mb-1">
                            Vídeo Atual
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                            <span>{currentVideoSubmission.originalName}</span>

                            <span>
                              Enviado em{' '}
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
                          <span>Visualizar</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div>
                      <label className="text-sm font-medium text-theme-tertiary block mb-2">
                        {currentVideoSubmission
                          ? 'Substituir Vídeo'
                          : 'Escolher Vídeo'}
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
                              Clique para escolher um vídeo
                            </h4>
                            <p className="text-theme-secondary">
                              Formatos aceitos: MP4, WebM, MOV (máximo 100MB)
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
                          Cancelar
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
                              ? 'Enviando...'
                              : currentVideoSubmission
                              ? 'Substituir Vídeo'
                              : 'Enviar Vídeo'}
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
                title="Peças Musicais para Estudar"
                emptyMessage="Nenhuma peça musical vinculada a esta tarefa."
              />
            )}

            {/* Teacher Feedback */}
            {assignment.teacherFeedback && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-xl font-bold text-theme-primary classical-title mb-4">
                    Feedback do Professor
                  </h3>

                  <div className="space-y-4">
                    <div className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded-lg">
                      <p className="text-theme-primary whitespace-pre-wrap">
                        {assignment.teacherFeedback}
                      </p>
                    </div>

                    {assignment.teacherRating && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-theme-tertiary">
                          Avaliação do Professor:
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
                  Suas Anotações
                </h3>

                <div className="space-y-4">
                  <textarea
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    rows={4}
                    className="input-classical w-full"
                    placeholder="Escreva suas observações, dificuldades encontradas, descobertas durante o estudo..."
                  />

                  <div>
                    <label className="text-sm font-medium text-theme-tertiary block mb-2">
                      Como você avalia a dificuldade desta tarefa?
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
                          ? 'Não avaliado'
                          : studentRating === 1
                          ? 'Muito fácil'
                          : studentRating === 2
                          ? 'Fácil'
                          : studentRating === 3
                          ? 'Médio'
                          : studentRating === 4
                          ? 'Difícil'
                          : 'Muito difícil'}
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
                  Professor
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
                      Ver aula relacionada
                    </Link>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Informações
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Criada em:</span>
                    <span className="text-theme-primary">
                      {formatDate(assignment.createdAt)}
                    </span>
                  </div>

                  {assignment.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">Concluída em:</span>
                      <span className="text-theme-primary">
                        {formatDate(assignment.completedAt)}
                      </span>
                    </div>
                  )}

                  {/* 🆕 Info do vídeo */}
                  {currentVideoSubmission && (
                    <div className="flex justify-between">
                      <span className="text-theme-tertiary">
                        Vídeo enviado:
                      </span>
                      <span className="text-accent-green">
                        {formatDate(currentVideoSubmission.uploadedAt)}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-theme-tertiary">
                      Aula relacionada:
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
                  Conquistas
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
                        <span>{milestone.label}</span>
                      </div>
                    );
                  })}
                  {PROGRESS_MILESTONES.length > 4 && (
                    <button
                      onClick={() => setShowProgressModal(true)}
                      className="text-sm text-brand-primary hover:text-brand-secondary"
                    >
                      Ver todas ({PROGRESS_MILESTONES.length})
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
                    Concluir Tarefa
                  </h2>
                </div>

                <p className="text-theme-secondary mb-6">
                  Tem certeza que deseja marcar esta tarefa como concluída? Seu
                  professor receberá uma notificação.
                </p>

                <div className="flex items-center justify-between space-x-3">
                  <button
                    onClick={() => setShowCompleteModal(false)}
                    className="btn-classical-secondary"
                    disabled={loading.updateAssignment}
                  >
                    Cancelar
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
                        ? 'Concluindo...'
                        : 'Concluir Tarefa'}
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
                    Marcar Conquistas
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
                    Marque as conquistas que você já alcançou
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
                            {milestone.label}
                          </div>
                          <div className="text-xs text-theme-tertiary">
                            +{milestone.weight}% de progresso
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
                    Fechar
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
                    Visualizar Vídeo
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-theme-secondary">
                    <span>{currentVideoSubmission.originalName}</span>
                    <span>
                      {formatFileSize(currentVideoSubmission.fileSize)}
                    </span>
                    <span>
                      Enviado em{' '}
                      {formatDateTime(currentVideoSubmission.uploadedAt)}
                    </span>
                  </div>

                  <video
                    src={currentVideoSubmission.filePath}
                    controls
                    className="w-full rounded-lg"
                    style={{ maxHeight: '70vh' }}
                  >
                    Seu navegador não suporta a reprodução de vídeo.
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
