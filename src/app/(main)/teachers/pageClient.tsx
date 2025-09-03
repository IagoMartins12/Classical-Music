// app/teachers/pageClient.tsx - Client Component para Professores Públicos

'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  FiUsers,
  FiStar,
  FiMapPin,
  FiMail,
  FiExternalLink,
  FiFilter,
  FiX,
  FiSearch,
  FiChevronDown,
  FiCheckCircle,
  FiMusic,
  FiClock,
  FiMessageCircle,
  FiRefreshCw,
  FiAlertCircle,
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
  PublicTeachersResponse,
  PublicTeacher,
} from '@/app/requests/public-teachers-requests';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface PublicTeachersPageClientProps {
  initialData: PublicTeachersResponse | null;
  currentFilters: {
    instrument?: string;
    specialty?: string;
    skillLevel?: string;
    ageGroup?: string;
    location?: string;
    verified?: boolean;
    sortBy?: string;
    page?: number;
  };
  errorMessage?: string;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Melhor Avaliados' },
  { value: 'students', label: 'Mais Alunos' },
  { value: 'experience', label: 'Mais Experientes' },
  { value: 'name', label: 'Nome (A-Z)' },
];

export default function PublicTeachersPageClient({
  initialData,
  currentFilters,
  errorMessage,
}: PublicTeachersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter teachers by search query
  const filteredTeachers = useMemo(() => {
    if (!initialData?.teachers || !searchQuery.trim()) {
      return initialData?.teachers || [];
    }

    const query = searchQuery.toLowerCase();
    return initialData.teachers.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(query) ||
        teacher.specialties.some((s) => s.toLowerCase().includes(query)) ||
        teacher.instruments.some((i) => i.toLowerCase().includes(query)) ||
        teacher.location?.toLowerCase().includes(query)
    );
  }, [initialData?.teachers, searchQuery]);

  // Update URL with new filters
  const updateFilters = useCallback(
    (newFilters: Record<string, number | string | boolean | undefined>) => {
      const current = new URLSearchParams(searchParams.toString());

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          current.set(key, value.toString());
        } else {
          current.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if (!newFilters.page) {
        current.delete('page');
      }

      setIsLoading(true);
      router.push(`/teachers?${current.toString()}`);
    },
    [searchParams, router]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    router.push('/teachers');
  }, [router]);

  // Handle WhatsApp contact
  const handleWhatsAppContact = useCallback((teacher: PublicTeacher) => {
    if (!teacher.phone) return;

    const message = `Olá ${teacher.name}! Vi seu perfil no Opus Atlas e gostaria de mais informações sobre suas aulas de música.`;
    const phoneNumber = teacher.phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }, []);

  // Handle email contact
  const handleEmailContact = useCallback((teacher: PublicTeacher) => {
    if (!teacher.email) return;

    const subject = `Interesse em aulas de música - Opus Atlas`;
    const body = `Olá ${teacher.name}!\n\nVi seu perfil no Opus Atlas e gostaria de mais informações sobre suas aulas de música.\n\nAguardo seu retorno.\n\nObrigado!`;

    const emailUrl = `mailto:${teacher.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  }, []);

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      updateFilters({ ...currentFilters, page });
    },
    [updateFilters, currentFilters]
  );

  // Error state
  if (errorMessage && !initialData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <FiAlertCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Professores
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary flex items-center space-x-2 w-full justify-center"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!initialData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando professores...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const { filters, stats, pagination } = initialData;
  const hasActiveFilters = Object.values(currentFilters).some(
    (v) => v && v !== '' && v !== 1
  );

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
              Conheça Nossos Professores
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle max-w-3xl mx-auto">
              Encontre o professor ideal para sua jornada musical. Navegue por
              perfis verificados, especialidades e avaliações de alunos reais.
            </p>
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
                {stats.totalTeachers}
              </div>
              <div className="text-sm text-theme-tertiary">
                Professores Cadastrados
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiCheckCircle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.verifiedTeachers}
              </div>
              <div className="text-sm text-theme-tertiary">
                Perfis Verificados
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiStar className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-theme-tertiary">Avaliação Média</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiMusic className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalActiveStudents}
              </div>
              <div className="text-sm text-theme-tertiary">Alunos Ativos</div>
            </AnimatedCard>
          </SequentialGrid>
        </AnimatedItem>

        {/* Search and Filters */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
                  <Input
                    type="text"
                    placeholder="Buscar por nome, instrumento ou especialidade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 input-classical"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center space-x-3">
                <Select
                  value={currentFilters.sortBy || 'rating'}
                  onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  options={SORT_OPTIONS}
                  disabled={isLoading}
                  className="input-classical w-auto min-w-48"
                />

                <button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className={`btn-classical-secondary flex items-center space-x-2 ${
                    hasActiveFilters
                      ? 'bg-brand-primary/10 border-brand-primary/30'
                      : ''
                  }`}
                >
                  <FiFilter className="w-4 h-4" />
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  )}
                  <FiChevronDown
                    className={`w-4 h-4 transition-transform ${
                      isFiltersOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    disabled={isLoading}
                    className="btn-classical-secondary text-accent-red border-accent-red/30 hover:bg-accent-red/10"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {isFiltersOpen && (
              <AnimatedItem
                direction="up"
                springType="gentle"
                className="mt-6 pt-6 border-t border-theme-secondary"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <Select
                    value={currentFilters.instrument || ''}
                    onChange={(e) =>
                      updateFilters({ instrument: e.target.value })
                    }
                    disabled={isLoading}
                    options={[
                      { value: '', label: 'Todos os Instrumentos' },
                      ...filters.instruments.map((i) => ({
                        value: i.name,
                        label: `${i.name} (${i.count})`,
                      })),
                    ]}
                    className="input-classical"
                  />

                  <Select
                    value={currentFilters.specialty || ''}
                    onChange={(e) =>
                      updateFilters({ specialty: e.target.value })
                    }
                    disabled={isLoading}
                    options={[
                      { value: '', label: 'Todas as Especialidades' },
                      ...filters.specialties.map((s) => ({
                        value: s.name,
                        label: `${s.name} (${s.count})`,
                      })),
                    ]}
                    className="input-classical"
                  />

                  <Select
                    value={currentFilters.skillLevel || ''}
                    onChange={(e) =>
                      updateFilters({ skillLevel: e.target.value })
                    }
                    disabled={isLoading}
                    options={[
                      { value: '', label: 'Todos os Níveis' },
                      ...filters.skillLevels.map((s) => ({
                        value: s.name,
                        label: `${s.name} (${s.count})`,
                      })),
                    ]}
                    className="input-classical"
                  />

                  <Select
                    value={currentFilters.ageGroup || ''}
                    onChange={(e) =>
                      updateFilters({ ageGroup: e.target.value })
                    }
                    disabled={isLoading}
                    options={[
                      { value: '', label: 'Todas as Idades' },
                      ...filters.ageGroups.map((a) => ({
                        value: a.name,
                        label: `${a.name} (${a.count})`,
                      })),
                    ]}
                    className="input-classical"
                  />

                  <Select
                    value={currentFilters.location || ''}
                    onChange={(e) =>
                      updateFilters({ location: e.target.value })
                    }
                    disabled={isLoading}
                    options={[
                      { value: '', label: 'Todas as Localizações' },
                      ...filters.locations.map((l) => ({
                        value: l.name,
                        label: `${l.name} (${l.count})`,
                      })),
                    ]}
                    className="input-classical"
                  />
                </div>

                <div className="mt-4 flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentFilters.verified || false}
                      onChange={(e) =>
                        updateFilters({ verified: e.target.checked })
                      }
                      disabled={isLoading}
                      className="w-4 h-4 text-brand-primary bg-theme-elevated border-theme-secondary rounded focus:ring-brand-primary focus:ring-2"
                    />
                    <span className="text-theme-secondary">
                      Apenas perfis verificados
                    </span>
                  </label>
                </div>
              </AnimatedItem>
            )}
          </AnimatedCard>
        </AnimatedItem>

        {/* Results Info */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-theme-primary">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : `${filteredTeachers.length} Professores Encontrados`}
              </h2>
              {hasActiveFilters && (
                <p className="text-theme-tertiary text-sm mt-1">
                  Filtros aplicados
                </p>
              )}
            </div>

            {pagination.total > pagination.limit && (
              <div className="text-sm text-theme-tertiary">
                Página {currentFilters.page || 1} de{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </div>
            )}
          </div>
        </AnimatedItem>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-theme-secondary to-theme-tertiary rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiUsers className="w-10 h-10 text-theme-primary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                Nenhum professor encontrado
              </h3>
              <p className="text-theme-secondary max-w-md mx-auto mb-6">
                Tente ajustar os filtros ou termos de busca para encontrar mais
                resultados.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-classical-primary"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </AnimatedItem>
        ) : (
          <SequentialGrid
            cols={3}
            gap={8}
            delayBetweenItems={0.1}
            className="mb-12"
          >
            {filteredTeachers.map((teacher, index) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onWhatsAppContact={handleWhatsAppContact}
                onEmailContact={handleEmailContact}
                delay={index * 0.1}
              />
            ))}
          </SequentialGrid>
        )}

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <AnimatedItem direction="up" springType="gentle">
            <div className="flex justify-center items-center space-x-2">
              {/* Previous */}
              <button
                onClick={() => handlePageChange((currentFilters.page || 1) - 1)}
                disabled={isLoading || (currentFilters.page || 1) <= 1}
                className="btn-classical-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {/* Page Numbers */}
              {Array.from(
                {
                  length: Math.min(
                    5,
                    Math.ceil(pagination.total / pagination.limit)
                  ),
                },
                (_, i) => {
                  const page = i + 1;
                  const isActive = (currentFilters.page || 1) === page;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        isActive
                          ? 'bg-brand-primary text-theme-primary'
                          : 'bg-theme-elevated text-theme-secondary hover:bg-brand-primary/10'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}

              {/* Next */}
              <button
                onClick={() => handlePageChange((currentFilters.page || 1) + 1)}
                disabled={isLoading || !pagination.hasMore}
                className="btn-classical-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="classical-card p-8 text-center">
            <FiRefreshCw className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando professores...</p>
          </div>
        </div>
      )}
    </PageContainer>
  );
}

