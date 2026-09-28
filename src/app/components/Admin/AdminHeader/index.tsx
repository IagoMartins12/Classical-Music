// app/components/Admin/AdminHeader.tsx
'use client';
import { Button as Botao } from '@/app/components/ui/Button';

import { useState } from 'react';
import { signOut, useSession } from '@/app/libs/session';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PiCaretDown,
  PiChartBar,
  PiFlag,
  PiGear,
  PiHouse,
  PiList,
  PiPulse,
  PiShield,
  PiSignOut,
  PiUsers,
} from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';
import { Text } from '@/app/components/ui/Text';
import { NomeAcao } from '@/app/components/ui/NomeAcao';

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Verificar se é admin
  if (!session?.user || session.user.role !== 2) return null;

  // Navigation items
  const navigationItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: PiChartBar,
      isActive: pathname === '/admin',
    },
    {
      href: '/admin/users',
      label: 'Usuários',
      icon: PiUsers,
      isActive: pathname.startsWith('/admin/users'),
    },
    {
      href: '/admin/moderation',
      label: 'Moderação',
      icon: PiShield,
      isActive: pathname.startsWith('/admin/moderation'),
    },
    {
      href: '/admin/reports-metric',
      label: 'Relatórios',
      icon: PiFlag,
      isActive: pathname.startsWith('/admin/reports-metric'),
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: PiPulse,
      isActive: pathname.startsWith('/admin/analytics'),
    },
  ];

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/',
      redirect: true,
    });
  };

  return (
    <>
      <div className="bg-theme-elevated border-b border-theme-primary sticky top-0 z-barra backdrop-blur-lg">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Logo/Title + Mobile Menu Button */}
            <div className="flex items-center space-x-4 lg:space-x-8">
              {/* Mobile Menu Button */}
              <Botao
                variante="fantasma"
                tamanho="p"
                id="menu-button"
                onClick={onMenuClick}
                icone={PiList}
                className="lg:hidden"
              >
                <NomeAcao acao="menu" />
              </Botao>

              {/* Logo */}
              <Link
                href="/admin"
                className="flex items-center space-x-2 lg:space-x-3 text-theme-primary transition-colors"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <PiShield className="w-4 h-4 lg:w-6 lg:h-6 text-theme-primary" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-base lg:text-lg">
                    Painel Administrativo
                  </div>
                  <Text papel="legenda" tom="fraco" as="div">
                    Opus Atlas
                  </Text>
                </div>
              </Link>

              {/* Navigation - Desktop */}
              <nav className="hidden xl:flex items-center space-x-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                      item.isActive
                        ? 'text-theme-primary shadow-md'
                        : 'text-theme-tertiary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/admin/settings"
                  className="p-2 rounded-lg text-theme-tertiary transition-all"
                  title="Configurações"
                >
                  <PiGear className="w-4 h-4 lg:w-5 lg:h-5" />
                </Link>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 rounded-lg transition-all"
                >
                  <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-bold text-theme-primary">
                      {session.user.firstName?.charAt(0) ||
                        session.user.email?.charAt(0) ||
                        'A'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <Text
                      papel="rotulo"
                      tom="forte"
                      as="p"
                      className="font-medium"
                    >
                      {session.user.firstName || 'Admin'}
                    </Text>
                    <Text papel="legenda" tom="fraco" as="p">
                      Administrador
                    </Text>
                  </div>
                  <PiCaretDown
                    className={`w-3 h-3 lg:w-4 lg:h-4 text-theme-tertiary transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 lg:w-72 bg-theme-elevated rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-theme-secondary">
                      <Text
                        papel="rotulo"
                        tom="forte"
                        as="p"
                        className="font-medium"
                      >
                        {session.user.firstName || 'Admin'}{' '}
                        {session.user.lastName || ''}
                      </Text>
                      <Text papel="legenda" tom="fraco" as="p">
                        {session.user.email}
                      </Text>
                    </div>

                    <Link
                      href="/"
                      className="flex items-center space-x-3 px-4 py-2 text-theme-secondary transition-all text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <PiHouse className="w-4 h-4" />
                      <span>Ver Site Principal</span>
                    </Link>

                    <div className="border-t border-theme-secondary my-2" />

                    <Inline
                      as="button"
                      gap={3}
                      onClick={handleSignOut}
                      className="px-4 py-2 transition-all w-full text-sm"
                    >
                      <PiSignOut className="w-4 h-4" />
                      <span>Sair</span>
                    </Inline>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menus */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}
