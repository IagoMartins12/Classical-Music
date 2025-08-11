// app/teacher/lessons/[id]/page.tsx - Página de Detalhes da Aula

import { Metadata } from 'next';

import { notFound } from 'next/navigation';
import TeacherLessonDetailsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface lessonProps {
  id: string;
}

interface LessonIdProps {
  params: Promise<lessonProps>;
}

export async function generateMetadata(): Promise<Metadata> {
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

export default async function TeacherLessonDetailsPage({
  params,
}: LessonIdProps) {
  const resolvedParams = await params;

  const lessonId = resolvedParams.id;

  const session = await getRequiredServerSession();

  // Verificar se ID da aula é válido
  if (!lessonId || lessonId.length !== 24) {
    return notFound();
  }

  return (
    <TeacherLessonDetailsPageServer
      lessonId={lessonId}
      userId={session.user.id}
      userRole={session.user.role}
    />
  );
}
