// app/teacher/assignments/loading.tsx - Loading para Tarefas do Professor
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCheckCircle,
  PiClipboardText,
  PiClock,
  PiMusicNotes,
  PiTarget,
  PiWarningCircle,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function TeacherAssignmentsLoading() {
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
          <PiClipboardText />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiTarget />
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
        <div className="text-center mb-8 py-16">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 border border-theme-primary rounded-2xl mx-auto max-w-lg animate-pulse shadow-theme-medium"></div>
            <div className="h-6 border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              icon: <PiClipboardText className="w-6 h-6" />,
            },
            { icon: <PiClock className="w-6 h-6" /> },
            { icon: <PiBookOpen className="w-6 h-6" /> },
            {
              icon: <PiCheckCircle className="w-6 h-6" />,
            },
            {
              icon: <PiWarningCircle className="w-6 h-6" />,
            },
          ].map((item, index) => (
            <Card key={index} className="text-center animate-pulse">
              <div className="w-12 h-12 border rounded-xl mx-auto mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="h-8 rounded-lg mb-2"></div>
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
                <div className="h-10 border border-theme-secondary rounded-lg"></div>
              </div>
              <div className="h-10 w-48 border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-40 border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-40 border border-theme-secondary rounded-lg"></div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 border rounded-lg"></div>
            </div>
          </div>
        </Card>

        {/* Assignments Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <AssignmentCardSkeleton key={index} />
          ))}
        </div>

        {/* Load More Skeleton */}
        <div className="text-center mt-8">
          <div className="h-10 w-48 border border-theme-secondary rounded-lg mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 rounded-full animate-pulse"></div>
    </div>
  );
}

// Assignment Card Skeleton
function AssignmentCardSkeleton() {
  return (
    <Card className="h-full animate-pulse">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <Inline gap={3} className="flex-1">
          {/* Student Avatar */}
          <div className="w-12 h-12 rounded-full"></div>

          {/* Title and student info */}
          <div className="flex-1">
            <div className="h-5 rounded mb-2 w-3/4"></div>
            <Inline gap={4}>
              <div className="h-3 bg-theme-elevated rounded w-20"></div>
              <div className="h-3 bg-theme-elevated rounded w-16"></div>
              <div className="h-3 bg-theme-elevated rounded w-24"></div>
            </Inline>
          </div>
        </Inline>

        {/* Status badges */}
        <Inline gap={2}>
          <div className="h-6 w-20 border rounded-full"></div>
          <div className="h-6 w-16 border rounded-full"></div>
        </Inline>
      </div>

      {/* Description */}
      <Stack gap={2} className="mb-4">
        <div className="h-3 bg-theme-elevated rounded w-full"></div>
        <div className="h-3 bg-theme-elevated rounded w-5/6"></div>
      </Stack>

      {/* Progress bar */}
      <Stack gap={2} className="mb-4">
        <div className="flex items-center justify-between">
          <div className="h-3 rounded w-16"></div>
          <div className="h-3 rounded w-8"></div>
        </div>
        <div className="w-full bg-theme-secondary rounded-full h-2">
          <div className="h-2 rounded-full w-2/3"></div>
        </div>
      </Stack>

      {/* Goals */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="h-6 w-20 border rounded"></div>
        <div className="h-6 w-24 border rounded"></div>
        <div className="h-6 w-16 border rounded"></div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-theme-secondary">
        <div className="h-3 rounded w-32"></div>
        <Inline gap={2}>
          <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
          <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
          <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
        </Inline>
      </div>
    </Card>
  );
}
