// app/student/lessons/[id]/loading.tsx - Loading para Detalhes da Aula do Aluno
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiArrowLeft,
  PiArrowSquareOut,
  PiArrowsClockwise,
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiDownloadSimple,
  PiMapPin,
  PiMusicNotes,
  PiPencilLine,
  PiRepeat,
  PiTarget,
  PiUser,
  PiUserMinus,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function StudentLessonDetailsLoading() {
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
          <PiBookOpen />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiCalendarBlank />
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
              <PiArrowLeft className="w-5 h-5" />
            </div>
            <Stack gap={2}>
              <div className="h-8 border border-theme-primary rounded-2xl w-64"></div>
              <div className="h-4 rounded w-80"></div>
            </Stack>
          </Inline>

          <Inline gap={3}>
            <div className="h-8 w-20 border rounded-full"></div>

            {/* Student Actions */}
            <Inline gap={2}>
              <Inline gap={2} className="h-10 border rounded-lg px-4">
                <PiUserMinus className="w-4 h-4" />
                <div className="h-4 w-32 rounded"></div>
              </Inline>
              <Inline gap={2} className="h-10 border rounded-lg px-4">
                <PiCalendarBlank className="w-4 h-4" />
                <div className="h-4 w-20 rounded"></div>
              </Inline>
            </Inline>

            <Inline
              gap={2}
              className="h-10 border border-theme-secondary rounded-lg px-4"
            >
              <PiArrowsClockwise className="w-4 h-4" />
              <div className="h-4 w-16 rounded"></div>
            </Inline>
          </Inline>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <Stack gap={6} className="lg:col-span-2">
            {/* Basic Info */}
            <Card className="animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 rounded w-40"></div>
              </div>

              <div className="space-y-4">
                <div className="h-6 rounded w-full mb-2"></div>
                <div className="h-4 rounded w-3/4"></div>

                <div className="grid grid-cols-2 gap-4">
                  <Inline gap={2}>
                    <PiCalendarBlank className="w-4 h-4" />
                    <div className="h-3 rounded w-32"></div>
                  </Inline>
                  <Inline gap={2}>
                    <PiClock className="w-4 h-4" />
                    <div className="h-3 rounded w-20"></div>
                  </Inline>
                </div>

                <Inline gap={2}>
                  <PiMapPin className="w-4 h-4" />
                  <div className="h-3 rounded w-28"></div>
                </Inline>

                {/* Recurrence Info */}
                <Stack gap={2} className="border rounded-lg p-4">
                  <Inline gap={2}>
                    <PiRepeat className="w-4 h-4" />
                    <div className="h-4 rounded w-32"></div>
                  </Inline>
                  <div className="h-3 rounded w-full"></div>
                </Stack>
              </div>
            </Card>

            {/* Musical Pieces Section */}
            <Card className="animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <Inline gap={3}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <PiMusicNotes className="w-5 h-5" />
                  </div>
                  <div className="h-5 rounded w-32"></div>
                </Inline>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border border-theme-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-5 rounded w-28"></div>
                      <Inline gap={2}>
                        <PiDownloadSimple className="w-4 h-4" />
                        <PiArrowSquareOut className="w-4 h-4" />
                      </Inline>
                    </div>
                    <div className="h-3 rounded w-24 mb-2"></div>
                    <div className="h-3 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Objectives */}
            <Card className="animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 rounded w-40"></div>
              </div>

              <Stack gap={2}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full mt-2"></div>
                    <div className="h-3 rounded flex-1 max-w-80"></div>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Topics & Techniques */}
            <Card className="animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 rounded w-48"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Stack gap={3}>
                  <div className="h-4 rounded w-32"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-20 border rounded-full"
                      ></div>
                    ))}
                  </div>
                </Stack>

                <Stack gap={3}>
                  <div className="h-4 rounded w-36"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-24 border rounded-full"
                      ></div>
                    ))}
                  </div>
                </Stack>
              </div>
            </Card>

            {/* Notes Section */}
            <Card className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 rounded w-44"></div>
              </div>

              <Stack>
                {/* Teacher Notes */}
                <Stack gap={2}>
                  <div className="h-4 rounded w-32"></div>
                  <div className="border rounded-lg p-4">
                    <Stack gap={2}>
                      <div className="h-3 rounded w-full"></div>
                      <div className="h-3 rounded w-5/6"></div>
                      <div className="h-3 rounded w-3/4"></div>
                    </Stack>
                  </div>
                </Stack>

                {/* Lesson Summary */}
                <Stack gap={2}>
                  <div className="h-4 rounded w-28"></div>
                  <div className="border rounded-lg p-4">
                    <Stack gap={2}>
                      <div className="h-3 rounded w-full"></div>
                      <div className="h-3 rounded w-4/5"></div>
                    </Stack>
                  </div>
                </Stack>

                {/* Homework */}
                <Stack gap={2}>
                  <div className="h-4 rounded w-24"></div>
                  <div className="border rounded-lg p-4">
                    <Stack gap={2}>
                      <div className="h-3 rounded w-full"></div>
                      <div className="h-3 rounded w-2/3"></div>
                    </Stack>
                  </div>
                </Stack>

                {/* Student Feedback */}
                <Stack gap={2}>
                  <div className="flex items-center justify-between">
                    <div className="h-4 rounded w-24"></div>
                    <Inline
                      gap={1}
                      className="h-8 border border-theme-secondary rounded-lg px-3"
                    >
                      <PiPencilLine className="w-3 h-3" />
                      <div className="h-3 w-10 rounded"></div>
                    </Inline>
                  </div>

                  <div className="w-full p-4 border-2 border-dashed rounded-lg text-center">
                    <div className="h-3 rounded w-64 mx-auto"></div>
                  </div>
                </Stack>
              </Stack>
            </Card>
          </Stack>

          {/* Right Column - Teacher & Info */}
          <Stack gap={6}>
            {/* Teacher Info */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-20 mb-4"></div>

              <Inline gap={4} className="mb-6">
                <div className="w-16 h-16 rounded-full"></div>
                <Stack gap={1}>
                  <div className="h-4 rounded w-24"></div>
                  <div className="h-3 rounded w-32"></div>
                </Stack>
              </Inline>

              {/* Relationship Stats */}
              <Stack gap={2} className="text-sm">
                <div className="flex justify-between">
                  <div className="h-3 rounded w-20"></div>
                  <div className="h-3 rounded w-8"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 rounded w-16"></div>
                  <div className="h-3 rounded w-6"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 rounded w-24"></div>
                  <div className="h-3 rounded w-12"></div>
                </div>
              </Stack>
            </Card>

            {/* Attendance Status */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-32 mb-4"></div>

              <Stack gap={2} className="p-4 border rounded-lg">
                <Inline gap={2}>
                  <PiUser className="w-5 h-5" />
                  <div className="h-4 rounded w-16"></div>
                </Inline>

                <Stack gap={1}>
                  <div className="h-3 rounded w-28"></div>
                  <div className="h-3 rounded w-24"></div>
                  <div className="h-3 rounded w-20"></div>
                </Stack>
              </Stack>
            </Card>

            {/* Progress Summary */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-36 mb-4"></div>

              <Stack>
                <Stack gap={2}>
                  <div className="h-4 rounded w-40"></div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-5 w-16 rounded"></div>
                    ))}
                  </div>
                </Stack>

                <Stack gap={2}>
                  <div className="h-4 rounded w-20"></div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-5 w-20 rounded"></div>
                    ))}
                  </div>
                </Stack>

                <Stack gap={2}>
                  <div className="h-4 rounded w-16"></div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-5 w-18 rounded"></div>
                    ))}
                  </div>
                </Stack>
              </Stack>
            </Card>

            {/* Assignments */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-32 mb-4"></div>

              <Stack gap={3}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 border border-theme-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 rounded w-28"></div>
                      <div className="h-5 w-16 rounded"></div>
                    </div>
                    <div className="h-3 rounded w-full mt-1"></div>
                    <div className="h-3 rounded w-24 mt-1"></div>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Tips for Students */}
            <Card className="animate-pulse">
              <div className="h-5 rounded w-28 mb-4"></div>
              <Stack gap={3} className="text-sm">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <PiTarget className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="h-3 rounded flex-1"></div>
                  </div>
                ))}
              </Stack>
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
