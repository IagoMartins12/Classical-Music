// app/libs/subscriptionChecker.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import prisma from '@/app/libs/prismadb';
import {
  PlanType,
  PLAN_FEATURES,
  getFeatureLimit,
  hasFeature,
} from './subscriptionConstants';

/**
 * Tipo de retorno da verificação de assinatura
 */
export interface SubscriptionCheck {
  isValid: boolean;
  plan: PlanType;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  expiresAt: Date | null;
  features: (typeof PLAN_FEATURES)[PlanType];
  subscription: any | null;
}

/**
 * Busca a assinatura ativa atual do usuário
 */
export async function getCurrentSubscription(userId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: {
          in: ['TRIAL', 'ACTIVE'],
        },
        OR: [
          { endDate: null }, // FREE (sem data de fim)
          { endDate: { gte: new Date() } }, // Ainda não expirou
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        coupon: true,
      },
    });

    return subscription;
  } catch (error) {
    console.error('[getCurrentSubscription] Error:', error);
    return null;
  }
}

/**
 * Verifica a assinatura do usuário logado
 */
export async function checkUserSubscription(): Promise<SubscriptionCheck> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return {
        isValid: false,
        plan: PlanType.FREE,
        isTrialActive: false,
        trialDaysRemaining: 0,
        expiresAt: null,
        features: PLAN_FEATURES.FREE,
        subscription: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        currentPlan: true,
        planExpiresAt: true,
        isTrialActive: true,
      },
    });

    if (!user) {
      return {
        isValid: false,
        plan: PlanType.FREE,
        isTrialActive: false,
        trialDaysRemaining: 0,
        expiresAt: null,
        features: PLAN_FEATURES.FREE,
        subscription: null,
      };
    }

    // Buscar assinatura ativa
    const subscription = await getCurrentSubscription(user.id);

    // Se não tem assinatura ativa, volta pra FREE
    if (!subscription) {
      return {
        isValid: true,
        plan: PlanType.FREE,
        isTrialActive: false,
        trialDaysRemaining: 0,
        expiresAt: null,
        features: PLAN_FEATURES.FREE,
        subscription: null,
      };
    }

    // Calcular dias restantes de trial
    const trialDaysRemaining = subscription.trialEndDate
      ? Math.max(
          0,
          Math.ceil(
            (subscription.trialEndDate.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

    const isTrialActive =
      subscription.status === 'TRIAL' &&
      subscription.trialEndDate &&
      subscription.trialEndDate > new Date();

    return {
      isValid: true,
      plan: subscription.planType as PlanType,
      isTrialActive: isTrialActive || false,
      trialDaysRemaining,
      expiresAt: subscription.endDate,
      features: PLAN_FEATURES[subscription.planType as PlanType],
      subscription,
    };
  } catch (error) {
    console.error('[checkUserSubscription] Error:', error);
    return {
      isValid: false,
      plan: PlanType.FREE,
      isTrialActive: false,
      trialDaysRemaining: 0,
      expiresAt: null,
      features: PLAN_FEATURES.FREE,
      subscription: null,
    };
  }
}

/**
 * Verifica se o usuário tem acesso a uma feature específica
 */
export async function checkFeatureAccess(
  feature: keyof typeof PLAN_FEATURES.FREE
): Promise<{ hasAccess: boolean; plan: PlanType; limit?: number }> {
  const { plan } = await checkUserSubscription();

  const hasAccess = hasFeature(plan, feature);
  const limit = getFeatureLimit(plan, feature);

  return {
    hasAccess,
    plan,
    limit: limit !== 0 ? limit : undefined,
  };
}

/**
 * Verifica limite de upload
 */
export async function checkUploadLimit(
  userId: string
): Promise<{ canUpload: boolean; currentCount: number; limit: number }> {
  try {
    const subscription = await getCurrentSubscription(userId);
    const plan = (subscription?.planType as PlanType) || PlanType.FREE;

    const limit = getFeatureLimit(plan, 'uploadLimit');

    // -1 = ilimitado
    if (limit === -1) {
      return { canUpload: true, currentCount: 0, limit: -1 };
    }

    // Contar uploads atuais do usuário
    const currentCount = await prisma.learned.count({
      where: {
        userId,
        videoUrl: { not: null },
      },
    });

    return {
      canUpload: currentCount < limit,
      currentCount,
      limit,
    };
  } catch (error) {
    console.error('[checkUploadLimit] Error:', error);
    return { canUpload: false, currentCount: 0, limit: 0 };
  }
}

/**
 * Verifica limite de alunos (para professores)
 */
export async function checkStudentLimit(
  teacherId: string
): Promise<{ canAddStudent: boolean; currentCount: number; limit: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { isTeacher: true },
    });

    if (!user?.isTeacher) {
      return { canAddStudent: false, currentCount: 0, limit: 0 };
    }

    const subscription = await getCurrentSubscription(teacherId);
    const plan = (subscription?.planType as PlanType) || PlanType.FREE;

    const limit = getFeatureLimit(plan, 'maxStudents');

    // -1 = ilimitado
    if (limit === -1) {
      return { canAddStudent: true, currentCount: 0, limit: -1 };
    }

    // FREE não permite alunos
    if (limit === 0) {
      return { canAddStudent: false, currentCount: 0, limit: 0 };
    }

    // Contar alunos ativos
    const currentCount = await prisma.teacherStudent.count({
      where: {
        teacherId,
        isActive: true,
      },
    });

    return {
      canAddStudent: currentCount < limit,
      currentCount,
      limit,
    };
  } catch (error) {
    console.error('[checkStudentLimit] Error:', error);
    return { canAddStudent: false, currentCount: 0, limit: 0 };
  }
}

