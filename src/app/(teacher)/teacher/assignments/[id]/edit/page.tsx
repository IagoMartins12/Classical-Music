import { redirect } from 'next/navigation';

/** A edição mora na folha da tarefa; o endereço antigo leva até ela. */
export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/teacher/assignments/${id}`);
}
