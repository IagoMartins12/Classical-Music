// app/student/lessons/[id]/page.tsx - Página de Detalhes da Aula (Aluno)

import { Metadata } from 'next';

import { notFound } from 'next/navigation';
import StudentLessonDetailPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface lessonProps {
  id: string;
}

interface LessonIdProps {
  params: Promise<lessonProps>;
}

export async function generateMetadata(): Promise<Metadata> {
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
}: LessonIdProps) {
  const resolvedParams = await params;
  const lessonId = resolvedParams.id;

  const session = await getRequiredServerSession();

  // Validar ID da aula
  if (!lessonId || lessonId.length !== 24) {
    return notFound();
  }

  return (
    <StudentLessonDetailPageServer
      lessonId={lessonId}
      userId={session.user.id}
    />
  );
}
