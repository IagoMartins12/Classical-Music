// app/composer/[composerId]/ComposerDetailsClient.tsx - Premium version with theme system
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ComposerDetails, ComposerWork } from '@/app/requests/composer-details';
import {
  FiCalendar,
  FiMapPin,
  FiUser,
  FiExternalLink,
  FiBookOpen,
  FiUsers,
  FiMusic,
  FiClock,
  FiTrendingUp,
  FiHeart,
  FiInfo,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import ComposerBiography from '../ComposerBiography';
import ComposerWorks from '../ComposersClient/ComposerWorks';

interface ComposerDetailsClientProps {
  composer: ComposerDetails;
  works: ComposerWork[];
}

export default function ComposerDetailsClient({
  composer,
  works,
}: ComposerDetailsClientProps) {
  const [imageError, setImageError] = useState(false);

  // Calcular idade e anos de vida
  const calculateLifeSpan = () => {
    if (!composer.birthDate && !composer.deathDate) return null;

    const birth = composer.birthDate ? new Date(composer.birthDate) : null;
    const death = composer.deathDate
      ? new Date(composer.deathDate)
      : new Date();

    if (birth && death) {
      const years = death.getFullYear() - birth.getFullYear();
      return years;
    }
    return null;
  };

  const lifeSpan = calculateLifeSpan();
  const secondaryRoles = composer.roleNames || [];

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-brand-secondary/20 rounded-full blur-2xl"></div>
      </div>

      <div className="section-wrap space-y-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-theme-tertiary mb-6 pt-4">
          <Link
            href="/composers"
            className="hover:text-brand-primary transition-colors duration-300 font-medium"
          >
            Compositores
          </Link>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-theme-primary font-medium">
            {composer.name}
          </span>
        </nav>

        {/* Header Principal */}
        <div className="classical-card overflow-hidden relative">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-6 left-12 text-5xl text-brand-primary/10 animate-float">
              <GiMusicalNotes />
            </div>
            <div
              className="absolute bottom-6 right-12 text-4xl text-brand-secondary/10 animate-float"
              style={{ animationDelay: '1s' }}
            >
              <FiMusic />
            </div>
            <div
              className="absolute top-12 right-24 text-3xl text-accent-purple/10 animate-float"
              style={{ animationDelay: '2s' }}
            >
              <GiGrandPiano />
            </div>
          </div>

          <div className="p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Informações do Compositor */}
              <div className="lg:col-span-2 space-y-6">
                {/* Nome e título */}
                <div className="space-y-3">
                  <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title">
                    {composer.name}
                  </h1>
                  {composer.fullName !== composer.name && (
                    <p className="text-xl text-theme-secondary classical-subtitle">
                      {composer.fullName}
                    </p>
                  )}
                </div>

                {/* Grid de informações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nascimento */}
                  {composer.birthDate && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiCalendar className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Nascimento
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {new Date(composer.birthDate).getFullYear() + 1}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Falecimento ou Idade */}
                  {composer.deathDate ? (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiCalendar className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Falecimento
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {new Date(composer.deathDate).getFullYear() + 1}
                          {lifeSpan && (
                            <span className="text-theme-secondary ml-2 text-sm">
                              ({lifeSpan} anos)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ) : (
                    composer.birthDate && (
                      <div className="flex items-start space-x-3 group">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                          <FiHeart className="w-4 h-4 text-theme-inverse" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-theme-tertiary">
                            Idade
                          </p>
                          <p className="text-theme-primary font-semibold">
                            {lifeSpan} anos
                            <span className="text-accent-green ml-2 text-sm">
                              (vivo)
                            </span>
                          </p>
                        </div>
                      </div>
                    )
                  )}

                  {/* Época */}
                  <div className="flex items-start space-x-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                      <FiMapPin className="w-4 h-4 text-theme-inverse" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-theme-tertiary">
                        Época
                      </p>
                      <p className="text-brand-primary font-semibold">
                        {composer.epochName}
                      </p>
                    </div>
                  </div>

                  {/* Papel Principal */}
                  {composer.primaryRoleName && (
                    <div className="flex items-start space-x-3 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <FiUser className="w-4 h-4 text-theme-inverse" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-theme-tertiary">
                          Papel Principal
                        </p>
                        <p className="text-theme-primary font-semibold">
                          {composer.primaryRoleName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Links Externos */}
                <div className="flex flex-wrap gap-3 pt-4">
                  {composer.wikipediaLink && (
                    <a
                      href={composer.wikipediaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-classical-primary flex items-center space-x-2 group/btn"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      <span>Wikipedia</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  )}

                  {composer.permLinkImslp && (
                    <a
                      href={composer.permLinkImslp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-classical-secondary flex items-center space-x-2 group/btn"
                    >
                      <FiBookOpen className="w-4 h-4" />
                      <span>IMSLP</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Imagem do Compositor */}
              <div className="flex justify-center lg:justify-end">
                <div className="relative group">
                  {composer.portraitUrl && !imageError ? (
                    <div className="relative w-64 h-80 rounded-2xl overflow-hidden shadow-theme-glow border border-theme-primary group-hover:scale-105 transition-all duration-500">
                      <Image
                        src={composer.portraitUrl}
                        alt={composer.name}
                        fill
                        sizes="256px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        priority
                        onError={() => setImageError(true)}
                      />
                      <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                    </div>
                  ) : (
                    <div className="w-64 h-80 bg-gradient-card border border-theme-primary rounded-2xl flex items-center justify-center shadow-theme-glow group-hover:scale-105 transition-all duration-500">
                      <div className="text-center text-theme-tertiary">
                        <FiUser className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Sem imagem disponível</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Papéis Secundários */}
        {secondaryRoles.length > 0 && (
          <div
            className="classical-card p-8 animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-2xl flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-theme-inverse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-theme-primary classical-title">
                  Papéis Secundários
                </h2>
                <p className="text-theme-secondary classical-subtitle">
                  Outras funções exercidas por {composer.name}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {secondaryRoles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/10 to-accent-purple/10 border border-accent-blue/30 rounded-full text-sm font-medium text-accent-blue shadow-theme-small hover:shadow-theme-medium transition-all duration-300 hover:scale-105 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-4 h-4 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mr-2 group-hover:scale-110 transition-transform duration-300">
                    <FiMusic className="w-2 h-2 text-theme-inverse" />
                  </div>
                  {role}
                </span>
              ))}
            </div>

            {secondaryRoles.length > 5 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-theme-elevated to-interactive-hover rounded-xl border border-theme-primary">
                <p className="text-sm text-theme-secondary">
                  <strong className="text-brand-primary">
                    {composer.name}
                  </strong>{' '}
                  exerceu{' '}
                  <strong className="text-accent-green">
                    {secondaryRoles.length} funções diferentes
                  </strong>{' '}
                  ao longo de sua carreira, demonstrando sua versatilidade no
                  mundo musical.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Biografia */}
        <div
          className="classical-card p-8 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-2xl flex items-center justify-center">
              <FiBookOpen className="w-6 h-6 text-theme-inverse" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Biografia
              </h2>
            </div>
            <div className="relative group">
              <div className="w-8 h-8 bg-interactive-hover rounded-full flex items-center justify-center cursor-help">
                <FiInfo className="w-4 h-4 text-theme-tertiary" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-theme-elevated border border-theme-primary text-theme-primary text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 shadow-theme-medium">
                Biografia gerada automaticamente por IA
                <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-theme-elevated"></div>
              </div>
            </div>
          </div>
          <ComposerBiography
            composerId={composer.id}
            initialBio={composer.bio}
            composerName={composer.name}
          />
        </div>

        {/* Estatísticas */}
        <div
          className="classical-card p-8 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-theme-inverse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-theme-primary classical-title">
                Estatísticas
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/30 rounded-2xl group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiBookOpen className="w-6 h-6 text-theme-inverse" />
              </div>
              <div className="text-3xl font-bold text-brand-primary mb-2">
                {composer.worksCount}
              </div>
              <div className="text-sm text-theme-secondary">
                Obras Catalogadas
              </div>
            </div>

            <div className="text-center p-6 bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border border-accent-purple/30 rounded-2xl group hover:scale-105 transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FiMapPin className="w-6 h-6 text-theme-inverse" />
              </div>
              <div className="text-3xl font-bold text-accent-purple mb-2">
                {composer.epochName}
              </div>
              <div className="text-sm text-theme-secondary">
                Período Musical
              </div>
            </div>

            {lifeSpan && (
              <div className="text-center p-6 bg-gradient-to-br from-accent-green/10 to-accent-blue/10 border border-accent-green/30 rounded-2xl group hover:scale-105 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <FiClock className="w-6 h-6 text-theme-inverse" />
                </div>
                <div className="text-3xl font-bold text-accent-green mb-2">
                  {lifeSpan}
                </div>
                <div className="text-sm text-theme-secondary">Anos de Vida</div>
              </div>
            )}
          </div>
        </div>

        {/* Obras do Compositor */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <ComposerWorks works={works} composerName={composer.name} />
        </div>
      </div>

      {/* Floating Elements */}
      <div className="fixed top-20 left-4 w-2 h-2 bg-brand-primary/30 rounded-full animate-pulse"></div>
      <div
        className="fixed top-40 right-8 w-1.5 h-1.5 bg-accent-purple/40 rounded-full animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="fixed bottom-32 left-8 w-1 h-1 bg-brand-secondary/50 rounded-full animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      {/* CSS for animations */}
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
}
