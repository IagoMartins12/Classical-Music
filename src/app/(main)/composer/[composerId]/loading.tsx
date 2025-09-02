// app/composer/[composerId]/ComposerDetailsLoading.tsx - Premium version with theme system
'use client';

import { FiUser } from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function ComposerDetailsLoading() {
  return (
    <div className=" bg-gradient-primary">
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
          <FiUser />
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
          <div className="h-4 w-20 bg-theme-elevated rounded"></div>
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
        <div className="classical-card overflow-hidden relative animate-fade-in-up">
          {/* Background decoration */}
          <div className="absolute top-6 right-12 text-5xl text-brand-primary/5">
            <GiMusicalNotes />
          </div>

          <div className="p-0 md:p-8 relative z-10 animate-shimmer">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações do Compositor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Nome e título */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="h-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-2xl mb-3 w-4/5"></div>
                      <div className="h-5 bg-theme-elevated rounded w-3/5"></div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-3 ml-4">
                      <div className="w-12 h-12 bg-interactive-hover border border-theme-primary rounded-xl"></div>
                      <div className="w-12 h-12 bg-interactive-hover border border-theme-primary rounded-xl"></div>
                    </div>
                  </div>
                </div>

                {/* Grid de informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      gradient: 'from-accent-green/20 to-accent-blue/20',
                      border: 'border-accent-green/30',
                    },
                    {
                      gradient: 'from-accent-red/20 to-accent-purple/20',
                      border: 'border-accent-red/30',
                    },
                    {
                      gradient: 'from-brand-primary/20 to-brand-secondary/20',
                      border: 'border-brand-primary/30',
                    },
                    {
                      gradient: 'from-accent-blue/20 to-accent-purple/20',
                      border: 'border-accent-blue/30',
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

                {/* Links Externos */}
                <div className="flex flex-wrap gap-3 pt-4">
                  <div className="h-10 w-28 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl"></div>
                  <div className="h-10 w-24 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-xl"></div>
                </div>
              </div>

              {/* Imagem do Compositor */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  <div className="w-64 h-80 bg-gradient-to-br from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl shadow-theme-glow group-hover:scale-105 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Papéis Secundários Skeleton */}
        <div
          className="classical-card p-8 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
              <div className="h-4 w-64 bg-theme-elevated rounded"></div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 animate-shimmer">
            {[1, 2, 3, 4, 5].map((role, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/30 rounded-full hover:scale-105 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-4 h-4 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-full mr-2"></div>
                <div className="h-4 w-20 bg-theme-elevated rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Biografia Skeleton */}
        <div
          className="classical-card p-8 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-2xl"></div>
            <div className="flex-1">
              <div className="h-6 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
            </div>
            <div className="w-8 h-8 bg-interactive-hover rounded-full"></div>
          </div>

          <div className="space-y-4 animate-shimmer">
            {/* Loading state for biography generation */}
            <div className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 rounded-2xl">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-brand-primary/30 border-t-brand-primary rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-brand-secondary rounded-full animate-spin"
                  style={{
                    animationDirection: 'reverse',
                    animationDuration: '1.5s',
                  }}
                ></div>
              </div>
              <div className="text-center">
                <div className="h-5 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
                <div className="h-3 w-64 bg-theme-elevated rounded"></div>
              </div>
              <div className="w-6 h-6 bg-brand-primary/30 rounded"></div>
            </div>

            {/* Skeleton da biografia */}
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-gradient-to-r from-theme-elevated via-interactive-hover to-theme-elevated rounded-full animate-shimmer"
                  style={{
                    width: `${Math.random() * 30 + 70}%`,
                    animationDelay: `${index * 0.1}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>

        {/* Estatísticas Skeleton */}
        {/* <div
          className="classical-card p-8 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl"></div>
            <div className="h-6 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                gradient: 'from-brand-primary/20 to-brand-secondary/20',
                border: 'border-brand-primary/30',
              },
              {
                gradient: 'from-accent-purple/20 to-accent-blue/20',
                border: 'border-accent-purple/30',
              },
              {
                gradient: 'from-accent-green/20 to-accent-blue/20',
                border: 'border-accent-green/30',
              },
            ].map((style, index) => (
              <div
                key={index}
                className={`text-center p-6 bg-gradient-to-br ${style.gradient} border ${style.border} rounded-2xl group hover:scale-105 transition-all duration-300 animate-shimmer`}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${style.gradient} border ${style.border} rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                ></div>
                <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2 w-16 mx-auto"></div>
                <div className="h-4 bg-theme-elevated rounded w-24 mx-auto"></div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Obras do Compositor Skeleton */}
        <div
          className="classical-card overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          {/* Header */}
          <div className="p-8 border-b border-theme-secondary bg-gradient-to-r from-theme-elevated to-interactive-hover">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-2xl"></div>
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded"></div>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative mb-4">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-theme-tertiary/30 rounded"></div>
              <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 pr-4"></div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                <div className="h-10 w-32 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                <div className="h-10 w-28 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              </div>
            </div>
          </div>

          {/* Lista de obras */}
          <div className="p-8 animate-shimmer">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="classical-card-simple hover:shadow-theme-glow transition-all duration-300 group"
                  style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-theme-elevated rounded w-1/4"></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {[1, 2, 3, 4].map((item) => (
                            <div
                              key={item}
                              className="flex items-center space-x-2"
                            >
                              <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                              <div className="h-3 bg-theme-elevated rounded w-16"></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-6 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="w-10 h-10 bg-accent-red/10 border border-accent-red/30 rounded-xl"></div>
                        <div className="w-10 h-10 bg-accent-green/10 border border-accent-green/30 rounded-xl"></div>
                        <div className="w-10 h-10 bg-brand-primary/10 border border-brand-primary/30 rounded-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
