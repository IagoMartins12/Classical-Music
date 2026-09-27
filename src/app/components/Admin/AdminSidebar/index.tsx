// app/components/Admin/AdminSidebar.tsx - SEÇÃO ATUALIZADA
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  PiArticle,
  PiBroom,
  PiCaretDown,
  PiCaretRight,
  PiChartBar,
  PiChatCenteredText,
  PiClock,
  PiCurrencyDollar,
  PiDatabase,
  PiEnvelopeSimple,
  PiFileText,
  PiFingerprint,
  PiFlag,
  PiGear,
  PiHardDrive,
  PiMusicNotes,
  PiPaperPlaneRight,
  PiPercent,
  PiPulse,
  PiShield,
  PiTarget,
  PiTestTube,
  PiTrendUp,
  PiUploadSimple,
  PiUser,
  PiUsers,
} from 'react-icons/pi';
import { Text } from '@/app/components/ui/Text';
import { Stack } from '@/app/components/ui/Layout';

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
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'Principal',
  ]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionTitle)
        ? prev.filter((s) => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };
  const params = useSearchParams();

  const isActive = params.get('isActive');
  const hasAnnotations = params.get('hasAnnotations');
  const hasUploads = params.get('hasUploads');

  // Configurar seções da sidebar com dados reais
  const sidebarSections: SidebarSection[] = [
    {
      title: 'Principal',
      items: [
        {
          href: '/admin',
          label: 'Dashboard',
          icon: PiChartBar,
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
          icon: PiUsers,
          isActive: pathname === '/admin/users',
        },
        {
          href: '/admin/users/list',
          label: 'Todos',
          icon: PiUser,
          isActive:
            pathname === '/admin/users/list' &&
            !hasAnnotations &&
            !hasUploads &&
            !isActive,
        },
        {
          href: '/admin/users/list?hasAnnotations=true',
          label: 'Anotadores',
          icon: PiChatCenteredText,
          isActive:
            pathname === '/admin/users/list' && hasAnnotations ? true : false,
        },
        {
          href: '/admin/users/list?hasUploads=true',
          label: 'Contribuidores',
          icon: PiUploadSimple,
          isActive:
            pathname === '/admin/users/list' && hasUploads ? true : false,
        },
        {
          href: '/admin/users/list?isActive=true',
          label: 'Usuários Ativos',
          icon: PiPulse,
          isActive: pathname === '/admin/users/list' && isActive ? true : false,
        },
      ],
    },
    {
      title: 'Conteúdo',
      items: [
        {
          href: '/admin/composers',
          label: 'Compositores',
          icon: PiUsers,
          isActive: pathname.startsWith('/admin/composers'),
        },
        {
          href: '/admin/works',
          label: 'Obras',
          icon: PiMusicNotes,
          isActive: pathname.startsWith('/admin/works'),
        },
        {
          href: '/admin/scores',
          label: 'Partituras',
          icon: PiFileText,
          isActive: pathname.startsWith('/admin/scores'),
        },
        {
          href: '/admin/uploads',
          label: 'Uploads',
          icon: PiUploadSimple,
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
          icon: PiShield,

          isActive: pathname.startsWith('/uploads/moderation'),
        },
        {
          href: '/admin/reports-metric',
          label: 'Reports',
          icon: PiFlag,

          isActive: pathname.startsWith('/admin/reports-metric'),
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
          icon: PiEnvelopeSimple,

          isActive: pathname === '/admin/newsletter',
        },
        {
          href: '/admin/newsletter/subscribers',
          label: 'Subscribers',
          icon: PiUsers,
          isActive: pathname.startsWith('/admin/newsletter/subscribers'),
        },
        {
          href: '/admin/newsletter/campaigns',
          label: 'Campanhas',
          icon: PiPaperPlaneRight,
          isActive: pathname.startsWith('/admin/newsletter/campaigns'),
        },
        {
          href: '/admin/newsletter/templates',
          label: 'Templates',
          icon: PiFileText,
          isActive: pathname.startsWith('/admin/newsletter/templates'),
        },
        {
          href: '/admin/newsletter/analytics',
          label: 'Analytics',
          icon: PiTrendUp,
          isActive: pathname.startsWith('/admin/newsletter/analytics'),
        },
        {
          label: 'Listas de Teste',
          href: '/admin/newsletter/test-lists',
          icon: PiTestTube,
          isActive: pathname.startsWith('/admin/newsletter/test-lists'),
        },
      ],
    },
    {
      title: 'Sistema & Backup',
      items: [
        {
          href: '/admin/backup',
          label: 'Gerenciar Backup',
          icon: PiHardDrive,
          isActive: pathname.startsWith('/admin/backup'),
        },

        {
          href: '/admin/cron',
          label: 'Tarefas Agendadas',
          icon: PiClock,
          isActive: pathname.startsWith('/admin/cron'),
        },

        {
          href: '/admin/system',
          label: 'Sistema',
          icon: PiGear,
          isActive: pathname.startsWith('/admin/system'),
        },

        {
          href: '/admin/database',
          label: 'Database Studio',
          icon: PiDatabase,
          isActive: pathname.startsWith('/admin/database'),
        },
      ],
    },
    {
      title: 'Publicidades',
      items: [
        {
          href: '/admin/ads',
          label: 'Gerenciar Ads',
          icon: PiTarget, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/ads'),
        },
      ],
    },
    {
      title: 'Limpeza',
      items: [
        {
          href: '/admin/orphan-files',
          label: 'Limpar Arquivos',
          icon: PiBroom, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/orphan-files'),
        },
      ],
    },
    {
      title: 'Analytics',
      items: [
        {
          href: '/admin/analytics',
          label: 'Analytics',
          icon: PiPulse,
          isActive: pathname.startsWith('/admin/analytics'),
        },
        {
          href: '/admin/insights',
          label: 'Insights',
          icon: PiTrendUp,
          isActive: pathname.startsWith('/admin/insights'),
        },
      ],
    },
    {
      title: 'Blog',
      items: [
        {
          href: '/admin/blog/media',
          label: 'Gerenciar Media do blog',
          icon: PiArticle, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/blog/media'),
        },
        {
          href: '/admin/scrapers',
          label: 'Ver Scrapers de eventos',
          icon: PiFingerprint, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/scrapers'),
        },
      ],
    },
    {
      title: 'Pricing',
      items: [
        {
          href: '/admin/plans/pricing',
          label: 'Gerenciar Planos',
          icon: PiCurrencyDollar, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/plans/pricing'),
        },
        {
          href: '/admin/plans/subscribers',
          label: 'Gerenciar Assinantes',
          icon: PiCurrencyDollar, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/plans/subscribers'),
        },
        {
          href: '/admin/plans/coupons',
          label: 'Gerenciar Cupons do site',
          icon: PiPercent, // Adicionar ao imports: PiTarget
          isActive: pathname.startsWith('/admin/plans/coupons'),
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
            </div>
            {isExpanded ? (
              <PiCaretDown className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
            ) : (
              <PiCaretRight className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={`flex items-center justify-between px-3 lg:px-4 py-2 lg:py-3 rounded-xl transition-all text-sm lg:text-base ${
              isChild ? 'ml-3 lg:ml-4' : ''
            } ${
              item.isActive
                ? 'bg-theme-tertiary from-brand-primary to-brand-secondary text-theme-primary shadow-md'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary'
            }`}
          >
            <div className="flex items-center space-x-2 lg:space-x-3 min-w-0">
              <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              <span className="font-medium truncate">{item.label}</span>
            </div>
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
    <aside className="block w-full md:w-64 bg-theme-elevated border-r border-theme-primary h-[calc(100vh-80px)] overflow-y-auto">
      <div className="p-4 lg:p-6">
        {/* Sidebar Header */}
        <Stack gap={2} className="mb-6 lg:mb-8">
          <h2 className="text-lg font-bold text-theme-primary">
            Painel Administrativo
          </h2>
          <Text papel="rotulo" tom="fraco" as="p">
            Gerencie toda a plataforma
          </Text>
        </Stack>

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
                  <PiCaretDown className="w-3 h-3" />
                ) : (
                  <PiCaretRight className="w-3 h-3" />
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
      </div>
    </aside>
  );
}
