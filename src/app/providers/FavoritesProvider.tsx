// providers/FavoritesProvider.tsx
'use client';

import { Toaster } from 'react-hot-toast';
import { useFavorites } from '../hooks/useFavorites';

interface FavoritesProviderProps {
  children: React.ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
  // Inicializa automaticamente os favoritos
  useFavorites();

  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-secondary)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
    </>
  );
};
