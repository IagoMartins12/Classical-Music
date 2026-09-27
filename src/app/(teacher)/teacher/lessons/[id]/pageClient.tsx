// app/teacher/lessons/[id]/pageClient.tsx
'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiChatCenteredText,
  PiCheck,
  PiClock,
  PiFloppyDisk,
  PiInfo,
  PiMapPin,
  PiMusicNotes,
  PiPencilLine,
  PiPlus,
  PiRepeat,
  PiTarget,
  PiTrash,
  PiUser,
  PiUserCheck,
  PiUserMinus,
  PiWarning,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../components/animation/AnimatedComponents';
import { LessonDetailsData } from './pageServer';
import Link from 'next/link';
import Image from '@/app/components/SmartImage';
import { useLessonDetails } from '@/app/hooks/lessonsSystem/useLessonDetails';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Modal from '@/app/components/Modal';
import WorkSelectionSection, {
  LessonWork,
} from '@/app/components/TeacherSystem/WorkSelectionSection';
import { translateNivel } from '@/app/utils';
import Checkbox from '@/app/components/Common/Checkbox';
import { useTranslation } from '@/app/context/TranslationContext';
import { updateLessonRequest } from '@/app/requests/portal/lesson-actions';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

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
  const { t } = useTranslation({ sections: ['teacher/lessonsId'] });

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

  // Estados para edição completa
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

  // Estado para peças musicais
  const [editingWorks, setEditingWorks] = useState<LessonWork[]>([]);
  const [worksIds, setWorksIds] = useState<string[]>([]);
  const [workScoreIds, setWorkScoreIds] = useState<string[]>([]);

  // Estados para adicionar novos items
  const [newObjective, setNewObjective] = useState('');
  // const [newTopic, setNewTopic] = useState('');
  // const [newTechnique, setNewTechnique] = useState('');

  // Estados para modal de delete/apagar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteRecurringSeries, setDeleteRecurringSeries] = useState(false);
  const [deleteFutureOnly, setDeleteFutureOnly] = useState(false);

  // Estados para modal de quick actions
  const [showQuickActionModal, setShowQuickActionModal] = useState(false);
  const [quickActionType, setQuickActionType] =
    useState<QuickActionType>('present');
  const [quickActionReason, setQuickActionReason] = useState('');
  const [loadingQuickAction, setLoadingQuickAction] = useState(false);

  // Traduzir opções de select
  const lessonTypeOptions = [
    { value: 'INDIVIDUAL', label: t('lesson_type_individual') },
    { value: 'GROUP', label: t('lesson_type_group') },
    { value: 'THEORY', label: t('lesson_type_theory') },
    { value: 'PRACTICE', label: t('lesson_type_practice') },
    { value: 'MASTERCLASS', label: t('lesson_type_masterclass') },
  ];

  const statusOptions = [
    { value: 'SCHEDULED', label: t('status_scheduled') },
    { value: 'COMPLETED', label: t('status_completed') },
    { value: 'CANCELLED', label: t('status_cancelled') },
    { value: 'NO_SHOW', label: t('status_no_show') },
    { value: 'RESCHEDULED', label: t('status_rescheduled') },
  ];

  // Initialize lesson data
  useEffect(() => {
    if (lessonData) {
      setLesson(lessonData);
    }
  }, [lessonData, setLesson]);

  // Inicializar peças musicais diretamente dos dados do servidor
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

  // Inicializar edição de tópicos e técnicas
  useEffect(() => {
    if (lesson) {
      setEditingTopics([...lesson.topics]);
      setEditingTechniques([...lesson.techniques]);
    }
  }, [lesson]);

  // Handler para mudanças nas peças musicais
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

  // Indicador visual de mudanças não salvas
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

  // Função melhorada para salvar peças musicais
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

      await updateLessonRequest(lesson.id, { worksIds, workScoreIds });

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
      scheduledAt: scheduledDate.toISOString(),
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

  // Handler para salvar tópicos e técnicas
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

  // Handlers para quick actions com modal
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
          success = await markAttendance({
            studentPresent: false,
          });

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
            lesson?.lessonSummary || t('lesson_completed_successfully');
          success = await completeLesson(summary);
          break;

        case 'cancel':
          success = await cancelLesson(
            quickActionReason || t('cancelled_by_teacher')
          );
          break;
      }

      if (success) {
        setShowQuickActionModal(false);
        await refreshLesson();

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
    updateBasicInfo,
    completeLesson,
    cancelLesson,
    refreshLesson,
    t,
  ]);

  // Handler para delete/apagar real da aula
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

        router.push('/teacher/lessons');
      }
    } catch (error) {
      console.error('❌ Erro ao apagar aula:', error);
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
        return t('status_completed');
      case 'CANCELLED':
        return t('status_cancelled');
      case 'NO_SHOW':
        return t('status_no_show');
      case 'SCHEDULED':
        return t('status_scheduled');
      default:
        return status;
    }
  };

  // Verificar se pode editar
  const canEditLesson =
    lesson?.status !== 'CANCELLED' && lesson?.permissions.canEdit;

  // Componente do botão de salvar atualizado
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
        <PiArrowsClockwise className="w-3 h-3 animate-spin" />
      ) : hasUnsavedChanges ? (
        <PiWarningCircle className="w-3 h-3" />
      ) : (
        <PiCheck className="w-3 h-3" />
      )}
      <span>
        {loading.update
          ? t('save_pieces_saving')
          : hasUnsavedChanges
            ? t('save_pieces_changes')
            : t('save_pieces_saved')}
      </span>
    </button>
  );

  // Render error state
  if ((error || errorMessage) && !lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiBookOpen className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading_title')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <Stack gap={3}>
              <Inline
                as="button"
                gap={2}
                onClick={refreshLesson}
                disabled={loading.update}
                className="btn-classical-primary w-full justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${loading.update ? 'animate-spin' : ''}`}
                />
                <span>{loading.update ? t('loading') : t('try_again')}</span>
              </Inline>
              <Link
                href="/teacher/lessons"
                className="btn-classical-secondary w-full text-center block"
              >
                {t('back_to_lessons')}
              </Link>
            </Stack>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!lesson) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">
              {t('loading_lesson_details')}
            </p>
          </Card>
        </div>
      </PageContainer>
    );
  }

  const canDelete = lesson.permissions.canCancel;

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer
        delay={0.1}
        className="mb-8 sm:mb-0"
        staggerSpeed="normal"
      >
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-8">
            <Inline gap={4} className="w-full justify-between">
              <Inline gap={4}>
                <Link
                  href="/teacher/lessons"
                  className="w-10 h-10 rounded-lg bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                >
                  <PiArrowLeft className="w-5 h-5 text-theme-tertiary" />
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-theme-primary classical-title">
                    {t('page_title')}
                  </h1>
                  <p className="text-theme-secondary classical-subtitle">
                    {t('page_subtitle')}
                  </p>
                </div>
              </Inline>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  lesson.status
                )}`}
              >
                {getStatusLabel(lesson.status)}
              </span>
            </Inline>

            <Inline gap={3}>
              {canDelete && (
                <Inline
                  as="button"
                  gap={2}
                  onClick={() => setShowDeleteModal(true)}
                  className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10"
                >
                  <PiTrash className="w-4 h-4" />
                  <span>{t('btn_delete')}</span>
                </Inline>
              )}

              <Inline
                as="button"
                gap={2}
                onClick={refreshLesson}
                disabled={loading.update}
                className="btn-classical-secondary"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${loading.update ? 'animate-spin' : ''}`}
                />
                <span>{t('btn_refresh')}</span>
              </Inline>
            </Inline>
          </div>
        </AnimatedItem>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 order-2 sm:order-1 space-y-6">
            {/* Basic Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiCalendarBlank className="w-5 h-5" />
                    <span>{t('basic_info_title')}</span>
                  </Inline>
                  {canEditLesson && !isEditing.basicInfo ? (
                    <Inline
                      as="button"
                      gap={1}
                      onClick={() => setEditMode('basicInfo', true)}
                      className="btn-classical-secondary text-sm"
                    >
                      <PiPencilLine className="w-3 h-3" />
                      <span>{t('btn_edit')}</span>
                    </Inline>
                  ) : canEditLesson && isEditing.basicInfo ? (
                    <Inline gap={2}>
                      <Inline
                        as="button"
                        gap={1}
                        onClick={handleSaveBasicInfo}
                        disabled={loading.update}
                        className="btn-classical-primary text-sm"
                      >
                        <PiFloppyDisk className="w-3 h-3" />
                        <span>{t('btn_save')}</span>
                      </Inline>
                      <Inline
                        as="button"
                        gap={1}
                        onClick={() => setEditMode('basicInfo', false)}
                        className="btn-classical-secondary text-sm"
                      >
                        <PiX className="w-3 h-3" />
                        <span>{t('btn_cancel')}</span>
                      </Inline>
                    </Inline>
                  ) : null}
                </div>

                {isEditing.basicInfo ? (
                  <Stack>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label={t('form_title_required')}
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
                        <Select
                          label={t('form_status_label')}
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
                        <Select
                          label={t('form_type_label')}
                          options={lessonTypeOptions}
                          value={editingBasicInfo.type}
                          onChange={(e) =>
                            updateFormData('type', e.target.value)
                          }
                          className="input-classical-2 w-full"
                        />
                      </div>
                      <div>
                        <Input
                          label={t('form_location_label')}
                          type="text"
                          value={editingBasicInfo.location}
                          onChange={(e) =>
                            updateFormData('location', e.target.value)
                          }
                          className="input-classical-2 w-full"
                          placeholder={t('form_location_placeholder')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label={t('form_datetime_required')}
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
                        <Input
                          label={t('form_duration_label')}
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
                      <Field.Area
                        label={t('form_description_label')}
                        classeCampo="h-20"
                        value={editingBasicInfo.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        placeholder={t('form_description_placeholder')}
                      />
                    </div>
                  </Stack>
                ) : (
                  <Stack>
                    <h3 className="text-xl font-bold text-theme-primary">
                      {lesson.title}
                    </h3>
                    {lesson.description && (
                      <p className="text-theme-secondary">
                        {lesson.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <Inline gap={2} className="text-theme-secondary">
                        <PiCalendarBlank className="w-4 h-4" />
                        <span>{formatDateTime(lesson.scheduledAt)}</span>
                      </Inline>
                      <Inline gap={2} className="text-theme-secondary">
                        <PiClock className="w-4 h-4" />
                        <span>{formatDuration(lesson.duration)}</span>
                      </Inline>
                    </div>

                    {lesson.location && (
                      <Inline gap={2} className="text-theme-secondary">
                        <PiMapPin className="w-4 h-4" />
                        <span>{lesson.location}</span>
                      </Inline>
                    )}

                    {/* Recurrence Info */}
                    {lesson.isRecurring && (
                      <Stack
                        gap={2}
                        className="bg-theme-elevated rounded-lg p-4"
                      >
                        <Inline gap={2} className="text-accent-blue">
                          <PiRepeat className="w-4 h-4" />
                          <span className="font-medium">
                            {t('recurring_lesson_title')}
                          </span>
                        </Inline>
                        <Text papel="rotulo" tom="suave" as="p">
                          {t('recurring_lesson_description')}
                          {lesson.parentLessonId
                            ? t('recurring_child_description')
                            : t('recurring_parent_description')}
                        </Text>
                      </Stack>
                    )}

                    {/* Warning if lesson was cancelled */}
                    {lesson.status === 'CANCELLED' && (
                      <Stack
                        gap={2}
                        className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4"
                      >
                        <Inline gap={2} className="text-accent-red">
                          <PiWarning className="w-4 h-4" />
                          <span className="font-medium">
                            {t('cancelled_lesson_title')}
                          </span>
                        </Inline>
                        <Text papel="rotulo" tom="suave" as="p">
                          {t('cancelled_lesson_description')}
                        </Text>
                      </Stack>
                    )}
                  </Stack>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Musical Pieces Section */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary classical-title"
                  >
                    <PiMusicNotes className="w-5 h-5" />
                    <span>{t('musical_pieces_title')}</span>
                  </Inline>
                  {canEditLesson && worksIds.length > 0 && <SaveWorksButton />}
                </div>

                {canEditLesson ? (
                  <WorkSelectionSection
                    selectedWorks={editingWorks}
                    onWorksChange={handleWorksChange}
                    maxWorks={4}
                    disabled={loading.update}
                  />
                ) : editingWorks.length > 0 ? (
                  <Stack gap={3}>
                    <h4 className="text-sm font-medium text-theme-primary">
                      {t('pieces_linked_count', { count: editingWorks.length })}
                    </h4>
                    <Stack gap={2}>
                      {editingWorks.map((work, index) => (
                        <div
                          key={work.workId}
                          className="bg-theme-elevated border border-theme-secondary rounded-lg p-4"
                        >
                          <Inline gap={3}>
                            <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <PiMusicNotes className="w-4 h-4 text-accent-blue" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Inline gap={2}>
                                <h5 className="font-medium text-theme-primary">
                                  {work.workTitle}
                                </h5>
                                <Text
                                  papel="legenda"
                                  tom="suave"
                                  className="bg-theme-secondary/20 px-2 py-0.5 rounded"
                                >
                                  #{index + 1}
                                </Text>
                              </Inline>
                              <Text papel="rotulo" tom="fraco" as="p">
                                {work.composerName}
                              </Text>
                              {work.scoreId && (
                                <Inline gap={2} className="mt-2">
                                  <Inline
                                    gap={1}
                                    className="text-xs text-accent-green"
                                  >
                                    <PiCheck className="w-3 h-3" />
                                    <span>Partitura: {work.scoreTitle}</span>
                                  </Inline>
                                  <Text papel="legenda" tom="fraco">
                                    ({work.scoreSource})
                                  </Text>
                                </Inline>
                              )}
                            </div>
                          </Inline>
                        </div>
                      ))}
                    </Stack>
                  </Stack>
                ) : (
                  <div className="text-center py-8">
                    <PiMusicNotes className="w-12 h-12 text-theme-tertiary mx-auto mb-4 opacity-50" />
                    <p className="text-theme-secondary">
                      {t('no_pieces_linked')}
                    </p>
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Objectives */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiTarget className="w-5 h-5" />
                    <span>{t('objectives_title')}</span>
                  </Inline>
                  {canEditLesson && !isEditing.objectives ? (
                    <Inline
                      as="button"
                      gap={1}
                      onClick={() => setEditMode('objectives', true)}
                      className="btn-classical-secondary text-sm"
                    >
                      <PiPencilLine className="w-3 h-3" />
                      <span>{t('btn_edit')}</span>
                    </Inline>
                  ) : canEditLesson && isEditing.objectives ? (
                    <Inline gap={2}>
                      <Inline
                        as="button"
                        gap={1}
                        onClick={handleSaveObjectives}
                        disabled={loading.update}
                        className="btn-classical-primary text-sm"
                      >
                        <PiFloppyDisk className="w-3 h-3" />
                        <span>{t('btn_save')}</span>
                      </Inline>
                      <Inline
                        as="button"
                        gap={1}
                        onClick={() => setEditMode('objectives', false)}
                        className="btn-classical-secondary text-sm"
                      >
                        <PiX className="w-3 h-3" />
                        <span>{t('btn_cancel')}</span>
                      </Inline>
                    </Inline>
                  ) : null}
                </div>

                {isEditing.objectives ? (
                  <Stack gap={3}>
                    {editingObjectives.map((objective, index) => (
                      <Inline gap={2} key={index}>
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
                          <PiTrash className="w-4 h-4 text-accent-red" />
                          <NomeAcao acao="excluir" />
                        </button>
                      </Inline>
                    ))}

                    <Inline gap={2}>
                      <Input
                        type="text"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder={t('new_objective_placeholder')}
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
                        <PiPlus className="w-4 h-4 text-brand-primary" />
                        <NomeAcao acao="adicionar" />
                      </button>
                    </Inline>
                  </Stack>
                ) : (
                  <Stack gap={2}>
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
                        {t('no_objectives_defined')}
                      </p>
                    )}
                  </Stack>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Topics & Techniques */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiBookOpen className="w-5 h-5" />
                    <span>{t('topics_techniques_title')}</span>
                  </Inline>
                  {canEditLesson && (
                    <Inline
                      as="button"
                      gap={1}
                      onClick={handleSaveTopicsAndTechniques}
                      disabled={loading.update}
                      className="btn-classical-secondary text-sm"
                    >
                      <PiFloppyDisk className="w-3 h-3" />
                      <span>{t('save_pieces_changes')}</span>
                    </Inline>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-theme-primary">
                        {t('topics_covered')}
                      </h3>
                      {canEditLesson && (
                        <Inline
                          as="button"
                          gap={1}
                          onClick={() => addArrayField('topics')}
                          className="text-brand-primary text-sm"
                        >
                          <PiPlus className="w-3 h-3" />
                          <span>{t('btn_add')}</span>
                        </Inline>
                      )}
                    </div>

                    {canEditLesson ? (
                      <Stack gap={2}>
                        {editingTopics.map((topic, index) => (
                          <Inline gap={2} key={index}>
                            <Input
                              type="text"
                              widhtFull
                              value={topic}
                              onChange={(e) =>
                                updateArrayField(
                                  'topics',
                                  index,
                                  e.target.value
                                )
                              }
                              className="input-classical-2 flex-1"
                              placeholder={t('topic_example_placeholder')}
                            />
                            {editingTopics.length >= 1 && (
                              <button
                                onClick={() =>
                                  removeArrayField('topics', index)
                                }
                                className="w-6 h-6 rounded bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center"
                              >
                                <PiX className="w-3 h-3 text-accent-red" />
                                <NomeAcao acao="fechar" />
                              </button>
                            )}
                          </Inline>
                        ))}

                        {/* <div className="flex items-center space-x-2"> */}
                        {/* <Input
                            widhtFull
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder={t('new_topic_placeholder')}
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
                          /> */}
                        {/* <button
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
                            <PiPlus className="w-3 h-3 text-brand-primary" />
                          </button> */}
                        {/* </div> */}
                      </Stack>
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
                          <Text papel="rotulo" tom="fraco" className="italic">
                            {t('no_topics_recorded')}
                          </Text>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-theme-primary">
                        {t('techniques_practiced')}
                      </h3>
                      {canEditLesson && (
                        <Inline
                          as="button"
                          gap={1}
                          onClick={() => addArrayField('techniques')}
                          className="text-brand-primary text-sm"
                        >
                          <PiPlus className="w-3 h-3" />
                          <span>{t('btn_add')}</span>
                        </Inline>
                      )}
                    </div>

                    {canEditLesson ? (
                      <Stack gap={2}>
                        {editingTechniques.map((technique, index) => (
                          <Inline gap={2} key={index}>
                            <Input
                              type="text"
                              widhtFull
                              value={technique}
                              onChange={(e) =>
                                updateArrayField(
                                  'techniques',
                                  index,
                                  e.target.value
                                )
                              }
                              className="input-classical-2 flex-1"
                              placeholder={t('technique_example_placeholder')}
                            />
                            {editingTechniques.length >= 1 && (
                              <button
                                onClick={() =>
                                  removeArrayField('techniques', index)
                                }
                                className="w-6 h-6 rounded bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center"
                              >
                                <PiX className="w-3 h-3 text-accent-red" />
                                <NomeAcao acao="fechar" />
                              </button>
                            )}
                          </Inline>
                        ))}

                        {/* <div className="flex items-center space-x-2">
                          <Input
                            type="text"
                            widhtFull
                            value={newTechnique}
                            onChange={(e) => setNewTechnique(e.target.value)}
                            placeholder={t('new_technique_placeholder')}
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
                          /> */}
                        {/* <button
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
                            <PiPlus className="w-3 h-3 text-brand-primary" />
                          </button> */}
                        {/* </div> */}
                      </Stack>
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
                          <Text papel="rotulo" tom="fraco" className="italic">
                            {t('no_techniques_recorded')}
                          </Text>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Notes Section */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <Inline
                    as="h2"
                    gap={2}
                    className="text-lg font-bold text-theme-primary"
                  >
                    <PiChatCenteredText className="w-5 h-5" />
                    <span>{t('notes_observations_title')}</span>
                  </Inline>
                  {canEditLesson && !isEditing.notes ? (
                    <Inline
                      as="button"
                      gap={1}
                      onClick={() => setEditMode('notes', true)}
                      className="btn-classical-secondary text-sm"
                    >
                      <PiPencilLine className="w-3 h-3" />
                      <span>{t('btn_edit')}</span>
                    </Inline>
                  ) : canEditLesson && isEditing.notes ? (
                    <Inline gap={2}>
                      <Inline
                        as="button"
                        gap={1}
                        onClick={handleSaveNotes}
                        disabled={loading.notes}
                        className="btn-classical-primary text-sm"
                      >
                        <PiFloppyDisk className="w-3 h-3" />
                        <span>{t('btn_save')}</span>
                      </Inline>
                      <Inline
                        as="button"
                        gap={1}
                        onClick={() => setEditMode('notes', false)}
                        className="btn-classical-secondary text-sm"
                      >
                        <PiX className="w-3 h-3" />
                        <span>{t('btn_cancel')}</span>
                      </Inline>
                    </Inline>
                  ) : null}
                </div>

                {isEditing.notes ? (
                  <Stack>
                    <div>
                      <Field.Area
                        label={t('teacher_notes_label')}
                        classeCampo="h-24"
                        value={editingNotes.teacher}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            teacher: e.target.value,
                          }))
                        }
                        placeholder={t('teacher_notes_placeholder')}
                      />
                    </div>

                    <div>
                      <Field.Area
                        label={t('public_notes_label')}
                        classeCampo="h-24"
                        value={editingNotes.public}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            public: e.target.value,
                          }))
                        }
                        placeholder={t('public_notes_placeholder')}
                      />
                    </div>

                    <div>
                      <Field.Area
                        label={t('lesson_summary_label')}
                        classeCampo="h-20"
                        value={editingNotes.summary}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        placeholder={t('lesson_summary_placeholder')}
                      />
                    </div>

                    <div>
                      <Field.Area
                        label={t('homework_label')}
                        classeCampo="h-20"
                        value={editingNotes.homework}
                        onChange={(e) =>
                          setEditingNotes((prev) => ({
                            ...prev,
                            homework: e.target.value,
                          }))
                        }
                        placeholder={t('homework_placeholder')}
                      />
                    </div>
                  </Stack>
                ) : (
                  <Stack>
                    {lesson.teacherNotes && (
                      <Stack gap={2}>
                        <h3 className="font-medium text-theme-primary">
                          {t('private_notes_section')}
                        </h3>
                        <div className="bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.teacherNotes}
                          </p>
                        </div>
                      </Stack>
                    )}

                    {lesson.publicNotes && (
                      <Stack gap={2}>
                        <h3 className="font-medium text-theme-primary">
                          {t('public_notes_section')}
                        </h3>
                        <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.publicNotes}
                          </p>
                        </div>
                      </Stack>
                    )}

                    {lesson.lessonSummary && (
                      <Stack gap={2}>
                        <h3 className="font-medium text-theme-primary">
                          {t('lesson_summary_section')}
                        </h3>
                        <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.lessonSummary}
                          </p>
                        </div>
                      </Stack>
                    )}

                    {lesson.homework && (
                      <Stack gap={2}>
                        <h3 className="font-medium text-theme-primary">
                          {t('homework_section')}
                        </h3>
                        <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-4">
                          <p className="text-theme-secondary whitespace-pre-wrap">
                            {lesson.homework}
                          </p>
                        </div>
                      </Stack>
                    )}

                    {!lesson.teacherNotes &&
                      !lesson.publicNotes &&
                      !lesson.lessonSummary &&
                      !lesson.homework && (
                        <p className="text-theme-tertiary italic">
                          {t('no_notes_recorded')}
                        </p>
                      )}
                  </Stack>
                )}
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - Student & Actions */}
          <div className="space-y-6 order-1 sm:order-2">
            {/* Student Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h2 className="text-lg font-bold text-theme-primary mb-4">
                  {t('student_info_title')}
                </h2>

                <Inline gap={4} className="mb-6">
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
                      <PiUser className="w-8 h-8 text-theme-primary" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {lesson.student.name}
                    </h3>
                    <p className="text-theme-secondary">
                      {t('level_label')} {translateNivel(lesson.student.level)}
                    </p>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {lesson.student.email}
                    </Text>
                  </div>
                </Inline>

                {/* Relationship Stats */}
                <Stack gap={2} className="text-sm">
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">
                      {t('total_lessons_label')}
                    </span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.totalLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">
                      {t('completed_lessons_label')}
                    </span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.completedLessons}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-theme-tertiary">
                      {t('duration_label')}
                    </span>
                    <span className="text-theme-primary font-medium">
                      {lesson.relationship.relationshipDuration}
                    </span>
                  </div>
                </Stack>
              </AnimatedCard>
            </AnimatedItem>

            {/* Resumo das peças selecionadas */}
            {editingWorks.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-bold text-theme-primary classical-title mb-4"
                  >
                    <PiMusicNotes className="w-5 h-5" />
                    <span>{t('linked_pieces_title')}</span>
                  </Inline>

                  <div className="space-y-3">
                    {editingWorks.map((work, index) => (
                      <Inline
                        gap={3}
                        key={work.workId}
                        className="p-3 bg-theme-elevated/50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PiMusicNotes className="w-4 h-4 text-accent-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="p"
                            className="font-medium truncate"
                          >
                            {work.workTitle}
                          </Text>
                          <Text
                            papel="legenda"
                            tom="fraco"
                            as="p"
                            className="truncate"
                          >
                            {work.composerName}
                          </Text>
                          {work.scoreId && (
                            <p className="text-xs text-accent-green">
                              {t('with_score')}
                            </p>
                          )}
                        </div>
                        <Text
                          papel="legenda"
                          tom="suave"
                          className="bg-theme-secondary/20 px-2 py-1 rounded"
                        >
                          #{index + 1}
                        </Text>
                      </Inline>
                    ))}

                    <div className="mt-3 p-3 bg-brand-primary/5 border border-brand-primary/20 rounded-lg">
                      <Text papel="legenda" tom="suave" as="div">
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
                      </Text>
                    </div>
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Quick Actions com modal de confirmação */}
            {lesson.status === 'SCHEDULED' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    {t('quick_actions_title')}
                  </h2>

                  <Stack gap={3}>
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => handleQuickAction('present')}
                      disabled={loading.attendance}
                      className="btn-classical-primary w-full justify-center"
                    >
                      <PiUserCheck className="w-4 h-4" />
                      <span>{t('mark_present')}</span>
                    </Inline>

                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => handleQuickAction('absent')}
                      disabled={loading.attendance}
                      className="w-full px-4 py-2 bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow rounded-lg hover:bg-accent-yellow/20 transition-colors justify-center"
                    >
                      <PiUserMinus className="w-4 h-4" />
                      <span>{t('mark_absent')}</span>
                    </Inline>

                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => handleQuickAction('complete')}
                      disabled={loading.update}
                      className="w-full px-4 py-2 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg hover:bg-accent-green/20 transition-colors justify-center"
                    >
                      <PiCheck className="w-4 h-4" />
                      <span>{t('complete_lesson')}</span>
                    </Inline>

                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => handleQuickAction('cancel')}
                      disabled={loading.update}
                      className="w-full px-4 py-2 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-lg hover:bg-accent-red/20 transition-colors justify-center"
                    >
                      <PiX className="w-4 h-4" />
                      <span>{t('cancel_lesson')}</span>
                    </Inline>
                  </Stack>
                </AnimatedCard>
              </AnimatedItem>
            )}

            {/* Attendance Status */}
            {lesson.studentPresent !== undefined && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    {t('attendance_status_title')}
                  </h2>

                  <div
                    className={`p-4 rounded-lg ${
                      lesson.studentPresent
                        ? 'bg-accent-green/10 border border-accent-green/30'
                        : 'bg-accent-red/10 border border-accent-red/30'
                    }`}
                  >
                    <Inline gap={2} className="mb-2">
                      {lesson.studentPresent ? (
                        <PiCheck className="w-5 h-5 text-accent-green" />
                      ) : (
                        <PiX className="w-5 h-5 text-accent-red" />
                      )}
                      <span
                        className={`font-medium ${
                          lesson.studentPresent
                            ? 'text-accent-green'
                            : 'text-accent-red'
                        }`}
                      >
                        {lesson.studentPresent ? t('present') : t('absent')}
                      </span>
                    </Inline>

                    {lesson.punctuality && (
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('punctuality_label')}{' '}
                        {lesson.punctuality === 'on_time'
                          ? t('punctuality_on_time')
                          : lesson.punctuality === 'late'
                            ? t('punctuality_late')
                            : t('punctuality_early')}
                      </Text>
                    )}

                    {lesson.engagement && (
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('engagement_label')} {lesson.engagement}/5
                      </Text>
                    )}

                    {lesson.preparation && (
                      <Text papel="rotulo" tom="suave" as="p">
                        {t('preparation_label')} {lesson.preparation}/5
                      </Text>
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
                    {t('student_feedback_title')}
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
                  {t('tips_title')}
                </h3>
                <Text papel="rotulo" tom="suave" as="div" className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <PiTarget className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_define_objectives')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PiMusicNotes className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_link_pieces')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PiFloppyDisk className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_save_changes')}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <PiCheck className="w-4 h-4 text-brand-primary mt-0.5 flex-shrink-0" />
                    <p>{t('tip_scores_reports')}</p>
                  </div>
                </Text>
              </AnimatedCard>
            </AnimatedItem>
          </div>
        </div>
      </AnimatedContainer>

      {/* Modal de confirmação para quick actions */}
      {showQuickActionModal && (
        <Modal
          isOpen
          onClose={() => setShowQuickActionModal(false)}
          maxWidth="md"
        >
          <div className="p-6">
            <Inline gap={3} className="mb-6">
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
                  <PiUserCheck className="w-6 h-6 text-accent-green" />
                )}
                {quickActionType === 'absent' && (
                  <PiUserMinus className="w-6 h-6 text-accent-yellow" />
                )}
                {quickActionType === 'complete' && (
                  <PiCheck className="w-6 h-6 text-accent-green" />
                )}
                {quickActionType === 'cancel' && (
                  <PiX className="w-6 h-6 text-accent-red" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  {t('confirm_action_title')}
                </h2>
                <p className="text-theme-secondary">
                  {quickActionType === 'present' && t('confirm_mark_present')}
                  {quickActionType === 'absent' && t('confirm_mark_absent')}
                  {quickActionType === 'complete' &&
                    t('confirm_complete_lesson')}
                  {quickActionType === 'cancel' && t('confirm_cancel_lesson')}
                </p>
              </div>
            </Inline>

            {quickActionType === 'cancel' && (
              <div className="mb-6">
                <Field.Area
                  label={t('reason_optional')}
                  value={quickActionReason}
                  onChange={(e) => setQuickActionReason(e.target.value)}
                  rows={3}
                  placeholder={t('cancel_reason_placeholder')}
                />
              </div>
            )}

            <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <PiInfo className="w-5 h-5 text-accent-blue mt-0.5" />
                <Stack gap={1} className="text-sm">
                  <p className="font-medium text-accent-blue">
                    {t('confirmation_title')}
                  </p>
                  <p className="text-theme-secondary">
                    {quickActionType === 'present' &&
                      t('present_confirmation_text')}
                    {quickActionType === 'absent' &&
                      t('absent_confirmation_text')}
                    {quickActionType === 'complete' &&
                      t('complete_confirmation_text')}
                    {quickActionType === 'cancel' &&
                      t('cancel_confirmation_text')}
                  </p>
                </Stack>
              </div>
            </div>

            <Inline gap={3} className="justify-end">
              <Button
                variante="secundario"
                type="submit"
                onClick={() => setShowQuickActionModal(false)}
                disabled={loadingQuickAction}
              >
                {t('btn_cancel')}
              </Button>
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
                  <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {quickActionType === 'present' && (
                      <PiUserCheck className="w-4 h-4" />
                    )}
                    {quickActionType === 'absent' && (
                      <PiUserMinus className="w-4 h-4" />
                    )}
                    {quickActionType === 'complete' && (
                      <PiCheck className="w-4 h-4" />
                    )}
                    {quickActionType === 'cancel' && (
                      <PiX className="w-4 h-4" />
                    )}
                  </>
                )}
                <span>
                  {loadingQuickAction ? t('btn_processing') : t('btn_confirm')}
                </span>
              </button>
            </Inline>
          </div>
        </Modal>
      )}

      {/* Modal de apagar/delete real */}
      {showDeleteModal && (
        <Modal isOpen onClose={() => setShowDeleteModal(false)} maxWidth="2xl">
          <Stack gap={6} className="p-6">
            <Inline gap={3}>
              <div className="w-12 h-12 bg-accent-red/10 rounded-full flex items-center justify-center">
                <PiTrash className="w-6 h-6 text-accent-red" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-primary">
                  {t('delete_lesson_title')}
                </h2>
                <p className="text-theme-secondary">
                  {t('delete_lesson_subtitle')}
                </p>
              </div>
            </Inline>

            <Stack>
              <div>
                <Field.Area
                  label={t('reason_optional')}
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  rows={3}
                  placeholder={t('delete_reason_placeholder')}
                />
              </div>

              {lesson.isRecurring && (
                <Stack gap={3}>
                  <Inline gap={3}>
                    <Checkbox
                      label={t('delete_all_recurring')}
                      id="deleteAll"
                      checked={deleteRecurringSeries}
                      onChange={(e) =>
                        setDeleteRecurringSeries(e.target.checked)
                      }
                    />
                  </Inline>

                  {deleteRecurringSeries && (
                    <Inline gap={3}>
                      <Checkbox
                        label={t('delete_future_only')}
                        id="futureOnly"
                        checked={deleteFutureOnly}
                        onChange={(e) => setDeleteFutureOnly(e.target.checked)}
                      />
                    </Inline>
                  )}
                </Stack>
              )}
            </Stack>

            <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <PiWarning className="w-5 h-5 text-accent-red mt-0.5" />
                <Stack gap={1} className="text-sm">
                  <p className="font-medium text-accent-red">
                    {t('irreversible_action_title')}
                  </p>
                  <p className="text-theme-secondary">
                    {deleteRecurringSeries
                      ? deleteFutureOnly
                        ? t('delete_recurring_future_warning')
                        : t('delete_recurring_all_warning')
                      : t('delete_single_warning')}
                    {t('delete_recover_warning')}
                    {lesson.isRecurring &&
                      !deleteRecurringSeries &&
                      t('delete_next_parent_warning')}
                  </p>
                </Stack>
              </div>
            </div>

            <Inline gap={3} className="justify-end">
              <Button
                variante="secundario"
                type="submit"
                onClick={() => setShowDeleteModal(false)}
                disabled={loading.delete}
              >
                {t('btn_keep_lesson')}
              </Button>
              <Inline
                as="button"
                gap={2}
                onClick={handleDeleteLesson}
                disabled={loading.delete}
                className="btn-classical-primary bg-accent-red border-accent-red hover:bg-accent-red/90"
              >
                {loading.delete ? (
                  <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                ) : (
                  <PiTrash className="w-4 h-4" />
                )}
                <span>
                  {loading.delete
                    ? t('btn_deleting')
                    : t('btn_delete_permanently')}
                </span>
              </Inline>
            </Inline>
          </Stack>
        </Modal>
      )}
    </PageContainer>
  );
}
