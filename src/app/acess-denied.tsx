// app/access-denied/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  FiShield,
  FiHome,
  FiUsers,
  FiBookOpen,
  FiMail,
  FiUser,
  FiSettings,
} from 'react-icons/fi';
import { GiGraduateCap, GiGrandPiano, GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from './components/animation/AnimatedComponents';
import AnimatedMusicalNotes from './components/AnimatedMusicalNotes';
import Image from 'next/image';

interface SuggestionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export default function AccessDenied() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<SuggestionCard[]>([]);

  useEffect(() => {
    // Definir sugestões baseadas no role do usuário
    if (!session?.user) {
      setSuggestions([
        {
          title: 'Fazer Login',
          description: 'Entre com sua conta existente',
          href: '/api/auth/signin',
          icon: FiUser,
          color: 'from-brand-primary to-brand-secondary',
        },
        {
          title: 'Explorar Enciclopédia',
          description: 'Navegue pelo conteúdo público',
          href: '/composers',
          icon: FiBookOpen,
          color: 'from-accent-blue to-accent-purple',
        },
      ]);
    } else if (session.user.role === 0) {
      // Estudante tentando acessar área de professor/admin
      setSuggestions([
        {
          title: 'Área do Estudante',
          description: 'Acesse sua área personalizada',
          href: '/student',
          icon: GiGraduateCap,
          color: 'from-accent-green to-accent-blue',
        },
        {
          title: 'Solicitar Acesso Como Professor',
          description: 'Entre em contato para se tornar professor',
          href: '/contact',
          icon: FiMail,
          color: 'from-accent-purple to-accent-red',
        },
      ]);
    } else if (session.user.role === 1) {
      // Professor tentando acessar área de estudante/admin
      setSuggestions([
        {
          title: 'Área do Professor',
          description: 'Acesse sua área de ensino',
          href: '/teacher',
          icon: FiUsers,
          color: 'from-brand-primary to-brand-secondary',
        },
        {
          title: 'Explorar Enciclopédia',
          description: 'Navegue pelo conteúdo público',
          href: '/composers',
          icon: FiBookOpen,
          color: 'from-accent-blue to-accent-purple',
        },
      ]);
    } else {
      // Admin ou outros roles
      setSuggestions([
        {
          title: 'Área Administrativa',
          description: 'Acesse o painel de controle',
          href: '/admin',
          icon: FiSettings,
          color: 'from-accent-red to-accent-purple',
        },
        {
          title: 'Página Inicial',
          description: 'Voltar ao início',
          href: '/',
          icon: FiHome,
          color: 'from-brand-primary to-brand-secondary',
        },
      ]);
    }
  }, [session]);

  const getTitle = () => {
    if (!session?.user) {
      return 'Acesso Restrito';
    }

    if (session.user.role === 0) {
      return 'Área Restrita para Professores';
    }

    if (session.user.role === 1) {
      return 'Área Restrita para Estudantes';
    }

    return 'Acesso Negado';
  };

  const getDescription = () => {
    if (!session?.user) {
      return 'Você precisa estar logado para acessar esta área';
    }

    if (session.user.role === 0) {
      return 'Esta seção é exclusiva para professores cadastrados na plataforma';
    }

    if (session.user.role === 1) {
      return 'Esta seção é exclusiva para estudantes da plataforma';
    }

    return 'Você não tem permissão para acessar esta área';
  };

  const getUserDisplayName = () => {
    if (!session?.user) return '';

    if (session.user.firstName && session.user.lastName) {
      return `${session.user.firstName} ${session.user.lastName}`;
    }

    if (session.user.firstName) {
      return session.user.firstName;
    }

    if (session.user.email) {
      return session.user.email.split('@')[0];
    }

    return 'Usuário';
  };

  const getRoleLabel = () => {
    if (!session?.user) return '';

    switch (session.user.role) {
      case 0:
        return 'Estudante';
      case 1:
        return 'Professor';
      case 2:
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  return (
    <>
      <div className="classical-theme min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <AnimatedMusicalNotes />
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-red/30 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-blue/20 rounded-full blur-xl"></div>
        </div>

        <div className="section-wrap relative z-10">
          <AnimatedContainer
            staggerSpeed="normal"
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="mb-8">
                <Link href="/" className="inline-flex items-center group">
                  <GiGrandPiano className="w-12 h-12 mr-4 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
                  <div className="text-left">
                    <span className="text-2xl font-bold text-gradient-brand classical-title">
                      Opus Atlas
                    </span>
                    <div className="text-sm text-theme-tertiary">
                      Enciclopédia de Música Clássica
                    </div>
                  </div>
                </Link>
              </div>
            </AnimatedItem>

            {/* Shield Icon */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-red/20 to-accent-purple/20 rounded-full flex items-center justify-center classical-card border-2 border-accent-red/30 shadow-theme-glow">
                  <FiShield className="w-16 h-16 text-accent-red" />
                </div>
              </div>
            </AnimatedItem>

            {/* Title */}
            <AnimatedItem direction="up" springType="bouncy">
              <h1 className="text-4xl md:text-5xl font-bold text-theme-primary classical-title mb-6">
                {getTitle()}
              </h1>
            </AnimatedItem>

            {/* Description */}
            <AnimatedItem direction="up" springType="smooth">
              <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
                {getDescription()} 🎵
              </p>
            </AnimatedItem>

            {/* User Info Card */}
            {session?.user && (
              <AnimatedCard
                hover="lift"
                className="classical-card p-6 mb-8 max-w-md mx-auto"
              >
                <div className="flex items-center space-x-4">
                  {session.user.image ? (
                    <Image
                      width={20}
                      height={20}
                      src={session.user.image}
                      alt={getUserDisplayName()}
                      className="w-12 h-12 rounded-full object-cover border-2 border-brand-primary/20"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-brand-gradient rounded-full flex items-center justify-center text-theme-primary font-semibold">
                      {getUserDisplayName()[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <p className="font-medium text-theme-primary">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-sm text-theme-tertiary">
                      {session.user.email}
                    </p>
                    <span className="inline-block px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full mt-1">
                      {getRoleLabel()}
                    </span>
                  </div>
                </div>
              </AnimatedCard>
            )}

            {/* Suggestion Cards */}
            <AnimatedContainer
              staggerSpeed="fast"
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto"
            >
              {suggestions.map((suggestion, index) => (
                <AnimatedCard
                  key={index}
                  hover="lift"
                  className="classical-card p-6"
                >
                  <Link href={suggestion.href} className="block group">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${suggestion.color}/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <suggestion.icon className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title group-hover:text-brand-primary transition-colors">
                      {suggestion.title}
                    </h3>
                    <p className="text-theme-secondary text-sm leading-relaxed">
                      {suggestion.description}
                    </p>
                  </Link>
                </AnimatedCard>
              ))}
            </AnimatedContainer>

            {/* Action Buttons */}
            <AnimatedContainer
              staggerSpeed="fast"
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <AnimatedItem hover="scale" springType="bouncy">
                <Link
                  href="/"
                  className="btn-classical-primary flex items-center space-x-3 group text-lg px-8 py-4"
                >
                  <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Página Inicial</span>
                </Link>
              </AnimatedItem>

              <AnimatedItem hover="scale" springType="bouncy">
                <Link
                  href="/composers"
                  className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                >
                  <FiBookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Explorar Enciclopédia</span>
                </Link>
              </AnimatedItem>
            </AnimatedContainer>

            {/* Help Card */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-2xl mx-auto mb-8"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-accent-blue/20 to-accent-green/20 rounded-xl flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-accent-blue" />
                </div>
                <h3 className="text-xl font-bold text-theme-primary classical-title">
                  Precisa de Ajuda?
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                    <span className="text-theme-secondary">
                      Verifique suas permissões
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                    <span className="text-theme-secondary">
                      Entre em contato conosco
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                    <span className="text-theme-secondary">
                      Explore a enciclopédia
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                    <span className="text-theme-secondary">
                      Solicite acesso adequado
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-theme-secondary">
                <Link
                  href="/contact"
                  className="text-brand-primary hover:text-brand-secondary transition-colors font-medium"
                >
                  Entre em contato para solicitar acesso →
                </Link>
              </div>
            </AnimatedCard>

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="p-6 classical-card-simple max-w-2xl mx-auto">
                <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                  &quot;A música é a arte mais direta, ela entra pelo ouvido e
                  vai ao coração.&quot;
                </blockquote>
                <cite className="text-brand-primary font-semibold">
                  — Magdalena Martínez
                </cite>
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-accent-red/10 rounded-2xl flex items-center justify-center opacity-40">
          <FiShield className="w-6 h-6 text-accent-red" />
        </div>

        <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
          <GiMusicalNotes className="w-8 h-8 text-brand-primary" />
        </div>
      </div>
    </>
  );
}
