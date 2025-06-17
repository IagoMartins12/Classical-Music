// app/favorites/page.tsx - Página Completa de Favoritos
import { getCurrentUserFavorites } from '@/app/requests/favorites';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { FiHeart, FiMusic, FiUser, FiTrendingUp, FiStar } from 'react-icons/fi';
import { FavoritesInitializer } from '../components/FavoritesInitializer';
import { FavoritesStats } from '../components/favorites/FavoritesStats';
import { FavoritesList } from '../components/favorites/FavoritesList';
import FavoritesPageServer from './pageServer';

export const metadata = {
  title: 'Seus Favoritos | Enciclopédia Musical',
  description: 'Sua coleção pessoal de compositores e obras de música clássica',
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div>
      <FavoritesPageServer />
    </div>
  );
}
