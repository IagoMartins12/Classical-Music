// app/teacher/lessons/[id]/edit/page.tsx - Página de Editar Aula

import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { notFound } from 'next/navigation';
import EditLessonPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

interface EditLessonPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: EditLessonPageProps): Promise<Metadata> {
  return {
    title: 'Editar Aula | Professor - Opus Atlas',
    description: 'Edite os detalhes da aula, reagende e atualize informações',
    keywords:
      'editar aula professor, reagendar aula, modificar aula, gestão ensino',
  };
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
  const session = await getRequiredServerSession();

  return (
    <EditLessonPageServer
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
