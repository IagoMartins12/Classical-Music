'use client';

import { useState, useEffect } from 'react';
import {
  FiUser,
  FiActivity,
  FiFileText,
  FiHeart,
  FiMusic,
  FiAward,
  FiClock,
  FiMapPin,
  FiPhone,
  FiBookOpen,
  FiTarget,
  FiCheckCircle,
  FiUsers,
} from 'react-icons/fi';
import { AnimatedCard } from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { AdminUser } from '@/app/hooks/admin/useAdminUsers';
import Modal from '@/app/components/Modal';
import LoadingAdminState from '../../Common/LoadingState';
import { formatNumber } from '../../Utils';
import Image from 'next/image';

interface UserDetailsModalProps {
  user: AdminUser;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedUserData {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  image?: string;
  bio?: string;
  role: number;
  userType?: string;
  experienceLevel?: string;
  onboardingCompleted: boolean;
  profilePublic: boolean;
  showLocation: boolean;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  favoriteComposerId?: string;
  favoriteComposer?: {
    id: string;
    name: string;
    portraitUrl?: string;
    epochName?: string;
  };
  favoriteEpochId?: string;
  favoriteEpoch?: {
    id: string;
    name: string;
  };
  practiceTimePerWeek?: number;
  createdAt: Date;
  updatedAt: Date;
  joinedDaysAgo: number;
  lastSeenMinutesAgo: number;
  isOnline: boolean;
  lastActivity: Date;
  stats: {
    totalAnnotations: number;
    helpfulAnnotations: number;
    totalUploads: number;
    totalFavorites: number;
    annotationsCount: number;
    uploadScore: number;
  };
  favoriteComposers: Array<{
    composer: {
      id: string;
      name: string;
      portraitUrl?: string;
      epochName?: string;
    };
  }>;
  favoriteWorks: Array<{
    work: {
      id: string;
      title: string;
      composer: {
        name: string;
      };
    };
  }>;
  favoriteScores: Array<{
    id: string;
    scoreTitle: string;
    personalRating?: number;
    work: {
      title: string;
      composer: {
        name: string;
      };
    };
  }>;
  instruments: Array<{
    instrument: {
      id: string;
      name: string;
      category?: string;
    };
    level: string;
    isPrimary: boolean;
  }>;
  wantToLearn: Array<{
    work: {
      id: string;
      title: string;
      composer: {
        name: string;
      };
    };
    priority: number;
  }>;
  learned: Array<{
    work: {
      id: string;
      title: string;
      composer: {
        name: string;
      };
    };
    mastery: number;
  }>;
  annotations: Array<{
    id: string;
    title: string;
    content: string;
    helpfulCount: number;
    work: {
      title: string;
      composer: {
        name: string;
      };
    };
  }>;
  teacherProfile?: any;
  studentProfile?: any;
  isTeacher?: boolean;
  isStudent?: boolean;
}

export default function UserDetailsModal({
  user,
  isOpen,
  onClose,
}: UserDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'favorites'
    | 'learning'
    | 'annotations'
    | 'instruments'
    | 'profiles'
  >('overview');
  const [detailsData, setDetailsData] = useState<DetailedUserData | null>(null);
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
        { cache: 'no-store' }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar detalhes do usuário');
      }

      const data = await response.json();

