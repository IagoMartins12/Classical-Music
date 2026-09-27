// app/access-denied/page.tsx - Página de acesso negado inteligente com navegação contextual
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from '@/app/libs/session';
import Link from 'next/link';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookOpen,
  PiCompass,
  PiEnvelopeSimple,
  PiGear,
  PiHouse,
  PiLock,
  PiMusicNotes,
  PiPianoKeys,
  PiShield,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
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
import Image from '@/app/components/SmartImage';
import { useTranslation } from '../context/TranslationContext';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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
  const { t } = useTranslation({ sections: ['pages/access-denied'] });

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
                className={`lg:hidden fixed inset-y-0 left-0 z-dialogo w-72 bg-theme-elevated border-r border-theme-primary transform transition-transform duration-300 ease-in-out ${
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
      case 'admin':
        return '/admin';
      default:
        return '/';
    }
  };

  const getAreaTitle = () => {
    switch (currentArea) {
      case 'teacher':
        return t('acess_denied_area_title_teacher');
      case 'student':
        return t('acess_denied_area_title_student');
      case 'admin':
        return t('acess_denied_area_title_admin');
      default:
        return t('acess_denied_area_title_main');
    }
  };

  const getContextualTitle = () => {
    if (!session?.user) {
      return t('acess_denied_contextual_title_no_session');
    }

    const userRole = session.user.role;

    switch (currentArea) {
      case 'teacher':
        if (userRole === 0)
          return t('acess_denied_contextual_title_teacher_student');
        if (userRole === 2)
          return t('acess_denied_contextual_title_teacher_admin');
        return t('acess_denied_contextual_title_teacher_default');

      case 'student':
        if (userRole === 1)
          return t('acess_denied_contextual_title_student_teacher');
        if (userRole === 2)
          return t('acess_denied_contextual_title_student_admin');
        return t('acess_denied_contextual_title_student_default');

      case 'admin':
        if (userRole < 2) return t('acess_denied_contextual_title_admin_user');
        return t('acess_denied_contextual_title_admin_default');

      default:
        return t('acess_denied_contextual_title_default');
    }
  };

  const getContextualDescription = () => {
    if (!session?.user) {
      return `${t(
        'acess_denied_contextual_description_no_session'
      )} ${getAreaTitle()}`;
    }

    const userRole = session.user.role;

    switch (currentArea) {
      case 'teacher':
        if (userRole === 0)
          return t('acess_denied_contextual_description_teacher_student');
        if (userRole === 2)
          return t('acess_denied_contextual_description_teacher_admin');
        return t('acess_denied_contextual_description_teacher_default');

      case 'student':
        if (userRole === 1)
          return t('acess_denied_contextual_description_student_teacher');
        if (userRole === 2)
          return t('acess_denied_contextual_description_student_admin');
        return t('acess_denied_contextual_description_student_default');

      case 'admin':
        if (userRole < 2)
          return t('acess_denied_contextual_description_admin_user');
        return t('acess_denied_contextual_description_admin_default');

      default:
        return `${t(
          'acess_denied_contextual_description_default'
        )} ${getAreaTitle()}`;
    }
  };

  const getContextualSuggestions = (): SuggestionCard[] => {
    if (!session?.user) {
      return [
        {
          title: t('acess_denied_suggestion_fazer_login'),
          description: t('acess_denied_suggestion_fazer_login_desc'),
          href: '/login',
          icon: PiUser,
          color: '',
        },
        {
          title: t('acess_denied_suggestion_explorar_enciclopedia'),
          description: t('acess_denied_suggestion_explorar_enciclopedia_desc'),
          href: '/composers',
          icon: PiBookOpen,
          color: '',
        },
        {
          title: t('acess_denied_suggestion_pagina_inicial'),
          description: t('acess_denied_suggestion_pagina_inicial_desc'),
          href: '/',
          icon: PiHouse,
          color: '',
        },
      ];
    }

    const userRole = session.user.role;
    const suggestions: SuggestionCard[] = [];

    // Sugestões baseadas no role do usuário
    switch (userRole) {
      case 0: // Estudante
        suggestions.push({
          title: t('acess_denied_suggestion_explorar_pecas'),
          description: t('acess_denied_suggestion_explorar_pecas_desc'),
          href: '/student',
          icon: PiPianoKeys,
          color: '',
        });

        if (currentArea === 'teacher') {
          suggestions.push({
            title: t('acess_denied_suggestion_solicitar_acesso_professor'),
            description: t(
              'acess_denied_suggestion_solicitar_acesso_professor_desc'
            ),
            href: '/contact',
            icon: PiEnvelopeSimple,
            color: '',
          });
        }
        break;

      case 1: // Professor
        suggestions.push({
          title: t('acess_denied_suggestion_area_professor'),
          description: t('acess_denied_suggestion_area_professor_desc'),
          href: '/teacher',
          icon: PiUsers,
          color: '',
        });

        if (currentArea === 'admin') {
          suggestions.push({
            title: t('acess_denied_suggestion_solicitar_acesso_admin'),
            description: t(
              'acess_denied_suggestion_solicitar_acesso_admin_desc'
            ),
            href: '/contact',
            icon: PiEnvelopeSimple,
            color: '',
          });
        }
        break;

      case 2: // Admin
        suggestions.push({
          title: t('acess_denied_suggestion_painel_admin'),
          description: t('acess_denied_suggestion_painel_admin_desc'),
          href: '/admin',
          icon: PiGear,
          color: '',
        });
        break;
    }

    // Sugestões comuns
    suggestions.push({
      title: t('acess_denied_suggestion_explorar_enciclopedia'),
      description: t('acess_denied_suggestion_explorar_enciclopedia_desc'),
      href: '/composers',
      icon: PiBookOpen,
      color: '',
    });

    if (currentArea !== 'main') {
      suggestions.push({
        title: t('acess_denied_suggestion_pagina_inicial'),
        description: t('acess_denied_suggestion_pagina_inicial_desc'),
        href: '/',
        icon: PiHouse,
        color: '',
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

    return t('acess_denied_user_default');
  };

  const getRoleLabel = () => {
    if (!session?.user) return '';

    switch (session.user.role) {
      case 1:
        return t('acess_denied_role_teacher');
      case 2:
        return t('acess_denied_role_admin');
      default:
        return t('acess_denied_role_user');
    }
  };

  const getIconColor = () => {
    switch (currentArea) {
      case 'teacher':
        return 'text-ouro-texto';
      case 'student':
        return '';
      case 'admin':
        return '';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Renderizar navegação apropriada */}
      {renderNavigation()}

      {/* Conteúdo principal da página de acesso negado */}
      <main
        className={`classical-theme min-h-screen flex items-center justify-center relative overflow-hidden ${
          currentArea === 'admin' ? 'lg:ml-72' : ''
        }`}
      >
        {/* Background Pattern */}
        <AnimatedMusicalNotes />
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-32 w-48 h-48 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full blur-xl"></div>
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
                    <GiGrandPiano className="w-12 h-12 mr-4 text-ouro-texto icon-glow transition-all duration-300 group-hover:scale-110" />
                    <div className="text-left">
                      <span className="text-2xl font-bold text-gradient-brand classical-title">
                        {t('acess_denied_jsx_span_children_0__opus_atlas')}
                      </span>
                    </div>
                  </Link>
                </div>
              </AnimatedItem>
            )}

            {/* Shield Icon */}
            <AnimatedItem direction="scale" springType="bouncy">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center classical-card border-2 shadow-theme-glow">
                  <PiLock className={`w-16 h-16 ${getIconColor()}`} />
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
              <p className="text-xl md:text-2xl text-theme-secondary mb-8 leading-relaxed medida-texto mx-auto">
                {getContextualDescription()}{' '}
              </p>
            </AnimatedItem>

            {/* User Info Card */}
            {session?.user && (
              <AnimatedCard
                hover="lift"
                className="classical-card p-6 mb-8 max-w-md mx-auto"
              >
                <Inline gap={4}>
                  {session.user.image ? (
                    <Image
                      width={20}
                      height={20}
                      src={session.user.image}
                      alt={getUserDisplayName()}
                      className="w-12 h-12 rounded-full object-cover border-2"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-theme-primary font-semibold">
                      {getUserDisplayName()[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="text-left flex-1">
                    <p className="font-medium text-theme-primary">
                      {getUserDisplayName()}
                    </p>
                    <Text papel="rotulo" tom="fraco" as="p">
                      {session.user.email}
                    </Text>
                    <Text
                      papel="legenda"
                      tom="ouro"
                      className="inline-block px-2 py-1 rounded-full mt-1"
                    >
                      {getRoleLabel()}
                    </Text>
                  </div>
                </Inline>
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
                  <span>
                    {t('acess_denied_jsx_span_children_0__voltar')}{' '}
                    {getAreaTitle()}
                  </span>
                </Link>
              </AnimatedItem>

              {currentArea !== 'main' && (
                <AnimatedItem hover="scale" springType="bouncy">
                  <Link
                    href="/"
                    className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                  >
                    <PiCompass className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span>{t('acess_denied_jsx_span_children_0__page')}</span>
                  </Link>
                </AnimatedItem>
              )}
            </AnimatedContainer>

            {/* Help Card */}
            <AnimatedCard
              hover="lift"
              className="classical-card p-6 max-w-2xl mx-auto mb-8"
            >
              <Inline gap={3} className="mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center">
                  <PiEnvelopeSimple className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-theme-primary classical-title">
                  {t('acess_denied_jsx_h3_children_0__precisa_ajuda')}
                </h2>
              </Inline>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <Stack gap={2}>
                  <Inline gap={2}>
                    <div className="w-2 h-2 rounded-full"></div>
                    <span className="text-theme-secondary">
                      {t(
                        'acess_denied_jsx_span_children_0__verifique_suas_permissões'
                      )}
                    </span>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 rounded-full"></div>
                    <span className="text-theme-secondary">
                      {t(
                        'acess_denied_jsx_span_children_0__entre_contato_conosco'
                      )}
                    </span>
                  </Inline>
                </Stack>
                <Stack gap={2}>
                  <Inline gap={2}>
                    <div className="w-2 h-2 rounded-full"></div>
                    <span className="text-theme-secondary">
                      {t(
                        'acess_denied_jsx_span_children_0__explore_enciclopédia'
                      )}
                    </span>
                  </Inline>
                  <Inline gap={2}>
                    <div className="w-2 h-2 rounded-full"></div>
                    <span className="text-theme-secondary">
                      {t(
                        'acess_denied_jsx_span_children_0__solicite_acesso_adequado'
                      )}
                    </span>
                  </Inline>
                </Stack>
              </div>

              <div className="mt-6 pt-4 border-t border-theme-secondary">
                <Link
                  href="/contact"
                  className="text-ouro-texto transition-colors font-medium"
                >
                  {t(
                    'acess_denied_jsx_link_children_0__entre_contato_solicitar'
                  )}
                </Link>
              </div>
            </AnimatedCard>

            {/* Quote */}
            <AnimatedItem direction="up" springType="gentle">
              <Card nivel={2} className="max-w-2xl mx-auto">
                <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                  &quot;{t('acess_denied_jsx_blockquote_children_0__music')}
                  &quot;
                </blockquote>
                <cite className="text-ouro-texto font-semibold">
                  {t('acess_denied_jsx_cite_children_0__magdalena_martínez')}
                </cite>
              </Card>
            </AnimatedItem>
          </AnimatedContainer>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center opacity-40">
          <PiShield className="w-6 h-6" />
        </div>

        <div className="absolute bottom-4 right-4 w-16 h-16 rounded-3xl flex items-center justify-center opacity-50">
          <PiMusicNotes className="w-8 h-8 text-ouro-texto" />
        </div>
      </main>
    </>
  );
}
