// app/page.tsx - Enhanced Home Page

import FavoritesClient from '../components/favorites/FavoritesClient';
import { getCurrentUserFavorites } from '../requests/favorites';

export default async function FavoritesPageServer() {
  const favorites = await getCurrentUserFavorites();

  return (
    <div>
      <FavoritesClient favorites={favorites} />
    </div>
  );
}
