// app/(admin)/layout.tsx - SEM html, head, body
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import AdsProvider from '../components/Ads/AdsProvider';
import AdminLayoutClient from './AdminLayoutClient';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin - Opus Atlas',
    default: 'Painel Administrativo - Opus Atlas',
  },
  description: 'Painel administrativo da plataforma de música clássica',
  robots: 'noindex, nofollow',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário é admin (role 2)
  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/access-denied');
  }

  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-gradient-primary">
          <AdminLayoutClient>{children}</AdminLayoutClient>

          {/* Toaster específico para área admin */}
          <Toaster
            position="top-center"
            containerClassName="toast-container"
            toastOptions={{
              duration: 4000,
              className: 'toast-item',
              style: {
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                backdropFilter: 'blur(8px)',
                maxWidth: '400px',
              },
              success: {
                iconTheme: {
                  primary: 'var(--accent-green)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--accent-green)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
                },
              },
              error: {
                iconTheme: {
                  primary: 'var(--accent-red)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--accent-red)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
                },
              },
              loading: {
                iconTheme: {
                  primary: 'var(--accent-red)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--accent-red)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
                },
              },
            }}
          />
        </div>
      </FavoritesProvider>
    </AdsProvider>
  );
}
