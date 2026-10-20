/**
 * Denúncias pela API, chamadas do navegador (a fila de moderação é o painel
 * do admin).
 *
 * A API guarda a denúncia com uma categoria fechada, que decide a prioridade e
 * o prazo, e o motivo em texto livre. A tela do legado escolhe um motivo numa
 * lista: o motivo escolhido segue como `reason` (as telas de moderação e de
 * histórico já traduzem esses códigos) e define a categoria.
 */
import { apiFetch } from '@/app/libs/api/client';
import { type ApiResult, toResult } from '@/app/requests/api-result';

type ReportableEntity =
  | 'composer'
  | 'work'
  | 'score'
  | 'annotation'
  | 'curiosity'
  | 'contribution'
  | 'collection';

const CATEGORY_BY_REASON: Record<string, string> = {
  inappropriate_content: 'offensive',
  copyright_violation: 'copyright',
  false_information: 'wrong_data',
  incorrect_metadata: 'wrong_data',
  broken_links: 'wrong_data',
  spam: 'spam',
  duplicate_content: 'duplicate',
  poor_quality: 'other',
  other: 'other',
};

export async function reportContent(input: {
  entityType: ReportableEntity;
  entityId: string;
  reason: string;
  description?: string;
}): Promise<ApiResult<{ message: string }>> {
  const result = await toResult(
    apiFetch('/uploads/report', {
      method: 'POST',
      body: {
        entityType: input.entityType,
        entityId: input.entityId,
        category: CATEGORY_BY_REASON[input.reason] ?? 'other',
        reason: input.reason,
        description: input.description?.trim() || undefined,
      },
    })
  );

  // A API devolve a denúncia criada; a tela mostrava a mensagem do legado.
  return result.ok
    ? { ok: true, data: { message: 'Item reportado com sucesso' } }
    : result;
}
