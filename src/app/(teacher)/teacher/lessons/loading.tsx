// app/teacher/lessons/loading.tsx - Loading para Gerenciar Aulas
'use client';

import {
  FiBookOpen,
  FiCalendar,
  FiUser,
  FiFilter,
  FiClock,
  FiMapPin,
  FiTarget,
  FiMusic,
  FiCheckCircle,
  FiUsers,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function TeacherLessonsLoading() {
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
        <div className="text-center mb-8 py-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-3xl flex items-center justify-center shadow-theme-glow animate-pulse">
              <div className="w-8 h-8 bg-theme-inverse/30 rounded-lg"></div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-lg animate-pulse shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <FiBookOpen className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiCalendar className="w-6 h-6 text-theme-inverse/20" /> },
            {
              icon: <FiCheckCircle className="w-6 h-6 text-theme-inverse/20" />,
            },
            { icon: <FiUsers className="w-6 h-6 text-theme-inverse/20" /> },
          ].map((item, index) => (
            <div
              key={index}
              className="classical-card p-6 text-center animate-pulse"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl mx-auto mb-4 flex items-center justify-center">
                {item.icon}
              </div>
              <div className="h-8 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded"></div>
            </div>
          ))}
        </div>

        {/* Controls Skeleton */}
        <div className="classical-card p-6 mb-8 animate-pulse">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              </div>
              <div className="h-10 w-48 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-40 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg"></div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="flex items-center justify-between pt-4 border-t border-theme-secondary mt-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="w-4 h-4 text-theme-tertiary/30" />
              <div className="h-3 bg-theme-secondary/30 rounded w-56"></div>
            </div>
            <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
          </div>
        </div>

        {/* Lessons List Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <LessonCardSkeleton key={index} />
          ))}
        </div>

        {/* Load More Skeleton */}
        <div className="text-center mt-8">
          <div className="h-10 w-48 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto animate-pulse"></div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Lesson Card Skeleton
function LessonCardSkeleton() {
  return (
    <div className="classical-card p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            {/* Student Avatar */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
            </div>

            {/* Lesson Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48"></div>
                    <div className="h-6 w-20 bg-gradient-to-r from-accent-blue/20 to-accent-blue/20 border border-accent-blue/30 rounded-full"></div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <FiUser className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-3 bg-theme-elevated rounded w-20"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-3 bg-theme-elevated rounded w-24"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiClock className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-3 bg-theme-elevated rounded w-16"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="h-3 bg-theme-elevated rounded w-20"></div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 ml-4">
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                  <div className="w-8 h-8 bg-theme-elevated rounded-lg"></div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-4">
                <div className="h-3 bg-theme-elevated rounded w-full"></div>
                <div className="h-3 bg-theme-elevated rounded w-3/4"></div>
              </div>

              {/* Objectives */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-20 bg-gradient-to-r from-accent-blue/20 to-accent-blue/20 border border-accent-blue/30 rounded"
                  ></div>
                ))}
              </div>

              {/* Works */}
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <FiMusic className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-32 bg-gradient-to-r from-accent-purple/20 to-accent-purple/20 border border-accent-purple/30 rounded"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Homework */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FiTarget className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-3 bg-theme-elevated rounded w-full"></div>
                  <div className="h-3 bg-theme-elevated rounded w-2/3"></div>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 pt-4 border-t border-theme-secondary">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-8"></div>
                </div>
                <div className="w-full bg-theme-secondary rounded-full h-2">
                  <div className="h-2 bg-gradient-to-r from-brand-primary/30 to-brand-secondary/30 rounded-full w-2/3"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm text-theme-tertiary mt-4">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <FiTarget className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="h-3 bg-theme-tertiary/30 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
