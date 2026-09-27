// app/teacher/pageClient.tsx - ATUALIZADO com filtro semanal para próximas aulas

'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from '@/app/components/SmartImage';
import Link from 'next/link';
import {
  PiArrowsClockwise,
  PiCalendarBlank,
  PiCaretRight,
  PiClock,
  PiEye,
  PiUserPlus,
  PiUsers,
  PiXCircle,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../components/animation/AnimatedComponents';
import type {
  TeacherDashboardData,
  TeacherStudentsData,
} from '@/app/requests/teacher-request';
import {
  inviteStudentRequest,
  searchInvitableStudents,
} from '@/app/requests/portal/relationship-actions';

import AddStudentModal from '@/app/components/TeacherSystem/AddStudentModal';
import { useToast } from '@/app/hooks/useToast';
import { useTeacherData } from '@/app/hooks/lessonsSystem/useTeacherData';
import RefreshIndicator from '@/app/components/Common/RefreshIndicator';
import { translateNivel } from '@/app/utils';
import RecentActivities from '@/app/components/TeacherSystem/RecentActivities';
import { useTranslation } from '@/app/context/TranslationContext';
import { Inline, Stack } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface TeacherPageClientProps {
  initialDashboardData: TeacherDashboardData | null;
  initialStudentsData: TeacherStudentsData | null;
  initialCalendarData: any;
  teacherProfile: TeacherProfile;
  errorMessage?: string;
}

export interface StudentSearchResult {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  location?: string | null;
  experienceLevel?: string | null;
  mainInstrument?: string | null;
  studentLevel?: string | null;
  isAlreadyStudent: boolean;
  relationshipId?: string | null;
  hasStudentProfile: boolean;
}

interface StudyPlanData {
  maxLessonsPerWeek: number;
  lessonDuration: number;
  preferredDays: string[];
  preferredTimes: string[];
  currentFocus: string[];
  learningPlan?: string;
  studyGoals?: string;
  practiceFrequency?: string;
  homeworkExpectation?: string;
  specialInstructions?: string;
  teacherNotes?: string;
}

// 🆕 FUNÇÃO PARA FILTRAR AULAS DESTA SEMANA
function filterLessonsThisWeek(lessons: any[]): any[] {
  const now = new Date();

  // Calcular início da semana (domingo)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay(); // 0 = domingo
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  // Calcular fim da semana (sábado)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  console.log('🗓️ [WEEKLY-FILTER] Filtrando aulas desta semana:', {
    startOfWeek: startOfWeek.toISOString(),
    endOfWeek: endOfWeek.toISOString(),
    totalLessons: lessons.length,
  });

  const filteredLessons = lessons.filter((lesson) => {
    const lessonDate = new Date(lesson.scheduledAt);
    const isThisWeek = lessonDate >= startOfWeek && lessonDate <= endOfWeek;

    if (isThisWeek) {
      console.log('✅ [WEEKLY-FILTER] Aula incluída:', {
        title: lesson.title || 'Sem título',
        date: lessonDate.toISOString(),
        student: lesson.student?.name || 'Sem aluno',
      });
    }

    return isThisWeek;
  });

  console.log(
    `📊 [WEEKLY-FILTER] ${filteredLessons.length} de ${lessons.length} aulas desta semana`
  );

  return filteredLessons;
}

