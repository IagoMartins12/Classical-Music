// app/teacher/reviews/page.tsx - Página de Avaliações Recebidas

import { Metadata } from 'next';
import TeacherReviewsPageServer from './pageServer';
import { getRequiredServerSession } from '@/app/utils/sessionUtils';

export const metadata: Metadata = {
  title: 'Avaliações Recebidas | Professor - Opus Atlas',
  description:
    'Visualize todas as avaliações e feedbacks recebidos dos seus alunos, acompanhe sua reputação como professor',
  keywords:
    'avaliações professor, feedback alunos, reputação ensino, reviews professores, qualidade ensino',
  openGraph: {
    title: 'Avaliações do Professor - Opus Atlas',
    description:
      'Acompanhe seu desempenho através das avaliações dos alunos e feedback recebido',
    type: 'website',
  },
};

export default async function TeacherReviewsPage() {
  const session = await getRequiredServerSession();

  return <TeacherReviewsPageServer userId={session.user.id} />;
}
