// app/favorites/page.tsx - Página Completa de Favoritos

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

import FavoritesPageServer from './pageServer';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Seus Favoritos | Enciclopédia Musical',
  description: 'Sua coleção pessoal de compositores e obras de música clássica',
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  return <FavoritesPageServer />;
}
