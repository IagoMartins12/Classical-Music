'use client';

import { useState, useEffect } from 'react';
import {
  PiBookOpen,
  PiCheckCircle,
  PiClock,
  PiFileText,
  PiHeart,
  PiMapPin,
  PiMedal,
  PiMusicNotes,
  PiPhone,
  PiPulse,
  PiTarget,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import { AnimatedCard } from '@/app/components/animation/AnimatedComponents';
import Button from '@/app/components/Common/Button';
import { AdminUser } from '@/app/hooks/admin/useAdminUsers';
import Modal from '@/app/components/Modal';
import LoadingAdminState from '../../Common/LoadingState';
import { formatNumber } from '../../Utils';
import Image from '@/app/components/SmartImage';
import { getAdminUserDetails } from '@/app/requests/admin/users';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

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
      setDetailsData(await getAdminUserDetails(user.id));
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
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-theme-primary font-bold text-2xl">
              {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
            </div>
            {detailsData?.isOnline && (
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-2"></div>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-primary">
              {user.name || 'Usuário Sem Nome'}
            </h2>
            <p className="text-theme-tertiary">{user.email}</p>
            {detailsData && (
              <p className="text-sm flex items-center gap-2 mt-1">
                <PiClock className="w-4 h-4" />
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
          { id: 'overview', label: 'Visão Geral', icon: PiUser },
          { id: 'favorites', label: 'Favoritos', icon: PiHeart },
          { id: 'learning', label: 'Aprendizado', icon: PiBookOpen },
          { id: 'annotations', label: 'Anotações', icon: PiFileText },
          { id: 'instruments', label: 'Instrumentos', icon: PiMusicNotes },
          { id: 'profiles', label: 'Perfis', icon: PiUsers },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'border-b-2' : 'text-theme-tertiary'
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
            <PiUser className="w-12 h-12 mx-auto mb-4" />
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
                    <PiUser className="w-5 h-5" />
                    Informações Pessoais
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Stack>
                      <Stack gap={1}>
                        <Text papel="legenda" tom="fraco" as="p">
                          Nome Completo
                        </Text>
                        <p className="text-theme-primary font-medium">
                          {`${detailsData.firstName || ''} ${detailsData.lastName || ''}`.trim() ||
                            'Não informado'}
                        </p>
                      </Stack>
                      <Stack gap={1}>
                        <Text papel="legenda" tom="fraco" as="p">
                          Username
                        </Text>
                        <p className="text-theme-primary font-medium">
                          {detailsData.username
                            ? `@${detailsData.username}`
                            : 'Não informado'}
                        </p>
                      </Stack>
                      <Stack gap={1}>
                        <Text papel="legenda" tom="fraco" as="p">
                          Email
                        </Text>
                        <p className="text-theme-primary font-medium break-all">
                          {detailsData.email}
                        </p>
                      </Stack>
                      {detailsData.phone && (
                        <Stack gap={1}>
                          <Text
                            papel="legenda"
                            tom="fraco"
                            as="p"
                            className="flex items-center gap-1"
                          >
                            <PiPhone className="w-3 h-3" /> Telefone
                          </Text>
                          <p className="text-theme-primary font-medium">
                            {detailsData.phone}
                          </p>
                        </Stack>
                      )}
                    </Stack>
                    <Stack>
                      <Stack gap={1}>
                        <Text papel="legenda" tom="fraco" as="p">
                          Tipo de Usuário
                        </Text>
                        <p className="text-theme-primary font-medium">
                          {formatUserType(detailsData.userType)}
                        </p>
                      </Stack>
                      <Stack gap={1}>
                        <Text papel="legenda" tom="fraco" as="p">
                          Nível de Experiência
                        </Text>
                        <p className="text-theme-primary font-medium">
                          {formatExperienceLevel(detailsData.experienceLevel)}
                        </p>
                      </Stack>
                      {(detailsData.city ||
                        detailsData.state ||
                        detailsData.country) && (
                        <Stack gap={1}>
                          <Text
                            papel="legenda"
                            tom="fraco"
                            as="p"
                            className="flex items-center gap-1"
                          >
                            <PiMapPin className="w-3 h-3" /> Localização
                          </Text>
                          <p className="text-theme-primary font-medium">
                            {[
                              detailsData.city,
                              detailsData.state,
                              detailsData.country,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </Stack>
                      )}
                      {detailsData.practiceTimePerWeek && (
                        <Stack gap={1}>
                          <Text papel="legenda" tom="fraco" as="p">
                            Tempo de Prática Semanal
                          </Text>
                          <p className="text-theme-primary font-medium">
                            {detailsData.practiceTimePerWeek} minutos
                          </p>
                        </Stack>
                      )}
                    </Stack>
                  </div>
                  {detailsData.bio && (
                    <Stack
                      gap={2}
                      className="mt-4 pt-4 border-t border-theme-primary"
                    >
                      <Text papel="legenda" tom="fraco" as="p">
                        Biografia
                      </Text>
                      <p className="text-theme-primary">{detailsData.bio}</p>
                    </Stack>
                  )}
                </AnimatedCard>

                {(detailsData.favoriteComposer ||
                  detailsData.favoriteEpoch) && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <PiMedal className="w-5 h-5" />
                      Preferências Musicais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailsData.favoriteComposer && (
                        <Stack
                          gap={2}
                          className="p-4 bg-theme-secondary rounded-lg"
                        >
                          <Text papel="legenda" tom="fraco" as="p">
                            Compositor Favorito
                          </Text>
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
                                <Text papel="rotulo" tom="fraco" as="p">
                                  {detailsData.favoriteComposer.epochName}
                                </Text>
                              )}
                            </div>
                          </div>
                        </Stack>
                      )}
                      {detailsData.favoriteEpoch && (
                        <Stack
                          gap={2}
                          className="p-4 bg-theme-secondary rounded-lg"
                        >
                          <Text papel="legenda" tom="fraco" as="p">
                            Época Favorita
                          </Text>
                          <p className="font-bold text-theme-primary text-lg">
                            {detailsData.favoriteEpoch.name}
                          </p>
                        </Stack>
                      )}
                    </div>
                  </AnimatedCard>
                )}

                <AnimatedCard className="classical-card p-5">
                  <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                    <PiPulse className="w-5 h-5" />
                    Estatísticas de Atividade
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-theme-secondary rounded-lg">
                      <div className="text-3xl font-bold mb-1">
                        {formatNumber(detailsData.stats.totalAnnotations)}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        Anotações
                      </Text>
                      <div className="text-xs mt-1">
                        {detailsData.stats.helpfulAnnotations} úteis
                      </div>
                    </div>
                    <div className="text-center p-4 bg-theme-secondary rounded-lg">
                      <div className="text-3xl font-bold mb-1">
                        {formatNumber(detailsData.stats.totalUploads)}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        Uploads
                      </Text>
                      <div className="text-xs mt-1">
                        Score: {detailsData.stats.uploadScore}
                      </div>
                    </div>
                    <Stack
                      gap={1}
                      className="text-center p-4 bg-theme-secondary rounded-lg"
                    >
                      <div className="text-3xl font-bold">
                        {formatNumber(detailsData.stats.totalFavorites)}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        Favoritos
                      </Text>
                    </Stack>
                    <Stack
                      gap={1}
                      className="text-center p-4 bg-theme-secondary rounded-lg"
                    >
                      <div className="text-3xl font-bold">
                        {detailsData.joinedDaysAgo}
                      </div>
                      <Text papel="rotulo" tom="fraco" as="div">
                        Dias na plataforma
                      </Text>
                    </Stack>
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
                      <PiMusicNotes className="w-5 h-5" />
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
                              <Text papel="rotulo" tom="fraco" as="p">
                                {fav.composer.epochName}
                              </Text>
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
                      <PiHeart className="w-5 h-5" />
                      Obras Favoritas ({detailsData.favoriteWorks.length})
                    </h3>
                    <Stack gap={2}>
                      {detailsData.favoriteWorks.map((fav, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg"
                        >
                          <p className="font-medium text-theme-primary">
                            {fav.work.title}
                          </p>
                          <Text papel="rotulo" tom="fraco" as="p">
                            {fav.work.composer.name}
                          </Text>
                        </div>
                      ))}
                    </Stack>
                  </AnimatedCard>
                )}

                {detailsData.favoriteScores.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <PiFileText className="w-5 h-5" />
                      Partituras Favoritas ({detailsData.favoriteScores.length})
                    </h3>
                    <Stack gap={2}>
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
                              <Text papel="rotulo" tom="fraco" as="p">
                                {score.work.composer.name} - {score.work.title}
                              </Text>
                            </div>
                            {score.personalRating && (
                              <div className="flex items-center gap-1">
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
                    </Stack>
                  </AnimatedCard>
                )}

                {detailsData.favoriteComposers.length === 0 &&
                  detailsData.favoriteWorks.length === 0 &&
                  detailsData.favoriteScores.length === 0 && (
                    <div className="text-center py-12">
                      <PiHeart className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
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
                      <PiTarget className="w-5 h-5" />
                      Quer Aprender ({detailsData.wantToLearn.length})
                    </h3>
                    <Stack gap={2}>
                      {detailsData.wantToLearn.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary">
                              {item.work.title}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              {item.work.composer.name}
                            </Text>
                          </div>
                          <div className="text-sm font-medium">
                            Prioridade: {item.priority}
                          </div>
                        </div>
                      ))}
                    </Stack>
                  </AnimatedCard>
                )}

                {detailsData.learned.length > 0 && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <PiCheckCircle className="w-5 h-5" />
                      Já Aprendeu ({detailsData.learned.length})
                    </h3>
                    <Stack gap={2}>
                      {detailsData.learned.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-theme-secondary rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-theme-primary">
                              {item.work.title}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              {item.work.composer.name}
                            </Text>
                          </div>
                          <div className="text-sm font-medium">
                            Maestria: {item.mastery}%
                          </div>
                        </div>
                      ))}
                    </Stack>
                  </AnimatedCard>
                )}

                {detailsData.wantToLearn.length === 0 &&
                  detailsData.learned.length === 0 && (
                    <div className="text-center py-12">
                      <PiBookOpen className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
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
                  <PiFileText className="w-5 h-5" />
                  Anotações ({detailsData.annotations.length})
                </h3>
                {detailsData.annotations.length > 0 ? (
                  <Stack gap={3}>
                    {detailsData.annotations.map((annotation) => (
                      <Stack
                        gap={2}
                        key={annotation.id}
                        className="p-4 bg-theme-secondary rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-theme-primary">
                              {annotation.title}
                            </p>
                            <Text papel="rotulo" tom="fraco" as="p">
                              {annotation.work.composer.name} -{' '}
                              {annotation.work.title}
                            </Text>
                          </div>
                          <div className="font-medium text-sm">
                            {annotation.helpfulCount} úteis
                          </div>
                        </div>
                        <Text papel="rotulo" tom="forte" as="p">
                          {annotation.content.substring(0, 150)}
                          {annotation.content.length > 150 && '...'}
                        </Text>
                      </Stack>
                    ))}
                  </Stack>
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
                  <PiMusicNotes className="w-5 h-5" />
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
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium">
                              Principal
                            </span>
                          )}
                        </div>
                        {inst.instrument.category && (
                          <Text
                            papel="rotulo"
                            tom="fraco"
                            as="p"
                            className="mb-1"
                          >
                            {inst.instrument.category}
                          </Text>
                        )}
                        <p className="text-sm font-medium">
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
                      <PiMedal className="w-5 h-5" />
                      Perfil de Professor
                    </h3>
                    <Stack>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            detailsData.teacherProfile.status === 'ACTIVE'
                              ? ''
                              : detailsData.teacherProfile.status === 'PENDING'
                                ? ''
                                : 'bg-theme-secondary text-theme-tertiary'
                          }`}
                        >
                          Status: {detailsData.teacherProfile.status}
                        </div>
                        {detailsData.teacherProfile.isVerified && (
                          <div className="px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <PiCheckCircle className="w-4 h-4" />
                            Verificado
                          </div>
                        )}
                      </div>

                      {detailsData.teacherProfile.students?.length > 0 && (
                        <div>
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="p"
                            className="font-medium mb-3"
                          >
                            Alunos ({detailsData.teacherProfile.students.length}
                            )
                          </Text>
                          <Stack gap={2}>
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
                                  <Text papel="rotulo" tom="fraco" as="p">
                                    {rel.student.user.email}
                                  </Text>
                                </div>
                              ))}
                          </Stack>
                          {detailsData.teacherProfile.students.length > 10 && (
                            <p className="text-sm mt-2 text-center">
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
                    </Stack>
                  </AnimatedCard>
                )}

                {detailsData.isStudent && detailsData.studentProfile && (
                  <AnimatedCard className="classical-card p-5">
                    <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <PiBookOpen className="w-5 h-5" />
                      Perfil de Estudante
                    </h3>
                    <Stack>
                      {detailsData.studentProfile.teachers?.length > 0 && (
                        <Stack gap={3}>
                          <Text
                            papel="rotulo"
                            tom="forte"
                            as="p"
                            className="font-medium"
                          >
                            Professores (
                            {detailsData.studentProfile.teachers.length})
                          </Text>
                          <Stack gap={2}>
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
                                  <Text papel="rotulo" tom="fraco" as="p">
                                    {rel.teacher.user.email}
                                  </Text>
                                </div>
                              )
                            )}
                          </Stack>
                        </Stack>
                      )}

                      {(!detailsData.studentProfile.teachers ||
                        detailsData.studentProfile.teachers.length === 0) && (
                        <p className="text-center py-4 text-theme-tertiary">
                          Nenhum professor cadastrado
                        </p>
                      )}
                    </Stack>
                  </AnimatedCard>
                )}

                {!detailsData.isTeacher && !detailsData.isStudent && (
                  <div className="text-center py-12">
                    <PiUsers className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                    <p className="text-theme-secondary text-lg mb-2">
                      Sem Perfis Especiais
                    </p>
                    <Text papel="rotulo" tom="fraco" as="p">
                      Este usuário não possui perfis de professor ou estudante
                    </Text>
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
