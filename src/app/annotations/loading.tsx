// app/annotations/loading.tsx - Clean Skeleton Loading
'use client';

import {
  FiMessageSquare,
  FiEye,
  FiThumbsUp,
  FiTarget,
  FiGrid,
  FiList,
  FiFilter,
  FiBookOpen,
  FiSearch,
  FiMusic,
  FiLayers,
  FiAward,
  FiEdit3,
  FiTrash2,
  FiGlobe,
  FiLock,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function AnnotationsPageLoading() {
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
        <div className="absolute top-16 left-16 text-5xl text-accent-green/10">
          <FiMessageSquare />
        </div>
        <div className="absolute bottom-16 right-16 text-4xl text-accent-blue/10">
          <GiMusicalNotes />
        </div>
        <div className="absolute top-1/3 right-24 text-3xl text-accent-purple/10">
          <FiTarget />
        </div>
        <div className="absolute bottom-1/3 left-24 text-3xl text-brand-primary/10">
          <FiBookOpen />
        </div>
        <div className="absolute top-2/3 right-12 text-2xl text-accent-red/10">
          <FiMusic />
        </div>
        <div className="absolute bottom-2/3 left-12 text-2xl text-accent-purple/10">
          <FiLayers />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-16">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <FiMessageSquare className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton - 4 cards para anotações */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: (
                <FiMessageSquare className="w-6 h-6 text-theme-inverse/20" />
              ),
            },
            { icon: <FiEye className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiThumbsUp className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiTarget className="w-6 h-6 text-theme-inverse/20" /> },
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
        </div>

        {/* Controls Skeleton */}
        <div className="classical-card p-6">
          <div className="space-y-4">
            {/* Main Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Tabs Skeleton - 4 tabs para anotações */}
              <div className="flex bg-theme-secondary rounded-xl p-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-lg h-10 w-32 animate-pulse ${
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

                {/* Create Button Skeleton */}
                <div className="h-12 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg flex items-center justify-center space-x-2 animate-pulse">
                  <div className="w-4 h-4 bg-theme-primary/30 rounded"></div>
                  <div className="w-20 h-4 bg-theme-primary/30 rounded"></div>
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

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Annotations List (2/3 da largura) */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                <FiMessageSquare className="w-5 h-5 text-theme-inverse/20" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
              </div>
            </div>

            {/* Annotations Cards */}
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <AnnotationCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Sidebar (1/3 da largura) */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Stats Widget Skeleton */}
              <div className="classical-card-2 p-6 animate-pulse">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                          <div className="h-4 w-12 bg-theme-elevated rounded"></div>
                        </div>
                        <div className="w-full bg-theme-elevated border border-theme-primary/20 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 h-1.5 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Annotations Widget Skeleton */}
              <div className="classical-card-2 p-6 animate-pulse">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-40 bg-theme-elevated rounded"></div>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl"
                    >
                      <div className="w-6 h-6 bg-accent-green/20 rounded-lg border"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-theme-elevated rounded mb-1"></div>
                        <div className="h-3 w-32 bg-theme-elevated rounded mb-1"></div>
                        <div className="flex items-center space-x-3">
                          <div className="h-3 w-8 bg-theme-elevated rounded"></div>
                          <div className="h-3 w-8 bg-theme-elevated rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Widget Skeleton */}
              <div className="classical-card-2 p-6 animate-pulse">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-4 bg-theme-elevated rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-accent-green/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-blue/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
      <div className="fixed top-60 right-20 w-1.5 h-1.5 bg-accent-purple/30 rounded-full animate-pulse"></div>
    </div>
  );
}

// Skeleton para Annotation Card
function AnnotationCardSkeleton() {
  return (
    <div className="classical-card p-6 animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-3">
            <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-3/4"></div>
            <div className="w-5 h-5 bg-accent-green/20 rounded"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-4 bg-brand-primary/20 rounded w-1/3"></div>
            <div className="h-4 bg-theme-elevated rounded w-1/4"></div>
          </div>
          <div className="h-3 bg-theme-elevated rounded w-1/4"></div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <div className="w-8 h-8 bg-theme-secondary rounded-lg flex items-center justify-center">
            <FiEdit3 className="w-4 h-4 text-theme-tertiary/30" />
          </div>
          <div className="w-8 h-8 bg-theme-secondary rounded-lg flex items-center justify-center">
            <FiTrash2 className="w-4 h-4 text-theme-tertiary/30" />
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`px-3 py-1 rounded-full text-xs border flex items-center space-x-1 ${
              index === 0
                ? 'bg-accent-red/10 border-accent-red/30'
                : index === 1
                ? 'bg-accent-blue/10 border-accent-blue/30'
                : index === 2
                ? 'bg-theme-primary/10 border-theme-primary/30'
                : 'bg-accent-green/10 border-accent-green/30'
            }`}
          >
            <div className="w-3 h-3 bg-current/30 rounded"></div>
            <div className="w-12 h-3 bg-current/30 rounded"></div>
          </div>
        ))}

        <div className="px-3 py-1 rounded-full text-xs border bg-accent-blue/10 border-accent-blue/30 flex items-center space-x-1">
          <FiGlobe className="w-3 h-3 text-accent-blue/30" />
          <div className="w-8 h-3 bg-accent-blue/30 rounded"></div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 space-y-2">
        <div className="h-4 bg-theme-elevated rounded"></div>
        <div className="h-4 bg-theme-elevated rounded w-5/6"></div>
        <div className="h-4 bg-theme-elevated rounded w-4/6"></div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="px-2 py-1 bg-theme-elevated border border-theme-primary/20 rounded-lg"
          >
            <div className="w-8 h-3 bg-theme-secondary rounded"></div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
        {/* Stats */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <FiThumbsUp className="w-4 h-4 text-theme-tertiary/30" />
            <div className="w-8 h-4 bg-theme-elevated rounded"></div>
          </div>
          <div className="flex items-center space-x-1">
            <FiEye className="w-4 h-4 text-theme-tertiary/30" />
            <div className="w-12 h-4 bg-theme-elevated rounded"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
            <div className="w-16 h-4 bg-theme-elevated rounded"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <div className="w-12 h-4 bg-brand-primary/20 rounded"></div>
            <div className="w-3 h-3 bg-brand-primary/20 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
