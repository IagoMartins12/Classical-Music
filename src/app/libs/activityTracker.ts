// app/libs/activityTracker.ts
import prisma from '@/app/libs/prismadb';
import { ActivityLogType } from '@prisma/client';
import { NextRequest } from 'next/server';

interface TrackActivityParams {
  userId?: string;
  type: ActivityLogType;
  action: string;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Função helper para rastrear atividades do usuário
 * Fire-and-catch: não bloqueia a execução, mas loga erros
 *
 * @example
 * trackActivity({
 *   userId: session.user.id,
 *   type: 'FAVORITE_COMPOSER',
 *   action: 'favoritou compositor',
 *   entityType: 'composer',
 *   entityId: composerId,
 *   entityName: composer.name,
 *   metadata: { epochName: 'Barroco' },
 *   ...getRequestInfo(request)
 * });
 */
export async function trackActivity(
  params: TrackActivityParams
): Promise<void> {
  try {
    // Fire-and-catch: dispara e não espera
    prisma.activityLog
      .create({
        data: {
          userId: params.userId,
          type: params.type,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          entityName: params.entityName,
          metadata: params.metadata,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        },
      })
      .catch((error) => {
        // Loga erro mas não interrompe execução
        console.error('❌ [ACTIVITY_TRACKER] Failed to log activity:', {
          type: params.type,
          userId: params.userId,
          error: error.message,
        });
      });
  } catch (error) {
    // Captura erro na função principal mas não propaga
    console.error('❌ [ACTIVITY_TRACKER] Error in trackActivity:', error);
  }
}

/**
 * Helper para extrair IP e User Agent de NextRequest
 *
 * @example
 * const { ipAddress, userAgent } = getRequestInfo(request);
 */
export function getRequestInfo(request: Request | NextRequest) {
  // Tenta múltiplas fontes para o IP (considerando proxies)
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    'unknown';

  const userAgent = request.headers.get('user-agent') || 'unknown';

  return { ipAddress, userAgent };
}

/**
 * Ações descritivas padronizadas para cada tipo
 */
export const ActivityActions = {
  // Favoritos
  FAVORITE_COMPOSER: 'favoritou compositor',
  UNFAVORITE_COMPOSER: 'desfavoritou compositor',
  FAVORITE_WORK: 'favoritou obra',
  UNFAVORITE_WORK: 'desfavoritou obra',
  FAVORITE_SCORE: 'favoritou partitura',
  UNFAVORITE_SCORE: 'desfavoritou partitura',

  // Aprendizado
  ADD_WANT_TO_LEARN: 'adicionou à lista "Quero Aprender"',
  REMOVE_WANT_TO_LEARN: 'removeu da lista "Quero Aprender"',
  UPDATE_WANT_TO_LEARN: 'atualizou item em "Quero Aprender"',
  ADD_LEARNED: 'marcou como "Já Aprendi"',
  REMOVE_LEARNED: 'removeu de "Já Aprendi"',
  UPDATE_LEARNED: 'atualizou item em "Já Aprendi"',
  SELECT_SCORE_WANT_TO_LEARN: 'selecionou partitura em "Quero Aprender"',
  SELECT_SCORE_LEARNED: 'selecionou partitura em "Já Aprendi"',

  // Anotações
  CREATE_ANNOTATION: 'criou anotação',
  UPDATE_ANNOTATION: 'atualizou anotação',
  DELETE_ANNOTATION: 'deletou anotação',
  VOTE_ANNOTATION_HELPFUL: 'marcou anotação como útil',
  VOTE_ANNOTATION_NOT_HELPFUL: 'marcou anotação como não útil',

  // Moderação
  REPORT_UPLOAD: 'denunciou conteúdo',

  // Uploads
  UPLOAD_VIDEO: 'fez upload de vídeo',
  DELETE_VIDEO: 'deletou vídeo',

  // Perfil
  UPDATE_PROFILE: 'atualizou perfil',
  GENERATE_BIO: 'gerou biografia com IA',
} as const;
