// app/not-found.tsx
'use client';

import Link from 'next/link';
import {
  FiHome,
  FiMusic,
  FiUsers,
  FiBookOpen,
  FiCompass,
} from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '../components/AnimatedMusicalNotes';

export default function NotFound() {
  return (
    <>
      <div className="classical-theme min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <AnimatedMusicalNotes />

        <div className="section-wrap relative z-10">
          <AnimatedContainer
            staggerSpeed="normal"
            className="max-w-4xl mx-auto text-center"
          >
            {/* 404 Number */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="relative mb-8">
                <div className="text-9xl md:text-[12rem] font-bold text-gradient-brand classical-title leading-none opacity-90">
                  404
                </div>
              </div>
            </AnimatedItem>

            {/* Title */}
            <AnimatedItem direction="up" springType="bouncy">
              <h1 className="text-4xl md:text-5xl font-bold text-theme-primary classical-title mb-6">
                Página não encontrada
              </h1>
            </AnimatedItem>

            {/* Subtitle */}
            <AnimatedItem direction="up" springType="smooth">
              <p className="text-xl md:text-2xl text-theme-secondary mb-12 leading-relaxed max-w-2xl mx-auto">
                Esta partitura não existe em nossa coleção musical 🎼
                <br />
                <span className="text-lg text-theme-tertiary mt-2 block">
                  Que tal explorar outras composições magníficas?
                </span>
              </p>
            </AnimatedItem>

            {/* Quick Navigation Cards */}
            <AnimatedContainer
              staggerSpeed="fast"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {/* Composers Card */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Link href="/composers" className="block group">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiUsers className="w-8 h-8 text-brand-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title group-hover:text-brand-primary transition-colors">
                    Compositores
                  </h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">
                    Explore a vida e obras dos grandes mestres da música
                    clássica
                  </p>
                </Link>
              </AnimatedCard>

              {/* History Card */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Link href="/music-history" className="block group">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiBookOpen className="w-8 h-8 text-accent-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title group-hover:text-accent-purple transition-colors">
                    História da Música
                  </h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">
                    Descubra a evolução da música através dos séculos
                  </p>
                </Link>
              </AnimatedCard>

              {/* Instruments Card */}
              <AnimatedCard hover="lift" className="classical-card p-6">
                <Link href="/instruments" className="block group">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiMusic className="w-8 h-8 text-accent-green" />
                  </div>
                  <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title group-hover:text-accent-green transition-colors">
                    Instrumentos
                  </h3>
                  <p className="text-theme-secondary text-sm leading-relaxed">
                    Conheça os instrumentos que dão vida às obras clássicas
                  </p>
                </Link>
              </AnimatedCard>
            </AnimatedContainer>

            {/* Action Buttons */}
            <AnimatedContainer
              staggerSpeed="fast"
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <AnimatedItem hover="scale" springType="bouncy">
                <Link
                  href="/"
                  className="btn-classical-primary flex items-center space-x-3 group text-lg px-8 py-4"
                >
                  <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Página Inicial</span>
                </Link>
              </AnimatedItem>

              <AnimatedItem hover="scale" springType="bouncy">
                <Link
                  href="/composers"
                  className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                >
                  <FiCompass className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Explorar Compositores</span>
                </Link>
              </AnimatedItem>
            </AnimatedContainer>

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="p-6 classical-card-simple max-w-2xl mx-auto mb-8">
                <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                  &quot;A música é a linguagem universal da humanidade.&quot;
                </blockquote>
                <cite className="text-brand-primary font-semibold">
                  — Henry Wadsworth Longfellow
                </cite>
              </div>
            </AnimatedItem>

            {/* Back Link */}
          </AnimatedContainer>
        </div>

        <div className="absolute top-4 left-4 w-12 h-12 bg-accent-purple/10 rounded-2xl flex items-center justify-center opacity-40">
          <GiMusicalNotes className="w-6 h-6 text-accent-purple" />
        </div>
      </div>
    </>
  );
}
