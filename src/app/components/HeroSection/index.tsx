// HeroSection.tsx - Premium version with theme system
'use client';

import AnimatedMusicalNotes from '../AnimatedMusicalNotes';
import FloatingIcons from '../FloatingIcons';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-primary pt-8 md:pt-24 lg:pt-24 flex items-center">
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
              História da {''}
              <span className="block text-gradient-brand bg-clip-text text-transparent mt-2">
                Música Clássica
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-theme-secondary classical-subtitle mb-8 max-w-4xl mx-auto leading-relaxed">
              Embarque em uma jornada fascinante através dos séculos,
              descobrindo como a música clássica evoluiu desde os cânticos
              medievais até as inovações modernas.
            </p>
          </div>

          {/* Feature Stats */}
          {/* <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiClock className="w-6 h-6 text-theme-primary" />
              </div>
              <h3 className="text-2xl font-bold text-brand-primary mb-2">
                1000+
              </h3>
              <p className="text-theme-secondary text-sm">Anos de História</p>
            </div>

            <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiStar className="w-6 h-6 text-theme-primary" />
              </div>
              <h3 className="text-2xl font-bold text-accent-purple mb-2">6</h3>
              <p className="text-theme-secondary text-sm">Épocas Musicais</p>
            </div>

            <div className="classical-card p-6 text-center group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <GiMusicalNotes className="w-6 h-6 text-theme-primary" />
              </div>
              <h3 className="text-2xl font-bold text-accent-green mb-2">
                100+
              </h3>
              <p className="text-theme-secondary text-sm">Grandes Mestres</p>
            </div>
          </div> */}

          {/* Call to Action */}
          {/* <div
            className="space-y-6 animate-fade-in-up"
            style={{ animationDelay: '0.6s' }}
          >
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/30 rounded-2xl backdrop-blur-md">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center">
                  <FiClock className="w-4 h-4 text-theme-primary" />
                </div>
                <div>
                  <span className="text-accent-blue font-semibold">
                    Mais de 1000 anos
                  </span>
                  <p className="text-theme-tertiary text-sm">
                    de evolução musical
                  </p>
                </div>
              </div>

              <div className="hidden sm:block w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>

              <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-accent-purple/10 to-accent-red/10 border border-accent-purple/30 rounded-2xl backdrop-blur-md">
                <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-red rounded-xl flex items-center justify-center">
                  <FiStar className="w-4 h-4 text-theme-primary" />
                </div>
                <div>
                  <span className="text-accent-purple font-semibold">
                    Grandes mestres
                  </span>
                  <p className="text-theme-tertiary text-sm">
                    da música clássica
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Wave Separator */}
    </section>
  );
}
