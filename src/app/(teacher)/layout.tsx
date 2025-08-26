// app/(teacher)/layout.tsx - ATUALIZADO COM VERIFICAÇÃO DE TEACHER
import type { Metadata } from 'next';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import { Toaster } from 'react-hot-toast';
import AdsProvider from '../components/Ads/AdsProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import TeacherNavigation from '../components/TeacherSystem/TeacherNavigation';
import NotificationManager from '../components/Notification/NotificationManager';
import TeacherVerificationRequired from '../components/VerificationsProviders/TeacherVerificationRequired';

export const metadata: Metadata = {
  title: {
    template: '%s | Professor - Opus Atlas',
    default: 'Área do Professor - Opus Atlas',
  },
  description:
    'Plataforma completa para professores de música gerenciarem alunos, aulas e cronograma musical.',
  keywords: [
    'professor de música',
    'gestão de alunos',
    'aulas de música',
    'cronograma musical',
    'ensino musical',
    'Opus Atlas',
  ],
  authors: [{ name: 'Opus Atlas Team' }],
  creator: 'Opus Atlas',
  openGraph: {
    title: 'Área do Professor - Opus Atlas',
    description:
      'Gerencie seus alunos, aulas e cronograma de ensino musical de forma profissional.',
    type: 'website',
    locale: 'pt_BR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Área do Professor - Opus Atlas',
    description:
      'Plataforma completa para professores de música gerenciarem seu ensino.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function TeacherLayout({
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
  if (!session.user.isTeacher || session.user.role !== 1) {
    redirect('/access-denied');
  }

  // Se teacherVerified for false ou null, mostrar tela de verificação
  if (
    session.user.teacherVerified === false ||
    session.user.teacherVerified === null
  ) {
    return (
      <TeacherVerificationRequired
        userEmail={session.user.email}
        userName={session.user.firstName || session.user.name || undefined}
      />
    );
  }

  return (
    <AdsProvider>
      <FavoritesProvider>
        {/* 🆕 NOTIFICATION MANAGER - Gerencia notificações em background */}
        <NotificationManager userRole="teacher" userId={session.user.id}>
          <div className="min-h-screen bg-gradient-primary">
            {/* Navigation */}
            <TeacherNavigation user={session.user} />

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
        </NotificationManager>
      </FavoritesProvider>
    </AdsProvider>
  );
}
