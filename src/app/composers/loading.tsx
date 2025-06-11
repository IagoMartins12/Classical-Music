// app/composers/ComposersLoading.tsx - Premium version with theme system
'use client';

import { FiUser, FiMusic } from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function ComposersLoading() {
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
        <div className="absolute top-16 left-16 text-5xl text-brand-primary/10 animate-float">
          <GiMusicalNotes />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiMusic />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl text-accent-purple/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl text-accent-blue/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <FiUser />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center py-16 animate-fade-in-up">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-shimmer">
              <div className="w-8 h-8 bg-theme-inverse/20 rounded-lg"></div>
            </div>
            <div className="text-6xl text-brand-primary/10">
              <GiMusicalNotes />
            </div>
            <div
              className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-shimmer"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="w-8 h-8 bg-theme-inverse/20 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-shimmer shadow-theme-medium"></div>
            <div
              className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-xl animate-shimmer"
              style={{ animationDelay: '0.1s' }}
            ></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
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
            {
              gradient: 'from-accent-red/20 to-accent-purple/20',
              border: 'border-accent-red/30',
            },
          ].map((style, index) => (
            <div
              key={index}
              className={`classical-card p-6 text-center group hover:scale-105 transition-all duration-300 animate-shimmer`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${style.gradient} border ${style.border} rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
              ></div>
              <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div>

        {/* Filtros Skeleton */}
        <div
          className="classical-card p-6 animate-shimmer"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
              <div className="h-3 w-48 bg-theme-elevated rounded"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-theme-secondary">
            <div className="h-4 w-64 bg-theme-elevated rounded"></div>
          </div>
        </div>

        {/* Composers Grid Skeleton */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`classical-card p-6 group hover:scale-105 transition-all duration-300 animate-shimmer`}
              style={{ animationDelay: `${0.4 + i * 0.05}s` }}
            >
              {/* Portrait */}
              <div className="mb-6 flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-2xl shadow-theme-medium group-hover:scale-110 transition-transform duration-500"></div>
              </div>

              {/* Info */}
              <div className="space-y-3 text-center">
                <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mx-auto w-3/4"></div>
                <div className="h-4 bg-theme-elevated rounded mx-auto w-1/2"></div>

                {/* Details */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-theme-tertiary/30 rounded"></div>
                    <div className="h-3 bg-theme-elevated rounded w-20"></div>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-theme-tertiary/30 rounded"></div>
                    <div className="h-3 bg-theme-elevated rounded w-16"></div>
                  </div>
                </div>

                {/* Bio preview */}
                <div className="space-y-2 pt-3 border-t border-theme-secondary">
                  <div className="h-3 bg-theme-elevated rounded"></div>
                  <div className="h-3 bg-theme-elevated rounded w-5/6"></div>
                  <div className="h-3 bg-theme-elevated rounded w-2/3"></div>
                </div>

                {/* Tags */}
                <div className="flex justify-center gap-2 pt-4">
                  <div className="h-6 w-16 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>
                  <div className="h-6 w-12 bg-gradient-to-r from-accent-green/20 to-accent-blue/20 border border-accent-green/30 rounded-full"></div>
                </div>

                {/* Action button */}
                <div className="pt-4">
                  <div className="h-9 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl shadow-theme-small"></div>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Paginação Skeleton */}
        <div
          className="classical-card p-6 animate-shimmer"
          style={{ animationDelay: '0.8s' }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* Info */}
            <div className="h-4 w-48 bg-theme-elevated rounded"></div>

            {/* Pagination controls */}
            <div className="flex items-center space-x-2">
              <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-lg ${
                    i === 2
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
                      : 'bg-theme-elevated border border-theme-secondary'
                  }`}
                ></div>
              ))}
              <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
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
