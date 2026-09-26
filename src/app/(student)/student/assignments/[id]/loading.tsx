// app/student/assignments/[id]/loading.tsx - Loading para Detalhes da Tarefa do Aluno
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowLeft,
  PiBookOpen,
  PiCalendarBlank,
  PiCheck,
  PiCheckCircle,
  PiCircle,
  PiClock,
  PiFloppyDisk,
  PiMusicNotes,
  PiStar,
  PiTarget,
} from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';

export default function StudentAssignmentDetailsLoading() {
  return (
    <div className="bg-gradient-primary min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-brand-primary/10 animate-float">
          <PiTarget />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiBookOpen />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl text-accent-purple/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl text-accent-blue/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <PiMusicNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <Inline gap={4}>
            <div className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary flex items-center justify-center">
              <PiArrowLeft className="w-4 h-4 text-theme-tertiary/30" />
            </div>
            <div>
              <div className="h-8 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl w-80 mb-2"></div>
              <div className="h-4 bg-theme-secondary/30 rounded w-48"></div>
            </div>
          </Inline>

          {/* Quick Actions */}
          <Inline gap={3}>
            <div className="h-8 w-20 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full"></div>
            <Inline
              gap={2}
              className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4"
            >
              <PiFloppyDisk className="w-4 h-4 text-theme-tertiary/30" />
              <div className="h-4 w-24 bg-theme-tertiary/20 rounded"></div>
            </Inline>
            <Inline
              gap={2}
              className="h-10 bg-gradient-to-r from-accent-green/20 to-accent-green/30 border border-accent-green/30 rounded-lg px-4"
            >
              <PiCheck className="w-4 h-4 text-theme-inverse/30" />
              <div className="h-4 w-20 bg-theme-inverse/30 rounded"></div>
            </Inline>
          </Inline>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Assignment Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-6 bg-theme-primary/30 rounded w-40 mb-6"></div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-16 mb-2"></div>
                    <div className="h-6 w-16 bg-accent-yellow/10 border border-accent-yellow/30 rounded-full"></div>
                  </div>
                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-12 mb-2"></div>
                    <Inline gap={2}>
                      <PiCalendarBlank className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-4 bg-theme-primary/30 rounded w-24"></div>
                      <div className="h-3 bg-accent-yellow/30 rounded w-20"></div>
                    </Inline>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-primary/30 rounded w-full"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-3/4"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-1/2"></div>
                  </div>
                </div>

                {/* Progress Section */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-2"></div>
                  <Inline gap={4} className="mb-4">
                    <div className="flex-1">
                      <div className="w-full bg-theme-secondary rounded-full h-3">
                        <div className="bg-green-400/30 h-3 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                  </Inline>

                  {/* Time Study Section */}
                  <div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-32 mb-3"></div>
                    <div className="rounded-lg p-4 border border-theme-secondary">
                      <Inline gap={4}>
                        <div className="flex-1">
                          <Inline gap={2} className="mb-2">
                            <PiClock className="w-4 h-4 text-accent-blue/30" />
                            <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                          </Inline>
                          <Inline gap={2}>
                            <div className="h-10 w-20 bg-theme-elevated rounded border border-theme-secondary"></div>
                            <div className="h-3 bg-theme-secondary/30 rounded w-12"></div>
                          </Inline>
                        </div>
                        <div className="text-right">
                          <div className="h-3 bg-theme-tertiary/30 rounded w-12 mb-1"></div>
                          <div className="h-4 bg-theme-primary/30 rounded w-12"></div>
                        </div>
                      </Inline>
                    </div>
                  </div>

                  <Inline
                    gap={2}
                    className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mt-4 px-4"
                  >
                    <PiTarget className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-4 w-28 bg-theme-tertiary/20 rounded"></div>
                  </Inline>
                </div>

                {/* Goals Section */}
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-32 mb-2"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiTarget className="w-4 h-4 text-accent-blue/30" />
                        <div className="h-3 bg-theme-primary/30 rounded flex-1 max-w-80"></div>
                      </Inline>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-28 mb-2"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiTarget className="w-4 h-4 text-accent-green/30" />
                        <div className="h-3 bg-theme-primary/30 rounded flex-1 max-w-72"></div>
                      </Inline>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20 mb-2"></div>
                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiBookOpen className="w-4 h-4 text-accent-purple/30" />
                        <div className="h-3 bg-theme-primary/30 rounded flex-1 max-w-64"></div>
                      </Inline>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Musical Pieces Section */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-lg flex items-center justify-center">
                    <PiMusicNotes className="w-5 h-5 text-theme-inverse/30" />
                  </div>
                  <div className="h-5 bg-theme-primary/30 rounded w-48"></div>
                </Inline>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border border-theme-secondary rounded-lg"
                  >
                    <div className="h-5 bg-theme-primary/30 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-accent-blue/20 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Feedback */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-6 bg-theme-primary/30 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                <div className="p-4 bg-accent-blue/5 border border-accent-blue/20 rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-theme-primary/30 rounded w-full"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-5/6"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-2/3"></div>
                  </div>
                </div>

                <Inline gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <PiStar
                      key={star}
                      className="w-5 h-5 text-accent-yellow/30"
                    />
                  ))}
                  <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                </Inline>
              </div>
            </div>

            {/* Student Notes */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-6 bg-theme-primary/30 rounded w-32 mb-4"></div>
              <div className="space-y-4">
                <div className="h-24 bg-theme-elevated border border-theme-secondary rounded"></div>
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-64 mb-2"></div>
                  <Inline gap={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <PiStar
                        key={star}
                        className="w-6 h-6 text-theme-tertiary/30"
                      />
                    ))}
                    <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                  </Inline>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-20 mb-4"></div>
              <Inline gap={3} className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-brand-primary/30 rounded w-32"></div>
                </div>
              </Inline>
            </div>

            {/* Assignment Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-24 mb-4"></div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-20"></div>
                </div>
                <div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-brand-primary/30 rounded w-32"></div>
                </div>
              </div>
            </div>

            {/* Progress Milestones Preview */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-20 mb-4"></div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => {
                  const isCompleted = Math.random() > 0.5;
                  return (
                    <div
                      key={i}
                      className={`flex items-center space-x-2 text-sm ${
                        isCompleted
                          ? 'text-theme-primary'
                          : 'text-theme-tertiary'
                      }`}
                    >
                      {isCompleted ? (
                        <PiCheckCircle className="w-4 h-4 text-accent-green/30" />
                      ) : (
                        <PiCircle className="w-4 h-4 text-theme-tertiary/30" />
                      )}
                      <div className="h-3 bg-theme-primary/30 rounded flex-1 max-w-32"></div>
                    </div>
                  );
                })}
                <div className="h-3 bg-brand-primary/30 rounded w-20"></div>
              </div>
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
