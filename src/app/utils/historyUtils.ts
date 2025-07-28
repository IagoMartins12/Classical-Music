// app/utils/historyUtils.ts - ATUALIZADO COM BULK IMPORT
import prisma from '@/app/libs/prismadb';
import { NextRequest } from 'next/server';

export interface HistoryActionData {
  userId: string;
  entityType: 'composer' | 'work' | 'score';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changes?: Record<string, any>;
  reason?: string;
  request?: NextRequest;
}

/**
 * Extrai informações de request para auditoria
 */
export function getRequestInfo(request?: NextRequest) {
  if (!request) return {};

  return {
    userAgent: request.headers.get('user-agent') || undefined,
  };
}

// app/utils/helpers.ts (função auxiliar)
export function generateTicketId(): string {
  const prefix = 'CH';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Registra uma ação no histórico
 */
export async function logHistoryAction({
  userId,
  entityType,
  entityId,
  action,
  changes,
  reason,
  request,
}: HistoryActionData) {
  try {
    const requestInfo = getRequestInfo(request);

    await prisma.uploadHistory.create({
      data: {
        userId,
        entityType,
        entityId,
        action,
        changes: changes || null,
        reason,
        ...requestInfo,
      },
    });
  } catch (error) {
    console.error('Erro ao registrar histórico:', error);
    // Não falhar a operação principal se o histórico falhar
  }
}

/**
 * Calcula as diferenças entre dois objetos
 */
export function calculateChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, any> {
  const changes: Record<string, any> = {};

  // Campos que devemos ignorar no histórico
  const ignoredFields = ['id', 'createdAt', 'updatedAt', 'lastVerified'];

  // Verificar campos modificados
  for (const key in newData) {
    if (ignoredFields.includes(key)) continue;

    const oldValue = oldData[key];
    const newValue = newData[key];

    // Comparar valores (incluindo arrays e objetos)
    if (!deepEqual(oldValue, newValue)) {
      changes[key] = {
        from: oldValue,
        to: newValue,
      };
    }
  }

  // Verificar campos removidos
  for (const key in oldData) {
    if (ignoredFields.includes(key)) continue;

    if (
      !(key in newData) &&
      oldData[key] !== null &&
      oldData[key] !== undefined
    ) {
      changes[key] = {
        from: oldData[key],
        to: null,
      };
    }
  }

  return changes;
}

/**
 * Comparação profunda para arrays e objetos
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => deepEqual(val, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Formata as mudanças para exibição legível
 */
export function formatChangesForDisplay(changes: Record<string, any>): string {
  if (!changes || Object.keys(changes).length === 0) {
    return 'Nenhuma alteração registrada';
  }

  // 🆕 TRATAMENTO ESPECIAL PARA BULK IMPORT
  if (changes.bulkImport) {
    const bulk = changes.bulkImport;
    return `Importou ${bulk.successfulWorks} obra(s) do IMSLP para ${
      bulk.composerName
    }${bulk.failedWorks > 0 ? ` (${bulk.failedWorks} com erro)` : ''}${
      bulk.duplicateWorks > 0
        ? ` (${bulk.duplicateWorks} duplicata${
            bulk.duplicateWorks > 1 ? 's' : ''
          })`
        : ''
    }`;
  }

  const formattedChanges = Object.entries(changes)
    .map(([field, change]) => {
      const fieldName = formatFieldName(field);

      if (
        typeof change === 'object' &&
        change.from !== undefined &&
        change.to !== undefined
      ) {
        const fromValue = formatValue(change.from);
        const toValue = formatValue(change.to);

        if (change.from === null || change.from === undefined) {
          return `${fieldName}: adicionado "${toValue}"`;
        } else if (change.to === null || change.to === undefined) {
          return `${fieldName}: removido "${fromValue}"`;
        } else {
          return `${fieldName}: "${fromValue}" → "${toValue}"`;
        }
      }

      return `${fieldName}: ${formatValue(change)}`;
    })
    .slice(0, 5); // Limitar a 5 mudanças para não sobrecarregar

  const result = formattedChanges.join(', ');
  const totalChanges = Object.keys(changes).length;

  if (totalChanges > 5) {
    return `${result} e mais ${totalChanges - 5} alterações`;
  }

  return result;
}

/**
 * Formata nome do campo para exibição
 */
function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    title: 'Título',
    name: 'Nome',
    fullName: 'Nome Completo',
    bio: 'Biografia',
    portraitUrl: 'Foto',
    birthDate: 'Data de Nascimento',
    deathDate: 'Data de Morte',
    nationality: 'Nacionalidade',
    epochId: 'Época',
    instrumentId: 'Instrumento',
    composerId: 'Compositor',
    workId: 'Obra',
    opOrCatalog: 'Op./Catálogo',
    compositionYear: 'Ano de Composição',
    tone: 'Tonalidade',
    workStyle: 'Estilo',
    categoryNames: 'Categorias',
    workGenresArr: 'Gêneros',
    fileSize: 'Tamanho do Arquivo',
    pageCount: 'Número de Páginas',
    downloadUrl: 'URL de Download',
    fileFormat: 'Formato',
    type: 'Tipo',
    notes: 'Notas',
    editor: 'Editor',
    publisher: 'Editora',
    copyright: 'Copyright',
    // 🆕 NOVOS CAMPOS PARA BULK IMPORT
    bulkImport: 'Importação em Lote',
    created: 'Criado',
    deleted: 'Excluído',
  };

  return fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Formata valor para exibição
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'vazio';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'vazio';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 47) + '...';
  }

  return String(value);
}

