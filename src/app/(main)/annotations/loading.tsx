// app/annotations/loading.tsx - Clean Skeleton Loading
'use client';

import {
  PiBookOpen,
  PiChatCenteredText,
  PiEye,
  PiFunnel,
  PiGlobe,
  PiListBullets,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiPencilLine,
  PiSquaresFour,
  PiStack,
  PiTarget,
  PiThumbsUp,
  PiTrash,
} from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';

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
          <PiChatCenteredText />
        </div>
        <div className="absolute bottom-16 right-16 text-4xl text-accent-blue/10">
          <PiMusicNotes />
        </div>
        <div className="absolute top-1/3 right-24 text-3xl text-accent-purple/10">
          <PiTarget />
        </div>
        <div className="absolute bottom-1/3 left-24 text-3xl text-brand-primary/10">
          <PiBookOpen />
        </div>
        <div className="absolute top-2/3 right-12 text-2xl text-accent-red/10">
          <PiMusicNotes />
        </div>
        <div className="absolute bottom-2/3 left-12 text-2xl text-accent-purple/10">
          <PiStack />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-16">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-green to-accent-blue rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiChatCenteredText className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton - 4 cards para anotações */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: (
                <PiChatCenteredText className="w-6 h-6 text-theme-inverse/20" />
              ),
            },
            { icon: <PiEye className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <PiThumbsUp className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <PiTarget className="w-6 h-6 text-theme-inverse/20" /> },
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
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-tertiary/50 w-4 h-4" />
                  <div className="h-12 w-32 md:w-96 max-w-full bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
                </div>

                {/* Filter Button Skeleton */}
                <Inline
                  gap={2}
                  className="h-12 w-24 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg justify-center animate-pulse"
                >
                  <PiFunnel className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="w-12 h-4 bg-theme-tertiary/30 rounded"></div>
                </Inline>

                {/* Create Button Skeleton */}
                <Inline
                  gap={2}
                  className="h-12 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg justify-center animate-pulse"
                >
                  <div className="w-4 h-4 bg-theme-primary/30 rounded"></div>
                  <div className="w-20 h-4 bg-theme-primary/30 rounded"></div>
                </Inline>

                {/* View Mode Toggle Skeleton */}
                <Inline gap={3}>
                  <Text papel="rotulo" tom="suave">
                    Vista:
                  </Text>
                  <div className="bg-theme-secondary border border-theme-primary rounded-lg p-1 flex">
                    <div className="p-2 rounded bg-theme-elevated">
                      <PiListBullets className="w-4 h-4 text-theme-tertiary/50" />
                    </div>
                    <div className="p-2 rounded bg-brand-gradient/20">
                      <PiSquaresFour className="w-4 h-4 text-brand-primary/50" />
                    </div>
                  </div>
                </Inline>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Annotations List (2/3 da largura) */}
          <div className="lg:col-span-2">
            <Inline gap={3} className="mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                <PiChatCenteredText className="w-5 h-5 text-theme-inverse/20" />
              </div>
              <div className="space-y-2">
                <div className="h-8 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
                <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
              </div>
            </Inline>

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
                <Inline gap={2} className="mb-4">
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                </Inline>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Inline
                      gap={3}
                      key={index}
                      className="p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl"
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
                    </Inline>
                  ))}
                </div>
              </div>

              {/* Top Annotations Widget Skeleton */}
              <div className="classical-card-2 p-6 animate-pulse">
                <Inline gap={2} className="mb-4">
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-40 bg-theme-elevated rounded"></div>
                </Inline>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Inline
                      gap={3}
                      key={index}
                      className="p-3 bg-theme-elevated/50 border border-theme-primary/20 rounded-xl"
                    >
                      <div className="w-6 h-6 bg-accent-green/20 rounded-lg border"></div>
                      <div className="flex-1">
                        <div className="h-4 w-24 bg-theme-elevated rounded mb-1"></div>
                        <div className="h-3 w-32 bg-theme-elevated rounded mb-1"></div>
                        <Inline gap={3}>
                          <div className="h-3 w-8 bg-theme-elevated rounded"></div>
                          <div className="h-3 w-8 bg-theme-elevated rounded"></div>
                        </Inline>
                      </div>
                    </Inline>
                  ))}
                </div>
              </div>

              {/* Tips Widget Skeleton */}
              <div className="classical-card-2 p-6 animate-pulse">
                <Inline gap={2} className="mb-4">
                  <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                </Inline>
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
          <Inline gap={3}>
            <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-3/4"></div>
            <div className="w-5 h-5 bg-accent-green/20 rounded"></div>
          </Inline>
          <Inline gap={2}>
            <div className="h-4 bg-brand-primary/20 rounded w-1/3"></div>
            <div className="h-4 bg-theme-elevated rounded w-1/4"></div>
          </Inline>
          <div className="h-3 bg-theme-elevated rounded w-1/4"></div>
        </div>
        <Inline gap={2} className="ml-4">
          <div className="w-8 h-8 bg-theme-secondary rounded-lg flex items-center justify-center">
            <PiPencilLine className="w-4 h-4 text-theme-tertiary/30" />
          </div>
          <div className="w-8 h-8 bg-theme-secondary rounded-lg flex items-center justify-center">
            <PiTrash className="w-4 h-4 text-theme-tertiary/30" />
          </div>
        </Inline>
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

        <Inline
          gap={1}
          className="px-3 py-1 rounded-full text-xs border bg-accent-blue/10 border-accent-blue/30"
        >
          <PiGlobe className="w-3 h-3 text-accent-blue/30" />
          <div className="w-8 h-3 bg-accent-blue/30 rounded"></div>
        </Inline>
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
        <Inline gap={4}>
          <Inline gap={1}>
            <PiThumbsUp className="w-4 h-4 text-theme-tertiary/30" />
            <div className="w-8 h-4 bg-theme-elevated rounded"></div>
          </Inline>
          <Inline gap={1}>
            <PiEye className="w-4 h-4 text-theme-tertiary/30" />
            <div className="w-12 h-4 bg-theme-elevated rounded"></div>
          </Inline>
          <Inline gap={1}>
            <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
            <div className="w-16 h-4 bg-theme-elevated rounded"></div>
          </Inline>
        </Inline>

        {/* Actions */}
        <Inline gap={3}>
          <Inline gap={1}>
            <div className="w-12 h-4 bg-brand-primary/20 rounded"></div>
            <div className="w-3 h-3 bg-brand-primary/20 rounded"></div>
          </Inline>
        </Inline>
      </div>
    </div>
  );
}
