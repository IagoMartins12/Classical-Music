'use client';

import { GiGrandPiano } from 'react-icons/gi';
import { PiBookOpen, PiHeadphones, PiMusicNotes } from 'react-icons/pi';

{
  /* Floating Icons */
}

const AnimatedMusicalNotesClient = () => {
  return (
    <div className="absolute  flex lg:flex  inset-0 pointer-events-none">
      <div className="absolute top-6 left-12 text-5xl animate-float">
        <PiMusicNotes />
      </div>
      <div
        className="absolute bottom-6 right-12 text-4xl animate-float"
        style={{ animationDelay: '1s' }}
      >
        <PiMusicNotes />
      </div>
      <div
        className="absolute top-12 right-24 text-3xl animate-float"
        style={{ animationDelay: '2s' }}
      >
        <GiGrandPiano />
      </div>
      <div
        className="absolute bottom-6 sm:bottom-12 left-24 text-3xl animate-float"
        style={{ animationDelay: '0.5s' }}
      >
        <PiHeadphones />
      </div>
      <div
        className="absolute hidden sm:flex top-1/2 left-8 text-2xl animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <PiBookOpen />
      </div>
      <div
        className="absolute top-1/3 right-8 text-2xl animate-float"
        style={{ animationDelay: '2.5s' }}
      >
        <PiMusicNotes />
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

export default AnimatedMusicalNotesClient;
