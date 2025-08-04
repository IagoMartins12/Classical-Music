// app/components/Admin/AdminLayoutClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminHeader from '../components/Admin/AdminHeader';
import AdminSidebar from '../components/Admin/AdminSidebar';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fechar sidebar em mobile quando a rota mudar
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleOnMenuClick = () => {
    setSidebarOpen(true);
  };
  // Fechar sidebar quando clicar fora (mobile)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('admin-sidebar');
        const menuButton = document.getElementById('menu-button');

        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          !menuButton?.contains(event.target as Node)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  return (
    <div className="bg-theme-primary">
      {/* Header */}
      <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        <div
          id="admin-sidebar"
          className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-theme-elevated border-r border-theme-primary transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ top: '80px' }} // Account for header height
        >
          <div className="h-full overflow-y-auto">
            <AdminSidebar />
          </div>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            style={{ top: '80px' }} // Account for header height
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
