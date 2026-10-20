import type { Metadata } from 'next';
import { StudentPage } from '@/app/components/Portal/screens/StudentPage';

export const metadata: Metadata = { title: 'Aluno' };

/** `studentId` é o perfil de aluno (Student.id), como no resto do portal. */
export default async function TeacherStudentPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  return <StudentPage studentId={studentId} />;
}
