// components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiUser, FiSettings } from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import { ThemeToggle } from '../ThemeToggle';

interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const toggleProfileMenu = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const optionsArr: NavItem[] = [
    { label: 'História da Música', href: '/music-history' },
    { label: 'Obras', href: '/works' },
    { label: 'Compositores', href: '/composers' },
    { label: 'Instrumentos', href: '/instruments' },
    { label: 'Quem somos', href: '/about-us' },
  ];

  return (
    <nav className="navbar-classical sticky top-0 z-50">
      <div className="section-wrap-nav pt-1 pb-2 ">
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

            {/* Profile Menu */}
            {/* <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 btn-classical-secondary text-sm"
              >
                <FiUser className="w-4 h-4" />
                <span className="hidden sm:inline">Perfil</span>
              </button>

              {isProfileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsProfileOpen(false)}
                  />

                  <div className="absolute right-0 top-full mt-2 w-48 classical-card z-20 p-2">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Configurações</span>
                    </Link>
                    <hr className="my-2 border-theme-secondary" />
                    <button className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-accent-red hover:bg-interactive-hover rounded-lg transition-all">
                      <span>Sair</span>
                    </button>
                  </div>
                </>
              )}
            </div> */}

            {/* Login Button */}
            <button className="btn-classical-primary text-sm">
              Fazer Login
            </button>

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
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
