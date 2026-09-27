// app/teacher/assignments/[id]/edit/pageClient.tsx - Client Component para Editar Tarefa COM TRADUÇÕES

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PiArrowLeft,
  PiArrowsClockwise,
  PiCalendarBlank,
  PiFloppyDisk,
  PiMusicNotes,
  PiPlus,
  PiTrash,
  PiUser,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../../../components/animation/AnimatedComponents';
import { EditAssignmentData } from './pageServer';
import Image from '@/app/components/SmartImage';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEditAssignment } from '@/app/hooks/lessonsSystem/useEditAssignment';
import WorkSelectionSection, {
  LessonWork,
} from '@/app/components/TeacherSystem/WorkSelectionSection';
import { useTranslation } from '@/app/context/TranslationContext';
import { getWorkById } from '@/app/requests/catalog-search';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

interface EditAssignmentPageClientProps {
  initialData: EditAssignmentData | null;
  errorMessage?: string;
}

export default function EditAssignmentPageClient({
  initialData,
  errorMessage,
}: EditAssignmentPageClientProps) {
  const { t } = useTranslation({ sections: ['teacher/assignmentsEdit'] });

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
            const workData = await getWorkById(workId);
            if (workData) {
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
        [field]: (prev[field as keyof typeof prev] as string[]).map(
          (item, i) => (i === index ? value : item)
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
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiWarningCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              {t('error_loading')}
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage || t('error_not_found')}
            </p>
            <Link href="/teacher/assignments" className="btn-classical-primary">
              {t('back_to_assignments')}
            </Link>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!initialData?.assignment) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">{t('loading_assignment')}</p>
          </Card>
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
            <Inline gap={4}>
              <Link
                href="/teacher/assignments"
                className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group"
              >
                <PiArrowLeft className="w-4 h-4 text-theme-tertiary group-hover:text-brand-primary transition-colors" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gradient-brand classical-title">
                  {t('page_title')}
                </h1>
                <p className="text-theme-secondary classical-subtitle">
                  {assignment.title}
                </p>
              </div>
            </Inline>

            {/* Delete Button */}
            <Inline
              as="button"
              gap={2}
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10"
            >
              <PiTrash className="w-4 h-4" />
              <span>{t('delete')}</span>
            </Inline>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-theme-primary classical-title">
                      {t('basic_info')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Select
                          label={t('assignment_type')}
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
                        <Text
                          papel="legenda"
                          tom="fraco"
                          as="p"
                          className="mt-1"
                        >
                          {
                            initialData.assignmentTypes.find(
                              (t) => t.value === formData.type
                            )?.description
                          }
                        </Text>
                      </div>

                      <div>
                        <Select
                          label={t('priority')}
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
                      <Input
                        label={t('assignment_title_required')}
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          updateFormData('title', e.target.value)
                        }
                        className="input-classical w-full"
                        placeholder={t('title_placeholder')}
                        required
                      />
                    </div>

                    <div>
                      <Field.Area
                        label={t('description_required')}
                        value={formData.description}
                        onChange={(e) =>
                          updateFormData('description', e.target.value)
                        }
                        rows={4}
                        placeholder={t('description_placeholder')}
                        required
                      />
                    </div>
                  </div>

                  {/* Timing */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-theme-primary classical-title">
                      {t('deadline_and_time')}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label={t('due_date')}
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
                        <Input
                          label={t('estimated_time')}
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
                        {t('practice_goals')}
                      </h3>
                      <Inline
                        as="button"
                        gap={1}
                        type="button"
                        onClick={() => addArrayField('practiceGoals')}
                        className="text-brand-primary hover:text-brand-secondary text-sm"
                      >
                        <PiPlus className="w-3 h-3" />
                        <span>{t('add')}</span>
                      </Inline>
                    </div>

                    <div className="space-y-2">
                      {formData.practiceGoals.map((goal, index) => (
                        <Inline gap={2} key={index}>
                          <Input
                            widhtFull
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
                              <PiX className="w-4 h-4" />
                              <NomeAcao acao="fechar" />
                            </button>
                          )}
                        </Inline>
                      ))}
                    </div>
                  </div>

                  {/* 🆕 SEÇÃO DE PEÇAS MUSICAIS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Inline
                        as="h3"
                        gap={2}
                        className="text-lg font-bold text-theme-primary classical-title"
                      >
                        <PiMusicNotes className="w-5 h-5" />
                        <span>{t('musical_pieces')}</span>
                      </Inline>
                      <Text papel="rotulo" tom="suave" as="div">
                        {t('pieces_count', { count: selectedWorks.length })}
                      </Text>
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
                    <Inline
                      as="button"
                      gap={2}
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-brand-primary hover:text-brand-secondary"
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
                    </Inline>

                    {showAdvanced && (
                      <div className="space-y-6 p-4 bg-theme-secondary/5 shadow-lg rounded-lg">
                        {/* Technical Goals */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              {t('technical_goals')}
                            </label>
                            <Inline
                              as="button"
                              gap={1}
                              type="button"
                              onClick={() => addArrayField('technicalGoals')}
                              className="text-brand-primary text-sm"
                            >
                              <PiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
                            </Inline>
                          </div>
                          <div className="space-y-2">
                            {formData.technicalGoals.map((goal, index) => (
                              <Inline gap={2} key={index}>
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
                                    <PiX className="w-4 h-4" />
                                    <NomeAcao acao="fechar" />
                                  </button>
                                )}
                              </Inline>
                            ))}
                          </div>
                        </div>

                        {/* Musical Goals */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              {t('musical_goals')}
                            </label>
                            <Inline
                              as="button"
                              gap={1}
                              type="button"
                              onClick={() => addArrayField('musicalGoals')}
                              className="text-brand-primary text-sm"
                            >
                              <PiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
                            </Inline>
                          </div>
                          <div className="space-y-2">
                            {formData.musicalGoals.map((goal, index) => (
                              <Inline gap={2} key={index}>
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
                                    <PiX className="w-4 h-4" />
                                    <NomeAcao acao="fechar" />
                                  </button>
                                )}
                              </Inline>
                            ))}
                          </div>
                        </div>

                        {/* Exercises */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-theme-primary">
                              {t('specific_exercises')}
                            </label>
                            <Inline
                              as="button"
                              gap={1}
                              type="button"
                              onClick={() => addArrayField('exercises')}
                              className="text-brand-primary text-sm"
                            >
                              <PiPlus className="w-3 h-3" />
                              <span>{t('add')}</span>
                            </Inline>
                          </div>
                          <div className="space-y-2">
                            {formData.exercises.map((exercise, index) => (
                              <Inline gap={2} key={index}>
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
                                    <PiX className="w-4 h-4" />
                                    <NomeAcao acao="fechar" />
                                  </button>
                                )}
                              </Inline>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-accent-red/10 border border-accent-red/30 rounded-lg p-4">
                      <Inline gap={3}>
                        <PiWarningCircle className="w-5 h-5 text-accent-red" />
                        <div>
                          <p className="text-accent-red font-medium">
                            {t('error_updating')}
                          </p>
                          <p className="text-accent-red/80 text-sm">{error}</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearError}
                          className="ml-auto text-accent-red"
                        >
                          <PiX className="w-4 h-4" />
                          <NomeAcao acao="fechar" />
                        </button>
                      </Inline>
                    </div>
                  )}

                  {/* Actions */}
                  <Inline
                    gap={3}
                    className="justify-end pt-6 border-t border-theme-secondary"
                  >
                    <Link
                      href="/teacher/assignments"
                      className="btn-classical-secondary"
                    >
                      {t('cancel')}
                    </Link>
                    <Inline
                      as="button"
                      gap={2}
                      type="submit"
                      disabled={
                        loading.updateAssignment ||
                        !formData.title ||
                        !formData.description
                      }
                      className="btn-classical-primary"
                    >
                      {loading.updateAssignment ? (
                        <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                      ) : (
                        <PiFloppyDisk className="w-4 h-4" />
                      )}
                      <span>
                        {loading.updateAssignment
                          ? t('updating')
                          : t('save_changes')}
                      </span>
                    </Inline>
                  </Inline>
                </form>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 order-1 lg:order-2">
            {/* Assignment Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('assignment_info')}
                </h3>

                <div className="space-y-4">
                  <Inline gap={3}>
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
                        <PiUser className="w-6 h-6 text-theme-primary" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-theme-primary">
                        {assignment.student.name}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        {t('student')}
                      </Text>
                    </div>
                  </Inline>

                  <div className="pt-4 border-t border-theme-secondary/20">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          {t('status')}
                        </span>
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
                            ? t('completed')
                            : assignment.status === 'OVERDUE'
                              ? t('overdue')
                              : assignment.status === 'IN_PROGRESS'
                                ? t('in_progress')
                                : t('pending')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-theme-tertiary">
                          {t('created_on')}
                        </span>
                        {assignment.createdAt && (
                          <span className="text-theme-primary">
                            {new Date(assignment.createdAt).toLocaleDateString(
                              'pt-BR'
                            )}
                          </span>
                        )}
                      </div>
                      {assignment.dueDate && (
                        <div className="flex justify-between">
                          <span className="text-theme-tertiary">
                            {t('due_date_label')}
                          </span>
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
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-bold text-theme-primary classical-title mb-4"
                  >
                    <PiMusicNotes className="w-5 h-5" />
                    <span>{t('selected_pieces')}</span>
                  </Inline>

                  <div className="space-y-3">
                    {selectedWorks.map((work, index) => (
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
                            {t('composer')}: {work.composerName}
                          </Text>
                          {work.scoreId && (
                            <p className="text-xs text-accent-green">
                              {t('piece_with_score')}
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

                    <div className="mt-3 p-3 bg-theme-elevated rounded-lg">
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

            {/* Lesson Info */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="none" className="classical-card p-6">
                <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                  {t('related_lesson')}
                </h3>

                <Link
                  href={`/teacher/lessons/${assignment.lesson.id}`}
                  className="space-y-2 "
                >
                  <div className="font-medium text-theme-primary">
                    {assignment.lesson.title}
                  </div>
                  <Text
                    papel="rotulo"
                    tom="suave"
                    as="div"
                    className="flex items-center"
                  >
                    <PiCalendarBlank className="w-4 h-4 mr-2" />
                    {new Date(assignment.lesson.scheduledAt).toLocaleDateString(
                      'pt-BR'
                    )}
                  </Text>
                </Link>
              </AnimatedCard>
            </AnimatedItem>

            {/* Work Scores (Partituras vinculadas antigas - compatibilidade) */}
            {assignment.workScores.length > 0 && selectedWorks.length === 0 && (
              <AnimatedItem direction="up" springType="gentle">
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h3 className="text-lg font-bold text-theme-primary classical-title mb-4">
                    {t('linked_scores_legacy')}
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
                  <PiTrash className="w-8 h-8 text-theme-primary" />
                </div>
                <h2 className="text-xl font-bold text-theme-primary mb-4">
                  {t('confirm_deletion')}
                </h2>
                <p className="text-theme-secondary mb-6">
                  {t('delete_confirmation_message', {
                    title: assignment.title,
                  })}
                </p>
                <div className="flex space-x-3">
                  <Button
                    variante="secundario"
                    type="submit"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                    disabled={loading.deleteAssignment}
                  >
                    {t('cancel')}
                  </Button>
                  <Inline
                    as="button"
                    gap={2}
                    onClick={handleDelete}
                    disabled={loading.deleteAssignment}
                    className="btn-classical-primary bg-accent-red border-accent-red hover:bg-accent-red/90 flex-1 justify-center"
                  >
                    {loading.deleteAssignment ? (
                      <PiArrowsClockwise className="w-4 h-4 animate-spin" />
                    ) : (
                      <PiTrash className="w-4 h-4" />
                    )}
                    <span>
                      {loading.deleteAssignment ? t('deleting') : t('delete')}
                    </span>
                  </Inline>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
