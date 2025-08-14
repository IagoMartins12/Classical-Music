// app/teacher/students/loading.tsx - Loading para Gerenciar Alunos
'use client';

import {
  FiUsers,
  FiUser,
  FiFilter,
  FiStar,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiBookOpen,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function TeacherStudentsLoading() {
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
          <FiUsers />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiUser />
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
            { icon: <FiUsers className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiCalendar className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiStar className="w-6 h-6 text-theme-inverse/20" /> },
            {
              icon: <FiTrendingUp className="w-6 h-6 text-theme-inverse/20" />,
            },
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
              <div className="h-3 bg-theme-secondary/30 rounded w-48"></div>
            </div>
            <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
          </div>
        </div>

        {/* Students Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <StudentCardSkeleton key={index} />
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="classical-card p-6 animate-pulse">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="h-4 w-48 bg-theme-elevated rounded"></div>

            <div className="flex items-center space-x-2">
              <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-lg ${
                    i === 2
                      ? 'bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30'
                      : 'bg-theme-elevated border border-theme-secondary'
                  }`}
                ></div>
              ))}
              <div className="h-10 w-20 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            </div>

            <div></div>
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

// Student Card Skeleton
function StudentCardSkeleton() {
  return (
    <div className="classical-card p-6 h-full animate-pulse">
      {/* Avatar */}
      <div className="mb-6 flex justify-center">
        <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>
      </div>

      {/* Content */}
      <div className="space-y-3 text-center">
        {/* Name */}
        <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mx-auto w-3/4"></div>
        <div className="h-3 bg-theme-elevated rounded mx-auto w-1/2"></div>

        {/* Details */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-center space-x-2">
            <FiCalendar className="w-3 h-3 text-theme-tertiary/30" />
            <div className="h-3 bg-theme-elevated rounded w-20"></div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <FiClock className="w-3 h-3 text-theme-tertiary/30" />
            <div className="h-3 bg-theme-elevated rounded w-16"></div>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <FiBookOpen className="w-3 h-3 text-theme-tertiary/30" />
            <div className="h-3 bg-theme-elevated rounded w-12"></div>
          </div>
        </div>

        {/* Level tag */}
        <div className="pt-2">
          <div className="h-6 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mx-auto"></div>
        </div>

        {/* Progress */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <div className="h-3 bg-theme-tertiary/30 rounded w-12"></div>
            <div className="h-3 bg-theme-tertiary/30 rounded w-8"></div>
          </div>
          <div className="w-full bg-theme-secondary rounded-full h-2">
            <div className="h-2 bg-gradient-to-r from-brand-primary/30 to-brand-secondary/30 rounded-full w-2/3"></div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex justify-center space-x-1 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar key={i} className="w-3 h-3 text-accent-yellow/30" />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-theme-secondary">
          <div className="text-center">
            <div className="h-4 bg-accent-blue/20 rounded mb-1"></div>
            <div className="h-3 bg-theme-secondary/50 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-4 bg-accent-green/20 rounded mb-1"></div>
            <div className="h-3 bg-theme-secondary/50 rounded w-3/4 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-4 bg-accent-purple/20 rounded mb-1"></div>
            <div className="h-3 bg-theme-secondary/50 rounded w-3/4 mx-auto"></div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4 border-t border-theme-secondary mt-4">
          <div className="h-4 w-24 bg-theme-tertiary/30 rounded mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
