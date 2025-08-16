// app/teacher/lessons/[id]/pageClient.tsx
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiEdit3,
  FiSave,
  FiX,
  FiCheck,
  FiArrowLeft,
  FiMapPin,
  FiBookOpen,
  FiMessageSquare,
  FiTarget,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiPlus,
  FiTrash2,
  FiRepeat,
  FiInfo,
  FiAlertTriangle,
  FiMusic,
  FiAlertCircle,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { LessonDetailsData } from './pageServer';
import Link from 'next/link';
import Image from 'next/image';
import { useLessonDetails } from '@/app/hooks/lessonsSystem/useLessonDetails';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';
import WorkSelectionSection, {
  LessonWork,
} from '@/app/components/TeacherSystem/WorkSelectionSection';
import { translateNivel } from '@/app/utils';

interface TeacherLessonDetailsPageClientProps {
  lessonData: LessonDetailsData | null;
  errorMessage?: string;
}

type LessonType =
  | 'INDIVIDUAL'
  | 'GROUP'
  | 'THEORY'
  | 'PRACTICE'
  | 'MASTERCLASS';

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

// 🆕 TIPOS PARA OS MODAIS DE CONFIRMAÇÃO
type QuickActionType = 'present' | 'absent' | 'complete' | 'cancel';

// Função helper para formato correto de datetime
const formatDatetimeForInput = (date: Date | string): string => {
  const d = new Date(date);
  // Obter timezone local para manter o horário correto
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16); // Retorna formato YYYY-MM-DDTHH:mm
};

