// app/learning/components/LearningLoading.tsx - Premium loading skeleton
'use client';

import {
  FiTarget,
  FiCheckCircle,
  FiMusic,
  FiGrid,
  FiList,
  FiFilter,
  FiBookOpen,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';

export default function LearningLoading() {
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
          <FiBookOpen />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiTarget />
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
          <FiCheckCircle />
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
              <FiBookOpen />
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          {[
            {
              gradient: 'from-brand-primary/20 to-brand-secondary/20',
              border: 'border-brand-primary/30',
              icon: <FiMusic className="w-6 h-6 text-theme-inverse/20" />,
            },
            {
              gradient: 'from-accent-blue/20 to-accent-purple/20',
              border: 'border-accent-blue/30',
              icon: <FiTarget className="w-6 h-6 text-theme-inverse/20" />,
            },
            {
              gradient: 'from-accent-green/20 to-accent-blue/20',
              border: 'border-accent-green/30',
              icon: <FiCheckCircle className="w-6 h-6 text-theme-inverse/20" />,
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
                  className={`px-4 py-2 rounded-lg h-10 w-32 ${
                    index === 0
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
                      : 'bg-theme-elevated'
                  } animate-shimmer`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                ></div>
              ))}
            </div>

            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Skeleton */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                <div className="h-12 w-96 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 animate-shimmer"></div>
              </div>

              {/* Filter Button Skeleton */}
              <div className="h-12 w-24 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg flex items-center justify-center space-x-2 animate-shimmer">
                <FiFilter className="w-4 h-4 text-theme-tertiary/30" />
                <div className="w-12 h-4 bg-theme-tertiary/30 rounded"></div>
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

        {/* Want to Learn Section Skeleton */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
              <FiTarget className="w-5 h-5 text-theme-inverse/20" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
              <div className="h-4 w-32 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Learning Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`classical-card p-6 group hover:scale-105 transition-all duration-300 animate-shimmer`}
                style={{ animationDelay: `${0.4 + i * 0.05}s` }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-3/4"></div>
                    <div className="h-4 bg-theme-elevated rounded w-1/2"></div>
                    <div className="h-3 bg-theme-elevated rounded w-1/3"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-theme-secondary rounded-lg"></div>
                    <div className="w-8 h-8 bg-theme-secondary rounded-lg"></div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <div
                        key={starIndex}
                        className="w-4 h-4 bg-yellow-400/20 rounded"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                    <div className="h-6 w-20 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full"></div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                    <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                  </div>

                  <div className="bg-theme-secondary rounded-lg p-3 border-l-4 border-accent-blue/30">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-4 h-4 bg-accent-blue/30 rounded"></div>
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-theme-elevated rounded"></div>
                      <div className="h-3 bg-theme-elevated rounded w-5/6"></div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-between">
                  <div className="h-3 w-24 bg-theme-elevated rounded"></div>
                  <div className="h-4 w-20 bg-brand-primary/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learned Section Skeleton */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-theme-inverse/20" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
              <div className="h-4 w-28 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Learned Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`classical-card p-6 group hover:scale-105 transition-all duration-300 animate-shimmer`}
                style={{ animationDelay: `${0.6 + i * 0.05}s` }}
              >
                {/* Similar structure to want-to-learn cards */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-4/5"></div>
                    <div className="h-4 bg-theme-elevated rounded w-3/5"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-theme-secondary rounded-lg"></div>
                    <div className="w-8 h-8 bg-theme-secondary rounded-lg"></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <div
                        key={starIndex}
                        className="w-4 h-4 bg-accent-green/20 rounded"
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-accent-green/30 rounded"></div>
                      <div className="h-3 w-16 bg-theme-elevated rounded"></div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-accent-blue/30 rounded"></div>
                      <div className="h-3 w-20 bg-theme-elevated rounded"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-between">
                  <div className="h-3 w-28 bg-theme-elevated rounded"></div>
                  <div className="h-4 w-16 bg-brand-primary/20 rounded"></div>
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