      if (data.success) {
        setDetailsData(data.user);
      } else {
        throw new Error(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatUserType = (type?: string) => {
    const types: Record<string, string> = {
      MUSIC_STUDENT: 'Estudante de Música',
      CASUAL_USER: 'Usuário Casual',
      PROFESSIONAL: 'Profissional',
      TEACHER: 'Professor',
    };
    return types[type || ''] || 'Não Definido';
  };

  const formatExperienceLevel = (level?: string) => {
    const levels: Record<string, string> = {
      BEGINNER: 'Iniciante',
      INTERMEDIATE: 'Intermediário',
      ADVANCED: 'Avançado',
    };
    return levels[level || ''] || 'Não Definido';
  };

  const formatLastSeen = (minutesAgo: number) => {
    if (minutesAgo < 1) return 'Agora mesmo';
    if (minutesAgo < 60) return `Há ${minutesAgo} minutos`;
    const hoursAgo = Math.floor(minutesAgo / 60);
    if (hoursAgo < 24) return `Há ${hoursAgo} horas`;
    const daysAgo = Math.floor(hoursAgo / 24);
    return `Há ${daysAgo} dias`;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="5xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-theme-primary">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center text-theme-primary font-bold text-2xl">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            {detailsData?.isOnline && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-accent-green rounded-full border-2 border-theme-background"></div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary">
              {user.name || 'Usuário Sem Nome'}
            </h2>
            <p className="text-theme-tertiary">{user.email}</p>
            {detailsData && (
              <p className="text-sm text-theme-quaternary flex items-center gap-2 mt-1">
                <FiClock className="w-4 h-4" />
                {detailsData.isOnline
                  ? '🟢 Online agora'
                  : formatLastSeen(detailsData.lastSeenMinutesAgo)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-theme-primary bg-theme-secondary">
        {[
          { id: 'overview', label: 'Visão Geral', icon: FiUser },
          { id: 'favorites', label: 'Favoritos', icon: FiHeart },
          { id: 'learning', label: 'Aprendizado', icon: FiBookOpen },
          { id: 'annotations', label: 'Anotações', icon: FiFileText },
          { id: 'instruments', label: 'Instrumentos', icon: FiMusic },
          { id: 'profiles', label: 'Perfis', icon: FiUsers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
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
      <div className="p-6 overflow-y-auto max-h-[70vh]">
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
        ) : detailsData ? (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <AnimatedCard className="classical-card p-5">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiUser className="w-5 h-5 text-accent-blue" />
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-theme-tertiary mb-1">
                          Nome Completo
                        </p>
                        <p className="text-theme-primary font-medium">
                          {`${detailsData.firstName || ''} ${detailsData.lastName || ''}`.trim() ||
                            'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-theme-tertiary mb-1">
                          Username
                        </p>
                        <p className="text-theme-primary font-medium">
                          {detailsData.username
                            ? `@${detailsData.username}`
                            : 'Não informado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-theme-tertiary mb-1">
                          Email
                        </p>
                        <p className="text-theme-primary font-medium break-all">
                          {detailsData.email}
                        </p>
                      </div>
                      {detailsData.phone && (
                        <div>
                          <p className="text-xs text-theme-tertiary mb-1 flex items-center gap-1">
                            <FiPhone className="w-3 h-3" /> Telefone
                          </p>
                          <p className="text-theme-primary font-medium">
                            {detailsData.phone}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-theme-tertiary mb-1">
                          Tipo de Usuário
                        </p>
                        <p className="text-theme-primary font-medium">
                          {formatUserType(detailsData.userType)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-theme-tertiary mb-1">
                          Nível de Experiência
                        </p>
                        <p className="text-theme-primary font-medium">
                          {formatExperienceLevel(detailsData.experienceLevel)}
                        </p>
                      </div>
                      {(detailsData.city ||
                        detailsData.state ||
                        detailsData.country) && (
                        <div>
                          <p className="text-xs text-theme-tertiary mb-1 flex items-center gap-1">
                            <FiMapPin className="w-3 h-3" /> Localização
                          </p>
                          <p className="text-theme-primary font-medium">
                            {[
                              detailsData.city,
                              detailsData.state,
                              detailsData.country,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>
                      )}
                      {detailsData.practiceTimePerWeek && (
                        <div>
                          <p className="text-xs text-theme-tertiary mb-1">
                            Tempo de Prática Semanal
                          </p>
                          <p className="text-theme-primary font-medium">
                            {detailsData.practiceTimePerWeek} minutos
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {detailsData.bio && (
                    <div className="mt-4 pt-4 border-t border-theme-primary">
                      <p className="text-xs text-theme-tertiary mb-2">
                        Biografia
                      </p>
                      <p className="text-theme-primary">{detailsData.bio}</p>
                    </div>
                  )}
                </AnimatedCard>

                {(detailsData.favoriteComposer ||
                  detailsData.favoriteEpoch) && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiAward className="w-5 h-5 text-accent-purple" />
                      Preferências Musicais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailsData.favoriteComposer && (
                        <div className="p-4 bg-theme-secondary rounded-lg">
                          <p className="text-xs text-theme-tertiary mb-2">
                            Compositor Favorito
                          </p>
                          <div className="flex items-center gap-3">
                            {detailsData.favoriteComposer.portraitUrl && (
                              <Image
                                src={detailsData.favoriteComposer.portraitUrl}
                                alt={detailsData.favoriteComposer.name}
                                className="w-12 h-12 rounded-lg object-cover"
                                width={15}
                                height={15}
                              />
                            )}
                            <div>
                              <p className="font-bold text-theme-primary">
                                {detailsData.favoriteComposer.name}
                              </p>
                              {detailsData.favoriteComposer.epochName && (
                                <p className="text-sm text-theme-tertiary">
                                  {detailsData.favoriteComposer.epochName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {detailsData.favoriteEpoch && (
                        <div className="p-4 bg-theme-secondary rounded-lg">
                          <p className="text-xs text-theme-tertiary mb-2">
                            Época Favorita
                          </p>
                          <p className="font-bold text-theme-primary text-lg">
                            {detailsData.favoriteEpoch.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </AnimatedCard>
                )}

                <AnimatedCard className="classical-card p-5">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <FiActivity className="w-5 h-5 text-accent-green" />
                    Estatísticas de Atividade
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-theme-secondary rounded-lg">
                      <div className="text-3xl font-bold text-accent-green mb-1">
                        {formatNumber(detailsData.stats.totalAnnotations)}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Anotações
                      </div>
                      <div className="text-xs text-accent-green mt-1">
                        {detailsData.stats.helpfulAnnotations} úteis
                      </div>
                    </div>
                    <div className="text-center p-4 bg-theme-secondary rounded-lg">
                      <div className="text-3xl font-bold text-accent-purple mb-1">
                        {formatNumber(detailsData.stats.totalUploads)}
                      </div>
                      <div className="text-sm text-theme-tertiary">Uploads</div>
                      <div className="text-xs text-accent-purple mt-1">
                        Score: {detailsData.stats.uploadScore}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-theme-secondary rounded-lg">
                      <div className="text-3xl font-bold text-accent-red mb-1">
                        {formatNumber(detailsData.stats.totalFavorites)}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Favoritos
                      </div>
                    </div>
                    <div className="text-center p-4 bg-theme-secondary rounded-lg">
                      <div className="text-3xl font-bold text-accent-blue mb-1">
                        {detailsData.joinedDaysAgo}
                      </div>
                      <div className="text-sm text-theme-tertiary">
                        Dias na plataforma
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div className="space-y-6">
                {detailsData.favoriteComposers.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiMusic className="w-5 h-5 text-accent-blue" />
                      Compositores Favoritos (
                      {detailsData.favoriteComposers.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {detailsData.favoriteComposers.map((fav, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-theme-secondary rounded-lg"
                        >
                          {fav.composer.portraitUrl && (
                            <Image
                              src={fav.composer.portraitUrl}
                              alt={fav.composer.name}
                              className="w-12 h-12 rounded-lg object-cover"
                              width={15}
                              height={15}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary truncate">
                              {fav.composer.name}
                            </p>
                            {fav.composer.epochName && (
                              <p className="text-sm text-theme-tertiary">
                                {fav.composer.epochName}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {detailsData.favoriteWorks.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiHeart className="w-5 h-5 text-accent-red" />
                      Obras Favoritas ({detailsData.favoriteWorks.length})
                    </h3>
                    <div className="space-y-2">
                      {detailsData.favoriteWorks.map((fav, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg"
                        >
                          <p className="font-medium text-theme-primary">
                            {fav.work.title}
                          </p>
                          <p className="text-sm text-theme-tertiary">
                            {fav.work.composer.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {detailsData.favoriteScores.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiFileText className="w-5 h-5 text-accent-purple" />
                      Partituras Favoritas ({detailsData.favoriteScores.length})
                    </h3>
                    <div className="space-y-2">
                      {detailsData.favoriteScores.map((score, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-theme-primary">
                                {score.scoreTitle}
                              </p>
                              <p className="text-sm text-theme-tertiary">
                                {score.work.composer.name} - {score.work.title}
                              </p>
                            </div>
                            {score.personalRating && (
                              <div className="flex items-center gap-1 text-accent-amber">
                                {Array.from({
                                  length: score.personalRating,
                                }).map((_, i) => (
                                  <span key={i}>⭐</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {detailsData.favoriteComposers.length === 0 &&
                  detailsData.favoriteWorks.length === 0 &&
                  detailsData.favoriteScores.length === 0 && (
                    <div className="text-center py-12">
                      <FiHeart className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                      <p className="text-theme-secondary">
                        Este usuário ainda não favoritou nada
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Learning Tab */}
            {activeTab === 'learning' && (
              <div className="space-y-6">
                {detailsData.wantToLearn.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiTarget className="w-5 h-5 text-accent-amber" />
                      Quer Aprender ({detailsData.wantToLearn.length})
                    </h3>
                    <div className="space-y-2">
                      {detailsData.wantToLearn.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary">
                              {item.work.title}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {item.work.composer.name}
                            </p>
                          </div>
                          <div className="text-sm text-accent-amber font-medium">
                            Prioridade: {item.priority}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {detailsData.learned.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiCheckCircle className="w-5 h-5 text-accent-green" />
                      Já Aprendeu ({detailsData.learned.length})
                    </h3>
                    <div className="space-y-2">
                      {detailsData.learned.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary">
                              {item.work.title}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {item.work.composer.name}
                            </p>
                          </div>
                          <div className="text-sm text-accent-green font-medium">
                            Maestria: {item.mastery}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {detailsData.wantToLearn.length === 0 &&
                  detailsData.learned.length === 0 && (
                    <div className="text-center py-12">
                      <FiBookOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                      <p className="text-theme-secondary">
                        Este usuário ainda não marcou nenhuma obra para aprender
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* Annotations Tab */}
            {activeTab === 'annotations' && (
              <AnimatedCard className="classical-card p-5">
                <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                  <FiFileText className="w-5 h-5 text-accent-green" />
                  Anotações ({detailsData.annotations.length})
                </h3>
                {detailsData.annotations.length > 0 ? (
                  <div className="space-y-3">
                    {detailsData.annotations.map((annotation) => (
                      <div
                        key={annotation.id}
                        className="p-4 bg-theme-secondary rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-theme-primary">
                              {annotation.title}
                            </p>
                            <p className="text-sm text-theme-tertiary">
                              {annotation.work.composer.name} -{' '}
                              {annotation.work.title}
                            </p>
                          </div>
                          <div className="text-accent-green font-medium text-sm">
                            {annotation.helpfulCount} úteis
                          </div>
                        </div>
                        <p className="text-theme-primary text-sm">
                          {annotation.content.substring(0, 150)}
                          {annotation.content.length > 150 && '...'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-theme-tertiary">
                    Nenhuma anotação ainda
                  </p>
                )}
              </AnimatedCard>
            )}

            {/* Instruments Tab */}
            {activeTab === 'instruments' && (
              <AnimatedCard className="classical-card p-5">
                <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                  <FiMusic className="w-5 h-5 text-accent-blue" />
                  Instrumentos ({detailsData.instruments.length})
                </h3>
                {detailsData.instruments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detailsData.instruments.map((inst, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-theme-secondary rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-theme-primary">
                            {inst.instrument.name}
                          </p>
                          {inst.isPrimary && (
                            <span className="px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded-full text-xs font-medium">
                              Principal
                            </span>
                          )}
                        </div>
                        {inst.instrument.category && (
                          <p className="text-sm text-theme-tertiary mb-1">
                            {inst.instrument.category}
                          </p>
                        )}
                        <p className="text-sm font-medium text-accent-green">
                          Nível: {formatExperienceLevel(inst.level)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-theme-tertiary">
                    Nenhum instrumento cadastrado
                  </p>
                )}
              </AnimatedCard>
            )}

            {/* Profiles Tab */}
            {activeTab === 'profiles' && (
              <div className="space-y-6">
                {detailsData.isTeacher && detailsData.teacherProfile && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiAward className="w-5 h-5 text-accent-blue" />
                      Perfil de Professor
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            detailsData.teacherProfile.status === 'ACTIVE'
                              ? 'bg-accent-green/20 text-accent-green'
                              : detailsData.teacherProfile.status === 'PENDING'
                                ? 'bg-accent-amber/20 text-accent-amber'
                                : 'bg-theme-secondary text-theme-tertiary'
                          }`}
                        >
                          Status: {detailsData.teacherProfile.status}
                        </div>
                        {detailsData.teacherProfile.isVerified && (
                          <div className="px-3 py-1 bg-accent-blue/20 text-accent-blue rounded-full text-sm font-medium flex items-center gap-1">
                            <FiCheckCircle className="w-4 h-4" />
                            Verificado
                          </div>
                        )}
                      </div>

                      {detailsData.teacherProfile.students?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-theme-primary mb-3">
                            Alunos ({detailsData.teacherProfile.students.length}
                            )
                          </p>
                          <div className="space-y-2">
                            {detailsData.teacherProfile.students
                              .slice(0, 10)
                              .map((rel: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-theme-secondary rounded-lg"
                                >
                                  <p className="font-medium text-theme-primary">
                                    {`${rel.student.user.firstName || ''} ${rel.student.user.lastName || ''}`.trim() ||
                                      'Aluno'}
                                  </p>
                                  <p className="text-sm text-theme-tertiary">
                                    {rel.student.user.email}
                                  </p>
                                </div>
                              ))}
                          </div>
                          {detailsData.teacherProfile.students.length > 10 && (
                            <p className="text-sm text-theme-quaternary mt-2 text-center">
                              +{detailsData.teacherProfile.students.length - 10}{' '}
                              alunos
                            </p>
                          )}
                        </div>
                      )}

                      {(!detailsData.teacherProfile.students ||
                        detailsData.teacherProfile.students.length === 0) && (
                        <p className="text-center py-4 text-theme-tertiary">
                          Nenhum aluno cadastrado
                        </p>
                      )}
                    </div>
                  </AnimatedCard>
                )}

                {detailsData.isStudent && detailsData.studentProfile && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <FiBookOpen className="w-5 h-5 text-accent-green" />
                      Perfil de Estudante
                    </h3>
                    <div className="space-y-4">
                      {detailsData.studentProfile.teachers?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-theme-primary mb-3">
                            Professores (
                            {detailsData.studentProfile.teachers.length})
                          </p>
                          <div className="space-y-2">
                            {detailsData.studentProfile.teachers.map(
                              (rel: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-theme-secondary rounded-lg"
                                >
                                  <p className="font-medium text-theme-primary">
                                    {`${rel.teacher.user.firstName || ''} ${rel.teacher.user.lastName || ''}`.trim() ||
                                      'Professor'}
                                  </p>
                                  <p className="text-sm text-theme-tertiary">
                                    {rel.teacher.user.email}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {(!detailsData.studentProfile.teachers ||
                        detailsData.studentProfile.teachers.length === 0) && (
                        <p className="text-center py-4 text-theme-tertiary">
                          Nenhum professor cadastrado
                        </p>
                      )}
                    </div>
                  </AnimatedCard>
                )}

                {!detailsData.isTeacher && !detailsData.isStudent && (
                  <div className="text-center py-12">
                    <FiUsers className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                    <p className="text-theme-secondary text-lg mb-2">
                      Sem Perfis Especiais
                    </p>
                    <p className="text-theme-tertiary text-sm">
                      Este usuário não possui perfis de professor ou estudante
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
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
