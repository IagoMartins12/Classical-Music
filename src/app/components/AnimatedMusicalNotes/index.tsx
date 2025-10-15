'use client';

import { FiMusic } from 'react-icons/fi';
import { GiGrandPiano, GiMusicalNotes, GiViolin } from 'react-icons/gi';
import { useEffect, useState } from 'react';

// Versão ultra-otimizada com apenas 2 elementos animados
const AnimatedMusicalNotes = () => {
  const [showAnimations, setShowAnimations] = useState(false);

  useEffect(() => {
    // Só animar após um delay para não interferir no carregamento inicial
    const timer = setTimeout(() => {
      setShowAnimations(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Verificar se user prefere animações reduzidas
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setShowAnimations(false);
    }
  }, []);

  if (!showAnimations) {
    return null; // Não renderizar nada se animações estão desabilitadas
  }

  return (
    <>
      {/* CSS inline minificado - apenas o essencial */}
      <style jsx>{`
        .float-slow {
          animation: floatSlow 12s ease-in-out infinite;
          will-change: transform;
        }

        .float-medium {
          animation: floatMedium 8s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes floatSlow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes floatMedium {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        /* Mobile: esconder para economizar recursos */
        @media (max-width: 768px) {
          .float-slow,
          .float-medium {
            display: none;
          }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .float-slow,
          .float-medium {
            animation: none !important;
          }
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {/* Apenas 2 elementos animados - máxima eficiência */}
        <div className="absolute top-16 left-16 text-4xl text-brand-primary/15 float-slow">
          <GiMusicalNotes />
        </div>

        <div
          className="absolute bottom-16 right-16 text-3xl text-accent-purple/15 float-medium"
          style={{ animationDelay: '2s' }}
        >
          <GiGrandPiano />
        </div>

        {/* Elementos estáticos - sem animação para economizar recursos */}
        <div className="absolute top-1/3 right-24 text-2xl text-accent-blue/10">
          <FiMusic />
        </div>

        <div className="absolute bottom-1/4 left-24 text-2xl text-brand-secondary/10">
          <GiViolin />
        </div>
      </div>
    </>
  );
};

export default AnimatedMusicalNotes;
