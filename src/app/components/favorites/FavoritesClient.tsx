// app/favorites/FavoritesClient.tsx - Com Partituras Favoritadas
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FiHeart,
  FiUser,
  FiMusic,
  FiSearch,
  FiExternalLink,
  FiClock,
  FiBookOpen,
  FiFileText, // 🆕 Para partituras
  FiStar, // 🆕 Para rating
} from 'react-icons/fi';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import Image from 'next/image';
import FavoriteButton from '../FavoriteButton';
import EmptyStateFavorites from './EmptyStateFavorites';
import ViewModeToggle, { ViewMode } from '../ViewModeToggle';
import FavoriteScoreButton from '../FavoriteScoreButton';
import MostFavoritedBadge from '../MostFavoritedBadge';

// Importar componentes de animação
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
} from '../animation/AnimatedComponents';

// 🆕 Atualizar tipo para incluir 'scores'
type FilterTab = 'all' | 'composers' | 'works' | 'scores';

export default function FavoritesClient() {
  // 🆕 Incluir favoriteScores do store
  const { favoriteComposers, favoriteWorks, favoriteScores } =
    useFavoritesStore();

  // States
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter control functions
  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
  };

  // 🆕 Filter logic atualizado para incluir partituras
  const filteredData = useMemo(() => {
    let composersFiltered = [...favoriteComposers];
    let worksFiltered = [...favoriteWorks];
    let scoresFiltered = [...favoriteScores]; // 🆕

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      composersFiltered = composersFiltered.filter(
        (item) =>
          item.composer?.name.toLowerCase().includes(query) ||
          item.composer?.fullName.toLowerCase().includes(query)
      );

      worksFiltered = worksFiltered.filter(
        (item) =>
          item.work?.title.toLowerCase().includes(query) ||
          item.work?.composer.name.toLowerCase().includes(query) ||
          item.work?.composer.fullName.toLowerCase().includes(query)
      );

      // 🆕 Filtro para partituras
      scoresFiltered = scoresFiltered.filter(
        (item) =>
          item.scoreTitle.toLowerCase().includes(query) ||
          item.work?.title.toLowerCase().includes(query) ||
          item.work?.composer.name.toLowerCase().includes(query) ||
          item.work?.composer.fullName.toLowerCase().includes(query)
      );
    }

    return {
      composers: composersFiltered,
      works: worksFiltered,
      scores: scoresFiltered, // 🆕
    };
  }, [favoriteComposers, favoriteWorks, favoriteScores, searchQuery]);

  // 🆕 Statistics atualizadas para incluir partituras
  const stats = useMemo(() => {
    const totalItems =
      favoriteComposers.length + favoriteWorks.length + favoriteScores.length;

    return {
      totalItems,
      composersCount: favoriteComposers.length,
      worksCount: favoriteWorks.length,
      scoresCount: favoriteScores.length, // 🆕
      avgPerComposer:
        favoriteComposers.length > 0
          ? Math.round((favoriteWorks.length / favoriteComposers.length) * 10) /
            10
          : 0,
    };
  }, [favoriteComposers, favoriteWorks, favoriteScores]);

  return (
    <PageContainer showBackground={true}>
      <AnimatedContainer delay={0.1} staggerSpeed="normal">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-16">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiHeart className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Seus Favoritos
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Sua coleção pessoal de música clássica - compositores, obras e
              partituras que tocam seu coração
            </p>
          </div>
        </AnimatedItem>

        {/* 🆕 Statistics Cards atualizadas */}
        {/* <AnimatedItem direction="up" springType="gentle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHeart className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalItems}
              </div>
              <div className="text-sm text-theme-tertiary">
                Total de Favoritos
              </div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiUser className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.composersCount}
              </div>
              <div className="text-sm text-theme-tertiary">Compositores</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiMusic className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.worksCount}
              </div>
              <div className="text-sm text-theme-tertiary">Obras</div>
            </AnimatedCard>

            <AnimatedCard
              hover="scale"
              className="classical-card p-6 text-center"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red to-accent-pink rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiFileText className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.scoresCount}
              </div>
              <div className="text-sm text-theme-tertiary">Partituras</div>
            </AnimatedCard>
          </div>
        </AnimatedItem> */}

        {/* Controls */}
        <AnimatedItem direction="up" springType="gentle">
          <AnimatedCard hover="none" className="classical-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* 🆕 Tabs atualizadas para incluir 'scores' */}
              <div className="flex bg-theme-secondary rounded-xl p-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-brand-primary bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Todos ({stats.totalItems})
                </button>
                <button
                  onClick={() => setActiveTab('composers')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'composers'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Compositores ({stats.composersCount})
                </button>
                <button
                  onClick={() => setActiveTab('works')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'works'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Obras ({stats.worksCount})
                </button>
                {/* 🆕 Nova aba para partituras */}
                <button
                  onClick={() => setActiveTab('scores')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === 'scores'
                      ? 'bg-theme-tertiary text-theme-primary shadow-md'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  Partituras ({stats.scoresCount})
                </button>
              </div>

              {/* Search and View Mode */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar nos favoritos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-classical w-full sm:w-96"
                  />
                </div>

                {/* View Mode Toggle */}
                <ViewModeToggle
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>
          </AnimatedCard>
        </AnimatedItem>

        {/* Content */}
        {stats.totalItems === 0 ? (
          /* Estado completamente vazio - nenhum favorito */
          <AnimatedItem direction="scale" springType="bouncy">
            <EmptyStateFavorites
              emptyState="all"
              filters={false}
              onClearFilters={clearFilters}
            />
          </AnimatedItem>
        ) : (
          <div className="space-y-8">
            {/* Composers Section */}
            {(activeTab === 'all' || activeTab === 'composers') && (
              <>
                {filteredData.composers.length > 0 ? (
                  <AnimatedItem
                    direction="up"
                    className="mt-4"
                    springType="gentle"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <FiUser className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          Compositores Favoritos
                        </h2>
                        <p className="text-theme-tertiary">
                          {filteredData.composers.length} de{' '}
                          {favoriteComposers.length} compositores
                        </p>
                      </div>
                    </div>

                    {viewMode === 'cards' ? (
                      <SequentialGrid
                        cols={3}
                        gap={6}
                        delayBetweenItems={0.1}
                        className=""
                      >
                        {filteredData.composers.map((favorite) => (
                          <ComposerFavoriteCard
                            key={favorite.id}
                            favorite={favorite}
                            viewMode={viewMode}
                          />
                        ))}
                      </SequentialGrid>
                    ) : (
                      <div className="space-y-4">
                        {filteredData.composers.map((favorite, index) => (
                          <AnimatedItem
                            key={favorite.id}
                            direction="left"
                            hover="lift"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: 'backwards',
                            }}
                          >
                            <ComposerFavoriteCard
                              favorite={favorite}
                              viewMode={viewMode}
                            />
                          </AnimatedItem>
                        ))}
                      </div>
                    )}
                  </AnimatedItem>
                ) : (
                  <>
                    {activeTab === 'composers' && (
                      <AnimatedItem direction="scale" springType="bouncy">
                        {favoriteComposers.length === 0 ? (
                          <EmptyStateFavorites
                            emptyState="composers"
                            filters={false}
                            onClearFilters={clearFilters}
                          />
                        ) : (
                          <EmptyStateFavorites
                            emptyState="composers"
                            filters={true}
                            onClearFilters={clearFilters}
                          />
                        )}
                      </AnimatedItem>
                    )}
                  </>
                )}
              </>
            )}

            {/* Works Section */}
            {(activeTab === 'all' || activeTab === 'works') && (
              <>
                {filteredData.works.length > 0 ? (
                  <AnimatedItem
                    direction="up"
                    className="mt-4"
                    springType="gentle"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <FiMusic className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          Obras Favoritas
                        </h2>
                        <p className="text-theme-tertiary">
                          {filteredData.works.length} de {favoriteWorks.length}{' '}
                          obras
                        </p>
                      </div>
                    </div>

                    {viewMode === 'cards' ? (
                      <SequentialGrid
                        cols={3}
                        gap={6}
                        delayBetweenItems={0.1}
                        className=""
                      >
                        {filteredData.works.map((favorite) => (
                          <WorkFavoriteCard
                            key={favorite.id}
                            favorite={favorite}
                            viewMode={viewMode}
                          />
                        ))}
                      </SequentialGrid>
                    ) : (
                      <div className="space-y-4">
                        {filteredData.works.map((favorite, index) => (
                          <AnimatedItem
                            key={favorite.id}
                            direction="left"
                            hover="lift"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: 'backwards',
                            }}
                          >
                            <WorkFavoriteCard
                              favorite={favorite}
                              viewMode={viewMode}
                            />
                          </AnimatedItem>
                        ))}
                      </div>
                    )}
                  </AnimatedItem>
                ) : (
                  <>
                    {activeTab === 'works' && (
                      <AnimatedItem direction="scale" springType="bouncy">
                        {favoriteWorks.length === 0 ? (
                          <EmptyStateFavorites
                            emptyState="works"
                            filters={false}
                            onClearFilters={clearFilters}
                          />
                        ) : (
                          <EmptyStateFavorites
                            emptyState="works"
                            filters={true}
                            onClearFilters={clearFilters}
                          />
                        )}
                      </AnimatedItem>
                    )}
                  </>
                )}
              </>
            )}

            {/* 🆕 Scores Section */}
            {(activeTab === 'all' || activeTab === 'scores') && (
              <>
                {filteredData.scores.length > 0 ? (
                  <AnimatedItem
                    direction="up"
                    className="mt-4"
                    springType="gentle"
                  >
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                        <FiFileText className="w-5 h-5 text-theme-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-theme-primary classical-title">
                          Partituras Favoritas
                        </h2>
                        <p className="text-theme-tertiary">
                          {filteredData.scores.length} de{' '}
                          {favoriteScores.length} partituras
                        </p>
                      </div>
                    </div>

                    {viewMode === 'cards' ? (
                      <SequentialGrid
                        cols={3}
                        gap={6}
                        delayBetweenItems={0.1}
                        className=""
                      >
                        {filteredData.scores.map((favorite) => (
                          <ScoreFavoriteCard
                            key={favorite.id}
                            favorite={favorite}
                            viewMode={viewMode}
                          />
                        ))}
                      </SequentialGrid>
                    ) : (
                      <div className="space-y-4">
                        {filteredData.scores.map((favorite, index) => (
                          <AnimatedItem
                            key={favorite.id}
                            direction="left"
                            hover="lift"
                            style={{
                              animationDelay: `${index * 0.1}s`,
                              animationFillMode: 'backwards',
                            }}
                          >
                            <ScoreFavoriteCard
                              favorite={favorite}
                              viewMode={viewMode}
                            />
                          </AnimatedItem>
                        ))}
                      </div>
                    )}
                  </AnimatedItem>
                ) : (
                  <>
                    {activeTab === 'scores' && (
                      <AnimatedItem direction="scale" springType="bouncy">
                        {favoriteScores.length === 0 ? (
                          <EmptyStateFavorites
                            emptyState="scores"
                            filters={false}
                            onClearFilters={clearFilters}
                          />
                        ) : (
                          <EmptyStateFavorites
                            emptyState="scores"
                            filters={true}
                            onClearFilters={clearFilters}
                          />
                        )}
                      </AnimatedItem>
                    )}
                  </>
                )}
              </>
            )}

            {/* Estado vazio quando há favoritos mas nenhum passa nos filtros da aba "Todos" */}
            {activeTab === 'all' &&
              filteredData.composers.length === 0 &&
              filteredData.works.length === 0 &&
              filteredData.scores.length === 0 &&
              (favoriteComposers.length > 0 ||
                favoriteWorks.length > 0 ||
                favoriteScores.length > 0) && (
                <AnimatedItem
                  direction="scale"
                  className="mt-4"
                  springType="bouncy"
                >
                  <EmptyStateFavorites
                    emptyState="all"
                    filters={true}
                    onClearFilters={clearFilters}
                  />
                </AnimatedItem>
              )}
          </div>
        )}
      </AnimatedContainer>
    </PageContainer>
  );
}

