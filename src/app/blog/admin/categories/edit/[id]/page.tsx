import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FormularioDeCategoria } from '@/app/components/blog/escrita/FormularioDeTaxonomia';
import { getServerAccessToken } from '@/app/libs/api/server-session';
import { loadAdminCategory } from '@/app/requests/blog/admin';

export const metadata: Metadata = { title: 'Editar categoria' };

/** A API recusa quem não é administrador (o token vai junto); sem ele, 404. */
export default async function EditarCategoria({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoria = await loadAdminCategory(
    id,
    await getServerAccessToken()
  ).catch(() => null);
  if (!categoria) notFound();

  return (
    <FormularioDeCategoria
      categoria={{
        id: categoria.id,
        name: categoria.name,
        slug: categoria.slug,
        description: categoria.description ?? null,
        image: categoria.image ?? null,
        isActive: categoria.isActive,
        showInMenu: categoria.showInMenu,
        metaTitle: categoria.metaTitle ?? null,
        metaDescription: categoria.metaDescription ?? null,
        inMoreMenu: (categoria as { inMoreMenu?: boolean }).inMoreMenu ?? false,
        showOnHome: (categoria as { showOnHome?: boolean }).showOnHome ?? false,
        translation:
          (categoria as { translation?: Record<string, string> | null })
            .translation ?? null,
      }}
    />
  );
}