/**
 * Helper para registrar criação de compositor
 */
export async function logComposerCreate(
  userId: string,
  composerId: string,
  data: any,
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'composer',
    entityId: composerId,
    action: 'create',
    changes: { created: data },
    reason: 'Compositor criado',
    request,
  });
}

/**
 * Helper para registrar atualização de compositor
 */
export async function logComposerUpdate(
  userId: string,
  composerId: string,
  oldData: any,
  newData: any,
  reason?: string,
  request?: NextRequest
) {
  const changes = calculateChanges(oldData, newData);

  if (Object.keys(changes).length > 0) {
    await logHistoryAction({
      userId,
      entityType: 'composer',
      entityId: composerId,
      action: 'update',
      changes,
      reason: reason || 'Compositor atualizado',
      request,
    });
  }
}

/**
 * Helper para registrar exclusão de compositor
 */
export async function logComposerDelete(
  userId: string,
  composerId: string,
  data: any,
  reason?: string,
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'composer',
    entityId: composerId,
    action: 'delete',
    changes: { deleted: data },
    reason: reason || 'Compositor excluído',
    request,
  });
}

/**
 * Helper para registrar criação de obra
 */
export async function logWorkCreate(
  userId: string,
  workId: string,
  data: any,
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'work',
    entityId: workId,
    action: 'create',
    changes: { created: data },
    reason: 'Obra criada',
    request,
  });
}

/**
 * 🆕 Helper para registrar bulk import de obras
 */
export async function logWorksBulkImport(
  userId: string,
  composerId: string,
  bulkData: {
    composerName: string;
    totalWorks: number;
    successfulWorks: number;
    failedWorks: number;
    duplicateWorks: number;
    skippedWorks: number;
    worksCreated: Array<{ title: string; id: string }>;
  },
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'work',
    entityId: composerId, // Usar ID do compositor como referência
    action: 'create',
    changes: {
      bulkImport: bulkData,
    },
    reason: `Importação em lote de ${bulkData.successfulWorks} obras do IMSLP para o compositor ${bulkData.composerName}`,
    request,
  });
}

/**
 * Helper para registrar atualização de obra
 */
export async function logWorkUpdate(
  userId: string,
  workId: string,
  oldData: any,
  newData: any,
  reason?: string,
  request?: NextRequest
) {
  const changes = calculateChanges(oldData, newData);

  if (Object.keys(changes).length > 0) {
    await logHistoryAction({
      userId,
      entityType: 'work',
      entityId: workId,
      action: 'update',
      changes,
      reason: reason || 'Obra atualizada',
      request,
    });
  }
}

/**
 * Helper para registrar exclusão de obra
 */
export async function logWorkDelete(
  userId: string,
  workId: string,
  data: any,
  reason?: string,
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'work',
    entityId: workId,
    action: 'delete',
    changes: { deleted: data },
    reason: reason || 'Obra excluída',
    request,
  });
}

/**
 * Helper para registrar criação de partitura
 */
export async function logScoreCreate(
  userId: string,
  scoreId: string,
  data: any,
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'score',
    entityId: scoreId,
    action: 'create',
    changes: { created: data },
    reason: 'Partitura criada',
    request,
  });
}

/**
 * Helper para registrar atualização de partitura
 */
export async function logScoreUpdate(
  userId: string,
  scoreId: string,
  oldData: any,
  newData: any,
  reason?: string,
  request?: NextRequest
) {
  const changes = calculateChanges(oldData, newData);

  if (Object.keys(changes).length > 0) {
    await logHistoryAction({
      userId,
      entityType: 'score',
      entityId: scoreId,
      action: 'update',
      changes,
      reason: reason || 'Partitura atualizada',
      request,
    });
  }
}

/**
 * Helper para registrar exclusão de partitura
 */
export async function logScoreDelete(
  userId: string,
  scoreId: string,
  data: any,
  reason?: string,
  request?: NextRequest
) {
  await logHistoryAction({
    userId,
    entityType: 'score',
    entityId: scoreId,
    action: 'delete',
    changes: { deleted: data },
    reason: reason || 'Partitura excluída',
    request,
  });
}

/**
 * Buscar estatísticas de histórico do usuário
 */
export async function getUserHistoryStats(userId: string) {
  try {
    const [totalActions, actionsToday, recentActions] = await Promise.all([
      prisma.uploadHistory.count({
        where: { userId },
      }),
      prisma.uploadHistory.count({
        where: {
          userId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.uploadHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          entityType: true,
          action: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      totalActions,
      actionsToday,
      recentActions,
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas de histórico:', error);
    return {
      totalActions: 0,
      actionsToday: 0,
      recentActions: [],
    };
  }
}

export function getClientIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}
