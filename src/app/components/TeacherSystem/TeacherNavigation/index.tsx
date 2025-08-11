// app/(teacher)/components/TeacherNavigation.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiCalendar,
  FiBookOpen,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
} from 'react-icons/fi';
import { GiGrandPiano } from 'react-icons/gi';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/app/hooks/useAuth';
import {
  useAuthStore,
  useOnboardingModal,
} from '@/app/stores/authStore';
import { useFavoritesStore } from '@/app/stores/useFavoritesStore';
import { useLearningStore } from '@/app/stores/useLearningStore';
import { ThemeToggle } from '../../ThemeToggle';

interface TeacherNavigationProps {
  user: any;
}

interface NavItem {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
  badge?: string;
  submenu?: Array<{
    label: string;
    href: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
  }>;
}

export default function TeacherNavigation({ user }: TeacherNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { logout: authLogout } = useAuthStore();
  const { logout } = useAuth();
  const { reset } = useLearningStore();
  const { reset: resetFavorite } = useFavoritesStore();
  const { open } = useOnboardingModal();

  const profileRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigationItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/teacher',
      icon: FiHome,
      active: pathname === '/teacher',
    },
    {
      label: 'Alunos',
      icon: FiUsers,
      active: pathname.startsWith('/teacher/students'),
      href: '/teacher/students',
    },
    {
      label: 'Aulas',
      icon: FiCalendar,
      active: pathname.startsWith('/teacher/lessons'),
      submenu: [
        {
          label: 'Todas as Aulas',
          href: '/teacher/lessons',
          description: 'Gerenciar aulas e cronograma',
          icon: FiCalendar,
        },
        {
          label: 'Criar Aula',
          href: '/teacher/lessons/create',
          description: 'Agendar nova aula',
          icon: FiPlus,
        },
        {
          label: 'Calendário',
          href: '/teacher/calendar',
          description: 'Visualização em calendário',
          icon: FiCalendar,
        },
      ],
    },
    {
      label: 'Tarefas',
      href: '/teacher/assignments',
      icon: FiBookOpen,
      active: pathname.startsWith('/teacher/assignments'),
      submenu: [
        {
          label: 'Todas as Tarefas',
          href: '/teacher/assignments',
          description: 'Gerenciar tarefas dos alunos',
          icon: FiBookOpen,
        },
        {
          label: 'Criar Tarefa',
          href: '/teacher/assignments/create',
          description: 'Nova tarefa para alunos',
          icon: FiPlus,
        },
      ],
    },
    {
      label: 'Perfil',
      href: '/teacher/profile',
      icon: FiUser,
      active: pathname === '/teacher/profile',
    },
  ];

  const getUserDisplayName = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'Professor';
  };

  const getUserInitials = () => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.firstName) {
      return user.firstName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return 'P';
  };

  const handleLogout = async () => {
    try {
      resetFavorite();
      logout();
      reset();
      authLogout();
      await signOut({ redirect: false });
      toast.success('Logout realizado com sucesso!');
      setIsProfileOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Erro ao fazer logout');
    }
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

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setActiveSubmenu(null);
  };

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [pathname]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (submenuTimeoutRef.current) {
        clearTimeout(submenuTimeoutRef.current);
      }
    };
  }, [isProfileOpen]);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-theme-elevated/80 backdrop-blur-xl border-b border-theme-secondary">
        <div className="section-wrap py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-interactive-hover transition-colors"
              >
                {isSidebarOpen ? (
                  <FiX className="w-5 h-5 text-theme-secondary" />
                ) : (
                  <FiMenu className="w-5 h-5 text-theme-secondary" />
                )}
              </button>

              <Link href="/teacher" className="flex items-center group">
                <div className="relative">
                  <GiGrandPiano className="w-8 h-8 mr-3 text-brand-primary icon-glow transition-all duration-300 group-hover:scale-110" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl font-bold text-gradient-brand classical-title">
                    Opus Atlas
                  </span>
                  <div className="text-xs text-theme-tertiary font-medium">
                    Área do Professor
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() =>
                    item.submenu && handleMouseEnter(item.label)
                  }
                  onMouseLeave={() => item.submenu && handleMouseLeave()}
                >
                  {item.submenu ? (
                    <div className="flex items-center">
                      <button
                        className={`
                          relative px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2
                          ${
                            item.active
                              ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        <FiChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            activeSubmenu === item.label ? 'rotate-180' : ''
                          }`}
                        />
                      </button>

                      {/* Desktop Submenu */}
                      {activeSubmenu === item.label && (
                        <div className="absolute top-full left-0 mt-2 w-80 bg-theme-tertiary rounded-2xl shadow-xl border border-theme-secondary z-50 overflow-hidden">
                          <div className="p-2">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block p-3 rounded-lg hover:bg-interactive-hover transition-colors group"
                                onClick={() => setActiveSubmenu(null)}
                              >
                                <div className="flex items-center space-x-3">
                                  {subItem.icon && (
                                    <div className="w-8 h-8 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                                      <subItem.icon className="w-4 h-4 text-brand-primary" />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="font-medium text-theme-primary group-hover:text-brand-primary transition-colors">
                                      {subItem.label}
                                    </div>
                                    {subItem.description && (
                                      <div className="text-xs text-theme-tertiary mt-1">
                                        {subItem.description}
                                      </div>
                                    )}
                                  </div>
                                  {subItem.badge && (
                                    <span className="px-2 py-1 bg-accent-blue/20 text-accent-blue text-xs rounded-full">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href || '#'}
                      className={`
                        relative px-3 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2
                        ${
                          item.active
                            ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                            : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                        }
                      `}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-1 bg-accent-blue/20 text-accent-blue text-xs rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <ThemeToggle variant="navbar" className="hidden sm:block" />

              {/* Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-interactive-hover transition-colors group"
                >
                  {user.image ? (
                    <Image
                      src={user.image}
                      width={32}
                      height={32}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-brand-gradient rounded-full flex items-center justify-center text-theme-primary text-sm font-semibold border-2 border-brand-primary/20 group-hover:border-brand-primary/50 transition-all">
                      {getUserInitials()}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-theme-primary truncate max-w-32">
                      {getUserDisplayName()}
                    </p>
                    {!user.onboardingCompleted && (
                      <p className="text-xs text-accent-amber">
                        Complete seu perfil
                      </p>
                    )}
                  </div>

                  <FiChevronDown className="w-4 h-4 text-theme-tertiary" />
                </button>

                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-theme-secondary backdrop-blur-xl rounded-2xl shadow-xl border border-theme-secondary z-50 p-2">
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-theme-secondary mb-2">
                      <p className="font-medium text-theme-primary">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-sm text-theme-tertiary">
                        {user.email}
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs rounded-full">
                          Professor
                        </span>
                      </div>
                      {!user.onboardingCompleted && (
                        <button
                          onClick={open}
                          className="mt-2 w-full text-left px-2 py-1 bg-accent-amber/10 text-accent-amber text-xs rounded-lg hover:bg-accent-amber/20 transition-colors"
                        >
                          Clique para completar seu perfil
                        </button>
                      )}
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/teacher/profile"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiUser className="w-4 h-4" />
                      <span>Meu Perfil</span>
                    </Link>

                    <Link
                      href="/teacher/settings"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiSettings className="w-4 h-4" />
                      <span>Configurações</span>
                    </Link>

                    <Link
                      href="/"
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-all"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <FiHome className="w-4 h-4" />
                      <span>Voltar ao Site</span>
                    </Link>

                    <hr className="my-2 border-theme-secondary" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-accent-red hover:bg-accent-red/10 rounded-lg transition-all"
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
      </nav>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <div className="absolute left-0 top-0 h-full w-80 bg-theme-elevated border-r border-theme-secondary overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <GiGrandPiano className="w-8 h-8 mr-3 text-brand-primary" />
                  <div>
                    <span className="text-lg font-bold text-gradient-brand">
                      Opus Atlas
                    </span>
                    <div className="text-xs text-theme-tertiary">
                      Área do Professor
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-lg hover:bg-interactive-hover transition-colors"
                >
                  <FiX className="w-5 h-5 text-theme-secondary" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.label}>
                    {item.submenu ? (
                      <div>
                        <button
                          onClick={() =>
                            setActiveSubmenu(
                              activeSubmenu === item.label ? null : item.label
                            )
                          }
                          className={`
                            w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-all duration-300
                            ${
                              item.active
                                ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                                : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </div>
                          <FiChevronRight
                            className={`w-4 h-4 transition-transform duration-200 ${
                              activeSubmenu === item.label ? 'rotate-90' : ''
                            }`}
                          />
                        </button>

                        {/* Mobile Submenu */}
                        {activeSubmenu === item.label && (
                          <div className="ml-4 mt-2 space-y-1">
                            {item.submenu.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href}
                                className="block px-3 py-2 text-sm text-theme-tertiary hover:text-brand-primary hover:bg-interactive-hover rounded-lg transition-colors"
                                onClick={closeSidebar}
                              >
                                <div className="flex items-center space-x-2">
                                  {subItem.icon && (
                                    <subItem.icon className="w-4 h-4" />
                                  )}
                                  <span>{subItem.label}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href || '#'}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-all duration-300
                          ${
                            item.active
                              ? 'text-brand-primary bg-brand-primary/10 border border-brand-primary/20'
                              : 'text-theme-secondary hover:text-brand-primary hover:bg-interactive-hover'
                          }
                        `}
                        onClick={closeSidebar}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-1 bg-accent-blue/20 text-accent-blue text-xs rounded-full ml-auto">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>

              {/* Theme Toggle Mobile */}
              <div className="mt-8 pt-6 border-t border-theme-secondary">
                <ThemeToggle
                  variant="navbar"
                  className="w-full justify-center"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
