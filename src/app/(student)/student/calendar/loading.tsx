// app/student/calendar/loading.tsx - Loading para Calendário do Aluno
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowsClockwise,
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiCheck,
  PiClock,
  PiMusicNotes,
  PiWarningCircle,
  PiX,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function StudentCalendarLoading() {
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
        <div className="absolute top-16 left-16 text-5xl animate-float">
          <PiCalendarBlank />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiClock />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <PiMusicNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-8 animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <div className="w-8 h-8 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 border border-theme-primary rounded-2xl mx-auto max-w-lg shadow-theme-medium"></div>
            <div className="h-6 border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              icon: <PiCalendarBlank className="w-6 h-6" />,
            },
            { icon: <PiClock className="w-6 h-6" /> },
            { icon: <PiCheck className="w-6 h-6" /> },
            { icon: <PiX className="w-6 h-6" /> },
            {
              icon: <PiWarningCircle className="w-6 h-6" />,
            },
          ].map((item, index) => (
            <Card key={index} className="text-center animate-pulse">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <div className="h-6 rounded mb-2"></div>
              <div className="h-3 bg-theme-elevated rounded"></div>
            </Card>
          ))}
        </div>

        {/* Calendar Controls Skeleton */}
        <Card className="animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Navigation */}
            <Inline gap={4}>
              <Inline gap={2}>
                <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex items-center justify-center">
                  <PiCaretLeft className="w-5 h-5" />
                </div>

                <div className="text-center min-w-48">
                  <div className="h-6 rounded w-32 mx-auto"></div>
                </div>

                <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex items-center justify-center">
                  <PiCaretRight className="w-5 h-5" />
                </div>
              </Inline>

              <div className="h-10 w-16 border border-theme-secondary rounded-lg"></div>

              <Inline
                gap={2}
                className="h-10 border border-theme-secondary rounded-lg px-4"
              >
                <PiArrowsClockwise className="w-4 h-4" />
                <div className="h-4 w-16 rounded"></div>
              </Inline>
            </Inline>

            {/* View Mode and Filters */}
            <Inline gap={4}>
              {/* View Mode Toggle */}
              <div className="flex rounded-lg p-1">
                <div className="px-3 py-2 rounded-lg text-sm">
                  <div className="h-4 w-8 rounded"></div>
                </div>
                <div className="px-3 py-2 rounded-lg text-sm">
                  <div className="h-4 w-12 rounded"></div>
                </div>
                <div className="px-3 py-2 rounded-lg text-sm">
                  <div className="h-4 w-6 rounded"></div>
                </div>
              </div>

              {/* Filters */}
              <div className="h-10 w-48 border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-40 border border-theme-secondary rounded-lg"></div>
            </Inline>
          </div>
        </Card>

        {/* Calendar Content Skeleton */}
        <Card className="animate-pulse">
          {/* Month View Skeleton */}
          <div>
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="p-3 text-center text-sm">
                  <div className="h-4 rounded w-8 mx-auto"></div>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 42 }).map((_, index) => (
                <CalendarDaySkeleton key={index} delay={index * 0.01} />
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 rounded-full animate-pulse"></div>
    </div>
  );
}

// Calendar Day Skeleton Component
function CalendarDaySkeleton({ delay = 0 }: { delay?: number }) {
  const hasEvents = Math.random() > 0.7; // 30% chance of having events
  const eventCount = hasEvents ? Math.floor(Math.random() * 3) + 1 : 0;

  return (
    <Stack
      gap={1}
      className="min-h-24 p-2 border rounded-lg transition-all animate-pulse"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-4 w-6 rounded"></div>

      <div className="space-y-1">
        {Array.from({ length: eventCount }).map((_, i) => (
          <div
            key={i}
            className={`w-full h-4 rounded text-xs transition-all ${
              i % 3 === 0 ? 'border' : i % 3 === 1 ? 'border' : 'border'
            }`}
          ></div>
        ))}

        {eventCount > 2 && <div className="h-3 w-12 rounded"></div>}
      </div>
    </Stack>
  );
}
