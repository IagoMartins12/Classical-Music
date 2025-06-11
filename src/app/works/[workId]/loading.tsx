// app/work/[workId]/loading.tsx - Premium version with theme system
'use client';

import {
  FiMusic,
  FiUser,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiHeadphones,
  FiBookOpen,
  FiSettings,
  FiTag,
  FiHeart,
  FiShare2,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function WorkDetailsLoading() {
  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Floating musical notes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-6 left-12 text-5xl text-brand-primary/10 animate-float">
          <GiMusicalNotes />
        </div>
        <div
          className="absolute bottom-6 right-12 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiMusic />
        </div>
        <div
          className="absolute top-12 right-24 text-3xl text-accent-purple/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-2 text-sm mb-6 pt-4 animate-fade-in-up">
          <div className="h-4 w-16 bg-theme-elevated rounded"></div>
          <svg
            className="w-4 h-4 text-theme-tertiary"
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
          <div className="h-4 w-24 bg-theme-elevated rounded"></div>
          <svg
            className="w-4 h-4 text-theme-tertiary"
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
          <div className="h-4 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
        </div>

        {/* Header Principal Skeleton */}
        <div
          className="classical-card overflow-hidden relative animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          {/* Background decoration */}
          <div className="absolute top-6 right-12 text-5xl text-brand-primary/5">
            <GiMusicalNotes />
          </div>

          <div className="p-8 relative z-10 animate-shimmer">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Informações Principais */}
              <div className="lg:col-span-3 space-y-6">
                {/* Título e Compositor */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-2xl mb-3 w-4/5"></div>
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-5 w-8 bg-theme-elevated rounded"></div>
                        <div className="h-5 w-48 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
                      </div>
                      <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="w-12 h-12 bg-interactive-hover border border-theme-primary rounded-xl"></div>
                      <div className="w-12 h-12 bg-interactive-hover border border-theme-primary rounded-xl"></div>
                    </div>
                  </div>
                </div>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      gradient: 'from-accent-green/20 to-accent-blue/20',
                      border: 'border-accent-green/30',
                    },
                    {
                      gradient: 'from-accent-purple/20 to-accent-blue/20',
                      border: 'border-accent-purple/30',
                    },
                    {
                      gradient: 'from-brand-primary/20 to-brand-secondary/20',
                      border: 'border-brand-primary/30',
                    },
                    {
                      gradient: 'from-accent-blue/20 to-accent-purple/20',
                      border: 'border-accent-blue/30',
                    },
                    {
                      gradient: 'from-accent-red/20 to-accent-purple/20',
                      border: 'border-accent-red/30',
                    },
                  ].map((style, i) => (
                    <div key={i} className="flex items-start space-x-3 group">
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${style.gradient} border ${style.border} rounded-xl mt-0.5 group-hover:scale-110 transition-transform duration-300`}
                      ></div>
                      <div className="space-y-2">
                        <div className="h-3 w-20 bg-theme-elevated rounded"></div>
                        <div className="h-4 w-24 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Informações Adicionais */}
                <div className="border-t border-theme-secondary pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-5 h-5 bg-accent-blue/30 rounded"></div>
                    <div className="h-5 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-4 bg-theme-elevated rounded"></div>
                    <div className="h-4 bg-theme-elevated rounded w-3/4"></div>
                    <div className="h-4 bg-theme-elevated rounded w-4/5"></div>
                    <div className="h-4 bg-theme-elevated rounded w-2/3"></div>
                  </div>
                </div>

                {/* Tags de Categorias e Gêneros */}
                <div className="border-t border-theme-secondary pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-5 h-5 bg-accent-green/30 rounded"></div>
                    <div className="h-5 w-40 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 w-20 bg-theme-elevated rounded mb-3"></div>
                      <div className="flex flex-wrap gap-2">
                        <div className="h-8 w-24 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>
                        <div className="h-8 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>
                        <div className="h-8 w-28 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar com Player e Links */}
              <div className="space-y-6">
                {/* Player de Áudio/Vídeo */}
                <div
                  className="classical-card-simple p-6 animate-shimmer"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-red/20 to-accent-purple/20 rounded-xl"></div>
                    <div className="h-5 w-24 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-10 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl"></div>
                    <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-xl"></div>
                  </div>
                </div>

                {/* Links Externos */}
                <div
                  className="classical-card-simple p-6 animate-shimmer"
                  style={{ animationDelay: '0.2s' }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl"></div>
                    <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="h-10 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl"></div>
                </div>

                {/* Informações Técnicas */}
                <div
                  className="classical-card-simple p-6 animate-shimmer"
                  style={{ animationDelay: '0.3s' }}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl"></div>
                    <div className="h-5 w-28 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-3 w-20 bg-theme-elevated rounded"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-20 bg-theme-elevated rounded"></div>
                      <div className="h-3 w-12 bg-theme-elevated rounded"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                      <div className="h-3 w-24 bg-theme-elevated rounded"></div>
                      <div className="h-3 w-16 bg-theme-elevated rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Partituras IMSLP Skeleton */}
        <div
          className="classical-card overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="border-b border-theme-secondary p-8 bg-gradient-to-r from-theme-elevated to-interactive-hover">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl shadow-theme-glow"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded"></div>
              </div>
            </div>
          </div>

          <div className="border-b border-theme-secondary">
            <div className="flex space-x-1 p-4">
              {[1, 2, 3].map((tab) => (
                <div
                  key={tab}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg ${
                    tab === 1
                      ? 'bg-brand-primary/10 border border-brand-primary/30'
                      : 'bg-theme-elevated'
                  }`}
                >
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                  <div className="w-6 h-4 bg-theme-elevated rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 animate-shimmer">
            <div className="space-y-6">
              {[1, 2, 3].map((group) => (
                <div key={group} className="space-y-4">
                  <div className="border-b border-theme-secondary pb-3">
                    <div className="h-5 w-64 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2].map((score) => (
                      <div
                        key={score}
                        className="classical-card-simple p-4 hover:shadow-theme-glow transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-24 h-32 bg-gradient-to-br from-theme-elevated to-interactive-hover border border-theme-primary rounded-xl"></div>
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="h-5 w-3/4 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                              <div className="h-8 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-theme-tertiary/30 rounded"></div>
                                <div className="h-3 w-16 bg-theme-elevated rounded"></div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-theme-tertiary/30 rounded"></div>
                                <div className="h-3 w-20 bg-theme-elevated rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Obras Relacionadas Skeleton */}
        <div
          className="classical-card p-8 animate-fade-in-up"
          style={{ animationDelay: '0.5s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
            <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`classical-card-simple p-4 hover:shadow-theme-glow transition-all duration-300 group animate-shimmer`}
                style={{ animationDelay: `${0.6 + i * 0.1}s` }}
              >
                <div className="space-y-3">
                  <div className="h-5 w-3/4 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                  <div className="h-4 w-1/2 bg-theme-elevated rounded"></div>
                  <div className="h-3 w-1/3 bg-theme-elevated rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div
        className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      {/* CSS for animations */}
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

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(212, 175, 55, 0.1),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
