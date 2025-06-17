// app/page.tsx - Enhanced Home Page

import FavoritesClient from '../components/favorites/FavoritesClient';

export default async function FavoritesPageServer() {
  return (
    <div>
      <FavoritesClient />
    </div>
  );
}
