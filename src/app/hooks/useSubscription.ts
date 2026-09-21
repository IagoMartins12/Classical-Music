// app/hooks/useSubscription.ts
'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/app/libs/session';
import { PlanType, BillingPeriod } from '@/app/libs/subscriptionConstants';
import {
  cancelSubscriptionRequest,
  createSubscriptionRequest,
  getCurrentSubscription,
  reactivateSubscriptionRequest,
  upgradeSubscriptionRequest,
  validateCouponRequest,
} from '@/app/requests/billing';

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

      const result = await getCurrentSubscription();

      setData(result as unknown as SubscriptionData);
    } catch (err: any) {
      setError(err.message);
      console.error('[useSubscription] Error:', err);
    } finally {
      setLoading(false);
    }
  };
  const createStripeCheckout = async (
    planType: PlanType,
    billingPeriod: BillingPeriod,
    couponCode?: string
  ) => {
    const result = await createSubscriptionRequest(
      planType,
      billingPeriod,
      couponCode
    );

    // A rota do legado respondia `url`; na API o checkout vem em `payment`.
    if (result.payment?.checkoutUrl) {
      window.location.href = result.payment.checkoutUrl;
    }
  };

  // Create subscription
  const createSubscription = async (
    planType: PlanType,
    billingPeriod?: BillingPeriod,
    couponCode?: string
  ) => {
    try {
      const result = await createSubscriptionRequest(
        planType,
        billingPeriod,
        couponCode
      );

      // Plano pago: redirecionar para o checkout do Stripe. O legado procurava
      // `initPoint` (Mercado Pago), que a rota do Stripe nunca devolvia.
      if (result.payment?.checkoutUrl) {
        window.location.href = result.payment.checkoutUrl;
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
      const result = await upgradeSubscriptionRequest(
        newPlanType,
        billingPeriod
      );

      // Upgrade: redirecionar para o checkout do Stripe (mesmo caso do
      // `initPoint` acima).
      if (result.payment?.checkoutUrl) {
        window.location.href = result.payment.checkoutUrl;
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
      const result = await cancelSubscriptionRequest(reason, feedback);

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
      // A rota do legado nunca existiu; a API tem.
      const result = await reactivateSubscriptionRequest();

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
      return await validateCouponRequest(code, planType, billingPeriod);
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
    createStripeCheckout,
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
