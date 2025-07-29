// app/components/Admin/AdminSidebar.tsx - SEÇÃO ATUALIZADA
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FiBarChart2,
  FiUsers,
  FiShield,
  FiFlag,
  FiActivity,
  FiSettings,
  FiDatabase,
  FiFileText,
  FiMusic,
  FiUpload,
  FiTrendingUp,
  FiMessageSquare,
  FiHeart,
  FiTarget,
  FiAward,
  FiChevronDown,
  FiChevronRight,
  FiHardDrive,
  FiSend,
  FiMail, // Nova importação para backup
} from 'react-icons/fi';
import { useAdminStats } from '@/app/hooks/admin/useAdminStats';
import { BiTestTube } from 'react-icons/bi';

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>;
  badge?: number | string;
  isActive?: boolean;
  children?: SidebarItem[];
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { stats, loading } = useAdminStats();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Principal',
  ]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  // Função segura para formatação de badges
  const formatBadge = (badge: number | string | undefined): string => {
    if (!badge || !mounted) return '';
    if (typeof badge === 'string') return badge;
    if (badge >= 1000000) return `${(badge / 1000000).toFixed(1)}M`;
    if (badge >= 1000) return `${(badge / 1000).toFixed(1)}K`;
    return badge.toString();
  };

  // Configurar seções da sidebar com dados reais
  const sidebarSections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        {
          href: '/admin',
          label: 'Dashboard',
          icon: FiBarChart2,
          isActive: pathname === '/admin',
        },
      ],
    },
    {
      title: 'Usuários',
      items: [
        {
          href: '/admin/users',
          label: 'Usuários',
          icon: FiUsers,
          badge: mounted && stats ? stats.overview.totalUsers : undefined,
          isActive: pathname.startsWith('/admin/users'),
          children: [
            {
              href: '/admin/users/active',
              label: 'Usuários Ativos',
              icon: FiActivity,
              isActive: pathname === '/admin/users/active',
            },
            {
              href: '/admin/users/contributors',
              label: 'Contribuidores',
              icon: FiUpload,
              isActive: pathname === '/admin/users/contributors',
            },
            {
              href: '/admin/users/annotators',
              label: 'Anotadores',
              icon: FiMessageSquare,
              isActive: pathname === '/admin/users/annotators',
            },
          ],
        },
      ],
    },
    {
      title: 'Conteúdo',
      items: [
        {
          href: '/admin/composers',
          label: 'Compositores',
          icon: FiUsers,
          badge: mounted && stats ? stats.overview.totalComposers : undefined,
          isActive: pathname.startsWith('/admin/composers'),
        },
        {
          href: '/admin/works',
          label: 'Obras',
          icon: FiMusic,
          badge: mounted && stats ? stats.overview.totalWorks : undefined,
          isActive: pathname.startsWith('/admin/works'),
        },
        {
          href: '/admin/scores',
          label: 'Partituras',
          icon: FiFileText,
          badge: mounted && stats ? stats.overview.totalScores : undefined,
          isActive: pathname.startsWith('/admin/scores'),
        },
        {
          href: '/admin/uploads',
          label: 'Uploads',
          icon: FiUpload,
          badge:
            mounted && stats ? stats.trends.last7Days.newUploads : undefined,
          isActive: pathname.startsWith('/admin/uploads'),
        },
      ],
    },
    {
      title: 'Moderação',
      items: [
        {
          href: '/admin/moderation',
          label: 'Moderação',
          icon: FiShield,
          badge:
            mounted && stats?.moderation
              ? stats.moderation.pendingItems
              : undefined,
          isActive: pathname.startsWith('/uploads/moderation'),
        },
        {
          href: '/admin/report',
          label: 'Reports',
          icon: FiFlag,
          badge:
            mounted && stats?.moderation
              ? stats.moderation.totalReports
              : undefined,
          isActive: pathname.startsWith('/admin/reports'),
        },
      ],
    },
    // 🆕 SEÇÃO DE NEWSLETTER
    {
      title: 'Newsletter & Email',
      items: [
        {
          href: '/admin/newsletter',
          label: 'Dashboard',
          icon: FiMail,

          isActive: pathname === '/admin/newsletter',
        },
        {
          href: '/admin/newsletter/subscribers',
          label: 'Subscribers',
          icon: FiUsers,
          isActive: pathname.startsWith('/admin/newsletter/subscribers'),
        },
        {
          href: '/admin/newsletter/campaigns',
          label: 'Campanhas',
          icon: FiSend,
          isActive: pathname.startsWith('/admin/newsletter/campaigns'),
        },
        {
          href: '/admin/newsletter/templates',
          label: 'Templates',
          icon: FiFileText,
          isActive: pathname.startsWith('/admin/newsletter/templates'),
        },
        {
          href: '/admin/newsletter/analytics',
          label: 'Analytics',
          icon: FiTrendingUp,
          isActive: pathname.startsWith('/admin/newsletter/analytics'),
        },
        {
          label: 'Listas de Teste',
          href: '/admin/newsletter/test-lists',
          icon: BiTestTube,
        },

        {
          href: '/admin/newsletter/backup',
          label: 'Backup',
          icon: FiHardDrive,
          isActive: pathname.startsWith('/admin/newsletter/backup'),
        },
        {
          href: '/admin/newsletter/settings',
          label: 'Configurações',
          icon: FiSettings,
          isActive: pathname.startsWith('/admin/newsletter/settings'),
        },
      ],
    },
    // 🆕 NOVA SEÇÃO DE BACKUP
    {
      title: 'Sistema & Backup',
      items: [
        {
          href: '/admin/backup',
          label: 'Gerenciar Backup',
          icon: FiHardDrive,
          isActive: pathname.startsWith('/admin/backup'),
        },

        {
          href: '/admin/system',
          label: 'Sistema',
          icon: FiDatabase,
          isActive: pathname.startsWith('/admin/system'),
        },
      ],
    },
    {
      title: 'Publicidades',
      items: [
        {
          href: '/admin/ads',
          label: 'Gerenciar Ads',
          icon: FiTarget, // Adicionar ao imports: FiTarget
          // badge: mounted && stats ? stats.ads?.totalActive : undefined,
          isActive: pathname.startsWith('/admin/ads'),
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          href: '/admin/analytics',
          label: 'Analytics',
          icon: FiActivity,
          isActive: pathname.startsWith('/admin/analytics'),
        },
        {
          href: '/admin/insights',
          label: 'Insights',
          icon: FiTrendingUp,
          isActive: pathname.startsWith('/admin/insights'),
        },
      ],
    },
  ];

  const renderSidebarItem = (item: SidebarItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.label);

    return (
      <div key={item.href}>
        {hasChildren ? (
          <button
            onClick={() => toggleSection(item.label)}
            className={`w-full flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all text-sm lg:text-base ${
              isChild ? 'ml-3 lg:ml-4' : ''
            } ${
              item.isActive
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-md'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary'
            }`}
          >
            <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
              {item.badge && mounted && !loading && (
                <span className="px-1.5 lg:px-2 py-0.5 bg-accent-red text-theme-primary text-xs font-bold rounded-full flex-shrink-0">
                  {formatBadge(item.badge)}
                </span>
              )}
            </div>
            {isExpanded ? (
              <FiChevronDown className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
            ) : (
              <FiChevronRight className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all text-sm lg:text-base ${
              isChild ? 'ml-3 lg:ml-4' : ''
            } ${
              item.isActive
                ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-theme-primary shadow-md'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary'
            }`}
          >
            <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </div>
            {item.badge && mounted && !loading && (
              <span className="px-1.5 lg:px-2 py-0.5 bg-accent-red text-theme-primary text-xs font-bold rounded-full flex-shrink-0">
                {formatBadge(item.badge)}
              </span>
            )}
          </Link>
        )}

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 lg:mt-2 space-y-1">
            {item.children!.map((child) => renderSidebarItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="hidden lg:block w-64 bg-theme-elevated border-r border-theme-primary h-[calc(100vh-80px)] overflow-y-auto">
      <div className="p-4 lg:p-6">
        {/* Sidebar Header */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg font-bold text-theme-primary mb-2">
            Painel Administrativo
          </h2>
          <p className="text-sm text-theme-tertiary">
            Gerencie toda a plataforma
          </p>
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4 lg:space-y-6">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full mb-2 lg:mb-3 text-xs font-bold text-theme-tertiary uppercase tracking-wider hover:text-theme-primary transition-colors"
              >
                <span>{section.title}</span>
                {expandedSections.includes(section.title) ? (
                  <FiChevronDown className="w-3 h-3" />
                ) : (
                  <FiChevronRight className="w-3 h-3" />
                )}
              </button>

              {expandedSections.includes(section.title) && (
                <div className="space-y-1">
                  {section.items.map((item) => renderSidebarItem(item))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* System Status */}
        <div className="mt-6 lg:mt-8 p-3 lg:p-4 bg-theme-secondary rounded-xl">
          <h3 className="text-sm font-bold text-theme-primary mb-3 flex items-center space-x-2">
            <FiActivity className="w-4 h-4 text-accent-green" />
            <span>Status do Sistema</span>
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-tertiary">API</span>
              <div className="w-2 h-2 bg-accent-green rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-tertiary">Database</span>
              <div className="w-2 h-2 bg-accent-green rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-tertiary">Backup</span>
              <div className="w-2 h-2 bg-accent-green rounded-full"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-theme-tertiary">Cache</span>
              <div className="w-2 h-2 bg-accent-amber rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
