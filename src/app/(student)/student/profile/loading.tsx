// app/student/profile/loading.tsx - Loading para Perfil do Aluno
'use client';

import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiChatCenteredText,
  PiCheck,
  PiEnvelopeSimple,
  PiHeart,
  PiMapPin,
  PiMusicNotes,
  PiPencilLine,
  PiPhone,
  PiShield,
  PiTarget,
  PiTrendUp,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';

export default function StudentProfileLoading() {
  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute bottom-20 left-10 w-40 h-40 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '0.5s' }}
        ></div>
      </div>

      {/* Floating elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 text-5xl text-ouro-texto/10 animate-float">
          <PiUser />
        </div>
        <div
          className="absolute bottom-16 right-16 text-4xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '1s' }}
        >
          <PiBookOpen />
        </div>
        <div
          className="absolute top-1/3 right-24 text-3xl text-ouro-texto/10 animate-float"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>
        <div
          className="absolute bottom-1/3 left-24 text-3xl text-aviso/10 animate-float"
          style={{ animationDelay: '0.5s' }}
        >
          <PiMusicNotes />
        </div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Header Skeleton */}
        <div className="text-center mb-8 py-8 animate-pulse">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-ouro/20 rounded-full flex items-center justify-center shadow-theme-glow">
                <div className="w-12 h-12 bg-texto/30 rounded-full"></div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-ok/20 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-texto/30 rounded"></div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="h-12 bg-sup-elevada border border-theme-primary rounded-2xl mx-auto max-w-lg shadow-theme-medium"></div>
            <div className="h-6 bg-sup-elevada border border-theme-secondary rounded-lg mx-auto max-w-2xl"></div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="space-y-8">
          {/* Personal Information */}
          <ProfileSectionSkeleton
            icon={<PiUser className="w-5 h-5 text-sobre-ouro/20" />}
            iconColor="bg-ouro/20"
            title="Informações Pessoais"
            subtitle="Seus dados básicos e informações de contato"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <ProfileFieldSkeleton
                  label="Nome"
                  icon={<PiUser className="w-4 h-4" />}
                />
                <ProfileFieldSkeleton
                  label="Email"
                  icon={<PiEnvelopeSimple className="w-4 h-4" />}
                />
                <ProfileFieldSkeleton
                  label="Telefone"
                  icon={<PiPhone className="w-4 h-4" />}
                />
              </div>
              <div className="space-y-4">
                <ProfileFieldSkeleton
                  label="Localização"
                  icon={<PiMapPin className="w-4 h-4" />}
                />
                <ProfileFieldSkeleton label="Aluno desde" />
                <ProfileFieldSkeleton label="Status" />
              </div>
            </div>
          </ProfileSectionSkeleton>

          {/* Study Configuration */}
          <ProfileSectionSkeleton
            icon={<PiBookOpen className="w-5 h-5 text-sobre-ouro/20" />}
            iconColor="bg-aviso/20"
            title="Configurações de Estudo"
            subtitle="Seus objetivos e preferências de aprendizado"
          >
            <Stack gap={6}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-4 bg-fundo/30 rounded w-24 mb-2"></div>
                <div className="h-4 bg-fundo/30 rounded w-32 mb-2"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-fundo/30 rounded w-32 mb-2"></div>
                <div className="h-20 bg-sup-1/20 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-fundo/30 rounded w-28 mb-2"></div>
                <div className="h-20 bg-sup-1/20 rounded"></div>
              </div>
            </Stack>
          </ProfileSectionSkeleton>

          {/* Musical Preferences */}
          <ProfileSectionSkeleton
            icon={<PiHeart className="w-5 h-5 text-sobre-ouro/20" />}
            iconColor="bg-ouro/20"
            title="Preferências Musicais"
            subtitle="Seus gêneros musicais favoritos"
          >
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 bg-ouro/10 border border-ouro/30 rounded-full"
                ></div>
              ))}
            </div>
          </ProfileSectionSkeleton>

          {/* Privacy Settings */}
          <ProfileSectionSkeleton
            icon={<PiShield className="w-5 h-5 text-sobre-ouro/20" />}
            iconColor="bg-ok/20"
            title="Configurações de Privacidade"
            subtitle="Controle a visibilidade do seu progresso"
          >
            <div className="space-y-4">
              <div className="h-4 bg-fundo/30 rounded w-32 mb-4"></div>

              <Stack gap={3}>
                <div className="flex items-center justify-between p-3 bg-sup-1/5 rounded-lg">
                  <div className="h-4 bg-fundo/30 rounded w-40"></div>
                  <div className="h-5 w-12 bg-ok/20 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-3 bg-sup-1/5 rounded-lg">
                  <div className="h-4 bg-fundo/30 rounded w-48"></div>
                  <div className="h-5 w-12 bg-ok/20 rounded-full"></div>
                </div>
              </Stack>
            </div>
          </ProfileSectionSkeleton>

          {/* Communication Settings */}
          <ProfileSectionSkeleton
            icon={<PiChatCenteredText className="w-5 h-5 text-sobre-ouro/20" />}
            iconColor="bg-atencao/20"
            title="Configurações de Comunicação"
            subtitle="Como você prefere ser contatado"
          >
            <Stack>
              <div className="h-4 bg-fundo/30 rounded w-40"></div>
              <div className="h-10 bg-sup-elevada/30 rounded"></div>
            </Stack>
          </ProfileSectionSkeleton>

          {/* My Repertoire */}
          <ProfileSectionSkeleton
            icon={<PiMusicNotes className="w-5 h-5 text-sobre-ouro/20" />}
            iconColor="bg-atencao/20"
            title="Meu Repertório"
            subtitle="Suas obras favoritas e progresso de estudo"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Want to Learn */}
              <Stack>
                <div className="h-6 bg-fundo/30 rounded w-40 flex items-center">
                  <PiTarget className="w-5 h-5 mr-2 text-texto-fraco/30" />
                </div>
                <Stack gap={2}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Stack
                      gap={1}
                      key={i}
                      className="p-3 bg-sup-1/10 rounded-lg border"
                    >
                      <div className="h-4 bg-fundo/30 rounded w-32"></div>
                      <div className="h-3 bg-sup-2/30 rounded w-24"></div>
                      <div className="h-4 w-16 bg-aviso/10 rounded"></div>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              {/* Learned */}
              <Stack>
                <div className="h-6 bg-fundo/30 rounded w-32 flex items-center">
                  <PiCheck className="w-5 h-5 mr-2 text-texto-fraco/30" />
                </div>
                <Stack gap={2}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 bg-sup-1/10 rounded-lg border">
                      <div className="h-4 bg-fundo/30 rounded w-28 mb-1"></div>
                      <div className="h-3 bg-sup-2/30 rounded w-20 mb-1"></div>
                      <div className="flex items-center justify-between mt-1">
                        <div className="h-3 bg-ok/20 rounded w-16"></div>
                        <div className="h-3 bg-aviso/20 rounded w-12"></div>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Stack>
            </div>

            {/* Statistics */}
            <Stack className="mt-8 pt-6 border-t border-theme-secondary">
              <div className="h-6 bg-fundo/30 rounded w-24 flex items-center">
                <PiTrendUp className="w-5 h-5 mr-2 text-texto-fraco/30" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 bg-aviso/20 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-3 bg-sup-2/20 rounded w-20 mx-auto"></div>
                  </div>
                ))}
              </div>
            </Stack>

            {/* Active Teachers */}
            <Stack className="mt-8 pt-6 border-t border-theme-secondary">
              <div className="h-6 bg-fundo/30 rounded w-32"></div>
              <Stack gap={3}>
                {Array.from({ length: 2 }).map((_, i) => (
                  <Inline
                    gap={3}
                    key={i}
                    className="p-3 bg-sup-1/10 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-ouro/20 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-fundo/30 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-sup-2/30 rounded w-32"></div>
                    </div>
                  </Inline>
                ))}
              </Stack>
            </Stack>
          </ProfileSectionSkeleton>
        </div>
      </div>

      {/* Floating Particles */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-ouro/30 rounded-full animate-pulse"></div>
      <div className="fixed top-40 right-8 w-1.5 h-1.5 bg-ouro/40 rounded-full animate-pulse"></div>
      <div className="fixed bottom-32 left-8 w-1 h-1 bg-ouro/50 rounded-full animate-pulse"></div>
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
          <Inline gap={3}>
            <div
              className={`w-10 h-10 bg-gradient-to-br ${iconColor} rounded-lg flex items-center justify-center`}
            >
              {icon}
            </div>
            <Stack gap={2}>
              <div className="h-6 bg-fundo/30 rounded w-48"></div>
              <div className="h-3 bg-sup-2/30 rounded w-64"></div>
            </Stack>
          </Inline>

          <Inline
            gap={2}
            className="h-10 bg-sup-elevada border border-theme-secondary rounded-lg px-4"
          >
            <PiPencilLine className="w-4 h-4 text-texto-fraco/30" />
            <div className="h-4 w-12 bg-sup-2/20 rounded"></div>
          </Inline>
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
    <Stack gap={2}>
      <div className="h-3 bg-sup-2/30 rounded w-16"></div>
      <Inline gap={2}>
        {icon && <div className="text-texto-fraco/30">{icon}</div>}
        <div className="h-4 bg-fundo/30 rounded flex-1 max-w-40"></div>
      </Inline>
    </Stack>
  );
}
