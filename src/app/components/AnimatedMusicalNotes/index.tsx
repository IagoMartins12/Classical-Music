'use client';

import { FiBookOpen, FiMusic } from 'react-icons/fi';
import { GiGrandPiano, GiMusicalNotes, GiViolin } from 'react-icons/gi';

{
  /* Floating Icons */
}

const AnimatedMusicalNotes = () => {
  return (
    <div className="absolute hidden md:flex lg:flex  inset-0 pointer-events-none">
      <div className="absolute top-16 left-16 text-5xl text-brand-primary/20 animate-float">
        <GiMusicalNotes />
      </div>
      <div
        className="absolute bottom-16 right-16 text-4xl text-brand-secondary/20 animate-float"
        style={{ animationDelay: '1s' }}
      >
        <FiMusic />
      </div>
      <div
        className="absolute top-1/3 right-24 text-3xl text-accent-purple/20 animate-float"
        style={{ animationDelay: '2s' }}
      >
        <GiGrandPiano />
      </div>
      <div
        className="absolute bottom-1/4 left-24 text-3xl text-accent-blue/20 animate-float"
        style={{ animationDelay: '0.5s' }}
      >
        <GiViolin />
      </div>
      <div
        className="absolute top-1/2 left-8 text-2xl text-accent-green/20 animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <FiBookOpen />
      </div>
      <div
        className="absolute top-1/4 right-8 text-2xl text-brand-primary/15 animate-float"
        style={{ animationDelay: '2.5s' }}
      >
        <GiMusicalNotes />
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnimatedMusicalNotes;
