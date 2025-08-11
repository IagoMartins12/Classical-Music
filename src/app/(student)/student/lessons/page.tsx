// app/student/lessons/page.tsx - Página Principal das Aulas do Aluno

import { Metadata } from 'next';

import StudentLessonsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Minhas Aulas | Aluno - Opus Atlas',
  description:
    'Visualize suas aulas passadas e futuras, acompanhe seu progresso musical e acesse os materiais de estudo',
  keywords:
    'aulas música, progresso musical, cronograma estudo, partituras, feedback professor',
  openGraph: {
    title: 'Minhas Aulas - Opus Atlas',
    description:
      'Acompanhe suas aulas de música e o progresso nos estudos musicais',
    type: 'website',
  },
};

export default async function StudentLessonsPage() {
  const session = await getRequiredServerSession();

  return <StudentLessonsPageServer userId={session.user.id} />;
}
