// app/favorites/page.tsx - Página Completa de Favoritos

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';

import FavoritesPageServer from './pageServer';
import AuthCheck from '../../components/AuthCheck';

export const metadata = {
  title: 'Seus Favoritos | Enciclopédia Musical',
  description: 'Sua coleção pessoal de compositores e obras de música clássica',
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <AuthCheck title="Seus favoritos" />;
  }

  return <FavoritesPageServer />;
}