export default function TeacherPageClient({
  initialDashboardData,
  initialStudentsData,
  initialCalendarData,
  teacherProfile,
  errorMessage,
}: TeacherPageClientProps) {
  const {
    data: { dashboard: dashboardData, students: studentsData },
    refreshing,
    error: dataError,
    refreshData,
    clearError,
  } = useTeacherData({
    initialData: {
      dashboard: initialDashboardData,
      students: initialStudentsData,
      calendar: initialCalendarData,
    },
  });

  const { t } = useTranslation({ sections: ['teacher/home'] });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorMessage);

  const toast = useToast();
  const currentError = error || dataError;

  useEffect(() => {
    refreshData(false);
  }, []);

  const todayLessons = dashboardData?.dashboard?.todayLessons || [];

  // 🆕 APLICAR FILTRO SEMANAL NAS PRÓXIMAS AULAS
  const allUpcomingLessons = dashboardData?.dashboard?.upcomingLessons || [];
  const upcomingLessonsThisWeek = filterLessonsThisWeek(
    allUpcomingLessons
  ).slice(0, 5);

  const activeStudents =
    studentsData?.students?.filter((s) => s.relationship.isActive) || [];

  const searchStudents = useCallback(async (email: string) => {
    if (email.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      setSearchResults(await searchInvitableStudents(email));
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      const timeoutId = setTimeout(() => {
        if (value.trim()) {
          searchStudents(value.trim());
        } else {
          setSearchResults([]);
        }
      }, 600);

      return () => clearTimeout(timeoutId);
    },
    [searchStudents]
  );

  const addStudent = useCallback(
    async (studentUserId: string, studyPlan?: StudyPlanData) => {
      setLoading(true);
      setError(undefined);
      clearError();

      try {
        console.log('🎯 [TEACHER-DASHBOARD] Adicionando aluno com plano:', {
          studentUserId,
          hasStudyPlan: !!studyPlan,
          studyPlan: studyPlan
            ? {
                maxLessonsPerWeek: studyPlan.maxLessonsPerWeek,
                lessonDuration: studyPlan.lessonDuration,
                preferredDaysCount: studyPlan.preferredDays?.length || 0,
                preferredTimesCount: studyPlan.preferredTimes?.length || 0,
                currentFocusCount: studyPlan.currentFocus?.length || 0,
              }
            : null,
        });

        // A API guarda o plano que tem campo; metas e instruções extras do
        // formulário não têm onde ficar. O vínculo nasce como convite.
        await inviteStudentRequest(studentUserId, {
          maxLessonsPerWeek: studyPlan?.maxLessonsPerWeek || 1,
          lessonDuration: studyPlan?.lessonDuration || 60,
          preferredDays: studyPlan?.preferredDays || [],
          preferredTimes: studyPlan?.preferredTimes || [],
          learningPlan: studyPlan?.learningPlan,
          currentFocus: studyPlan?.currentFocus || [],
          teacherNotes: studyPlan?.teacherNotes,
        });

        toast.success('Convite enviado ao aluno!');
        setShowAddStudent(false);
        setSearchQuery('');
        setSearchResults([]);
        await refreshData(false);
      } catch (error) {
        console.error('❌ [TEACHER-DASHBOARD] Erro ao adicionar aluno:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Erro ao adicionar aluno. Tente novamente.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [refreshData, toast, clearError]
  );

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const onCloseModal = () => {
    setShowAddStudent(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  if (currentError && !dashboardData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-erro rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiXCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Dashboard
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {currentError}
            </p>
            <Stack gap={3} className="items-center">
              <Inline
                as="button"
                gap={2}
                onClick={() => {
                  refreshData(true);
                }}
                disabled={refreshing}
                className="btn-classical-primary justify-center"
              >
                <PiArrowsClockwise
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span>
                  {refreshing ? 'Atualizando...' : 'Tentar Novamente'}
                </span>
              </Inline>
              {currentError !== errorMessage && (
                <Button
                  variante="secundario"
                  type="submit"
                  onClick={() => {
                    setError(undefined);
                    clearError();
                  }}
                >
                  Fechar Erro
                </Button>
              )}
            </Stack>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 fill-ouro rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title m-0 mb-4">
              {t('dashboard_title')}
            </h1>
            <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row items-center justify-center space-x-4">
              <p className="text-xl m-0 text-theme-secondary classical-subtitle">
                {t('welcome_message', { name: teacherProfile.name })}
              </p>

              <RefreshIndicator
                isRefreshing={refreshing}
                onRefresh={refreshData}
                error={dataError}
                size="md"
                showLastUpdated={true}
                className="ml-4"
              />
            </div>
          </div>
        </AnimatedItem>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-0 justify-between mb-6">
                  <div className="flex items-center w-full sm:w-[75%]  justify-between">
                    <Inline gap={3}>
                      <div className="w-10 h-10 fill-ouro rounded-xl flex items-center justify-center">
                        <PiUsers className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-theme-primary classical-title">
                          {t('your_students_title')}
                        </h2>
                        <Text papel="rotulo" tom="fraco" as="p">
                          {activeStudents.length} {t('active_students')}
                        </Text>
                      </div>
                    </Inline>

                    <Link
                      href="/teacher/students"
                      className="text-brand-primary hover:text-ouro-texto text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>{t('see_all')}</span>
                      <PiCaretRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex gap-4 items-center justify-center">
                    <Inline
                      as="button"
                      gap={2}
                      onClick={() => setShowAddStudent(true)}
                      className="btn-classical-primary mx-auto"
                    >
                      <PiUserPlus className="w-4 h-4" />
                      <span>{t('add_student')}</span>
                    </Inline>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeStudents.slice(0, 5).map((studentRel, index) => (
                    <AnimatedItem
                      key={studentRel.relationshipId}
                      direction="left"
                      hover="lift"
                      style={{
                        animationDelay: `${index * 0.1}s`,
                        animationFillMode: 'backwards',
                      }}
                    >
                      <Card nivel={2} densidade="compacta" className="group">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12">
                            {studentRel.student.image ? (
                              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-ouro/20 group-hover:border-ouro/50 transition-all">
                                <Image
                                  src={studentRel.student.image}
                                  alt={studentRel.student.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full fill-ouro rounded-full flex items-center justify-center border-2 border-ouro/20 group-hover:border-ouro/50 transition-all">
                                <PiUsers className="w-6 h-6 text-theme-primary" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold text-theme-primary group-hover:text-ouro-texto transition-colors">
                              {studentRel.student.name}
                            </h3>
                            <Inline
                              gap={4}
                              className="text-sm text-theme-tertiary"
                            >
                              <span>
                                {t('level_label')}{' '}
                                {translateNivel(studentRel.student.level)}
                              </span>
                              {studentRel.student.mainInstrument && (
                                <span>
                                  • {studentRel.student.mainInstrument}
                                </span>
                              )}
                            </Inline>
                          </div>

                          <Inline gap={2}>
                            <span className="px-3 py-1 bg-ok/10 border border-ok/30 text-ok rounded-full text-xs font-medium">
                              {t('status_active')}
                            </span>
                            <Link
                              href={`/teacher/students/${studentRel.student.id}`}
                              className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-ouro transition-all flex items-center justify-center group/btn"
                            >
                              <PiEye className="w-4 h-4 text-theme-tertiary group-hover/btn:text-ouro-texto transition-colors" />
                            </Link>
                          </Inline>
                        </div>

                        {studentRel.nextLesson && (
                          <div className="mt-3 p-3 bg-theme-elevated rounded-lg ">
                            <div className="flex items-center justify-between">
                              <div>
                                <Text
                                  papel="rotulo"
                                  tom="forte"
                                  as="div"
                                  className="font-medium"
                                >
                                  {t('next_lesson')}
                                </Text>
                                <Text papel="legenda" tom="fraco" as="div">
                                  {formatDate(
                                    studentRel.nextLesson.scheduledAt
                                  )}{' '}
                                  {t('at_time')}{' '}
                                  {formatTime(
                                    studentRel.nextLesson.scheduledAt
                                  )}
                                </Text>
                              </div>
                              <PiClock className="w-4 h-4 text-brand-primary" />
                            </div>
                          </div>
                        )}
                      </Card>
                    </AnimatedItem>
                  ))}

                  {activeStudents.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-sup-2/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <PiUsers className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h3 className="text-lg font-bold text-theme-primary classical-title mb-2">
                        {t('no_students_yet')}
                      </h3>
                      <p className="text-theme-secondary max-w-sm mx-auto mb-4">
                        {t('no_students_description')}
                      </p>
                      <Inline
                        as="button"
                        gap={2}
                        onClick={() => setShowAddStudent(true)}
                        className="btn-classical-primary mx-auto"
                      >
                        <PiUserPlus className="w-4 h-4" />
                        <span>{t('add_first_student')}</span>
                      </Inline>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Inline gap={3} className="mb-4">
                  <div className="w-8 h-8 bg-aviso rounded-lg flex items-center justify-center">
                    <PiCalendarBlank className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('today_title')}
                    </h3>
                    <Text papel="legenda" tom="fraco" as="p">
                      {todayLessons.length} {t('lessons_scheduled')}
                    </Text>
                  </div>
                </Inline>

                <div className="space-y-3">
                  {todayLessons.slice(0, 4).map((lesson) => (
                    <Link
                      href={`/teacher/lessons/${lesson.id}`}
                      key={lesson.id}
                    >
                      <div className="classical-card-2 p-3">
                        <Inline gap={3}>
                          <div className="w-2 h-12 bg-ouro rounded-full"></div>
                          <div className="flex-1">
                            <Text
                              papel="rotulo"
                              tom="forte"
                              as="div"
                              className="font-medium"
                            >
                              {formatTime(lesson.scheduledAt)}
                            </Text>
                            <Text papel="legenda" tom="fraco" as="div">
                              {lesson.student?.name}
                            </Text>
                            <div className="text-xs text-aviso">
                              {lesson.duration}min
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded hover:bg-ouro/10 transition-colors flex items-center justify-center">
                            <PiEye className="w-3 h-3 text-theme-tertiary" />
                          </div>
                        </Inline>
                      </div>
                    </Link>
                  ))}

                  {todayLessons.length === 0 && (
                    <div className="text-center py-6">
                      <PiCalendarBlank className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <Text papel="rotulo" tom="fraco" as="p">
                        {t('no_lessons_today')}
                      </Text>
                    </div>
                  )}
                </div>

                {todayLessons.length > 0 && (
                  <Link
                    href="/teacher/calendar"
                    className="mt-4 block text-center text-brand-primary hover:text-ouro-texto text-sm font-medium transition-colors"
                  >
                    {t('view_full_schedule')}
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* 🆕 SEÇÃO ATUALIZADA - PRÓXIMAS AULAS DESTA SEMANA */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Inline gap={3} className="mb-4">
                  <div className="w-8 h-8 bg-ok rounded-lg flex items-center justify-center">
                    <PiClock className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('upcoming_lessons')}
                    </h3>
                    <Text papel="legenda" tom="fraco" as="p">
                      {t('this_week')} ({upcomingLessonsThisWeek.length}{' '}
                      {upcomingLessonsThisWeek.length === 1 ? 'aula' : 'aulas'})
                    </Text>
                  </div>
                </Inline>

                <div className="space-y-2">
                  {upcomingLessonsThisWeek.map((lesson) => (
                    <Link
                      href={`/teacher/lessons/${lesson.id}`}
                      key={lesson.id}
                    >
                      <div className="classical-card-2 p-3">
                        <Inline gap={3}>
                          <div className="w-2 h-12 bg-ouro rounded-full"></div>
                          <div className="flex-1">
                            <Text
                              papel="rotulo"
                              tom="forte"
                              as="div"
                              className="font-medium"
                            >
                              {formatTime(lesson.scheduledAt)}
                            </Text>
                            <Text papel="legenda" tom="fraco" as="div">
                              {lesson.student?.name}
                            </Text>
                            <div className="text-xs text-aviso">
                              {lesson.duration}min
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded hover:bg-ouro/10 transition-colors flex items-center justify-center">
                            <PiEye className="w-3 h-3 text-theme-tertiary" />
                          </div>
                        </Inline>
                      </div>
                    </Link>
                  ))}

                  {upcomingLessonsThisWeek.length === 0 && (
                    <div className="text-center py-4">
                      <Text papel="rotulo" tom="fraco" as="p">
                        Nenhuma aula agendada para esta semana
                      </Text>
                    </div>
                  )}
                </div>

                {upcomingLessonsThisWeek.length > 0 && (
                  <Link
                    href="/teacher/calendar"
                    className="mt-4 block text-center text-brand-primary hover:text-ouro-texto text-sm font-medium transition-colors"
                  >
                    Ver agenda completa
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            <RecentActivities userId={teacherProfile.id} userType="teacher" />
          </div>
        </div>
      </AnimatedContainer>

      <AddStudentModal
        addStudent={addStudent}
        handleSearchChange={handleSearchChange}
        isOpen={showAddStudent}
        loading={loading}
        onClose={onCloseModal}
        searchLoading={searchLoading}
        searchQuery={searchQuery}
        searchResults={searchResults}
      />
    </PageContainer>
  );
}
