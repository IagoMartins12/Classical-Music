// app/admin/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ClientThemeWrapper } from '../components/ClientThemeWrapper';
import AuthProvider from '../providers/AuthProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import AdminLayoutClient from './AdminLayoutClient';
import { redirect } from 'next/navigation';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Admin Panel | Classical Music Platform',
  description: 'Painel administrativo da plataforma de música clássica',
  robots: 'noindex, nofollow',
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário é admin
  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0a0a0a"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientThemeWrapper>
          <AuthProvider>
            <AdminLayoutClient>{children}</AdminLayoutClient>;
            {/* Notificações toast otimizadas */}
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
                    primary: 'var(--brand-primary)',
                    secondary: 'white',
                  },
                  style: {
                    border: '1px solid var(--brand-primary)',
                    background:
                      'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
                  },
                },
              }}
            />
          </AuthProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
