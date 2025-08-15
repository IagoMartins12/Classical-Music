// app/access-denied/page.tsx - Página de acesso negado inteligente com navegação contextual
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FiShield,
  FiHome,
  FiUsers,
  FiBookOpen,
  FiMail,
  FiUser,
  FiSettings,
  FiCompass,
  FiLock,
} from 'react-icons/fi';
import { GiGrandPiano, GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '../components/AnimatedMusicalNotes';

// Importar navegações específicas
import TeacherNavigation from '../components/TeacherSystem/TeacherNavigation';
import StudentNavigation from '../components/TeacherSystem/StudentNavigation';
import Navbar from '../components/Navbar';
import AdminHeader from '../components/Admin/AdminHeader';
import AdminSidebar from '../components/Admin/AdminSidebar';
import Image from 'next/image';
import { LuPiano } from 'react-icons/lu';

interface SuggestionCard {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

type AreaType = 'main' | 'teacher' | 'student' | 'admin';

export default function AccessDenied() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [currentArea, setCurrentArea] = useState<AreaType>('main');
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);

  // Detectar área atual baseada na URL
  useEffect(() => {
    if (pathname.startsWith('/teacher')) {
      setCurrentArea('teacher');
    } else if (pathname.startsWith('/student')) {
      setCurrentArea('student');
    } else if (pathname.startsWith('/admin')) {
      setCurrentArea('admin');
    } else {
      setCurrentArea('main');
    }
  }, [pathname]);

  const renderNavigation = () => {
    switch (currentArea) {
      case 'teacher':
        return session?.user ? <TeacherNavigation user={session.user} /> : null;

      case 'student':
        return session?.user ? <StudentNavigation user={session.user} /> : null;

      case 'admin':
        return (
          <>
            <AdminHeader onMenuClick={() => setShowAdminSidebar(true)} />
            <div className="flex">
              {/* Desktop Sidebar */}
              <div className="hidden lg:block">
                <AdminSidebar />
              </div>

              {/* Mobile Sidebar */}
              <div
                className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-theme-elevated border-r border-theme-primary transform transition-transform duration-300 ease-in-out ${
                  showAdminSidebar ? 'translate-x-0' : '-translate-x-full'
                }`}
                style={{ top: '80px' }}
              >
                <div className="h-full overflow-y-auto">
                  <AdminSidebar />
                </div>
              </div>

              {/* Mobile Overlay */}
              {showAdminSidebar && (
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                  style={{ top: '80px' }}
                  onClick={() => setShowAdminSidebar(false)}
                />
              )}
            </div>
          </>
        );

      case 'main':
      default:
        return <Navbar />;
    }
  };

  const getHomeLink = () => {
    switch (currentArea) {
      case 'teacher':
        return '/teacher';
      case 'student':
        return '/student';
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const getAreaTitle = () => {
    switch (currentArea) {
      case 'teacher':
        return 'Área do Professor';
      case 'student':
        return 'Área do Estudante';
      case 'admin':
        return 'Painel Administrativo';
      default:
        return 'esta pagina.';
    }
  };

  const getContextualTitle = () => {
    if (!session?.user) {
      return `Acesso Restrito`;
    }

    const userRole = session.user.role;

    switch (currentArea) {
      case 'teacher':
        if (userRole === 0) return 'Área Restrita para Professores';
        if (userRole === 2) return 'Área Específica para Professores';
        return 'Acesso Restrito';

      case 'student':
        if (userRole === 1) return 'Área Restrita para Estudantes';
        if (userRole === 2) return 'Área Específica para Estudantes';
        return 'Acesso Restrito';

      case 'admin':
        if (userRole < 2) return 'Área Administrativa Restrita';
        return 'Acesso Negado';

      default:
        return `Acesso Restrito `;
    }
  };

  const getContextualDescription = () => {
    if (!session?.user) {
      return `Você precisa estar logado para acessar ${getAreaTitle()}`;
    }

    const userRole = session.user.role;

    switch (currentArea) {
      case 'teacher':
        if (userRole === 0)
          return 'Esta seção é exclusiva para professores cadastrados na plataforma';
        if (userRole === 2)
          return 'Esta é uma área específica para professores, não para administradores';
        return 'Você não tem permissão para acessar a área de professores';

      case 'student':
        if (userRole === 1)
          return 'Esta seção é exclusiva para estudantes da plataforma';
        if (userRole === 2)
          return 'Esta é uma área específica para estudantes, não para administradores';
        return 'Você não tem permissão para acessar a área de estudantes';

      case 'admin':
        if (userRole < 2)
          return 'Esta área é restrita apenas para administradores do sistema';
        return 'Você não tem as permissões necessárias para esta área administrativa';

      default:
        return `Você não tem permissão para acessar ${getAreaTitle()}`;
    }
  };

  const getContextualSuggestions = (): SuggestionCard[] => {
    if (!session?.user) {
      return [
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
        {
          title: 'Página Inicial',
          description: 'Voltar ao início',
          href: '/',
          icon: FiHome,
          color: 'from-accent-green to-accent-blue',
        },
      ];
    }

    const userRole = session.user.role;
    const suggestions: SuggestionCard[] = [];

    // Sugestões baseadas no role do usuário
    switch (userRole) {
      case 0: // Estudante
        suggestions.push({
          title: 'Explorar peças ',
          description: 'Navegue pelo nosso conteúdo de peças',
          href: '/student',
          icon: LuPiano,
          color: 'from-accent-green to-accent-blue',
        });

        if (currentArea === 'teacher') {
          suggestions.push({
            title: 'Solicitar Acesso Como Professor',
            description: 'Entre em contato para se tornar professor',
            href: '/contact',
            icon: FiMail,
            color: 'from-accent-purple to-accent-red',
          });
        }
        break;

      case 1: // Professor
        suggestions.push({
          title: 'Área do Professor',
          description: 'Acesse sua área de ensino',
          href: '/teacher',
          icon: FiUsers,
          color: 'from-brand-primary to-brand-secondary',
        });

        if (currentArea === 'admin') {
          suggestions.push({
            title: 'Solicitar Acesso Administrativo',
            description: 'Entre em contato para permissões de admin',
            href: '/contact',
            icon: FiMail,
            color: 'from-accent-red to-accent-purple',
          });
        }
        break;

      case 2: // Admin
        suggestions.push({
          title: 'Painel Administrativo',
          description: 'Acesse o painel de controle',
          href: '/admin',
          icon: FiSettings,
          color: 'from-accent-red to-accent-purple',
        });
        break;
    }

    // Sugestões comuns
    suggestions.push({
      title: 'Explorar Enciclopédia',
      description: 'Navegue pelo conteúdo público',
      href: '/composers',
      icon: FiBookOpen,
      color: 'from-accent-blue to-accent-purple',
    });

    if (currentArea !== 'main') {
      suggestions.push({
        title: 'Página Inicial',
        description: 'Voltar ao início',
        href: '/',
        icon: FiHome,
        color: 'from-accent-green to-accent-blue',
      });
    }

    return suggestions.slice(0, 3); // Limitar a 3 sugestões
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
      case 1:
        return 'Professor';
      case 2:
        return 'Administrador';
      default:
        return 'Usuário';
    }
  };

  const getIconColor = () => {
    switch (currentArea) {
      case 'teacher':
        return 'text-brand-primary';
      case 'student':
        return 'text-accent-green';
      case 'admin':
        return 'text-accent-red';
      default:
        return 'text-accent-purple';
    }
  };

  return (
    <>
      {/* Renderizar navegação apropriada */}
      {renderNavigation()}

      {/* Conteúdo principal da página de acesso negado */}
      <div
        className={`classical-theme min-h-screen flex items-center justify-center relative overflow-hidden ${
          currentArea === 'admin' ? 'lg:ml-72' : ''
        }`}
      >
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
            {/* Logo (apenas se não for admin) */}
            {currentArea !== 'admin' && (
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="mb-8">
                  <Link
                    href={getHomeLink()}
                    className="inline-flex items-center group"
                  >
                    <GiGrandPiano className="w-12 h-12 mr-4 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
                    <div className="text-left">
                      <span className="text-2xl font-bold text-gradient-brand classical-title">
                        Opus Atlas
                      </span>
                    </div>
                  </Link>
                </div>
              </AnimatedItem>
            )}

            {/* Shield Icon */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-red/20 to-accent-purple/20 rounded-full flex items-center justify-center classical-card border-2 border-accent-red/30 shadow-theme-glow">
                  <FiLock className={`w-16 h-16 ${getIconColor()}`} />
                </div>
              </div>
            </AnimatedItem>

            {/* Title */}
            <AnimatedItem direction="up" springType="bouncy">
              <h1 className="text-4xl md:text-5xl font-bold text-theme-primary classical-title mb-6">
                {getContextualTitle()}
              </h1>
            </AnimatedItem>

            {/* Description */}
            <AnimatedItem direction="up" springType="smooth">
              <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
                {getContextualDescription()} 🔒
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

            {/* Contextual Suggestion Cards */}
            <AnimatedContainer
              staggerSpeed="fast"
              className={`grid grid-cols-1 md:grid-cols-2 ${
                getContextualSuggestions().length > 2
                  ? 'lg:grid-cols-3'
                  : 'lg:grid-cols-2'
              }  gap-6 mb-12`}
            >
              {getContextualSuggestions().map((suggestion, index) => (
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
                  href={getHomeLink()}
                  className="btn-classical-primary flex items-center space-x-3 group text-lg px-8 py-4"
                >
                  <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Voltar ao {getAreaTitle()}</span>
                </Link>
              </AnimatedItem>

              {currentArea !== 'main' && (
                <AnimatedItem hover="scale" springType="bouncy">
                  <Link
                    href="/"
                    className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                  >
                    <FiCompass className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>Página Inicial</span>
                  </Link>
                </AnimatedItem>
              )}
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
