// app/utils/notifications/deduplication.ts - UTILITÁRIOS PARA DEDUPLICAÇÃO ROBUSTA
import { PrismaClient } from '@prisma/client';
import { NotificationType } from '@/app/types/notification';
import crypto from 'crypto';

// 🔥 GERAÇÃO DE HASH ÚNICO CONSISTENTE PARA EVITAR DUPLICATAS
export const generateNotificationHash = (
  userId: string,
  type: NotificationType,
  relatedEntityId?: string,
  metadata?: Record<string, any>
): string => {
  // Para notificações baseadas em tempo (aulas próximas, tarefas vencendo)
  // usar apenas tipo + entidade + data do dia
  const today = new Date().toDateString();

  let baseString = `${userId}_${type}_${today}`;

  if (relatedEntityId) {
    baseString += `_${relatedEntityId}`;
  }

  // Para alguns tipos específicos, incluir dados relevantes do metadata
  if (metadata) {
    switch (type) {
      case 'LESSON_STARTING_SOON':
      case 'LESSON_TOMORROW':
        // Incluir hora da aula para diferenciar aulas no mesmo dia
        if (metadata.lessonTime) {
          const lessonDate = new Date(metadata.lessonTime);
          baseString += `_${lessonDate.getHours()}${lessonDate.getMinutes()}`;
        }
        break;

      case 'ASSIGNMENT_DUE_SOON':
      case 'ASSIGNMENT_DUE_TOMORROW':
      case 'ASSIGNMENT_OVERDUE':
        // Para tarefas, o relatedEntityId (assignmentId) já é suficiente
        break;
    }
  }

  // Gerar hash SHA-256 para ter chave única e consistente
  return crypto
    .createHash('sha256')
    .update(baseString)
    .digest('hex')
    .substring(0, 16);
};

// 🔥 VERIFICAÇÃO ROBUSTA DE NOTIFICAÇÃO EXISTENTE
export const checkExistingNotificationRobust = async (
  prisma: PrismaClient,
  userId: string,
  type: NotificationType,
  relatedEntityId?: string,
  uniqueHash?: string
) => {
  const now = new Date();

  // Construir where clause com múltiplas estratégias
  const whereConditions: any[] = [
    {
      userId,
      type: type as any,
      status: { in: ['UNREAD', 'READ'] as const },
      expiresAt: { gte: now },
    },
  ];

  // Estratégia 1: Se tem uniqueHash, usar ele
  if (uniqueHash) {
    whereConditions[0].uniqueHash = uniqueHash;
  }

  // Estratégia 2: Se tem relatedEntityId, usar ele também
  if (relatedEntityId) {
    whereConditions.push({
      userId,
      type: type as any,
      relatedEntityId,
      status: { in: ['UNREAD', 'read'] as const },
      expiresAt: { gte: now },
    });
  }

  // Estratégia 3: Para tipos específicos, verificar por data do dia
  if (
    [
      'LESSON_STARTING_SOON',
      'LESSON_TOMORROW',
      'ASSIGNMENT_DUE_SOON',
      'ASSIGNMENT_DUE_TOMORROW',
      'ASSIGNMENT_OVERDUE',
    ].includes(type)
  ) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    whereConditions.push({
      userId,
      type: type as any,
      relatedEntityId,
      status: { in: ['UNREAD', 'read'] as const },
      expiresAt: { gte: now },
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    });
  }

  // Executar todas as verificações
  for (const where of whereConditions) {
    const existing = await prisma.notification.findFirst({ where });
    if (existing) {
      console.log(`📬 [DEDUP] ❌ Notificação já existe:`, {
        type,
        relatedEntityId,
        uniqueHash,
        existingId: existing.id,
        strategy: whereConditions.indexOf(where) + 1,
      });
      return existing;
    }
  }

  console.log(`📬 [DEDUP] ✅ Notificação pode ser criada:`, {
    type,
    relatedEntityId,
    uniqueHash,
  });

  return null;
};

// 🔥 CRIAÇÃO SEGURA DE NOTIFICAÇÃO COM DEDUPLICAÇÃO
export const createNotificationSafely = async (
  prisma: PrismaClient,
  notificationData: any
) => {
  try {
    // Gerar hash único se não existir
    if (!notificationData.uniqueHash) {
      notificationData.uniqueHash = generateNotificationHash(
        notificationData.userId,
        notificationData.type,
        notificationData.relatedEntityId,
        notificationData.metadata
      );
    }

    // Verificar se já existe usando múltiplas estratégias
    const existing = await checkExistingNotificationRobust(
      prisma,
      notificationData.userId,
      notificationData.type,
      notificationData.relatedEntityId,
      notificationData.uniqueHash
    );

    if (existing) {
      return null; // Já existe, não criar
    }

    // Usar transação para garantir atomicidade
    return await prisma.$transaction(async (tx) => {
      // Verificação final dentro da transação
      const finalCheck = await tx.notification.findFirst({
        where: {
          userId: notificationData.userId,
          uniqueHash: notificationData.uniqueHash,
          status: { in: ['UNREAD', 'READ'] as const },
          expiresAt: { gte: new Date() },
        },
      });

      if (finalCheck) {
        console.log(
          `📬 [DEDUP] ❌ Notificação criada durante transação, cancelando`
        );
        return null;
      }

      const created = await tx.notification.create({
        data: notificationData,
      });

      console.log(`📬 [DEDUP] ✅ Notificação criada com sucesso:`, {
        id: created.id,
        type: created.type,
        uniqueHash: created.uniqueHash,
      });

      return created;
    });
  } catch (error) {
    console.error('📬 [DEDUP] Erro ao criar notificação:', error);
    return null;
  }
};

// 🔥 LIMPEZA AUTOMÁTICA DE NOTIFICAÇÕES DUPLICADAS OU EXPIRADAS
export const cleanupNotifications = async (
  prisma: PrismaClient,
  userId: string
) => {
  const now = new Date();

  try {
    // 1. Remover notificações expiradas
    const expiredResult = await prisma.notification.deleteMany({
      where: {
        userId,
        expiresAt: { lt: now },
      },
    });

    // 2. Limpeza simples de duplicatas: manter apenas as 10 mais recentes de cada tipo
    const notificationsByType = await prisma.notification.groupBy({
      by: ['type', 'relatedEntityId'],
      where: {
        userId,
        status: { in: ['UNREAD', 'READ'] },
        expiresAt: { gte: now },
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1, // Mais de 1 notificação do mesmo tipo+entidade
          },
        },
      },
    });

    let duplicateCount = 0;

    // Para cada grupo com duplicatas, manter apenas a mais recente
    for (const group of notificationsByType) {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
          type: group.type,
          relatedEntityId: group.relatedEntityId,
          status: { in: ['UNREAD', 'READ'] },
          expiresAt: { gte: now },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      // Manter apenas a primeira (mais recente) e deletar o resto
      if (notifications.length > 1) {
        const idsToDelete = notifications.slice(1).map((n) => n.id);

        const deleteResult = await prisma.notification.deleteMany({
          where: {
            id: { in: idsToDelete },
          },
        });

        duplicateCount += deleteResult.count;
      }
    }

    console.log(`📬 [CLEANUP] Limpeza concluída para ${userId}:`, {
      expired: expiredResult.count,
      duplicates: duplicateCount,
    });

    return {
      expired: expiredResult.count,
      duplicates: duplicateCount,
    };
  } catch (error) {
    console.error('📬 [CLEANUP] Erro na limpeza:', error);
    return { expired: 0, duplicates: 0 };
  }
};
