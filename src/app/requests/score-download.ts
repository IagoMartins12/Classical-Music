// app/requests/score-download.ts — conta o download feito pelo botão do site
//
// A contagem alimenta o ranking das partituras mais baixadas no painel. Nunca
// atrapalha o download: o arquivo abre numa aba nova, e se a contagem falhar
// ninguém precisa saber.
import { apiFetch } from '@/app/libs/api/client';

export function countScoreDownload(scoreId: string): void {
  if (!scoreId) return;
  apiFetch(`/works/scores/${scoreId}/download`, { method: 'POST' }).catch(
    () => undefined
  );
}
