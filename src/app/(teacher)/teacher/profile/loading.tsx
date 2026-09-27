// app/teacher/profile/loading.tsx - Loading para Perfil do Professor
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiClock,
  PiEnvelopeSimple,
  PiEye,
  PiGlobe,
  PiMapPin,
  PiMedal,
  PiMusicNotes,
  PiPhone,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';

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
          <PiUser />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-brand-secondary/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiMedal />
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
          <PiMusicNotes />
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
            icon={<PiUser className="w-5 h-5 text-theme-primary/30" />}
            title="Informações Pessoais"
            subtitle="Seus dados básicos e informações de contato"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Stack>
                {/* Name */}
                <Stack gap={2}>
                  <div className="h-3 w-16 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-5 w-48 bg-theme-primary/30 rounded"></div>
                </Stack>

                {/* Email */}
                <Stack gap={2}>
                  <div className="h-3 w-12 bg-theme-tertiary/30 rounded"></div>
                  <Inline gap={2}>
                    <PiEnvelopeSimple className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-5 w-56 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </Stack>

                {/* Phone */}
                <Stack gap={2}>
                  <div className="h-3 w-16 bg-theme-tertiary/30 rounded"></div>
                  <Inline gap={2}>
                    <PiPhone className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-5 w-40 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </Stack>
              </Stack>

              <Stack>
                {/* Location */}
                <Stack gap={2}>
                  <div className="h-3 w-20 bg-theme-tertiary/30 rounded"></div>
                  <Inline gap={2}>
                    <PiMapPin className="w-4 h-4 text-theme-tertiary/30" />
                    <div className="h-5 w-44 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </Stack>

                {/* Member since */}
                <Stack gap={2}>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-5 w-32 bg-theme-primary/30 rounded"></div>
                </Stack>

                {/* Status */}
                <Stack gap={2}>
                  <div className="h-3 w-12 bg-theme-tertiary/30 rounded"></div>
                  <Inline gap={2}>
                    <div className="h-6 w-16 bg-accent-green/20 border border-accent-green/30 rounded-full"></div>
                    <div className="h-6 w-20 bg-accent-green/20 border border-accent-green/30 rounded-full"></div>
                  </Inline>
                </Stack>
              </Stack>
            </div>
          </ProfileSectionSkeleton>

          {/* Professional Information Skeleton */}
          <ProfileSectionSkeleton
            icon={<PiMedal className="w-5 h-5 text-theme-primary/30" />}
            title="Informações Profissionais"
            subtitle="Sua experiência, formação e conquistas"
          >
            <Stack gap={6}>
              {/* Bio */}
              <Stack gap={2}>
                <div className="h-3 w-20 bg-theme-tertiary/30 rounded"></div>
                <Stack gap={2}>
                  <div className="h-4 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-5/6"></div>
                  <div className="h-4 bg-theme-primary/20 rounded w-4/6"></div>
                </Stack>
              </Stack>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience */}
                <Stack gap={2}>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded"></div>
                  <Stack gap={2}>
                    <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-3/4"></div>
                  </Stack>
                </Stack>

                {/* Education */}
                <Stack gap={2}>
                  <div className="h-3 w-20 bg-theme-tertiary/30 rounded"></div>
                  <Stack gap={2}>
                    <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                    <div className="h-3 bg-theme-primary/20 rounded w-2/3"></div>
                  </Stack>
                </Stack>
              </div>

              {/* Website */}
              <Stack gap={2}>
                <div className="h-3 w-16 bg-theme-tertiary/30 rounded"></div>
                <Inline gap={2}>
                  <PiGlobe className="w-4 h-4 text-brand-primary/30" />
                  <div className="h-4 w-48 bg-brand-primary/30 rounded"></div>
                </Inline>
              </Stack>
            </Stack>
          </ProfileSectionSkeleton>

          {/* Teaching Configuration Skeleton */}
          <ProfileSectionSkeleton
            icon={<PiMusicNotes className="w-5 h-5 text-theme-primary/30" />}
            title="Configurações de Ensino"
            subtitle="Seus instrumentos, especialidades e métodos de ensino"
          >
            <Stack gap={6}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instruments */}
                <Stack gap={3}>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-16 bg-accent-blue/20 border border-accent-blue/30 rounded-full"
                      ></div>
                    ))}
                  </div>
                </Stack>

                {/* Specialties */}
                <Stack gap={3}>
                  <div className="h-3 w-28 bg-theme-tertiary/30 rounded"></div>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-6 w-20 bg-accent-purple/20 border border-accent-purple/30 rounded-full"
                      ></div>
                    ))}
                  </div>
                </Stack>
              </div>

              {/* Methodology */}
              <Stack gap={2}>
                <div className="h-3 w-24 bg-theme-tertiary/30 rounded"></div>
                <Stack gap={2}>
                  <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-3 bg-theme-primary/20 rounded w-4/5"></div>
                </Stack>
              </Stack>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Duration */}
                <Stack gap={2}>
                  <div className="h-3 w-24 bg-theme-tertiary/30 rounded"></div>
                  <Inline gap={2}>
                    <PiClock className="w-4 h-4 text-theme-primary/30" />
                    <div className="h-4 w-20 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </Stack>

                {/* Capacity */}
                <Stack gap={2}>
                  <div className="h-3 w-32 bg-theme-tertiary/30 rounded"></div>
                  <Inline gap={2}>
                    <PiUsers className="w-4 h-4 text-theme-primary/30" />
                    <div className="h-4 w-16 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </Stack>

                {/* Timezone */}
                <Stack gap={2}>
                  <div className="h-3 w-20 bg-theme-tertiary/30 rounded"></div>
                  <div className="h-4 w-36 bg-theme-primary/30 rounded"></div>
                </Stack>
              </div>
            </Stack>
          </ProfileSectionSkeleton>

          {/* Public Profile Skeleton */}
          <ProfileSectionSkeleton
            icon={<PiGlobe className="w-5 h-5 text-theme-primary/30" />}
            title="Perfil Público"
            subtitle="Configure sua visibilidade na página 'Conheça Nossos Professores'"
          >
            <Stack>
              {/* Status toggle */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-lg border border-theme-primary/20">
                <Inline gap={3}>
                  <div className="w-10 h-10 bg-accent-green/20 rounded-full flex items-center justify-center">
                    <PiEye className="w-5 h-5 text-accent-green/50" />
                  </div>
                  <Stack gap={1}>
                    <div className="h-4 w-24 bg-theme-primary/30 rounded"></div>
                    <div className="h-3 w-40 bg-theme-tertiary/30 rounded"></div>
                  </Stack>
                </Inline>
                <div className="w-11 h-6 bg-brand-primary/30 rounded-full"></div>
              </div>

              {/* Public bio */}
              <Stack gap={2}>
                <div className="h-3 w-28 bg-theme-tertiary/30 rounded"></div>
                <Stack gap={2}>
                  <div className="h-3 bg-theme-primary/20 rounded w-full"></div>
                  <div className="h-3 bg-theme-primary/20 rounded w-3/4"></div>
                </Stack>
              </Stack>

              {/* Info box */}
              <div className="bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5 rounded-lg border border-brand-primary/20 p-4">
                <Inline gap={3} className="mb-2">
                  <PiGlobe className="w-5 h-5 text-brand-primary/30" />
                  <div className="h-4 w-32 bg-theme-primary/30 rounded"></div>
                </Inline>
                <Stack gap={1} className="mb-3">
                  <div className="h-3 bg-theme-secondary/30 rounded w-5/6"></div>
                  <div className="h-3 bg-theme-secondary/30 rounded w-4/6"></div>
                </Stack>
                <div className="h-3 w-40 bg-brand-primary/30 rounded"></div>
              </div>
            </Stack>
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
          <Inline gap={3}>
            <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            <Stack gap={2}>
              <div className="h-5 w-48 bg-theme-primary/30 rounded"></div>
              <div className="h-3 w-64 bg-theme-tertiary/30 rounded"></div>
            </Stack>
          </Inline>

          <div className="h-10 w-20 bg-theme-elevated border border-theme-secondary rounded-lg"></div>
        </div>

        {children}
      </div>
    </div>
  );
}
