'use client';

import { PlanPricing } from '@prisma/client';
import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiSave,
  FiRefreshCw,
  FiInfo,
  FiTrendingUp,
  FiZap,
  FiAward,
  FiUsers,
  FiDatabase,
} from 'react-icons/fi';
import { GiTeacher } from 'react-icons/gi';
import { AnimatedItem } from '../../animation/AnimatedComponents';
import Button from '../../Common/Button';
import Input from '../../Common/Inputs';

const PLAN_ICONS = {
  FREE: FiUsers,
  PLUS: FiZap,
  MENTOR: GiTeacher,
  MAESTRO: FiAward,
};

const PLAN_COLORS = {
  FREE: 'from-blue-500 to-blue-600',
  PLUS: 'from-blue-500 to-blue-600',
  MENTOR: 'from-purple-500 to-purple-600',
  MAESTRO: 'from-amber-500 to-amber-600',
};

export default function AdminPlanPricingPage() {
  const [plans, setPlans] = useState<PlanPricing[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plan-pricing');
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedPlans = async () => {
    if (!confirm('Deseja popular os planos com os valores padrão?')) {
      return;
    }

    setSeeding(true);
    try {
      const res = await fetch('/api/admin/plan-pricing/seed', {
        method: 'POST',
      });

      const data = await res.json();
      if (data.success) {
        alert('Planos populados com sucesso!');
        loadPlans();
      } else {
        alert('Erro ao popular planos: ' + data.error);
      }
    } catch (error: any) {
      alert('Erro ao popular planos: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  const handleEdit = (plan: PlanPricing) => {
    setEditingPlan({
      planType: plan.planType,
      monthlyPrice: plan.monthlyPrice,
      quarterlyDiscount: plan.quarterlyDiscount || 10,
      biannualDiscount: plan.biannualDiscount || 15,
      yearlyDiscount: plan.yearlyDiscount || 20,
      trialDays: plan.trialDays || 0,
      description: plan.description || '',
    });
  };

  const calculateDiscountedPrice = (
    monthlyPrice: number,
    months: number,
    discount: number
  ) => {
    return (monthlyPrice * months * (1 - discount / 100)).toFixed(2);
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    setSaving(editingPlan.planType);

    try {
      const res = await fetch('/api/admin/plan-pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan),
      });

      const data = await res.json();
      if (data.success) {
        alert('Preços atualizados com sucesso!');
        setEditingPlan(null);
        loadPlans();
      } else {
        alert('Erro ao atualizar: ' + data.error);
      }
    } catch (error: any) {
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <FiRefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const activePlans = plans.filter((p) => p.planType !== 'FREE');

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <AnimatedItem direction="up" springType="gentle">
        <div className="text-center mb-8 py-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-3xl flex items-center justify-center shadow-theme-glow">
              <FiDollarSign className="w-8 h-8 text-theme-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient-brand classical-title mb-4">
            Gerenciar Preços dos Planos
          </h1>
          <p className="text-lg md:text-xl text-theme-secondary classical-subtitle">
            Configure os valores e descontos de cada plano de assinatura
          </p>
        </div>
      </AnimatedItem>

      {/* Empty State */}
      {activePlans.length === 0 && (
        <AnimatedItem direction="up" delay={100}>
          <div className="classical-card rounded-xl p-12 text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <FiDatabase className="w-10 h-10 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">Nenhum plano encontrado</h3>
            <p className="text-theme-secondary mb-6 max-w-md mx-auto">
              Parece que ainda não há planos configurados no sistema. Clique no
              botão abaixo para popular os planos com valores padrão.
            </p>
            <Button
              onClick={handleSeedPlans}
              disabled={seeding}
              size="lg"
              leftIcon={
                seeding ? (
                  <FiRefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <FiDatabase className="w-5 h-5" />
                )
              }
            >
              {seeding ? 'Populando Planos...' : 'Popular Planos'}
            </Button>

            {/* Info sobre os planos que serão criados */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto text-left">
              <div className="flex gap-3">
                <FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-2">
                    Os seguintes planos serão criados:
                  </p>
                  <ul className="space-y-2 text-blue-800">
                    <li>
                      <strong>PLUS:</strong> R$ 29/mês (7 dias de trial)
                    </li>
                    <li>
                      <strong>MENTOR:</strong> R$ 79/mês (14 dias de trial)
                    </li>
                    <li>
                      <strong>MAESTRO:</strong> R$ 149/mês (30 dias de trial)
                    </li>
                  </ul>
                  <p className="mt-2 text-xs">
                    Todos com descontos: 10% trimestral, 15% semestral, 20%
                    anual
                  </p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedItem>
      )}

      {/* Plans Grid */}
      {activePlans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activePlans.map((plan) => {
            const Icon = PLAN_ICONS[plan.planType];
            const isEditing =
              editingPlan && editingPlan.planType === plan.planType;
            const currentEdit = isEditing ? editingPlan : plan;

            return (
              <div
                key={plan.id}
                className="classical-card rounded-xl shadow-sm border overflow-hidden"
              >
                {/* Header */}
                <div
                  className={`bg-gradient-to-r ${PLAN_COLORS[plan.planType]} p-6 text-white`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    {plan.trialDays > 0 && (
                      <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                        {plan.trialDays} dias grátis
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold">{plan.planType}</h3>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  {/* Preço Mensal */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Preço Mensal (R$)
                    </label>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={currentEdit.monthlyPrice}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            monthlyPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full !px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                      />
                    ) : (
                      <div className="text-3xl font-bold">
                        R$ {plan.monthlyPrice.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Descontos */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <FiTrendingUp className="w-4 h-4" />
                      Descontos Progressivos
                    </h4>

                    {/* Trimestral */}
                    <div className="bg-theme-elevated rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Trimestral (3 meses)
                        </span>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={currentEdit.quarterlyDiscount}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                quarterlyDiscount:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                            className="!w-20 !px-2 border rounded text-sm"
                            step="1"
                          />
                        ) : (
                          <span className="text-sm font-bold text-green-600">
                            -{plan.quarterlyDiscount}%
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        R${' '}
                        {calculateDiscountedPrice(
                          currentEdit.monthlyPrice,
                          3,
                          currentEdit.quarterlyDiscount
                        )}
                        <span className="text-sm font-normal"> / 3 meses</span>
                      </div>
                    </div>

                    {/* Semestral */}
                    <div className="bg-theme-elevated rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Semestral (6 meses)
                        </span>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={currentEdit.biannualDiscount}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                biannualDiscount:
                                  parseFloat(e.target.value) || 0,
                              })
                            }
                            className="!w-20 !px-2 border rounded text-sm"
                            step="1"
                          />
                        ) : (
                          <span className="text-sm font-bold text-green-600">
                            -{plan.biannualDiscount}%
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        R${' '}
                        {calculateDiscountedPrice(
                          currentEdit.monthlyPrice,
                          6,
                          currentEdit.biannualDiscount
                        )}
                        <span className="text-sm font-normal"> / 6 meses</span>
                      </div>
                    </div>

                    {/* Anual */}
                    <div className="bg-theme-elevated rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">
                          Anual (12 meses)
                        </span>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={currentEdit.yearlyDiscount}
                            onChange={(e) =>
                              setEditingPlan({
                                ...editingPlan,
                                yearlyDiscount: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="!w-20 !px-2 border rounded text-sm"
                            step="1"
                          />
                        ) : (
                          <span className="text-sm font-bold text-green-600">
                            -{plan.yearlyDiscount}%
                          </span>
                        )}
                      </div>
                      <div className="text-lg font-bold">
                        R${' '}
                        {calculateDiscountedPrice(
                          currentEdit.monthlyPrice,
                          12,
                          currentEdit.yearlyDiscount
                        )}
                        <span className="text-sm font-normal"> / ano</span>
                      </div>
                    </div>
                  </div>

                  {/* Trial Days */}
                  {isEditing && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Dias de Trial Grátis
                      </label>
                      <Input
                        type="number"
                        value={currentEdit.trialDays}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            trialDays: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleSave}
                          disabled={saving === plan.planType}
                          className="w-full"
                          leftIcon={
                            saving === plan.planType ? (
                              <FiRefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <FiSave className="w-4 h-4" />
                            )
                          }
                        >
                          {saving === plan.planType ? 'Salvando...' : 'Salvar'}
                        </Button>
                        <Button
                          onClick={() => setEditingPlan(null)}
                          variant="ghost"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => handleEdit(plan)}
                        className="w-full"
                      >
                        Editar Preços
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      {activePlans.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">Como funciona:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>
                O <strong>preço mensal</strong> é a base de cálculo
              </li>
              <li>
                Os descontos são aplicados automaticamente nos pacotes maiores
              </li>
              <li>
                Exemplo: R$ 100/mês com 20% desconto anual = R$ 960/ano (R$
                80/mês)
              </li>
              <li>
                Alterações afetam apenas <strong>novas assinaturas</strong>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
