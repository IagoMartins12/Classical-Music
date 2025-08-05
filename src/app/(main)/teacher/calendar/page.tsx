import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherCalendarPageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Calendário de Aulas | Professor - Opus Atlas',
  description:
    'Visualize e gerencie sua agenda de aulas, horários disponíveis e cronograma de ensino',
  keywords:
    'calendário professor, agenda de aulas, horários, cronograma musical, gestão de tempo',
  openGraph: {
    title: 'Calendário do Professor - Opus Atlas',
    description:
      'Organize sua agenda de aulas e gerencie seu tempo de ensino de forma eficiente',
    type: 'website',
  },
};

export default async function TeacherCalendarPage() {
  const session = await getServerSession(authOptions);

  // Verificar se está logado
  if (!session?.user?.id) {
    return notFound();
  }

  // Verificar se tem role de professor (role 1)
  if (session.user.role !== 1) {
    return (
      <div className="bg-gradient-primary min-h-screen">
        <div className="section-wrap">
          <div className="flex items-center justify-center min-h-screen">
            <div className="classical-card p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-br from-accent-red to-accent-purple rounded-3xl flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-theme-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-theme-primary classical-title mb-4">
                Acesso Restrito
              </h1>
              <p className="text-theme-secondary classical-subtitle mb-6">
                Esta área é exclusiva para professores.
              </p>
              <a href="/teacher" className="btn-classical-primary">
                Voltar ao Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TeacherCalendarPageServer
      userId={session.user.id}
      userEmail={session.user.email || ''}
      userName={`${session.user.firstName || ''} ${
        session.user.lastName || ''
      }`.trim()}
      userImage={session.user.image}
      userRole={session.user.role}
    />
  );
}
