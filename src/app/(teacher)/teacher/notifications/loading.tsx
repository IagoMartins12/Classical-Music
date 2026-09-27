// app/teacher/notifications/loading.tsx - Loading para Notificações do Professor
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBell,
  PiCalendarBlank,
  PiFileText,
  PiMusicNotes,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function TeacherNotificationsLoading() {
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
          <PiBell />
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
        <div className="text-center mb-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-ouro/20 rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-texto/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-lg animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <PiBell className="w-6 h-6 text-sobre-ouro/20" /> },
            {
              icon: <PiCalendarBlank className="w-6 h-6 text-sobre-ouro/20" />,
            },
            { icon: <PiFileText className="w-6 h-6 text-sobre-ouro/20" /> },
            { icon: <PiUser className="w-6 h-6 text-sobre-ouro/20" /> },
          ].map((item, index) => (
            <Card key={index} className="text-center animate-pulse">
              <div className="w-12 h-12 bg-ouro/20 border border-ouro/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="h-8 bg-ouro/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </Card>
          ))}
        </div>

        {/* Controls Skeleton */}
        <Card className="mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={`h-10 w-24 rounded-lg border ${
                    index === 0
                      ? 'bg-ouro/20 border-ouro/30'
                      : 'bg-theme-elevated border-theme-secondary'
                  }`}
                ></div>
              ))}
            </div>

            {/* Actions */}
            <Inline gap={3}>
              <div className="h-10 w-32 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 bg-sup-elevada border border-theme-secondary rounded-lg"></div>
            </Inline>
          </div>
        </Card>

        {/* Notifications List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <NotificationCardSkeleton key={index} index={index} />
          ))}
        </div>

        {/* Load More Skeleton */}
        <div className="text-center py-8">
          <div className="h-10 w-48 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Notification Card Skeleton
function NotificationCardSkeleton({ index }: { index: number }) {
  const isUnread = index < 3; // Simulate first 3 as unread
  const priority = ['HIGH', 'MEDIUM', 'LOW'][index % 3];

  const getPriorityBorder = () => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-erro';
      case 'MEDIUM':
        return 'border-l-atencao';
      default:
        return 'border-l-aviso';
    }
  };

  const getPriorityBg = () => {
    switch (priority) {
      case 'HIGH':
        return 'bg-erro/5';
      case 'MEDIUM':
        return 'bg-atencao/5';
      default:
        return 'bg-aviso/5';
    }
  };

  return (
    <div
      className={`border classical-card ${getPriorityBorder()} bg-gradient-to-r ${getPriorityBg()} ${
        isUnread ? 'ring-1 ring-ouro/20' : ''
      } animate-pulse`}
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-1">
            <div className="w-5 h-5 bg-sup-2/30 rounded"></div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Title */}
                <div
                  className={`h-5 rounded mb-2 ${
                    isUnread ? 'bg-fundo/30' : 'bg-sup-1/30'
                  } w-3/4`}
                ></div>

                {/* Message */}
                <Stack gap={1} className="mb-3">
                  <div className="h-3 bg-sup-2/20 rounded w-full"></div>
                  <div className="h-3 bg-sup-2/20 rounded w-2/3"></div>
                </Stack>

                {/* Metadata */}
                <Inline gap={4} className="text-sm">
                  <div className="h-3 bg-sup-2/20 rounded w-16"></div>
                  <div
                    className={`h-5 w-16 rounded-full ${
                      priority === 'HIGH'
                        ? 'bg-erro/10'
                        : priority === 'MEDIUM'
                          ? 'bg-atencao/10'
                          : 'bg-aviso/10'
                    }`}
                  ></div>
                </Inline>
              </div>

              {/* Actions */}
              <Inline gap={2} className="ml-4">
                <div className="h-8 w-16 bg-ouro/20 border border-ouro/30 rounded"></div>
                {isUnread && (
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                )}
              </Inline>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
