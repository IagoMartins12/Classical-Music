// app/teacher/students/[studentId]/loading.tsx - Loading para Detalhes do Aluno
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCalendarBlank,
  PiChartBar,
  PiChatCenteredText,
  PiClock,
  PiGear,
  PiMedal,
  PiMusicNotes,
  PiPulse,
  PiTarget,
  PiTrendUp,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function TeacherStudentDetailLoading() {
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
          <PiUser />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiChartBar />
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
        {/* Breadcrumb Skeleton */}
        <div className="pt-4 mb-6 animate-pulse">
          <Inline gap={2}>
            <div className="h-4 w-20 bg-theme-elevated rounded"></div>
            <div className="w-3 h-3 bg-theme-elevated rounded"></div>
            <div className="h-4 w-16 bg-theme-elevated rounded"></div>
            <div className="w-3 h-3 bg-theme-elevated rounded"></div>
            <div className="h-4 w-24 bg-theme-elevated rounded"></div>
          </Inline>
        </div>

        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <Inline gap={4}>
            <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            <Stack gap={2}>
              <div className="h-8 bg-sup-elevada border border-theme-primary rounded-lg w-64"></div>
              <div className="h-4 bg-theme-elevated rounded w-48"></div>
            </Stack>
          </Inline>

          <Inline gap={3}>
            <div className="h-8 w-16 bg-sup-elevada border border-theme-secondary rounded-full"></div>
            <div className="h-10 w-24 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
            <div className="h-10 w-32 bg-ouro/20 border border-ouro/30 rounded-lg"></div>
          </Inline>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <Stack gap={8} className="lg:col-span-2">
            {/* Student Info Card Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={6} className="mb-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-ouro/20 border border-ouro/30 rounded-full"></div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="h-6 bg-fundo rounded w-48 mb-2"></div>
                  <Stack gap={1}>
                    <div className="h-4 bg-theme-elevated rounded w-56"></div>
                    <div className="h-4 bg-theme-elevated rounded w-44"></div>
                    <div className="h-4 bg-theme-elevated rounded w-40"></div>
                  </Stack>
                </div>
              </Inline>

              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Stack>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Stack gap={2} key={i}>
                      <div className="h-3 w-24 bg-sup-2/30 rounded"></div>
                      <div className="h-5 w-32 bg-fundo/30 rounded"></div>
                    </Stack>
                  ))}
                </Stack>
                <Stack>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Stack gap={2} key={i}>
                      <div className="h-3 w-20 bg-sup-2/30 rounded"></div>
                      <div className="h-5 w-28 bg-fundo/30 rounded"></div>
                    </Stack>
                  ))}
                </Stack>
              </div>

              {/* Goals Section */}
              <Stack
                gap={3}
                className="mt-6 pt-6 border-t border-theme-secondary"
              >
                <div className="h-3 w-32 bg-sup-2/30 rounded"></div>
                <Stack gap={2}>
                  <div className="h-4 bg-fundo/20 rounded w-full"></div>
                  <div className="h-4 bg-fundo/20 rounded w-5/6"></div>
                  <div className="h-4 bg-fundo/20 rounded w-4/6"></div>
                </Stack>
              </Stack>

              {/* Current Focus */}
              <Stack gap={3} className="mt-4">
                <div className="h-3 w-20 bg-sup-2/30 rounded"></div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-20 bg-ouro/20 border border-ouro/30 rounded-full"
                    ></div>
                  ))}
                </div>
              </Stack>
            </Card>

            {/* Progress Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: <PiBookOpen className="w-6 h-6 text-sobre-ouro/20" />,
                },
                { icon: <PiMedal className="w-6 h-6 text-sobre-ouro/20" /> },
                { icon: <PiClock className="w-6 h-6 text-sobre-ouro/20" /> },
                {
                  icon: <PiPulse className="w-6 h-6 text-sobre-ouro/20" />,
                },
              ].map((item, index) => (
                <Card key={index} className="text-center animate-pulse">
                  <div className="w-12 h-12 bg-ouro/20 border border-ouro/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="h-6 bg-ouro/20 rounded mb-2"></div>
                  <div className="h-3 bg-theme-elevated rounded"></div>
                </Card>
              ))}
            </div>

            {/* Recent Lessons Skeleton */}
            <Card className="animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-ok/20 rounded-xl flex items-center justify-center">
                    <PiClock className="w-5 h-5 text-sobre-ouro/20" />
                  </div>
                  <Stack gap={1}>
                    <div className="h-5 bg-fundo/30 rounded w-32"></div>
                    <div className="h-3 bg-sup-2/30 rounded w-48"></div>
                  </Stack>
                </Inline>
                <div className="h-4 w-20 bg-ouro/30 rounded"></div>
              </div>

              <Stack>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Card nivel={2} densidade="compacta" key={index}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Inline gap={3} className="mb-2">
                          <div className="h-4 bg-fundo/30 rounded w-48"></div>
                          <div className="h-5 w-16 bg-ok/20 border border-ok/30 rounded-full"></div>
                        </Inline>

                        <Inline gap={4} className="mb-2">
                          <div className="h-3 bg-theme-elevated rounded w-32"></div>
                          <div className="h-3 bg-theme-elevated rounded w-16"></div>
                        </Inline>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-5 w-16 bg-theme-elevated rounded"
                            ></div>
                          ))}
                        </div>

                        <Stack
                          gap={1}
                          className="mt-2 p-2 bg-sup-elevada rounded border border-linha/20"
                        >
                          <div className="h-3 bg-sup-2/30 rounded w-12"></div>
                          <div className="h-3 bg-fundo/30 rounded w-full"></div>
                        </Stack>
                      </div>

                      <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg ml-4"></div>
                    </div>
                  </Card>
                ))}
              </Stack>
            </Card>

            {/* Teacher Notes Skeleton */}
            <Card className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-ouro/20 rounded-xl flex items-center justify-center">
                    <PiChatCenteredText className="w-5 h-5 text-sobre-ouro/20" />
                  </div>
                  <Stack gap={1}>
                    <div className="h-5 bg-fundo/30 rounded w-40"></div>
                    <div className="h-3 bg-sup-2/30 rounded w-56"></div>
                  </Stack>
                </Inline>
                <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              </div>

              <div className="bg-sup-elevada rounded-lg border border-linha/20 p-4">
                <Stack gap={2}>
                  <div className="h-4 bg-fundo/20 rounded w-full"></div>
                  <div className="h-4 bg-fundo/20 rounded w-5/6"></div>
                  <div className="h-4 bg-fundo/20 rounded w-4/6"></div>
                </Stack>
              </div>
            </Card>
          </Stack>

          {/* Right Column - 1/3 */}
          <Stack gap={6} className="lg:col-span-1">
            {/* Upcoming Lessons Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 bg-aviso/20 rounded-lg flex items-center justify-center">
                  <PiCalendarBlank className="w-4 h-4 text-sobre-ouro/20" />
                </div>
                <Stack gap={1}>
                  <div className="h-4 bg-fundo/30 rounded w-28"></div>
                  <div className="h-3 bg-sup-2/30 rounded w-20"></div>
                </Stack>
              </Inline>

              <Stack gap={3}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3">
                    <Inline gap={3}>
                      <div className="w-2 h-12 bg-ouro/30 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-fundo/30 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-sup-2/30 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-aviso/30 rounded w-16"></div>
                      </div>
                      <div className="w-6 h-6 bg-theme-elevated rounded"></div>
                    </Inline>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Current Assignments Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 bg-ok/20 rounded-lg flex items-center justify-center">
                  <PiTarget className="w-4 h-4 text-sobre-ouro/20" />
                </div>
                <Stack gap={1}>
                  <div className="h-4 bg-fundo/30 rounded w-24"></div>
                  <div className="h-3 bg-sup-2/30 rounded w-20"></div>
                </Stack>
              </Inline>

              <Stack gap={3}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Stack gap={2} key={i} className="classical-card-2 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-fundo/30 rounded w-full mb-1"></div>
                        <div className="h-3 bg-sup-2/30 rounded w-3/4"></div>
                      </div>
                      <div className="h-5 w-12 bg-atencao/20 border border-atencao/30 rounded-full ml-2"></div>
                    </div>

                    <div className="h-3 bg-sup-2/30 rounded w-32"></div>

                    <div className="w-full bg-sup-1/20 rounded-full h-2">
                      <div className="bg-ouro/30 rounded-full h-2 w-2/3"></div>
                    </div>
                  </Stack>
                ))}
              </Stack>
            </Card>

            {/* Quick Actions Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 bg-ouro/20 rounded-lg flex items-center justify-center">
                  <PiGear className="w-4 h-4 text-sobre-ouro/20" />
                </div>
                <div>
                  <div className="h-4 bg-fundo/30 rounded w-28"></div>
                </div>
              </Inline>

              <Stack gap={3}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full classical-card-2 p-3">
                    <Inline gap={3}>
                      <div className="w-8 h-8 bg-ok/20 rounded-lg"></div>
                      <Stack gap={1}>
                        <div className="h-4 bg-fundo/30 rounded w-24"></div>
                        <div className="h-3 bg-sup-2/30 rounded w-32"></div>
                      </Stack>
                    </Inline>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Refresh Button Skeleton */}
            <Inline
              gap={2}
              className="w-full h-10 bg-sup-elevada border border-theme-secondary rounded-lg animate-pulse justify-center"
            >
              <PiTrendUp className="w-4 h-4 text-sobre-ouro/20" />
              <div className="h-4 w-24 bg-sup-2/30 rounded"></div>
            </Inline>
          </Stack>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}
