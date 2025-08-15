// app/teacher/assignments/[id]/edit/pageClient.tsx - Client Component para Editar Tarefa

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  FiUser,
  FiSave,
  FiX,
  FiPlus,
  FiAlertCircle,
  FiRefreshCw,
  FiArrowLeft,
  FiCalendar,
  FiTrash2,
  FiMusic,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../../components/animation/AnimatedComponents';
import { EditAssignmentData } from './pageServer';
import Image from 'next/image';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditAssignment } from '@/app/hooks/lessonsSystem/useEditAssignment';
import WorkSelectionSection, {
  LessonWork,
} from '@/app/components/TeacherSystem/WorkSelectionSection';

interface EditAssignmentPageClientProps {
  initialData: EditAssignmentData | null;
  errorMessage?: string;
}

export default function EditAssignmentPageClient({
  initialData,
  errorMessage,
}: EditAssignmentPageClientProps) {
  const router = useRouter();
  const { updateAssignment, deleteAssignment, loading, error, clearError } =
    useEditAssignment();

  // 🆕 ESTADOS PARA PEÇAS MUSICAIS
  const [selectedWorks, setSelectedWorks] = useState<LessonWork[]>([]);
  const [worksIds, setWorksIds] = useState<string[]>([]);
  const [workScoreIds, setWorkScoreIds] = useState<string[]>([]);

  // Form state - inicializado com dados existentes
  const [formData, setFormData] = useState(() => {
    if (!initialData?.assignment) {
      return {
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
        // 🆕 INCLUIR worksIds
        worksIds: [] as string[],
      };
    }

    const assignment = initialData.assignment;
    return {
      title: assignment.title,
      description: assignment.description,
      type: assignment.type,
      priority: assignment.priority,
      dueDate: assignment.dueDate
        ? new Date(assignment.dueDate).toISOString().slice(0, 10)
        : '',
      estimatedTime: assignment.estimatedTime || 60,
      practiceGoals:
        assignment.practiceGoals.length > 0 ? assignment.practiceGoals : [''],
      technicalGoals:
        assignment.technicalGoals.length > 0 ? assignment.technicalGoals : [''],
      musicalGoals:
        assignment.musicalGoals.length > 0 ? assignment.musicalGoals : [''],
      exercises: assignment.exercises.length > 0 ? assignment.exercises : [''],
      workScoreIds: assignment.workScoreIds || [],
      // 🆕 INCLUIR worksIds
      worksIds: assignment.worksIds || [],
    };
  });

  const [showAdvanced, setShowAdvanced] = useState(() => {
    if (!initialData?.assignment) return false;

    const assignment = initialData.assignment;
    return (
      assignment.technicalGoals.length > 0 ||
      assignment.musicalGoals.length > 0 ||
      assignment.exercises.length > 0
    );
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 🆕 CARREGAR PEÇAS MUSICAIS EXISTENTES
  useEffect(() => {
    if (!initialData?.assignment) return;

    const loadExistingWorks = async () => {
      const assignment = initialData.assignment;
      console.log('🔄 [EDIT] Carregando peças existentes:', {
        worksIds: assignment.worksIds,
        workScoreIds: assignment.workScoreIds,
      });

      // Carregar dados completos das obras usando os IDs
      const existingWorks: LessonWork[] = [];

      try {
        // Para cada work ID, buscar dados completos
        for (const workId of assignment.worksIds) {
          try {
            const response = await fetch(`/api/works/${workId}`);
            if (response.ok) {
              const workData = await response.json();

              // Verificar se tem partitura específica para esta obra
              const scoreId = assignment.workScoreIds.find(() => {
                // Aqui você pode implementar lógica para associar score com work
                // Por simplicidade, vamos assumir que qualquer score está disponível
                return true;
              });

              const workScore = assignment.workScores.find(
                (score) => score.id === scoreId
              );

              existingWorks.push({
                workId: workData.id,
                workTitle: workData.title,
                composerName:
                  workData.composer.fullName || workData.composer.name,
                composerId: workData.composer.id,
                // Se tem partitura associada
                ...(workScore && {
                  scoreId: workScore.id,
                  scoreTitle: workScore.title,
                  scoreUrl: workScore.downloadUrl,
                  scoreType: workScore.type,
                  scoreSource: 'IMSLP' as const, // Assumir IMSLP como padrão
                }),
              });
            }
          } catch (error) {
            console.error(`❌ Erro ao carregar work ${workId}:`, error);
          }
        }

        console.log('✅ [EDIT] Peças carregadas:', existingWorks);
        setSelectedWorks(existingWorks);
        setWorksIds(assignment.worksIds);
        setWorkScoreIds(assignment.workScoreIds);
      } catch (error) {
        console.error('❌ [EDIT] Erro ao carregar peças existentes:', error);
      }
    };

    loadExistingWorks();
  }, [initialData]);

  // 🆕 HANDLER PARA MUDANÇAS NAS PEÇAS MUSICAIS
  const handleWorksChange = useCallback((works: LessonWork[]) => {
    console.log('🎵 [EDIT] Peças musicais atualizadas:', works);
    setSelectedWorks(works);

    // 🔥 EXTRAIR worksIds e workScoreIds CORRETAMENTE
    const newWorksIds = works.map((work) => work.workId);
    const newWorkScoreIds = works
      .filter((work) => work.scoreId)
      .map((work) => work.scoreId!);

    setWorksIds(newWorksIds);
    setWorkScoreIds(newWorkScoreIds);

    console.log('📊 [EDIT] IDs extraídos:', {
      worksIds: newWorksIds,
      workScoreIds: newWorkScoreIds,
      totalPecas: works.length,
      totalPartituras: newWorkScoreIds.length,
    });
  }, []);

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

  // Submit handler
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      clearError();

      if (!initialData?.assignment) {
        return;
      }

      // Validation
      if (!formData.title || !formData.description) {
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

      console.log('🚀 [EDIT] Enviando dados da tarefa:', {
        ...cleanData,
        totalPecas: worksIds.length,
        totalPartituras: workScoreIds.length,
      });

      const success = await updateAssignment(
        initialData.assignment.id,
        cleanData
      );

      if (success) {
        router.push('/teacher/assignments');
      }
    },
    [
      formData,
      worksIds,
      workScoreIds,
      updateAssignment,
      clearError,
      initialData,
      router,
    ]
  );

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!initialData?.assignment) return;

    const success = await deleteAssignment(initialData.assignment.id);

    if (success) {
      router.push('/teacher/assignments');
    }
  }, [deleteAssignment, initialData, router]);

  // Render error state
  if (errorMessage || (!initialData && !loading.updateAssignment)) {
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
                'Tarefa não encontrada ou sem permissão para editar'}
            </p>
            <Link href="/teacher/assignments" className="btn-classical-primary">
              Voltar às Tarefas
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!initialData?.assignment) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando tarefa...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const assignment = initialData.assignment;

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
                  Editar Tarefa
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  {assignment.title}
                </p>
              </div>
            </div>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10 flex items-center space-x-2"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Deletar</span>
            </button>
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

                  {/* 🆕 SEÇÃO DE PEÇAS MUSICAIS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-theme-primary classical-title flex items-center space-x-2">
                        <FiMusic className="w-5 h-5" />
                        <span>Peças Musicais</span>
                      </h3>
                      <div className="text-sm text-theme-secondary">
                        {selectedWorks.length}/4 peças
                      </div>
                    </div>

                    <WorkSelectionSection
                      selectedWorks={selectedWorks}
                      onWorksChange={handleWorksChange}
                      maxWorks={4}
                      disabled={loading.updateAssignment}
                    />
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
                      <div className="space-y-6 p-4 bg-theme-secondary/5 shadow-lg rounded-lg">
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
                            Erro ao atualizar tarefa
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
                        loading.updateAssignment ||
                        !formData.title ||
                        !formData.description
                      }
                      className="btn-classical-primary flex items-center space-x-2"
                    >
                      {loading.updateAssignment ? (
                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <FiSave className="w-4 h-4" />
                      )}
                      <span>
                        {loading.updateAssignment
                          ? 'Atualizando...'
                          : 'Salvar Alterações'}
                      </span>
                    </button>
                  </div>
                </form>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Informações da Tarefa
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    {assignment.student.image ? (
                      <div className="w-12 h-12 relative rounded-full overflow-hidden">
                        <Image
                          src={assignment.student.image}
                          alt={assignment.student.name}
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
                        {assignment.student.name}
                      </div>
                      <div className="text-sm text-theme-tertiary">Aluno</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-theme-secondary/20">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Status:</span>
                        <span
                          className={`font-medium ${
                            assignment.isCompleted
                              ? 'text-accent-green'
                              : assignment.status === 'OVERDUE'
                              ? 'text-accent-red'
                              : 'text-accent-blue'
                          }`}
                        >
                          {assignment.isCompleted
                            ? 'Concluída'
                            : assignment.status === 'OVERDUE'
                            ? 'Atrasada'
                            : assignment.status === 'IN_PROGRESS'
                            ? 'Em Progresso'
                            : 'Pendente'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">Criado em:</span>
                        <span className="text-theme-primary">
                          {assignment.createdAt.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      {assignment.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-theme-tertiary">Prazo:</span>
                          <span className="text-theme-primary">
                            {new Date(assignment.dueDate).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* 🆕 RESUMO DAS PEÇAS SELECIONADAS */}
            {selectedWorks.length > 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4 flex items-center space-x-2">
                    <FiMusic className="w-5 h-5" />
                    <span>Peças Selecionadas</span>
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

            {/* Lesson Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  Aula Relacionada
                </h3>

                <div className="space-y-2">
                  <div className="font-medium text-theme-primary">
                    {assignment.lesson.title}
                  </div>
                  <div className="text-sm text-theme-secondary flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2" />
                    {new Date(assignment.lesson.scheduledAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </div>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Work Scores (Partituras vinculadas antigas - compatibilidade) */}
            {assignment.workScores.length > 0 && selectedWorks.length === 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                    Partituras Vinculadas (Legado)
                  </h3>

                  <div className="space-y-2">
                    {assignment.workScores.map((score) => (
                      <div
                        key={score.id}
                        className="text-sm p-2 bg-theme-secondary/10 rounded border"
                      >
                        <div className="font-medium text-theme-primary">
                          {score.title}
                        </div>
                        <div className="text-theme-tertiary">
                          {score.composer} - {score.workTitle}
                        </div>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              </AnimatedItem>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <AnimatedCard
              hover="none"
              className="classical-card p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FiTrash2 className="w-8 h-8 text-theme-primary" />
                </div>
                <h2 className="text-xl font-bold text-theme-primary mb-4">
                  Confirmar Exclusão
                </h2>
                <p className="text-theme-secondary mb-6">
                  Tem certeza que deseja deletar a tarefa &quot;
                  {assignment.title}&quot;? Esta ação não pode ser desfeita.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="btn-classical-secondary flex-1"
                    disabled={loading.deleteAssignment}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={loading.deleteAssignment}
                    className="btn-classical-primary bg-accent-red border-accent-red hover:bg-accent-red/90 flex-1 flex items-center justify-center space-x-2"
                  >
                    {loading.deleteAssignment ? (
                      <FiRefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                    <span>
                      {loading.deleteAssignment ? 'Deletando...' : 'Deletar'}
                    </span>
                  </button>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
