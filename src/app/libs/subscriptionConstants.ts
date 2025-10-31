// app/libs/subscriptionConstants.ts

export enum PlanType {
  FREE = 'FREE',
  PLUS = 'PLUS',
  MENTOR = 'MENTOR',
  MAESTRO = 'MAESTRO',
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

// ==================== PREÇOS DOS PLANOS ====================
export const PLAN_PRICES = {
  PLUS: {
    MONTHLY: 19.9,
    YEARLY: 15.9, // 20% desconto
    YEARLY_TOTAL: 191.04,
    YEARLY_SAVINGS: 47.76,
  },
  MENTOR: {
    MONTHLY: 49.9,
    YEARLY: 39.9, // 20% desconto
    YEARLY_TOTAL: 479.04,
    YEARLY_SAVINGS: 119.76,
  },
  MAESTRO: {
    MONTHLY: 79.9,
    YEARLY: 63.92, // 20% desconto
    YEARLY_TOTAL: 767.04,
    YEARLY_SAVINGS: 191.76,
  },
} as const;

// ==================== PERÍODOS DE TRIAL ====================
export const TRIAL_PERIODS = {
  FREE: 0,
  PLUS: 7, // 7 dias
  MENTOR: 14, // 14 dias
  MAESTRO: 30, // 30 dias
} as const;

// ==================== FEATURES POR PLANO ====================
export const PLAN_FEATURES = {
  FREE: {
    // Acesso básico
    catalogAccess: true,
    wantToLearn: true,
    alreadyLearned: true,
    basicProgress: true,
    gamificationXP: true,

    // Limites
    uploadLimit: 3,
    maxPerformanceVideos: 3,

    // Features desabilitadas
    smartRecommendations: false,
    aiAssistant: false,
    weeklyGoals: false,
    personalReports: false,
    visualProgressHistory: false,
    guidedAnalysis: false,

    // Professor features (todas desabilitadas)
    teacherDashboard: false,
    studentManagement: false,
    maxStudents: 0,
    taskCreation: false,
    lessonScheduling: false,
    materialsLibrary: false,
    videoSubmissions: false,
    advancedReports: false,
    notifications: false,
    publicProfile: false,
    verifiedBadge: false,
    directoryFeatured: false,
    marketplacePriority: false,
    prioritySupport: false,
  },

  PLUS: {
    // Herda tudo do FREE
    catalogAccess: true,
    wantToLearn: true,
    alreadyLearned: true,
    basicProgress: true,
    gamificationXP: true,

    // Limites aumentados
    uploadLimit: -1, // Ilimitado
    maxPerformanceVideos: -1,

    // Features habilitadas
    smartRecommendations: true,
    aiAssistant: true,
    weeklyGoals: true,
    personalReports: true,
    visualProgressHistory: true,
    guidedAnalysis: true,

    // Professor features (ainda desabilitadas)
    teacherDashboard: false,
    studentManagement: false,
    maxStudents: 0,
    taskCreation: false,
    lessonScheduling: false,
    materialsLibrary: false,
    videoSubmissions: false,
    advancedReports: false,
    notifications: false,
    publicProfile: false,
    verifiedBadge: false,
    directoryFeatured: false,
    marketplacePriority: false,
    prioritySupport: false,
  },

  MENTOR: {
    // Herda tudo do PLUS
    catalogAccess: true,
    wantToLearn: true,
    alreadyLearned: true,
    basicProgress: true,
    gamificationXP: true,
    uploadLimit: -1,
    maxPerformanceVideos: -1,
    smartRecommendations: true,
    aiAssistant: true,
    weeklyGoals: true,
    personalReports: true,
    visualProgressHistory: true,
    guidedAnalysis: true,

    // Professor features habilitadas
    teacherDashboard: true,
    studentManagement: true,
    maxStudents: 7, // Limite de 7 alunos
    taskCreation: 'basic', // Tarefas básicas
    lessonScheduling: true,
    materialsLibrary: true,
    publicProfile: true,

    // Features ainda desabilitadas
    videoSubmissions: false,
    advancedReports: false,
    notifications: false,
    verifiedBadge: false,
    directoryFeatured: false,
    marketplacePriority: false,
    prioritySupport: false,
  },

  MAESTRO: {
    // Herda tudo do MENTOR
    catalogAccess: true,
    wantToLearn: true,
    alreadyLearned: true,
    basicProgress: true,
    gamificationXP: true,
    uploadLimit: -1,
    maxPerformanceVideos: -1,
    smartRecommendations: true,
    aiAssistant: true,
    weeklyGoals: true,
    personalReports: true,
    visualProgressHistory: true,
    guidedAnalysis: true,
    teacherDashboard: true,
    studentManagement: true,
    lessonScheduling: true,
    materialsLibrary: true,
    publicProfile: true,

    // Features premium
    maxStudents: -1, // Ilimitado
    taskCreation: 'advanced', // Tarefas avançadas
    videoSubmissions: true,
    advancedReports: true,
    notifications: true, // SMS + Push + Email
    verifiedBadge: true,
    directoryFeatured: true,
    marketplacePriority: true,
    prioritySupport: true,
  },
} as const;

// ==================== MENSAGENS DE ERRO ====================
export const SUBSCRIPTION_ERRORS = {
  FEATURE_NOT_AVAILABLE:
    'Esta funcionalidade não está disponível no seu plano atual.',
  UPGRADE_REQUIRED: 'Faça upgrade para acessar esta funcionalidade.',
  TRIAL_EXPIRED:
    'Seu período de teste expirou. Assine um plano para continuar.',
  SUBSCRIPTION_EXPIRED: 'Sua assinatura expirou. Renove para continuar usando.',
  PAYMENT_FAILED: 'Falha no pagamento. Atualize seu método de pagamento.',
  INVALID_COUPON: 'Cupom inválido ou expirado.',
  COUPON_ALREADY_USED: 'Você já utilizou este cupom.',
  STUDENT_LIMIT_REACHED: 'Você atingiu o limite de alunos do seu plano.',
  UPLOAD_LIMIT_REACHED: 'Você atingiu o limite de uploads do seu plano.',
} as const;

// ==================== HELPER FUNCTIONS ====================

/**
 * Verifica se um plano tem acesso a uma feature
 */
export function hasFeature(
  plan: PlanType,
  feature: keyof typeof PLAN_FEATURES.FREE
): boolean {
  const value = PLAN_FEATURES[plan][feature];
  return (
    value === true || value === -1 || (typeof value === 'string' && !!value)
  );
}

/**
 * Obtém o limite de uma feature numérica
 */
export function getFeatureLimit(
  plan: PlanType,
  feature: keyof typeof PLAN_FEATURES.FREE
): number {
  const value = PLAN_FEATURES[plan][feature];
  return typeof value === 'number' ? value : 0;
}

/**
 * Calcula o preço final com desconto de cupom
 */
export function calculateFinalPrice(
  plan: PlanType,
  period: BillingPeriod,
  coupon?: {
    type: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
    maxDiscount?: number;
  }
): { originalPrice: number; discount: number; finalPrice: number } {
  if (plan === PlanType.FREE) {
    return { originalPrice: 0, discount: 0, finalPrice: 0 };
  }

  const originalPrice =
    period === BillingPeriod.MONTHLY
      ? PLAN_PRICES[plan].MONTHLY
      : PLAN_PRICES[plan].YEARLY_TOTAL;

  if (!coupon) {
    return { originalPrice, discount: 0, finalPrice: originalPrice };
  }

  let discount = 0;

  if (coupon.type === 'PERCENTAGE') {
    discount = originalPrice * (coupon.discountValue / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else if (coupon.type === 'FIXED') {
    discount = coupon.discountValue;
  }

  // Não pode ser negativo
  discount = Math.min(discount, originalPrice);

  return {
    originalPrice,
    discount,
    finalPrice: originalPrice - discount,
  };
}

/**
 * Verifica se é upgrade ou downgrade
 */
export function getPlanChangeType(
  fromPlan: PlanType,
  toPlan: PlanType
): 'UPGRADE' | 'DOWNGRADE' | 'SAME' {
  const planOrder = [
    PlanType.FREE,
    PlanType.PLUS,
    PlanType.MENTOR,
    PlanType.MAESTRO,
  ];
  const fromIndex = planOrder.indexOf(fromPlan);
  const toIndex = planOrder.indexOf(toPlan);

  if (fromIndex < toIndex) return 'UPGRADE';
  if (fromIndex > toIndex) return 'DOWNGRADE';
  return 'SAME';
}

/**
 * Calcula dias restantes de trial
 */
export function getTrialDaysRemaining(trialEndDate: Date | null): number {
  if (!trialEndDate) return 0;

  const now = new Date();
  const diff = trialEndDate.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return Math.max(0, days);
}

/**
 * Verifica se trial está ativo
 */
export function isTrialActive(trialEndDate: Date | null): boolean {
  if (!trialEndDate) return false;
  return new Date() < trialEndDate;
}

/**
 * Gera referência única para MP
 */
export function generateMPReference(
  userId: string,
  planType: PlanType
): string {
  const timestamp = Date.now();
  return `OPUS-${userId.slice(0, 8)}-${planType}-${timestamp}`;
}

/**
 * Formata preço para exibição
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

/**
 * Obtém nome do plano em português
 */
export function getPlanName(plan: PlanType): string {
  const names = {
    [PlanType.FREE]: 'Gratuito',
    [PlanType.PLUS]: 'Plus',
    [PlanType.MENTOR]: 'Mentor',
    [PlanType.MAESTRO]: 'Maestro',
  };
  return names[plan];
}

/**
 * Obtém descrição do período
 */
export function getBillingPeriodName(period: BillingPeriod): string {
  return period === BillingPeriod.MONTHLY ? 'Mensal' : 'Anual';
}
