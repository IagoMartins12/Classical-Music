// app/composers/ComposersLoading.tsx - Clean Skeleton Loading
'use client';

import AnimatedMusicalNotes2 from '@/app/components/AnimatedMusicalNotes2';
import { FiSearch, FiClock, FiList, FiGrid } from 'react-icons/fi';

export default function ComposersLoading() {
  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern - Static */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <AnimatedMusicalNotes2 />
      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-theme-primary/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="classical-card mx-4 p-6">
          <div className="flex items-center mb-6">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-theme-elevated rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Field */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-theme-elevated rounded animate-pulse"></div>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary/50" />
                <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
              </div>
            </div>

            {/* Epoch Filter */}
            <div className="space-y-2">
              <div className="h-4 w-28 bg-theme-elevated rounded animate-pulse"></div>
              <div className="relative">
                <FiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-tertiary/50" />
                <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-theme-tertiary/50"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Status and View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-theme-secondary">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-64 bg-theme-elevated rounded animate-pulse"></div>
              <div className="flex items-center text-brand-primary text-sm"></div>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle Skeleton */}
              <div className="flex items-center space-x-3">
                <span className="text-sm text-theme-secondary">Vista:</span>
                <div className="bg-theme-secundary border border-theme-primary rounded-lg p-1 flex">
                  <div className="p-2 rounded-md bg-theme-elevated">
                    <FiList className="w-4 h-4 text-theme-tertiary/50" />
                  </div>
                  <div className="p-2 rounded-md bg-brand-gradient/20">
                    <FiGrid className="w-4 h-4 text-brand-primary/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - Simple Grid */}
        <div className="relative mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ComposerCardSkeleton key={index} />
            ))}
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="px-4">
          <div className="classical-card p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* Info */}
              <div className="h-4 w-48 bg-theme-elevated rounded animate-pulse"></div>

              {/* Pagination controls */}
              <div className="flex items-center space-x-2">
                <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg animate-pulse"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-lg animate-pulse ${
                      i === 2
                        ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
                        : 'bg-theme-elevated border border-theme-secondary'
                    }`}
                  ></div>
                ))}
                <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg animate-pulse"></div>
              </div>

              <div></div>
            </div>
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

// Simple skeleton card component
function ComposerCardSkeleton() {
  return (
    <div className="classical-card p-6 h-full">
      {/* Portrait */}
      <div className="mb-6 flex justify-center">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full shadow-theme-medium animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="space-y-3 text-center">
        {/* Name */}
        <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mx-auto w-3/4 animate-pulse"></div>
        <div className="h-4 bg-theme-elevated rounded mx-auto w-1/2 animate-pulse"></div>

        {/* Details */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-theme-tertiary/30 rounded animate-pulse"></div>
            <div className="h-3 bg-theme-elevated rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-theme-tertiary/30 rounded animate-pulse"></div>
            <div className="h-3 bg-theme-elevated rounded w-16 animate-pulse"></div>
          </div>
        </div>

        {/* Period tag */}
        <div className="pt-2">
          <div className="h-6 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mx-auto animate-pulse"></div>
        </div>

        {/* External links */}
        <div className="flex justify-center gap-2 pt-2">
          <div className="h-6 w-16 bg-gradient-to-r from-accent-blue/20 to-accent-blue/20 border border-accent-blue/30 rounded-full animate-pulse"></div>
          <div className="h-6 w-12 bg-gradient-to-r from-accent-green/20 to-accent-green/20 border border-accent-green/30 rounded-full animate-pulse"></div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-theme-secondary mt-4">
          <div className="h-4 w-24 bg-theme-tertiary/30 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
