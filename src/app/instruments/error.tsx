// app/instruments/error.tsx
'use client';

import { useEffect } from 'react';
import { FaExclamationTriangle, FaSync, FaHome, FaMusic } from 'react-icons/fa';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function InstrumentsError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Instruments page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        {/* Error Icon Animation */}
        <div className="relative mb-8 opacity-0 animate-[fadeInScale_0.6s_ease-out_forwards]">
          <div className="w-32 h-32 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-red-500/30">
            <FaExclamationTriangle className="w-16 h-16 text-red-400" />
          </div>

          {/* Floating music notes around error */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-red-400/30 animate-pulse"
              style={{
                left: `${50 + 40 * Math.cos((i * 60 * Math.PI) / 180)}%`,
                top: `${50 + 40 * Math.sin((i * 60 * Math.PI) / 180)}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: '2s',
              }}
            >
              <FaMusic className="w-4 h-4" />
            </div>
          ))}
        </div>

        {/* Error Message */}
        <div className="opacity-0 animate-[fadeInUp_0.6s_ease-out_0.3s_forwards]">
          <h1 className="text-4xl font-bold text-white mb-4">
            Oops! Algo deu errado
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Tivemos um problema ao carregar os instrumentos musicais
          </p>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Não se preocupe! Nossa orquestra está afinando os sistemas. Tente
            novamente em alguns instantes.
          </p>
        </div>

        {/* Error Details (Developer Mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-8 text-left opacity-0 animate-[fadeIn_0.6s_ease-out_0.5s_forwards]">
            <h3 className="text-red-400 font-bold mb-2">
              Detalhes do Erro (Dev Mode):
            </h3>
            <pre className="text-gray-300 text-sm overflow-auto">
              {error.message}
            </pre>
            {error.digest && (
              <p className="text-gray-400 text-xs mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
          <button
            onClick={reset}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105"
          >
            <FaSync className="w-5 h-5" />
            <span>Tentar Novamente</span>
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 border border-white/20 hover:border-white/40"
          >
            <FaHome className="w-5 h-5" />
            <span>Voltar ao Início</span>
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center space-x-4 opacity-0 animate-[fadeIn_1s_ease-out_0.8s_forwards]">
          {['Piano', 'Violino', 'Violoncelo', 'Órgão'].map(
            (instrument, index) => (
              <div
                key={instrument}
                className="text-gray-600 text-sm animate-pulse"
                style={{
                  animationDelay: `${index * 0.5}s`,
                  animationDuration: '2s',
                }}
              >
                {instrument}
              </div>
            )
          )}
        </div>

        {/* Help Text */}
        <p className="text-gray-500 text-sm mt-8 opacity-0 animate-[fadeIn_1s_ease-out_1s_forwards]">
          Se o problema persistir, entre em contato com nossa equipe técnica
        </p>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8) rotate(-10deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
