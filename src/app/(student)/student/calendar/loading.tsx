// app/student/calendar/loading.tsx - Loading para Calendário do Aluno
'use client';

import {
  FiCalendar,
  FiClock,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function StudentCalendarLoading() {
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
          <FiCalendar />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiClock />
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
          <GiMusicalNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-8 animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center shadow-theme-glow">
              <div className="w-8 h-8 bg-theme-inverse/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-lg shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            { icon: <FiCalendar className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiClock className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiCheck className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiX className="w-6 h-6 text-theme-inverse/20" /> },
            {
              icon: <FiAlertCircle className="w-6 h-6 text-theme-inverse/20" />,
            },
          ].map((item, index) => (
            <div
              key={index}
              className="classical-card p-6 text-center animate-pulse"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                {item.icon}
              </div>
              <div className="h-6 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded mb-2"></div>
              <div className="h-3 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div>

        {/* Calendar Controls Skeleton */}
        <div className="classical-card p-6 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex items-center justify-center">
                  <FiChevronLeft className="w-5 h-5 text-theme-tertiary/30" />
                </div>

                <div className="text-center min-w-48">
                  <div className="h-6 bg-theme-primary/30 rounded w-32 mx-auto"></div>
                </div>

                <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg flex items-center justify-center">
                  <FiChevronRight className="w-5 h-5 text-theme-tertiary/30" />
                </div>
              </div>

              <div className="h-10 w-16 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>

              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4 flex items-center space-x-2">
                <FiRefreshCw className="w-4 h-4 text-theme-tertiary/30" />
                <div className="h-4 w-16 bg-theme-tertiary/20 rounded"></div>
              </div>
            </div>

            {/* View Mode and Filters */}
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex bg-theme-secondary/30 rounded-lg p-1">
                <div className="px-3 py-2 bg-theme-tertiary/30 rounded-lg text-sm">
                  <div className="h-4 w-8 bg-theme-primary/30 rounded"></div>
                </div>
                <div className="px-3 py-2 rounded-lg text-sm">
                  <div className="h-4 w-12 bg-theme-tertiary/20 rounded"></div>
                </div>
                <div className="px-3 py-2 rounded-lg text-sm">
                  <div className="h-4 w-6 bg-theme-tertiary/20 rounded"></div>
                </div>
              </div>

              {/* Filters */}
              <div className="h-10 w-48 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-40 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Calendar Content Skeleton */}
        <div className="classical-card p-6 animate-pulse">
          {/* Month View Skeleton */}
          <div>
            {/* Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((day) => (
                <div key={day} className="p-3 text-center text-sm">
                  <div className="h-4 bg-theme-tertiary/30 rounded w-8 mx-auto"></div>
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
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Calendar Day Skeleton Component
function CalendarDaySkeleton({ delay = 0 }: { delay?: number }) {
  const hasEvents = Math.random() > 0.7; // 30% chance of having events
  const eventCount = hasEvents ? Math.floor(Math.random() * 3) + 1 : 0;

  return (
    <div
      className="min-h-24 p-2 border border-theme-secondary/50 rounded-lg transition-all bg-theme-elevated/50 animate-pulse"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="h-4 w-6 bg-theme-primary/30 rounded mb-1"></div>

      <div className="space-y-1">
        {Array.from({ length: eventCount }).map((_, i) => (
          <div
            key={i}
            className={`w-full h-4 rounded text-xs transition-all ${
              i % 3 === 0
                ? 'bg-accent-blue/20 border border-accent-blue/30'
                : i % 3 === 1
                ? 'bg-accent-green/20 border border-accent-green/30'
                : 'bg-accent-purple/20 border border-accent-purple/30'
            }`}
          ></div>
        ))}

        {eventCount > 2 && (
          <div className="h-3 w-12 bg-theme-tertiary/30 rounded"></div>
        )}
      </div>
    </div>
  );
}
