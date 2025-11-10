// components/Navbar.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHeart,
  FiBookOpen,
  FiFile,
  FiUpload,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiShield,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import { ThemeToggle } from '../ThemeToggle';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/hooks/useAuth';
import {
  useAuthStore,
  useLoginModal,
  useOnboardingModal,
  useRegisterModal,
} from '@/app/stores/authStore';
import Button from '../Common/Button';
import Image from 'next/image';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { useRouter } from 'next/navigation';
import { FaGraduationCap } from 'react-icons/fa';
import { LanguageToggle } from '../LanguageToggle';
import { useTranslation } from '@/app/context/TranslationContext';

interface NavItem {
  label: string;
  href?: string;
  active?: boolean;
  submenu?: Array<{
    label: string;
    href: string;
    description?: string;
  }>;
}

type MobileMenuView = 'main' | 'profile' | 'submenu';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileMenuView>('main');
  const [activeSubmenuItems, setActiveSubmenuItems] = useState<
    Array<{ label: string; href: string }>
  >([]);
  const [submenuTitle, setSubmenuTitle] = useState('');

  const pathname = usePathname();

  const { logout: authLogout } = useAuthStore();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { reset } = useLearningStore();
  const { reset: resetFavorite } = useFavoritesStore();
  const { open: openLogin } = useLoginModal();
  const { open: openRegister } = useRegisterModal();
  const { open } = useOnboardingModal();

  const { t } = useTranslation({ sections: ['navbar'] });

  // Refs para detectar cliques fora dos menus
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openMobileMenu = () => {
    setIsMenuOpen(true);
    setMobileView('main');
    setActiveSubmenuItems([]);
    setSubmenuTitle('');
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setMobileView('main');
    setActiveSubmenuItems([]);
    setSubmenuTitle('');
  };

  const handleMobileButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const goToProfileView = () => {
    setMobileView('profile');
  };

  const goToSubmenuView = (
    title: string,
    items: Array<{ label: string; href: string }>
  ) => {
    setSubmenuTitle(title);
    setActiveSubmenuItems(items);
    setMobileView('submenu');
  };

  const goBackToMain = () => {
    setMobileView('main');
    setActiveSubmenuItems([]);
    setSubmenuTitle('');
  };

  const { refresh } = useRouter();

  const handleLogout = async () => {
    try {
      resetFavorite();
      logout();
      reset();
      authLogout();
      await signOut({ redirect: false });
      toast.success('Logout realizado com sucesso!');
      setIsProfileOpen(false);
      closeMobileMenu();
      refresh();
    } catch {
      toast.error('Erro ao fazer logout');
    }
  };

  // Função para verificar se um path está ativo
  const isPathActive = (href: string, submenuPaths?: string[]): boolean => {
    if (pathname === href) return true;
    if (submenuPaths) {
      return submenuPaths.some((path) => pathname === path);
    }
    return false;
  };

  const optionsArr: NavItem[] = [
    {
      label: t('navbar_historia'),
      href: '/music-history',
      active: isPathActive('/music-history'),
    },
    // {
    //   label: t('navbar_instrumentos'),
    //   href: '/instruments',
    //   active: isPathActive('/instruments'),
    // },
    {
      label: t('navbar_compositores'),
      href: '/composers',
      active: isPathActive('/composers'),
    },
    {
      label: t('navbar_obras'),
      href: '/works',
      active: isPathActive('/works', ['/works', '/genres']),
      submenu: [
        {
          label: t('navbar_todas_as_obras'),
          href: '/works',
          description: t('navbar_todas_as_obras_subtitle'),
        },
        {
          label: t('navbar_categorias'),
          href: '/genres',
          description: t('navbar_categorias_subtitle'),
        },
      ],
    },
    {
      label: t('navbar_quem_somos'),
      href: '/about-us',
      active: isPathActive('/about-us'),
    },
    {
      label: 'Blog',
      href: '/blog',
      active: isPathActive('/blog'),
    },
  ];

  const getUserDisplayName = () => {
    if (!user) return '';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user.firstName) {
      return user.firstName;
    }

    if (user.email) {
      return user.email.split('@')[0];
    }

    return 'Usuário';
  };

  const getUserInitials = () => {
    if (!user) return '';

    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }

    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }

    if (user.email) {
      return user.email[0].toUpperCase();
    }

    return 'U';
  };

  const handleMouseEnter = (label: string) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current);
    }
    setActiveSubmenu(label);
  };

  const handleMouseLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
    }, 150);
  };

  const handleMobileNavClick = () => {
    closeMobileMenu();
  };

  // Effect para fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;

      // Fechar menu de perfil se clicar fora
      if (
        profileRef.current &&
        !profileRef.current.contains(target) &&
        isProfileOpen
      ) {
        setIsProfileOpen(false);
      }

      // Fechar menu mobile se clicar fora (mas não no botão do menu)
      if (
        mobileMenuRef.current &&
        mobileButtonRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !mobileButtonRef.current.contains(target) &&
        isMenuOpen
      ) {
        closeMobileMenu();
      }
    };

    // Adicionar listener apenas se algum menu estiver aberto
    if (isProfileOpen || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, [isProfileOpen, isMenuOpen]);

  // Effect adicional para fechar menu com tecla ESC
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMenuOpen) {
          closeMobileMenu();
        }
        if (isProfileOpen) setIsProfileOpen(false);
        if (activeSubmenu) setActiveSubmenu(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isMenuOpen, isProfileOpen, activeSubmenu]);

  return (
    <nav className="navbar-classical sticky top-0 z-50">
      <div className="section-wrap-nav pt-1 pb-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative block">
              <GiGrandPiano className="w-8 h-8 mr-3 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl gold-shine font-bold text-gradient-brand classical-title">
              Opus Atlas
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {optionsArr.map(({ label, href, active, submenu }, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => submenu && handleMouseEnter(label)}
                onMouseLeave={() => submenu && handleMouseLeave()}
              >
                {submenu ? (
                  <div className="flex items-center">
                    <Link
                      href={href || '#'}
                      className={`
                        relative px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-1
                        ${
                          active
                            ? 'text-brand-primary bg-interactive-active'
                            : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                        }
                        after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 
                        after:bg-brand-gradient after:transition-all after:duration-300
                        hover:after:w-full hover:after:left-0
                        ${active ? 'after:w-full after:left-0' : ''}
                      `}
                    >
                      <span>{label}</span>
                      <FiChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeSubmenu === label ? 'rotate-180' : ''
                        }`}
                      />
                    </Link>

                    {/* Submenu */}
                    {activeSubmenu === label && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-theme-tertiary rounded-2xl shadow-xl border border-theme-secondary z-50 overflow-hidden">
                        <div className="p-2">
                          {submenu.map((item, index) => (
                            <Link
                              key={index}
                              href={item.href}
                              className={`
                                block p-3 rounded-lg transition-colors group
                                ${
                                  pathname === item.href
                                    ? 'bg-interactive-active text-brand-primary'
                                    : 'hover:bg-interactive-hover'
                                }
                              `}
                              onClick={() => setActiveSubmenu(null)}
                            >
                              <div
                                className={`
                                font-medium transition-colors
                                ${
                                  pathname === item.href
                                    ? 'text-brand-primary'
                                    : 'text-theme-primary group-hover:text-brand-primary'
                                }
                              `}
                              >
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-xs text-theme-tertiary mt-1">
                                  {item.description}
                                </div>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={href || '#'}
                    className={`
                      relative px-3 py-2 rounded-lg font-medium transition-all duration-300
                      
                      ${
                        active
                          ? 'text-brand-primary bg-interactive-active'
                          : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                      }
                      after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 
                      after:bg-brand-gradient after:transition-all after:duration-300
                      hover:after:w-full hover:after:left-0
                      ${active ? 'after:w-full after:left-0' : ''}
                    `}
                  >
                    {label === 'Blog' ? (
                      <span className="gold-shine">Blog</span>
                    ) : (
                      label
                    )}{' '}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle - Desktop only */}
            <LanguageToggle variant="compact" className="hidden sm:block" />
            <ThemeToggle variant="navbar" className="hidden sm:block" />

            {/* Authentication Section - Desktop only */}
            {isLoading ? null : isAuthenticated && user ? (
              /* Desktop User Menu */
              <div className="relative hidden lg:block" ref={profileRef}>
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-interactive-hover transition-colors"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      width={24}
                      height={24}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-brand-primary bg-theme-secondary"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center bg-theme-secondary justify-center text-theme-primary text-sm font-semibold">
                      {getUserInitials()}
                    </div>
                  )}

                  <div className="text-left">
                    <p className="text-sm font-medium text-theme-primary truncate max-w-32">
                      {getUserDisplayName()}
                    </p>
                    {!user.onboardingCompleted && (
                      <p className="text-xs text-accent-amber">
                        {t('navbar_configure_seu_perfil')}
                      </p>
                    )}
                  </div>
                </button>

                {/* Desktop Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-theme-tertiary rounded-2xl z-20 p-2 shadow-xl border border-theme-secondary">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-theme-secondary mb-2">
                      <p className="font-medium text-theme-primary">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-sm text-theme-tertiary">
                        {user.email}
                      </p>
                      {!user.onboardingCompleted && (
                        <div
                          className="classical-card py-2 px-2 text-xs text-center text-brand-primary my-4 cursor-pointer"
                          onClick={open}
                        >
                          {t('navbar_clique_aqui_completar')}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    {user.onboardingCompleted && (
                      <Link
                        href="/profile"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/profile'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiUser className="w-4 h-4" />
                        <span>{t('navbar_link_meu_perfil')}</span>
                      </Link>
                    )}

                    <Link
                      href="/favorites"
                      className={`
                        flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                        ${
                          pathname === '/favorites'
                            ? 'text-brand-primary bg-interactive-active'
                            : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                        }
                      `}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiHeart className="w-4 h-4" />
                      <span>{t('navbar_link_favoritos')}</span>
                    </Link>

                    <Link
                      href="/learning"
                      className={`
                        flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                        ${
                          pathname === '/learning'
                            ? 'text-brand-primary bg-interactive-active'
                            : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                        }
                      `}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiBookOpen className="w-4 h-4" />
                      <span>{t('navbar_link_lições')}</span>
                    </Link>

                    <Link
                      href="/annotations"
                      className={`
                        flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                        ${
                          pathname === '/annotations'
                            ? 'text-brand-primary bg-interactive-active'
                            : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                        }
                      `}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiFile className="w-4 h-4" />
                      <span>{t('navbar_link_anotações')}</span>
                    </Link>

                    <Link
                      href="/uploads"
                      className={`
                        flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                        ${
                          pathname === '/uploads'
                            ? 'text-brand-primary bg-interactive-active'
                            : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                        }
                      `}
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiUpload className="w-4 h-4" />
                      <span>{t('navbar_link_uploads')}</span>
                    </Link>

                    {user.role === 1 && (
                      <Link
                        href="/teacher"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/teacher'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaGraduationCap className="w-4 h-4" />
                        <span>{t('navbar_link_painel_professor')}</span>
                      </Link>
                    )}

                    {(user.isStudent || user.studentInviteStatus) && (
                      <Link
                        href="/student"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/student'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FaGraduationCap className="w-4 h-4" />
                        <span>{t('navbar_link_painel_aluno')}</span>
                      </Link>
                    )}
                    {user.role === 2 && (
                      <Link
                        href="/moderation"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/moderation'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiShield className="w-4 h-4" />
                        <span>{t('navbar_link_moderation')}</span>
                      </Link>
                    )}
                    {user.role === 2 && (
                      <Link
                        href="/admin"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/admin'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiSettings className="w-4 h-4" />
                        <span>{t('navbar_link_admin')}</span>
                      </Link>
                    )}

                    <hr className="my-2 border-theme-secondary" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm  rounded-lg "
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>{t('navbar_sair')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop Unauthenticated Buttons */
              <div className="items-center hidden lg:flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openLogin}
                  className="hidden sm:inline-flex"
                >
                  {t('navbar_button_entrar')}
                </Button>

                <Button variant="primary" size="sm" onClick={openRegister}>
                  {t('navbar_button_criar')}
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              ref={mobileButtonRef}
              onClick={handleMobileButtonClick}
              className="lg:hidden p-2 text-theme-secondary hover:text-brand-primary transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">
                {isMenuOpen ? t('navbar_fechar') : t('navbar_abrir')}
              </span>
              {isMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          ref={mobileMenuRef}
          className={`
            lg:hidden overflow-hidden transition-all duration-500 ease-in-out
            ${isMenuOpen ? 'max-h-auto opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
          id="mobile-menu"
        >
          <div className="classical-card p-4 mt-3 relative">
            {/* Navigation Container with Slide Animation */}
            <div className="relative overflow-hidden">
              {/* Main Navigation View */}
              <div
                className={`
                transition-transform duration-300 ease-in-out
                ${mobileView === 'main' ? 'translate-x-0' : '-translate-x-full absolute top-0 left-0 w-full'}
              `}
              >
                <ul className="space-y-2">
                  {/* Navigation Links */}
                  {optionsArr.map(({ label, href, active, submenu }, index) => (
                    <li key={index}>
                      {submenu ? (
                        <div className="flex items-center justify-between">
                          <Link
                            href={href || '#'}
                            className={`
                              flex-1 block px-4 py-3 rounded-lg font-medium transition-all duration-300
                              ${
                                active
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={handleMobileNavClick}
                          >
                            {label}
                          </Link>
                          <button
                            onClick={() => goToSubmenuView(label, submenu)}
                            className="ml-2 p-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                          >
                            <FiChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <Link
                          href={href || '#'}
                          className={`
                            block px-4 py-3 rounded-lg font-medium transition-all duration-300
                            ${
                              active
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                          onClick={handleMobileNavClick}
                        >
                          {label === 'Blog' ? (
                            <span className="gold-shine">Blog</span>
                          ) : (
                            label
                          )}{' '}
                        </Link>
                      )}
                    </li>
                  ))}

                  {/* Profile Section */}
                  {isAuthenticated && user ? (
                    <>
                      <hr className="my-4 border-theme-secondary" />

                      <div
                        className="flex items-center justify-between"
                        onClick={goToProfileView}
                      >
                        <div className="flex items-center space-x-3 px-4 py-3 flex-1">
                          {user.image ? (
                            <Image
                              src={user.image}
                              width={32}
                              height={32}
                              alt={getUserDisplayName()}
                              className="w-8 h-8 rounded-full object-cover border-2 border-brand-primary"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-theme-primary text-sm font-semibold">
                              {getUserInitials()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-theme-primary text-sm">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-xs text-theme-tertiary">
                              Perfil
                            </p>
                          </div>
                        </div>
                        <div className="p-2 text-theme-tertiary hover:text-brand-primary transition-colors">
                          <FiChevronRight className="w-5 h-5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Guest Actions */
                    <>
                      <hr className="my-4 border-theme-secondary" />
                      <li>
                        <button
                          onClick={() => {
                            openLogin();
                            closeMobileMenu();
                          }}
                          className="block w-full px-4 py-3 text-left rounded-lg font-medium text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover transition-all"
                        >
                          {t('navbar_fazer_login')}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={() => {
                            openRegister();
                            closeMobileMenu();
                          }}
                          className="block w-full px-4 py-3 text-left rounded-lg font-medium text-brand-primary bg-brand-primary bg-opacity-10 hover:bg-opacity-20 transition-all"
                        >
                          {t('navbar_button_criar')}
                        </button>
                      </li>
                    </>
                  )}

                  {/* Settings */}
                  {isAuthenticated && (
                    <>
                      <hr className="my-3 border-theme-secondary" />

                      <li>
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-accent-red hover:bg-accent-red rounded-lg l"
                        >
                          <FiLogOut className="w-5 h-5" />
                          <span>{t('navbar_sair')}</span>
                        </button>
                      </li>
                    </>
                  )}
                  <hr className="my-4 border-theme-secondary" />
                  <li>
                    <div className="flex items-center justify-center px-4 py-2">
                      <div className="flex items-center space-x-3">
                        <LanguageToggle />
                        <ThemeToggle variant="default" />
                      </div>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Profile View */}
              <div
                className={`
                transition-transform duration-300 ease-in-out
                ${mobileView === 'profile' ? 'translate-x-0' : 'translate-x-full absolute top-0 left-0 w-full'}
              `}
              >
                {isAuthenticated && user && (
                  <div>
                    {/* Header */}
                    <div className="flex items-center mb-4 pb-3 border-b border-theme-secondary">
                      <button
                        onClick={goBackToMain}
                        className="p-2 mr-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                      >
                        <FiChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-medium text-theme-primary">Perfil</h3>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-interactive-hover rounded-lg">
                      {user.image ? (
                        <Image
                          src={user.image}
                          width={40}
                          height={40}
                          alt={getUserDisplayName()}
                          className="w-10 h-10 rounded-full object-cover border-2 border-brand-primary"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center text-theme-primary font-semibold">
                          {getUserInitials()}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-theme-primary">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-sm text-theme-tertiary">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {!user.onboardingCompleted && (
                      <button
                        onClick={() => {
                          open();
                          closeMobileMenu();
                        }}
                        className="w-full mb-4 text-center py-3 px-4 bg-brand-primary bg-opacity-10 text-brand-primary rounded-lg font-medium hover:bg-opacity-20 transition-all"
                      >
                        {t('navbar_configure_seu_perfil')}
                      </button>
                    )}

                    {/* Menu Items */}
                    <ul className="space-y-1">
                      {user.onboardingCompleted && (
                        <li>
                          <Link
                            href="/profile"
                            className={`
                              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                              ${
                                pathname === '/profile'
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={handleMobileNavClick}
                          >
                            <FiUser className="w-5 h-5" />
                            <span>{t('navbar_link_meu_perfil')}</span>
                          </Link>
                        </li>
                      )}

                      <li>
                        <Link
                          href="/favorites"
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/favorites'
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                          onClick={handleMobileNavClick}
                        >
                          <FiHeart className="w-5 h-5" />
                          <span>{t('navbar_link_favoritos')}</span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/learning"
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/learning'
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                          onClick={handleMobileNavClick}
                        >
                          <FiBookOpen className="w-5 h-5" />
                          <span>{t('navbar_link_lições')}</span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/annotations"
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/annotations'
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                          onClick={handleMobileNavClick}
                        >
                          <FiFile className="w-5 h-5" />
                          <span>{t('navbar_link_anotações')}</span>
                        </Link>
                      </li>

                      <li>
                        <Link
                          href="/uploads"
                          className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/uploads'
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                          onClick={handleMobileNavClick}
                        >
                          <FiUpload className="w-5 h-5" />
                          <span>{t('navbar_link_uploads')}</span>
                        </Link>
                      </li>

                      {/* Admin/Teacher Links */}
                      {user.role === 1 && (
                        <li>
                          <Link
                            href="/teacher"
                            className={`
                              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                              ${
                                pathname === '/teacher'
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={handleMobileNavClick}
                          >
                            <FaGraduationCap className="w-5 h-5" />
                            <span>{t('navbar_link_painel_professor')}</span>
                          </Link>
                        </li>
                      )}

                      {(user.isStudent || user.studentInviteStatus) && (
                        <li>
                          <Link
                            href="/student"
                            className={`
                              flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                              ${
                                pathname === '/student'
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={handleMobileNavClick}
                          >
                            <FaGraduationCap className="w-5 h-5" />
                            <span>{t('navbar_link_painel_aluno')}</span>
                          </Link>
                        </li>
                      )}

                      {user.role === 2 && (
                        <>
                          <li>
                            <Link
                              href="/moderation"
                              className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                ${
                                  pathname === '/moderation'
                                    ? 'text-brand-primary bg-interactive-active'
                                    : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                                }
                              `}
                              onClick={handleMobileNavClick}
                            >
                              <FiShield className="w-5 h-5" />
                              <span>{t('navbar_link_moderation')}</span>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/admin"
                              className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                ${
                                  pathname === '/admin'
                                    ? 'text-brand-primary bg-interactive-active'
                                    : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                                }
                              `}
                              onClick={handleMobileNavClick}
                            >
                              <FiSettings className="w-5 h-5" />
                              <span>{t('navbar_link_admin')}</span>
                            </Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Submenu View */}
              <div
                className={`
                transition-transform duration-300 ease-in-out
                ${mobileView === 'submenu' ? 'translate-x-0' : 'translate-x-full absolute top-0 left-0 w-full'}
              `}
              >
                <div>
                  {/* Header */}
                  <div className="flex items-center mb-4 pb-3 border-b border-theme-secondary">
                    <button
                      onClick={goBackToMain}
                      className="p-2 mr-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-medium text-theme-primary">
                      {submenuTitle}
                    </h3>
                  </div>

                  {/* Submenu Items */}
                  <ul className="space-y-1">
                    {activeSubmenuItems.map((item, index) => (
                      <li key={index}>
                        <Link
                          href={item.href}
                          className={`
                            block px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === item.href
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                          onClick={handleMobileNavClick}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
