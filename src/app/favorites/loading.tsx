// app/favorites/components/FavoritesLoading.tsx - Premium loading skeleton
'use client';

import {
  FiHeart,
  FiUser,
  FiMusic,
  FiGrid,
  FiList,
  FiSearch,
  FiExternalLink,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function FavoritesLoading() {
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
        <div className="absolute top-16 left-16 text-5xl text-brand-primary/10 animate-float">
          <FiHeart />
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
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center shadow-theme-glow animate-shimmer">
              <div className="w-8 h-8 bg-theme-inverse/20 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-md animate-shimmer shadow-theme-medium"></div>
            <div
              className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-shimmer"
              style={{ animationDelay: '0.1s' }}
            ></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          {[
            {
              gradient: 'from-brand-primary/20 to-brand-secondary/20',
              border: 'border-brand-primary/30',
              icon: <FiHeart className="w-6 h-6 text-theme-inverse/20" />,
            },
            {
              gradient: 'from-brand-primary/20 to-brand-secondary/20',
              border: 'border-brand-primary/30',
              icon: <FiUser className="w-6 h-6 text-theme-inverse/20" />,
            },
            {
              gradient: 'from-brand-primary/20 to-brand-secondary/20',
              border: 'border-brand-primary/30',
              icon: <FiMusic className="w-6 h-6 text-theme-inverse/20" />,
            },
          ].map((style, index) => (
            <div
              key={index}
              className={`classical-card p-6 text-center group hover:scale-105 transition-all duration-300 animate-shimmer`}
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div
                className={`w-12 h-12 bg-gradient-to-br ${style.gradient} border ${style.border} rounded-xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}
              >
                {style.icon}
              </div>
              <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div>

        {/* Controls Skeleton */}
        <div
          className="classical-card p-6 animate-shimmer"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs Skeleton */}
            <div className="flex bg-theme-secondary rounded-xl p-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-lg h-10 w-28 ${
                    index === 0
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
                      : 'bg-theme-elevated'
                  } animate-shimmer`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                ></div>
              ))}
            </div>

            {/* Search and View Mode */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Skeleton */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                <div className="h-12 w-96 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 animate-shimmer"></div>
              </div>

              {/* View Mode Toggle Skeleton */}
              <div className="bg-theme-secondary border border-theme-primary rounded-lg p-1 flex">
                <div className="p-2 rounded transition-all bg-brand-gradient">
                  <FiList className="w-4 h-4 text-brand-primary/30" />
                </div>
                <div className="p-2 rounded transition-all">
                  <FiGrid className="w-4 h-4 text-theme-tertiary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Composers Section Skeleton */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <FiUser className="w-5 h-5 text-theme-primary/30" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
              <div className="h-4 w-40 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Composers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`classical-card p-6 group hover:scale-105 transition-all duration-300 animate-shimmer relative`}
                style={{ animationDelay: `${0.4 + i * 0.05}s` }}
              >
                <div className="flex items-center gap-6">
                  {/* Portrait */}
                  <div className="relative w-16 h-16">
                    <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full border-3 border-brand-primary/20 flex items-center justify-center">
                      <FiUser className="w-8 h-8 text-theme-inverse/20" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex items-center py-0.5 mb-2">
                      <div className="w-3 h-3 bg-theme-tertiary/30 rounded mr-2"></div>
                      <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-32"></div>
                    </div>

                    <div className="flex items-center px-3 justify-center py-1 bg-brand-primary/10 border border-brand-primary/30 rounded-full w-20">
                      <div className="w-2.5 h-2.5 bg-theme-tertiary/30 rounded mr-1"></div>
                      <div className="h-3 bg-brand-primary/20 rounded w-12"></div>
                    </div>
                  </div>

                  {/* Favorite Button Area */}
                  <div className="absolute top-4 right-4">
                    <div className="w-8 h-8 bg-theme-secondary/50 rounded-full flex items-center justify-center">
                      <FiHeart className="w-4 h-4 text-theme-tertiary/30" />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
                  <div className="flex items-center space-x-1">
                    <div className="h-4 w-16 bg-brand-primary/20 rounded"></div>
                    <FiExternalLink className="w-3 h-3 text-theme-tertiary/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Works Section Skeleton */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <FiMusic className="w-5 h-5 text-theme-primary/30" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-40 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
              <div className="h-4 w-32 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Works Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`classical-card p-6 group hover:scale-105 transition-all duration-300 animate-shimmer relative`}
                style={{ animationDelay: `${0.6 + i * 0.05}s` }}
              >
                <div className="flex-1">
                  {/* Title and opus */}
                  <div className="flex items-start gap-3 mb-1 flex-col">
                    <div className="flex items-center py-0.5 w-full">
                      <div className="w-3 h-3 bg-theme-tertiary/30 rounded mr-2"></div>
                      <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded flex-1"></div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="flex items-center px-2 py-0.5 bg-theme-elevated border border-theme-primary/30 rounded-md">
                        <div className="w-2.5 h-2.5 bg-theme-tertiary/30 rounded mr-1"></div>
                        <div className="h-3 bg-theme-secondary/50 rounded w-8"></div>
                      </div>
                    </div>

                    {/* Favorite Button Area */}
                    <div className="absolute top-4 right-4">
                      <div className="w-8 h-8 bg-theme-secondary/50 rounded-full flex items-center justify-center">
                        <FiHeart className="w-4 h-4 text-theme-tertiary/30" />
                      </div>
                    </div>
                  </div>

                  {/* Composer info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-theme-tertiary/30 rounded mr-1"></div>
                      <div className="h-4 bg-accent-blue/20 rounded w-28"></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
                  <div className="flex items-center space-x-1">
                    <div className="h-4 w-16 bg-brand-primary/20 rounded"></div>
                    <FiExternalLink className="w-3 h-3 text-theme-tertiary/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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
