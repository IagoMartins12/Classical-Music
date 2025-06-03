// app/composer/[composerId]/ComposerDetailsServer.tsx
import { notFound } from 'next/navigation';
import {
  getComposerById,
  getComposerWorks,
} from '@/app/requests/composer-details';
import ComposerDetailsClient from '@/app/components/ComposerDetailsClient';
import ComposerWorks from '@/app/components/ComposersClient/ComposerWorks';

interface ComposerDetailsServerProps {
  composerId: string;
}

export default async function ComposerDetailsServer({
  composerId,
}: ComposerDetailsServerProps) {
  try {
    // Carregar dados do compositor e obras em paralelo para máxima performance
    const [composer, works] = await Promise.all([
      getComposerById(composerId),
      getComposerWorks(composerId),
    ]);

    if (!composer) {
      notFound();
    }

    return (
      <>
        <ComposerDetailsClient composer={composer} works={works} />
      </>
    );
  } catch (error) {
    console.error('Erro ao carregar compositor:', error);
    notFound();
  }
}
