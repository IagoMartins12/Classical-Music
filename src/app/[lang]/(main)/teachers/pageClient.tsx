// app/teachers/pageClient.tsx - Client Component para Professores Públicos

'use client';
import { useLocalizedRouter } from '@/app/hooks/useLocalizedRouter';

import { useState, useCallback, useMemo } from 'react';
import {
  PiArrowSquareOut,
  PiArrowsClockwise,
  PiCaretDown,
  PiChatCircle,
  PiCheckCircle,
  PiClock,
  PiEnvelopeSimple,
  PiFunnel,
  PiMagnifyingGlass,
  PiMapPin,
  PiMusicNotes,
  PiStar,
  PiUser,
  PiUsers,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
  PageContainer,
  SequentialGrid,
} from '../../../components/animation/AnimatedComponents';
import {
  PublicTeachersResponse,
  PublicTeacher,
} from '@/app/requests/public-teachers-requests';
import Select from '@/app/components/Common/Select';
import Input from '@/app/components/Common/Inputs';
import Image from '@/app/components/SmartImage';
import Link from '@/app/components/LocalizedLink';

import { currentSearchParams } from '@/app/utils/currentSearchParams';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Button } from '@/app/components/ui/Button';
import { Card } from '@/app/components/ui/Card';

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
  const router = useLocalizedRouter();

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
      const current = currentSearchParams();

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
    [router]
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
          <Card densidade="larga" className="text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
              <PiWarningCircle className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-xl font-bold text-theme-primary classical-title mb-4">
              Erro ao Carregar Professores
            </h1>
            <p className="text-theme-secondary classical-subtitle mb-6">
              {errorMessage}
            </p>
            <Inline
              as="button"
              gap={2}
              onClick={() => window.location.reload()}
              className="btn-classical-primary w-full justify-center"
            >
              <PiArrowsClockwise className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </Inline>
          </Card>
        </div>
      </PageContainer>
    );
  }

  if (!initialData) {
    return (
      <PageContainer showBackground={true}>
        <div className="flex items-center justify-center min-h-screen">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando professores...</p>
          </Card>
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
                <PiUsers className="w-8 h-8 text-theme-primary" />
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
                <PiUsers className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalTeachers}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Professores Cadastrados
              </Text>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiCheckCircle className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.verifiedTeachers}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Perfis Verificados
              </Text>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-yellow to-accent-orange rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiStar className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.averageRating.toFixed(1)}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Avaliação Média
              </Text>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                <PiMusicNotes className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalActiveStudents}
              </div>
              <Text papel="rotulo" tom="fraco" as="div">
                Alunos Ativos
              </Text>
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
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
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
              <Inline gap={3}>
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
                  <PiFunnel className="w-4 h-4" />
                  <span>Filtros</span>
                  {hasActiveFilters && (
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  )}
                  <PiCaretDown
                    className={`w-4 h-4 transition-transform ${
                      isFiltersOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {hasActiveFilters && (
                  <Button
                    variante="secundario"
                    type="submit"
                    onClick={clearFilters}
                    disabled={isLoading}
                  >
                    <PiX className="w-4 h-4" />
                    <NomeAcao acao="fechar" />
                  </Button>
                )}
              </Inline>
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

                <Inline gap={4} className="mt-4">
                  <Inline as="label" gap={2} className="cursor-pointer">
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
                  </Inline>
                </Inline>
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
                <Text papel="rotulo" tom="fraco" as="p" className="mt-1">
                  Filtros aplicados
                </Text>
              )}
            </div>

            {pagination.total > pagination.limit && (
              <Text papel="rotulo" tom="fraco" as="div">
                Página {currentFilters.page || 1} de{' '}
                {Math.ceil(pagination.total / pagination.limit)}
              </Text>
            )}
          </div>
        </AnimatedItem>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <AnimatedItem direction="up" springType="gentle">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-theme-secondary to-theme-tertiary rounded-3xl flex items-center justify-center mx-auto mb-6">
                <PiUsers className="w-10 h-10 text-theme-primary" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                Nenhum professor encontrado
              </h3>
              <p className="text-theme-secondary max-w-md mx-auto mb-6">
                Tente ajustar os filtros ou termos de busca para encontrar mais
                resultados.
              </p>
              {hasActiveFilters && (
                <Button
                  variante="primario"
                  type="submit"
                  onClick={clearFilters}
                >
                  Limpar Filtros
                </Button>
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
            <Inline gap={2} className="justify-center">
              {/* Previous */}
              <Button
                variante="secundario"
                type="submit"
                onClick={() => handlePageChange((currentFilters.page || 1) - 1)}
                disabled={isLoading || (currentFilters.page || 1) <= 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </Button>

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
              <Button
                variante="secundario"
                type="submit"
                onClick={() => handlePageChange((currentFilters.page || 1) + 1)}
                disabled={isLoading || !pagination.hasMore}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </Button>
            </Inline>
          </AnimatedItem>
        )}
      </AnimatedContainer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-bg-overlay backdrop-blur-sm z-50 flex items-center justify-center">
          <Card densidade="larga" className="text-center">
            <PiArrowsClockwise className="w-8 h-8 animate-spin text-brand-primary mx-auto mb-4" />
            <p className="text-theme-secondary">Carregando professores...</p>
          </Card>
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
                <PiUser className="w-8 h-8 text-theme-primary" />
              </div>
            )}

            <div className="flex-1">
              <Inline gap={2}>
                <h3 className="text-lg font-bold text-theme-primary">
                  {teacher.name}
                </h3>
                {teacher.isVerified && (
                  <div className="w-5 h-5 bg-accent-green rounded-full flex items-center justify-center">
                    <PiCheckCircle className="w-3 h-3 text-theme-primary" />
                  </div>
                )}
              </Inline>

              {/* Rating */}
              {teacher.averageRating && teacher.totalReviews > 0 && (
                <Inline gap={2} className="mt-1">
                  <Inline gap={1}>
                    <PiStar className="w-4 h-4 text-accent-yellow" />
                    <Text papel="rotulo" tom="forte" className="font-medium">
                      {teacher.averageRating.toFixed(1)}
                    </Text>
                  </Inline>
                  <Text papel="legenda" tom="fraco">
                    ({teacher.totalReviews} avaliações)
                  </Text>
                </Inline>
              )}

              {/* Location */}
              {teacher.location && (
                <Inline gap={1} className="mt-1">
                  <PiMapPin className="w-3 h-3 text-theme-tertiary" />
                  <Text papel="legenda" tom="fraco">
                    {teacher.location}
                  </Text>
                </Inline>
              )}
            </div>
          </div>

          {/* Bio */}
          {teacher.publicBio && (
            <Text
              papel="rotulo"
              tom="suave"
              as="p"
              className="mb-4 line-clamp-3"
            >
              {teacher.publicBio}
            </Text>
          )}

          {/* Experience */}
          <Text
            papel="legenda"
            tom="fraco"
            as="div"
            className="flex items-center justify-between mb-4"
          >
            <Inline gap={1}>
              <PiClock className="w-3 h-3" />
              <span>{teacher.yearsExperience} anos de experiência</span>
            </Inline>
            <Inline gap={1}>
              <PiUsers className="w-3 h-3" />
              <span>{teacher.totalStudents} alunos</span>
            </Inline>
          </Text>

          {/* Specialties */}
          {teacher.specialties.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {teacher.specialties.slice(0, 3).map((specialty, index) => (
                  <Text
                    papel="legenda"
                    tom="ouro"
                    key={index}
                    className="px-2 py-1 bg-brand-primary/10 rounded-full"
                  >
                    {specialty}
                  </Text>
                ))}
                {teacher.specialties.length > 3 && (
                  <Text
                    papel="legenda"
                    tom="fraco"
                    className="px-2 py-1 bg-theme-secondary rounded-full"
                  >
                    +{teacher.specialties.length - 3}
                  </Text>
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
              <PiArrowSquareOut className="w-4 h-4" />
              <span>Ver Perfil Completo</span>
            </Link>

            {/* Contact Options */}
            <Inline gap={2}>
              {teacher.phone && (
                <Inline
                  as="button"
                  gap={2}
                  onClick={() => onWhatsAppContact(teacher)}
                  className="btn-classical-secondary flex-1 justify-center text-accent-green border-accent-green/30 hover:bg-accent-green/10"
                >
                  <PiChatCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </Inline>
              )}

              {teacher.email && (
                <Inline
                  as="button"
                  gap={2}
                  onClick={() => onEmailContact(teacher)}
                  className="btn-classical-secondary flex-1 justify-center"
                >
                  <PiEnvelopeSimple className="w-4 h-4" />
                  <span>Email</span>
                </Inline>
              )}
            </Inline>
          </div>
        </div>
      </AnimatedCard>
    </AnimatedItem>
  );
}
