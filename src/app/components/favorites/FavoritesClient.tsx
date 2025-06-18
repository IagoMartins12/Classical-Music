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
  FiCalendar,
  FiTrendingUp,
  FiStar,
  FiExternalLink,
  FiBookOpen,
} from 'react-icons/fi';
import {
  useFavoritesStore,
  FavoriteComposer,
  FavoriteWork,
} from '@/app/stores/useFavoritesStore';
import { useAuth } from '@/app/hooks/useAuth';

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
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary">Carregando seus favoritos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
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
    <div className="min-h-screen bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-500 to-red-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-green-500 to-green-600 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiHeart className="w-8 h-8 text-white" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiUser className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {stats.composersCount}
              </div>
              <div className="text-sm text-theme-tertiary">Compositores</div>
            </div>

            <div className="classical-card p-6 text-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiMusic className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {stats.worksCount}
              </div>
              <div className="text-sm text-theme-tertiary">Obras</div>
            </div>

            <div className="classical-card p-6 text-center group hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiTrendingUp className="w-6 h-6 text-theme-primary" />
              </div>
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.avgPerComposer}
              </div>
              <div className="text-sm text-theme-tertiary">
                Obras por Compositor
              </div>
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
                    ? 'bg-brand-primary text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Todos ({stats.totalItems})
              </button>
              <button
                onClick={() => setActiveTab('composers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'composers'
                    ? 'bg-blue-500 text-theme-primary shadow-md'
                    : 'text-theme-tertiary hover:text-theme-primary'
                }`}
              >
                Compositores ({stats.composersCount})
              </button>
              <button
                onClick={() => setActiveTab('works')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'works'
                    ? 'bg-yellow-500 text-theme-primary shadow-md'
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
                  className="input-classical w-full sm:w-64"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-theme-secondary rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-brand-primary text-theme-primary'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-brand-primary text-theme-primary'
                      : 'text-theme-tertiary hover:text-theme-primary'
                  }`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {stats.totalItems === 0 ? (
          /* Empty State */
          <div
            className="classical-card p-12 text-center animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="max-w-none lg:max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <FiHeart className="w-12 h-12 text-red-500/60" />
              </div>
              <h3 className="text-2xl font-bold text-theme-primary mb-4 classical-title">
                Comece sua jornada musical
              </h3>
              <p className="text-theme-secondary mb-8 classical-body">
                Descubra e favorite compositores e obras que inspiram você. Sua
                coleção pessoal aguarda para ser criada.
              </p>

              {/* Call to Action */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/composers"
                    className="btn-classical-primary flex items-center justify-center space-x-2 group"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>Explorar Compositores</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  <Link
                    href="/works"
                    className="btn-classical-secondary flex items-center justify-center space-x-2 group"
                  >
                    <FiMusic className="w-4 h-4" />
                    <span>Descobrir Obras</span>
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>
                </div>

                {/* Tip */}
                <div className="mt-8 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mt-0.5">
                      <FiStar className="w-3 h-3 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-semibold text-theme-primary text-sm mb-1">
                        Dica para começar
                      </h4>
                      <p className="text-xs text-theme-secondary">
                        Clique no ícone de coração ❤️ ao lado de qualquer
                        compositor ou obra para adicioná-los aos seus favoritos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Composers Section */}
            {(activeTab === 'all' || activeTab === 'composers') &&
              filteredData.composers.length > 0 && (
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
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
                          <div className="flex-1">
                            <Link
                              href={`/composers/${favorite.composer?.id}`}
                              className="block group-hover:text-brand-primary transition-colors"
                            >
                              <h3 className="font-bold text-theme-primary classical-title mb-1">
                                {favorite.composer?.fullName ||
                                  favorite.composer?.name}
                              </h3>
                              <p className="text-theme-secondary text-sm">
                                {favorite.composer?.epochName &&
                                  `${favorite.composer.epochName}`}
                              </p>
                            </Link>
                          </div>

                          {viewMode === 'grid' && (
                            <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
                              <Link
                                href={`/composers/${favorite.composer?.id}`}
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
              )}

            {/* Works Section */}
            {(activeTab === 'all' || activeTab === 'works') &&
              filteredData.works.length > 0 && (
                <div
                  className="animate-fade-in-up"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
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
                          <div className="flex-1">
                            <Link
                              href={`/works/${favorite.work?.id}`}
                              className="block group-hover:text-brand-primary transition-colors"
                            >
                              <h3 className="font-bold text-theme-primary classical-title mb-1">
                                {favorite.work?.title}
                              </h3>
                              <p className="text-theme-secondary classical-subtitle">
                                {favorite.work?.composer.fullName}
                              </p>
                              {favorite.work?.opOrCatalog && (
                                <p className="text-sm text-theme-tertiary mt-1">
                                  {favorite.work.opOrCatalog}
                                </p>
                              )}
                            </Link>
                          </div>

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
