// app/teacher/reviews/pageClient.tsx - Client Component para Avaliações Recebidas

'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FiStar,
  FiUser,
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
  FiRefreshCw,
  FiFilter,
  FiThumbsUp,
  FiThumbsDown,
  FiMessageSquare,
  FiCalendar,
  FiAward,
  FiHeart,
  FiTarget,
  FiClock,
  FiUsers,
  FiBarChart2,
} from 'react-icons/fi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
} from '../../../components/animation/AnimatedComponents';
import { TeacherReviewsData, ReviewData } from './pageServer';
import Image from 'next/image';
import Select from '@/app/components/Common/Select';
import { useTeacherReviews } from '@/app/hooks/lessonsSystem/useTeacherReviews';

interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role: number;
}

interface TeacherReviewsPageClientProps {
  initialData: TeacherReviewsData;
  teacherProfile: TeacherProfile;
  errorMessage?: string;
}

export default function TeacherReviewsPageClient({
  initialData,
  teacherProfile,
  errorMessage,
}: TeacherReviewsPageClientProps) {
  // Initialize hook
  const {
    reviews,
    stats,
    pagination,
    loading,
    error,
    filters,
    fetchReviews,
    refreshReviews,
    loadMoreReviews,
    setRatingFilter,
    setTimePeriodFilter,
    setVisibilityFilter,
    setSortBy,
    clearFilters,
    getReviewInsights,
    setInitialData,
    clearError,
  } = useTeacherReviews(initialData);

  // Local UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewData | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Initialize hook data on mount
  useEffect(() => {
    if (initialData && initialData.reviews.length > 0) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  // Apply filters when they change
  useEffect(() => {
    fetchReviews(true);
  }, [filters, fetchReviews]);

  // Filter options
  const ratingOptions = [
    { value: '', label: 'Todas as notas' },
    { value: '5', label: '5 estrelas' },
    { value: '4', label: '4 estrelas' },
    { value: '3', label: '3 estrelas' },
    { value: '2', label: '2 estrelas' },
    { value: '1', label: '1 estrela' },
  ];

  const timePeriodOptions = [
    { value: 'all', label: 'Todo período' },
    { value: 'month', label: 'Este mês' },
    { value: 'quarter', label: 'Este trimestre' },
    { value: 'year', label: 'Este ano' },
  ];

  const visibilityOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'public', label: 'Públicas' },
    { value: 'private', label: 'Privadas' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Mais recentes' },
    { value: 'oldest', label: 'Mais antigas' },
    { value: 'highest', label: 'Maior nota' },
    { value: 'lowest', label: 'Menor nota' },
  ];

  // Get insights
  const insights = useMemo(() => getReviewInsights(), [getReviewInsights]);

  // Format functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-accent-yellow fill-current'
                : 'text-theme-tertiary'
            }`}
          />
        ))}
      </div>
    );
  };

  const getSpecificRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-accent-green';
    if (rating >= 4.0) return 'text-accent-blue';
    if (rating >= 3.5) return 'text-accent-yellow';
    if (rating >= 3.0) return 'text-accent-orange';
    return 'text-accent-red';
  };

  // Render error state
  if ((error || errorMessage) && reviews.length === 0) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiStar className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Avaliações
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {error || errorMessage}
            </p>
            <div className="space-y-3">
              <button
                onClick={refreshReviews}
                disabled={loading.reviews}
                className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
              >
                <FiRefreshCw
                  className={`w-4 h-4 ${loading.reviews ? 'animate-spin' : ''}`}
                />
                <span>
                  {loading.reviews ? 'Carregando...' : 'Tentar Novamente'}
                </span>
              </button>
              {error && (
                <button
                  onClick={clearError}
                  className="btn-classical-secondary w-full"
                >
                  Limpar Erro
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
                <FiStar className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Suas Avaliações
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Veja o feedback dos seus alunos e acompanhe seu crescimento como
              professor
            </p>
          </div>
        </AnimatedItem>

        {/* Main Stats */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-8 h-8 text-theme-primary" />
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {formatRating(stats.averageRating)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(stats.averageRating, 'md')}
              </div>
              <div className="text-sm text-theme-tertiary">Nota Média</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-theme-primary" />
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {stats.total}
              </div>
              <div className="text-sm text-theme-tertiary">
                Total de Avaliações
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                <FiThumbsUp className="w-8 h-8 text-theme-primary" />
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {Math.round(stats.recommendationRate)}%
              </div>
              <div className="text-sm text-theme-tertiary">Recomendação</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div
                className={`w-16 h-16 bg-gradient-to-br ${
                  insights.trending === 'up'
                    ? 'from-accent-green to-accent-blue'
                    : insights.trending === 'down'
                    ? 'from-accent-red to-accent-orange'
                    : 'from-accent-blue to-accent-purple'
                } rounded-xl flex items-center justify-center mx-auto mb-4`}
              >
                {insights.trending === 'up' ? (
                  <FiTrendingUp className="w-8 h-8 text-theme-primary" />
                ) : insights.trending === 'down' ? (
                  <FiTrendingDown className="w-8 h-8 text-theme-primary" />
                ) : (
                  <FiMinus className="w-8 h-8 text-theme-primary" />
                )}
              </div>
              <div className="text-3xl font-bold text-theme-primary mb-2">
                {insights.recentTrend > 0 ? '+' : ''}
                {insights.recentTrend}
              </div>
              <div className="text-sm text-theme-tertiary">Este Mês</div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Detailed Stats */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Rating Distribution */}
            <AnimatedCard hover="none" className="classical-card p-6">
              <h2 className="text-lg font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiBarChart2 className="w-5 h-5" />
                <span>Distribuição de Notas</span>
              </h2>

              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count =
                    stats.ratingDistribution[
                      rating as keyof typeof stats.ratingDistribution
                    ];
                  const percentage =
                    stats.total > 0 ? (count / stats.total) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-20">
                        <span className="text-sm font-medium text-theme-primary">
                          {rating}
                        </span>
                        <FiStar className="w-4 h-4 text-accent-yellow fill-current" />
                      </div>

                      <div className="flex-1 bg-theme-secondary rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-accent-yellow to-accent-orange h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      <div className="text-sm text-theme-tertiary w-16 text-right">
                        {count} ({Math.round(percentage)}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>

            {/* Specific Ratings */}
            <AnimatedCard hover="none" className="classical-card p-6">
              <h2 className="text-lg font-bold text-theme-primary mb-6 flex items-center space-x-2">
                <FiTarget className="w-5 h-5" />
                <span>Avaliações Específicas</span>
              </h2>

              <div className="space-y-4">
                {Object.entries(stats.specificAverages).map(([key, value]) => {
                  const labels = {
                    teachingQuality: 'Qualidade do Ensino',
                    communication: 'Comunicação',
                    punctuality: 'Pontualidade',
                    preparation: 'Preparação',
                    patience: 'Paciência',
                    motivation: 'Motivação',
                  };

                  const label = labels[key as keyof typeof labels] || key;

                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-theme-secondary text-sm">
                        {label}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`font-bold ${getSpecificRatingColor(
                            value
                          )}`}
                        >
                          {value > 0 ? formatRating(value) : '-'}
                        </span>
                        {value > 0 && renderStars(value, 'sm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedCard>
          </div>
        </AnimatedItem>

        {/* Insights */}
        {(insights.strongPoints.length > 0 ||
          insights.improvementAreas.length > 0) && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Strong Points */}
              {insights.strongPoints.length > 0 && (
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiAward className="w-5 h-5 text-accent-green" />
                    <span>Seus Pontos Fortes</span>
                  </h2>

                  <div className="space-y-3">
                    {insights.strongPoints.map((point, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent-green rounded-full"></div>
                        <span className="text-theme-secondary">{point}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              )}

              {/* Improvement Areas */}
              {insights.improvementAreas.length > 0 && (
                <AnimatedCard hover="none" className="classical-card p-6">
                  <h2 className="text-lg font-bold text-theme-primary mb-4 flex items-center space-x-2">
                    <FiTarget className="w-5 h-5 text-accent-blue" />
                    <span>Áreas para Desenvolver</span>
                  </h2>

                  <div className="space-y-3">
                    {insights.improvementAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-accent-blue rounded-full"></div>
                        <span className="text-theme-secondary">{area}</span>
                      </div>
                    ))}
                  </div>
                </AnimatedCard>
              )}
            </div>
          </AnimatedItem>
        )}

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`btn-classical-secondary flex items-center space-x-2 ${
                    showFilters
                      ? 'bg-brand-primary/10 border-brand-primary/30'
                      : ''
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filtros</span>
                </button>

                <button
                  onClick={refreshReviews}
                  disabled={loading.reviews}
                  className="btn-classical-secondary flex items-center space-x-2"
                >
                  <FiRefreshCw
                    className={`w-4 h-4 ${
                      loading.reviews ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Atualizar</span>
                </button>

                {(filters.rating ||
                  filters.timeperiod !== 'all' ||
                  filters.visibility !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-brand-primary hover:text-brand-secondary transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>

              <div className="text-sm text-theme-tertiary">
                {stats.total} avaliação{stats.total !== 1 ? 'ões' : ''} total
                {stats.total !== 1 ? 'is' : ''}
                {reviews.length < stats.total &&
                  ` • Mostrando ${reviews.length}`}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-theme-secondary">
                <Select
                  label="Nota"
                  value={filters.rating?.toString() || ''}
                  onChange={(e) =>
                    setRatingFilter(
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  options={ratingOptions}
                  className="input-classical-2"
                />

                <Select
                  label="Período"
                  value={filters.timeperiod}
                  onChange={(e) => setTimePeriodFilter(e.target.value as any)}
                  options={timePeriodOptions}
                  className="input-classical-2"
                />

                <Select
                  label="Visibilidade"
                  value={filters.visibility}
                  onChange={(e) => setVisibilityFilter(e.target.value as any)}
                  options={visibilityOptions}
                  className="input-classical-2"
                />

                <Select
                  label="Ordenar por"
                  value={filters.sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  options={sortOptions}
                  className="input-classical-2"
                />
              </div>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Reviews List */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="space-y-6">
            {loading.reviews && reviews.length === 0 ? (
              <div className="text-center py-12">
                <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
                <p className="text-theme-secondary">Carregando avaliações...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <FiStar className="w-16 h-16 text-theme-tertiary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-theme-primary mb-2">
                  Nenhuma avaliação encontrada
                </h3>
                <p className="text-theme-tertiary">
                  {stats.total === 0
                    ? 'Você ainda não recebeu avaliações dos seus alunos.'
                    : 'Tente ajustar os filtros de busca.'}
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <AnimatedCard
                  key={review.id}
                  hover="lift"
                  className="classical-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      {review.student.image ? (
                        <div className="w-12 h-12 relative rounded-full overflow-hidden">
                          <Image
                            src={review.student.image}
                            alt={review.student.name}
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
                        <h3 className="font-bold text-theme-primary">
                          {review.student.name}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-sm font-medium text-theme-primary">
                            {formatRating(review.rating)}
                          </span>
                          <span className="text-xs text-theme-tertiary">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>

                        {review.relationshipDuration && (
                          <div className="flex items-center space-x-4 mt-2 text-xs text-theme-tertiary">
                            <span>
                              Relacionamento: {review.relationshipDuration}
                            </span>
                            {review.lessonsCount && (
                              <span>
                                {review.lessonsCount} aula
                                {review.lessonsCount !== 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {review.isPublic ? (
                        <FiEye
                          className="w-4 h-4 text-accent-green"
                          title="Avaliação pública"
                        />
                      ) : (
                        <FiEyeOff
                          className="w-4 h-4 text-accent-yellow"
                          title="Avaliação privada"
                        />
                      )}

                      {review.wouldRecommend ? (
                        <FiThumbsUp
                          className="w-4 h-4 text-accent-green"
                          title="Recomenda você"
                        />
                      ) : (
                        <FiThumbsDown
                          className="w-4 h-4 text-accent-red"
                          title="Não recomenda"
                        />
                      )}
                    </div>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-theme-secondary italic">
                        "{review.comment}"
                      </p>
                    </div>
                  )}

                  {/* Specific Ratings */}
                  {(review.teachingQuality ||
                    review.communication ||
                    review.punctuality ||
                    review.preparation ||
                    review.patience ||
                    review.motivation) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-theme-secondary">
                      {[
                        {
                          key: 'teachingQuality',
                          label: 'Ensino',
                          value: review.teachingQuality,
                        },
                        {
                          key: 'communication',
                          label: 'Comunicação',
                          value: review.communication,
                        },
                        {
                          key: 'punctuality',
                          label: 'Pontualidade',
                          value: review.punctuality,
                        },
                        {
                          key: 'preparation',
                          label: 'Preparação',
                          value: review.preparation,
                        },
                        {
                          key: 'patience',
                          label: 'Paciência',
                          value: review.patience,
                        },
                        {
                          key: 'motivation',
                          label: 'Motivação',
                          value: review.motivation,
                        },
                      ].map(
                        ({ key, label, value }) =>
                          value && (
                            <div
                              key={key}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-theme-tertiary">
                                {label}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-theme-primary">
                                  {formatRating(value)}
                                </span>
                                {renderStars(value, 'sm')}
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  )}

                  {/* Moderation Notice */}
                  {review.isModerated && (
                    <div className="mt-4 p-3 bg-accent-yellow/5 border border-accent-yellow/20 rounded-lg">
                      <div className="flex items-center space-x-2 text-accent-yellow">
                        <FiMessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Avaliação moderada
                        </span>
                      </div>
                      {review.moderationNote && (
                        <p className="text-xs text-theme-tertiary mt-1">
                          {review.moderationNote}
                        </p>
                      )}
                    </div>
                  )}
                </AnimatedCard>
              ))
            )}

            {/* Load More */}
            {pagination.hasMore && (
              <div className="text-center py-8">
                <button
                  onClick={loadMoreReviews}
                  disabled={loading.reviews}
                  className="btn-classical-secondary flex items-center space-x-2 mx-auto"
                >
                  {loading.reviews ? (
                    <FiRefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <FiStar className="w-4 h-4" />
                  )}
                  <span>
                    {loading.reviews ? 'Carregando...' : 'Carregar Mais'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </AnimatedItem>
      </AnimatedContainer>
    </PageContainer>
  );
}
