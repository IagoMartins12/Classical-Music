// app/student/lessons/loading.tsx - Loading para Aulas do Aluno
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiChatCenteredText,
  PiCheck,
  PiClock,
  PiFunnel,
  PiMagnifyingGlass,
  PiMapPin,
  PiMusicNotes,
  PiUser,
  PiWarning,
  PiX,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function StudentLessonsLoading() {
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
        <div className="text-center mb-8 py-8 animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-ouro/20 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <div className="w-8 h-8 bg-texto/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-lg shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: <PiCalendarBlank className="w-6 h-6 text-sobre-ouro/20" />,
            },
            { icon: <PiClock className="w-6 h-6 text-sobre-ouro/20" /> },
            { icon: <PiCheck className="w-6 h-6 text-sobre-ouro/20" /> },
            { icon: <PiX className="w-6 h-6 text-sobre-ouro/20" /> },
          ].map((item, index) => (
            <Card key={index} className="text-center animate-pulse">
              <div className="w-12 h-12 bg-ouro/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <div className="h-6 bg-ouro/20 rounded mb-2"></div>
              <div className="h-3 bg-theme-elevated rounded"></div>
            </Card>
          ))}
        </div>

        {/* Search and Filters Skeleton */}
        <Card className="mb-8 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg flex items-center">
                <PiMagnifyingGlass className="ml-3 w-5 h-5 text-texto-fraco/30" />
                <div className="h-4 bg-sup-2/20 rounded flex-1 mx-3"></div>
              </div>
            </div>

            {/* Controls */}
            <Inline gap={4}>
              <Inline
                gap={2}
                className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg px-4"
              >
                <PiFunnel className="w-4 h-4 text-texto-fraco/30" />
                <div className="h-4 w-12 bg-sup-2/20 rounded"></div>
              </Inline>

              <div className="h-10 w-20 bg-sup-elevada border border-theme-secondary rounded-lg"></div>

              <Inline
                gap={2}
                className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg px-4"
              >
                <PiArrowsClockwise className="w-4 h-4 text-texto-fraco/30" />
                <div className="h-4 w-16 bg-sup-2/20 rounded"></div>
              </Inline>
            </Inline>
          </div>

          {/* Filters Panel */}
          <div className="mt-6 pt-6 border-t border-theme-secondary grid grid-cols-1 md:grid-cols-3 gap-4">
            <Stack gap={2}>
              <div className="h-3 w-16 bg-sup-2/30 rounded"></div>
              <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
            </Stack>
            <Stack gap={2}>
              <div className="h-3 w-12 bg-sup-2/30 rounded"></div>
              <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
            </Stack>
            <Stack gap={2}>
              <div className="h-3 w-14 bg-sup-2/30 rounded"></div>
              <div className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
            </Stack>
          </div>
        </Card>

        {/* Results Info Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-4 w-48 bg-sup-1/30 rounded"></div>
        </div>

        {/* Lessons Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LessonCardSkeleton key={index} delay={index * 0.05} />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <Inline gap={4} className="justify-center mt-8 animate-pulse">
          <div className="h-10 w-20 bg-sup-elevada border border-theme-secondary rounded-lg flex items-center justify-center">
            <div className="h-4 w-12 bg-sup-2/20 rounded"></div>
          </div>

          <Inline gap={2}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg ${
                  i === 2
                    ? 'bg-ouro/20 border border-ouro/30'
                    : 'bg-theme-elevated border border-theme-secondary'
                }`}
              ></div>
            ))}
          </Inline>

          <div className="h-10 w-20 bg-sup-elevada border border-theme-secondary rounded-lg flex items-center justify-center">
            <div className="h-4 w-12 bg-sup-2/20 rounded"></div>
          </div>
        </Inline>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Lesson Card Skeleton Component
function LessonCardSkeleton({ delay = 0 }: { delay?: number }) {
  const hasAttentionIssue = Math.random() > 0.8; // 20% chance
  const isToday = Math.random() > 0.9; // 10% chance

  return (
    <div
      className={`classical-card p-6 relative animate-pulse ${
        isToday ? 'ring-2 ring-atencao/30' : ''
      } ${hasAttentionIssue ? 'ring-2 ring-erro/30' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Attention Indicator */}
      {hasAttentionIssue && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-erro/30 rounded-full flex items-center justify-center">
          <PiWarning className="w-3 h-3 text-erro/50" />
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-20 bg-aviso/20 border border-aviso/30 rounded-full"></div>
        {isToday && (
          <div className="h-6 w-12 bg-ouro/10 border border-ouro/30 rounded-full"></div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="h-5 bg-fundo/30 rounded w-full mb-2"></div>

      <Stack gap={2} className="mb-4">
        <div className="flex items-center">
          <PiCalendarBlank className="w-4 h-4 mr-2 text-texto-fraco/30" />
          <div className="h-3 bg-sup-1/30 rounded w-32"></div>
        </div>

        <div className="flex items-center">
          <PiClock className="w-4 h-4 mr-2 text-texto-fraco/30" />
          <div className="h-3 bg-sup-1/30 rounded w-20"></div>
        </div>

        <div className="flex items-center">
          <PiUser className="w-4 h-4 mr-2 text-texto-fraco/30" />
          <div className="h-3 bg-sup-1/30 rounded w-24"></div>
        </div>

        <div className="flex items-center">
          <PiMapPin className="w-4 h-4 mr-2 text-texto-fraco/30" />
          <div className="h-3 bg-sup-1/30 rounded w-28"></div>
        </div>
      </Stack>

      {/* Objectives Preview */}
      <Stack gap={1} className="mb-4">
        <div className="h-3 bg-sup-2/30 rounded w-16"></div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-5 w-16 bg-aviso/10 rounded"></div>
          ))}
          <div className="h-3 bg-sup-2/30 rounded w-8"></div>
        </div>
      </Stack>

      {/* Feedback Status */}
      <div className="mb-4">
        <div className="flex items-center">
          <PiChatCenteredText className="w-4 h-4 mr-2 text-ok/30" />
          <div className="h-3 bg-ok/20 rounded w-28"></div>
        </div>
      </div>

      {/* Attention Alert */}
      {hasAttentionIssue && (
        <div className="mb-4">
          <div className="flex items-center">
            <PiWarning className="w-4 h-4 mr-2 text-erro/30" />
            <div className="h-3 bg-erro/20 rounded w-36"></div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <Inline
        gap={2}
        className="h-10 w-full bg-ouro/20 border border-ouro/30 rounded-lg justify-center"
      >
        <div className="w-4 h-4 bg-fundo/30 rounded"></div>
        <div className="h-4 w-20 bg-fundo/30 rounded"></div>
      </Inline>
    </div>
  );
}
