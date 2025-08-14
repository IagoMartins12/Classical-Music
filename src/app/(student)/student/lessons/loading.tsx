// app/student/lessons/loading.tsx - Loading para Aulas do Aluno
'use client';

import {
  FiBookOpen,
  FiCalendar,
  FiClock,
  FiCheck,
  FiX,
  FiUser,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiAlertTriangle,
  FiMessageSquare,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function StudentLessonsLoading() {
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
          <FiBookOpen />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiCalendar />
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <FiCalendar className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiClock className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiCheck className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiX className="w-6 h-6 text-theme-inverse/20" /> },
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

        {/* Search and Filters Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg flex items-center">
                <FiSearch className="ml-3 w-5 h-5 text-theme-tertiary/30" />
                <div className="h-4 bg-theme-tertiary/20 rounded flex-1 mx-3"></div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-4">
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4 flex items-center space-x-2">
                <FiFilter className="w-4 h-4 text-theme-tertiary/30" />
                <div className="h-4 w-12 bg-theme-tertiary/20 rounded"></div>
              </div>

              <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>

              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4 flex items-center space-x-2">
                <FiRefreshCw className="w-4 h-4 text-theme-tertiary/30" />
                <div className="h-4 w-16 bg-theme-tertiary/20 rounded"></div>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <div className="mt-6 pt-6 border-t border-theme-secondary grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="h-3 w-16 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            </div>
            <div>
              <div className="h-3 w-12 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            </div>
            <div>
              <div className="h-3 w-14 bg-theme-tertiary/30 rounded mb-2"></div>
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Results Info Skeleton */}
        <div className="mb-6 animate-pulse">
          <div className="h-4 w-48 bg-theme-secondary/30 rounded"></div>
        </div>

        {/* Lessons Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <LessonCardSkeleton key={index} delay={index * 0.05} />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-center space-x-4 mt-8 animate-pulse">
          <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg flex items-center justify-center">
            <div className="h-4 w-12 bg-theme-tertiary/20 rounded"></div>
          </div>

          <div className="flex items-center space-x-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-lg ${
                  i === 2
                    ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
                    : 'bg-theme-elevated border border-theme-secondary'
                }`}
              ></div>
            ))}
          </div>

          <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg flex items-center justify-center">
            <div className="h-4 w-12 bg-theme-tertiary/20 rounded"></div>
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

// Lesson Card Skeleton Component
function LessonCardSkeleton({ delay = 0 }: { delay?: number }) {
  const hasAttentionIssue = Math.random() > 0.8; // 20% chance
  const isToday = Math.random() > 0.9; // 10% chance

  return (
    <div
      className={`classical-card p-6 relative animate-pulse ${
        isToday ? 'ring-2 ring-yellow-400/30' : ''
      } ${hasAttentionIssue ? 'ring-2 ring-red-400/30' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Attention Indicator */}
      {hasAttentionIssue && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600/30 rounded-full flex items-center justify-center">
          <FiAlertTriangle className="w-3 h-3 text-red-400/50" />
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-20 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full"></div>
        {isToday && (
          <div className="h-6 w-12 bg-brand-primary/10 border border-brand-primary/30 rounded-full"></div>
        )}
      </div>

      {/* Lesson Info */}
      <div className="h-5 bg-theme-primary/30 rounded w-full mb-2"></div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center">
          <FiCalendar className="w-4 h-4 mr-2 text-theme-tertiary/30" />
          <div className="h-3 bg-theme-secondary/30 rounded w-32"></div>
        </div>

        <div className="flex items-center">
          <FiClock className="w-4 h-4 mr-2 text-theme-tertiary/30" />
          <div className="h-3 bg-theme-secondary/30 rounded w-20"></div>
        </div>

        <div className="flex items-center">
          <FiUser className="w-4 h-4 mr-2 text-theme-tertiary/30" />
          <div className="h-3 bg-theme-secondary/30 rounded w-24"></div>
        </div>

        <div className="flex items-center">
          <FiMapPin className="w-4 h-4 mr-2 text-theme-tertiary/30" />
          <div className="h-3 bg-theme-secondary/30 rounded w-28"></div>
        </div>
      </div>

      {/* Objectives Preview */}
      <div className="mb-4">
        <div className="h-3 bg-theme-tertiary/30 rounded w-16 mb-1"></div>
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-5 w-16 bg-accent-blue/10 rounded"></div>
          ))}
          <div className="h-3 bg-theme-tertiary/30 rounded w-8"></div>
        </div>
      </div>

      {/* Feedback Status */}
      <div className="mb-4">
        <div className="flex items-center">
          <FiMessageSquare className="w-4 h-4 mr-2 text-accent-green/30" />
          <div className="h-3 bg-accent-green/20 rounded w-28"></div>
        </div>
      </div>

      {/* Attention Alert */}
      {hasAttentionIssue && (
        <div className="mb-4">
          <div className="flex items-center">
            <FiAlertTriangle className="w-4 h-4 mr-2 text-accent-red/30" />
            <div className="h-3 bg-accent-red/20 rounded w-36"></div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="h-10 w-full bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg flex items-center justify-center space-x-2">
        <div className="w-4 h-4 bg-theme-primary/30 rounded"></div>
        <div className="h-4 w-20 bg-theme-primary/30 rounded"></div>
      </div>
    </div>
  );
}