// Teacher Card Component
interface TeacherCardProps {
  teacher: PublicTeacher;
  onWhatsAppContact: (teacher: PublicTeacher) => void;
  onEmailContact: (teacher: PublicTeacher) => void;
  delay?: number;
}

function TeacherCard({
  teacher,
  onWhatsAppContact,
  onEmailContact,
  delay = 0,
}: TeacherCardProps) {
  return (
    <AnimatedItem hover="lift" springType="bouncy" delay={delay}>
      <AnimatedCard className="classical-card p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start space-x-4 mb-4">
            {teacher.profileImage ? (
              <div className="w-16 h-16 relative rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                  src={teacher.profileImage}
                  alt={teacher.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center flex-shrink-0">
                <FiUser className="w-8 h-8 text-theme-primary" />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-theme-primary">
                  {teacher.name}
                </h3>
                {teacher.isVerified && (
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <FiCheckCircle className="w-3 h-3 text-theme-primary" />
                  </div>
                )}
              </div>

              {/* Rating */}
              {teacher.averageRating && teacher.totalReviews > 0 && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <FiStar className="w-4 h-4 text-accent-yellow" />
                    <span className="text-sm font-medium text-theme-primary">
                      {teacher.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-theme-tertiary">
                    ({teacher.totalReviews} avaliações)
                  </span>
                </div>
              )}

              {/* Location */}
              {teacher.location && (
                <div className="flex items-center space-x-1 mt-1">
                  <FiMapPin className="w-3 h-3 text-theme-tertiary" />
                  <span className="text-xs text-theme-tertiary">
                    {teacher.location}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {teacher.publicBio && (
            <p className="text-sm text-theme-secondary mb-4 line-clamp-3">
              {teacher.publicBio}
            </p>
          )}

          {/* Experience */}
          <div className="flex items-center justify-between text-xs text-theme-tertiary mb-4">
            <div className="flex items-center space-x-1">
              <FiClock className="w-3 h-3" />
              <span>{teacher.yearsExperience} anos de experiência</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiUsers className="w-3 h-3" />
              <span>{teacher.totalStudents} alunos</span>
            </div>
          </div>

          {/* Specialties */}
          {teacher.specialties.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {teacher.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-brand-primary/10 text-brand-primary rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
                {teacher.specialties.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-theme-secondary text-theme-tertiary rounded-full">
                    +{teacher.specialties.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto space-y-3">
            {/* View Profile */}
            <Link
              href={`/teachers/${teacher.id}`}
              className="btn-classical-primary w-full text-center flex items-center justify-center space-x-2"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>Ver Perfil Completo</span>
            </Link>

            {/* Contact Options */}
            <div className="flex items-center space-x-2">
              {teacher.phone && (
                <button
                  onClick={() => onWhatsAppContact(teacher)}
                  className="btn-classical-secondary flex-1 flex items-center justify-center space-x-2 text-accent-green border-accent-green/30 hover:bg-accent-green/10"
                >
                  <FiMessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              )}

              {teacher.email && (
                <button
                  onClick={() => onEmailContact(teacher)}
                  className="btn-classical-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <FiMail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </AnimatedCard>
    </AnimatedItem>
  );
}
