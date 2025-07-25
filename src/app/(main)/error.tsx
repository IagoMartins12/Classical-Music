// app/error.tsx
'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiAlertTriangle, FiHome, FiRefreshCw, FiMusic } from 'react-icons/fi';
import { GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '../components/AnimatedMusicalNotes';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log do erro para debugging
    console.error('Erro na aplicação:', error);
  }, [error]);

  return (
    <div className="classical-theme min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <AnimatedMusicalNotes />
      <div className="section-wrap relative z-10">
        <AnimatedContainer
          staggerSpeed="normal"
          className="max-w-4xl mx-auto text-center"
        >
          {/* Main Error Icon */}
          <AnimatedItem direction="scale" springType="bouncy">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-red/20 to-accent-purple/20 rounded-full flex items-center justify-center classical-card border-2 border-accent-red/30 shadow-theme-glow">
                <FiAlertTriangle className="w-16 h-16 text-accent-red" />
              </div>

              {/* Decorative Ring */}
            </div>
          </AnimatedItem>

          {/* Title */}
          <AnimatedItem direction="up" springType="bouncy">
            <h1 className="text-5xl md:text-6xl font-bold text-gradient-brand classical-title mb-6">
              Oops! Algo deu errado
            </h1>
          </AnimatedItem>

          {/* Subtitle */}
          <AnimatedItem direction="up" springType="smooth">
            <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed">
              A sinfonia encontrou uma nota fora do tom 🎵
            </p>
          </AnimatedItem>

          {/* Error Details */}
          {/* <AnimatedCard
            hover="lift"
            className="classical-card p-8 mb-8 max-w-2xl mx-auto"
          >
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-red/20 to-accent-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <FiHelpCircle className="w-6 h-6 text-accent-red" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-bold text-theme-primary mb-3 classical-title">
                  Detalhes do Erro
                </h3>
                <div className="space-y-2">
                  <p className="text-theme-secondary">
                    <strong className="text-brand-primary">Mensagem:</strong>{' '}
                    {error.message || 'Erro interno da aplicação'}
                  </p>
                  {error.digest && (
                    <p className="text-theme-tertiary text-sm">
                      <strong>ID do Erro:</strong> {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </AnimatedCard> */}

          {/* Action Buttons */}
          <AnimatedContainer
            staggerSpeed="fast"
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <AnimatedItem hover="scale" springType="bouncy">
              <button
                onClick={reset}
                className="btn-classical-primary flex items-center space-x-3 group text-lg px-8 py-4"
              >
                <FiRefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Tentar Novamente</span>
              </button>
            </AnimatedItem>

            <AnimatedItem hover="scale" springType="bouncy">
              <Link
                href="/"
                className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
              >
                <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Voltar ao Início</span>
              </Link>
            </AnimatedItem>
          </AnimatedContainer>

          {/* Helpful Tips */}
          <AnimatedCard
            hover="lift"
            className="classical-card p-6 max-w-3xl mx-auto"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-xl flex items-center justify-center">
                <FiMusic className="w-5 h-5 text-accent-blue" />
              </div>
              <h3 className="text-xl font-bold text-theme-primary classical-title">
                O que você pode fazer?
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary">
                    Recarregar a página
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary">
                    Verificar sua conexão
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary">
                    Tentar mais tarde
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  <span className="text-theme-secondary">
                    Explorar outros compositores
                  </span>
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Quote */}
          <AnimatedItem direction="up" springType="gentle">
            <div className="mt-12 p-6 classical-card-simple max-w-2xl mx-auto">
              <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                &quot;A música pode dar nome ao inominável e comunicar o
                desconhecido.&quot;
              </blockquote>
              <cite className="text-brand-primary font-semibold">
                — Leonard Bernstein
              </cite>
            </div>
          </AnimatedItem>
        </AnimatedContainer>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
        <GiMusicalNotes className="w-8 h-8 text-brand-primary" />
      </div>
    </div>
  );
}
