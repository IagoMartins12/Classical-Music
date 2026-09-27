// app/learning/LearningPageLoading.tsx - Clean Skeleton Loading
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCheckCircle,
  PiFunnel,
  PiListBullets,
  PiMagnifyingGlass,
  PiSquaresFour,
  PiTarget,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

export default function LearningPageLoading() {
  return (
    <div className="">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl"></div>
      </div>

      {/* Floating musical notes - static */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-ouro-texto/10">
          <PiBookOpen />
        </div>
        <div className="absolute bottom-16 right-16 text-4xl text-ouro-texto/10">
          <PiTarget />
        </div>
        <div className="absolute top-1/3 right-24 text-3xl text-ouro-texto/10">
          <GiGrandPiano />
        </div>
        <div className="absolute bottom-1/3 left-24 text-3xl text-aviso/10">
          <PiCheckCircle />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-16">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 fill-ouro rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiTarget className="w-8 h-8 text-theme-primary" />
              </div>
            </div>
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-2xl animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            { icon: <FiMusic className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <PiTarget className="w-6 h-6 text-theme-inverse/20" /> },
            {
              icon: <PiCheckCircle className="w-6 h-6 text-theme-inverse/20" />,
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
        <Card>
          <Stack>
            {/* Main Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Tabs Skeleton */}
              <div className="flex bg-theme-secondary rounded-xl p-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className={`px-4 py-2 rounded-lg h-10 w-40 animate-pulse ${
                      index === 0 ? 'bg-ouro/20' : 'bg-theme-elevated'
                    }`}
                  ></div>
                ))}
              </div>

              {/* Search and Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search Skeleton */}
                <div className="relative">
                  <PiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-texto-fraco/50 w-4 h-4" />
                  <div className="h-12 w-32 md:w-96 max-w-full bg-sup-elevada border border-theme-secondary rounded-lg pl-12 animate-pulse"></div>
                </div>

                {/* Filter Button Skeleton */}
                <Inline
                  gap={2}
                  className="h-12 w-24 bg-sup-elevada border border-theme-secondary rounded-lg justify-center animate-pulse"
                >
                  <PiFunnel className="w-4 h-4 text-texto-fraco/30" />
                  <div className="w-12 h-4 bg-sup-2/30 rounded"></div>
                </Inline>

                {/* View Mode Toggle Skeleton */}
                <Inline gap={3}>
                  <Text papel="rotulo" tom="suave">
                    Vista:
                  </Text>
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
          </Stack>
        </Card>

        {/* Want to Learn Section Skeleton */}
        <div>
          <Inline gap={3} className="mb-6">
            <div className="w-10 h-10 bg-aviso/20 rounded-xl flex items-center justify-center">
              <PiTarget className="w-5 h-5 text-sobre-ouro/20" />
            </div>
            <Stack gap={2}>
              <div className="h-8 w-48 bg-fundo rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
            </Stack>
          </Inline>

          {/* Learning Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <LearningCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Learned Section Skeleton */}
        <div>
          <Inline gap={3} className="mb-6">
            <div className="w-10 h-10 bg-ok/20 rounded-xl flex items-center justify-center">
              <PiCheckCircle className="w-5 h-5 text-sobre-ouro/20" />
            </div>
            <Stack gap={2}>
              <div className="h-8 w-32 bg-fundo rounded animate-pulse"></div>
              <div className="h-4 w-28 bg-theme-elevated rounded animate-pulse"></div>
            </Stack>
          </Inline>

          {/* Learned Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <LearningCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Skeleton para Learning Card
function LearningCardSkeleton() {
  return (
    <Card className="animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-fundo rounded w-3/4"></div>
          <div className="h-4 bg-theme-elevated rounded w-1/2"></div>
          <div className="h-3 bg-theme-elevated rounded w-1/3"></div>
        </div>
        <Inline gap={2}>
          <div className="w-8 h-8 bg-theme-secondary rounded-lg"></div>
          <div className="w-8 h-8 bg-theme-secondary rounded-lg"></div>
        </Inline>
      </div>

      {/* Stars */}
      <Inline gap={2} className="mb-4">
        <div className="h-4 w-16 bg-theme-elevated rounded"></div>
        <Inline gap={1}>
          {Array.from({ length: 5 }).map((_, starIndex) => (
            <div
              key={starIndex}
              className="w-4 h-4 bg-atencao/20 rounded"
            ></div>
          ))}
        </Inline>
      </Inline>

      {/* Details */}
      <Stack gap={3}>
        <Inline gap={2}>
          <div className="w-4 h-4 bg-sup-2/30 rounded"></div>
          <div className="h-6 w-20 bg-aviso/20 border border-aviso/30 rounded-full"></div>
        </Inline>

        <Inline gap={2}>
          <div className="w-4 h-4 bg-sup-2/30 rounded"></div>
          <div className="h-4 w-24 bg-theme-elevated rounded"></div>
        </Inline>

        <Stack
          gap={2}
          className="border bg-aviso/10 rounded-lg p-3 border-aviso/30"
        >
          <Inline gap={2}>
            <div className="w-4 h-4 bg-aviso/30 rounded"></div>
            <div className="h-4 w-16 bg-theme-elevated rounded"></div>
          </Inline>
          <Stack gap={2}>
            <div className="h-3 bg-theme-elevated rounded"></div>
            <div className="h-3 bg-theme-elevated rounded w-5/6"></div>
          </Stack>
        </Stack>
      </Stack>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-theme-secondary flex items-center justify-between">
        <div className="h-3 w-24 bg-theme-elevated rounded"></div>
        <div className="h-4 w-20 bg-ouro/20 rounded"></div>
      </div>
    </Card>
  );
}
