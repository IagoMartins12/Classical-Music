// app/teacher/assignments/[id]/loading.tsx - Loading para Detalhes da Tarefa
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiClipboardText,
  PiClock,
  PiMusicNotes,
  PiStar,
  PiTarget,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function AssignmentDetailsLoading() {
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
          <PiClipboardText />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiTarget />
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
            <Stack gap={2}>
              <div className="h-8 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-64"></div>
              <div className="h-4 bg-theme-elevated rounded w-40"></div>
            </Stack>
          </Inline>

          {/* Quick Actions */}
          <Inline gap={3}>
            <div className="h-8 w-20 bg-gradient-to-r from-accent-green/20 to-accent-green/20 border border-accent-green/30 rounded-full"></div>
            <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg"></div>
          </Inline>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <Stack gap={8} className="lg:col-span-2 order-2 lg:order-1">
            {/* Assignment Info */}
            <Card className="animate-pulse">
              <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48 mb-6"></div>

              <Stack gap={6}>
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Stack gap={2}>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-8"></div>
                    <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                  </Stack>

                  <Stack gap={2}>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                    <div className="h-6 w-16 bg-gradient-to-r from-accent-yellow/20 to-accent-yellow/20 border border-accent-yellow/30 rounded-full"></div>
                  </Stack>

                  <Stack gap={2}>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-12"></div>
                    <Inline gap={2}>
                      <PiCalendarBlank className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-4 bg-theme-primary/30 rounded w-24"></div>
                      <div className="h-4 bg-accent-yellow/30 rounded w-20"></div>
                    </Inline>
                  </Stack>

                  <Stack gap={2}>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                    <Inline gap={2}>
                      <PiClock className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-4 bg-theme-primary/30 rounded w-20"></div>
                      <div className="h-4 bg-theme-tertiary/30 rounded w-16"></div>
                    </Inline>
                  </Stack>
                </div>

                {/* Description */}
                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                  <Stack gap={2}>
                    <div className="h-4 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-4 bg-theme-primary/20 rounded w-5/6"></div>
                    <div className="h-4 bg-theme-primary/20 rounded w-4/6"></div>
                  </Stack>
                </Stack>

                {/* Goals */}
                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiTarget className="w-4 h-4 text-accent-blue/30" />
                        <div className="h-3 bg-theme-primary/20 rounded flex-1"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-28"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiTarget className="w-4 h-4 text-accent-green/30" />
                        <div className="h-3 bg-theme-primary/20 rounded flex-1"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiBookOpen className="w-4 h-4 text-accent-purple/30" />
                        <div className="h-3 bg-theme-primary/20 rounded flex-1"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                {/* Progress */}
                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                  <Inline gap={4}>
                    <div className="flex-1">
                      <div className="w-full bg-theme-secondary rounded-full h-3">
                        <div className="bg-gradient-to-r from-brand-primary/30 to-brand-secondary/30 h-3 rounded-full w-2/3"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                  </Inline>
                </Stack>
              </Stack>
            </Card>

            {/* Musical Pieces Section */}
            <Card className="animate-pulse">
              <Inline gap={2} className="mb-4">
                <PiMusicNotes className="w-5 h-5 text-theme-primary/30" />
                <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48"></div>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MusicalPieceCardSkeleton key={i} />
                ))}
              </div>
            </Card>

            {/* Student Submission */}
            <Card className="animate-pulse">
              <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-36 mb-4"></div>

              <div className="h-3 bg-theme-tertiary/30 rounded mb-4 w-48"></div>

              {/* Student Notes */}
              <Stack gap={2} className="mb-6">
                <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                <div className="p-4 bg-theme-secondary/10 rounded-lg border">
                  <Stack gap={2}>
                    <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-4/5"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-3/5"></div>
                  </Stack>
                </div>
              </Stack>

              {/* Student Rating */}
              <Stack gap={2} className="mb-6">
                <div className="h-3 bg-theme-tertiary/30 rounded w-40"></div>
                <Inline gap={2}>
                  <div className="flex space-x-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <PiStar
                        key={i}
                        className="w-5 h-5 text-accent-yellow/30"
                      />
                    ))}
                  </div>
                  <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                </Inline>
              </Stack>

              {/* Submission Files */}
              <Stack>
                <div className="h-4 bg-theme-primary/30 rounded w-32"></div>
                <div className="h-3 bg-theme-tertiary/30 rounded w-48"></div>
              </Stack>
            </Card>

            {/* Teacher Feedback */}
            <Card className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-28"></div>
                <div className="h-8 w-16 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              </div>

              <Stack>
                {/* Feedback Text */}
                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="p-4 bg-theme-secondary/10 rounded-lg border">
                    <Stack gap={2}>
                      <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                      <div className="h-3 bg-theme-primary/20 rounded w-3/4"></div>
                    </Stack>
                  </div>
                </Stack>

                {/* Teacher Rating */}
                <Stack gap={2}>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                  <Inline gap={2}>
                    <div className="flex space-x-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <PiStar
                          key={i}
                          className="w-6 h-6 text-accent-yellow/30"
                        />
                      ))}
                    </div>
                    <div className="h-4 bg-theme-primary/30 rounded w-8"></div>
                  </Inline>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Sidebar */}
          <Stack gap={6} className="order-1 lg:order-2">
            {/* Student Info */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-12 mb-4"></div>

              <Inline gap={3} className="mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
                <Stack gap={1}>
                  <div className="h-4 bg-theme-primary/30 rounded w-24"></div>
                  <div className="h-3 bg-brand-primary/30 rounded w-20"></div>
                </Stack>
              </Inline>
            </Card>

            {/* Quick Actions */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-12 mb-4"></div>
              <Stack>
                <div className="h-10 bg-gradient-to-r from-accent-green/20 to-accent-green/20 border border-accent-green/30 rounded-lg w-full"></div>
                <div className="h-10 bg-theme-elevated border border-theme-secondary rounded-lg w-full"></div>
              </Stack>
            </Card>

            {/* Assignment Info */}
            <Card className="animate-pulse">
              <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-20 mb-4"></div>
              <Stack gap={3}>
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-16"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-12"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-16"></div>
                </div>

                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-accent-purple/30 rounded w-20"></div>
                </div>
              </Stack>
            </Card>
          </Stack>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Musical Piece Card Skeleton
function MusicalPieceCardSkeleton() {
  return (
    <Card nivel={2} densidade="compacta" className="animate-pulse">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-accent-blue/20 rounded-lg flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-theme-primary/30 rounded mb-1 w-3/4"></div>
          <div className="h-3 bg-theme-tertiary/30 rounded mb-2 w-1/2"></div>
          <div className="h-3 bg-accent-green/30 rounded w-20"></div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-theme-secondary">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-theme-tertiary/30 rounded w-12"></div>
          <div className="flex space-x-2">
            <div className="w-6 h-6 bg-theme-elevated rounded"></div>
            <div className="w-6 h-6 bg-theme-elevated rounded"></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
