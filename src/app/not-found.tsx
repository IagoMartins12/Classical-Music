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
import Footer from './components/Footer';
import { useTranslation } from '@/app/hooks/useTranslation';
import { useClientMetadata } from './hooks/useClientMetadata';

type AreaType = 'main' | 'teacher' | 'student' | 'admin';

export default function NotFound() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [currentArea, setCurrentArea] = useState<AreaType>('main');
  const [showAdminSidebar, setShowAdminSidebar] = useState(false);
  const { t, language } = useTranslation({ sections: ['pages/not-found'] });

  const metadataContent = {
    pt: {
      title: 'Página não encontrada - Opus Atlas | Erro 404',
      description:
        'A página que você está procurando não foi encontrada em nossa enciclopédia musical. Explore compositores, obras e partituras de música clássica.',
    },
    en: {
      title: 'Page not found - Opus Atlas | Error 404',
      description:
        'The page you are looking for was not found in our musical encyclopedia. Explore composers, works and classical music sheet music.',
    },
  };

  const metadata = metadataContent[language] || metadataContent.pt;

  // Usar o hook de metadata client-side
  useClientMetadata({
    title: metadata.title,
    description: metadata.description,
    noIndex: true, // Não indexar páginas 404
  });

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

              <div
                className={`flex w-full items-center justify-center relative overflow-hidden`}
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
                    <AnimatedItem direction="scale" springType="bouncy">
                      <div className="mb-8">
                        <Link
                          href={getHomeLink()}
                          className="inline-flex items-center group"
                        >
                          <GiGrandPiano className="w-12 h-12 mr-4 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
                          <div className="text-left">
                            <span className="text-2xl font-bold text-gradient-brand classical-title">
                              {t('not_found_jsx_span_children_0__opus_atlas')}
                            </span>
                            <div className="text-sm text-theme-tertiary">
                              {getAreaTitle()}
                            </div>
                          </div>
                        </Link>
                      </div>
                    </AnimatedItem>

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
                        {t('not_found_jsx_h1_children_0__page')}
                      </h1>
                    </AnimatedItem>

                    {/* Subtitle */}
                    <AnimatedItem direction="up" springType="smooth">
                      <p className="text-xl md:text-2xl text-theme-secondary mb-12 leading-relaxed max-w-2xl mx-auto">
                        {t('not_found_jsx_p_children_0__page')} {getAreaTitle()}{' '}
                        🎼
                        <br />
                        <span className="text-lg text-theme-tertiary mt-2 block">
                          {t(
                            'not_found_jsx_span_children_0__tal_explorar_outras'
                          )}
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
                    </AnimatedContainer>

                    {/* Quote */}
                    <AnimatedItem direction="up" springType="gentle">
                      <div className="p-6 classical-card-simple max-w-2xl mx-auto mb-8">
                        <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                          &quot;
                          {t('not_found_jsx_blockquote_children_0__music')}
                          &quot;
                        </blockquote>
                        <cite className="text-brand-primary font-semibold">
                          {t(
                            'not_found_jsx_cite_children_0__henry_wadsworth_longfellow'
                          )}
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
        return t('not_found_area_title_teacher');
      case 'student':
        return t('not_found_area_title_student');
      case 'admin':
        return t('not_found_area_title_admin');
      default:
        return t('not_found_area_title_main');
    }
  };

  const getContextualSuggestions = () => {
    switch (currentArea) {
      case 'teacher':
        return [
          {
            title: t('not_found_teacher_suggestions_0__title'),
            description: t('not_found_teacher_suggestions_0__description'),
            href: '/teacher',
            icon: FiUsers,
          },
          {
            title: t('not_found_teacher_suggestions_1__title'),
            description: t('not_found_teacher_suggestions_1__description'),
            href: '/teacher/students',
            icon: FiUsers,
          },
          {
            title: t('not_found_teacher_suggestions_2__title'),
            description: t('not_found_teacher_suggestions_2__description'),
            href: '/teacher/calendar',
            icon: FiBookOpen,
          },
        ];

      case 'student':
        return [
          {
            title: t('not_found_student_suggestions_0__title'),
            description: t('not_found_student_suggestions_0__description'),
            href: '/student',
            icon: FiHome,
          },
          {
            title: t('not_found_student_suggestions_1__title'),
            description: t('not_found_student_suggestions_1__description'),
            href: '/student/lessons',
            icon: FiBookOpen,
          },
          {
            title: t('not_found_student_suggestions_2__title'),
            description: t('not_found_student_suggestions_2__description'),
            href: '/student/progress',
            icon: FiMusic,
          },
        ];

      case 'admin':
        return [
          {
            title: t('not_found_admin_suggestions_0__title'),
            description: t('not_found_admin_suggestions_0__description'),
            href: '/admin',
            icon: FiHome,
          },
          {
            title: t('not_found_admin_suggestions_1__title'),
            description: t('not_found_admin_suggestions_1__description'),
            href: '/admin/users',
            icon: FiUsers,
          },
          {
            title: t('not_found_admin_suggestions_2__title'),
            description: t('not_found_admin_suggestions_2__description'),
            href: '/admin/composers',
            icon: FiMusic,
          },
        ];

      default:
        return [
          {
            title: t('not_found_main_suggestions_0__title'),
            description: t('not_found_main_suggestions_0__description'),
            href: '/composers',
            icon: FiUsers,
          },
          {
            title: t('not_found_main_suggestions_1__title'),
            description: t('not_found_main_suggestions_1__description'),
            href: '/music-history',
            icon: FiBookOpen,
          },
          {
            title: t('not_found_main_suggestions_2__title'),
            description: t('not_found_main_suggestions_2__description'),
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
      {currentArea !== 'admin' && (
        <>
          <div
            className={`classical-theme min-h-screen flex items-center justify-center relative overflow-hidden`}
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
                <AnimatedItem direction="scale" springType="bouncy">
                  <div className="mb-8">
                    <Link
                      href={getHomeLink()}
                      className="inline-flex items-center group"
                    >
                      <GiGrandPiano className="w-12 h-12 mr-4 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
                      <div className="text-left">
                        <span className="text-2xl font-bold text-gradient-brand classical-title">
                          {t('not_found_jsx_span_children_0__opus_atlas')}
                        </span>
                        <div className="text-sm text-theme-tertiary">
                          {getAreaTitle()}
                        </div>
                      </div>
                    </Link>
                  </div>
                </AnimatedItem>

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
                    {t('not_found_jsx_h1_children_0__page')}
                  </h1>
                </AnimatedItem>

                {/* Subtitle */}
                <AnimatedItem direction="up" springType="smooth">
                  <p className="text-xl md:text-2xl text-theme-secondary mb-12 leading-relaxed max-w-2xl mx-auto">
                    {t('not_found_jsx_p_children_0__page')} {getAreaTitle()} 🎼
                    <br />
                    <span className="text-lg text-theme-tertiary mt-2 block">
                      {t('not_found_jsx_span_children_0__tal_explorar_outras')}
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
                        <span>
                          {t('not_found_jsx_span_children_0__page_inicial')}
                        </span>
                      </Link>
                    </AnimatedItem>
                  )}
                </AnimatedContainer>

                {/* Quote */}
                <AnimatedItem direction="up" springType="gentle">
                  <div className="p-6 classical-card-simple max-w-2xl mx-auto mb-8">
                    <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                      &quot;{t('not_found_jsx_blockquote_children_0__music')}
                      &quot;
                    </blockquote>
                    <cite className="text-brand-primary font-semibold">
                      {t(
                        'not_found_jsx_cite_children_0__henry_wadsworth_longfellow'
                      )}
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
          <Footer />
        </>
      )}
    </>
  );
}
