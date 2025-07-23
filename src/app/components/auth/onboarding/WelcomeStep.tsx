// components/auth/onboarding/WelcomeStep.tsx
'use client';

import React from 'react';
import { GiGrandPiano, GiMusicalNotes, GiViolin } from 'react-icons/gi';
import { FiHeart, FiBook, FiUsers } from 'react-icons/fi';

const WelcomeStep: React.FC = () => {
  return (
    <div className="text-center py-8">
      <div className="mb-8">
        <div className="flex justify-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-brand-gradient rounded-full flex items-center justify-center ">
            <GiGrandPiano className="w-8 h-8 text-theme-primary" />
          </div>
          <div className="w-16 h-16 bg-accent-purple bg-opacity-20 rounded-full flex items-center justify-center shadow-theme-glow animate-glow">
            <GiViolin className="w-8 h-8 text-accent-purple" />
          </div>
          <div className="w-16 h-16 bg-accent-blue bg-opacity-20 rounded-full flex items-center justify-center">
            <GiMusicalNotes className="w-8 h-8 text-accent-blue" />
          </div>
        </div>

        <h3 className="text-3xl font-bold text-theme-primary classical-title mb-4">
          Bem-vindo à Opus Atlas!
        </h3>

        <p className="text-lg text-theme-secondary max-w-2xl mx-auto leading-relaxed">
          Estamos muito felizes em tê-lo conosco! Vamos configurar seu perfil
          para personalizar sua experiência e ajudá-lo a descobrir o melhor da
          música clássica.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="classical-card-2 p-6 text-center">
          <div className="w-12 h-12 bg-accent-green bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBook className="w-6 h-6 text-accent-green" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">
            Explore & Aprenda
          </h4>
          <p className="text-sm text-theme-secondary">
            Descubra milhares de obras e compositores da música clássica
          </p>
        </div>

        <div className="classical-card-2 p-6 text-center">
          <div className="w-12 h-12 bg-accent-purple bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiHeart className="w-6 h-6 text-accent-purple" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">Personalize</h4>
          <p className="text-sm text-theme-secondary">
            Crie listas de favoritos e acompanhe seu progresso musical
          </p>
        </div>

        <div className="classical-card-2 p-6 text-center">
          <div className="w-12 h-12 bg-accent-blue bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUsers className="w-6 h-6 text-accent-blue" />
          </div>
          <h4 className="font-semibold text-theme-primary mb-2">Conecte-se</h4>
          <p className="text-sm text-theme-secondary">
            Faça parte de uma comunidade apaixonada por música clássica
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeStep;
