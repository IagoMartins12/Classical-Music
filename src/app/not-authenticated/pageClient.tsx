// app/not-authenticated/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  FiLock,
  FiHome,
  FiUsers,
  FiBookOpen,
  FiUser,
  FiUserPlus,
  FiMail,
  FiMusic,
  FiCompass,
} from 'react-icons/fi';
import { GiGraduateCap, GiGrandPiano, GiMusicalNotes } from 'react-icons/gi';
import {
  AnimatedContainer,
  AnimatedCard,
  AnimatedItem,
} from '../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '../components/AnimatedMusicalNotes';
import { useLoginModal, useRegisterModal } from '../stores/authStore';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useTranslation } from '../context/TranslationContext';

interface SuggestionCard {
  title: string;
  description: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action?: () => void;
}

type AreaType = 'main' | 'teacher' | 'student' | 'admin';

export default function NotAuthenticated() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { open: openLogin } = useLoginModal();
  const { open: openRegister } = useRegisterModal();
  const [currentArea, setCurrentArea] = useState<AreaType>('main');
  const [suggestions, setSuggestions] = useState<SuggestionCard[]>([]);
  const { t } = useTranslation({ sections: ['pages/not-authenticated'] });

  // Redirecionar usuários autenticados
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const callbackUrl = searchParams.get('callbackUrl') || '/';
      router.push(callbackUrl);
    }
  }, [isAuthenticated, isLoading, searchParams, router]);

  // Detectar área atual e URL de retorno
  useEffect(() => {
    const callbackUrl = searchParams.get('callbackUrl') || pathname;

    if (callbackUrl.startsWith('/teacher')) {
      setCurrentArea('teacher');
    } else if (callbackUrl.startsWith('/student')) {
      setCurrentArea('student');
    } else if (callbackUrl.startsWith('/admin')) {
      setCurrentArea('admin');
    } else {
      setCurrentArea('main');
    }
  }, [pathname, searchParams]);

  // Definir sugestões baseadas na área tentada
  useEffect(() => {
    let areaSuggestions: SuggestionCard[] = [];

    switch (currentArea) {
      case 'teacher':
        areaSuggestions = [
          {
            title: t('not_authenticated_suggestion_login_teacher'),
            description: t('not_authenticated_suggestion_login_teacher_desc'),
            icon: FiUser,
            color: 'from-brand-primary to-brand-secondary',
            action: () => openLogin(),
          },
          {
            title: t('not_authenticated_suggestion_request_teacher'),
            description: t('not_authenticated_suggestion_request_teacher_desc'),
            href: '/contact',
            icon: FiMail,
            color: 'from-accent-purple to-accent-blue',
          },
          {
            title: t('not_authenticated_suggestion_explore_encyclopedia'),
            description: t(
              'not_authenticated_suggestion_explore_encyclopedia_desc'
            ),
            href: '/composers',
            icon: FiBookOpen,
            color: 'from-accent-green to-accent-blue',
          },
        ];
        break;

      case 'student':
        areaSuggestions = [
          {
            title: t('not_authenticated_suggestion_login_student'),
            description: t('not_authenticated_suggestion_login_student_desc'),
            icon: FiUser,
            color: 'from-accent-green to-accent-blue',
            action: () => openLogin(),
          },
          {
            title: t('not_authenticated_suggestion_create_student'),
            description: t('not_authenticated_suggestion_create_student_desc'),
            icon: FiUserPlus,
            color: 'from-brand-primary to-brand-secondary',
            action: () => openRegister(),
          },
          {
            title: t('not_authenticated_suggestion_know_platform'),
            description: t('not_authenticated_suggestion_know_platform_desc'),
            href: '/about-us',
            icon: FiCompass,
            color: 'from-accent-purple to-accent-red',
          },
        ];
        break;

      case 'admin':
        areaSuggestions = [
          {
            title: t('not_authenticated_suggestion_admin_login'),
            description: t('not_authenticated_suggestion_admin_login_desc'),
            icon: FiUser,
            color: 'from-accent-red to-accent-purple',
            action: () => openLogin(),
          },
          {
            title: t('not_authenticated_suggestion_home'),
            description: t('not_authenticated_suggestion_home_desc'),
            href: '/',
            icon: FiHome,
            color: 'from-brand-primary to-brand-secondary',
          },
        ];
        break;

      default:
        areaSuggestions = [
          {
            title: t('not_authenticated_suggestion_login'),
            description: t('not_authenticated_suggestion_login_desc'),
            icon: FiUser,
            color: 'from-brand-primary to-brand-secondary',
            action: () => openLogin(),
          },
          {
            title: t('not_authenticated_suggestion_create_free'),
            description: t('not_authenticated_suggestion_create_free_desc'),
            icon: FiUserPlus,
            color: 'from-accent-green to-accent-blue',
            action: () => openRegister(),
          },
          {
            title: t('not_authenticated_suggestion_explore_public'),
            description: t('not_authenticated_suggestion_explore_public_desc'),
            href: '/composers',
            icon: FiBookOpen,
            color: 'from-accent-purple to-accent-blue',
          },
        ];
    }

    setSuggestions(areaSuggestions);
  }, [currentArea, openLogin, openRegister, t]);

  const getTitle = () => {
    switch (currentArea) {
      case 'teacher':
        return t('not_authenticated_area_title_teacher');
      case 'student':
        return t('not_authenticated_area_title_student');
      case 'admin':
        return t('not_authenticated_area_title_admin');
      default:
        return t('not_authenticated_area_title_main');
    }
  };

  const getDescription = () => {
    switch (currentArea) {
      case 'teacher':
        return t('not_authenticated_description_teacher');
      case 'student':
        return t('not_authenticated_description_student');
      case 'admin':
        return t('not_authenticated_description_admin');
      default:
        return t('not_authenticated_description_main');
    }
  };

  const getBenefits = () => {
    switch (currentArea) {
      case 'teacher':
        return [
          t('not_authenticated_benefit_teacher_0'),
          t('not_authenticated_benefit_teacher_1'),
          t('not_authenticated_benefit_teacher_2'),
          t('not_authenticated_benefit_teacher_3'),
        ];
      case 'student':
        return [
          t('not_authenticated_benefit_student_0'),
          t('not_authenticated_benefit_student_1'),
          t('not_authenticated_benefit_student_2'),
          t('not_authenticated_benefit_student_3'),
        ];
      case 'admin':
        return [
          t('not_authenticated_benefit_admin_0'),
          t('not_authenticated_benefit_admin_1'),
          t('not_authenticated_benefit_admin_2'),
          t('not_authenticated_benefit_admin_3'),
        ];
      default:
        return [
          t('not_authenticated_benefit_main_0'),
          t('not_authenticated_benefit_main_1'),
          t('not_authenticated_benefit_main_2'),
          t('not_authenticated_benefit_main_3'),
        ];
    }
  };

  return (
    <>
      <Navbar />

      {/* Evitar renderizar se estiver carregando ou se o usuário estiver autenticado */}
      {isAuthenticated ? (
        <div className="classical-theme min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-theme-secondary">
              {t('not_authenticated_jsx_span_children_0__redirecionando')}
            </span>
          </div>
        </div>
      ) : (
        <div className="classical-theme min-h-screen flex items-center justify-center relative overflow-hidden">
          {/* Background Pattern */}
          <AnimatedMusicalNotes />
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="absolute top-20 left-20 w-64 h-64 bg-brand-gradient rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-32 w-48 h-48 bg-accent-blue/30 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent-purple/20 rounded-full blur-xl"></div>
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
                        {t('not_authenticated_jsx_span_children_0__opus_atlas')}
                      </span>
                      <div className="text-sm text-theme-tertiary">
                        {t('not_authenticated_jsx_div_children_0__music')}
                      </div>
                    </div>
                  </Link>
                </div>
              </AnimatedItem>

              {/* Lock Icon */}
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-brand-primary/20 to-accent-blue/20 rounded-full flex items-center justify-center classical-card border-2 border-brand-primary/30 shadow-theme-glow">
                    <FiLock className="w-16 h-16 text-brand-primary" />
                  </div>
                </div>
              </AnimatedItem>

              {/* Title */}
              <AnimatedItem direction="up" springType="bouncy">
                <h1 className="text-4xl md:text-5xl font-bold text-theme-primary classical-title mb-6">
                  {t('not_authenticated_jsx_h1_children_0__acesso_requerido')}
                </h1>
              </AnimatedItem>

              {/* Subtitle */}
              <AnimatedItem direction="up" springType="smooth">
                <div className="mb-8">
                  <p className="text-xl md:text-2xl text-theme-secondary mb-4 leading-relaxed max-w-2xl mx-auto">
                    {getDescription()} 🎼
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-brand-primary/10 rounded-full text-brand-primary font-medium">
                    <FiMusic className="w-4 h-4 mr-2" />
                    {getTitle()}
                  </div>
                </div>
              </AnimatedItem>

              {/* Main Action Cards */}
              <AnimatedContainer
                staggerSpeed="fast"
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <AnimatedCard
                    key={index}
                    hover="lift"
                    className="classical-card p-6"
                  >
                    {suggestion.href ? (
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
                    ) : (
                      <button
                        onClick={suggestion.action}
                        className="block w-full group"
                      >
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
                      </button>
                    )}
                  </AnimatedCard>
                ))}
              </AnimatedContainer>

              {/* Benefits Section */}
              <AnimatedCard
                hover="lift"
                className="classical-card p-8 max-w-3xl mx-auto mb-12"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-green/20 to-accent-blue/20 rounded-xl flex items-center justify-center">
                    {currentArea === 'teacher' ? (
                      <FiUsers className="w-6 h-6 text-accent-green" />
                    ) : currentArea === 'student' ? (
                      <GiGraduateCap className="w-6 h-6 text-accent-blue" />
                    ) : (
                      <FiMusic className="w-6 h-6 text-brand-primary" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-theme-primary classical-title">
                    {t('not_authenticated_jsx_h3_children_0__terá_acesso')}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  {getBenefits().map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-brand-primary rounded-full flex-shrink-0"></div>
                      <span className="text-theme-secondary">{benefit}</span>
                    </div>
                  ))}
                </div>

                {currentArea !== 'admin' && (
                  <div className="mt-8 pt-6 border-t border-theme-secondary">
                    <p className="text-theme-tertiary text-sm mb-4">
                      {t('not_authenticated_jsx_p_children_0__não_tem_conta')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={() => openLogin()}
                        className="btn-classical-secondary text-sm px-6 py-2"
                      >
                        {t(
                          'not_authenticated_jsx_button_children_0__fazer_login'
                        )}
                      </button>
                      <button
                        onClick={() => openRegister()}
                        className="btn-classical-primary text-sm px-6 py-2"
                      >
                        {t('not_authenticated_jsx_button_children_0__create')}
                      </button>
                    </div>
                  </div>
                )}
              </AnimatedCard>

              {/* Navigation Links */}
              <AnimatedContainer
                staggerSpeed="fast"
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <AnimatedItem hover="scale" springType="bouncy">
                  <Link
                    href="/"
                    className="btn-classical-secondary flex items-center space-x-3 group text-lg px-8 py-4"
                  >
                    <FiHome className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>
                      {t('not_authenticated_jsx_span_children_0__page')}
                    </span>
                  </Link>
                </AnimatedItem>

                <AnimatedItem hover="scale" springType="bouncy">
                  <Link
                    href="/composers"
                    className="btn-classical-primary flex items-center space-x-3 group text-lg px-8 py-4"
                  >
                    <FiBookOpen className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>
                      {t(
                        'not_authenticated_jsx_span_children_0__explorar_enciclopédia'
                      )}
                    </span>
                  </Link>
                </AnimatedItem>
              </AnimatedContainer>

              {/* Quote */}
              <AnimatedItem direction="up" springType="gentle">
                <div className="p-6 classical-card-simple max-w-2xl mx-auto">
                  <blockquote className="text-lg text-theme-secondary italic mb-4 leading-relaxed">
                    &quot;
                    {t('not_authenticated_jsx_blockquote_children_0__music')}
                    &quot;
                  </blockquote>
                  <cite className="text-brand-primary font-semibold">
                    {t(
                      'not_authenticated_jsx_cite_children_0__ludwig_van_beethoven'
                    )}
                  </cite>
                </div>
              </AnimatedItem>
            </AnimatedContainer>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center opacity-40">
            <FiLock className="w-6 h-6 text-brand-primary" />
          </div>

          <div className="absolute bottom-4 right-4 w-16 h-16 bg-brand-gradient/10 rounded-3xl flex items-center justify-center opacity-50">
            <GiMusicalNotes className="w-8 h-8 text-brand-primary" />
          </div>

          <div className="absolute top-1/3 right-8 w-8 h-8 bg-accent-blue/10 rounded-xl flex items-center justify-center opacity-30">
            <GiMusicalNotes className="w-4 h-4 text-accent-blue" />
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
