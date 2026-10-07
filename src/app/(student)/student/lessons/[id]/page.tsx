import type { Metadata } from 'next';
import { LessonsScreen } from '@/app/components/Portal/screens/LessonsScreen';

export const metadata: Metadata = { title: 'Aula' };

/** O link direto de uma aula (avisos, e-mails) abre a lista com ela aberta. */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LessonsScreen role="student" initialId={id} />;
}
