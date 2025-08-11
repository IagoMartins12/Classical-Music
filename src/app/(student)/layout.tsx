// app/(student)/layout.tsx - SEM html, head, body
import type { Metadata } from 'next';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import { Toaster } from 'react-hot-toast';
import AdsProvider from '../components/Ads/AdsProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import StudentNavigation from '../components/TeacherSystem/StudentNavigation';

export const metadata: Metadata = {
  title: {
    template: '%s | Estudante - Opus Atlas',
    default: 'Área do Estudante - Opus Atlas',
  },
  description:
    'Área exclusiva para estudantes acompanharem progresso, aulas e desenvolvimento musical no Opus Atlas.',
  keywords: [
    'estudante de música',
    'progresso musical',
    'aulas de música',
    'desenvolvimento musical',
    'aprendizado musical',
    'Opus Atlas',
  ],
  authors: [{ name: 'Opus Atlas Team' }],
  creator: 'Opus Atlas',
  openGraph: {
    title: 'Área do Estudante - Opus Atlas',
    description:
      'Acompanhe seu progresso musical, acesse suas aulas e desenvolva suas habilidades.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Área do Estudante - Opus Atlas',
    description:
      'Plataforma para estudantes acompanharem seu desenvolvimento musical.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificar se está logado
  if (!session?.user?.id) {
    redirect('/not-authenticated');
  }

  // Verificar se tem role de professor (role 1)
  if (!session.user?.isStudent) {
    redirect('/access-denied');
  }
  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="min-h-screen bg-gradient-primary">
          {/* Navigation */}
          <StudentNavigation user={session.user} />

          {/* Main Content */}
          <main className="transition-all duration-300">{children}</main>
        </div>

        {/* Toast Notifications */}
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
                primary: 'var(--accent-green)',
                secondary: 'white',
              },
              style: {
                border: '1px solid var(--accent-green)',
                background:
                  'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
              },
            },
          }}
        />
      </FavoritesProvider>
    </AdsProvider>
  );
}
