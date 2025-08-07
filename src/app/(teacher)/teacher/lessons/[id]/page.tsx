// app/teacher/lessons/[id]/page.tsx - Página de Detalhes da Aula

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import TeacherLessonDetailsPageServer from './pageServer';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  return {
    title: `Detalhes da Aula | Professor - Opus Atlas`,
    description:
      'Visualize e edite todos os detalhes da aula, progresso do aluno e materiais de estudo',
    keywords:
      'detalhes aula professor, progresso aluno, notas aula, homework, gestão ensino',
    openGraph: {
      title: 'Detalhes da Aula - Professor | Opus Atlas',
      description:
        'Acesso completo aos detalhes da aula, progresso e materiais pedagógicos',
      type: 'website',
    },
  };
}

export default async function TeacherLessonDetailsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const lessonId = params.id;

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

  // Verificar se ID da aula é válido
  if (!lessonId || lessonId.length !== 24) {
    return notFound();
  }

  return (
    <TeacherLessonDetailsPageServer
      lessonId={lessonId}
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
