// providers/FavoritesProvider.tsx
'use client';

import { useFavorites } from '../hooks/useFavorites';

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  // Inicializa automaticamente os favoritos
  useFavorites();

  return <>{children}</>;
};
