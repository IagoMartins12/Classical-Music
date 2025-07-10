// app/components/Admin/AdminHeader.tsx - Header para área admin com notificações
'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiShield, FiSettings, FiLogOut } from 'react-icons/fi';
import ReportQuickStats from '../../Report/ReportQuickStats';
import ReportNotifications from '../../Report/ReportNotifications';

export default function AdminHeader() {
  const { data: session } = useSession();

  if (!session?.user || session.user.role !== 2) return null;

  return (
    <div className="bg-theme-elevated border-b border-theme-primary sticky top-0 z-40">
      <div className="section-wrap">
        <div className="flex items-center justify-between py-4">
          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <Link
              href="/admin"
              className="flex items-center space-x-3 text-theme-primary hover:text-brand-primary transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent-red to-accent-amber rounded-lg flex items-center justify-center">
                <FiShield className="w-5 h-5 text-theme-primary" />
              </div>
              <span className="font-bold text-lg">Admin Panel</span>
            </Link>

            {/* Quick Stats */}
            <div className="hidden md:block">
              <ReportQuickStats />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Report Notifications */}
            <ReportNotifications />

            {/* Admin Menu */}
            <div className="flex items-center space-x-2">
              <Link
                href="/admin/reports"
                className="p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
                title="Dashboard de Reports"
              >
                <FiSettings className="w-5 h-5" />
              </Link>

              <Link
                href="/uploads/moderation"
                className="p-2 rounded-lg text-theme-tertiary hover:text-theme-primary hover:bg-theme-secondary transition-all"
                title="Moderação"
              >
                <FiShield className="w-5 h-5" />
              </Link>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 pl-4 border-l border-theme-secondary">
              <div className="text-right">
                <p className="text-sm font-medium text-theme-primary">
                  {session.user.firstName || session.user.email}
                </p>
                <p className="text-xs text-theme-tertiary">Administrador</p>
              </div>

              <button
                onClick={() => {
                  /* Implementar logout */
                }}
                className="p-2 rounded-lg text-theme-tertiary hover:text-accent-red hover:bg-accent-red/10 transition-all"
                title="Sair"
              >
                <FiLogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
