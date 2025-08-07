// app/error.tsx - Página de erro inteligente com navegação contextual
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiAlertTriangle, FiHome, FiRefreshCw, FiMusic } from 'react-icons/fi';
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

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

type AreaType = 'main' | 'teacher' | 'student' | 'admin';

export default function Error({ error, reset }: ErrorProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [currentArea, setCurrentArea] = useState<AreaType>('main');
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);

  useEffect(() => {
    console.error('Erro na aplicação:', error);
  }, [error]);

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

  return (
    <>
      {/* Renderizar navegação apropriada */}
      {renderNavigation()}

      {/* Conteúdo principal da página de erro */}
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
                      <div className="text-sm text-theme-tertiary">
                        {getAreaTitle()}
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedItem>
            )}

            {/* Error Icon */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-accent-red/20 to-accent-purple/20 rounded-full flex items-center justify-center classical-card border-2 border-accent-red/30 shadow-theme-glow">
                  <FiAlertTriangle className="w-16 h-16 text-accent-red" />
                </div>
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
                  href={getHomeLink()}
                  className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                >
                  <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>Voltar ao {getAreaTitle()}</span>
                </Link>
              </AnimatedItem>
            </AnimatedContainer>

            {/* Helpful Tips */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-3xl mx-auto mb-8"
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
                      Voltar à página anterior
                    </span>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <div className="p-6 classical-card-simple max-w-2xl mx-auto">
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
    </>
  );
}
