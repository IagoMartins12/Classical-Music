'use client';

import { FaMusic, FaHistory, FaCrown } from 'react-icons/fa';
import { GiMusicalNotes, GiViolin } from 'react-icons/gi';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="text-center">
          {/* Floating Icons */}
          <div className="flex justify-center items-center mb-8 space-x-4">
            <div className="animate-bounce delay-0">
              <FaMusic className="text-3xl text-blue-300" />
            </div>
            <div className="animate-bounce delay-100">
              <GiMusicalNotes className="text-4xl text-purple-300" />
            </div>
            <div className="animate-bounce delay-200">
              <GiViolin className="text-3xl text-pink-300" />
            </div>
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
            História da
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Música Clássica
            </span>
          </h1>

          <p className="text-xl lg:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto leading-relaxed">
            Embarque em uma jornada fascinante através dos séculos, descobrindo
            como a música clássica evoluiu desde os cânticos medievais até as
            inovações modernas.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center text-blue-300">
              <FaHistory className="mr-2" />
              <span className="text-lg">Mais de 1000 anos de história</span>
            </div>
            <div className="hidden sm:block text-gray-400">•</div>
            <div className="flex items-center text-purple-300">
              <FaCrown className="mr-2" />
              <span className="text-lg">Grandes mestres da música</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 opacity-20">
          <GiMusicalNotes className="text-6xl text-blue-400 animate-pulse" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20">
          <GiViolin className="text-6xl text-pink-400 animate-pulse delay-1000" />
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-slate-50"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C300,90 900,30 1200,60 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
