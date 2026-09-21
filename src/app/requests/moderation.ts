/**
 * Denúncias e fila de moderação pela API, chamadas do navegador.
 *
 * A API guarda a denúncia com uma categoria fechada, que decide a prioridade e
 * o prazo, e o motivo em texto livre. A tela do legado escolhe um motivo numa
 * lista: o motivo escolhido segue como `reason` (as telas de moderação e de
 * histórico já traduzem esses códigos) e define a categoria.
 */
import { apiFetch } from '@/app/libs/api/client';
import { type ApiResult, toResult } from '@/app/requests/api-result';

type ReportableEntity = 'composer' | 'work' | 'score';
type ModerationAction = 'approve' | 'reject' | 'delete';

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

interface ModerationListResponse {
  reports: (Record<string, unknown> & { entity?: unknown })[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** A tela lê `moderations` e, em cada uma, `entityDetails`; a API devolve `reports` e `entity`. */
export async function listModerations(page: number, status: string) {
  const result = await toResult(
    apiFetch<ModerationListResponse>('/uploads/moderation', {
      query: { page, status },
    })
  );

  if (!result.ok) {
    return result;
  }

  return {
    ok: true as const,
    data: {
      moderations: result.data.reports.map(({ entity, ...report }) => ({
        ...report,
        entityDetails: entity,
      })),
      pagination: result.data.pagination,
    },
  };
}

export async function resolveModeration(
  moderationId: string,
  action: ModerationAction,
  notes?: string
): Promise<ApiResult<{ message: string }>> {
  const result = await toResult(
    apiFetch(`/uploads/moderation/${moderationId}`, {
      method: 'PATCH',
      body: { action, notes: notes?.trim() || undefined },
    })
  );

  return result.ok
    ? { ok: true, data: { message: 'Moderação processada com sucesso' } }
    : result;
}

/**
 * A API resolve uma a uma e devolve quantas deram certo e por que as outras
 * falharam. Se nenhuma passou, vira erro com o primeiro motivo: remover em
 * lote, por exemplo, falha sempre, porque a API exige justificativa escrita
 * para remover (RN-4) e o lote não tem campo para ela.
 */
export async function resolveModerations(
  moderationIds: string[],
  action: ModerationAction
): Promise<ApiResult<{ processedCount: number }>> {
  const result = await toResult(
    apiFetch<{
      resolved: number;
      failed: number;
      outcomes: { status: string; reason?: string }[];
    }>('/uploads/moderation', {
      method: 'PATCH',
      body: { moderationIds, action },
    })
  );

  if (!result.ok) {
    return result;
  }

  if (result.data.resolved === 0 && result.data.failed > 0) {
    const reason = result.data.outcomes.find(
      (outcome) => outcome.reason
    )?.reason;

    return {
      ok: false,
      status: 400,
      error: reason ?? 'Erro ao processar reports',
    };
  }

  return { ok: true, data: { processedCount: result.data.resolved } };
}

/** Todas as denúncias de um item, de qualquer estado. */
export function getReportHistory(
  entityType: ReportableEntity,
  entityId: string
) {
  return toResult(
    apiFetch<{ reports: unknown[] }>('/uploads/moderation', {
      query: { status: 'all', entityType, entityId, limit: 100 },
    })
  );
}
