'use client';

import { FaExclamationTriangle, FaRedo } from 'react-icons/fa';
import { GiMusicalNotes } from 'react-icons/gi';
const ErrorFallback = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className=" bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="mb-6">
          <div className="relative">
            <GiMusicalNotes className="text-6xl text-gray-300 mx-auto mb-4" />
            <div className="absolute top-0 right-1/2 transform translate-x-6 -translate-y-1">
              <FaExclamationTriangle className="text-2xl text-amber-500" />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Oops! Algo deu errado
        </h2>

        <p className="text-gray-600 mb-6 leading-relaxed">
          Não foi possível carregar as informações sobre a história da música
          clássica. Isso pode ser um problema temporário de conexão.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <FaRedo className="text-sm" />
            <span>Tentar novamente</span>
          </button>

          <p className="text-sm text-gray-500">
            Se o problema persistir, tente recarregar a página ou volte mais
            tarde.
          </p>
        </div>

        {/* Decorative elements */}
        <div className="mt-8 flex justify-center space-x-2 opacity-50">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
