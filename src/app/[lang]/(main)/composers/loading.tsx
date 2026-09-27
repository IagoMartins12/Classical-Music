// app/composers/ComposersLoading.tsx - Clean Skeleton Loading
'use client';

import AnimatedMusicalNotes2 from '@/app/components/AnimatedMusicalNotes2';
import {
  PiClock,
  PiListBullets,
  PiMagnifyingGlass,
  PiSquaresFour,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

export default function ComposersLoading() {
  return (
    <div className="">
      {/* Background Pattern - Static */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl"></div>
      </div>

      <AnimatedMusicalNotes2 />
      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-ouro/20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-fundo/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mx-4">
          <div className="flex items-center mb-6">
            <Stack gap={2}>
              <div className="h-5 w-32 bg-fundo rounded animate-pulse"></div>
              <div className="h-3 w-48 bg-theme-elevated rounded animate-pulse"></div>
            </Stack>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Search Field */}
            <Stack gap={2}>
              <div className="h-4 w-24 bg-theme-elevated rounded animate-pulse"></div>
              <div className="relative">
                <PiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-texto-fraco/50" />
                <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
              </div>
            </Stack>

            {/* Epoch Filter */}
            <Stack gap={2}>
              <div className="h-4 w-28 bg-theme-elevated rounded animate-pulse"></div>
              <div className="relative">
                <PiClock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-texto-fraco/50" />
                <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-texto-fraco/50"
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
            </Stack>
          </div>

          {/* Filter Status and View Toggle */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-theme-secondary">
            <Inline gap={4}>
              <div className="h-4 w-64 bg-theme-elevated rounded animate-pulse"></div>
              <Text
                papel="rotulo"
                tom="ouro"
                as="div"
                className="flex items-center"
              ></Text>
            </Inline>

            <Inline gap={3}>
              {/* View Toggle Skeleton */}
              <Inline gap={3}>
                <Text papel="rotulo" tom="suave">
                  Vista:
                </Text>
                <div className="bg-sup-1 border border-theme-primary rounded-lg p-1 flex">
                  <div className="p-2 rounded-md bg-theme-elevated">
                    <PiListBullets className="w-4 h-4 text-texto-fraco/50" />
                  </div>
                  <div className="p-2 rounded-md bg-ouro/20">
                    <PiSquaresFour className="w-4 h-4 text-ouro-texto/50" />
                  </div>
                </div>
              </Inline>
            </Inline>
          </div>
        </Card>

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
          <Card>
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              {/* Info */}
              <div className="h-4 w-48 bg-theme-elevated rounded animate-pulse"></div>

              {/* Pagination controls */}
              <Inline gap={2}>
                <div className="h-10 w-20 bg-sup-elevada border border-theme-secondary rounded-lg animate-pulse"></div>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 w-10 rounded-lg animate-pulse ${
                      i === 2
                        ? 'bg-ouro/20 border border-ouro/30'
                        : 'bg-theme-elevated border border-theme-secondary'
                    }`}
                  ></div>
                ))}
                <div className="h-10 w-20 bg-sup-elevada border border-theme-secondary rounded-lg animate-pulse"></div>
              </Inline>

              <div></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Simple skeleton card component
function ComposerCardSkeleton() {
  return (
    <Card className="h-full">
      {/* Portrait */}
      <div className="mb-6 flex justify-center">
        <div className="w-24 h-24 md:w-28 md:h-28 bg-aviso/20 border border-aviso/30 rounded-full shadow-theme-medium animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="space-y-3 text-center">
        {/* Name */}
        <div className="h-6 bg-fundo rounded mx-auto w-3/4 animate-pulse"></div>
        <div className="h-4 bg-theme-elevated rounded mx-auto w-1/2 animate-pulse"></div>

        {/* Details */}
        <Stack gap={2} className="pt-2">
          <Inline gap={2} className="justify-center">
            <div className="w-3 h-3 bg-sup-2/30 rounded animate-pulse"></div>
            <div className="h-3 bg-theme-elevated rounded w-20 animate-pulse"></div>
          </Inline>
          <Inline gap={2} className="justify-center">
            <div className="w-3 h-3 bg-sup-2/30 rounded animate-pulse"></div>
            <div className="h-3 bg-theme-elevated rounded w-16 animate-pulse"></div>
          </Inline>
        </Stack>

        {/* Period tag */}
        <div className="pt-2">
          <div className="h-6 w-20 bg-ouro/20 border border-ouro/30 rounded-full mx-auto animate-pulse"></div>
        </div>

        {/* External links */}
        <div className="flex justify-center gap-2 pt-2">
          <div className="h-6 w-16 bg-aviso/20 border border-aviso/30 rounded-full animate-pulse"></div>
          <div className="h-6 w-12 bg-ok/20 border border-ok/30 rounded-full animate-pulse"></div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-theme-secondary mt-4">
          <div className="h-4 w-24 bg-sup-2/30 rounded mx-auto animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
}
