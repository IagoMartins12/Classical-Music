// app/favorites/FavoritesLoading.tsx - Clean Skeleton Loading
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowSquareOut,
  PiHeart,
  PiListBullets,
  PiMagnifyingGlass,
  PiMusicNotes,
  PiSquaresFour,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function FavoritesLoading() {
  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Floating musical notes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-ouro-texto/10 animate-float">
          <PiHeart />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiMusicNotes />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl text-aviso/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <PiMusicNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-ouro/20 rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-texto/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-md animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <Card>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Tabs Skeleton */}
            <div className="flex bg-theme-secondary rounded-xl p-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className={`px-4 py-2 rounded-lg h-10 w-32 animate-pulse ${
                    index === 0 ? 'bg-ouro/20' : 'bg-theme-elevated'
                  }`}
                ></div>
              ))}
            </div>

            {/* Search and View Mode */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Skeleton */}
              <div className="relative">
                <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-texto-fraco/50 w-4 h-4" />
                <div className="h-12 w-32 md:w-96 max-w-full bg-sup-elevada border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
              </div>

              {/* View Mode Toggle Skeleton */}
              <Inline gap={3}>
                <div className="bg-theme-secondary border border-theme-primary rounded-lg p-1 flex">
                  <div className="p-2 rounded bg-theme-elevated">
                    <PiListBullets className="w-4 h-4 text-texto-fraco/50" />
                  </div>
                  <div className="p-2 rounded bg-ouro/20">
                    <PiSquaresFour className="w-4 h-4 text-ouro-texto/50" />
                  </div>
                </div>
              </Inline>
            </div>
          </div>
        </Card>

        {/* Composers Section Skeleton */}
        <div>
          <Inline gap={3} className="mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <PiUser className="w-5 h-5 text-texto/30" />
            </div>
            <Stack gap={2}>
              <div className="h-8 w-56 bg-fundo rounded animate-pulse"></div>
              <div className="h-4 w-40 bg-theme-elevated rounded animate-pulse"></div>
            </Stack>
          </Inline>

          {/* Composers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ComposerCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Works Section Skeleton */}
        <div>
          <Inline gap={3} className="mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <PiMusicNotes className="w-5 h-5 text-texto/30" />
            </div>
            <Stack gap={2}>
              <div className="h-8 w-40 bg-fundo rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
            </Stack>
          </Inline>

          {/* Works Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <WorkCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-erro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-atencao/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-aviso/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Skeleton para Composer Card
function ComposerCardSkeleton() {
  return (
    <Card className="relative animate-pulse">
      <div className="flex items-center gap-6">
        {/* Portrait */}
        <div className="relative w-16 h-16">
          <div className="w-full h-full bg-ouro/20 rounded-full border border-ouro/20 flex items-center justify-center">
            <PiUser className="w-8 h-8 text-theme-primary" />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center flex-1">
          <div className="flex items-center py-0.5 mb-2">
            <div className="w-3 h-3 bg-sup-2/30 rounded mr-2"></div>
            <div className="h-5 bg-fundo rounded w-32"></div>
          </div>

          <div className="flex items-center px-3 justify-center py-1 bg-ouro/10 border border-ouro/30 rounded-full w-20">
            <div className="w-2.5 h-2.5 bg-sup-2/30 rounded mr-1"></div>
            <div className="h-3 bg-ouro/20 rounded w-12"></div>
          </div>
        </div>

        {/* Favorite Button Area */}
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 bg-sup-1/50 rounded-full flex items-center justify-center">
            <PiHeart className="w-4 h-4 text-texto-fraco/30" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
        <Inline gap={1}>
          <div className="h-4 w-16 bg-ouro/20 rounded"></div>
          <PiArrowSquareOut className="w-3 h-3 text-texto-fraco/30" />
        </Inline>
      </div>
    </Card>
  );
}

// Skeleton para Work Card
function WorkCardSkeleton() {
  return (
    <Card className="relative animate-pulse">
      <div className="flex-1">
        {/* Title and opus */}
        <div className="flex items-start gap-3 mb-1 flex-col">
          <div className="flex items-center py-0.5 w-full">
            <div className="w-3 h-3 bg-sup-2/30 rounded mr-2"></div>
            <div className="h-5 bg-fundo rounded flex-1"></div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex items-center px-2 py-0.5 bg-theme-elevated border border-linha/30 rounded-md">
              <div className="w-2.5 h-2.5 bg-sup-2/30 rounded mr-1"></div>
              <div className="h-3 bg-sup-1/50 rounded w-8"></div>
            </div>
          </div>

          {/* Favorite Button Area */}
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-sup-1/50 rounded-full flex items-center justify-center">
              <PiHeart className="w-4 h-4 text-texto-fraco/30" />
            </div>
          </div>
        </div>

        {/* Composer info */}
        <Inline gap={2} className="mb-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-sup-2/30 rounded mr-1"></div>
            <div className="h-4 bg-aviso/20 rounded w-28"></div>
          </div>
        </Inline>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-end">
        <Inline gap={1}>
          <div className="h-4 w-16 bg-ouro/20 rounded"></div>
          <PiArrowSquareOut className="w-3 h-3 text-texto-fraco/30" />
        </Inline>
      </div>
    </Card>
  );
}
