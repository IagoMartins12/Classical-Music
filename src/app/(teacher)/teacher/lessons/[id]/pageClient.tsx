// app/teacher/lessons/[id]/pageClient.tsx - Client Component para Detalhes da Aula

'use client';

import { useState, useCallback, useEffect } from 'react';
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
  FiFileText,
  FiTarget,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiPlus,
  FiTrash2,
  FiDownload,
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

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface TeacherLessonDetailsPageClientProps {
  lessonData: LessonDetailsData | null;
  teacherProfile: TeacherProfile;
  errorMessage?: string;
}

export default function TeacherLessonDetailsPageClient({
  lessonData,
  teacherProfile,
  errorMessage,
}: TeacherLessonDetailsPageClientProps) {
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
    updateProgress,
    markAttendance,
    completeLesson,
    cancelLesson,
    rescheduleLesson,
    createAssignment,
    setEditMode,
    clearError,
  } = useLessonDetails(lessonData);

  // Local edit states
  const [editingBasicInfo, setEditingBasicInfo] = useState({
    title: '',
    description: '',
    location: '',
    duration: 60,
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
  const [newObjective, setNewObjective] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newTechnique, setNewTechnique] = useState('');

  // Initialize lesson data
  useEffect(() => {
    if (lessonData) {
      setLesson(lessonData);
    }
  }, [lessonData, setLesson]);

  // Initialize edit states when editing starts
  useEffect(() => {
    if (lesson && isEditing.basicInfo) {
      setEditingBasicInfo({
        title: lesson.title,
        description: lesson.description || '',
        location: lesson.location || '',
        duration: lesson.duration,
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

  // Edit handlers
  const handleSaveBasicInfo = useCallback(async () => {
    const success = await updateBasicInfo(editingBasicInfo);
    if (success) {
      setEditMode('basicInfo', false);
    }
  }, [editingBasicInfo, updateBasicInfo, setEditMode]);

  const handleSaveObjectives = useCallback(async () => {
    const success = await updateObjectives(editingObjectives);
    if (success) {
      setEditMode('objectives', false);
    }
  }, [editingObjectives, updateObjectives, setEditMode]);

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

  // Attendance handlers
  const handleMarkPresent = useCallback(async () => {
    await markAttendance({
      studentPresent: true,
      punctuality: 'on_time',
      actualStartTime: new Date(),
    });
  }, [markAttendance]);

  const handleMarkAbsent = useCallback(async () => {
    await markAttendance({
      studentPresent: false,
    });
  }, [markAttendance]);

  // Quick actions
  const handleCompleteLesson = useCallback(async () => {
    const summary = lesson?.lessonSummary || 'Aula concluída com sucesso.';
    await completeLesson(summary);
  }, [completeLesson, lesson?.lessonSummary]);

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
            {/* Basic Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiCalendar className="w-5 h-5" />
                    <span>Informações Básicas</span>
                  </h2>
                  {!isEditing.basicInfo ? (
                    <button
                      onClick={() => setEditMode('basicInfo', true)}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : (
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
                  )}
                </div>

                {isEditing.basicInfo ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={editingBasicInfo.title}
                        onChange={(e) =>
                          setEditingBasicInfo((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-theme-tertiary mb-2">
                        Descrição
                      </label>
                      <textarea
                        value={editingBasicInfo.description}
                        onChange={(e) =>
                          setEditingBasicInfo((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="input-classical-2 w-full h-20"
                        placeholder="Descrição da aula..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Local
                        </label>
                        <input
                          type="text"
                          value={editingBasicInfo.location}
                          onChange={(e) =>
                            setEditingBasicInfo((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          className="input-classical-2 w-full"
                          placeholder="Local da aula"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-theme-tertiary mb-2">
                          Duração (min)
                        </label>
                        <input
                          type="number"
                          value={editingBasicInfo.duration}
                          onChange={(e) =>
                            setEditingBasicInfo((prev) => ({
                              ...prev,
                              duration: parseInt(e.target.value) || 60,
                            }))
                          }
                          className="input-classical-2 w-full"
                          min="30"
                          max="240"
                        />
                      </div>
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
                  </div>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Objectives */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiTarget className="w-5 h-5" />
                    <span>Objetivos da Aula</span>
                  </h2>
                  {!isEditing.objectives ? (
                    <button
                      onClick={() => setEditMode('objectives', true)}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : (
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
                  )}
                </div>

                {isEditing.objectives ? (
                  <div className="space-y-3">
                    {editingObjectives.map((objective, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={objective}
                          onChange={(e) => {
                            const newObjectives = [...editingObjectives];
                            newObjectives[index] = e.target.value;
                            setEditingObjectives(newObjectives);
                          }}
                          className="input-classical-2 flex-1"
                        />
                        <button
                          onClick={() => {
                            const newObjectives = editingObjectives.filter(
                              (_, i) => i !== index
                            );
                            setEditingObjectives(newObjectives);
                          }}
                          className="w-8 h-8 rounded-lg bg-accent-red/10 hover:bg-accent-red/20 transition-colors flex items-center justify-center"
                        >
                          <FiTrash2 className="w-4 h-4 text-accent-red" />
                        </button>
                      </div>
                    ))}

                    <div className="flex items-center space-x-2">
                      <input
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

            {/* Topics & Techniques */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiBookOpen className="w-5 h-5" />
                    <span>Tópicos e Técnicas</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-theme-primary mb-3">
                      Tópicos Abordados
                    </h3>
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
                  </div>

                  <div>
                    <h3 className="font-medium text-theme-primary mb-3">
                      Técnicas Trabalhadas
                    </h3>
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
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Notes Section */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-2">
                    <FiMessageSquare className="w-5 h-5" />
                    <span>Notas e Observações</span>
                  </h2>
                  {!isEditing.notes ? (
                    <button
                      onClick={() => setEditMode('notes', true)}
                      className="btn-classical-secondary flex items-center space-x-1 text-sm"
                    >
                      <FiEdit3 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>
                  ) : (
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
                  )}
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
                      Nível: {lesson.student.level}
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

            {/* Quick Actions */}
            {lesson.status === 'SCHEDULED' && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4">
                    Ações Rápidas
                  </h2>

                  <div className="space-y-3">
                    <button
                      onClick={handleMarkPresent}
                      disabled={loading.attendance}
                      className="btn-classical-primary w-full flex items-center justify-center space-x-2"
                    >
                      <FiUserCheck className="w-4 h-4" />
                      <span>Marcar Presença</span>
                    </button>

                    <button
                      onClick={handleMarkAbsent}
                      disabled={loading.attendance}
                      className="w-full px-4 py-2 bg-accent-yellow/10 border border-accent-yellow/30 text-accent-yellow rounded-lg hover:bg-accent-yellow/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiUserX className="w-4 h-4" />
                      <span>Marcar Falta</span>
                    </button>

                    <button
                      onClick={handleCompleteLesson}
                      disabled={loading.update}
                      className="w-full px-4 py-2 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-lg hover:bg-accent-green/20 transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Concluir Aula</span>
                    </button>

                    <button
                      onClick={() => cancelLesson('Cancelada pelo professor')}
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
          </div>
        </div>
      </AnimatedContainer>
    </PageContainer>
  );
}
