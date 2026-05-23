// app/teacher/pageClient.tsx - ATUALIZADO com filtro semanal para próximas aulas

'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiXCircle,
  FiEye,
  FiChevronRight,
  FiRefreshCw,
  FiUserPlus,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../components/animation/AnimatedComponents';
import {
  TeacherDashboardData,
  TeacherStudentsData,
} from '@/app/requests/teacher-request';

import AddStudentModal from '@/app/components/TeacherSystem/AddStudentModal';
import { useToast } from '@/app/hooks/useToast';
import { useTeacherData } from '@/app/hooks/lessonsSystem/useTeacherData';
import RefreshIndicator from '@/app/components/Common/RefreshIndicator';
import { translateNivel } from '@/app/utils';
import RecentActivities from '@/app/components/TeacherSystem/RecentActivities';
import { useTranslation } from '@/app/context/TranslationContext';

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
      const response = await fetch(
        `/api/teacher/students/search?email=${encodeURIComponent(
          email
        )}&limit=10`
      );

      if (!response.ok) {
        throw new Error('Erro na busca');
      }

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.students || []);
      } else {
        setSearchResults([]);
      }
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

        const payload = {
          studentUserId,
          maxLessonsPerWeek: studyPlan?.maxLessonsPerWeek || 1,
          lessonDuration: studyPlan?.lessonDuration || 60,
          preferredDays: studyPlan?.preferredDays || [],
          preferredTimes: studyPlan?.preferredTimes || [],
          learningPlan: studyPlan?.learningPlan || '',
          currentFocus: studyPlan?.currentFocus || [],
          teacherNotes: studyPlan?.teacherNotes || '',
          studyGoals: studyPlan?.studyGoals || '',
          practiceFrequency: studyPlan?.practiceFrequency || '',
          homeworkExpectation: studyPlan?.homeworkExpectation || '',
          specialInstructions: studyPlan?.specialInstructions || '',
        };

        console.log('📤 [TEACHER-DASHBOARD] Enviando payload:', payload);

        const response = await fetch('/api/teacher/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao adicionar aluno');
        }

        const data = await response.json();

        if (data.success) {
          console.log('✅ [TEACHER-DASHBOARD] Aluno adicionado com sucesso!', {
            relationship: data.relationship?.id,
            inviteEmailSent: data.inviteEmailSent,
            message: data.message,
          });

          toast.success(data.message || 'Aluno adicionado com sucesso!');
          setShowAddStudent(false);
          setSearchQuery('');
          setSearchResults([]);
          await refreshData(false);
        } else {
          throw new Error(data.error || 'Erro desconhecido');
        }
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
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiXCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Dashboard
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {currentError}
            </p>
            <div className="flex flex-col items-center space-y-3">
              <button
                onClick={() => {
                  refreshData(true);
                }}
                disabled={refreshing}
                className="btn-classical-primary flex justify-center items-center space-x-2"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                <span>
                  {refreshing ? 'Atualizando...' : 'Tentar Novamente'}
                </span>
              </button>
              {currentError !== errorMessage && (
                <button
                  onClick={() => {
                    setError(undefined);
                    clearError();
                  }}
                  className="btn-classical-secondary text-sm"
                >
                  Fechar Erro
                </button>
              )}
            </div>
          </div>
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
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
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
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                        <FiUsers className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-theme-primary classical-title">
                          {t('your_students_title')}
                        </h2>
                        <p className="text-theme-tertiary text-sm">
                          {activeStudents.length} {t('active_students')}
                        </p>
                      </div>
                    </div>

                    <Link
                      href="/teacher/students"
                      className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                    >
                      <span>{t('see_all')}</span>
                      <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="flex gap-4 items-center justify-center">
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="btn-classical-primary flex items-center space-x-2 mx-auto"
                    >
                      <FiUserPlus className="w-4 h-4" />
                      <span>{t('add_student')}</span>
                    </button>
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
                      <div className="classical-card-2 p-4 group">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12">
                            {studentRel.student.image ? (
                              <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                                <Image
                                  src={studentRel.student.image}
                                  alt={studentRel.student.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                                <FiUsers className="w-6 h-6 text-theme-primary" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <h3 className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                              {studentRel.student.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
                              <span>
                                {t('level_label')}{' '}
                                {translateNivel(studentRel.student.level)}
                              </span>
                              {studentRel.student.mainInstrument && (
                                <span>
                                  • {studentRel.student.mainInstrument}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                              {t('status_active')}
                            </span>
                            <Link
                              href={`/teacher/students/${studentRel.student.id}`}
                              className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group/btn"
                            >
                              <FiEye className="w-4 h-4 text-theme-tertiary group-hover/btn:text-brand-primary transition-colors" />
                            </Link>
                          </div>
                        </div>

                        {studentRel.nextLesson && (
                          <div className="mt-3 p-3 bg-theme-elevated rounded-lg ">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-theme-primary">
                                  {t('next_lesson')}
                                </div>
                                <div className="text-xs text-theme-tertiary">
                                  {formatDate(
                                    studentRel.nextLesson.scheduledAt
                                  )}{' '}
                                  {t('at_time')}{' '}
                                  {formatTime(
                                    studentRel.nextLesson.scheduledAt
                                  )}
                                </div>
                              </div>
                              <FiClock className="w-4 h-4 text-brand-primary" />
                            </div>
                          </div>
                        )}
                      </div>
                    </AnimatedItem>
                  ))}

                  {activeStudents.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-theme-tertiary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FiUsers className="w-8 h-8 text-theme-tertiary" />
                      </div>
                      <h3 className="text-lg font-bold text-theme-primary classical-title mb-2">
                        {t('no_students_yet')}
                      </h3>
                      <p className="text-theme-secondary max-w-sm mx-auto mb-4">
                        {t('no_students_description')}
                      </p>
                      <button
                        onClick={() => setShowAddStudent(true)}
                        className="btn-classical-primary flex items-center space-x-2 mx-auto"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        <span>{t('add_first_student')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('today_title')}
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {todayLessons.length} {t('lessons_scheduled')}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {todayLessons.slice(0, 4).map((lesson) => (
                    <Link
                      href={`/teacher/lessons/${lesson.id}`}
                      key={lesson.id}
                    >
                      <div className="classical-card-2 p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-12 bg-brand-primary rounded-full"></div>
                          <div className="flex-1">
                            <div className="font-medium text-theme-primary text-sm">
                              {formatTime(lesson.scheduledAt)}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              {lesson.student?.name}
                            </div>
                            <div className="text-xs text-accent-blue">
                              {lesson.duration}min
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded hover:bg-interactive-hover transition-colors flex items-center justify-center">
                            <FiEye className="w-3 h-3 text-theme-tertiary" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {todayLessons.length === 0 && (
                    <div className="text-center py-6">
                      <FiCalendar className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        {t('no_lessons_today')}
                      </p>
                    </div>
                  )}
                </div>

                {todayLessons.length > 0 && (
                  <Link
                    href="/teacher/calendar"
                    className="mt-4 block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                  >
                    {t('view_full_schedule')}
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* 🆕 SEÇÃO ATUALIZADA - PRÓXIMAS AULAS DESTA SEMANA */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiClock className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      {t('upcoming_lessons')}
                    </h3>
                    <p className="text-xs text-theme-tertiary">
                      {t('this_week')} ({upcomingLessonsThisWeek.length}{' '}
                      {upcomingLessonsThisWeek.length === 1 ? 'aula' : 'aulas'})
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {upcomingLessonsThisWeek.map((lesson) => (
                    <Link
                      href={`/teacher/lessons/${lesson.id}`}
                      key={lesson.id}
                    >
                      <div className="classical-card-2 p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-12 bg-brand-primary rounded-full"></div>
                          <div className="flex-1">
                            <div className="font-medium text-theme-primary text-sm">
                              {formatTime(lesson.scheduledAt)}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              {lesson.student?.name}
                            </div>
                            <div className="text-xs text-accent-blue">
                              {lesson.duration}min
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded hover:bg-interactive-hover transition-colors flex items-center justify-center">
                            <FiEye className="w-3 h-3 text-theme-tertiary" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {upcomingLessonsThisWeek.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma aula agendada para esta semana
                      </p>
                    </div>
                  )}
                </div>

                {upcomingLessonsThisWeek.length > 0 && (
                  <Link
                    href="/teacher/calendar"
                    className="mt-4 block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
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
