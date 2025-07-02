// app/learning/LearningPageLoading.tsx - Clean Skeleton Loading
'use client';

import {
  FiTarget,
  FiCheckCircle,
  FiMusic,
  FiGrid,
  FiList,
  FiFilter,
  FiBookOpen,
  FiSearch,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import { PiTarget } from 'react-icons/pi';

export default function LearningPageLoading() {
  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
      </div>

      {/* Floating musical notes - static */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-brand-primary/10">
          <FiBookOpen />
        </div>
        <div className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10">
          <FiTarget />
        </div>
        <div className="absolute top-1/3 right-24 text-3xl text-accent-purple/10">
          <GiGrandPiano />
        </div>
        <div className="absolute bottom-1/3 left-24 text-3xl text-accent-blue/10">
          <FiCheckCircle />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-16">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiTarget className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <FiMusic className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiTarget className="w-6 h-6 text-theme-inverse/20" /> },
            {
              icon: <FiCheckCircle className="w-6 h-6 text-theme-inverse/20" />,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="classical-card p-6 text-center animate-pulse"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div> */}

        {/* Controls Skeleton */}
        <div className="classical-card p-6">
          <div className="space-y-4">
            {/* Main Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Tabs Skeleton */}
              <div className="flex bg-theme-secondary rounded-xl p-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-lg h-10 w-40 animate-pulse ${
                      index === 0
                        ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20'
                        : 'bg-theme-elevated'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Skeleton */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary/50 w-4 h-4" />
                  <div className="h-12 w-96 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
                </div>

                {/* Filter Button Skeleton */}
                <div className="h-12 w-24 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg flex items-center justify-center space-x-2 animate-pulse">
                  <FiFilter className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="w-12 h-4 bg-theme-tertiary/30 rounded"></div>
                </div>

                {/* View Mode Toggle Skeleton */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-theme-secondary">Vista:</span>
                  <div className="bg-theme-secondary border border-theme-primary rounded-lg p-1 flex">
                    <div className="p-2 rounded bg-theme-elevated">
                      <FiList className="w-4 h-4 text-theme-tertiary/50" />
                    </div>
                    <div className="p-2 rounded bg-brand-gradient/20">
                      <FiGrid className="w-4 h-4 text-brand-primary/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Want to Learn Section Skeleton */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
              <FiTarget className="w-5 h-5 text-theme-inverse/20" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
            </div>
          </div>

          {/* Learning Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <LearningCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Learned Section Skeleton */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-theme-inverse/20" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
              <div className="h-4 w-28 bg-theme-elevated rounded animate-pulse"></div>
            </div>
          </div>

          {/* Learned Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <LearningCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Skeleton para Learning Card
function LearningCardSkeleton() {
  return (
    <div className="classical-card p-6 animate-pulse">
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
  );
}
