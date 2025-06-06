// hooks/useIMSLPScores.ts
import { useEffect, useState } from 'react';
import { IMSLPWorkScores } from '@/app/libs/imslp-score-scraper';

export function useIMSLPScores(imslpUrl?: string) {
  const [scores, setScores] = useState<IMSLPWorkScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!imslpUrl) return;

    const fetchScores = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/imslp-scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imslpUrl }),
        });

        console.log('FETCH', response);
        const responseText = await response.text();
        console.log(
          '🔍 Resposta da API (primeiros 200 chars):',
          responseText.substring(0, 200)
        );

        if (!response.ok) {
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch {
            throw new Error(
              `Erro HTTP ${response.status}: ${responseText.substring(
                0,
                100
              )}...`
            );
          }
          throw new Error(errorData.error || `Erro ${response.status}`);
        }

        let scoresData;
        try {
          scoresData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Erro ao fazer parse do JSON:', parseError);
          console.error('📄 Conteúdo recebido:', responseText);
          throw new Error('Resposta da API não é um JSON válido');
        }

        setScores(scoresData);
      } catch (err) {
        console.error('Erro ao carregar partituras:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [imslpUrl]);

  const refetch = async () => {
    if (imslpUrl) {
      const fetchScores = async () => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch('/api/imslp-scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imslpUrl }),
          });

          const responseText = await response.text();

          if (!response.ok) {
            let errorData;
            try {
              errorData = JSON.parse(responseText);
            } catch {
              throw new Error(
                `Erro HTTP ${response.status}: ${responseText.substring(
                  0,
                  100
                )}...`
              );
            }
            throw new Error(errorData.error || `Erro ${response.status}`);
          }

          let scoresData;
          try {
            scoresData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do JSON:', parseError);
            throw new Error('Resposta da API não é um JSON válido');
          }

          setScores(scoresData);
        } catch (err) {
          console.error('Erro ao carregar partituras:', err);
          setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
          setLoading(false);
        }
      };

      await fetchScores();
    }
  };

  return { scores, loading, error, refetch };
}
