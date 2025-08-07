// app/not-found.tsx - Página 404 inteligente com navegação contextual
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FiHome,
  FiMusic,
  FiUsers,
  FiBookOpen,
  FiCompass,
} from 'react-icons/fi';
import { GiMusicalNotes, GiGrandPiano } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from './components/animation/AnimatedComponents';
import AnimatedMusicalNotes from './components/AnimatedMusicalNotes';

// Importar navegações específicas
import TeacherNavigation from './components/TeacherSystem/TeacherNavigation';
import StudentNavigation from './components/TeacherSystem/StudentNavigation';
import Navbar from './components/Navbar';
import AdminHeader from './components/Admin/AdminHeader';
import AdminSidebar from './components/Admin/AdminSidebar';

type AreaType = 'main' | 'teacher' | 'student' | 'admin';

export default function NotFound() {
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
        return 'Opus Atlas';
    }
  };

  const getContextualSuggestions = () => {
    switch (currentArea) {
      case 'teacher':
        return [
          {
            title: 'Dashboard do Professor',
            description: 'Voltar ao painel principal',
            href: '/teacher',
            icon: FiUsers,
          },
          {
            title: 'Meus Alunos',
            description: 'Gerenciar alunos e aulas',
            href: '/teacher/students',
            icon: FiUsers,
          },
          {
            title: 'Calendário',
            description: 'Visualizar agenda de aulas',
            href: '/teacher/calendar',
            icon: FiBookOpen,
          },
        ];

      case 'student':
        return [
          {
            title: 'Meu Painel',
            description: 'Voltar ao dashboard',
            href: '/student',
            icon: FiHome,
          },
          {
            title: 'Minhas Aulas',
            description: 'Ver próximas aulas',
            href: '/student/lessons',
            icon: FiBookOpen,
          },
          {
            title: 'Meu Progresso',
            description: 'Acompanhar evolução',
            href: '/student/progress',
            icon: FiMusic,
          },
        ];

      case 'admin':
        return [
          {
            title: 'Painel Admin',
            description: 'Voltar ao dashboard',
            href: '/admin',
            icon: FiHome,
          },
          {
            title: 'Usuários',
            description: 'Gerenciar usuários',
            href: '/admin/users',
            icon: FiUsers,
          },
          {
            title: 'Conteúdo',
            description: 'Gerenciar compositores',
            href: '/admin/composers',
            icon: FiMusic,
          },
        ];

      default:
        return [
          {
            title: 'Compositores',
            description: 'Explore a vida e obras dos grandes mestres',
            href: '/composers',
            icon: FiUsers,
          },
          {
            title: 'História da Música',
            description: 'Descubra a evolução musical',
            href: '/music-history',
            icon: FiBookOpen,
          },
          {
            title: 'Instrumentos',
            description: 'Conheça os instrumentos clássicos',
            href: '/instruments',
            icon: FiMusic,
          },
        ];
    }
  };

  return (
    <>
      {/* Renderizar navegação apropriada */}
      {renderNavigation()}

      {/* Conteúdo principal da página 404 */}
      <div
        className={`classical-theme min-h-screen flex items-center justify-center relative overflow-hidden ${
          currentArea === 'admin' ? 'lg:ml-72' : ''
        }`}
      >
        {/* Background Pattern */}
        <AnimatedMusicalNotes />
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-purple/30 rounded-full blur-2xl"></div>
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
                      <div className="text-sm text-theme-tertiary">
                        {getAreaTitle()}
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedItem>
            )}

            {/* 404 Number */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="relative mb-8">
                <div className="text-9xl md:text-[12rem] font-bold text-gradient-brand classical-title leading-none opacity-90">
                  404
                </div>
              </div>
            </AnimatedItem>

            {/* Title */}
            <AnimatedItem direction="up" springType="bouncy">
              <h1 className="text-4xl md:text-5xl font-bold text-theme-primary classical-title mb-6">
                Página não encontrada
              </h1>
            </AnimatedItem>

            {/* Subtitle */}
            <AnimatedItem direction="up" springType="smooth">
              <p className="text-xl md:text-2xl text-theme-secondary mb-12 leading-relaxed max-w-2xl mx-auto">
                Esta página não existe em {getAreaTitle()} 🎼
                <br />
                <span className="text-lg text-theme-tertiary mt-2 block">
                  Que tal explorar outras seções?
                </span>
              </p>
            </AnimatedItem>

            {/* Contextual Navigation Cards */}
            <AnimatedContainer
              staggerSpeed="fast"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {getContextualSuggestions().map((suggestion, index) => (
                <AnimatedCard
                  key={index}
                  hover="lift"
                  className="classical-card p-6"
                >
                  <Link href={suggestion.href} className="block group">
                    <div className="w-16 h-16 bg-gradient-to-br from-brand-primary/20 to-brand-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
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
                  <span>{getAreaTitle()}</span>
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

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="p-6 classical-card-simple max-w-2xl mx-auto mb-8">
                <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                  &quot;A música é a linguagem universal da humanidade.&quot;
                </blockquote>
                <cite className="text-brand-primary font-semibold">
                  — Henry Wadsworth Longfellow
                </cite>
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 bg-accent-purple/10 rounded-2xl flex items-center justify-center opacity-40">
          <GiMusicalNotes className="w-6 h-6 text-accent-purple" />
        </div>

        <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
          <GiMusicalNotes className="w-8 h-8 text-brand-primary" />
        </div>
      </div>
    </>
  );
}
