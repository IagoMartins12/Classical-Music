// app/teacher/students/[studentId]/loading.tsx - Loading para Detalhes do Aluno
'use client';

import {
  FiUser,
  FiCalendar,
  FiClock,
  FiBookOpen,
  FiBarChart2,
  FiMessageSquare,
  FiTarget,
  FiTrendingUp,
  FiAward,
  FiActivity,
  FiSettings,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function TeacherStudentDetailLoading() {
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
          <FiBarChart2 />
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
        {/* Breadcrumb Skeleton */}
        <div className="pt-4 mb-6 animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-20 bg-theme-elevated rounded"></div>
            <div className="w-3 h-3 bg-theme-elevated rounded"></div>
            <div className="h-4 w-16 bg-theme-elevated rounded"></div>
            <div className="w-3 h-3 bg-theme-elevated rounded"></div>
            <div className="h-4 w-24 bg-theme-elevated rounded"></div>
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
            <div>
              <div className="h-8 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-lg w-64 mb-2"></div>
              <div className="h-4 bg-theme-elevated rounded w-48"></div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-16 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-full"></div>
            <div className="h-10 w-24 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg"></div>
            <div className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-lg"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Student Info Card Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-6 mb-6">
                {/* Avatar */}
                <div className="w-20 h-20 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full"></div>

                {/* Basic Info */}
                <div className="flex-1">
                  <div className="h-6 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded w-48 mb-2"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-theme-elevated rounded w-56"></div>
                    <div className="h-4 bg-theme-elevated rounded w-44"></div>
                    <div className="h-4 bg-theme-elevated rounded w-40"></div>
                  </div>
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-24 bg-theme-tertiary/30 rounded mb-2"></div>
                      <div className="h-5 w-32 bg-theme-primary/30 rounded"></div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-2"></div>
                      <div className="h-5 w-28 bg-theme-primary/30 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals Section */}
              <div className="mt-6 pt-6 border-t border-theme-secondary">
                <div className="h-3 w-32 bg-theme-tertiary/30 rounded mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-5/6"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-4/6"></div>
                </div>
              </div>

              {/* Current Focus */}
              <div className="mt-4">
                <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-3"></div>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 w-20 bg-brand-primary/20 border border-brand-primary/30 rounded-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  icon: (
                    <FiBookOpen className="w-6 h-6 text-theme-inverse/20" />
                  ),
                },
                { icon: <FiAward className="w-6 h-6 text-theme-inverse/20" /> },
                { icon: <FiClock className="w-6 h-6 text-theme-inverse/20" /> },
                {
                  icon: (
                    <FiActivity className="w-6 h-6 text-theme-inverse/20" />
                  ),
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="classical-card p-6 text-center animate-pulse"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-xl mx-auto mb-3 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div className="h-6 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded mb-2"></div>
                  <div className="h-3 bg-theme-elevated rounded"></div>
                </div>
              ))}
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
                    <div className="h-3 bg-theme-tertiary/30 rounded w-48"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-brand-primary/30 rounded"></div>
              </div>

              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="classical-card-2 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="h-4 bg-theme-primary/30 rounded w-48"></div>
                          <div className="h-5 w-16 bg-accent-green/20 border border-accent-green/30 rounded-full"></div>
                        </div>

                        <div className="flex items-center space-x-4 mb-2">
                          <div className="h-3 bg-theme-elevated rounded w-32"></div>
                          <div className="h-3 bg-theme-elevated rounded w-16"></div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-2">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-5 w-16 bg-theme-elevated rounded"
                            ></div>
                          ))}
                        </div>

                        <div className="mt-2 p-2 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded border border-theme-primary/20">
                          <div className="h-3 bg-theme-tertiary/30 rounded w-12 mb-1"></div>
                          <div className="h-3 bg-theme-primary/30 rounded w-full"></div>
                        </div>
                      </div>

                      <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg ml-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Teacher Notes Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-xl flex items-center justify-center">
                    <FiMessageSquare className="w-5 h-5 text-theme-inverse/20" />
                  </div>
                  <div>
                    <div className="h-5 bg-theme-primary/30 rounded w-40 mb-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-56"></div>
                  </div>
                </div>
                <div className="w-8 h-8 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
              </div>

              <div className="bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20 p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-5/6"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - 1/3 */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Lessons Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-lg flex items-center justify-center">
                  <FiCalendar className="w-4 h-4 text-theme-inverse/20" />
                </div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-28 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-12 bg-brand-primary/30 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-accent-blue/30 rounded w-16"></div>
                      </div>
                      <div className="w-6 h-6 bg-theme-elevated rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Assignments Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-lg flex items-center justify-center">
                  <FiTarget className="w-4 h-4 text-theme-inverse/20" />
                </div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="classical-card-2 p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="h-4 bg-theme-primary/30 rounded w-full mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-3/4"></div>
                      </div>
                      <div className="h-5 w-12 bg-accent-yellow/20 border border-accent-yellow/30 rounded-full ml-2"></div>
                    </div>

                    <div className="h-3 bg-theme-tertiary/30 rounded w-32 mb-2"></div>

                    <div className="w-full bg-theme-secondary/20 rounded-full h-2">
                      <div className="bg-brand-primary/30 rounded-full h-2 w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-lg flex items-center justify-center">
                  <FiSettings className="w-4 h-4 text-theme-inverse/20" />
                </div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-28"></div>
                </div>
              </div>

              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="w-full classical-card-2 p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-lg"></div>
                      <div>
                        <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Refresh Button Skeleton */}
            <div className="w-full h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg animate-pulse flex items-center justify-center space-x-2">
              <FiTrendingUp className="w-4 h-4 text-theme-inverse/20" />
              <div className="h-4 w-24 bg-theme-tertiary/30 rounded"></div>
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