// Componente para Composer Favorite Card (mantido igual)
interface ComposerFavoriteCardProps {
  favorite: any;
  viewMode: ViewMode;
}

function ComposerFavoriteCard({
  favorite,
  viewMode,
}: ComposerFavoriteCardProps) {
  return (
    <AnimatedCard
      hover="lift"
      className={`classical-card p-6 group hover:shadow-theme-glow transition-all ${
        viewMode === 'list' ? 'flex items-center space-x-6' : ''
      }`}
    >
      <div
        className={`${
          viewMode === 'list' ? 'flex items-center space-x-4 flex-1' : ''
        }`}
      >
        {favorite.composer && (
          <div className="flex-1">
            <Link
              href={`/composer/${favorite.composer.id}`}
              className="flex align-center gap-6 group-hover:text-brand-primary transition-colors"
            >
              <div className="relative w-16 h-16">
                {favorite.composer?.portraitUrl ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-500">
                    <Image
                      src={favorite.composer.portraitUrl}
                      alt={favorite.composer.name}
                      fill
                      sizes="112px"
                      className="object-cover transition-all duration-700 group-hover:scale-110 opacity-100"
                      priority={false}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-500 group-hover:scale-110">
                    <FiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <div className="inline-flex items-center py-0.5">
                  <FiUser className="w-3 h-3 mr-1" />
                  <h3 className="font-bold ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 w-11/12 truncate flex-1">
                    {favorite.composer?.fullName || favorite.composer?.name}
                  </h3>
                </div>

                <span className="inline-flex items-center px-3 justify-center py-1 mt-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-xs font-medium">
                  <FiClock className="w-2.5 h-2.5 mr-1" />
                  {favorite.composer?.epochName &&
                    `${favorite.composer.epochName}`}
                </span>
              </div>

              <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <FavoriteButton
                  id={favorite.composer.id}
                  type="composer"
                  variant="small"
                  size="md"
                  itemName={favorite.composer.fullName}
                  showToast={true}
                />
              </div>
            </Link>
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
            <Link
              href={`/composer/${favorite.composer?.id}`}
              className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>Ver Perfil</span>
              <FiExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

// Componente para Work Favorite Card (mantido igual)
interface WorkFavoriteCardProps {
  favorite: any;
  viewMode: ViewMode;
}

function WorkFavoriteCard({ favorite, viewMode }: WorkFavoriteCardProps) {
  return (
    <AnimatedCard
      hover="lift"
      className={`classical-card p-6 group hover:shadow-theme-glow transition-all ${
        viewMode === 'list' ? 'flex items-center space-x-6' : ''
      }`}
    >
      <div
        className={`${
          viewMode === 'list'
            ? 'flex items-center space-x-4 flex-1'
            : 'flex flex-col justify-between h-full'
        }`}
      >
        {favorite.work && (
          <div className="flex-1">
            <Link
              href={`/works/${favorite.work?.id}`}
              className="block group-hover:text-brand-primary transition-colors"
            >
              <div
                className={`flex items-start gap-3 mb-1 ${
                  viewMode === 'cards' ? 'flex-col' : ''
                }`}
              >
                <div className="inline-flex items-center py-0.5">
                  <h3 className="font-bold ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 w-11/12 flex-1">
                    {favorite.work.title}
                  </h3>
                </div>
                <div className="flex gap-4 items-center">
                  {favorite.work?.opOrCatalog && (
                    <span className="inline-flex items-center px-2 py-0.5 bg-theme-elevated border border-theme-primary/30 text-theme-secondary rounded-md text-xs font-medium flex-shrink-0">
                      <FiBookOpen className="w-2.5 h-2.5 mr-1" />
                      {favorite.work?.opOrCatalog}
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <FavoriteButton
                    id={favorite.work.id}
                    type="work"
                    variant="small"
                    size="md"
                    itemName={favorite.work.title}
                    showToast={true}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <div
                  className="inline-flex items-center text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiUser className="w-3 h-3 mr-1" />
                  {favorite.work.composer.fullName}
                </div>
              </div>
            </Link>
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
            <Link
              href={`/works/${favorite.work?.id}`}
              className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>Ver Obra</span>
              <FiExternalLink className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}

// 🆕 Componente para Score Favorite Card
interface ScoreFavoriteCardProps {
  favorite: any;
  viewMode: ViewMode;
}

function ScoreFavoriteCard({ favorite, viewMode }: ScoreFavoriteCardProps) {
  return (
    <AnimatedCard
      hover="lift"
      className={`classical-card p-6 group hover:shadow-theme-glow transition-all ${
        viewMode === 'list' ? 'flex items-center space-x-6' : ''
      }`}
    >
      <div
        className={`${
          viewMode === 'list'
            ? 'flex items-center space-x-4 flex-1'
            : 'flex flex-col justify-between h-full'
        }`}
      >
        <div className="flex-1 relative">
          {/* 🆕 Badge de mais favoritada */}
          <MostFavoritedBadge
            workId={favorite.workId}
            scoreId={favorite.scoreId}
            scoreSource={favorite.scoreSource}
            variant="crown"
            size="sm"
            position="corner"
          />

          <Link
            href={`/works/${favorite.workId}`}
            className="block group-hover:text-brand-primary transition-colors"
          >
            <div
              className={`flex items-start gap-3 mb-2 ${
                viewMode === 'cards' ? 'flex-col' : ''
              }`}
            >
              <div className="inline-flex items-center py-0.5">
                <FiFileText className="w-3 h-3 mr-1" />
                <h3 className="font-bold ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 flex-1 line-clamp-2">
                  {favorite.scoreTitle}
                </h3>
              </div>

              <div className="flex gap-2 items-center flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 bg-accent-red/10 border border-accent-red/30 text-accent-red rounded-md text-xs font-medium">
                  <FiHeart className="w-2.5 h-2.5 mr-1" />
                  {favorite.scoreType}
                </span>

                <span className="inline-flex items-center px-2 py-0.5 bg-theme-elevated border border-theme-primary/30 text-theme-secondary rounded-md text-xs font-medium">
                  {favorite.scoreSource}
                </span>
              </div>
            </div>

            {/* Informações da obra */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center space-x-2">
                <FiMusic className="w-3 h-3 text-accent-blue" />
                <span className="text-sm text-accent-blue hover:text-accent-purple transition-colors font-medium">
                  {favorite.work?.title}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <FiUser className="w-3 h-3 text-theme-tertiary" />
                <span className="text-sm text-theme-tertiary">
                  {favorite.work?.composer?.fullName}
                </span>
              </div>
            </div>

            {/* Metadados pessoais */}
            {(favorite.personalRating ||
              favorite.notes ||
              favorite.tags?.length > 0) && (
              <div className="space-y-2 mb-3 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
                {favorite.personalRating && (
                  <div className="flex items-center space-x-2">
                    <FiStar className="w-3 h-3 text-accent-gold" />
                    <span className="text-sm text-accent-gold font-medium">
                      {favorite.personalRating}/5 estrelas
                    </span>
                  </div>
                )}

                {favorite.notes && (
                  <p className="text-xs text-theme-secondary line-clamp-2">
                    {favorite.notes}
                  </p>
                )}

                {favorite.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {favorite.tags
                      .slice(0, 3)
                      .map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-1.5 py-0.5 bg-brand-primary/10 text-brand-primary rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    {favorite.tags.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-theme-secondary/20 text-theme-tertiary rounded text-xs">
                        +{favorite.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Data de adição */}
            <div className="text-xs text-theme-tertiary flex items-center space-x-1">
              <FiClock className="w-3 h-3" />
              <span>
                Favoritada em{' '}
                {new Date(favorite.addedAt).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </Link>

          {/* Botão de favoritar */}
          <div className="absolute top-4 right-4 flex space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <FavoriteScoreButton
              workId={favorite.workId}
              score={{
                id: favorite.scoreId,
                title: favorite.scoreTitle,
                type: favorite.scoreType,
                downloadUrl: favorite.downloadUrl, // Não temos esse dado aqui
                fileSize: favorite.fileSize,
                pageCount: favorite.pageCount,
                fileFormat: favorite.fileFormat,
              }}
              variant="compact"
              size="sm"
            />
          </div>
        </div>

        {viewMode === 'cards' && (
          <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-between">
            <Link
              href={`/works/${favorite.workId}`}
              className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <span>Ver Obra</span>
              <FiExternalLink className="w-3 h-3" />
            </Link>

            {/* Link direto para download se disponível */}
            {/* {favorite.downloadUrl && (
              <a
                href={favorite.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent-green hover:text-accent-blue text-sm font-medium transition-colors flex items-center space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload className="w-3 h-3" />
                <span>Download</span>
              </a>
            )} */}
          </div>
        )}
      </div>
    </AnimatedCard>
  );
}
