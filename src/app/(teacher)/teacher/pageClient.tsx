// app/teacher/pageClient.tsx - Dashboard Completo do Professor (COM REFRESH)
'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiUsers,
  FiCalendar,
  FiPlus,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiXCircle,
  FiEye,
  FiBarChart2,
  FiActivity,
  FiChevronRight,
  FiRefreshCw,
  FiUserPlus,
  FiEdit3,
  FiTarget,
  FiUser,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../components/animation/AnimatedComponents';
import {
  TeacherDashboardData,
  TeacherStudentsData,
} from '@/app/requests/teacher-request';

import AddStudentModal from '@/app/components/TeacherSystem/AddStudentModal';
import StudentInviteStatusBadge from '@/app/components/TeacherSystem/StudentInviteStatusBadge';
import { useToast } from '@/app/hooks/useToast';
import { useTeacherData } from '@/app/hooks/lessonsSystem/useTeacherData';
import RefreshIndicator from '@/app/components/Common/RefreshIndicator';
import { translateNivel } from '@/app/utils';

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
  experienceLevel?: string;
  mainInstrument?: string;
  studentLevel?: string;
  isAlreadyStudent: boolean;
  relationshipId?: string;
  hasStudentProfile: boolean;
}

export default function TeacherPageClient({
  initialDashboardData,
  initialStudentsData,
  initialCalendarData,
  teacherProfile,
  errorMessage,
}: TeacherPageClientProps) {
  // ===== USAR O HOOK PERSONALIZADO =====
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

  // Estados para UI e busca
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(errorMessage);
  const [resendingInvites, setResendingInvites] = useState<Set<string>>(
    new Set()
  );

  const toast = useToast();

  // Combinar erros
  const currentError = error || dataError;

  const handleResendInvite = async (
    studentId: string,
    studentEmail?: string | null
  ) => {
    setResendingInvites((prev) => new Set(prev).add(studentId));

    if (!studentEmail) {
      toast.error('Estudante não possui email.');
      return;
    }
    try {
      const response = await fetch(
        `/api/teacher/students/${studentId}/resend-invite`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (response.ok) {
        toast.success(`Novo convite enviado para ${studentEmail}`);
      } else {
        throw new Error('Erro ao enviar convite');
      }
    } catch (error) {
      toast.error('Erro ao reenviar convite');
      console.error('Erro:', error);
    } finally {
      setResendingInvites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  // Usar dados do estado local ao invés de props diretas
  const stats = dashboardData?.dashboard?.stats || {
    totalStudents: 0,
    activeStudents: 0,
    lessonsThisWeek: 0,
    completionRate: 0,
    avgLessonsPerWeek: 0,
  };

  useEffect(() => {
    refreshData(false);
  }, []);

  const todayLessons = dashboardData?.dashboard?.todayLessons || [];
  const upcomingLessons =
    dashboardData?.dashboard?.upcomingLessons?.slice(0, 5) || [];
  const activeStudents =
    studentsData?.students?.filter((s) => s.relationship.isActive) || [];
  const recentActivities =
    dashboardData?.dashboard?.recentActivities?.slice(0, 5) || [];

  // Function to search students
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

  // Handle search input change with debounce
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);

      // Simple debounce
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

  // ===== FUNÇÃO ATUALIZADA DE ADICIONAR ALUNO (SEM RELOAD) =====
  const addStudent = useCallback(
    async (studentUserId: string) => {
      setLoading(true);
      setError(undefined);
      clearError(); // Limpar erros do hook também

      try {
        const response = await fetch('/api/teacher/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentUserId,
            maxLessonsPerWeek: 1,
            lessonDuration: 60,
            preferredDays: [],
            preferredTimes: [],
            learningPlan: '',
            currentFocus: [],
            teacherNotes: '',
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao adicionar aluno');
        }

        const data = await response.json();

        if (data.success) {
          toast.success('Aluno adicionado com sucesso!');

          // Fechar modal
          setShowAddStudent(false);
          setSearchQuery('');
          setSearchResults([]);

          // Atualizar dados sem reload
          await refreshData(false);
        }
      } catch (error) {
        console.error('Erro ao adicionar aluno:', error);
        const message = 'Erro ao adicionar aluno. Tente novamente.';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [refreshData, toast, clearError]
  );

  // Format time
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date
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

  // Render error state
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
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Dashboard do Professor
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <p className="text-xl text-theme-secondary classical-subtitle">
                Bem-vindo de volta, {teacherProfile.name}! Gerencie seus alunos
                e aulas
              </p>

              {/* ===== INDICADOR DE ATUALIZAÇÃO MELHORADO ===== */}
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

        {/* Stats Cards */}
        <AnimatedItem direction="up" springType="gentle">
          <SequentialGrid
            cols={4}
            gap={6}
            delayBetweenItems={0.1}
            className="mb-8"
          >
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiUsers className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalStudents}
              </div>
              <div className="text-sm text-theme-tertiary">Total de Alunos</div>
              <div className="text-xs text-accent-green mt-1">
                {stats.activeStudents} ativos
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCalendar className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.lessonsThisWeek}
              </div>
              <div className="text-sm text-theme-tertiary">
                Aulas Esta Semana
              </div>
              <div className="text-xs text-accent-blue mt-1">
                {todayLessons.length} hoje
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.completionRate}%
              </div>
              <div className="text-sm text-theme-tertiary">
                Taxa de Conclusão
              </div>
              <div className="text-xs text-accent-green mt-1">
                +5% vs mês anterior
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiBarChart2 className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.avgLessonsPerWeek}
              </div>
              <div className="text-sm text-theme-tertiary">Aulas/Semana</div>
              <div className="text-xs text-theme-tertiary mt-1">
                Média semanal
              </div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center">
                      <FiTarget className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-theme-primary classical-title">
                        Ações Rápidas
                      </h2>
                      <p className="text-theme-tertiary text-sm">
                        Gerencie suas atividades principais
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiUserPlus className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Adicionar Aluno
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Buscar e vincular novo aluno
                        </div>
                      </div>
                    </div>
                  </button>

                  <Link
                    href="/teacher/lessons/create"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiPlus className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Criar Aula
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Agendar nova aula
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/teacher/calendar"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiCalendar className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Ver Calendário
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Visualizar agenda completa
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/teacher/assignments"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiEdit3 className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Gerenciar Tarefas
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Criar e acompanhar tarefas
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/teacher/profile"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiUser className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Ver Perfil
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Gerenciar dados do perfil
                        </div>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/teacher/reviews"
                    className="classical-card-2 p-4 text-left hover:border-brand-primary transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FiBarChart2 className="w-4 h-4 text-theme-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                          Reviews
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Visualizar avaliações
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Students Section */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center">
                      <FiUsers className="w-5 h-5 text-theme-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-theme-primary classical-title">
                        Seus Alunos
                      </h2>
                      <p className="text-theme-tertiary text-sm">
                        {activeStudents.length} alunos ativos
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/teacher/students"
                    className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Ver todos</span>
                    <FiChevronRight className="w-4 h-4" />
                  </Link>
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
                          {/* Avatar */}
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

                          {/* Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-theme-primary group-hover:text-brand-primary transition-colors">
                              {studentRel.student.name}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-theme-tertiary">
                              <span>
                                Nível:{' '}
                                {translateNivel(studentRel.student.level)}
                              </span>
                              {studentRel.student.mainInstrument && (
                                <span>
                                  • {studentRel.student.mainInstrument}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2">
                            <StudentInviteStatusBadge
                              status={studentRel.relationship.inviteStatus}
                              acceptedAt={
                                studentRel.relationship.inviteAcceptedAt
                              }
                              declinedAt={
                                studentRel.relationship.inviteDeclinedAt
                              }
                              studentEmail={studentRel.student.email}
                              onResendInvite={() =>
                                handleResendInvite(
                                  studentRel.student.id,
                                  studentRel.student.email
                                )
                              }
                              isResending={resendingInvites.has(
                                studentRel.student.id
                              )}
                              compact={true}
                            />
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 text-accent-green rounded-full text-xs font-medium">
                              Ativo
                            </span>
                            <Link
                              href={`/teacher/students/${studentRel.student.id}`}
                              className="w-8 h-8 rounded-lg bg-theme-elevated border border-theme-secondary hover:border-brand-primary transition-all flex items-center justify-center group/btn"
                            >
                              <FiEye className="w-4 h-4 text-theme-tertiary group-hover/btn:text-brand-primary transition-colors" />
                            </Link>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-4 pt-4 border-t border-theme-secondary grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-brand-primary">
                              {studentRel.stats.totalLessons}
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              Total de Aulas
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-accent-green">
                              {studentRel.stats.completionRate}%
                            </div>
                            <div className="text-xs text-theme-tertiary">
                              Taxa de Conclusão
                            </div>
                          </div>
                        </div>

                        {/* Next Lesson */}
                        {studentRel.nextLesson && (
                          <div className="mt-3 p-3 bg-theme-elevated rounded-lg ">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-theme-primary">
                                  Próxima aula
                                </div>
                                <div className="text-xs text-theme-tertiary">
                                  {formatDate(
                                    studentRel.nextLesson.scheduledAt
                                  )}{' '}
                                  às{' '}
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
                        Nenhum aluno ainda
                      </h3>
                      <p className="text-theme-secondary max-w-sm mx-auto mb-4">
                        Comece adicionando seus primeiros alunos para começar a
                        usar a plataforma.
                      </p>
                      <button
                        onClick={() => setShowAddStudent(true)}
                        className="btn-classical-primary flex items-center space-x-2 mx-auto"
                      >
                        <FiUserPlus className="w-4 h-4" />
                        <span>Adicionar Primeiro Aluno</span>
                      </button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Schedule */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <FiCalendar className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">Hoje</h3>
                    <p className="text-xs text-theme-tertiary">
                      {todayLessons.length} aulas agendadas
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {todayLessons.slice(0, 4).map((lesson) => (
                    <div key={lesson.id} className="classical-card-2 p-3">
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
                        <Link
                          href={`/teacher/lessons/${lesson.id}`}
                          className="w-6 h-6 rounded bg-theme-elevated hover:bg-interactive-hover transition-colors flex items-center justify-center"
                        >
                          <FiEye className="w-3 h-3 text-theme-tertiary" />
                        </Link>
                      </div>
                    </div>
                  ))}

                  {todayLessons.length === 0 && (
                    <div className="text-center py-6">
                      <FiCalendar className="w-8 h-8 text-theme-tertiary mx-auto mb-2" />
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma aula hoje
                      </p>
                    </div>
                  )}
                </div>

                {todayLessons.length > 0 && (
                  <Link
                    href="/teacher/calendar"
                    className="mt-4 block text-center text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors"
                  >
                    Ver agenda completa
                  </Link>
                )}
              </AnimatedCard>
            </AnimatedItem>

            {/* Upcoming Lessons */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-lg flex items-center justify-center">
                    <FiClock className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Próximas Aulas
                    </h3>
                    <p className="text-xs text-theme-tertiary">Esta semana</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {upcomingLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between py-2 border-b border-theme-secondary last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-theme-primary">
                          {lesson.student?.name}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {formatDate(lesson.scheduledAt)} •{' '}
                          {formatTime(lesson.scheduledAt)}
                        </div>
                      </div>
                      <div className="text-xs text-accent-blue font-medium">
                        {lesson.duration}min
                      </div>
                    </div>
                  ))}

                  {upcomingLessons.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma aula agendada
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>

            {/* Recent Activity */}
            <AnimatedItem direction="up" springType="gentle">
              <AnimatedCard hover="lift" className="classical-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-lg flex items-center justify-center">
                    <FiActivity className="w-4 h-4 text-theme-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-theme-primary">
                      Atividade Recente
                    </h3>
                    <p className="text-xs text-theme-tertiary">Últimas ações</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-8 h-8 bg-theme-secondary rounded-full flex items-center justify-center flex-shrink-0">
                        {activity.type === 'lesson_completed' && (
                          <FiCheckCircle className="w-4 h-4 text-accent-green" />
                        )}
                        {activity.type === 'lesson_cancelled' && (
                          <FiXCircle className="w-4 h-4 text-accent-red" />
                        )}
                        {activity.type === 'student_added' && (
                          <FiUserPlus className="w-4 h-4 text-accent-blue" />
                        )}
                        {activity.type === 'note_added' && (
                          <FiEdit3 className="w-4 h-4 text-accent-purple" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-theme-primary">
                          {activity.title}
                        </div>
                        <div className="text-xs text-theme-tertiary">
                          {activity.description}
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentActivities.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-theme-tertiary">
                        Nenhuma atividade recente
                      </p>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </AnimatedItem>
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
