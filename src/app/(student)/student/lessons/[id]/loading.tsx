// app/student/lessons/[id]/loading.tsx - Loading para Detalhes da Aula do Aluno
'use client';

import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiMapPin,
  FiTarget,
  FiBookOpen,
  FiMessageSquare,
  FiMusic,
  FiRefreshCw,
  FiRepeat,
  FiUserX,
  FiEdit3,
  FiSave,
  FiStar,
  FiDownload,
  FiExternalLink,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function StudentLessonDetailsLoading() {
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
        <div className="flex items-center justify-between mb-8 animate-pulse">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-theme-elevated border border-theme-secondary flex items-center justify-center">
              <FiArrowLeft className="w-5 h-5 text-theme-tertiary/30" />
            </div>
            <div>
              <div className="h-8 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl w-64 mb-2"></div>
              <div className="h-4 bg-theme-secondary/30 rounded w-80"></div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="h-8 w-20 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full"></div>

            {/* Student Actions */}
            <div className="flex items-center space-x-2">
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-accent-red/30 rounded-lg px-4 flex items-center space-x-2">
                <FiUserX className="w-4 h-4 text-accent-red/30" />
                <div className="h-4 w-32 bg-theme-tertiary/20 rounded"></div>
              </div>
              <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-accent-blue/30 rounded-lg px-4 flex items-center space-x-2">
                <FiCalendar className="w-4 h-4 text-accent-blue/30" />
                <div className="h-4 w-20 bg-theme-tertiary/20 rounded"></div>
              </div>
            </div>

            <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4 flex items-center space-x-2">
              <FiRefreshCw className="w-4 h-4 text-theme-tertiary/30" />
              <div className="h-4 w-16 bg-theme-tertiary/20 rounded"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 bg-theme-primary/30 rounded w-40"></div>
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-theme-primary/30 rounded w-full mb-2"></div>
                <div className="h-4 bg-theme-secondary/30 rounded w-3/4"></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-3 bg-theme-secondary/30 rounded w-32"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-3 bg-theme-secondary/30 rounded w-20"></div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <FiMapPin className="w-4 h-4 text-theme-tertiary/30" />
                  <div className="h-3 bg-theme-secondary/30 rounded w-28"></div>
                </div>

                {/* Recurrence Info */}
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <FiRepeat className="w-4 h-4 text-accent-blue/30" />
                    <div className="h-4 bg-accent-blue/30 rounded w-32"></div>
                  </div>
                  <div className="h-3 bg-theme-secondary/30 rounded w-full"></div>
                </div>
              </div>
            </div>

            {/* Musical Pieces Section */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-lg flex items-center justify-center">
                    <FiMusic className="w-5 h-5 text-theme-inverse/30" />
                  </div>
                  <div className="h-5 bg-theme-primary/30 rounded w-32"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-4 border border-theme-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-5 bg-theme-primary/30 rounded w-28"></div>
                      <div className="flex items-center space-x-2">
                        <FiDownload className="w-4 h-4 text-theme-tertiary/30" />
                        <FiExternalLink className="w-4 h-4 text-theme-tertiary/30" />
                      </div>
                    </div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-accent-blue/20 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Objectives */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 bg-theme-primary/30 rounded w-40"></div>
              </div>

              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-brand-primary/30 rounded-full mt-2"></div>
                    <div className="h-3 bg-theme-secondary/30 rounded flex-1 max-w-80"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics & Techniques */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center mb-4">
                <div className="h-5 bg-theme-primary/30 rounded w-48"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-32 mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-20 bg-accent-blue/10 border border-accent-blue/30 rounded-full"
                      ></div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-36 mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-24 bg-accent-purple/10 border border-accent-purple/30 rounded-full"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="classical-card p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-theme-primary/30 rounded w-44"></div>
              </div>

              <div className="space-y-4">
                {/* Teacher Notes */}
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-32 mb-2"></div>
                  <div className="bg-accent-blue/5 border border-accent-blue/20 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-theme-secondary/30 rounded w-full"></div>
                      <div className="h-3 bg-theme-secondary/30 rounded w-5/6"></div>
                      <div className="h-3 bg-theme-secondary/30 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>

                {/* Lesson Summary */}
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-28 mb-2"></div>
                  <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-theme-secondary/30 rounded w-full"></div>
                      <div className="h-3 bg-theme-secondary/30 rounded w-4/5"></div>
                    </div>
                  </div>
                </div>

                {/* Homework */}
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-24 mb-2"></div>
                  <div className="bg-accent-purple/5 border border-accent-purple/20 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="h-3 bg-theme-secondary/30 rounded w-full"></div>
                      <div className="h-3 bg-theme-secondary/30 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                {/* Student Feedback */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-theme-primary/30 rounded w-24"></div>
                    <div className="h-8 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-3 flex items-center space-x-1">
                      <FiEdit3 className="w-3 h-3 text-theme-tertiary/30" />
                      <div className="h-3 w-10 bg-theme-tertiary/20 rounded"></div>
                    </div>
                  </div>

                  <div className="w-full p-4 border-2 border-dashed border-theme-secondary/30 rounded-lg text-center">
                    <div className="h-3 bg-theme-tertiary/20 rounded w-64 mx-auto"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Teacher & Info */}
          <div className="space-y-6">
            {/* Teacher Info */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-20 mb-4"></div>

              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                </div>
              </div>

              {/* Relationship Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-20"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-8"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-16"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-6"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-3 bg-theme-tertiary/30 rounded w-24"></div>
                  <div className="h-3 bg-theme-primary/30 rounded w-12"></div>
                </div>
              </div>
            </div>

            {/* Attendance Status */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-32 mb-4"></div>

              <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FiUser className="w-5 h-5 text-accent-green/30" />
                  <div className="h-4 bg-accent-green/30 rounded w-16"></div>
                </div>

                <div className="space-y-1">
                  <div className="h-3 bg-theme-secondary/30 rounded w-28"></div>
                  <div className="h-3 bg-theme-secondary/30 rounded w-24"></div>
                  <div className="h-3 bg-theme-secondary/30 rounded w-20"></div>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-36 mb-4"></div>

              <div className="space-y-4">
                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-40 mb-2"></div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-5 w-16 bg-accent-blue/10 rounded"
                      ></div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-20 mb-2"></div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-5 w-20 bg-accent-green/10 rounded"
                      ></div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="h-4 bg-theme-primary/30 rounded w-16 mb-2"></div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-5 w-18 bg-accent-yellow/10 rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Assignments */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-32 mb-4"></div>

              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-3 border border-theme-secondary rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-theme-primary/30 rounded w-28"></div>
                      <div className="h-5 w-16 bg-accent-green/10 rounded"></div>
                    </div>
                    <div className="h-3 bg-theme-secondary/30 rounded w-full mt-1"></div>
                    <div className="h-3 bg-theme-tertiary/30 rounded w-24 mt-1"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips for Students */}
            <div className="classical-card p-6 animate-pulse">
              <div className="h-5 bg-theme-primary/30 rounded w-28 mb-4"></div>
              <div className="space-y-3 text-sm">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <FiTarget className="w-4 h-4 text-brand-primary/30 mt-0.5 flex-shrink-0" />
                    <div className="h-3 bg-theme-secondary/30 rounded flex-1"></div>
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
