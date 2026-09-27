// app/uploads/work/[id]/edit/loading.tsx
'use client';

import {
  PiArrowSquareOut,
  PiBookOpen,
  PiCalendarBlank,
  PiClock,
  PiFloppyDisk,
  PiMapPin,
  PiMetronome,
  PiMusicNotes,
  PiPencilLine,
  PiPulse,
  PiStack,
  PiTag,
  PiTarget,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function EditWorkLoading() {
  return (
    <div className="bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb Skeleton */}
        <Inline
          as="nav"
          gap={2}
          className="text-sm text-theme-tertiary mb-6 pt-4"
        >
          <div className="h-4 w-16 bg-theme-elevated rounded"></div>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="h-4 w-16 bg-theme-elevated rounded"></div>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <div className="h-4 w-32 bg-theme-primary/20 rounded"></div>
        </Inline>

        {/* Header Principal */}
        <div className="classical-card overflow-hidden relative">
          <div className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Informações Principais */}
              <Stack gap={6} className="lg:col-span-3">
                {/* Título e Header */}
                <Stack>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Inline gap={3} className="mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                          <PiPencilLine className="w-5 h-5 text-theme-primary/30" />
                        </div>
                        <Stack gap={2}>
                          <div className="h-10 w-48 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
                          <div className="h-5 w-40 bg-theme-elevated rounded"></div>
                        </Stack>
                      </Inline>

                      <div className="h-12 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded mb-2"></div>

                      {/* Subtitle */}
                      <div className="h-8 bg-theme-elevated rounded w-3/4 mt-2"></div>

                      <Inline gap={2} className="mt-3">
                        <div className="h-6 w-8 bg-theme-elevated rounded"></div>
                        <div className="h-6 w-32 bg-brand-primary/20 rounded"></div>
                      </Inline>
                      <div className="h-5 w-24 bg-theme-elevated rounded mt-2"></div>
                    </div>

                    {/* Action buttons */}
                    <Inline gap={3} className="ml-4">
                      <Inline
                        gap={2}
                        className="h-10 w-20 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg justify-center"
                      >
                        <PiFloppyDisk className="w-4 h-4 text-theme-primary/30" />
                        <div className="w-8 h-4 bg-theme-primary/30 rounded"></div>
                      </Inline>

                      <Inline
                        gap={2}
                        className="h-10 w-24 bg-accent-red/20 border border-accent-red/30 rounded-lg justify-center"
                      >
                        <PiTrash className="w-4 h-4 text-accent-red/30" />
                        <div className="w-12 h-4 bg-accent-red/30 rounded"></div>
                      </Inline>
                    </Inline>
                  </div>

                  {/* Difficulty Level Badge */}
                  <Inline gap={3}>
                    <Inline
                      gap={2}
                      className="h-8 w-40 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 rounded-full justify-center"
                    >
                      <PiTarget className="w-4 h-4 text-theme-primary/30" />
                      <div className="w-24 h-4 bg-theme-primary/30 rounded"></div>
                    </Inline>
                  </Inline>
                </Stack>

                {/* Grid de Informações Detalhadas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: (
                        <PiCalendarBlank className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                    {
                      icon: (
                        <PiClock className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-purple to-accent-blue',
                    },
                    {
                      icon: (
                        <PiMusicNotes className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-brand-primary to-brand-secondary',
                    },
                    {
                      icon: (
                        <PiPulse className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-red to-accent-purple',
                    },
                    {
                      icon: (
                        <PiMetronome className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-purple',
                    },
                    {
                      icon: (
                        <PiMusicNotes className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-blue to-accent-purple',
                    },
                    {
                      icon: (
                        <PiMapPin className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-red to-accent-purple',
                    },
                    {
                      icon: (
                        <PiStack className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 group"
                    >
                      <div
                        className={`w-8 h-8 bg-gradient-to-br ${item.gradient}/20 rounded-xl flex items-center justify-center mt-0.5`}
                      >
                        {item.icon}
                      </div>
                      <Stack gap={1}>
                        <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                        <div className="h-5 w-20 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                      </Stack>
                    </div>
                  ))}
                </div>

                {/* Informações Adicionais */}
                <Stack className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title"
                  >
                    <PiBookOpen className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-48 bg-theme-elevated rounded"></div>
                  </Inline>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <Inline gap={2}>
                      <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-24 bg-theme-primary/20 rounded"></div>
                    </Inline>
                    <Inline gap={2}>
                      <div className="h-4 w-20 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-28 bg-theme-primary/20 rounded"></div>
                    </Inline>
                    <Inline gap={2}>
                      <div className="h-4 w-16 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-20 bg-theme-primary/20 rounded"></div>
                    </Inline>
                    <Stack
                      gap={1}
                      className="md:col-span-2 p-3 bg-gradient-to-r from-theme-elevated/50 to-interactive-hover/50 rounded-xl border border-theme-primary/20"
                    >
                      <div className="h-4 w-32 bg-theme-elevated rounded"></div>
                      <Stack gap={1}>
                        <div className="h-3 bg-theme-secondary rounded"></div>
                        <div className="h-3 bg-theme-secondary rounded w-5/6"></div>
                        <div className="h-3 bg-theme-secondary rounded w-4/6"></div>
                      </Stack>
                    </Stack>
                  </div>
                </Stack>

                {/* Tags de Categorias e Gêneros */}
                <Stack className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title"
                  >
                    <PiTag className="w-5 h-5 text-accent-green/30" />
                    <div className="h-5 w-44 bg-theme-elevated rounded"></div>
                  </Inline>
                  <Stack>
                    <Stack gap={3}>
                      <div className="h-4 w-20 bg-theme-elevated rounded"></div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-8 w-24 bg-brand-primary/10 border border-brand-primary/30 rounded-full"
                          ></div>
                        ))}
                      </div>
                    </Stack>

                    <Stack gap={3}>
                      <div className="h-4 w-28 bg-theme-elevated rounded"></div>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={index}
                            className="h-8 w-20 bg-accent-green/10 border border-accent-green/30 rounded-full"
                          ></div>
                        ))}
                      </div>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Link IMSLP */}
                <Stack className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title"
                  >
                    <PiArrowSquareOut className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-24 bg-theme-elevated rounded"></div>
                  </Inline>
                  <Inline
                    gap={2}
                    className="h-10 w-32 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg justify-center"
                  >
                    <PiBookOpen className="w-4 h-4 text-theme-primary/30" />
                    <div className="w-16 h-4 bg-theme-primary/30 rounded"></div>
                  </Inline>
                </Stack>
              </Stack>

              {/* Sidebar com Foto do Compositor */}
              <Stack gap={6}>
                {/* Foto do Compositor */}
                <Card nivel={2}>
                  <Inline gap={3} className="mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-xl flex items-center justify-center">
                      <PiUser className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-24 bg-theme-elevated rounded"></div>
                  </Inline>

                  <div className="text-center space-y-4">
                    <div className="w-32 h-40 mx-auto bg-gradient-card border border-theme-primary/20 rounded-xl flex items-center justify-center">
                      <PiUser className="w-8 h-8 text-theme-tertiary/30 opacity-50" />
                    </div>

                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-brand-primary/20 rounded mx-auto"></div>
                      <div className="h-4 w-20 bg-theme-elevated rounded mx-auto"></div>
                    </div>
                  </div>
                </Card>

                {/* Detalhes Técnicos */}
                <Card nivel={2}>
                  <Inline gap={3} className="mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                      <PiBookOpen className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <div className="h-5 w-32 bg-theme-elevated rounded"></div>
                  </Inline>
                  <Stack gap={3} className="text-sm">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-theme-elevated rounded"></div>
                      <div className="h-4 w-8 bg-theme-primary/20 rounded"></div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-theme-secondary">
                      <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                      <div className="h-3 w-16 bg-theme-primary/20 rounded"></div>
                    </div>
                  </Stack>
                </Card>
              </Stack>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
