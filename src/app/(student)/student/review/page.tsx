// app/student/reviews/page.tsx - Página de Avaliações dos Professores (Aluno)

import { Metadata } from 'next';

import StudentReviewsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Avaliar Professores | Aluno - Opus Atlas',
  description:
    'Avalie seus professores e compartilhe sua experiência sobre as aulas de música',
  keywords:
    'avaliar professor, feedback aula, experiência musical, qualidade ensino, satisfação aluno',
  openGraph: {
    title: 'Avaliar Professores - Opus Atlas',
    description:
      'Compartilhe sua experiência e ajude outros alunos a encontrar os melhores professores',
    type: 'website',
  },
};

export default async function StudentReviewsPage() {
  const session = await getRequiredServerSession();

  return <StudentReviewsPageServer userId={session.user.id} />;
}
