// app/favorites/FavoritesClient.tsx - REDESIGN PREMIUM
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  FiHeart,
  FiUser,
  FiMusic,
  FiGrid,
  FiList,
  FiSearch,
  FiStar,
  FiExternalLink,
  FiClock,
  FiBookOpen,
} from 'react-icons/fi';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useAuth } from '@/app/hooks/useAuth';
import Image from 'next/image';
import FavoriteButton from '../FavoriteButton';
import { FaBook } from 'react-icons/fa';
import EmptyStateFavorites from './EmptyStateFavorites';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'composers' | 'works';

export default function FavoritesClient() {
  const { favoriteComposers, favoriteWorks } = useFavoritesStore();
  const { isAuthenticated } = useAuth();

  // States
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter control functions
  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('all');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || activeTab !== 'all';

  // Filter logic
  const filteredData = useMemo(() => {
    let composersFiltered = [...favoriteComposers];
    let worksFiltered = [...favoriteWorks];

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
    }

    return { composers: composersFiltered, works: worksFiltered };
  }, [favoriteComposers, favoriteWorks, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalItems = favoriteComposers.length + favoriteWorks.length;

    return {
      totalItems,
      composersCount: favoriteComposers.length,
      worksCount: favoriteWorks.length,
      avgPerComposer:
        favoriteComposers.length > 0
          ? Math.round((favoriteWorks.length / favoriteComposers.length) * 10) /
            10
          : 0,
    };
  }, [favoriteComposers, favoriteWorks]);

  if (!mounted) {
    return (
      <div className="bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando seus favoritos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className=" bg-gradient-primary flex items-center justify-center">
        <div className="text-center classical-card p-8 max-w-md">
          <FiHeart className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-2">
            Acesso Necessário
          </h1>
          <p className="text-theme-secondary mb-6">
            Faça login para acessar seus favoritos
          </p>
          <Link href="/login" className="btn-classical-primary">
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-primary">
      <div className="section-wrap space-y-8 relative z-10">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiHeart className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
              Seus Favoritos
            </h1>
            <p className="text-xl text-theme-secondary classical-subtitle">
              Sua coleção pessoal de música clássica - compositores e obras que
              tocam seu coração
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="classical-card p-6 text-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiHeart className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.totalItems}
              </div>
              <div className="text-sm text-theme-tertiary">
                Total de Favoritos
              </div>
            </div>

            <div className="classical-card p-6 text-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiUser className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.composersCount}
              </div>
              <div className="text-sm text-theme-tertiary">Compositores</div>
            </div>

            <div className="classical-card p-6 text-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiMusic className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-theme-primary mb-1">
                {stats.worksCount}
              </div>
              <div className="text-sm text-theme-tertiary">Obras</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div
          className="classical-card p-6 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs */}
            <div className="flex bg-theme-secondary rounded-xl p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'all'
                    ? 'bg-brand-primary bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Todos ({stats.totalItems})
              </button>
              <button
                onClick={() => setActiveTab('composers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'composers'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Compositores ({stats.composersCount})
              </button>
              <button
                onClick={() => setActiveTab('works')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'works'
                    ? 'bg-theme-tertiary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Obras ({stats.worksCount})
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
              <div className="bg-theme-secundary border border-theme-primary rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-brand-gradient text-brand-primary shadow-theme-glow'
                      : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand-gradient text-brand-primary shadow-theme-glow'
                      : 'text-theme-tertiary hover:text-theme-primary hover:bg-interactive-hover'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {stats.totalItems === 0 ? (
          /* Estado completamente vazio - nenhum favorito */
          <EmptyStateFavorites
            emptyState="all"
            filters={false}
            onClearFilters={clearFilters}
          />
        ) : (
          <div className="space-y-8">
            {/* Composers Section */}
            {(activeTab === 'all' || activeTab === 'composers') && (
              <>
                {filteredData.composers.length > 0 ? (
                  <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: '0.2s' }}
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

                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                          : 'space-y-4'
                      }
                    >
                      {filteredData.composers.map((favorite, index) => (
                        <div
                          key={favorite.id}
                          className={`classical-card p-6 group hover:shadow-theme-glow transition-all hover:scale-105 animate-fade-in-up ${
                            viewMode === 'list'
                              ? 'flex items-center space-x-6'
                              : ''
                          }`}
                          style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                        >
                          <div
                            className={`${
                              viewMode === 'list'
                                ? 'flex items-center space-x-4 flex-1'
                                : ''
                            }`}
                          >
                            {favorite.composer && (
                              <div className="flex-1">
                                <Link
                                  href={`/composer/${favorite.composer.id}`}
                                  className="flex align-center gap-6 group-hover:text-brand-primary transition-colors"
                                >
                                  <div className="relative w-16 h-16 ">
                                    {favorite.composer?.portraitUrl ? (
                                      <div className="relative w-full h-full rounded-full overflow-hidden border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-500">
                                        <Image
                                          src={favorite.composer.portraitUrl}
                                          alt={favorite.composer.name}
                                          fill
                                          sizes="112px"
                                          className={`object-cover transition-all duration-700 group-hover:scale-110 opacity-100`}
                                          priority={false}
                                          loading="lazy"
                                        />

                                        {/* Overlay gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full"></div>
                                      </div>
                                    ) : (
                                      // Fallback avatar
                                      <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-secondary rounded-full flex items-center justify-center border-3 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all duration-500 group-hover:scale-110">
                                        <FiUser className="w-8 h-8 md:w-10 md:h-10 text-theme-inverse" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col justify-center">
                                    <div className="inline-flex items-center py-0.5">
                                      <FiUser className="w-3 h-3 mr-1" />
                                      <h3 className="font-bold ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 max-w-11/12 flex-1">
                                        {favorite.composer?.fullName ||
                                          favorite.composer?.name}{' '}
                                      </h3>
                                    </div>

                                    <span className="inline-flex items-center px-3 justify-center py-1 mt-1 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary rounded-full text-xs font-medium">
                                      <FiClock className="w-2.5 h-2.5 mr-1" />
                                      {favorite.composer?.epochName &&
                                        `${favorite.composer.epochName}`}{' '}
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

                            {viewMode === 'grid' && (
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
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Estado vazio para compositores - só na aba específica */
                  <>
                    {activeTab === 'composers' && (
                      <>
                        {favoriteComposers.length === 0 ? (
                          /* Nunca favoritou compositores */
                          <EmptyStateFavorites
                            emptyState="composers"
                            filters={false}
                            onClearFilters={clearFilters}
                          />
                        ) : (
                          /* Tem compositores mas nenhum passou no filtro */
                          <EmptyStateFavorites
                            emptyState="composers"
                            filters={true}
                            onClearFilters={clearFilters}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* Works Section */}
            {(activeTab === 'all' || activeTab === 'works') && (
              <>
                {filteredData.works.length > 0 ? (
                  <div
                    className="animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}
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

                    <div
                      className={
                        viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                          : 'space-y-4'
                      }
                    >
                      {filteredData.works.map((favorite, index) => (
                        <div
                          key={favorite.id}
                          className={`classical-card p-6 group hover:shadow-theme-glow transition-all hover:scale-105 animate-fade-in-up ${
                            viewMode === 'list'
                              ? 'flex items-center space-x-6'
                              : ''
                          }`}
                          style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                        >
                          <div
                            className={`${
                              viewMode === 'list'
                                ? 'flex items-center space-x-4 flex-1'
                                : ''
                            }`}
                          >
                            {favorite.work && (
                              <div className="flex-1">
                                <Link
                                  href={`/works/${favorite.work?.id}`}
                                  className="block group-hover:text-brand-primary transition-colors"
                                >
                                  {/* Title and opus */}
                                  <div
                                    className={`flex items-start gap-3 mb-1 ${
                                      viewMode === 'grid' ? 'flex-col' : ''
                                    }`}
                                  >
                                    <div className="inline-flex items-center py-0.5">
                                      <FaBook className="w-3 h-3 mr-1" />
                                      <h3 className="font-bold ml-1 text-theme-primary classical-title group-hover:text-brand-primary transition-colors duration-300 max-w-11/12 flex-1">
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
                                      {/* Favorite Button */}
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

                                  {/* Composer info */}
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

                            {viewMode === 'grid' && (
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
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Estado vazio para obras - só na aba específica */
                  <>
                    {activeTab === 'works' && (
                      <>
                        {favoriteWorks.length === 0 ? (
                          /* Nunca favoritou obras */
                          <EmptyStateFavorites
                            emptyState="works"
                            filters={false}
                            onClearFilters={clearFilters}
                          />
                        ) : (
                          /* Tem obras mas nenhuma passou no filtro */
                          <EmptyStateFavorites
                            emptyState="works"
                            filters={true}
                            onClearFilters={clearFilters}
                          />
                        )}
                      </>
                    )}
                  </>
                )}
              </>
            )}

            {/* Estado vazio quando há favoritos mas nenhum passa nos filtros da aba "Todos" */}
            {activeTab === 'all' &&
              filteredData.composers.length === 0 &&
              filteredData.works.length === 0 &&
              (favoriteComposers.length > 0 || favoriteWorks.length > 0) && (
                <EmptyStateFavorites
                  emptyState="all"
                  filters={true}
                  onClearFilters={clearFilters}
                />
              )}
          </div>
        )}
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-red-500/30 rounded-full animate-pulse"></div>
      <div
        className="fixed top-40 right-8 w-1.5 h-1.5 bg-yellow-500/40 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="fixed bottom-32 left-8 w-1 h-1 bg-blue-500/50 rounded-full animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>
    </div>
  );
}
