// app/difficulty/DifficultyClient.tsx - Cliente Principal

'use client';
import { useState, useCallback, useTransition, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PiInfo, PiMagnifyingGlass, PiTrendUp, PiX } from 'react-icons/pi';
import { DifficultyResponse } from '@/app/requests/difficulty-details';
import DifficultyTabs from '../../components/DifficultyTabs';
import DifficultyTable from '../../components/DifficultyTable';
import DifficultyStats from '../../components/DifficultyStats';
import DifficultyInfo from '../../components/DifficultyInfo';
import PaginationControls from '../PaginationControls';
import AnimatedMusicalNotes2 from '../AnimatedMusicalNotes2';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
} from '../animation/AnimatedComponents';
import Select from '../Common/Select';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Card } from '@/app/components/ui/Card';

interface DifficultyClientProps {
  difficultyData: DifficultyResponse;
  stats: {
    totalWorks: number;
    totalInstruments: number;
    averageLevel: number;
    mostCommonLevel: string;
    systemDistribution: { system: string; count: number; percentage: number }[];
  };
  currentPage: number;
  searchParams: {
    instrument?: string;
    level?: string;
    system?: string;
    search?: string;
  };
}

export default function DifficultyClient({
  difficultyData,
  stats,
  currentPage,
  searchParams,
}: DifficultyClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Estados locais
  const [searchTerm, setSearchTerm] = useState(searchParams.search || '');
  const [selectedInstrument, setSelectedInstrument] = useState(
    searchParams.instrument || 'all'
  );
  const [selectedLevel, setSelectedLevel] = useState(
    searchParams.level || 'all'
  );
  const [selectedSystem, setSelectedSystem] = useState(
    searchParams.system || 'IMSLP'
  );
  const [showInfo, setShowInfo] = useState(false);

  // Calcular estatísticas
  const { totalPages, hasActiveFilters } = useMemo(() => {
    const totalPages = Math.ceil(difficultyData.totalCount / 50);
    const hasActiveFilters = !!(
      searchParams.search ||
      (searchParams.instrument && searchParams.instrument !== 'all') ||
      (searchParams.level && searchParams.level !== 'all') ||
      (searchParams.system && searchParams.system !== 'IMSLP')
    );

    return { totalPages, hasActiveFilters };
  }, [difficultyData.totalCount, searchParams]);

  // Atualizar URL
  const updateSearchParams = useCallback(
    (newParams: Record<string, string | undefined>) => {
      const params = new URLSearchParams();

      // Manter parâmetros existentes
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && key !== 'page') {
          params.set(key, value);
        }
      });

      // Aplicar novos parâmetros
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Resetar página quando há filtros
      if (Object.keys(newParams).some((key) => key !== 'page')) {
        params.delete('page');
      }

      const queryString = params.toString();

      startTransition(() => {
        router.push(`/difficulty${queryString ? `?${queryString}` : ''}`);
      });
    },
    [searchParams, router]
  );

  // Handlers
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      updateSearchParams({ search: searchTerm || undefined });
    },
    [searchTerm, updateSearchParams]
  );

  const handleInstrumentChange = useCallback(
    (instrumentId: string) => {
      setSelectedInstrument(instrumentId);
      updateSearchParams({ instrument: instrumentId });
    },
    [updateSearchParams]
  );

  const handleLevelChange = useCallback(
    (level: string) => {
      setSelectedLevel(level);
      updateSearchParams({ level });
    },
    [updateSearchParams]
  );

  const handleSystemChange = useCallback(
    (system: string) => {
      setSelectedSystem(system);
      updateSearchParams({ system });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      updateSearchParams({ page: page.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [updateSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedInstrument('all');
    setSelectedLevel('all');
    setSelectedSystem('IMSLP');
    startTransition(() => {
      router.push('/difficulty');
    });
  }, [router]);

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header Section */}
        <div className="relative text-center py-16">
          <AnimatedMusicalNotes2 />

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiTrendUp className="w-10 h-10 text-theme-primary" />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Níveis de Dificuldade
            </h1>
            <p className="text-xl text-theme-secondary max-w-4xl mx-auto classical-subtitle mb-6">
              Explore obras de música clássica organizadas por nível de
              dificuldade baseado no sistema IMSLP e RCM
            </p>

            {/* Info Button */}
            <AnimatedItem hover="scale">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="inline-flex items-center space-x-2 px-4 py-2 border rounded-full text-sm font-medium transition-all duration-300"
              >
                <PiInfo className="w-4 h-4" />
                <span>Sobre os Níveis de Dificuldade</span>
              </button>
            </AnimatedItem>
          </div>
        </div>

        {/* Info Panel */}
        {showInfo && (
          <AnimatedItem direction="down" springType="gentle">
            <DifficultyInfo onClose={() => setShowInfo(false)} />
          </AnimatedItem>
        )}

        {/* Stats Section */}
        <AnimatedItem direction="up" springType="gentle">
          <DifficultyStats stats={stats} />
        </AnimatedItem>

        {/* Search and Filters */}
        <AnimatedCard
          hover="none"
          className="classical-card p-6 relative z-elevado"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                Buscar por Dificuldade
              </h3>
              <Text papel="rotulo" tom="suave" as="p">
                Encontre obras adequadas ao seu nível técnico
              </Text>
            </div>

            {/* System Selector */}
            <Inline gap={3}>
              <Text papel="rotulo" tom="suave" className="font-medium">
                Sistema:
              </Text>
              <Select
                options={difficultyData.systems.map((system) => ({
                  value: system.system,
                  label: `${system.system} (${system.count})`,
                }))}
                value={selectedSystem}
                onChange={(e) => handleSystemChange(e.target.value)}
                className="input-classical-2 text-sm min-w-[120px]"
                disabled={isPending}
              />
            </Inline>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-6">
            <div className="relative">
              <PiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Buscar por título, compositor ou opus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-classical pl-12 pr-12 w-full"
                disabled={isPending}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-tertiary transition-colors"
                >
                  <PiX className="w-5 h-5" />
                  <NomeAcao acao="fechar" />
                </button>
              )}
            </div>
          </form>

          {/* Level Filter */}
          {difficultyData.difficultyLevels.length > 0 && (
            <Stack gap={3} className="mb-6">
              <label className="block text-sm font-medium text-theme-secondary">
                Filtrar por Nível:
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleLevelChange('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedLevel === 'all'
                      ? 'text-theme-inverse'
                      : 'bg-theme-elevated border border-theme-secondary text-theme-secondary'
                  }`}
                  disabled={isPending}
                >
                  Todos ({difficultyData.totalCount})
                </button>
                {difficultyData.difficultyLevels.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => handleLevelChange(level.level)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedLevel === level.level
                        ? 'text-theme-inverse'
                        : 'bg-theme-elevated border border-theme-secondary text-theme-secondary'
                    }`}
                    disabled={isPending}
                  >
                    Nível {level.level} ({level.count})
                  </button>
                ))}
              </div>
            </Stack>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex items-center gap-3 mb-4 flex-wrap pt-4 border-t border-theme-secondary">
              <Text papel="rotulo" tom="suave" className="font-medium">
                Filtros ativos:
              </Text>

              {searchParams.search && (
                <Text
                  papel="rotulo"
                  tom="ouro"
                  className="inline-flex items-center gap-2 px-3 py-1 border rounded-full"
                >
                  Busca: &quot;{searchParams.search}&quot;
                  <button
                    onClick={() => updateSearchParams({ search: undefined })}
                    className="transition-colors"
                  >
                    <PiX className="w-3 h-3" />
                    <NomeAcao acao="fechar" />
                  </button>
                </Text>
              )}

              <button
                onClick={clearFilters}
                className="text-sm underline font-medium"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </AnimatedCard>

        {/* Tabs and Table */}
        <div className="space-y-6">
          {/* Instrument Tabs */}
          <AnimatedItem direction="up" springType="gentle">
            <DifficultyTabs
              instruments={difficultyData.instruments}
              selectedInstrument={selectedInstrument}
              onInstrumentChange={handleInstrumentChange}
              isPending={isPending}
            />
          </AnimatedItem>

          {/* Results Table */}
          <AnimatedItem direction="up" springType="gentle">
            <DifficultyTable
              works={difficultyData.works}
              selectedSystem={selectedSystem}
              isPending={isPending}
            />
          </AnimatedItem>

          {/* Pagination */}
          {totalPages > 1 && (
            <AnimatedItem direction="up" springType="gentle">
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isPending={isPending}
              />
            </AnimatedItem>
          )}
        </div>

        {/* Loading Overlay */}
        {isPending && (
          <AnimatedItem direction="scale" springType="gentle">
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-dialogo">
              <Card densidade="larga" className="text-center">
                <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-theme-primary font-medium">
                  Carregando obras...
                </p>
              </Card>
            </div>
          </AnimatedItem>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}
