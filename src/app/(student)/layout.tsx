// app/(student)/layout.tsx - ATUALIZADO COM VERIFICAÇÃO DE STUDENT
import type { Metadata } from 'next';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import { Toaster } from 'react-hot-toast';
import AdsProvider from '../components/Ads/AdsProvider';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import StudentNavigation from '../components/TeacherSystem/StudentNavigation';
import NotificationManager from '../components/Notification/NotificationManager';
import StudentVerificationRequired from '../components/VerificationsProviders/StudentVerificationRequired';

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

  // Verificar se tem role de estudante
  if (!session.user?.isStudent && !session.user.studentInviteStatus) {
    redirect('/access-denied');
  }

  // 🆕 VERIFICAR STATUS DO CONVITE DO STUDENT
  console.log('🔍 Verificando status do student:', {
    userId: session.user.id,
    isStudent: session.user.isStudent,
    studentInviteStatus: session.user.studentInviteStatus,
  });

  // Se não tem professor vinculado (null/undefined), redirecionar para página específica
  if (!session.user.studentInviteStatus) {
    console.log(
      '⚠️ Student sem professor vinculado, redirecionando para access-denied'
    );
    redirect('/access-denied?reason=no_teacher');
  }

  // Se convite foi DECLINED, redirecionar para access-denied
  if (session.user.studentInviteStatus === 'DECLINED') {
    console.log(
      '❌ Convite de student foi recusado, redirecionando para access-denied'
    );
    redirect('/access-denied?reason=invite_declined');
  }

  // Se convite está EXPIRED, redirecionar para access-denied
  if (session.user.studentInviteStatus === 'EXPIRED') {
    console.log(
      '⏰ Convite de student expirou, redirecionando para access-denied'
    );
    redirect('/access-denied?reason=invite_expired');
  }

  // Se convite está PENDING, mostrar tela de aguardando aprovação
  if (session.user.studentInviteStatus === 'PENDING') {
    console.log(
      '⏳ Student com convite pendente, mostrando tela de aguardando aprovação'
    );

    return (
      <StudentVerificationRequired
        userEmail={session.user.email}
        userName={session.user.firstName || session.user.name || undefined}
      />
    );
  }

  // Se chegou aqui, o status deve ser ACCEPTED - liberar acesso completo
  if (session.user.studentInviteStatus === 'ACCEPTED') {
    console.log('✅ Student com convite aceito, liberando acesso completo');
  } else {
    // Caso inesperado - log de debug e redirecionar por segurança
    console.warn(
      '⚠️ Status inesperado do student:',
      session.user.studentInviteStatus
    );
    redirect('/access-denied?reason=unknown_status');
  }

  return (
    <AdsProvider>
      <FavoritesProvider>
        {/* 🆕 NOTIFICATION MANAGER - Gerencia notificações em background */}
        <NotificationManager userRole="student" userId={session.user.id}>
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
        </NotificationManager>
      </FavoritesProvider>
    </AdsProvider>
  );
}
