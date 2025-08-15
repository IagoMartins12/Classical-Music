// app/teacher/profile/loading.tsx - Loading para Perfil do Professor
'use client';

import {
  FiUser,
  FiAward,
  FiMusic,
  FiGlobe,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiUsers,
  FiEye,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function TeacherProfileLoading() {
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
          <FiAward />
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

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* Personal Information Skeleton */}
          <ProfileSectionSkeleton
            icon={<FiUser className="w-5 h-5 text-theme-primary/30" />}
            title="Informações Pessoais"
            subtitle="Seus dados básicos e informações de contato"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <div className="h-3 w-16 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="h-5 w-48 bg-theme-primary/30 rounded"></div>
                </div>

                {/* Email */}
                <div>
                  <div className="h-3 w-12 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-5 w-56 bg-theme-primary/30 rounded"></div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <div className="h-3 w-16 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-5 w-40 bg-theme-primary/30 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Location */}
                <div>
                  <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <FiMapPin className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-5 w-44 bg-theme-primary/30 rounded"></div>
                  </div>
                </div>

                {/* Member since */}
                <div>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="h-5 w-32 bg-theme-primary/30 rounded"></div>
                </div>

                {/* Status */}
                <div>
                  <div className="h-3 w-12 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-16 bg-accent-green/20 border border-accent-green/30 rounded-full"></div>
                    <div className="h-6 w-20 bg-accent-green/20 border border-accent-green/30 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Professional Information Skeleton */}
          <ProfileSectionSkeleton
            icon={<FiAward className="w-5 h-5 text-theme-primary/30" />}
            title="Informações Profissionais"
            subtitle="Sua experiência, formação e conquistas"
          >
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-5/6"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-4/6"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <div>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-3/4"></div>
                  </div>
                </div>

                {/* Education */}
                <div>
                  <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-2/3"></div>
                  </div>
                </div>
              </div>

              {/* Website */}
              <div>
                <div className="h-3 w-16 bg-theme-tertiary/30 rounded mb-2"></div>
                <div className="flex items-center space-x-2">
                  <FiGlobe className="w-4 h-4 text-brand-primary/30" />
                  <div className="h-4 w-48 bg-brand-primary/30 rounded"></div>
                </div>
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Teaching Configuration Skeleton */}
          <ProfileSectionSkeleton
            icon={<FiMusic className="w-5 h-5 text-theme-primary/30" />}
            title="Configurações de Ensino"
            subtitle="Seus instrumentos, especialidades e métodos de ensino"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instruments */}
                <div>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-16 bg-accent-blue/20 border border-accent-blue/30 rounded-full"
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <div className="h-3 w-28 bg-theme-tertiary/30 rounded mb-3"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-20 bg-accent-purple/20 border border-accent-purple/30 rounded-full"
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Methodology */}
              <div>
                <div className="h-3 w-24 bg-theme-tertiary/30 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-3 bg-theme-primary/20 rounded w-4/5"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <div>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <FiClock className="w-4 h-4 text-theme-primary/30" />
                    <div className="h-4 w-20 bg-theme-primary/30 rounded"></div>
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <div className="h-3 w-32 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <FiUsers className="w-4 h-4 text-theme-primary/30" />
                    <div className="h-4 w-16 bg-theme-primary/30 rounded"></div>
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <div className="h-3 w-20 bg-theme-tertiary/30 rounded mb-2"></div>
                  <div className="h-4 w-36 bg-theme-primary/30 rounded"></div>
                </div>
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Public Profile Skeleton */}
          <ProfileSectionSkeleton
            icon={<FiGlobe className="w-5 h-5 text-theme-primary/30" />}
            title="Perfil Público"
            subtitle="Configure sua visibilidade na página 'Conheça Nossos Professores'"
          >
            <div className="space-y-4">
              {/* Status toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-green/20 rounded-full flex items-center justify-center">
                    <FiEye className="w-5 h-5 text-accent-green/50" />
                  </div>
                  <div>
                    <div className="h-4 w-24 bg-theme-primary/30 rounded mb-1"></div>
                    <div className="h-3 w-40 bg-theme-tertiary/30 rounded"></div>
                  </div>
                </div>
                <div className="w-11 h-6 bg-brand-primary/30 rounded-full"></div>
              </div>

              {/* Public bio */}
              <div>
                <div className="h-3 w-28 bg-theme-tertiary/30 rounded mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-3 bg-theme-primary/20 rounded w-3/4"></div>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg border border-brand-primary/20 p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <FiGlobe className="w-5 h-5 text-brand-primary/30" />
                  <div className="h-4 w-32 bg-theme-primary/30 rounded"></div>
                </div>
                <div className="space-y-1 mb-3">
                  <div className="h-3 bg-theme-secondary/30 rounded w-5/6"></div>
                  <div className="h-3 bg-theme-secondary/30 rounded w-4/6"></div>
                </div>
                <div className="h-3 w-40 bg-brand-primary/30 rounded"></div>
              </div>
            </div>
          </ProfileSectionSkeleton>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"></div>
    </div>
  );
}

// Profile Section Skeleton Component
interface ProfileSectionSkeletonProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function ProfileSectionSkeleton({
  icon,
  children,
}: ProfileSectionSkeletonProps) {
  return (
    <div className="classical-card animate-pulse">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <div>
              <div className="h-5 w-48 bg-theme-primary/30 rounded mb-2"></div>
              <div className="h-3 w-64 bg-theme-tertiary/30 rounded"></div>
            </div>
          </div>

          <div className="h-10 w-20 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
        </div>

        {children}
      </div>
    </div>
  );
}
