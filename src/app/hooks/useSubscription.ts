// app/hooks/useSubscription.ts
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { PlanType, BillingPeriod } from '@/app/libs/subscriptionConstants';

interface SubscriptionData {
  subscription: any;
  plan: {
    type: PlanType;
    isValid: boolean;
    isTrialActive: boolean;
    trialDaysRemaining: number;
    expiresAt: Date | null;
    features: any;
  };
  history: any[];
  recentPayments: any[];
}

export function useSubscription() {
  const { status } = useSession();
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription data
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/subscription/current');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao buscar assinatura');
      }

      setData(result);
    } catch (err: any) {
      setError(err.message);
      console.error('[useSubscription] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create subscription
  const createSubscription = async (
    planType: PlanType,
    billingPeriod?: BillingPeriod,
    couponCode?: string
  ) => {
    try {
      const response = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, billingPeriod, couponCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar assinatura');
      }

      // Se tem payment initPoint, redirecionar para Mercado Pago
      if (result.payment?.initPoint) {
        window.location.href = result.payment.initPoint;
        return result;
      }

      // Se foi FREE, recarregar dados
      await fetchSubscription();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Upgrade/Downgrade
  const changePlan = async (
    newPlanType: PlanType,
    billingPeriod: BillingPeriod
  ) => {
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPlanType, billingPeriod }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao alterar plano');
      }

      // Se tem payment initPoint (upgrade), redirecionar
      if (result.payment?.initPoint) {
        window.location.href = result.payment.initPoint;
        return result;
      }

      // Se foi downgrade agendado, recarregar dados
      await fetchSubscription();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cancel subscription
  const cancelSubscription = async (reason?: string, feedback?: string) => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, feedback }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cancelar assinatura');
      }

      await fetchSubscription();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Reactivate subscription
  const reactivateSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/reactivate', {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao reativar assinatura');
      }

      await fetchSubscription();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Validate coupon
  const validateCoupon = async (
    code: string,
    planType: PlanType,
    billingPeriod: BillingPeriod
  ) => {
    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, planType, billingPeriod }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Cupom inválido');
      }

      return result;
    } catch (err: any) {
      throw err;
    }
  };

  // Fetch on mount and when session changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSubscription();
    } else if (status === 'unauthenticated') {
      setData(null);
      setLoading(false);
    }
  }, [status]);

  // Helper functions
  const hasFeature = (feature: string): boolean => {
    if (!data?.plan?.features) return false;
    return (
      data.plan.features[feature] === true ||
      data.plan.features[feature] === -1 ||
      (typeof data.plan.features[feature] === 'string' &&
        data.plan.features[feature] !== '')
    );
  };

  const getFeatureLimit = (feature: string): number => {
    if (!data?.plan?.features) return 0;
    const value = data.plan.features[feature];
    return typeof value === 'number' ? value : 0;
  };

  const isPlanActive = (): boolean => {
    return data?.plan?.isValid === true;
  };

  const isOnTrial = (): boolean => {
    return data?.plan?.isTrialActive === true;
  };

  const getCurrentPlan = (): PlanType => {
    return data?.plan?.type || PlanType.FREE;
  };

  const canUpgradeTo = (targetPlan: PlanType): boolean => {
    const currentPlan = getCurrentPlan();
    const planOrder = [
      PlanType.FREE,
      PlanType.PLUS,
      PlanType.MENTOR,
      PlanType.MAESTRO,
    ];
    const currentIndex = planOrder.indexOf(currentPlan);
    const targetIndex = planOrder.indexOf(targetPlan);
    return targetIndex > currentIndex;
  };

  return {
    // Data
    subscription: data?.subscription,
    plan: data?.plan,
    history: data?.history || [],
    recentPayments: data?.recentPayments || [],

    // State
    loading,
    error,

    // Actions
    createSubscription,
    changePlan,
    cancelSubscription,
    reactivateSubscription,
    validateCoupon,
    refetch: fetchSubscription,

    // Helpers
    hasFeature,
    getFeatureLimit,
    isPlanActive,
    isOnTrial,
    getCurrentPlan,
    canUpgradeTo,
  };
}

// Example usage:
/*
import { useSubscription } from '@/app/hooks/useSubscription';

function MyComponent() {
  const {
    plan,
    loading,
    error,
    createSubscription,
    hasFeature,
    isOnTrial,
  } = useSubscription();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Current Plan: {plan?.type}</h2>
      
      {isOnTrial() && (
        <p>Trial expires in {plan?.trialDaysRemaining} days</p>
      )}
      
      {!hasFeature('aiAssistant') && (
        <button onClick={() => createSubscription('PLUS', 'MONTHLY')}>
          Upgrade to Plus
        </button>
      )}
    </div>
  );
}
*/
