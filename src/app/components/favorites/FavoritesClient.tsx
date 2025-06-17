'use client';

import { FiHeart, FiMusic, FiUser, FiTrendingUp, FiStar } from 'react-icons/fi';
import { FavoritesList } from './FavoritesList';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';

export default function FavoritesClient() {
  const { favoriteComposers, favoriteWorks } = useFavoritesStore();
  return (
    <div className="classical-theme">
      {/* Inicializar favoritos no cliente */}

      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-red-500 to-red-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-gradient-to-br from-green-500 to-green-600 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Hero Header */}
        <div className="text-center pt-8 pb-4 animate-fade-in-up">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <FiHeart className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
            Seus Favoritos
          </h1>
          <p className="text-xl text-theme-secondary classical-subtitle max-w-2xl mx-auto">
            Sua coleção pessoal de música clássica - compositores e obras que
            tocam seu coração
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-theme-elevated/60 border border-theme-secondary rounded-full">
              <FiUser className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-theme-primary">
                {favoriteComposers.length} Compositores
              </span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-theme-elevated/60 border border-theme-secondary rounded-full">
              <FiMusic className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-theme-primary">
                {favoriteWorks.length} Obras
              </span>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        {favoriteComposers.length > 0 || favoriteWorks.length > 0 ? (
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <FavoritesList type="all" />
          </div>
        ) : (
          /* Estado Vazio */
          <div
            className="classical-card p-12 text-center animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="max-w-none lg:max-w-8/12 mx-auto">
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
                  <a
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
                  </a>

                  <a
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
                  </a>
                </div>

                {/* Dicas */}
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

      {/* CSS adicional para animações */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