/**
 * Verifica se usuário pode criar tarefas com vídeo
 */
export async function checkVideoSubmissionAccess(
  userId: string
): Promise<{ hasAccess: boolean; plan: PlanType }> {
  const subscription = await getCurrentSubscription(userId);
  const plan = (subscription?.planType as PlanType) || PlanType.FREE;

  const hasAccess = PLAN_FEATURES[plan].videoSubmissions === true;

  return { hasAccess, plan };
}

/**
 * Middleware para verificar trial expirado
 */
export async function checkTrialExpired(userId: string): Promise<{
  isExpired: boolean;
  trialEndDate: Date | null;
  daysRemaining: number;
}> {
  try {
    const subscription = await getCurrentSubscription(userId);

    if (!subscription || !subscription.trialEndDate) {
      return { isExpired: false, trialEndDate: null, daysRemaining: 0 };
    }

    const now = new Date();
    const isExpired = subscription.trialEndDate < now;
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (subscription.trialEndDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );

    return {
      isExpired,
      trialEndDate: subscription.trialEndDate,
      daysRemaining,
    };
  } catch (error) {
    console.error('[checkTrialExpired] Error:', error);
    return { isExpired: false, trialEndDate: null, daysRemaining: 0 };
  }
}

/**
 * Atualiza o cache de plano no User
 */
export async function updateUserPlanCache(userId: string): Promise<void> {
  try {
    const subscription = await getCurrentSubscription(userId);

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentPlan: subscription?.planType || 'FREE',
        planExpiresAt: subscription?.endDate,
        isTrialActive: Boolean(
          subscription?.status === 'TRIAL' &&
            subscription?.trialEndDate &&
            subscription.trialEndDate > new Date()
        ),
      },
    });
  } catch (error) {
    console.error('[updateUserPlanCache] Error:', error);
  }
}

/**
 * Helper para respostas de erro de feature
 */
export function featureNotAvailableResponse(
  feature: string,
  requiredPlan: PlanType
) {
  return {
    error: true,
    message: `Esta funcionalidade requer o plano ${requiredPlan}.`,
    feature,
    requiredPlan,
    upgradeUrl: '/pricing',
  };
}
