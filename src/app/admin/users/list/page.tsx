import { redirect } from 'next/navigation';

/** Endereço antigo da lista, com os filtros do menu antigo na query. */
export default async function ListaAntiga({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [chave, valor] of Object.entries(await searchParams)) {
    if (typeof valor === 'string') params.set(chave, valor);
  }
  const query = params.toString();
  redirect(`/admin/users${query ? `?${query}` : ''}`);
}
