// app/teacher/lessons/loading.tsx - Loading para Gerenciar Aulas
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiCheckCircle,
  PiClock,
  PiFunnel,
  PiMapPin,
  PiMusicNotes,
  PiTarget,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function TeacherLessonsLoading() {
  return (
    <div className="min-h-screen">
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

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-ouro-texto/10 animate-float">
          <PiBookOpen />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiCalendarBlank />
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
        <div className="text-center mb-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-ouro/20 rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-texto/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-lg animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <PiBookOpen className="w-6 h-6 text-sobre-ouro/20" /> },
            {
              icon: <PiCalendarBlank className="w-6 h-6 text-sobre-ouro/20" />,
            },
            {
              icon: <PiCheckCircle className="w-6 h-6 text-sobre-ouro/20" />,
            },
            { icon: <PiUsers className="w-6 h-6 text-sobre-ouro/20" /> },
          ].map((item, index) => (
            <Card key={index} className="text-center animate-pulse">
              <div className="w-12 h-12 bg-ouro/20 border border-ouro/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="h-8 bg-ouro/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </Card>
          ))}
        </div>

        {/* Controls Skeleton */}
        <Card className="mb-8 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
              </div>
              <div className="h-10 w-48 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-40 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 bg-ouro/20 border border-ouro/30 rounded-lg"></div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-theme-secondary mt-4">
            <Inline gap={2}>
              <PiFunnel className="w-4 h-4 text-texto-fraco/30" />
              <div className="h-3 bg-sup-1/30 rounded w-56"></div>
            </Inline>
            <div className="h-3 bg-sup-2/30 rounded w-24"></div>
          </div>
        </Card>

        {/* Lessons List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <LessonCardSkeleton key={index} />
          ))}
        </div>

        {/* Load More Skeleton */}
        <div className="text-center mt-8">
          <div className="h-10 w-48 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Lesson Card Skeleton
function LessonCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            {/* Student Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-ouro/20 rounded-full"></div>
            </div>

            {/* Lesson Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <Inline gap={3} className="mb-2">
                    <div className="h-5 bg-fundo rounded w-48"></div>
                    <div className="h-6 w-20 bg-aviso/20 border border-aviso/30 rounded-full"></div>
                  </Inline>

                  <Inline gap={4} className="mb-3">
                    <Inline gap={2}>
                      <PiUser className="w-4 h-4 text-texto-fraco/30" />
                      <div className="h-3 bg-theme-elevated rounded w-20"></div>
                    </Inline>
                    <Inline gap={2}>
                      <PiCalendarBlank className="w-4 h-4 text-texto-fraco/30" />
                      <div className="h-3 bg-theme-elevated rounded w-24"></div>
                    </Inline>
                    <Inline gap={2}>
                      <PiClock className="w-4 h-4 text-texto-fraco/30" />
                      <div className="h-3 bg-theme-elevated rounded w-16"></div>
                    </Inline>
                    <Inline gap={2}>
                      <PiMapPin className="w-4 h-4 text-texto-fraco/30" />
                      <div className="h-3 bg-theme-elevated rounded w-20"></div>
                    </Inline>
                  </Inline>
                </div>

                {/* Actions */}
                <Inline gap={2} className="ml-4">
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                </Inline>
              </div>

              {/* Description */}
              <Stack gap={2} className="mb-4">
                <div className="h-3 bg-theme-elevated rounded w-full"></div>
                <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
              </Stack>

              {/* Objectives */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-aviso/20 border border-aviso/30 rounded"
                  ></div>
                ))}
              </div>

              {/* Works */}
              <Stack gap={2} className="mb-4">
                <Inline gap={2}>
                  <PiMusicNotes className="w-4 h-4 text-texto-fraco/30" />
                  <div className="h-3 bg-sup-2/30 rounded w-24"></div>
                </Inline>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-32 bg-ouro/20 border border-ouro/30 rounded"
                    ></div>
                  ))}
                </div>
              </Stack>

              {/* Homework */}
              <Stack gap={2}>
                <Inline gap={2}>
                  <PiTarget className="w-4 h-4 text-texto-fraco/30" />
                  <div className="h-3 bg-sup-2/30 rounded w-20"></div>
                </Inline>
                <Stack gap={1}>
                  <div className="h-3 bg-theme-elevated rounded w-full"></div>
                  <div className="h-3 bg-theme-elevated rounded w-2/3"></div>
                </Stack>
              </Stack>

              {/* Progress */}
              <Stack
                gap={2}
                className="mt-4 pt-4 border-t border-theme-secondary"
              >
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-sup-2/30 rounded w-16"></div>
                  <div className="h-3 bg-sup-2/30 rounded w-8"></div>
                </div>
                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div className="h-2 bg-ouro/30 rounded-full w-2/3"></div>
                </div>
              </Stack>

              {/* Stats */}
              <Inline gap={6} className="text-sm text-theme-tertiary mt-4">
                <Inline gap={2}>
                  <PiCalendarBlank className="w-4 h-4 text-texto-fraco/30" />
                  <div className="h-3 bg-sup-2/30 rounded w-20"></div>
                </Inline>
                <Inline gap={2}>
                  <PiClock className="w-4 h-4 text-texto-fraco/30" />
                  <div className="h-3 bg-sup-2/30 rounded w-16"></div>
                </Inline>
                <Inline gap={2}>
                  <PiTarget className="w-4 h-4 text-texto-fraco/30" />
                  <div className="h-3 bg-sup-2/30 rounded w-12"></div>
                </Inline>
              </Inline>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
