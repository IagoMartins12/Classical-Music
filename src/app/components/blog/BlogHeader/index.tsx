// app/components/blog/BlogHeader.tsx - ATUALIZADO
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHeart,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiChevronLeft,
  FiEdit,
  FiList,
  FiBookmark, // 🆕 NOVO ÍCONE
} from 'react-icons/fi';
import { FaSearch } from 'react-icons/fa';
import { BiComment } from 'react-icons/bi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '../../ThemeToggle';
import Button from '../../Common/Button';
import { useLoginModal, useRegisterModal } from '@/app/stores/authStore';
import { GiGrandPiano } from 'react-icons/gi';
import { SearchModal } from '../SearchModal';
import { LanguageToggle } from '../../LanguageToggle';

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

export function BlogHeader() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileMenuView>('main');
  const [activeSubmenuItems, setActiveSubmenuItems] = useState<
    Array<{ label: string; href: string; description?: string }>
  >([]);

  const [submenuTitle, setSubmenuTitle] = useState('');

  // Refs
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { open: openLogin } = useLoginModal();
  const { open: openRegister } = useRegisterModal();

  const user = session?.user;
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';
  const isAdmin = user?.role && user.role >= 1;

  // Mobile menu functions
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
    items: Array<{ label: string; href: string; description?: string }>
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

  const handleMobileNavClick = () => {
    closeMobileMenu();
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast.success('Logout realizado com sucesso!');
      setIsProfileOpen(false);
      closeMobileMenu();
      router.push('/blog');
      router.refresh();
    } catch {
      toast.error('Erro ao fazer logout');
    }
  };

  // User display functions
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

  // Active path checking
  const isPathActive = (href: string, submenuPaths?: string[]): boolean => {
    if (pathname === href) return true;
    if (submenuPaths) {
      return submenuPaths.some((path) => pathname === path);
    }
    return false;
  };

  const categorySubmenu = [
    {
      label: 'Todas as categorias',
      href: '/blog/category',
      description: 'Veja todas as nossas categorias disponíveis',
    },
    {
      label: 'Romântico',
      href: '/blog/romantico',
      description: 'Explore todos os artigos do periodo romântico',
    },
    {
      label: 'Barroco',
      href: '/blog/barroco',
      description: 'Explore todos os artigos do periodo barroco',
    },
    {
      label: 'Clássico',
      href: '/blog/classico',
      description: 'Explore todos os artigos do periodo clássico.',
    },
  ];
  // Navigation items
  const navLinks: NavItem[] = [
    {
      label: 'Blog',
      href: '/blog',
      active: isPathActive('/blog'),
    },
    {
      label: 'Artigos',
      href: '/blog/articles',
      active: isPathActive('/blog/articles'),
    },
    {
      label: 'Categorias',
      href: '/blog/category',
      active: isPathActive('/blog/category'),
      submenu: categorySubmenu,
    },
  ];

  // Admin submenu
  const adminSubmenu = [
    {
      label: 'Criar Artigo',
      href: '/blog/admin/articles/create',
      description: 'Escrever novo artigo',
    },
    {
      label: 'Gerenciar Artigos',
      href: '/blog/admin/articles',
      description: 'Ver todos os artigos',
    },
    {
      label: 'Categorias',
      href: '/blog/admin/categories',
      description: 'Gerenciar categorias',
    },
    {
      label: 'Tags',
      href: '/blog/admin/tags',
      description: 'Gerenciar tags',
    },
    {
      label: 'Moderação',
      href: '/blog/admin/moderation',
      description: 'Comentários pendentes',
    },
  ];

  // Add admin link if user is admin
  if (isAdmin) {
    navLinks.push({
      label: 'Administrar',
      href: '/blog/articles',
      active: isPathActive('/blog/admin'),
      submenu: adminSubmenu,
    });
  }

  navLinks.push({
    label: 'Opus atlas',
    href: '/',
  });

  // Submenu hover handlers
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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;

      if (
        profileRef.current &&
        !profileRef.current.contains(target) &&
        isProfileOpen
      ) {
        setIsProfileOpen(false);
      }

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

  // ESC key handler
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMenuOpen) closeMobileMenu();
        if (isProfileOpen) setIsProfileOpen(false);
        if (activeSubmenu) setActiveSubmenu(null);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isMenuOpen, isProfileOpen, activeSubmenu]);

  // Atalho de teclado para abrir busca (Ctrl+K ou Cmd+K)
  useEffect(() => {
    const handleSearchShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    document.addEventListener('keydown', handleSearchShortcut);
    return () => document.removeEventListener('keydown', handleSearchShortcut);
  }, []);

  return (
    <>
      <header className="navbar-classical sticky top-0 z-50">
        <nav className="section-wrap-nav">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/blog" className="flex items-center group">
              <div className="relative">
                <GiGrandPiano className="w-8 h-8 mr-3 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gradient-brand classical-title">
                  Opus atlas
                </span>
                <div className="text-xs text-theme-tertiary -mt-1 font-medium">
                  Blog Musical
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map(({ label, href, active, submenu }) => (
                <div
                  key={label}
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

                      {/* Submenu Dropdown */}
                      {activeSubmenu === label && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-theme-tertiary rounded-2xl shadow-xl border border-theme-secondary z-50 overflow-hidden">
                          <div className="p-2">
                            {submenu.map((item) => (
                              <Link
                                key={item.label}
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
                      {label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-11 h-10 p-1.5 rounded-xl bg-theme-elevated hover:bg-theme-classical transition-all group flex items-center justify-center"
                aria-label="Buscar (Ctrl+K)"
              >
                <FaSearch className="w-4 h-4 text-theme-secondary group-hover:text-brand-primary transition-colors" />
              </button>
              <LanguageToggle variant="compact" className="hidden sm:block" />

              <ThemeToggle variant="navbar" />

              {/* User Menu / Login - Desktop */}
              {isLoading ? null : isAuthenticated && user ? (
                <div className="relative hidden lg:block" ref={profileRef}>
                  <button
                    onClick={toggleProfileMenu}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-interactive-hover transition-colors"
                  >
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
                    <div className="text-left max-w-32">
                      <p className="text-sm font-medium text-theme-primary truncate">
                        {getUserDisplayName()}
                      </p>
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
                      </div>

                      {/* Menu Items */}
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
                        <span>Meu Perfil</span>
                      </Link>

                      {/* 🆕 NOVO: Artigos Curtidos */}
                      <Link
                        href="/blog/liked"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/blog/liked'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiHeart className="w-4 h-4" />
                        <span>Artigos Curtidos</span>
                      </Link>

                      {/* 🆕 NOVO: Artigos Salvos */}
                      <Link
                        href="/blog/bookmarks"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/blog/bookmarks'
                              ? 'text-brand-primary bg-interactive-active'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiBookmark className="w-4 h-4" />
                        <span>Artigos Salvos</span>
                      </Link>

                      {/* Admin Links */}
                      {isAdmin && (
                        <>
                          <hr className="my-2 border-theme-secondary" />
                          <Link
                            href="/blog/admin/articles/create"
                            className={`
                              flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                              ${
                                pathname === '/blog/admin/articles/create'
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FiEdit className="w-4 h-4" />
                            <span>Criar Artigo</span>
                          </Link>

                          <Link
                            href="/blog/admin/articles"
                            className={`
                              flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                              ${
                                pathname === '/blog/admin/articles'
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <FiList className="w-4 h-4" />
                            <span>Gerenciar Artigos</span>
                          </Link>

                          <Link
                            href="/blog/admin/moderation"
                            className={`
                              flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                              ${
                                pathname === '/blog/admin/moderation'
                                  ? 'text-brand-primary bg-interactive-active'
                                  : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                              }
                            `}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <BiComment className="w-4 h-4" />
                            <span>Moderação</span>
                          </Link>
                        </>
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
                          <span>Admin</span>
                        </Link>
                      )}

                      <hr className="my-2 border-theme-secondary" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-accent-red hover:bg-interactive-hover rounded-lg transition-all"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="items-center hidden lg:flex space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={openLogin}
                    className="hidden sm:inline-flex"
                  >
                    Login
                  </Button>

                  <Button variant="primary" size="sm" onClick={openRegister}>
                    Criar conta
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                ref={mobileButtonRef}
                onClick={handleMobileButtonClick}
                className="lg:hidden p-2 text-theme-secondary hover:text-brand-primary transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            className={`
            lg:hidden overflow-hidden transition-all duration-500 ease-in-out
            ${isMenuOpen ? 'max-h-auto opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
          >
            <div className="classical-card p-4 mt-3 relative">
              <div className="relative overflow-hidden">
                {/* Main View */}
                <div
                  className={`
                  transition-transform duration-300 ease-in-out
                  ${mobileView === 'main' ? 'translate-x-0' : '-translate-x-full absolute top-0 left-0 w-full'}
                `}
                >
                  <ul className="space-y-2">
                    {navLinks.map(({ label, href, active, submenu }) => (
                      <li key={label}>
                        {submenu ? (
                          <div className="flex items-center justify-between">
                            <Link
                              href={href || '#'}
                              className={`
                              flex-1 block px-4 py-3 rounded-lg font-medium transition-all
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
                            block px-4 py-3 rounded-lg font-medium transition-all
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
                        )}
                      </li>
                    ))}

                    {/* Profile Section */}
                    {isAuthenticated && user ? (
                      <>
                        <hr className="my-4 border-theme-secondary" />
                        <div
                          className="flex items-center justify-between cursor-pointer"
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
                          <FiChevronRight className="w-5 h-5 text-theme-tertiary" />
                        </div>
                      </>
                    ) : (
                      <>
                        <hr className="my-4 border-theme-secondary" />
                        <li>
                          <Link
                            href="/login"
                            className="block w-full px-4 py-3 text-left rounded-lg font-medium text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover transition-all"
                            onClick={handleMobileNavClick}
                          >
                            Fazer Login
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/register"
                            className="block w-full px-4 py-3 text-left rounded-lg font-medium text-brand-primary bg-brand-primary bg-opacity-10 hover:bg-opacity-20 transition-all"
                            onClick={handleMobileNavClick}
                          >
                            Criar Conta
                          </Link>
                        </li>
                      </>
                    )}

                    {/* Theme Toggle Mobile */}
                    <hr className="my-4 border-theme-secondary" />
                    <li>
                      <div className="flex items-center justify-center px-4 py-2">
                        <div className="flex items-center space-x-3">
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
                      <div className="flex items-center mb-4 pb-3 border-b border-theme-secondary">
                        <button
                          onClick={goBackToMain}
                          className="p-2 mr-2 text-theme-tertiary hover:text-brand-primary transition-colors"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-medium text-theme-primary">
                          Perfil
                        </h3>
                      </div>

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

                      <ul className="space-y-1">
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
                            <span>Meu Perfil</span>
                          </Link>
                        </li>

                        {/* 🆕 NOVO: Artigos Curtidos - Mobile */}
                        <li>
                          <Link
                            href="/blog/liked"
                            className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/blog/liked'
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            <FiHeart className="w-5 h-5" />
                            <span>Artigos Curtidos</span>
                          </Link>
                        </li>

                        {/* 🆕 NOVO: Artigos Salvos - Mobile */}
                        <li>
                          <Link
                            href="/blog/bookmarks"
                            className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/blog/bookmarks'
                                ? 'text-brand-primary bg-interactive-active'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            <FiBookmark className="w-5 h-5" />
                            <span>Artigos Salvos</span>
                          </Link>
                        </li>

                        {/* Admin Links */}
                        {isAdmin && (
                          <>
                            <li>
                              <Link
                                href="/blog/admin/articles/create"
                                className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                ${
                                  pathname === '/blog/admin/articles/create'
                                    ? 'text-brand-primary bg-interactive-active'
                                    : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                                }
                              `}
                                onClick={handleMobileNavClick}
                              >
                                <FiEdit className="w-5 h-5" />
                                <span>Criar Artigo</span>
                              </Link>
                            </li>

                            <li>
                              <Link
                                href="/blog/articles"
                                className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                ${
                                  pathname === '/blog/articles'
                                    ? 'text-brand-primary bg-interactive-active'
                                    : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                                }
                              `}
                                onClick={handleMobileNavClick}
                              >
                                <FiList className="w-5 h-5" />
                                <span>Gerenciar Artigos</span>
                              </Link>
                            </li>

                            <li>
                              <Link
                                href="/blog/admin/moderation"
                                className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                ${
                                  pathname === '/blog/admin/moderation'
                                    ? 'text-brand-primary bg-interactive-active'
                                    : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                                }
                              `}
                                onClick={handleMobileNavClick}
                              >
                                <BiComment className="w-5 h-5" />
                                <span>Moderação</span>
                              </Link>
                            </li>
                          </>
                        )}

                        <li>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-accent-red hover:bg-interactive-hover rounded-lg transition-all"
                          >
                            <FiLogOut className="w-5 h-5" />
                            <span>Sair</span>
                          </button>
                        </li>
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

                    <ul className="space-y-1">
                      {activeSubmenuItems.map((item) => (
                        <li key={item.label}>
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
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-theme-tertiary mt-1">
                                {item.description}
                              </div>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </>
  );
}
