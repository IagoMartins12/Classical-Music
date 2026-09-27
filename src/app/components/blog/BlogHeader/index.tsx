// app/components/blog/BlogHeader.tsx - ATUALIZADO
'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from '@/app/libs/session';
import { usePathname, useRouter } from 'next/navigation';
import { GiGrandPiano } from 'react-icons/gi';
import {
  PiBookmarkSimple,
  PiCaretDown,
  PiCaretLeft,
  PiCaretRight,
  PiChatCircle,
  PiGear,
  PiHeart,
  PiList,
  PiListBullets,
  PiMagnifyingGlass,
  PiNotePencil,
  PiSignOut,
  PiUser,
  PiX,
} from 'react-icons/pi';
import Image from '@/app/components/SmartImage';
import { toast } from 'react-hot-toast';
import { ThemeToggle } from '../../ThemeToggle';
import Button from '../../Common/Button';
import { useLoginModal, useRegisterModal } from '@/app/stores/authStore';
import { SearchModal } from '../SearchModal';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { Stack, Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { Card } from '@/app/components/ui/Card';

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

  const { refresh } = useRouter();
  const { reset } = useLearningStore();
  const { reset: resetFavorite } = useFavoritesStore();
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

  const handleLogout = async () => {
    try {
      resetFavorite();
      reset();
      await signOut({ redirect: false });
      toast.success('Logout realizado com sucesso!');
      setIsProfileOpen(false);
      closeMobileMenu();
      refresh();
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
      href: '/blog/category/romantico',
      description: 'Explore todos os artigos do periodo romântico',
    },
    {
      label: 'Barroco',
      href: '/blog/category/barroco',
      description: 'Explore todos os artigos do periodo barroco',
    },
    {
      label: 'Clássico',
      href: '/blog/category/classico',
      description: 'Explore todos os artigos do periodo clássico.',
    },
  ];
  // Navigation items
  const navLinks: NavItem[] = [
    // {
    //   label: 'Blog',
    //   href: '/blog',
    //   active: isPathActive('/blog'),
    // },
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
    label: 'Opus Atlas',
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
      <header className="navbar-classical sticky top-0 z-barra">
        <nav aria-label="Navegação do blog" className="section-wrap-nav">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/blog" className="flex items-center group">
              <div className="relative">
                <GiGrandPiano className="w-8 h-8 mr-3 text-ouro-texto icon-glow transition-all duration-300 group-hover:scale-110" />
              </div>
              <div className="">
                <span className="text-xl font-bold text-gradient-brand gold-shine classical-title">
                  Opus atlas
                </span>
                <Text
                  papel="legenda"
                  tom="fraco"
                  as="div"
                  className="-mt-1 font-medium"
                >
                  Blog Musical
                </Text>
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
                          ${active ? 'text-ouro-texto' : 'text-theme-secondary'}
                          after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0
                          ${active ? 'after:w-full after:left-0' : ''}
                        `}
                      >
                        <span>{label}</span>
                        <PiCaretDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeSubmenu === label ? 'rotate-180' : ''
                          }`}
                        />
                      </Link>

                      {/* Submenu Dropdown */}
                      {activeSubmenu === label && (
                        <div className="absolute top-full left-0 mt-2 w-72 bg-theme-tertiary rounded-2xl shadow-xl z-50 overflow-hidden">
                          <div className="p-2">
                            {submenu.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                className={`
                                  block p-3 rounded-lg transition-colors group
                                  ${
                                    pathname === item.href
                                      ? 'text-ouro-texto'
                                      : ''
                                  }
                                `}
                                onClick={() => setActiveSubmenu(null)}
                              >
                                <div
                                  className={`
                                  font-medium transition-colors
                                  ${
                                    pathname === item.href
                                      ? 'text-ouro-texto'
                                      : 'text-theme-primary'
                                  }
                                `}
                                >
                                  {item.label}
                                </div>
                                {item.description && (
                                  <Text
                                    papel="legenda"
                                    tom="fraco"
                                    as="div"
                                    className="mt-1"
                                  >
                                    {item.description}
                                  </Text>
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
                        ${active ? 'text-ouro-texto' : 'text-theme-secondary'}
                        ${label === 'Opus Atlas' ? 'text-transparent' : ''}
                        after:absolute after:bottom-0 after:left-1/2 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full hover:after:left-0
                        ${active ? 'after:w-full after:left-0' : ''}
                      `}
                    >
                      {label === 'Opus Atlas' ? (
                        <span className="gold-shine">Opus Atlas</span>
                      ) : (
                        label
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <Inline gap={4}>
              {/* Search Button */}
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="w-11 h-10 p-1.5 rounded-xl bg-theme-elevated transition-all group flex items-center justify-center"
                aria-label="Buscar (Ctrl+K)"
              >
                <PiMagnifyingGlass className="w-4 h-4 text-theme-secondary transition-colors" />
              </button>

              <ThemeToggle variant="navbar" className="hidden sm:block" />

              {/* User Menu / Login - Desktop */}
              {isLoading ? null : isAuthenticated && user ? (
                <div className="relative hidden lg:block" ref={profileRef}>
                  <Inline
                    as="button"
                    gap={2}
                    onClick={toggleProfileMenu}
                    className="p-2 rounded-lg transition-colors"
                  >
                    {user.image ? (
                      <Image
                        src={user.image}
                        width={32}
                        height={32}
                        alt={getUserDisplayName()}
                        className="w-8 h-8 rounded-full object-cover border-2"
                      />
                    ) : (
                      <Text
                        papel="rotulo"
                        tom="forte"
                        as="div"
                        className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                      >
                        {getUserInitials()}
                      </Text>
                    )}
                    <div className="text-left max-w-32">
                      <Text
                        papel="rotulo"
                        tom="forte"
                        as="p"
                        className="font-medium truncate"
                      >
                        {getUserDisplayName()}
                      </Text>
                    </div>
                  </Inline>

                  {/* Desktop Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-theme-tertiary rounded-2xl z-20 p-2 shadow-xl">
                      {/* User Info */}
                      <div className="px-3 py-2 border-b border-theme-secondary mb-2">
                        <p className="font-medium text-theme-primary">
                          {getUserDisplayName()}
                        </p>
                        <Text papel="rotulo" tom="fraco" as="p">
                          {user.email}
                        </Text>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/profile"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/profile'
                              ? 'text-ouro-texto'
                              : 'text-theme-secondary'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <PiUser className="w-4 h-4" />
                        <span>Meu Perfil</span>
                      </Link>

                      {/* 🆕 NOVO: Artigos Curtidos */}
                      <Link
                        href="/blog/liked"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/blog/liked'
                              ? 'text-ouro-texto'
                              : 'text-theme-secondary'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <PiHeart className="w-4 h-4" />
                        <span>Artigos Curtidos</span>
                      </Link>

                      {/* 🆕 NOVO: Artigos Salvos */}
                      <Link
                        href="/blog/bookmarks"
                        className={`
                          flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                          ${
                            pathname === '/blog/bookmarks'
                              ? 'text-ouro-texto'
                              : 'text-theme-secondary'
                          }
                        `}
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <PiBookmarkSimple className="w-4 h-4" />
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
                                  ? 'text-ouro-texto'
                                  : 'text-theme-secondary'
                              }
                            `}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <PiNotePencil className="w-4 h-4" />
                            <span>Criar Artigo</span>
                          </Link>

                          <Link
                            href="/blog/admin/articles"
                            className={`
                              flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                              ${
                                pathname === '/blog/admin/articles'
                                  ? 'text-ouro-texto'
                                  : 'text-theme-secondary'
                              }
                            `}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <PiListBullets className="w-4 h-4" />
                            <span>Gerenciar Artigos</span>
                          </Link>

                          <Link
                            href="/blog/admin/moderation"
                            className={`
                              flex items-center space-x-2 w-full px-3 py-2 text-sm rounded-lg transition-all
                              ${
                                pathname === '/blog/admin/moderation'
                                  ? 'text-ouro-texto'
                                  : 'text-theme-secondary'
                              }
                            `}
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <PiChatCircle className="w-4 h-4" />
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
                                ? 'text-ouro-texto'
                                : 'text-theme-secondary'
                            }
                          `}
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <PiGear className="w-4 h-4" />
                          <span>Admin</span>
                        </Link>
                      )}

                      <hr className="my-2 border-theme-secondary" />

                      <Inline
                        as="button"
                        gap={2}
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-sm text-theme-secondary rounded-lg transition-all"
                      >
                        <PiSignOut className="w-4 h-4" />
                        <span>Sair</span>
                      </Inline>
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
                className="lg:hidden p-2 text-theme-secondary transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? (
                  <PiX className="w-6 h-6" />
                ) : (
                  <PiList className="w-6 h-6" />
                )}
              </button>
            </Inline>
          </div>

          {/* Mobile Menu */}
          <div
            ref={mobileMenuRef}
            className={`
            lg:hidden overflow-hidden transition-all duration-500 ease-in-out
            ${isMenuOpen ? 'max-h-auto opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
          >
            <Card densidade="compacta" className="mt-3 relative">
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
                                  ? 'text-ouro-texto'
                                  : 'text-theme-secondary'
                              }
                            `}
                              onClick={handleMobileNavClick}
                            >
                              {label}
                            </Link>
                            <button
                              onClick={() => goToSubmenuView(label, submenu)}
                              aria-label={`Abrir ${label}`}
                              className="ml-2 p-2 text-theme-tertiary transition-colors"
                            >
                              <PiCaretRight className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <Link
                            href={href || '#'}
                            className={`
                            block px-4 py-3 rounded-lg font-medium transition-all
                            ${label === 'Opus Atlas' ? 'text-transparent' : ''}
                            ${
                              active
                                ? 'text-ouro-texto'
                                : 'text-theme-secondary'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            {label === 'Opus Atlas' ? (
                              <span className="gold-shine">Opus Atlas</span>
                            ) : (
                              label
                            )}
                          </Link>
                        )}
                      </li>
                    ))}

                    {/* Profile Section */}
                    {isAuthenticated && user ? (
                      <>
                        <li role="separator" aria-hidden="true">
                          <hr className="my-4 border-theme-secondary" />
                        </li>
                        {/* Era uma <div> com onClick: sem Tab, sem Enter, e
                            solta dentro do <ul>. */}
                        <li>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between cursor-pointer text-left"
                            onClick={goToProfileView}
                          >
                            <Inline
                              as="span"
                              gap={3}
                              className="px-4 py-3 flex-1"
                            >
                              {user.image ? (
                                <Image
                                  src={user.image}
                                  width={32}
                                  height={32}
                                  alt={getUserDisplayName()}
                                  className="w-8 h-8 rounded-full object-cover border-2"
                                />
                              ) : (
                                <Text
                                  papel="rotulo"
                                  tom="forte"
                                  className="w-8 h-8 rounded-full flex items-center justify-center font-semibold"
                                >
                                  {getUserInitials()}
                                </Text>
                              )}
                              <span>
                                <Text
                                  papel="rotulo"
                                  tom="forte"
                                  className="block font-medium"
                                >
                                  {getUserDisplayName()}
                                </Text>
                                <Text
                                  papel="legenda"
                                  tom="fraco"
                                  className="block"
                                >
                                  Perfil
                                </Text>
                              </span>
                            </Inline>
                            <PiCaretRight className="w-5 h-5 text-theme-tertiary" />
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li role="separator" aria-hidden="true">
                          <hr className="my-4 border-theme-secondary" />
                        </li>
                        <li>
                          <Link
                            href="/login"
                            className="block w-full px-4 py-3 text-left rounded-lg font-medium text-theme-secondary transition-all"
                            onClick={handleMobileNavClick}
                          >
                            Fazer Login
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/register"
                            className="block w-full px-4 py-3 text-left rounded-lg font-medium text-ouro-texto transition-all"
                            onClick={handleMobileNavClick}
                          >
                            Criar Conta
                          </Link>
                        </li>
                      </>
                    )}

                    {/* Theme Toggle Mobile */}
                    <li role="separator" aria-hidden="true">
                      <hr className="my-4 border-theme-secondary" />
                    </li>
                    <li>
                      <div className="flex items-center justify-center px-4 py-2">
                        <Inline gap={3}>
                          <ThemeToggle variant="default" />
                        </Inline>
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
                    <Stack>
                      <div className="flex items-center pb-3 border-b border-theme-secondary">
                        <button
                          onClick={goBackToMain}
                          aria-label="Voltar ao menu"
                          className="p-2 mr-2 text-theme-tertiary transition-colors"
                        >
                          <PiCaretLeft className="w-5 h-5" />
                        </button>
                        <h3 className="font-medium text-theme-primary">
                          Perfil
                        </h3>
                      </div>

                      <Inline gap={3} className="px-4 py-3 rounded-lg">
                        {user.image ? (
                          <Image
                            src={user.image}
                            width={40}
                            height={40}
                            alt={getUserDisplayName()}
                            className="w-10 h-10 rounded-full object-cover border-2"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-theme-primary font-semibold">
                            {getUserInitials()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-theme-primary">
                            {getUserDisplayName()}
                          </p>
                          <Text papel="rotulo" tom="fraco" as="p">
                            {user.email}
                          </Text>
                        </div>
                      </Inline>

                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/profile"
                            className={`
                            flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                            ${
                              pathname === '/profile'
                                ? 'text-ouro-texto'
                                : 'text-theme-secondary'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            <PiUser className="w-5 h-5" />
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
                                ? 'text-ouro-texto'
                                : 'text-theme-secondary'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            <PiHeart className="w-5 h-5" />
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
                                ? 'text-ouro-texto'
                                : 'text-theme-secondary'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            <PiBookmarkSimple className="w-5 h-5" />
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
                                    ? 'text-ouro-texto'
                                    : 'text-theme-secondary'
                                }
                              `}
                                onClick={handleMobileNavClick}
                              >
                                <PiNotePencil className="w-5 h-5" />
                                <span>Criar Artigo</span>
                              </Link>
                            </li>

                            <li>
                              <Link
                                href="/blog/admin/articles"
                                className={`
                                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all
                                ${
                                  pathname === '/blog/articles'
                                    ? 'text-ouro-texto'
                                    : 'text-theme-secondary'
                                }
                              `}
                                onClick={handleMobileNavClick}
                              >
                                <PiListBullets className="w-5 h-5" />
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
                                    ? 'text-ouro-texto'
                                    : 'text-theme-secondary'
                                }
                              `}
                                onClick={handleMobileNavClick}
                              >
                                <PiChatCircle className="w-5 h-5" />
                                <span>Moderação</span>
                              </Link>
                            </li>
                          </>
                        )}

                        <li>
                          <Inline
                            as="button"
                            gap={3}
                            onClick={handleLogout}
                            className="w-full px-4 py-3 rounded-lg transition-all"
                          >
                            <PiSignOut className="w-5 h-5" />
                            <span>Sair</span>
                          </Inline>
                        </li>
                      </ul>
                    </Stack>
                  )}
                </div>

                {/* Submenu View */}
                <div
                  className={`
                  transition-transform duration-300 ease-in-out
                  ${mobileView === 'submenu' ? 'translate-x-0' : 'translate-x-full absolute top-0 left-0 w-full'}
                `}
                >
                  <Stack>
                    <div className="flex items-center pb-3 border-b border-theme-secondary">
                      <button
                        onClick={goBackToMain}
                        aria-label="Voltar ao menu"
                        className="p-2 mr-2 text-theme-tertiary transition-colors"
                      >
                        <PiCaretLeft className="w-5 h-5" />
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
                                ? 'text-ouro-texto'
                                : 'text-theme-secondary'
                            }
                          `}
                            onClick={handleMobileNavClick}
                          >
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <Text
                                papel="legenda"
                                tom="fraco"
                                as="div"
                                className="mt-1"
                              >
                                {item.description}
                              </Text>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Stack>
                </div>
              </div>
            </Card>
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
