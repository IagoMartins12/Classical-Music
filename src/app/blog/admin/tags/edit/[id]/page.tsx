import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FormularioDeTag } from '@/app/components/blog/escrita/FormularioDeTaxonomia';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { loadAdminTag } from '@/app/requests/blog/admin';

export const metadata: Metadata = { title: 'Editar tag' };

export default async function EditarTag({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await loadAdminTag(id, await getServerAccessToken()).catch(
    () => null
  );
  if (!tag) notFound();

  return (
    <FormularioDeTag
      tag={{
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        description: tag.description ?? null,
        translation:
          (tag as { translation?: Record<string, string> | null })
            .translation ?? null,
      }}
    />
  );
}
