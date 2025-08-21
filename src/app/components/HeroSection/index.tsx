// HeroSection.tsx - Premium version with theme system
'use client';

import AnimatedMusicalNotes from '../AnimatedMusicalNotes';
import FloatingIcons from '../FloatingIcons';
import { useTranslation } from '@/app/hooks/useTranslation';

export function HeroSection() {
  const { t } = useTranslation({ sections: ['pages/music-history'] });

  return (
    <section className="relative overflow-hidden bg-gradient-primary pt-8 md:pt-24 lg:pt-24 flex items-center">
      {/* Animated musical notes */}
      <AnimatedMusicalNotes />
      <div className="section-wrap mx-auto relative z-10">
        <div className="text-center space-y-8">
          {/* Floating Icons */}
          <FloatingIcons />

          {/* Main Title */}
          <div
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-theme-primary classical-title tracking-tight leading-tight">
              {t('hero_jsx_h1_children_0__historia_da')} {''}
              <span className="block text-gradient-brand bg-clip-text text-transparent mt-2">
                {t('hero_jsx_span_children_0__musica_classica')}
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-theme-secondary classical-subtitle mb-8 max-w-4xl mx-auto leading-relaxed">
              {t('hero_jsx_p_children_0__embarque_jornada')}
            </p>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
    </section>
  );
}
