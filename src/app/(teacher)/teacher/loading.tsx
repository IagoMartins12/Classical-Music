// app/teacher/loading.tsx - Loading para Dashboard Principal do Professor
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBell,
  PiBookOpen,
  PiCalendarBlank,
  PiChartBar,
  PiClipboardText,
  PiClock,
  PiMusicNotes,
  PiStar,
  PiTrendUp,
  PiUsers,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function TeacherDashboardLoading() {
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
          <PiUsers />
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

        {/* Main Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <PiUsers className="w-6 h-6" /> },
            {
              icon: <PiCalendarBlank className="w-6 h-6" />,
            },
            {
              icon: <PiMusicNotes className="w-6 h-6" />,
            },
            { icon: <PiChartBar className="w-6 h-6" /> },
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <Stack gap={8} className="lg:col-span-2 order-2 lg:order-1">
            {/* Quick Actions Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiClock className="w-5 h-5" />
                </div>
                <Stack gap={2}>
                  <div className="h-6 w-48 rounded"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                </Stack>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card
                    nivel={2}
                    densidade="compacta"
                    key={i}
                    className="animate-pulse"
                  >
                    <div className="w-8 h-8 rounded-lg mb-3"></div>
                    <div className="h-5 bg-theme-elevated rounded mb-2"></div>
                    <div className="h-3 rounded w-3/4"></div>
                  </Card>
                ))}
              </div>
            </Card>

            {/* Recent Activities Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiBookOpen className="w-5 h-5" />
                </div>
                <Stack gap={2}>
                  <div className="h-6 w-40 rounded"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                </Stack>
              </Inline>

              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ActivityItemSkeleton key={i} />
                ))}
              </div>
            </Card>

            {/* Assignments Overview Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiClipboardText className="w-5 h-5" />
                </div>
                <Stack gap={2}>
                  <div className="h-6 w-48 rounded"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                </Stack>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <AssignmentItemSkeleton key={i} />
                ))}
              </div>
            </Card>
          </Stack>

          {/* Right Column - 1/3 */}
          <Stack gap={6} className="lg:col-span-1 order-1 lg:order-2">
            {/* Today's Schedule Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <PiCalendarBlank className="w-4 h-4" />
                </div>
                <div className="h-5 w-32 rounded"></div>
              </Inline>

              <Stack gap={3}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3 animate-pulse">
                    <Inline gap={3}>
                      <div className="w-2 h-12 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-theme-elevated rounded mb-2"></div>
                        <div className="h-3 rounded w-2/3"></div>
                      </div>
                    </Inline>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Recent Reviews Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <PiStar className="w-4 h-4" />
                </div>
                <div className="h-5 w-40 rounded"></div>
              </Inline>

              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <ReviewItemSkeleton key={i} />
                ))}
              </div>
            </Card>

            {/* Quick Stats Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <PiTrendUp className="w-4 h-4" />
                </div>
                <div className="h-5 w-28 rounded"></div>
              </Inline>

              <Stack>
                {[
                  'Esta Semana',
                  'Este Mês',
                  'Satisfação',
                  'Taxa de Conclusão',
                ].map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 rounded w-20"></div>
                    <div className="h-4 rounded w-8"></div>
                  </div>
                ))}
              </Stack>
            </Card>

            {/* Notifications Skeleton */}
            <Card className="animate-pulse">
              <Inline gap={3} className="mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <PiBell className="w-4 h-4" />
                </div>
                <div className="h-5 w-32 rounded"></div>
              </Inline>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <NotificationItemSkeleton key={i} />
                ))}
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

// Activity Item Skeleton
function ActivityItemSkeleton() {
  return (
    <Inline gap={4} className="p-3 rounded-lg animate-pulse">
      <div className="w-8 h-8 rounded-lg flex-shrink-0"></div>
      <div className="flex-1">
        <div className="h-4 rounded mb-1 w-3/4"></div>
        <div className="h-3 rounded w-1/2"></div>
      </div>
      <div className="h-3 w-12 rounded"></div>
    </Inline>
  );
}

// Assignment Item Skeleton
function AssignmentItemSkeleton() {
  return (
    <Card nivel={2} densidade="compacta" className="animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <Inline gap={2}>
          <div className="w-8 h-8 rounded-full"></div>
          <Stack gap={1}>
            <div className="h-4 rounded w-24"></div>
            <div className="h-3 rounded w-16"></div>
          </Stack>
        </Inline>
        <div className="h-5 w-16 border rounded-full"></div>
      </div>

      <div className="h-3 bg-theme-elevated rounded mb-2 w-full"></div>
      <div className="h-3 bg-theme-elevated rounded w-3/4"></div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-theme-secondary">
        <div className="h-3 rounded w-16"></div>
        <div className="flex space-x-2">
          <div className="w-6 h-6 bg-theme-elevated rounded"></div>
          <div className="w-6 h-6 bg-theme-elevated rounded"></div>
        </div>
      </div>
    </Card>
  );
}

// Review Item Skeleton
function ReviewItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 animate-pulse">
      <div className="w-8 h-8 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <Inline gap={2} className="mb-1">
          <div className="h-3 rounded w-20"></div>
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded"></div>
            ))}
          </div>
        </Inline>
        <div className="h-3 rounded w-full mb-1"></div>
        <div className="h-3 rounded w-2/3"></div>
      </div>
    </div>
  );
}

// Notification Item Skeleton
function NotificationItemSkeleton() {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
      <div className="w-6 h-6 rounded flex-shrink-0 mt-0.5"></div>
      <div className="flex-1">
        <div className="h-3 rounded mb-1 w-3/4"></div>
        <div className="h-3 rounded w-1/2"></div>
      </div>
      <div className="h-2 w-2 rounded-full"></div>
    </div>
  );
}
