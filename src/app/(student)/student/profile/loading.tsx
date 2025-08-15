// app/student/profile/loading.tsx - Loading para Perfil do Aluno
'use client';

import {
  FiUser,
  FiEdit3,
  FiBookOpen,
  FiHeart,
  FiShield,
  FiMessageSquare,
  FiMusic,
  FiMapPin,
  FiPhone,
  FiMail,
  FiTarget,
  FiTrendingUp,
  FiCheck,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';

export default function StudentProfileLoading() {
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
          <FiBookOpen />
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
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full flex items-center justify-center shadow-theme-glow">
                <div className="w-12 h-12 bg-theme-inverse/30 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-theme-inverse/30 rounded"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-primary rounded-2xl mx-auto max-w-lg shadow-theme-medium"></div>
            <div className="h-6 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* Personal Information */}
          <ProfileSectionSkeleton
            icon={<FiUser className="w-5 h-5 text-theme-inverse/20" />}
            iconColor="from-brand-primary/20 to-brand-secondary/20"
            title="Informações Pessoais"
            subtitle="Seus dados básicos e informações de contato"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProfileFieldSkeleton
                  label="Nome"
                  icon={<FiUser className="w-4 h-4" />}
                />
                <ProfileFieldSkeleton
                  label="Email"
                  icon={<FiMail className="w-4 h-4" />}
                />
                <ProfileFieldSkeleton
                  label="Telefone"
                  icon={<FiPhone className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-4">
                <ProfileFieldSkeleton
                  label="Localização"
                  icon={<FiMapPin className="w-4 h-4" />}
                />
                <ProfileFieldSkeleton label="Aluno desde" />
                <ProfileFieldSkeleton label="Status" />
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Study Configuration */}
          <ProfileSectionSkeleton
            icon={<FiBookOpen className="w-5 h-5 text-theme-inverse/20" />}
            iconColor="from-accent-blue/20 to-accent-purple/20"
            title="Configurações de Estudo"
            subtitle="Seus objetivos e preferências de aprendizado"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-4 bg-theme-primary/30 rounded w-24 mb-2"></div>
                <div className="h-4 bg-theme-primary/30 rounded w-32 mb-2"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-theme-primary/30 rounded w-32 mb-2"></div>
                <div className="h-20 bg-theme-secondary/20 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-theme-primary/30 rounded w-28 mb-2"></div>
                <div className="h-20 bg-theme-secondary/20 rounded"></div>
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Musical Preferences */}
          <ProfileSectionSkeleton
            icon={<FiHeart className="w-5 h-5 text-theme-inverse/20" />}
            iconColor="from-accent-purple/20 to-accent-pink/20"
            title="Preferências Musicais"
            subtitle="Seus gêneros musicais favoritos"
          >
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-brand-primary/10 border border-brand-primary/30 rounded-full"
                ></div>
              ))}
            </div>
          </ProfileSectionSkeleton>

          {/* Privacy Settings */}
          <ProfileSectionSkeleton
            icon={<FiShield className="w-5 h-5 text-theme-inverse/20" />}
            iconColor="from-accent-green/20 to-accent-blue/20"
            title="Configurações de Privacidade"
            subtitle="Controle a visibilidade do seu progresso"
          >
            <div className="space-y-4">
              <div className="h-4 bg-theme-primary/30 rounded w-32 mb-4"></div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-theme-secondary/5 rounded-lg">
                  <div className="h-4 bg-theme-primary/30 rounded w-40"></div>
                  <div className="h-5 w-12 bg-accent-green/20 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-theme-secondary/5 rounded-lg">
                  <div className="h-4 bg-theme-primary/30 rounded w-48"></div>
                  <div className="h-5 w-12 bg-accent-green/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Communication Settings */}
          <ProfileSectionSkeleton
            icon={<FiMessageSquare className="w-5 h-5 text-theme-inverse/20" />}
            iconColor="from-accent-orange/20 to-accent-red/20"
            title="Configurações de Comunicação"
            subtitle="Como você prefere ser contatado"
          >
            <div>
              <div className="h-4 bg-theme-primary/30 rounded w-40 mb-4"></div>
              <div className="h-10 bg-theme-elevated/30 rounded"></div>
            </div>
          </ProfileSectionSkeleton>

          {/* My Repertoire */}
          <ProfileSectionSkeleton
            icon={<FiMusic className="w-5 h-5 text-theme-inverse/20" />}
            iconColor="from-accent-yellow/20 to-accent-orange/20"
            title="Meu Repertório"
            subtitle="Suas obras favoritas e progresso de estudo"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Want to Learn */}
              <div>
                <div className="h-6 bg-theme-primary/30 rounded w-40 mb-4 flex items-center">
                  <FiTarget className="w-5 h-5 mr-2 text-theme-tertiary/30" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3 bg-theme-secondary/10 rounded-lg border"
                    >
                      <div className="h-4 bg-theme-primary/30 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-theme-tertiary/30 rounded w-24 mb-1"></div>
                      <div className="h-4 w-16 bg-accent-blue/10 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learned */}
              <div>
                <div className="h-6 bg-theme-primary/30 rounded w-32 mb-4 flex items-center">
                  <FiCheck className="w-5 h-5 mr-2 text-theme-tertiary/30" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-3 bg-theme-secondary/10 rounded-lg border"
                    >
                      <div className="h-4 bg-theme-primary/30 rounded w-28 mb-1"></div>
                      <div className="h-3 bg-theme-tertiary/30 rounded w-20 mb-1"></div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="h-3 bg-accent-green/20 rounded w-16"></div>
                        <div className="h-3 bg-accent-blue/20 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="mt-8 pt-6 border-t border-theme-secondary">
              <div className="h-6 bg-theme-primary/30 rounded w-24 mb-4 flex items-center">
                <FiTrendingUp className="w-5 h-5 mr-2 text-theme-tertiary/30" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-accent-blue/20 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-3 bg-theme-tertiary/20 rounded w-20 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Teachers */}
            <div className="mt-8 pt-6 border-t border-theme-secondary">
              <div className="h-6 bg-theme-primary/30 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 bg-theme-secondary/10 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-theme-primary/30 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-theme-tertiary/30 rounded w-32"></div>
                    </div>
                  </div>
                ))}
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
function ProfileSectionSkeleton({
  icon,
  iconColor,
  children,
}: {
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="classical-card animate-pulse">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center`}
            >
              {icon}
            </div>
            <div>
              <div className="h-6 bg-theme-primary/30 rounded w-48 mb-2"></div>
              <div className="h-3 bg-theme-tertiary/30 rounded w-64"></div>
            </div>
          </div>

          <div className="h-10 bg-gradient-to-r from-theme-elevated to-interactive-hover border border-theme-secondary rounded-lg px-4 flex items-center space-x-2">
            <FiEdit3 className="w-4 h-4 text-theme-tertiary/30" />
            <div className="h-4 w-12 bg-theme-tertiary/20 rounded"></div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

// Profile Field Skeleton Component
function ProfileFieldSkeleton({
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="h-3 bg-theme-tertiary/30 rounded w-16 mb-2"></div>
      <div className="flex items-center space-x-2">
        {icon && <div className="text-theme-tertiary/30">{icon}</div>}
        <div className="h-4 bg-theme-primary/30 rounded flex-1 max-w-40"></div>
      </div>
    </div>
  );
}
