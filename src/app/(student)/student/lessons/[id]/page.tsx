// app/student/lessons/[id]/page.tsx - Página de Detalhes da Aula (Aluno)

import { Metadata } from 'next';

import { notFound } from 'next/navigation';
import StudentLessonDetailPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface StudentLessonDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: StudentLessonDetailPageProps): Promise<Metadata> {
  return {
    title: `Detalhes da Aula | Aluno - Opus Atlas`,
    description:
      'Visualize os detalhes da aula, materiais de estudo, objetivos e adicione seu feedback',
    keywords:
      'aula música, detalhes aula, materiais estudo, feedback aluno, partituras',
    openGraph: {
      title: 'Detalhes da Aula - Opus Atlas',
      description: 'Acesse informações detalhadas sobre sua aula de música',
      type: 'website',
    },
  };
}

export default async function StudentLessonDetailPage({
  params,
}: StudentLessonDetailPageProps) {
  const session = await getRequiredServerSession();

  // Validar ID da aula
  if (!params.id || typeof params.id !== 'string') {
    return notFound();
  }

  return (
    <StudentLessonDetailPageServer
      lessonId={params.id}
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
