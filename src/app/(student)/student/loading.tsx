// app/student/loading.tsx - Loading para Dashboard do Aluno
'use client';

import {
  FiUser,
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiTarget,
  FiMusic,
  FiUserCheck,
  FiHeart,
  FiCheckCircle,
  FiTrendingUp,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function StudentDashboardLoading() {
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
          <FiUser />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <FiMusic />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: <FiBookOpen className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiCalendar className="w-6 h-6 text-theme-inverse/20" /> },
            { icon: <FiClock className="w-6 h-6 text-theme-inverse/20" /> },
            {
              icon: <FiTrendingUp className="w-6 h-6 text-theme-inverse/20" />,
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
              <div className="h-3 bg-theme-elevated rounded mb-1"></div>
              <div className="h-3 bg-accent-green/20 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiTarget className="w-5 h-5 text-theme-inverse/20" />
                  </div>
                  <div>
                    <div className="h-5 bg-theme-primary/30 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-48"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Lessons Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    <FiClock className="w-5 h-5 text-theme-inverse/20" />
                  </div>
                  <div>
                    <div className="h-5 bg-theme-primary/30 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-56"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-brand-primary/30 rounded"></div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="classical-card-2 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-48 mb-1"></div>
                        <div className="flex items-center space-x-4 mb-2">
                          <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                          <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                          <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="h-6 w-20 bg-accent-green/20 border border-accent-green/30 rounded-full"></div>
                        <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
                      </div>
                    </div>

                    {/* Lesson Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-theme-secondary">
                      <div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-32 mb-1"></div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-5 w-16 bg-theme-elevated rounded"
                            ></div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-20 mb-1"></div>
                        <div className="flex flex-wrap gap-1">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-5 w-20 bg-accent-green/10 rounded"
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Homework */}
                    <div className="mt-3 p-3 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
                      <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-theme-primary/30 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Study Progress Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center">
                    <FiMusic className="w-5 h-5 text-theme-inverse/20" />
                  </div>
                  <div>
                    <div className="h-5 bg-theme-primary/30 rounded w-28 mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-56"></div>
                  </div>
                </div>
                <div className="h-4 w-24 bg-brand-primary/30 rounded"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Works */}
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-40 mb-3 flex items-center">
                    <FiBookOpen className="w-4 h-4 text-accent-blue/30 mr-2" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="classical-card-2 p-3">
                        <div className="h-4 bg-theme-primary/30 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-accent-blue/20 rounded w-28"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learned Works */}
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-32 mb-3 flex items-center">
                    <FiCheckCircle className="w-4 h-4 text-accent-green/30 mr-2" />
                  </div>
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="classical-card-2 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="h-4 bg-theme-primary/30 rounded w-28 mb-1"></div>
                            <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="h-3 bg-accent-green/20 rounded w-8"></div>
                            <FiHeart className="w-3 h-3 text-accent-red/30" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Today's Schedule Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-theme-inverse/20" />
                </div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-brand-primary/30 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-16 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-20 mb-1"></div>
                        <div className="h-3 bg-accent-blue/20 rounded w-12"></div>
                      </div>
                      <div className="w-6 h-6 bg-theme-elevated rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Lessons Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-lg flex items-center justify-center">
                  <FiClock className="w-4 h-4 text-theme-inverse/20" />
                </div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-28 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                </div>
              </div>

              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-theme-secondary last:border-0"
                  >
                    <div>
                      <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                    </div>
                    <div className="h-3 bg-accent-blue/20 rounded w-12"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teachers Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-lg flex items-center justify-center">
                  <FiUserCheck className="w-4 h-4 text-theme-inverse/20" />
                </div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-40"></div>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3">
                    <div className="flex items-center space-x-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-accent-blue/20 rounded w-20"></div>
                      </div>
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
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}
