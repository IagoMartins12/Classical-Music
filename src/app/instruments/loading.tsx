'use client';

import { FaMusic, FaGuitar, FaUsers } from 'react-icons/fa';
import { GiViolin, GiGrandPiano, GiHarp, GiPipeOrgan } from 'react-icons/gi';
import { LuPiano } from 'react-icons/lu';

const instruments = [
  { icon: GiGrandPiano, name: 'Piano', delay: 0 },
  { icon: GiViolin, name: 'Violoncelo', delay: 150 },
  { icon: FaGuitar, name: 'Violino', delay: 300 },
  { icon: GiPipeOrgan, name: 'Órgão', delay: 450 },
  { icon: FaUsers, name: 'Orquestra', delay: 600 },
  { icon: GiHarp, name: 'Harpa', delay: 750 },
  { icon: LuPiano, name: 'Clavicórdio', delay: 900 },
];

export default function InstrumentsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 flex items-center justify-center">
      <div className="text-center">
        {/* Main Loading Animation */}
        <div className="relative mb-12 mx-auto w-fit animate-pulse">
          <div className="w-40 h-40 border-4 border-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-24 h-24 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center animate-spin shadow-2xl">
              <FaMusic className="w-12 h-12 text-gray-900" />
            </div>
          </div>

          {/* Spinning Border */}
          <div
            className="absolute inset-0 w-40 h-40 border-4 border-transparent border-t-amber-400 border-r-amber-400/50 rounded-full animate-spin"
            style={{ animationDuration: '3s' }}
          />

          {/* Inner spinning ring */}
          <div
            className="absolute inset-4 w-32 h-32 border-2 border-transparent border-b-yellow-300 border-l-yellow-300/50 rounded-full animate-spin"
            style={{ animationDuration: '2s', animationDirection: 'reverse' }}
          />
        </div>

        {/* Loading Text */}
        <div className="opacity-0 animate-[fadeIn_1.2s_ease-out_0.5s_forwards]">
          <h2 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
            Carregando História Musical
          </h2>
          <p className="text-gray-300 mb-12 text-lg">
            Preparando séculos de evolução musical para você...
          </p>
        </div>

        {/* Instrument Icons Animation */}
        <div className="flex flex-wrap justify-center gap-6 max-w-2xl mx-auto mb-12">
          {instruments.map((instrument, index) => {
            const Icon = instrument.icon;
            return (
              <div
                key={instrument.name}
                className="flex flex-col items-center opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards] group"
                style={{ animationDelay: `${1 + instrument.delay / 1000}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-slate-700/60 to-slate-800/60 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 border border-amber-500/20 group-hover:border-amber-400/60 transition-all duration-500 group-hover:scale-110 shadow-lg">
                  <Icon
                    className="w-8 h-8 text-amber-400 animate-pulse group-hover:text-amber-300 transition-colors"
                    style={{ animationDuration: '2s' }}
                  />
                </div>
                <span className="text-sm text-gray-400 group-hover:text-amber-300 transition-colors font-medium">
                  {instrument.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Loading Progress Bar */}
        <div className="w-80 mx-auto mb-8 opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards]">
          <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-600/30">
            <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-[loadingProgress_3s_ease-in-out_infinite] shadow-lg" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Sincronizando dados históricos...
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-3">
          {[0, 1, 2, 3].map((dot) => (
            <div
              key={dot}
              className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full animate-pulse shadow-lg"
              style={{
                animationDelay: `${dot * 0.3}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>

        {/* Floating Musical Notes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-amber-400/10 text-4xl animate-[float_6s_ease-in-out_infinite]"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + i * 10}%`,
                animationDelay: `${i * 1.2}s`,
              }}
            >
              ♪
            </div>
          ))}
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loadingProgress {
          0% {
            width: 0%;
            transform: translateX(-100%);
          }
          50% {
            width: 70%;
            transform: translateX(0%);
          }
          100% {
            width: 100%;
            transform: translateX(0%);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.1;
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-10px) rotate(-3deg);
            opacity: 0.2;
          }
          75% {
            transform: translateY(-15px) rotate(2deg);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}