export default function TeacherLessonDetailsPageClient({
  lessonData,
  errorMessage,
}: TeacherLessonDetailsPageClientProps) {
  const router = useRouter();

  // Initialize hook
  const {
    lesson,
    loading,
    error,
    isEditing,
    setLesson,
    refreshLesson,
    updateBasicInfo,
    updateObjectives,
    updateTopicsAndTechniques,
    updateTeacherNotes,
    updatePublicNotes,
    updateLessonSummary,
    updateHomework,
    markAttendance,
    completeLesson,
    cancelLesson,
    deleteLesson,
    setEditMode,
  } = useLessonDetails(lessonData);

  // 🆕 NOVOS ESTADOS PARA EDIÇÃO COMPLETA
  const [editingBasicInfo, setEditingBasicInfo] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    type: 'INDIVIDUAL' as LessonType,
    location: '',
    status: 'SCHEDULED',
  });

  const [editingObjectives, setEditingObjectives] = useState<string[]>([]);
  const [editingTopics, setEditingTopics] = useState<string[]>([]);
  const [editingTechniques, setEditingTechniques] = useState<string[]>([]);
  const [editingNotes, setEditingNotes] = useState({
    teacher: '',
    public: '',
    summary: '',
    homework: '',
  });

  // 🆕 ESTADO PARA PEÇAS MUSICAIS - AGORA INICIALIZADO DIRETAMENTE
  const [editingWorks, setEditingWorks] = useState<LessonWork[]>([]);
  const [worksIds, setWorksIds] = useState<string[]>([]);
  const [workScoreIds, setWorkScoreIds] = useState<string[]>([]);

  // 🆕 ESTADOS PARA ADICIONAR NOVOS ITEMS
  const [newObjective, setNewObjective] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTechnique, setNewTechnique] = useState('');

  // 🆕 ESTADOS PARA MODAL DE DELETE/APAGAR
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteRecurringSeries, setDeleteRecurringSeries] = useState(false);
  const [deleteFutureOnly, setDeleteFutureOnly] = useState(false);

  // 🆕 ESTADOS PARA MODAL DE QUICK ACTIONS
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [quickActionType, setQuickActionType] =
    useState<QuickActionType>('present');
  const [quickActionReason, setQuickActionReason] = useState('');
  const [loadingQuickAction, setLoadingQuickAction] = useState(false);

  // Initialize lesson data
  useEffect(() => {
    if (lessonData) {
      setLesson(lessonData);
    }
  }, [lessonData, setLesson]);

  // 🆕 INICIALIZAR PEÇAS MUSICAIS DIRETAMENTE DOS DADOS DO SERVIDOR
  useEffect(() => {
    if (lesson && lesson.musicalPieces) {
      console.log(
        '🎵 [LESSON-DETAILS] Inicializando peças musicais do servidor:',
        lesson.musicalPieces
      );

      // Converter os dados do servidor para o formato LessonWork
      const musicalPieces = lesson.musicalPieces.map((piece: any) => ({
        workId: piece.workId,
        workTitle: piece.workTitle,
        composerName: piece.composerName,
        composerId: piece.composerId,
        scoreId: piece.scoreId || undefined,
        scoreTitle: piece.scoreTitle || undefined,
        scoreUrl: piece.scoreUrl || undefined,
        scoreType: piece.scoreType || undefined,
        scoreSource: piece.scoreSource || undefined,
      }));

      setEditingWorks(musicalPieces);

      // Separar os IDs
      const newWorksIds = musicalPieces.map((work: any) => work.workId);
      const newWorkScoreIds = musicalPieces
        .filter((work: any) => work.scoreId)
        .map((work: any) => work.scoreId);

      setWorksIds(newWorksIds);
      setWorkScoreIds(newWorkScoreIds);

      console.log('✅ [LESSON-DETAILS] Peças musicais inicializadas:', {
        totalPieces: musicalPieces.length,
        worksIds: newWorksIds,
        workScoreIds: newWorkScoreIds,
      });
    } else if (lesson) {
      // Se não tem musicalPieces, inicializar vazio
      console.log(
        '📝 [LESSON-DETAILS] Nenhuma peça musical encontrada, inicializando vazio'
      );
      setEditingWorks([]);
      setWorksIds([]);
      setWorkScoreIds([]);
    }
  }, [lesson]);

  // Initialize edit states when editing starts
  useEffect(() => {
    if (lesson && isEditing.basicInfo) {
      setEditingBasicInfo({
        title: lesson.title,
        description: lesson.description || '',
        scheduledAt: formatDatetimeForInput(lesson.scheduledAt),
        duration: lesson.duration,
        type: lesson.type as LessonType,
        location: lesson.location || '',
        status: lesson.status,
      });
    }
  }, [lesson, isEditing.basicInfo]);

  useEffect(() => {
    if (lesson && isEditing.objectives) {
      setEditingObjectives([...lesson.objectives]);
    }
  }, [lesson, isEditing.objectives]);

  useEffect(() => {
    if (lesson && isEditing.notes) {
      setEditingNotes({
        teacher: lesson.teacherNotes || '',
        public: lesson.publicNotes || '',
        summary: lesson.lessonSummary || '',
        homework: lesson.homework || '',
      });
    }
  }, [lesson, isEditing.notes]);

  // 🆕 INICIALIZAR EDIÇÃO DE TÓPICOS E TÉCNICAS
  useEffect(() => {
    if (lesson) {
      setEditingTopics([...lesson.topics]);
      setEditingTechniques([...lesson.techniques]);
    }
  }, [lesson]);

  // 🆕 HANDLER PARA MUDANÇAS NAS PEÇAS MUSICAIS (melhorado)
  const handleWorksChange = useCallback((works: LessonWork[]) => {
    console.log('🎵 [LESSON-DETAILS] Peças musicais atualizadas:', works);
    setEditingWorks(works);

    // Extrair IDs corretamente
    const newWorksIds = works.map((work) => work.workId);
    const newWorkScoreIds = works
      .filter((work) => work.scoreId)
      .map((work) => work.scoreId!);

    setWorksIds(newWorksIds);
    setWorkScoreIds(newWorkScoreIds);

    console.log('📊 [LESSON-DETAILS] IDs atualizados:', {
      worksIds: newWorksIds,
      workScoreIds: newWorkScoreIds,
      totalPecas: works.length,
      totalPartituras: newWorkScoreIds.length,
    });
  }, []);

  // 🆕 INDICADOR VISUAL DE MUDANÇAS NÃO SALVAS
  const hasUnsavedChanges = useMemo(() => {
    if (!lesson) return false;

    const originalWorksIds = lesson.worksIds || [];
    const originalWorkScoreIds = lesson.workScoreIds || [];

    return (
      JSON.stringify(originalWorksIds.sort()) !==
        JSON.stringify(worksIds.sort()) ||
      JSON.stringify(originalWorkScoreIds.sort()) !==
        JSON.stringify(workScoreIds.sort())
    );
  }, [lesson, worksIds, workScoreIds]);

  // 🆕 FUNÇÃO MELHORADA PARA SALVAR PEÇAS MUSICAIS COM FEEDBACK
  const handleSaveWorks = useCallback(async () => {
    if (!lesson?.id) {
      console.error('❌ [LESSON-DETAILS] ID da aula não encontrado');
      return false;
    }

    // Verificar se houve mudanças
    const originalWorksIds = lesson.worksIds || [];
    const originalWorkScoreIds = lesson.workScoreIds || [];

    if (!hasUnsavedChanges) {
      console.log(
        'ℹ️ [LESSON-DETAILS] Nenhuma alteração detectada nas peças musicais'
      );
      return true;
    }

    try {
      console.log('💾 [LESSON-DETAILS] Salvando peças musicais...', {
        lessonId: lesson.id,
        editingWorks: editingWorks.length,
        worksIds: worksIds.length,
        workScoreIds: workScoreIds.length,
        changes: {
          originalWorksIds: originalWorksIds.length,
          newWorksIds: worksIds.length,
          originalWorkScoreIds: originalWorkScoreIds.length,
          newWorkScoreIds: workScoreIds.length,
        },
      });

      const response = await fetch(`/api/lessons/${lesson.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worksIds: worksIds,
          workScoreIds: workScoreIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar peças musicais');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar peças musicais');
      }

      // Atualizar o estado local da lesson
      setLesson({
        ...lesson,
        worksIds: worksIds,
        workScoreIds: workScoreIds,
        musicalPieces: editingWorks,
      });

      console.log('✅ [LESSON-DETAILS] Peças musicais salvas com sucesso', {
        savedWorksIds: worksIds.length,
        savedWorkScoreIds: workScoreIds.length,
      });

      return true;
    } catch (error) {
      console.error(
        '❌ [LESSON-DETAILS] Erro ao salvar peças musicais:',
        error
      );
      return false;
    }
  }, [
    editingWorks,
    lesson,
    worksIds,
    workScoreIds,
    setLesson,
    hasUnsavedChanges,
  ]);

  // Form handlers
  const updateFormData = useCallback((field: string, value: any) => {
    setEditingBasicInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const addArrayField = useCallback((field: string) => {
    if (field === 'objectives') {
      setEditingObjectives((prev) => [...prev, '']);
    } else if (field === 'topics') {
      setEditingTopics((prev) => [...prev, '']);
    } else if (field === 'techniques') {
      setEditingTechniques((prev) => [...prev, '']);
    }
  }, []);

  const updateArrayField = useCallback(
    (field: string, index: number, value: string) => {
      if (field === 'objectives') {
        setEditingObjectives((prev) =>
          prev.map((item, i) => (i === index ? value : item))
        );
      } else if (field === 'topics') {
        setEditingTopics((prev) =>
          prev.map((item, i) => (i === index ? value : item))
        );
      } else if (field === 'techniques') {
        setEditingTechniques((prev) =>
          prev.map((item, i) => (i === index ? value : item))
        );
      }
    },
    []
  );

  const removeArrayField = useCallback((field: string, index: number) => {
    if (field === 'objectives') {
      setEditingObjectives((prev) => prev.filter((_, i) => i !== index));
    } else if (field === 'topics') {
      setEditingTopics((prev) => prev.filter((_, i) => i !== index));
    } else if (field === 'techniques') {
      setEditingTechniques((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  // Edit handlers
  const handleSaveBasicInfo = useCallback(async () => {
    // Converter a data para ISO string completo
    let scheduledAtISO = editingBasicInfo.scheduledAt;

    // Se não tem segundos, adicionar
    if (scheduledAtISO.length === 16) {
      scheduledAtISO += ':00';
    }

    // Criar objeto Date e converter para ISO string completo
    const scheduledDate = new Date(scheduledAtISO);

    // Verificar se a data é válida
    if (isNaN(scheduledDate.getTime())) {
      console.error('❌ Data inválida:', scheduledAtISO);
      return false;
    }

    const success = await updateBasicInfo({
      ...editingBasicInfo,
      scheduledAt: scheduledDate.toISOString(), // Enviar como ISO string completo
    });

    if (success) {
      setEditMode('basicInfo', false);
    }
  }, [editingBasicInfo, updateBasicInfo, setEditMode]);

  const handleSaveObjectives = useCallback(async () => {
    const cleanObjectives = editingObjectives.filter((obj) => obj.trim());
    const success = await updateObjectives(cleanObjectives);
    if (success) {
      setEditMode('objectives', false);
    }
  }, [editingObjectives, updateObjectives, setEditMode]);

  // 🆕 HANDLER PARA SALVAR TÓPICOS E TÉCNICAS
  const handleSaveTopicsAndTechniques = useCallback(async () => {
    const cleanTopics = editingTopics.filter((topic) => topic.trim());
    const cleanTechniques = editingTechniques.filter((tech) => tech.trim());

    const success = await updateTopicsAndTechniques({
      topics: cleanTopics,
      techniques: cleanTechniques,
    });

    if (success) {
      // Atualizar estado local
      if (lesson) {
        setLesson({
          ...lesson,
          topics: cleanTopics,
          techniques: cleanTechniques,
        });
      }
    }
  }, [
    editingTopics,
    editingTechniques,
    updateTopicsAndTechniques,
    lesson,
    setLesson,
  ]);

  const handleSaveNotes = useCallback(async () => {
    const promises = [];

    if (editingNotes.teacher !== (lesson?.teacherNotes || '')) {
      promises.push(updateTeacherNotes(editingNotes.teacher));
    }
    if (editingNotes.public !== (lesson?.publicNotes || '')) {
      promises.push(updatePublicNotes(editingNotes.public));
    }
    if (editingNotes.summary !== (lesson?.lessonSummary || '')) {
      promises.push(updateLessonSummary(editingNotes.summary));
    }
    if (editingNotes.homework !== (lesson?.homework || '')) {
      promises.push(updateHomework(editingNotes.homework));
    }

    const results = await Promise.all(promises);
    if (results.every(Boolean)) {
      setEditMode('notes', false);
    }
  }, [
    editingNotes,
    lesson,
    updateTeacherNotes,
    updatePublicNotes,
    updateLessonSummary,
    updateHomework,
    setEditMode,
  ]);

  // 🆕 HANDLERS PARA QUICK ACTIONS COM MODAL
  const handleQuickAction = useCallback((actionType: QuickActionType) => {
    setQuickActionType(actionType);
    setQuickActionReason('');
    setShowQuickActionModal(true);
  }, []);

  const executeQuickAction = useCallback(async () => {
    if (!lesson?.id) return;

    setLoadingQuickAction(true);

    try {
      let success = false;

      switch (quickActionType) {
        case 'present':
          success = await markAttendance({
            studentPresent: true,
            punctuality: 'on_time',
            actualStartTime: new Date(),
          });
          break;

        case 'absent':
          // 🆕 MARCAÇÃO DE FALTA ATUALIZADA - muda status para NO_SHOW
          success = await markAttendance({
            studentPresent: false,
          });

          // 🆕 TAMBÉM ATUALIZAR O STATUS DA LESSON PARA NO_SHOW
          if (success) {
            const statusSuccess = await updateBasicInfo({
              status: 'NO_SHOW',
            });

            if (statusSuccess) {
              console.log('✅ Status da aula atualizado para NO_SHOW');
            }
          }
          break;

        case 'complete':
          const summary =
            lesson?.lessonSummary || 'Aula concluída com sucesso.';
          success = await completeLesson(summary);
          break;

        case 'cancel':
          success = await cancelLesson(
            quickActionReason || 'Cancelada pelo professor'
          );
          break;
      }

      if (success) {
        setShowQuickActionModal(false);
        await refreshLesson();

        // 🆕 MENSAGEM ESPECÍFICA PARA FALTA
        if (quickActionType === 'absent') {
          console.log(
            '🔔 Aluno marcado como falta - notificação será enviada automaticamente'
          );
        }
      }
    } catch (error) {
      console.error('❌ Erro na ação rápida:', error);
    } finally {
      setLoadingQuickAction(false);
    }
  }, [
    quickActionType,
    quickActionReason,
    lesson,
    markAttendance,
    updateBasicInfo, // 🆕 Adicionado para atualizar status
    completeLesson,
    cancelLesson,
    refreshLesson,
  ]);

  // 🆕 HANDLER PARA DELETE/APAGAR REAL DA AULA
  const handleDeleteLesson = useCallback(async () => {
    if (!lesson?.id) return;

    try {
      const success = await deleteLesson({
        reason: deleteReason || undefined,
        deleteAll: deleteRecurringSeries,
        futureOnly: deleteFutureOnly,
      });

      if (success) {
        console.log('✅ Aula(s) apagada(s) com sucesso!');
        setShowDeleteModal(false);

        // 🔄 REDIRECIONAR PARA LISTA DE AULAS
        router.push('/teacher/lessons');
      }
    } catch (error) {
      console.error('❌ Erro ao apagar aula:', error);
      // O erro já é tratado pelo hook
    }
  }, [
    lesson?.id,
    deleteReason,
    deleteRecurringSeries,
    deleteFutureOnly,
    deleteLesson,
    router,
  ]);

  // Format functions
  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  // Status functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-accent-green/10 border-accent-green/30 text-accent-green';
      case 'CANCELLED':
        return 'bg-accent-red/10 border-accent-red/30 text-accent-red';
      case 'NO_SHOW':
        return 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow';
      case 'SCHEDULED':
        return 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue';
      default:
        return 'bg-theme-secondary/10 border-theme-secondary/30 text-theme-secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Concluída';
      case 'CANCELLED':
        return 'Cancelada';
      case 'NO_SHOW':
        return 'Faltou';
      case 'SCHEDULED':
        return 'Agendada';
      default:
        return status;
    }
  };

  // 🆕 VERIFICAR SE PODE EDITAR (AULAS CANCELADAS NÃO PODEM SER EDITADAS)
  const canEditLesson =
    lesson?.status !== 'CANCELLED' && lesson?.permissions.canEdit;

  // 🆕 COMPONENTE DO BOTÃO DE SALVAR ATUALIZADO
  const SaveWorksButton = () => (
    <button
      onClick={handleSaveWorks}
      disabled={loading.update || !hasUnsavedChanges}
      className={`btn-classical-secondary flex items-center space-x-1 text-sm transition-all ${
        hasUnsavedChanges
          ? 'bg-accent-yellow/10 border-accent-yellow/30 text-accent-yellow hover:bg-accent-yellow/20'
          : ''
      }`}
    >
      {loading.update ? (
        <FiRefreshCw className="w-3 h-3 animate-spin" />
      ) : hasUnsavedChanges ? (
        <FiAlertCircle className="w-3 h-3" />
      ) : (
        <FiCheck className="w-3 h-3" />
      )}
      <span>
        {loading.update
          ? 'Salvando...'
          : hasUnsavedChanges
          ? 'Salvar Alterações'
          : 'Peças Salvas'}
      </span>
    </button>
  );

  // Render error state
  if ((error || errorMessage) && !lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiBookOpen className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Aula
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshLesson}
                disabled={loading.update}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading.update ? 'animate-spin' : ''}`}
                />
                <span>
                  {loading.update ? 'Carregando...' : 'Tentar Novamente'}
                </span>
              </button>
              <Link
                href="/teacher/lessons"
                className="btn-classical-secondary w-full text-center block"
              >
                Voltar às Aulas
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">
              Carregando detalhes da aula...
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const canDelete = lesson.permissions.canCancel; // Pode sempre apagar se tiver permissão

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link
                href="/teacher/lessons"
                className="w-10 h-10 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
              >
                <FiArrowLeft className="w-5 h-5 text-theme-tertiary" />
              </Link>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-theme-primary classical-title">
                  Detalhes da Aula
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  Gerencie todos os aspectos da aula com seu aluno
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  lesson.status
                )}`}
              >
                {getStatusLabel(lesson.status)}
              </span>

              {/* 🆕 BOTÃO DE APAGAR */}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10 flex items-center space-x-2"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>Apagar</span>
                </button>
              )}

              <button
                onClick={refreshLesson}
                disabled={loading.update}
                className="btn-classical-secondary flex items-center space-x-2"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading.update ? 'animate-spin' : ''}`}
                />
                <span>Atualizar</span>
              </button>
            </div>
          </div>
        </AnimatedItem>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info - MELHORADO COM VERIFICAÇÃO DE CANCELAMENTO */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>Informações Básicas</span>
                  </h2>
                  {canEditLesson && !isEditing.basicInfo ? (
                    <button
                      onClick={() => setEditMode('basicInfo', true)}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : canEditLesson && isEditing.basicInfo ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveBasicInfo}
                        disabled={loading.update}
                        className="btn-classical-primary flex items-center space-x-1 text-sm"
                      >
                        <FiSave className="w-3 h-3" />
                        <span>Salvar</span>
                      </button>
                      <button
                        onClick={() => setEditMode('basicInfo', false)}
                        className="btn-classical-secondary flex items-center space-x-1 text-sm"
                      >
                        <FiX className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  ) : null}
                </div>

                {isEditing.basicInfo ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Título *
                        </label>
                        <Input
                          type="text"
                          value={editingBasicInfo.title}
                          onChange={(e) =>
                            updateFormData('title', e.target.value)
                          }
                          className="input-classical-2 w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Status
                        </label>
                        <Select
                          options={statusOptions}
                          value={editingBasicInfo.status}
                          onChange={(e) =>
                            updateFormData('status', e.target.value)
                          }
                          className="input-classical-2 w-full"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Tipo de Aula
                        </label>
                        <Select
                          options={lessonTypeOptions}
                          value={editingBasicInfo.type}
                          onChange={(e) =>
                            updateFormData('type', e.target.value)
                          }
                          className="input-classical-2 w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Local
                        </label>
                        <Input
                          type="text"
                          value={editingBasicInfo.location}
                          onChange={(e) =>
                            updateFormData('location', e.target.value)
                          }
                          className="input-classical-2 w-full"
                          placeholder="Ex: Online, Estúdio A"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Data e Hora *
                        </label>
                        <Input
                          type="datetime-local"
                          value={editingBasicInfo.scheduledAt}
                          onChange={(e) =>
                            updateFormData('scheduledAt', e.target.value)
                          }
                          className="input-classical-2 w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Duração (min)
                        </label>
                        <Input
                          type="number"
                          value={editingBasicInfo.duration}
                          onChange={(e) =>
                            updateFormData(
                              'duration',
                              parseInt(e.target.value) || 60
                            )
                          }
                          min="30"
                          max="240"
                          className="input-classical-2 w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={editingBasicInfo.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        className="input-classical-2 w-full h-20"
                        placeholder="Descrição da aula..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-theme-primary">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-theme-secondary">
                        {lesson.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2 text-theme-secondary">
                        <FiCalendar className="w-4 h-4" />
                        <span>{formatDateTime(lesson.scheduledAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-theme-secondary">
                        <FiClock className="w-4 h-4" />
                        <span>{formatDuration(lesson.duration)}</span>
                      </div>
                    </div>

                    {lesson.location && (
                      <div className="flex items-center space-x-2 text-theme-secondary">
                        <FiMapPin className="w-4 h-4" />
                        <span>{lesson.location}</span>
                      </div>
                    )}

                    {/* Recurrence Info */}
                    {lesson.isRecurring && (
                      <div className="bg-theme-elevated rounded-lg p-4">
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

                    {/* Aviso se aula foi cancelada */}
                    {lesson.status === 'CANCELLED' && (
                      <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-accent-red mb-2">
                          <FiAlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Aula Cancelada</span>
                        </div>
                        <p className="text-sm text-theme-secondary">
                          Esta aula foi cancelada e não pode mais ser editada.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* 🆕 SEÇÃO DE PEÇAS MUSICAIS ATUALIZADA */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary classical-title flex items-center space-x-2">
                    <FiMusic className="w-5 h-5" />
                    <span>Peças Musicais</span>
                  </h2>
                  {canEditLesson && worksIds.length > 0 && <SaveWorksButton />}
                </div>

                {canEditLesson ? (
                  // Modo de edição
                  <WorkSelectionSection
                    selectedWorks={editingWorks}
                    onWorksChange={handleWorksChange}
                    maxWorks={4}
                    disabled={loading.update}
                  />
                ) : editingWorks.length > 0 ? (
                  // Modo de visualização (quando não pode editar)
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-theme-primary">
                      Peças vinculadas à aula ({editingWorks.length})
                    </h4>
                    <div className="space-y-2">
                      {editingWorks.map((work, index) => (
                        <div
                          key={work.workId}
                          className="bg-theme-elevated border border-theme-secondary rounded-lg p-4"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FiMusic className="w-4 h-4 text-accent-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h5 className="font-medium text-theme-primary">
                                  {work.workTitle}
                                </h5>
                                <span className="text-xs bg-theme-secondary/20 text-theme-secondary px-2 py-0.5 rounded">
                                  #{index + 1}
                                </span>
                              </div>
                              <p className="text-sm text-theme-tertiary">
                                {work.composerName}
                              </p>
                              {work.scoreId && (
                                <div className="mt-2 flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 text-xs text-accent-green">
                                    <FiCheck className="w-3 h-3" />
                                    <span>Partitura: {work.scoreTitle}</span>
                                  </div>
                                  <span className="text-xs text-theme-tertiary">
                                    ({work.scoreSource})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Estado vazio
                  <div className="text-center py-8">
                    <FiMusic className="w-12 h-12 text-theme-tertiary mx-auto mb-4 opacity-50" />
                    <p className="text-theme-secondary">
                      Nenhuma peça musical vinculada a esta aula
                    </p>
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Objectives - MANTIDO COM VERIFICAÇÃO DE CANCELAMENTO */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiTarget className="w-5 h-5" />
                    <span>Objetivos da Aula</span>
                  </h2>
                  {canEditLesson && !isEditing.objectives ? (
                    <button
                      onClick={() => setEditMode('objectives', true)}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : canEditLesson && isEditing.objectives ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveObjectives}
                        disabled={loading.update}
                        className="btn-classical-primary flex items-center space-x-1 text-sm"
                      >
                        <FiSave className="w-3 h-3" />
                        <span>Salvar</span>
                      </button>
                      <button
                        onClick={() => setEditMode('objectives', false)}
                        className="btn-classical-secondary flex items-center space-x-1 text-sm"
                      >
                        <FiX className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  ) : null}
                </div>

                {isEditing.objectives ? (
                  <div className="space-y-3">
                    {editingObjectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          type="text"
                          value={objective}
                          onChange={(e) => {
                            updateArrayField(
                              'objectives',
                              index,
                              e.target.value
                            );
                          }}
                          className="input-classical-2 flex-1"
                        />
                        <button
                          onClick={() => removeArrayField('objectives', index)}
                          className="w-8 h-8 rounded-lg bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center"
                        >
                          <FiTrash2 className="w-4 h-4 text-accent-red" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="Novo objetivo..."
                        className="input-classical-2 flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newObjective.trim()) {
                            setEditingObjectives([
                              ...editingObjectives,
                              newObjective.trim(),
                            ]);
                            setNewObjective('');
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          if (newObjective.trim()) {
                            setEditingObjectives([
                              ...editingObjectives,
                              newObjective.trim(),
                            ]);
                            setNewObjective('');
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors flex items-center justify-center"
                      >
                        <FiPlus className="w-4 h-4 text-brand-primary" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {lesson.objectives.length > 0 ? (
                      lesson.objectives.map((objective, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
                          <span className="text-theme-secondary">
                            {objective}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-theme-tertiary italic">
                        Nenhum objetivo definido ainda.
                      </p>
                    )}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Topics & Techniques - MANTIDO COM VERIFICAÇÃO DE CANCELAMENTO */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiBookOpen className="w-5 h-5" />
                    <span>Tópicos e Técnicas</span>
                  </h2>
                  {canEditLesson && (
                    <button
                      onClick={handleSaveTopicsAndTechniques}
                      disabled={loading.update}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiSave className="w-3 h-3" />
                      <span>Salvar Alterações</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-theme-primary">
                        Tópicos Abordados
                      </h3>
                      {canEditLesson && (
                        <button
                          onClick={() => addArrayField('topics')}
                          className="text-brand-primary text-sm flex items-center space-x-1"
                        >
                          <FiPlus className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      )}
                    </div>

                    {canEditLesson ? (
                      <div className="space-y-2">
                        {editingTopics.map((topic, index) => (
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
                              className="input-classical-2 flex-1"
                              placeholder="Ex: Escala de Dó maior"
                            />
                            {editingTopics.length > 1 && (
                              <button
                                onClick={() =>
                                  removeArrayField('topics', index)
                                }
                                className="w-6 h-6 rounded bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center"
                              >
                                <FiX className="w-3 h-3 text-accent-red" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Novo tópico..."
                            className="input-classical-2 flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newTopic.trim()) {
                                setEditingTopics([
                                  ...editingTopics,
                                  newTopic.trim(),
                                ]);
                                setNewTopic('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newTopic.trim()) {
                                setEditingTopics([
                                  ...editingTopics,
                                  newTopic.trim(),
                                ]);
                                setNewTopic('');
                              }
                            }}
                            className="w-6 h-6 rounded bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors flex items-center justify-center"
                          >
                            <FiPlus className="w-3 h-3 text-brand-primary" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.length > 0 ? (
                          lesson.topics.map((topic, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-accent-blue/10 border border-accent-blue/30 text-accent-blue rounded-full text-sm"
                            >
                              {topic}
                            </span>
                          ))
                        ) : (
                          <span className="text-theme-tertiary italic text-sm">
                            Nenhum tópico registrado
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-theme-primary">
                        Técnicas Trabalhadas
                      </h3>
                      {canEditLesson && (
                        <button
                          onClick={() => addArrayField('techniques')}
                          className="text-brand-primary text-sm flex items-center space-x-1"
                        >
                          <FiPlus className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      )}
                    </div>

                    {canEditLesson ? (
                      <div className="space-y-2">
                        {editingTechniques.map((technique, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <Input
                              type="text"
                              value={technique}
                              onChange={(e) =>
                                updateArrayField(
                                  'techniques',
                                  index,
                                  e.target.value
                                )
                              }
                              className="input-classical-2 flex-1"
                              placeholder="Ex: Staccato"
                            />
                            {editingTechniques.length > 1 && (
                              <button
                                onClick={() =>
                                  removeArrayField('techniques', index)
                                }
                                className="w-6 h-6 rounded bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center"
                              >
                                <FiX className="w-3 h-3 text-accent-red" />
                              </button>
                            )}
                          </div>
                        ))}

                        <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            value={newTechnique}
                            onChange={(e) => setNewTechnique(e.target.value)}
                            placeholder="Nova técnica..."
                            className="input-classical-2 flex-1"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && newTechnique.trim()) {
                                setEditingTechniques([
                                  ...editingTechniques,
                                  newTechnique.trim(),
                                ]);
                                setNewTechnique('');
                              }
                            }}
                          />
                          <button
                            onClick={() => {
                              if (newTechnique.trim()) {
                                setEditingTechniques([
                                  ...editingTechniques,
                                  newTechnique.trim(),
                                ]);
                                setNewTechnique('');
                              }
                            }}
                            className="w-6 h-6 rounded bg-brand-primary/10 hover:bg-brand-primary/20 transition-colors flex items-center justify-center"
                          >
                            <FiPlus className="w-3 h-3 text-brand-primary" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {lesson.techniques.length > 0 ? (
                          lesson.techniques.map((technique, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-accent-purple/10 border border-accent-purple/30 text-accent-purple rounded-full text-sm"
                            >
                              {technique}
                            </span>
                          ))
                        ) : (
                          <span className="text-theme-tertiary italic text-sm">
                            Nenhuma técnica registrada
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Notes Section - MANTIDO COM VERIFICAÇÃO DE CANCELAMENTO */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiMessageSquare className="w-5 h-5" />
                    <span>Notas e Observações</span>
                  </h2>
                  {canEditLesson && !isEditing.notes ? (
                    <button
                      onClick={() => setEditMode('notes', true)}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : canEditLesson && isEditing.notes ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSaveNotes}
                        disabled={loading.notes}
                        className="btn-classical-primary flex items-center space-x-1 text-sm"
                      >
                        <FiSave className="w-3 h-3" />
                        <span>Salvar</span>
                      </button>
                      <button
                        onClick={() => setEditMode('notes', false)}
                        className="btn-classical-secondary flex items-center space-x-1 text-sm"
                      >
                        <FiX className="w-3 h-3" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  ) : null}
                </div>

                {isEditing.notes ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Notas Privadas (só você vê)
                      </label>
                      <textarea
                        value={editingNotes.teacher}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            teacher: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full h-24"
                        placeholder="Suas anotações pessoais sobre a aula..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Notas Públicas (aluno pode ver)
                      </label>
                      <textarea
                        value={editingNotes.public}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            public: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full h-24"
                        placeholder="Anotações que o aluno pode visualizar..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Resumo da Aula
                      </label>
                      <textarea
                        value={editingNotes.summary}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full h-20"
                        placeholder="Resumo do que foi trabalhado na aula..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Lição de Casa
                      </label>
                      <textarea
                        value={editingNotes.homework}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            homework: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full h-20"
                        placeholder="Tarefas e exercícios para praticar..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lesson.teacherNotes && (
                      <div>
                        <h3 className="font-medium text-theme-primary mb-2">
                          Suas Notas Privadas
                        </h3>
                        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.teacherNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {lesson.publicNotes && (
                      <div>
                        <h3 className="font-medium text-theme-primary mb-2">
                          Notas para o Aluno
                        </h3>
                        <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.publicNotes}
                          </p>
                        </div>
                      </div>
                    )}

                    {lesson.lessonSummary && (
                      <div>
                        <h3 className="font-medium text-theme-primary mb-2">
                          Resumo da Aula
                        </h3>
                        <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.lessonSummary}
                          </p>
                        </div>
                      </div>
                    )}

                    {lesson.homework && (
                      <div>
                        <h3 className="font-medium text-theme-primary mb-2">
                          Lição de Casa
                        </h3>
                        <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.homework}
                          </p>
                        </div>
                      </div>
                    )}

                    {!lesson.teacherNotes &&
                      !lesson.publicNotes &&
                      !lesson.lessonSummary &&
                      !lesson.homework && (
                        <p className="text-theme-tertiary italic">
                          Nenhuma nota registrada ainda.
                        </p>
                      )}
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - Student & Actions */}
          <div className="space-y-6">
            {/* Student Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-lg font-bold text-theme-primary mb-4">
                  Aluno
                </h2>

                <div className="flex items-center space-x-4 mb-6">
                  {lesson.student.image ? (
                    <div className="w-16 h-16 relative rounded-full overflow-hidden">
                      <Image
                        src={lesson.student.image}
                        alt={lesson.student.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-theme-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {lesson.student.name}
                    </h3>
                    <p className="text-theme-secondary">
                      Nível: {translateNivel(lesson.student.level)}
                    </p>
                    <p className="text-sm text-theme-tertiary">
                      {lesson.student.email}
                    </p>
                  </div>
                </div>

                {/* Relationship Stats */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Total de Aulas:</span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Concluídas:</span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.completedLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">Duração:</span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.relationshipDuration}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* 🆕 RESUMO DAS PEÇAS SELECIONADAS ATUALIZADO */}
            {editingWorks.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiMusic className="w-5 h-5" />
                    <span>Peças Vinculadas</span>
                  </h3>

                  <div className="space-y-3">
                    {editingWorks.map((work, index) => (
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
                              ✓ Com partitura
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
                          <span>Total de peças:</span>
                          <span className="font-medium">{worksIds.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Com partituras:</span>
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

            {/* 🆕 Quick Actions COM MODAL DE CONFIRMAÇÃO */}
            {lesson.status === 'SCHEDULED' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    Ações Rápidas
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={() => handleQuickAction('present')}
                      disabled={loading.attendance}
                      className="btn-classical-primary w-full flex items-center justify-center space-x-2"
                    >
                      <FiUserCheck className="w-4 h-4" />
                      <span>Marcar Presença</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction('absent')}
                      disabled={loading.attendance}
                      className="w-full px-4 py-2 bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow rounded-lg hover:bg-accent-yellow/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiUserX className="w-4 h-4" />
                      <span>Marcar Falta</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction('complete')}
                      disabled={loading.update}
                      className="w-full px-4 py-2 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg hover:bg-accent-green/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Concluir Aula</span>
                    </button>

                    <button
                      onClick={() => handleQuickAction('cancel')}
                      disabled={loading.update}
                      className="w-full px-4 py-2 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-lg hover:bg-accent-red/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Cancelar Aula</span>
                    </button>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Attendance Status */}
            {lesson.studentPresent !== undefined && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    Status de Presença
                  </h2>

                  <div
                    className={`p-4 rounded-lg ${
                      lesson.studentPresent
                        ? 'bg-accent-green/10 border border-accent-green/30'
                        : 'bg-accent-red/10 border border-accent-red/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {lesson.studentPresent ? (
                        <FiCheck className="w-5 h-5 text-accent-green" />
                      ) : (
                        <FiX className="w-5 h-5 text-accent-red" />
                      )}
                      <span
                        className={`font-medium ${
                          lesson.studentPresent
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {lesson.studentPresent ? 'Presente' : 'Faltou'}
                      </span>
                    </div>

                    {lesson.punctuality && (
                      <p className="text-sm text-theme-secondary">
                        Pontualidade:{' '}
                        {lesson.punctuality === 'on_time'
                          ? 'No horário'
                          : lesson.punctuality === 'late'
                          ? 'Atrasou'
                          : 'Adiantou'}
                      </p>
                    )}

                    {lesson.engagement && (
                      <p className="text-sm text-theme-secondary">
                        Engajamento: {lesson.engagement}/5
                      </p>
                    )}

                    {lesson.preparation && (
                      <p className="text-sm text-theme-secondary">
                        Preparação: {lesson.preparation}/5
                      </p>
                    )}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Student Feedback */}
            {lesson.studentFeedback && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    Feedback do Aluno
                  </h2>
                  <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
                    <p className="text-theme-secondary whitespace-pre-wrap">
                      {lesson.studentFeedback}
                    </p>
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
                    <FiMusic className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Vincule peças musicais para organizar o repertório</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiSave className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>Salve as alterações das peças antes de sair da página</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <FiCheck className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>As partituras vinculadas aparecem nos relatórios</p>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      {/* 🆕 MODAL DE CONFIRMAÇÃO PARA QUICK ACTIONS */}
      {showQuickActionModal && (
        <Modal
          isOpen
          onClose={() => setShowQuickActionModal(false)}
          maxWidth="md"
        >
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  quickActionType === 'present'
                    ? 'bg-accent-green/10'
                    : quickActionType === 'absent'
                    ? 'bg-accent-yellow/10'
                    : quickActionType === 'complete'
                    ? 'bg-accent-green/10'
                    : 'bg-accent-red/10'
                }`}
              >
                {quickActionType === 'present' && (
                  <FiUserCheck className="w-6 h-6 text-accent-green" />
                )}
                {quickActionType === 'absent' && (
                  <FiUserX className="w-6 h-6 text-accent-yellow" />
                )}
                {quickActionType === 'complete' && (
                  <FiCheck className="w-6 h-6 text-accent-green" />
                )}
                {quickActionType === 'cancel' && (
                  <FiX className="w-6 h-6 text-accent-red" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Confirmar Ação
                </h2>
                <p className="text-theme-secondary">
                  {quickActionType === 'present' && 'Marcar presença do aluno'}
                  {quickActionType === 'absent' && 'Marcar falta do aluno'}
                  {quickActionType === 'complete' && 'Concluir esta aula'}
                  {quickActionType === 'cancel' && 'Cancelar esta aula'}
                </p>
              </div>
            </div>

            {quickActionType === 'cancel' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={quickActionReason}
                  onChange={(e) => setQuickActionReason(e.target.value)}
                  rows={3}
                  className="input-classical-2 w-full"
                  placeholder="Ex: Indisponibilidade do professor..."
                />
              </div>
            )}

            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent-blue mb-1">
                    Confirmação
                  </p>
                  <p className="text-theme-secondary">
                    {quickActionType === 'present' &&
                      'O aluno será marcado como presente e a aula será iniciada automaticamente.'}
                    {quickActionType === 'absent' &&
                      'O aluno será marcado como ausente e a aula ficará como "Falta do aluno".'}
                    {quickActionType === 'complete' &&
                      'A aula será marcada como concluída e o status será atualizado.'}
                    {quickActionType === 'cancel' &&
                      'A aula será cancelada e o aluno será notificado.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowQuickActionModal(false)}
                className="btn-classical-secondary"
                disabled={loadingQuickAction}
              >
                Cancelar
              </button>
              <button
                onClick={executeQuickAction}
                disabled={loadingQuickAction}
                className={`btn-classical-primary flex items-center space-x-2 ${
                  quickActionType === 'cancel'
                    ? 'bg-accent-red border-accent-red hover:bg-accent-red/90'
                    : ''
                }`}
              >
                {loadingQuickAction ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {quickActionType === 'present' && (
                      <FiUserCheck className="w-4 h-4" />
                    )}
                    {quickActionType === 'absent' && (
                      <FiUserX className="w-4 h-4" />
                    )}
                    {quickActionType === 'complete' && (
                      <FiCheck className="w-4 h-4" />
                    )}
                    {quickActionType === 'cancel' && (
                      <FiX className="w-4 h-4" />
                    )}
                  </>
                )}
                <span>
                  {loadingQuickAction ? 'Processando...' : 'Confirmar'}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 🆕 MODAL DE APAGAR/DELETE REAL */}
      {showDeleteModal && (
        <Modal isOpen onClose={() => setShowDeleteModal(false)} maxWidth="2xl">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center">
                <FiTrash2 className="w-6 h-6 text-accent-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  Apagar Aula
                </h2>
                <p className="text-theme-secondary">
                  Esta ação irá <strong>apagar permanentemente</strong> a aula
                  do banco de dados
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Motivo (opcional)
                </label>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                  className="input-classical-2 w-full"
                  placeholder="Ex: Aula criada por engano..."
                />
              </div>

              {lesson.isRecurring && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="deleteAll"
                      checked={deleteRecurringSeries}
                      onChange={(e) =>
                        setDeleteRecurringSeries(e.target.checked)
                      }
                      className="w-4 h-4 text-brand-primary bg-theme-elevated border-theme-secondary rounded focus:ring-brand-primary"
                    />
                    <label htmlFor="deleteAll" className="text-theme-primary">
                      Apagar toda a série de aulas recorrentes
                    </label>
                  </div>

                  {deleteRecurringSeries && (
                    <div className="flex items-center space-x-3 ml-7">
                      <input
                        type="checkbox"
                        id="futureOnly"
                        checked={deleteFutureOnly}
                        onChange={(e) => setDeleteFutureOnly(e.target.checked)}
                        className="w-4 h-4 text-brand-primary bg-theme-elevated border-theme-secondary rounded focus:ring-brand-primary"
                      />
                      <label
                        htmlFor="futureOnly"
                        className="text-theme-secondary text-sm"
                      >
                        Apagar apenas as aulas futuras (manter histórico)
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <FiAlertTriangle className="w-5 h-5 text-accent-red mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-accent-red mb-1">
                    ⚠️ Ação Irreversível
                  </p>
                  <p className="text-theme-secondary">
                    {deleteRecurringSeries
                      ? `Esta ação irá APAGAR PERMANENTEMENTE ${
                          deleteFutureOnly
                            ? 'todas as aulas futuras'
                            : 'toda a série'
                        } da recorrência do banco de dados.`
                      : 'Esta ação irá APAGAR PERMANENTEMENTE esta aula do banco de dados.'}{' '}
                    Não será possível recuperar os dados após a exclusão.
                    {lesson.isRecurring &&
                      !deleteRecurringSeries &&
                      ' A próxima aula da série se tornará a nova aula pai.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-classical-secondary"
                disabled={loading.delete}
              >
                Manter Aula
              </button>
              <button
                onClick={handleDeleteLesson}
                disabled={loading.delete}
                className="btn-classical-primary bg-accent-red border-accent-red hover:bg-accent-red/90 flex items-center space-x-2"
              >
                {loading.delete ? (
                  <FiRefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <FiTrash2 className="w-4 h-4" />
                )}
                <span>
                  {loading.delete ? 'Apagando...' : 'Apagar Permanentemente'}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageContainer>
  );
}
