/**
 * Verificação de compositor e de obra por quem administra, pelas rotas de
 * edição do painel (`PATCH /admin/composers/:id` e `/admin/works/:id`); o
 * legado tinha rotas próprias de "verify".
 */
import { apiFetch } from '@/app/libs/api/client';
import { asFetchResponse } from '@/app/requests/fetch-like';

export function setVerificationRequest(
  item: 'composer' | 'work',
  id: string,
  verified: boolean,
  notes: string
) {
  const request =
    item === 'composer'
      ? apiFetch(`/admin/composers/${id}`, {
          method: 'PATCH',
          body: { isVerified: verified, verificationNotes: notes || undefined },
        })
      : // A obra não guarda nota de verificação.
        apiFetch(`/admin/works/${id}`, {
          method: 'PATCH',
          body: { isVerified: verified },
        });

  return asFetchResponse(request, () => ({
    success: true,
    message: verified ? 'Marcado como verificado.' : 'Verificação removida.',
  }));
}
