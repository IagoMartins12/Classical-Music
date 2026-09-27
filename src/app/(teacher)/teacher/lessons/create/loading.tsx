// app/teacher/lessons/create/loading.tsx - Loading para Criar Nova Aula
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import { PiBookOpen, PiCalendarBlank, PiMusicNotes } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function CreateLessonLoading() {
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
          <PiBookOpen />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiCalendarBlank />
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
            <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            <div>
              <div className="h-8 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2 w-48"></div>
              <div className="h-4 bg-theme-elevated rounded w-64"></div>
            </div>
          </Inline>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Skeleton */}
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <div className="space-y-8">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48 mb-4"></div>

                  {/* Student Selection */}
                  <div>
                    <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-16"></div>
                    <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </div>

                  {/* Lesson Title */}
                  <div>
                    <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-20"></div>
                    <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </div>

                  {/* Description */}
                  <div>
                    <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-18"></div>
                    <div className="h-24 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </div>
                </div>

                {/* Date & Time Section */}
                <div className="space-y-4">
                  <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-32"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-12"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-20"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-24"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-16"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className="space-y-4">
                  <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-20"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-12"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-20"></div>
                      <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>
                  </div>

                  <div>
                    <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-32"></div>
                    <div className="h-20 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </div>
                </div>

                {/* Objectives Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-28"></div>
                    <div className="h-6 w-20 bg-brand-primary/20 rounded"></div>
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex-1"></div>
                        <div className="w-8 h-8 bg-theme-elevated rounded"></div>
                      </Inline>
                    ))}
                  </div>
                </div>

                {/* Musical Works Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Inline gap={2}>
                      <PiMusicNotes className="w-5 h-5 text-theme-primary/30" />
                      <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-32"></div>
                    </Inline>
                    <div className="h-4 bg-theme-tertiary/30 rounded w-16"></div>
                  </div>

                  <Card nivel={2} densidade="compacta">
                    <div className="space-y-3">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <MusicalWorkItemSkeleton key={i} />
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Homework Section */}
                <div className="space-y-4">
                  <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-28"></div>

                  <div>
                    <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-32"></div>
                    <div className="h-20 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-theme-tertiary/30 rounded w-20"></div>
                    <div className="h-6 w-20 bg-brand-primary/20 rounded"></div>
                  </div>

                  <div className="space-y-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex-1"></div>
                        <div className="w-8 h-8 bg-theme-elevated rounded"></div>
                      </Inline>
                    ))}
                  </div>
                </div>

                {/* Advanced Options Section */}
                <div className="space-y-4">
                  <Inline gap={2}>
                    <div className="h-4 bg-brand-primary/30 rounded w-32"></div>
                    <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                  </Inline>

                  {/* Advanced form fields */}
                  <div className="space-y-6 p-4 bg-theme-secondary/5 rounded-lg">
                    {/* Notes */}
                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-28"></div>
                      <div className="h-20 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
                    </div>

                    {/* Recordings */}
                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-32"></div>
                      <Inline gap={4}>
                        <Inline gap={2}>
                          <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                          <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                        </Inline>
                        <Inline gap={2}>
                          <div className="w-4 h-4 bg-theme-tertiary/30 rounded"></div>
                          <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                        </Inline>
                      </Inline>
                    </div>

                    {/* Recurring */}
                    <div>
                      <div className="h-4 bg-theme-tertiary/30 rounded mb-2 w-28"></div>
                      <Inline gap={4}>
                        <div className="w-6 h-6 bg-theme-tertiary/30 rounded"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-48"></div>
                      </Inline>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <Inline
                  gap={3}
                  className="justify-end pt-6 border-t border-theme-secondary"
                >
                  <div className="h-10 w-20 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
                  <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg"></div>
                </Inline>
              </div>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Selected Student Info */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-32 mb-4"></div>

              <div className="space-y-4">
                <Inline gap={3}>
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-theme-primary/30 rounded mb-1 w-20"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                  </div>
                </Inline>

                {/* Student stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-theme-secondary">
                  <div className="text-center">
                    <div className="h-5 bg-accent-blue/20 rounded mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-3/4 mx-auto"></div>
                  </div>
                  <div className="text-center">
                    <div className="h-5 bg-accent-green/20 rounded mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-3/4 mx-auto"></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Templates */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-28 mb-4"></div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <LessonTemplateSkeleton key={i} />
                ))}
              </div>
            </Card>

            {/* Recent Lessons */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-28 mb-4"></div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <RecentLessonSkeleton key={i} />
                ))}
              </div>
            </Card>

            {/* Tips */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-12 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-brand-primary/30 rounded mt-0.5 flex-shrink-0"></div>
                    <div className="h-3 bg-theme-secondary/30 rounded flex-1"></div>
                  </div>
                ))}
              </div>
            </Card>
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

// Musical Work Item Skeleton
function MusicalWorkItemSkeleton() {
  return (
    <Inline
      gap={3}
      className="p-3 bg-theme-elevated/50 rounded-lg animate-pulse"
    >
      <div className="w-8 h-8 bg-accent-purple/20 rounded-lg flex-shrink-0"></div>
      <div className="flex-1 min-w-0">
        <div className="h-3 bg-theme-primary/20 rounded mb-1 w-3/4"></div>
        <div className="h-3 bg-theme-tertiary/20 rounded w-1/2"></div>
      </div>
      <div className="w-6 h-6 bg-theme-elevated rounded"></div>
    </Inline>
  );
}

// Lesson Template Skeleton
function LessonTemplateSkeleton() {
  return (
    <div className="p-3 bg-theme-elevated/50 rounded-lg cursor-pointer hover:bg-interactive-hover transition-colors animate-pulse">
      <Inline gap={3}>
        <div className="w-8 h-8 bg-accent-blue/20 rounded-lg flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-3 bg-theme-primary/20 rounded mb-1 w-3/4"></div>
          <div className="h-3 bg-theme-tertiary/20 rounded w-1/2"></div>
        </div>
      </Inline>
    </div>
  );
}

// Recent Lesson Skeleton
function RecentLessonSkeleton() {
  return (
    <div className="p-3 bg-theme-elevated/50 rounded-lg animate-pulse">
      <Inline gap={3} className="mb-2">
        <div className="w-6 h-6 bg-brand-primary/20 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-3 bg-theme-primary/20 rounded mb-1 w-3/4"></div>
          <div className="h-3 bg-theme-tertiary/20 rounded w-1/2"></div>
        </div>
      </Inline>
      <div className="text-right">
        <div className="h-3 bg-brand-primary/30 rounded w-16 ml-auto"></div>
      </div>
    </div>
  );
}
