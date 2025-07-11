// app/admin/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { ClientThemeWrapper } from '../components/ClientThemeWrapper';
import Navbar from '../components/Navbar';
import AuthProvider from '../providers/AuthProvider';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import AdminLayoutClient from './AdminLayoutClient';
import { redirect } from 'next/navigation';

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
          </AuthProvider>
        </ClientThemeWrapper>
      </body>
    </html>
  );
}
