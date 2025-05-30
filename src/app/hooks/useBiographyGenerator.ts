import { useState, useCallback } from 'react';

interface UseBiographyGeneratorResult {
  biography: string | null;
  isGenerating: boolean;
  error: string | null;
  generateBiography: (composerId: string) => Promise<void>;
}

export function useBiographyGenerator(): UseBiographyGeneratorResult {
  const [biography, setBiography] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBiography = useCallback(async (composerId: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`/api/composer/${composerId}/generate-bio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar biografia');
      }

      setBiography(data.biography);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    biography,
    isGenerating,
    error,
    generateBiography,
  };
}
