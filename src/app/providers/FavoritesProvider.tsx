// providers/FavoritesProvider.tsx
'use client';

import { useFavorites } from '../hooks/useFavorites';
import { useLearning } from '../hooks/useLearning';

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  // Inicializa automaticamente os favoritos
  useFavorites();
  useLearning();

  return <>{children}</>;
};
