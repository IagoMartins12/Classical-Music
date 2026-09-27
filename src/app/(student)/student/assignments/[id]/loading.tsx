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
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function StudentAssignmentDetailsLoading() {
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
          <PiTarget />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiBookOpen />
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
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <Inline gap={4}>
            <div className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary flex items-center justify-center">
              <PiArrowLeft className="w-4 h-4" />
            </div>
            <Stack gap={2}>
              <div className="h-8 border border-theme-primary rounded-2xl w-80"></div>
              <div className="h-4 rounded w-48"></div>
            </Stack>
          </Inline>

          {/* Quick Actions */}
          <Inline gap={3}>
            <div className="h-8 w-20 border rounded-full"></div>
            <Inline
              gap={2}
              className="h-10 border border-theme-secondary rounded-lg px-4"
            >
              <PiFloppyDisk className="w-4 h-4" />
              <div className="h-4 w-24 rounded"></div>
            </Inline>
            <Inline gap={2} className="h-10 border rounded-lg px-4">
              <PiCheck className="w-4 h-4" />
              <div className="h-4 w-20 rounded"></div>
            </Inline>
          </Inline>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <Stack gap={8} className="lg:col-span-2">
            {/* Assignment Info */}
            <Card className="animate-pulse">
              <div className="h-6 rounded w-40 mb-6"></div>

              <Stack gap={6}>
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Stack gap={2}>
                    <div className="h-3 rounded w-12"></div>
                    <div className="h-4 rounded w-20"></div>
                  </Stack>
                  <Stack gap={2}>
                    <div className="h-3 rounded w-16"></div>
                    <div className="h-6 w-16 border rounded-full"></div>
                  </Stack>
                  <Stack gap={2}>
                    <div className="h-3 rounded w-12"></div>
                    <Inline gap={2}>
                      <PiCalendarBlank className="w-4 h-4" />
                      <div className="h-4 rounded w-24"></div>
                      <div className="h-3 rounded w-20"></div>
                    </Inline>
                  </Stack>
                </div>

                {/* Description */}
                <Stack gap={2}>
                  <div className="h-3 rounded w-16"></div>
                  <Stack gap={2}>
                    <div className="h-4 rounded w-full"></div>
                    <div className="h-4 rounded w-3/4"></div>
                    <div className="h-4 rounded w-1/2"></div>
                  </Stack>
                </Stack>

                {/* Progress Section */}
                <div>
                  <div className="h-3 rounded w-24 mb-2"></div>
                  <Inline gap={4} className="mb-4">
                    <div className="flex-1">
                      <div className="w-full bg-theme-secondary rounded-full h-3">
                        <div className="bg-green-400/30 h-3 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    <div className="h-4 rounded w-8"></div>
                  </Inline>

                  {/* Time Study Section */}
                  <Stack gap={3}>
                    <div className="h-3 rounded w-32"></div>
                    <div className="rounded-lg p-4 border border-theme-secondary">
                      <Inline gap={4}>
                        <div className="flex-1">
                          <Inline gap={2} className="mb-2">
                            <PiClock className="w-4 h-4" />
                            <div className="h-4 rounded w-20"></div>
                          </Inline>
                          <Inline gap={2}>
                            <div className="h-10 w-20 bg-theme-elevated rounded border border-theme-secondary"></div>
                            <div className="h-3 rounded w-12"></div>
                          </Inline>
                        </div>
                        <Stack gap={1} className="text-right">
                          <div className="h-3 rounded w-12"></div>
                          <div className="h-4 rounded w-12"></div>
                        </Stack>
                      </Inline>
                    </div>
                  </Stack>

                  <Inline
                    gap={2}
                    className="h-10 border border-theme-secondary rounded-lg mt-4 px-4"
                  >
                    <PiTarget className="w-4 h-4" />
                    <div className="h-4 w-28 rounded"></div>
                  </Inline>
                </div>

                {/* Goals Section */}
                <Stack gap={2}>
                  <div className="h-3 rounded w-32"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiTarget className="w-4 h-4" />
                        <div className="h-3 rounded flex-1 max-w-80"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                <Stack gap={2}>
                  <div className="h-3 rounded w-28"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiTarget className="w-4 h-4" />
                        <div className="h-3 rounded flex-1 max-w-72"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>

                <Stack gap={2}>
                  <div className="h-3 rounded w-20"></div>
                  <Stack gap={2}>
                    {Array.from({ length: 2 }).map((_, i) => (
                      <Inline gap={2} key={i}>
                        <PiBookOpen className="w-4 h-4" />
                        <div className="h-3 rounded flex-1 max-w-64"></div>
                      </Inline>
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </Card>

            {/* Musical Pieces Section */}
            <Card className="animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <Inline gap={3}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <PiMusicNotes className="w-5 h-5" />
                  </div>
                  <div className="h-5 rounded w-48"></div>
                </Inline>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Stack
                    gap={2}
                    key={i}
                    className="p-4 border border-theme-secondary rounded-lg"
                  >
                    <div className="h-5 rounded w-32"></div>
                    <div className="h-3 rounded w-24"></div>
                    <div className="h-3 rounded w-16"></div>
                  </Stack>
                ))}
              </div>
            </Card>

            {/* Teacher Feedback */}
            <Card className="animate-pulse">
              <div className="h-6 rounded w-48 mb-4"></div>
              <Stack>
                <div className="p-4 border rounded-lg">
                  <Stack gap={2}>
                    <div className="h-4 rounded w-full"></div>
                    <div className="h-4 rounded w-5/6"></div>
                    <div className="h-4 rounded w-2/3"></div>
                  </Stack>
                </div>

                <Inline gap={2}>
                  <div className="h-3 rounded w-32"></div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <PiStar key={star} className="w-5 h-5" />
                  ))}
                  <div className="h-4 rounded w-8"></div>
                </Inline>
              </Stack>
            </Card>

            {/* Student Notes */}
            <Card className="animate-pulse">
              <div className="h-6 rounded w-32 mb-4"></div>
              <Stack>
                <div className="h-24 bg-theme-elevated border border-theme-secondary rounded"></div>
                <Stack gap={2}>
                  <div className="h-3 rounded w-64"></div>
                  <Inline gap={2}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <PiStar key={star} className="w-6 h-6" />
                    ))}
                    <div className="h-4 rounded w-20"></div>
                  </Inline>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Sidebar */}
          <Stack gap={6}>
            {/* Teacher Info */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-20 mb-4"></div>
              <Inline gap={3} className="mb-4">
                <div className="w-12 h-12 rounded-full"></div>
                <Stack gap={1}>
                  <div className="h-4 rounded w-24"></div>
                  <div className="h-3 rounded w-32"></div>
                </Stack>
              </Inline>
            </Card>

            {/* Assignment Info */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-24 mb-4"></div>
              <Stack gap={3} className="text-sm">
                <div className="flex justify-between">
                  <div className="h-3 rounded w-16"></div>
                  <div className="h-3 rounded w-20"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 rounded w-20"></div>
                  <div className="h-3 rounded w-20"></div>
                </div>
                <Stack gap={1}>
                  <div className="h-3 rounded w-24"></div>
                  <div className="h-3 rounded w-32"></div>
                </Stack>
              </Stack>
            </Card>

            {/* Progress Milestones Preview */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-20 mb-4"></div>
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
                        <PiCheckCircle className="w-4 h-4" />
                      ) : (
                        <PiCircle className="w-4 h-4" />
                      )}
                      <div className="h-3 rounded flex-1 max-w-32"></div>
                    </div>
                  );
                })}
                <div className="h-3 rounded w-20"></div>
              </div>
            </Card>
          </Stack>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 rounded-full animate-pulse"></div>
    </div>
  );
}
