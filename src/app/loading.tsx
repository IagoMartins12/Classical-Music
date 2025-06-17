// app/loading.tsx - Home Page Loading Skeleton
'use client';

import {
  FiUser,
  FiMusic,
  FiTrendingUp,
  FiAward,
  FiPlus,
  FiBookOpen,
  FiClock,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiGrandPiano,
  GiTreasureMap,
  GiPianoKeys,
} from 'react-icons/gi';

export default function HomeLoading() {
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

      <div className="section-wrap space-y-16 relative z-10">
        {/* Hero Section Skeleton */}
        <div className="animate-fade-in-up">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Hero Card */}
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden">
              <div className="classical-card h-96 lg:h-[500px] relative group animate-shimmer">
                {/* Image placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20"></div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
                  <div className="w-32 h-6 bg-accent-blue/20 rounded-full"></div>
                  <div className="h-8 bg-gradient-to-r from-theme-inverse/20 to-theme-inverse/10 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-inverse/15 rounded"></div>
                    <div className="h-4 bg-theme-inverse/15 rounded w-5/6"></div>
                    <div className="h-4 bg-theme-inverse/15 rounded w-4/6"></div>
                  </div>
                  <div className="h-10 w-48 bg-theme-inverse/20 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Side Cards */}
            <div className="space-y-4">
              {[1, 2].map((index) => (
                <div
                  key={index}
                  className="classical-card h-44 relative group animate-shimmer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <div className="w-20 h-4 bg-accent-green/20 rounded-full"></div>
                    <div className="h-5 bg-theme-inverse/20 rounded w-2/3"></div>
                    <div className="h-3 bg-theme-inverse/15 rounded"></div>
                    <div className="h-3 bg-theme-inverse/15 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Composers Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center animate-shimmer">
                <FiTrendingUp className="w-6 h-6 text-brand-primary/50" />
              </div>
              <div>
                <div className="h-8 w-64 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
                <div className="h-4 w-80 bg-theme-elevated rounded"></div>
              </div>
            </div>
            <div className="h-10 w-48 bg-theme-elevated border border-theme-secondary rounded-xl"></div>
          </div>

          {/* Carousel Skeleton */}
          <div className="relative overflow-hidden rounded-3xl py-8 px-2">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-theme-elevated/30 to-transparent rounded-3xl"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="classical-card p-4 group animate-shimmer"
                  style={{ animationDelay: `${0.2 + i * 0.1}s` }}
                >
                  <div className="aspect-[4/5] bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                    <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
                    <div className="flex justify-center">
                      <div className="h-5 w-20 bg-theme-tertiary/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Composer Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="classical-card p-8 lg:p-12 animate-shimmer">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center">
                <GiMusicalNotes className="w-6 h-6 text-theme-primary/50" />
              </div>
              <div>
                <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
                <div className="h-4 w-56 bg-theme-elevated rounded"></div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {/* Portrait Section */}
              <div className="lg:col-span-1 flex flex-col items-center text-center">
                <div className="w-48 h-48 lg:w-72 lg:h-72 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl mb-6"></div>
                <div className="space-y-3 w-full">
                  <div className="h-7 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-3/4 mx-auto"></div>
                  <div className="h-5 bg-theme-elevated rounded w-1/2 mx-auto"></div>
                  <div className="h-4 bg-theme-tertiary/20 rounded w-2/3 mx-auto"></div>
                  <div className="h-8 w-32 bg-theme-tertiary/20 rounded-2xl mx-auto"></div>
                </div>
              </div>

              {/* Content Section */}
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-3">
                  <div className="h-5 w-24 bg-theme-primary/20 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-elevated rounded"></div>
                    <div className="h-4 bg-theme-elevated rounded w-5/6"></div>
                    <div className="h-4 bg-theme-elevated rounded w-4/6"></div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-12 bg-theme-elevated rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Composers by Epoch Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
              <FiClock className="w-6 h-6 text-accent-purple/50" />
            </div>
            <div>
              <div className="h-8 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
              <div className="h-4 w-64 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Epochs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="text-center animate-shimmer"
                style={{ animationDelay: `${0.4 + i * 0.1}s` }}
              >
                <div className="w-40 h-40 mx-auto bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-full mb-4 border-2 border-theme-primary/20"></div>
                <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2 w-2/3 mx-auto"></div>
                <div className="h-3 bg-theme-elevated rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Random Discoveries Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center">
              <GiTreasureMap className="w-6 h-6 text-orange-400/50" />
            </div>
            <div>
              <div className="h-8 w-56 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
              <div className="h-4 w-72 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Composers Grid */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-48 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="classical-card p-4 animate-shimmer"
                  style={{ animationDelay: `${0.5 + i * 0.05}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-full mx-auto mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-primary/20 rounded"></div>
                    <div className="h-3 bg-theme-elevated rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Works Grid */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-40 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="classical-card p-4 animate-shimmer"
                  style={{ animationDelay: `${0.7 + i * 0.05}s` }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <FiMusic className="w-6 h-6 text-purple-400/50" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-primary/20 rounded"></div>
                    <div className="h-3 bg-theme-elevated rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Additions Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
              <FiPlus className="w-6 h-6 text-green-400/50" />
            </div>
            <div>
              <div className="h-8 w-44 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
              <div className="h-4 w-64 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Recent Items Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="classical-card-simple p-4 animate-shimmer"
                style={{ animationDelay: `${0.6 + i * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-theme-primary/20 rounded"></div>
                    <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-theme-secondary/50">
                  <div className="h-3 bg-green-400/20 rounded w-24"></div>
                  <div className="w-6 h-6 bg-theme-tertiary/20 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Musical Facts Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-accent-blue/50" />
            </div>
            <div>
              <div className="h-8 w-52 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
              <div className="h-4 w-80 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Facts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="classical-card-simple p-6 animate-shimmer"
                style={{ animationDelay: `${0.7 + i * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-2xl"></div>
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="h-5 bg-theme-primary/20 rounded w-2/3"></div>
                      <div className="h-5 w-16 bg-accent-blue/20 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-theme-elevated rounded"></div>
                      <div className="h-3 bg-theme-elevated rounded w-5/6"></div>
                      <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Essential Composers Section */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          {/* Section Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
              <FiAward className="w-6 h-6 text-accent-purple/50" />
            </div>
            <div>
              <div className="h-8 w-60 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2"></div>
              <div className="h-4 w-96 bg-theme-elevated rounded"></div>
            </div>
          </div>

          {/* Essential Composers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="classical-card p-4 animate-shimmer"
                style={{ animationDelay: `${0.8 + i * 0.05}s` }}
              >
                <div className="aspect-square bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-theme-primary/20 rounded"></div>
                  <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
                  <div className="h-6 bg-theme-tertiary/20 rounded-full"></div>
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

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
