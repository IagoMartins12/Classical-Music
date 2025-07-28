// app/components/Admin/AdminHeader.tsx
'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiShield,
  FiSettings,
  FiLogOut,
  FiUsers,
  FiBarChart2,
  FiFlag,
  FiChevronDown,
  FiActivity,
  FiDatabase,
  FiHome,
  FiMenu,
} from 'react-icons/fi';
import { AdminStats } from '@/app/hooks/admin/useAdminStats';

interface QuickStat {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
  href?: string;
}

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
      icon: FiBarChart2,
      isActive: pathname === '/admin',
    },
    {
      href: '/admin/users',
      label: 'Usuários',
      icon: FiUsers,
      isActive: pathname.startsWith('/admin/users'),
    },
    {
      href: '/admin/moderation',
      label: 'Moderação',
      icon: FiShield,
      isActive: pathname.startsWith('/admin/moderation'),
    },
    {
      href: '/admin/reports-metric',
      label: 'Relatórios',
      icon: FiFlag,
      isActive: pathname.startsWith('/admin/reports-metric'),
    },
    {
      href: '/admin/analytics',
      label: 'Analytics',
      icon: FiActivity,
      isActive: pathname.startsWith('/admin/analytics'),
    },
  ];

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: '/',
      redirect: true,
    });
  };

  const formatQuickStatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <>
      <div className="bg-theme-elevated border-b border-theme-primary sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between py-3 lg:py-4">
            {/* Logo/Title + Mobile Menu Button */}
            <div className="flex items-center space-x-4 lg:space-x-8">
              {/* Mobile Menu Button */}
              <button
                id="menu-button"
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
              >
                <FiMenu className="w-5 h-5" />
              </button>

              {/* Logo */}
              <Link
                href="/admin"
                className="flex items-center space-x-2 lg:space-x-3 text-theme-primary hover:text-brand-primary transition-colors"
              >
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-accent-red to-accent-amber rounded-xl flex items-center justify-center shadow-lg">
                  <FiShield className="w-4 h-4 lg:w-6 lg:h-6 text-theme-primary" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-base lg:text-lg">
                    Admin Panel
                  </div>
                  <div className="text-xs text-theme-tertiary">
                    Classical Music Platform
                  </div>
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
                        ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-md'
                        : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary'
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
                  className="p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
                  title="Configurações"
                >
                  <FiSettings className="w-4 h-4 lg:w-5 lg:h-5" />
                </Link>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 rounded-lg hover:bg-theme-secondary transition-all"
                >
                  <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-accent-blue to-accent-purple rounded-lg flex items-center justify-center">
                    <span className="text-xs lg:text-sm font-bold text-theme-primary">
                      {session.user.firstName?.charAt(0) ||
                        session.user.email?.charAt(0) ||
                        'A'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-theme-primary">
                      {session.user.firstName || 'Admin'}
                    </p>
                    <p className="text-xs text-theme-tertiary">Administrador</p>
                  </div>
                  <FiChevronDown
                    className={`w-3 h-3 lg:w-4 lg:h-4 text-theme-tertiary transition-transform ${
                      showUserMenu ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 lg:w-72 bg-theme-elevated border border-theme-primary rounded-xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-theme-secondary">
                      <p className="font-medium text-theme-primary text-sm">
                        {session.user.firstName || 'Admin'}{' '}
                        {session.user.lastName || ''}
                      </p>
                      <p className="text-xs text-theme-tertiary">
                        {session.user.email}
                      </p>
                    </div>

                    <Link
                      href="/"
                      className="flex items-center space-x-3 px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary transition-all text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiHome className="w-4 h-4" />
                      <span>Ver Site Principal</span>
                    </Link>

                    <Link
                      href="/admin/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary transition-all text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Configurações</span>
                    </Link>

                    <div className="border-t border-theme-secondary my-2" />

                    <button
                      onClick={handleSignOut}
                      className="flex items-center space-x-3 px-4 py-2 text-accent-red hover:bg-accent-red/10 transition-all w-full text-sm"
                    >
                      <FiLogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </button>
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
