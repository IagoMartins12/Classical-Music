// providers/FavoritesProvider.tsx
'use client';

import { useLearning } from '../hooks/useLearning';

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const LearnProvider = ({ children }: FavoritesProviderProps) => {
  // Inicializa automaticamente os favoritos
  useLearning();

  return <>{children}</>;
};
