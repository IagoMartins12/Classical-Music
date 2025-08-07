// app/teacher/loading.tsx - Loading Premium do Dashboard do Professor
'use client';

import {
  FiUsers,
  FiCalendar,
  FiMusic,
  FiBarChart2,
  FiClock,
  FiBookOpen,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function TeacherLoading() {
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

      {/* Floating musical elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-brand-primary/10 animate-float">
          <FiUsers />
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
        <div className="text-center mb-8 py-16">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <FiUsers className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiCalendar className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiMusic className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiBarChart2 className="w-6 h-6 text-theme-inverse/20" /> },
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions Skeleton */}
            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                  <FiClock className="w-5 h-5 text-theme-primary/30" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-4 animate-pulse">
                    <div className="w-8 h-8 bg-theme-secondary/50 rounded-lg mb-3"></div>
                    <div className="h-5 bg-theme-elevated rounded mb-2"></div>
                    <div className="h-3 bg-theme-secondary/50 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Students Section Skeleton */}
            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-theme-primary/30" />
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
                  <div className="h-4 w-32 bg-theme-elevated rounded animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <StudentCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Schedule Skeleton */}
            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-theme-primary/30" />
                </div>
                <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3 animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-brand-primary/30 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-theme-elevated rounded mb-2"></div>
                        <div className="h-3 bg-theme-secondary/50 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity Skeleton */}
            <div className="classical-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                  <FiBookOpen className="w-4 h-4 text-theme-primary/30" />
                </div>
                <div className="h-5 w-40 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded animate-pulse"></div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-theme-secondary/50 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-theme-elevated rounded mb-1"></div>
                      <div className="h-3 bg-theme-secondary/50 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-blue/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-accent-green/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Skeleton para Student Card
function StudentCardSkeleton() {
  return (
    <div className="classical-card-2 p-4 relative animate-pulse">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12">
          <div className="w-full h-full bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full border-2 border-brand-primary/20 flex items-center justify-center">
            <FiUsers className="w-6 h-6 text-theme-inverse/20" />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center flex-1">
          <div className="h-5 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-theme-elevated rounded w-1/2"></div>
        </div>

        {/* Status Badge */}
        <div className="px-3 py-1 bg-accent-green/10 border border-accent-green/30 rounded-full w-16 h-6"></div>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-theme-secondary grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="h-6 bg-brand-primary/20 rounded mb-1"></div>
          <div className="h-3 bg-theme-secondary/50 rounded w-3/4 mx-auto"></div>
        </div>
        <div className="text-center">
          <div className="h-6 bg-accent-blue/20 rounded mb-1"></div>
          <div className="h-3 bg-theme-secondary/50 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
