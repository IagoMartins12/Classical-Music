import { redirect } from 'next/navigation';

/** Os relatórios de um aluno moram na tela de relatórios, filtrada por ele. */
export default async function StudentProgressPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  redirect(`/teacher/reports?student=${studentId}`);
}
