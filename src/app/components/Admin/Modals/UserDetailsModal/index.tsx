'use client';

import { useState, useEffect } from 'react';
import {
  FiX,
  FiUser,
  FiMail,
  FiActivity,
  FiFileText,
  FiUpload,
  FiHeart,
  FiClock,
  FiTrendingUp,
  FiAward,
  FiEdit3,
  FiTarget,
  FiMusic,
} from 'react-icons/fi';
import {
  AnimatedCard,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { AdminUser } from '@/app/hooks/admin/useAdminUsers';
import { formatNumber, formatDuration } from '@/app/hooks/admin/useAdminStats';
import Modal from '@/app/components/Modal';
import LoadingAdminState from '../../Common/LoadingState';

interface UserDetailsModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

interface UserDetailsData {
  profile: {
    totalFavoriteWorks: number;
    totalFavoriteComposers: number;
    totalAnnotations: number;
    totalStudySessions: number;
    lastActivity: string;
    joinedDaysAgo: number;
  };
  recentActivity: Array<{
    type: 'annotation' | 'study' | 'favorite' | 'upload';
    title: string;
    subtitle: string;
    date: string;
    workTitle?: string;
    composerName?: string;
  }>;
  contributions: {
    topAnnotations: Array<{
      id: string;
      workTitle: string;
      composerName: string;
      content: string;
      helpfulCount: number;
      createdAt: string;
    }>;
    recentUploads: Array<{
      id: string;
      type: 'composer' | 'work' | 'score';
      title: string;
      status: string;
      createdAt: string;
    }>;
  };
  studyHabits: {
    averageSessionDuration: number;
    mostStudiedComposer: string;
    mostStudiedWork: string;
    preferredPracticeTimes: string[];
    longestStreak: number;
    currentStreak: number;
  };
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'activity' | 'contributions' | 'study'
  >('overview');
  const [detailsData, setDetailsData] = useState<UserDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user.id) {
      fetchUserDetails();
    }
  }, [isOpen, user.id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/users/details?userId=${user.id}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar detalhes do usuário');
      }

      const data = await response.json();

      if (data.success) {
        setDetailsData(data.details);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  console.log('USERRR', user);

  const formatUserType = (type?: string) => {
    switch (type) {
      case 'MUSIC_STUDENT':
        return 'Estudante de Música';
      case 'CASUAL_USER':
        return 'Usuário Casual';
      case 'PROFESSIONAL':
        return 'Profissional';
      case 'TEACHER':
        return 'Professor';
      default:
        return 'Não Definido';
    }
  };

  const formatExperienceLevel = (level?: string) => {
    switch (level) {
      case 'BEGINNER':
        return 'Iniciante';
      case 'INTERMEDIATE':
        return 'Intermediário';
      case 'ADVANCED':
        return 'Avançado';
      default:
        return 'Não Definido';
    }
  };

  const formatRole = (role: number) => {
    switch (role) {
      case 0:
        return 'Usuário';
      case 1:
        return 'Professor';
      case 2:
        return 'Super Admin';
      default:
        return 'Desconhecido';
    }
  };

  const getRoleColor = (role: number) => {
    switch (role) {
      case 0:
        return 'text-theme-tertiary';
      case 1:
        return 'text-accent-blue';
      case 2:
        return 'text-accent-red';
      default:
        return 'text-theme-tertiary';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-theme-primary">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-theme-primary font-bold text-lg">
            {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-theme-primary">
              {user.name || 'Usuário Sem Nome'}
            </h2>
            <p className="text-theme-tertiary">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-theme-primary bg-theme-secondary">
        {[
          { id: 'overview', label: 'Visão Geral', icon: FiUser },
          { id: 'activity', label: 'Atividade', icon: FiActivity },
          { id: 'contributions', label: 'Contribuições', icon: FiUpload },
          { id: 'study', label: 'Estudos', icon: FiTarget },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'text-accent-blue border-b-2 border-accent-blue bg-theme-background'
                : 'text-theme-tertiary hover:text-theme-primary'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {loading ? (
          <LoadingAdminState loadingName="detalhes" />
        ) : error ? (
          <div className="text-center py-12">
            <FiUser className="w-12 h-12 text-accent-red mx-auto mb-4" />
            <h3 className="text-lg font-bold text-theme-primary mb-2">
              Erro ao Carregar
            </h3>
            <p className="text-theme-secondary mb-4">{error}</p>
            <Button variant="secondary" onClick={fetchUserDetails}>
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Informações Pessoais */}
                <AnimatedCard className="classical-card p-4">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-accent-blue" />
                    Informações Pessoais
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4 text-theme-tertiary" />
                        <span className="text-sm text-theme-tertiary">
                          Nome:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {user.name || 'Não informado'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-theme-tertiary" />
                        <span className="text-sm text-theme-tertiary">
                          Email:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {user.email}
                        </span>
                      </div>

                      {user.username && (
                        <div className="flex items-center gap-2">
                          <FiUser className="w-4 h-4 text-theme-tertiary" />
                          <span className="text-sm text-theme-tertiary">
                            Username:
                          </span>
                          <span className="text-theme-primary font-medium">
                            @{user.username}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FiAward className="w-4 h-4 text-theme-tertiary" />
                        <span className="text-sm text-theme-tertiary">
                          Tipo:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {formatUserType(user.userType)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4 text-theme-tertiary" />
                        <span className="text-sm text-theme-tertiary">
                          Experiência:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {formatExperienceLevel(user.experienceLevel)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiAward
                          className={`w-4 h-4 ${getRoleColor(user.role || 0)}`}
                        />
                        <span className="text-sm text-theme-tertiary">
                          Role:
                        </span>
                        <span
                          className={`font-medium ${getRoleColor(
                            user.role || 0
                          )}`}
                        >
                          {formatRole(user.role || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>

                {/* Estatísticas Resumidas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-theme-secondary p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-accent-blue mb-1">
                      {formatDuration(user.totalStudyTime)}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Tempo de Estudo
                    </div>
                  </div>

                  <div className="bg-theme-secondary p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-accent-green mb-1">
                      {formatNumber(user.annotationsCount)}
                    </div>
                    <div className="text-sm text-theme-tertiary">Anotações</div>
                  </div>

                  <div className="bg-theme-secondary p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-accent-purple mb-1">
                      {formatNumber(user.uploadsCount)}
                    </div>
                    <div className="text-sm text-theme-tertiary">Uploads</div>
                  </div>

                  <div className="bg-theme-secondary p-4 rounded-xl text-center">
                    <div className="text-2xl font-bold text-accent-amber mb-1">
                      {user.uploadScore}
                    </div>
                    <div className="text-sm text-theme-tertiary">
                      Score Upload
                    </div>
                  </div>
                </div>

                {/* Status e Configurações */}
                <AnimatedCard className="classical-card p-4">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-accent-green" />
                    Status da Conta
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-theme-tertiary">Onboarding:</span>
                        <span
                          className={`font-medium ${
                            user.onboardingCompleted
                              ? 'text-accent-green'
                              : 'text-accent-amber'
                          }`}
                        >
                          {user.onboardingCompleted ? 'Completo' : 'Pendente'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-theme-tertiary">
                          Perfil Público:
                        </span>
                        <span
                          className={`font-medium ${
                            user.isProfilePublic
                              ? 'text-accent-green'
                              : 'text-theme-tertiary'
                          }`}
                        >
                          {user.isProfilePublic ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-theme-tertiary">
                          Cadastrado em:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-theme-tertiary">
                          Última Atividade:
                        </span>
                        <span className="text-theme-primary font-medium">
                          {new Date(user.lastActive).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="space-y-6">
                {detailsData?.recentActivity ? (
                  <AnimatedCard className="classical-card p-4">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiActivity className="w-5 h-5 text-accent-blue" />
                      Atividade Recente
                    </h3>

                    <div className="space-y-4">
                      {detailsData.recentActivity
                        .slice(0, 10)
                        .map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-3 bg-theme-secondary rounded-lg"
                          >
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                activity.type === 'annotation'
                                  ? 'bg-accent-green/20 text-accent-green'
                                  : activity.type === 'study'
                                  ? 'bg-accent-blue/20 text-accent-blue'
                                  : activity.type === 'favorite'
                                  ? 'bg-accent-red/20 text-accent-red'
                                  : 'bg-accent-purple/20 text-accent-purple'
                              }`}
                            >
                              {activity.type === 'annotation' && (
                                <FiFileText className="w-4 h-4" />
                              )}
                              {activity.type === 'study' && (
                                <FiClock className="w-4 h-4" />
                              )}
                              {activity.type === 'favorite' && (
                                <FiHeart className="w-4 h-4" />
                              )}
                              {activity.type === 'upload' && (
                                <FiUpload className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-theme-primary">
                                {activity.title}
                              </p>
                              <p className="text-sm text-theme-tertiary">
                                {activity.subtitle}
                              </p>
                              {activity.workTitle && (
                                <p className="text-sm text-accent-blue">
                                  {activity.composerName} - {activity.workTitle}
                                </p>
                              )}
                              <p className="text-xs text-theme-quaternary mt-1">
                                {new Date(activity.date).toLocaleString(
                                  'pt-BR'
                                )}
                              </p>
                            </div>
                          </div>
                        ))}

                      {detailsData.recentActivity.length === 0 && (
                        <div className="text-center py-8">
                          <FiActivity className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                          <p className="text-theme-secondary">
                            Nenhuma atividade recente encontrada
                          </p>
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                ) : (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            )}

            {/* Contributions Tab */}
            {activeTab === 'contributions' && (
              <div className="space-y-6">
                {/* Top Anotações */}
                <AnimatedCard className="classical-card p-4">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-accent-green" />
                    Melhores Anotações
                  </h3>

                  {detailsData?.contributions.topAnnotations ? (
                    <div className="space-y-4">
                      {detailsData.contributions.topAnnotations
                        .slice(0, 5)
                        .map((annotation, index) => (
                          <div
                            key={annotation.id}
                            className="p-3 bg-theme-secondary rounded-lg"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-theme-primary truncate">
                                  {annotation.composerName} -{' '}
                                  {annotation.workTitle}
                                </p>
                                <p className="text-sm text-theme-tertiary mt-1">
                                  {annotation.content.length > 100
                                    ? `${annotation.content.substring(
                                        0,
                                        100
                                      )}...`
                                    : annotation.content}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-accent-green font-medium">
                                  {annotation.helpfulCount} úteis
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-theme-quaternary">
                              {new Date(annotation.createdAt).toLocaleString(
                                'pt-BR'
                              )}
                            </p>
                          </div>
                        ))}

                      {detailsData.contributions.topAnnotations.length ===
                        0 && (
                        <div className="text-center py-8">
                          <FiFileText className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                          <p className="text-theme-secondary">
                            Nenhuma anotação encontrada
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <LoadingSpinner />
                  )}
                </AnimatedCard>

                {/* Uploads Recentes */}
                <AnimatedCard className="classical-card p-4">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiUpload className="w-5 h-5 text-accent-purple" />
                    Uploads Recentes
                  </h3>

                  {detailsData?.contributions.recentUploads ? (
                    <div className="space-y-3">
                      {detailsData.contributions.recentUploads
                        .slice(0, 5)
                        .map((upload, index) => (
                          <div
                            key={upload.id}
                            className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  upload.type === 'composer'
                                    ? 'bg-accent-blue/20 text-accent-blue'
                                    : upload.type === 'work'
                                    ? 'bg-accent-green/20 text-accent-green'
                                    : 'bg-accent-purple/20 text-accent-purple'
                                }`}
                              >
                                {upload.type === 'composer' && (
                                  <FiUser className="w-4 h-4" />
                                )}
                                {upload.type === 'work' && (
                                  <FiMusic className="w-4 h-4" />
                                )}
                                {upload.type === 'score' && (
                                  <FiFileText className="w-4 h-4" />
                                )}
                              </div>

                              <div>
                                <p className="font-medium text-theme-primary">
                                  {upload.title}
                                </p>
                                <p className="text-sm text-theme-tertiary">
                                  {upload.type === 'composer'
                                    ? 'Compositor'
                                    : upload.type === 'work'
                                    ? 'Obra'
                                    : 'Partitura'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  upload.status === 'approved'
                                    ? 'bg-accent-green/20 text-accent-green'
                                    : upload.status === 'pending'
                                    ? 'bg-accent-amber/20 text-accent-amber'
                                    : 'bg-accent-red/20 text-accent-red'
                                }`}
                              >
                                {upload.status === 'approved'
                                  ? 'Aprovado'
                                  : upload.status === 'pending'
                                  ? 'Pendente'
                                  : 'Rejeitado'}
                              </span>
                              <p className="text-xs text-theme-quaternary mt-1">
                                {new Date(upload.createdAt).toLocaleDateString(
                                  'pt-BR'
                                )}
                              </p>
                            </div>
                          </div>
                        ))}

                      {detailsData.contributions.recentUploads.length === 0 && (
                        <div className="text-center py-8">
                          <FiUpload className="w-12 h-12 text-theme-tertiary mx-auto mb-4" />
                          <p className="text-theme-secondary">
                            Nenhum upload encontrado
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <LoadingSpinner />
                  )}
                </AnimatedCard>
              </div>
            )}

            {/* Study Tab */}
            {activeTab === 'study' && (
              <div className="space-y-6">
                {detailsData?.studyHabits ? (
                  <>
                    {/* Hábitos de Estudo */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-theme-secondary p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-accent-blue mb-1">
                          {formatDuration(
                            detailsData.studyHabits.averageSessionDuration
                          )}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Sessão Média
                        </div>
                      </div>

                      <div className="bg-theme-secondary p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-accent-green mb-1">
                          {detailsData.studyHabits.currentStreak}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Sequência Atual
                        </div>
                      </div>

                      <div className="bg-theme-secondary p-4 rounded-xl text-center">
                        <div className="text-2xl font-bold text-accent-purple mb-1">
                          {detailsData.studyHabits.longestStreak}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Maior Sequência
                        </div>
                      </div>

                      <div className="bg-theme-secondary p-4 rounded-xl text-center">
                        <div className="text-lg font-bold text-accent-amber mb-1">
                          {detailsData.profile.totalStudySessions}
                        </div>
                        <div className="text-sm text-theme-tertiary">
                          Total de Sessões
                        </div>
                      </div>
                    </div>

                    {/* Preferências de Estudo */}
                    <AnimatedCard className="classical-card p-4">
                      <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                        <FiTarget className="w-5 h-5 text-accent-blue" />
                        Preferências de Estudo
                      </h3>

                      <div className="space-y-4">
                        {detailsData.studyHabits.mostStudiedComposer && (
                          <div className="flex items-center justify-between">
                            <span className="text-theme-tertiary">
                              Compositor Favorito:
                            </span>
                            <span className="text-theme-primary font-medium">
                              {detailsData.studyHabits.mostStudiedComposer}
                            </span>
                          </div>
                        )}

                        {detailsData.studyHabits.mostStudiedWork && (
                          <div className="flex items-center justify-between">
                            <span className="text-theme-tertiary">
                              Obra Mais Estudada:
                            </span>
                            <span className="text-theme-primary font-medium">
                              {detailsData.studyHabits.mostStudiedWork}
                            </span>
                          </div>
                        )}

                        {detailsData.studyHabits.preferredPracticeTimes.length >
                          0 && (
                          <div>
                            <span className="text-theme-tertiary">
                              Horários Preferidos:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {detailsData.studyHabits.preferredPracticeTimes.map(
                                (time, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm"
                                  >
                                    {time}
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </AnimatedCard>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-primary bg-theme-secondary">
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
