// app/uploads/moderation/page.tsx
import { Metadata } from 'next';
import ModerationClient from '@/app/(main)/moderation/pageClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Moderação de Uploads | Classical Music App',
  description: 'Gerencie reports e moderações de uploads',
};

export default async function ModerationPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
  }>;
}) {
  const resolvedSearchParams = await searchParams;
  const page = Number(resolvedSearchParams.page) || 1;
  const status = resolvedSearchParams.status || 'pending';

  return <ModerationClient page={page} status={status} isAdmin />;
}
