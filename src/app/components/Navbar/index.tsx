// components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import {
  FiMenu,
  FiX,
  FiUser,
  FiLogOut,
  FiHeart,
  FiBookOpen,
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

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { logout: authLogout } = useAuthStore();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { open: openLogin } = useLoginModal();
  const { open: openRegister } = useRegisterModal();
  const { open } = useOnboardingModal();

  const toggleMobileMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      logout();
      authLogout();
      await signOut({ redirect: false });
      toast.success('Logout realizado com sucesso!');
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const optionsArr: NavItem[] = [
    { label: 'História da Música', href: '/music-history' },
    { label: 'Obras', href: '/works' },
    { label: 'Compositores', href: '/composers' },
    { label: 'Instrumentos', href: '/instruments' },
    { label: 'Quem somos', href: '/about-us' },
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

  return (
    <nav className="navbar-classical sticky top-0 z-50">
      <div className="section-wrap-nav pt-1 pb-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <GiGrandPiano className="w-8 h-8 mr-3 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
            </div>
            <span className="text-xl font-bold text-gradient-brand classical-title">
              Classical Hub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {optionsArr.map(({ label, href, active }) => (
              <Link
                key={label}
                href={href}
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
                `}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle variant="navbar" />

            {/* Authentication Section */}
            {isLoading ? (
              <div className="w-8 h-8 animate-spin border-2 border-brand-primary border-t-transparent rounded-full" />
            ) : isAuthenticated && user ? (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={toggleProfileMenu}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-interactive-hover transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-opacity-50"
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

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-theme-primary truncate max-w-32">
                      {getUserDisplayName()}
                    </p>
                    {!user.onboardingCompleted && (
                      <p className="text-xs text-accent-amber">
                        Configure seu perfil
                      </p>
                    )}
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsProfileOpen(false)}
                    />

                    <div className="absolute right-0 top-full mt-2 w-64 classical-card z-20 p-2">
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
                            Clique aqui para completar seu perfil.
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      {user.onboardingCompleted && (
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <FiUser className="w-4 h-4" />
                          <span>Meu Perfil</span>
                        </Link>
                      )}

                      <Link
                        href="/favorites"
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiHeart className="w-4 h-4" />
                        <span>Favoritos</span>
                      </Link>

                      <Link
                        href="/learning"
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <FiBookOpen className="w-4 h-4" />
                        <span>Lições</span>
                      </Link>

                      <hr className="my-2 border-theme-secondary" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-accent-red hover:bg-accent-red hover:bg-opacity-10 rounded-lg transition-all"
                      >
                        <FiLogOut className="w-4 h-4" />
                        <span>Sair</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* Unauthenticated User Buttons */
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openLogin}
                  className="hidden sm:inline-flex"
                >
                  Entrar
                </Button>

                <Button variant="primary" size="sm" onClick={openRegister}>
                  Criar Conta
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-theme-secondary hover:text-brand-primary transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Abrir menu principal</span>
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
          className={`
            lg:hidden overflow-hidden transition-all duration-500 ease-in-out
            ${isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'}
          `}
          id="mobile-menu"
        >
          <div className="classical-card p-4">
            <ul className="space-y-2">
              {optionsArr.map(({ label, href, active }, index) => (
                <li key={label}>
                  <Link
                    href={href}
                    className={`
                      block px-4 py-3 rounded-lg font-medium transition-all duration-300
                      ${
                        active
                          ? 'text-brand-primary bg-interactive-active'
                          : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                      }
                    `}
                    style={{
                      animation: isMenuOpen
                        ? `fadeInUp 0.3s ease-out ${index * 0.05}s backwards`
                        : 'none',
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              ))}

              {/* Mobile Auth Buttons */}
              {!isAuthenticated && (
                <>
                  <li className="pt-4 border-t border-theme-secondary">
                    <button
                      onClick={() => {
                        openLogin();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left rounded-lg font-medium text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover transition-all"
                    >
                      Fazer Login
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        openRegister();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full px-4 py-3 text-left rounded-lg font-medium text-brand-primary bg-brand-primary bg-opacity-10 hover:bg-opacity-20 transition-all"
                    >
                      Criar Conta
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
