// app/not-found.tsx - Página 404 inteligente com navegação contextual
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/app/libs/session';
import Link from 'next/link';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCompass,
  PiFileText,
  PiHouse,
  PiMusicNotes,
  PiStack,
  PiUsers,
} from 'react-icons/pi';
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
import { BlogHeader } from './components/blog/BlogHeader';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

type AreaType = 'main' | 'teacher' | 'student' | 'blog' | 'admin';

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
    } else if (pathname.startsWith('/blog')) {
      setCurrentArea('blog');
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
      case 'blog':
        return <BlogHeader />;
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
                className={`lg:hidden fixed inset-y-0 left-0 z-dialogo w-72 bg-theme-elevated border-r border-theme-primary transform transition-transform duration-300 ease-in-out ${
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
                <div className="absolute inset-0 pointer-events-none opacity-5"></div>

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
                          <GiGrandPiano className="w-12 h-12 mr-4 text-ouro-texto icon-glow transition-all duration-300 group-hover:scale-110" />
                          <div className="text-left">
                            <span className="text-2xl font-bold text-gradient-brand classical-title">
                              {t('not_found_jsx_span_children_0__opus_atlas')}
                            </span>
                            <Text papel="rotulo" tom="fraco" as="div">
                              {getAreaTitle()}
                            </Text>
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
                      <p className="text-xl md:text-2xl text-theme-secondary mb-12 leading-relaxed medida-texto mx-auto">
                        {t('not_found_jsx_p_children_0__page')} {getAreaTitle()}{' '}
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
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                              <suggestion.icon className="w-8 h-8 text-ouro-texto" />
                            </div>
                            <h2 className="text-xl font-bold text-theme-primary mb-2 classical-title transition-colors">
                              {suggestion.title}
                            </h2>
                            <Text
                              papel="rotulo"
                              tom="suave"
                              as="p"
                              className="leading-relaxed"
                            >
                              {suggestion.description}
                            </Text>
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
                          <PiHouse className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                          <span>{getAreaTitle()}</span>
                        </Link>
                      </AnimatedItem>
                    </AnimatedContainer>

                    {/* Quote */}
                    <AnimatedItem direction="up" springType="gentle">
                      <Card nivel={2} className="max-w-2xl mx-auto mb-8">
                        <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                          &quot;
                          {t('not_found_jsx_blockquote_children_0__music')}
                          &quot;
                        </blockquote>
                        <cite className="text-ouro-texto font-semibold">
                          {t(
                            'not_found_jsx_cite_children_0__henry_wadsworth_longfellow'
                          )}
                        </cite>
                      </Card>
                    </AnimatedItem>
                  </AnimatedContainer>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center opacity-40">
                  <PiMusicNotes className="w-6 h-6" />
                </div>

                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-3xl flex items-center justify-center opacity-50">
                  <PiMusicNotes className="w-8 h-8 text-ouro-texto" />
                </div>
              </div>
              {/* Mobile Overlay */}
              {showAdminSidebar && (
                <div
                  className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-menu"
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
      case 'blog':
        return '/blog';
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
      case 'blog':
        return t('not_found_area_title_blog');
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
            icon: PiUsers,
          },
          {
            title: t('not_found_teacher_suggestions_1__title'),
            description: t('not_found_teacher_suggestions_1__description'),
            href: '/teacher/students',
            icon: PiUsers,
          },
          {
            title: t('not_found_teacher_suggestions_2__title'),
            description: t('not_found_teacher_suggestions_2__description'),
            href: '/teacher/calendar',
            icon: PiBookOpen,
          },
        ];

      case 'student':
        return [
          {
            title: t('not_found_student_suggestions_0__title'),
            description: t('not_found_student_suggestions_0__description'),
            href: '/student',
            icon: PiHouse,
          },
          {
            title: t('not_found_student_suggestions_1__title'),
            description: t('not_found_student_suggestions_1__description'),
            href: '/student/lessons',
            icon: PiBookOpen,
          },
          {
            title: t('not_found_student_suggestions_2__title'),
            description: t('not_found_student_suggestions_2__description'),
            href: '/student/progress',
            icon: PiMusicNotes,
          },
        ];

      case 'admin':
        return [
          {
            title: t('not_found_admin_suggestions_0__title'),
            description: t('not_found_admin_suggestions_0__description'),
            href: '/admin',
            icon: PiHouse,
          },
          {
            title: t('not_found_admin_suggestions_1__title'),
            description: t('not_found_admin_suggestions_1__description'),
            href: '/admin/users',
            icon: PiUsers,
          },
          {
            title: t('not_found_admin_suggestions_2__title'),
            description: t('not_found_admin_suggestions_2__description'),
            href: '/admin/composers',
            icon: PiMusicNotes,
          },
        ];

      case 'blog':
        return [
          {
            title: t('not_found_blog_suggestions_0__title'),
            description: t('not_found_blog_suggestions_0__description'),
            href: '/blog/articles',
            icon: PiFileText,
          },
          {
            title: t('not_found_blog_suggestions_1__title'),
            description: t('not_found_blog_suggestions_1__description'),
            href: '/blog/category',
            icon: PiStack,
          },
          {
            title: t('not_found_blog_suggestions_2__title'),
            description: t('not_found_blog_suggestions_2__description'),
            href: '/blog',
            icon: PiHouse,
          },
        ];

      default:
        return [
          {
            title: t('not_found_main_suggestions_0__title'),
            description: t('not_found_main_suggestions_0__description'),
            href: '/composers',
            icon: PiUsers,
          },
          {
            title: t('not_found_main_suggestions_1__title'),
            description: t('not_found_main_suggestions_1__description'),
            href: '/music-history',
            icon: PiBookOpen,
          },
          {
            title: t('not_found_main_suggestions_2__title'),
            description: t('not_found_main_suggestions_2__description'),
            href: '/instruments',
            icon: PiMusicNotes,
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
          <main
            className={`classical-theme min-h-screen flex items-center justify-center relative overflow-hidden`}
          >
            {/* Background Pattern */}
            <AnimatedMusicalNotes />
            <div className="absolute inset-0 pointer-events-none opacity-5"></div>

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
                      <GiGrandPiano className="w-12 h-12 mr-4 text-ouro-texto icon-glow transition-all duration-300 group-hover:scale-110" />
                      <div className="text-left">
                        <span className="text-2xl font-bold text-gradient-brand classical-title">
                          {t('not_found_jsx_span_children_0__opus_atlas')}
                        </span>
                        <Text papel="rotulo" tom="fraco" as="div">
                          {getAreaTitle()}
                        </Text>
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
                  <p className="text-xl md:text-2xl text-theme-secondary mb-12 leading-relaxed medida-texto mx-auto">
                    {t('not_found_jsx_p_children_0__page')} {getAreaTitle()}{' '}
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
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                          <suggestion.icon className="w-8 h-8 text-ouro-texto" />
                        </div>
                        <h2 className="text-xl font-bold text-theme-primary mb-2 classical-title transition-colors">
                          {suggestion.title}
                        </h2>
                        <Text
                          papel="rotulo"
                          tom="suave"
                          as="p"
                          className="leading-relaxed"
                        >
                          {suggestion.description}
                        </Text>
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
                      <PiHouse className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>{getAreaTitle()}</span>
                    </Link>
                  </AnimatedItem>

                  {currentArea !== 'main' && (
                    <AnimatedItem hover="scale" springType="bouncy">
                      <Link
                        href="/"
                        className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                      >
                        <PiCompass className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                        <span>
                          {t('not_found_jsx_span_children_0__page_inicial')}
                        </span>
                      </Link>
                    </AnimatedItem>
                  )}
                </AnimatedContainer>

                {/* Quote */}
                <AnimatedItem direction="up" springType="gentle">
                  <Card nivel={2} className="max-w-2xl mx-auto mb-8">
                    <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                      &quot;{t('not_found_jsx_blockquote_children_0__music')}
                      &quot;
                    </blockquote>
                    <cite className="text-ouro-texto font-semibold">
                      {t(
                        'not_found_jsx_cite_children_0__henry_wadsworth_longfellow'
                      )}
                    </cite>
                  </Card>
                </AnimatedItem>
              </AnimatedContainer>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center opacity-40">
              <PiMusicNotes className="w-6 h-6" />
            </div>

            <div className="absolute bottom-4 right-4 w-16 h-16 rounded-3xl flex items-center justify-center opacity-50">
              <PiMusicNotes className="w-8 h-8 text-ouro-texto" />
            </div>
          </main>
          <Footer />
        </>
      )}
    </>
  );
}
