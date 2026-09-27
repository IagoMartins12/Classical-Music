// app/uploads/composer/[id]/edit/loading.tsx
'use client';

import {
  PiArrowSquareOut,
  PiBookOpen,
  PiCalendarBlank,
  PiFloppyDisk,
  PiInfo,
  PiMapPin,
  PiPencilLine,
  PiTrash,
  PiUser,
} from 'react-icons/pi';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Card } from '@/app/components/ui/Card';

export default function EditComposerLoading() {
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
          <div className="h-4 w-24 bg-theme-elevated rounded"></div>
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
        <div className="classical-card relative z-50">
          <div className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações do Compositor */}
              <Stack
                gap={6}
                className="lg:col-span-2 order-2 md:order-1 lg:order-1"
              >
                <Stack gap={3}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Inline gap={3} className="mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                          <PiPencilLine className="w-5 h-5 text-theme-primary/30" />
                        </div>
                        <Stack gap={2}>
                          <div className="h-10 w-64 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded"></div>
                          <div className="h-5 w-48 bg-theme-elevated rounded"></div>
                        </Stack>
                      </Inline>
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
                </Stack>

                {/* Grid de informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: (
                        <PiUser className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-brand-primary to-brand-secondary',
                    },
                    {
                      icon: (
                        <PiUser className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                    {
                      icon: (
                        <PiCalendarBlank className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-green to-accent-blue',
                    },
                    {
                      icon: (
                        <PiCalendarBlank className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-red to-accent-purple',
                    },
                    {
                      icon: (
                        <PiMapPin className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-brand-primary to-brand-secondary',
                    },
                    {
                      icon: (
                        <PiUser className="w-4 h-4 text-theme-primary/30" />
                      ),
                      gradient: 'from-accent-blue to-accent-purple',
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
                        <div className="h-4 w-20 bg-theme-elevated rounded"></div>
                        <div className="h-5 w-32 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                      </Stack>
                    </div>
                  ))}

                  {/* Instrumentos - span full width */}
                  <div className="md:col-span-2 flex items-start space-x-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-purple/20 to-accent-red/20 rounded-xl flex items-center justify-center mt-0.5">
                      <PiUser className="w-4 h-4 text-theme-primary/30" />
                    </div>
                    <Stack gap={1}>
                      <div className="h-4 w-24 bg-theme-elevated rounded"></div>
                      <div className="h-5 w-48 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
                    </Stack>
                  </div>
                </div>

                {/* Links Externos */}
                <Stack className="border-t border-theme-secondary pt-6">
                  <Inline
                    as="h3"
                    gap={2}
                    className="text-lg font-semibold text-theme-primary classical-title"
                  >
                    <PiArrowSquareOut className="w-5 h-5 text-accent-blue/30" />
                    <div className="h-5 w-28 bg-theme-elevated rounded"></div>
                  </Inline>
                  <div className="flex flex-wrap gap-3">
                    <Inline
                      gap={2}
                      className="h-10 w-24 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 rounded-lg justify-center"
                    >
                      <PiArrowSquareOut className="w-4 h-4 text-theme-primary/30" />
                      <div className="w-12 h-4 bg-theme-primary/30 rounded"></div>
                    </Inline>

                    <Inline
                      gap={2}
                      className="h-10 w-20 bg-theme-secondary rounded-lg justify-center"
                    >
                      <PiBookOpen className="w-4 h-4 text-theme-tertiary/30" />
                      <div className="w-10 h-4 bg-theme-tertiary/30 rounded"></div>
                    </Inline>
                  </div>
                </Stack>
              </Stack>

              {/* Imagem do Compositor */}
              <div className="flex justify-center order-1 md:order-2 lg:order-2 lg:justify-end">
                <div className="relative group">
                  <div className="w-64 h-80 bg-gradient-card border border-theme-primary/20 rounded-2xl flex items-center justify-center shadow-theme-glow">
                    <div className="text-center text-theme-tertiary">
                      <PiUser className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <div className="h-4 w-32 bg-theme-elevated rounded mx-auto"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Biografia */}
        <Card densidade="larga">
          <Inline gap={3} className="mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-2xl flex items-center justify-center">
              <PiBookOpen className="w-6 h-6 text-theme-primary/30" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-8 w-24 bg-gradient-to-r from-theme-primary/20 to-theme-secondary/20 rounded"></div>
            </div>
            <div className="relative group">
              <div className="w-8 h-8 bg-interactive-hover/20 rounded-full flex items-center justify-center">
                <PiInfo className="w-4 h-4 text-theme-tertiary/30" />
              </div>
            </div>
          </Inline>

          <Stack>
            {Array.from({ length: 4 }).map((_, index) => (
              <Stack gap={2} key={index}>
                <div className="h-4 bg-theme-elevated rounded"></div>
                <div className="h-4 bg-theme-elevated rounded w-5/6"></div>
                <div className="h-4 bg-theme-elevated rounded w-4/6"></div>
                {index < 3 && <div className="h-2"></div>}
              </Stack>
            ))}
          </Stack>
        </Card>
      </div>
    </div>
  );
}
