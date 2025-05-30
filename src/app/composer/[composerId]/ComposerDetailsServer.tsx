// app/composer/[composerId]/ComposerDetailsServer.tsx
import { notFound } from 'next/navigation';
import { getComposerById } from '@/app/requests/composer-details';
import ComposerDetailsClient from '@/app/components/ComposerDetailsClient';

interface ComposerDetailsServerProps {
  composerId: string;
}

export default async function ComposerDetailsServer({
  composerId,
}: ComposerDetailsServerProps) {
  try {
    const composer = await getComposerById(composerId);

    if (!composer) {
      notFound();
    }

    return <ComposerDetailsClient composer={composer} />;
  } catch (error) {
    console.error('Erro ao carregar compositor:', error);
    notFound();
  }
}
