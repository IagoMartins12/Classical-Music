import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiSearch,
  FiRefreshCw,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { PlanType } from '@prisma/client';

const PLAN_BADGES: Record<PlanType, { color: string; label: string }> = {
  FREE: { color: 'bg-blue-100 text-blue-800', label: 'Free' },
  PLUS: { color: 'bg-blue-100 text-blue-800', label: 'Plus' },
  MENTOR: { color: 'bg-purple-100 text-purple-800', label: 'Mentor' },
  MAESTRO: { color: 'bg-amber-100 text-amber-800', label: 'Maestro' },
};
type SubscriptionStatus = 'ACTIVE' | 'TRIAL' | 'CANCELLED' | 'EXPIRED';

export interface SubscriberResponse {
  success: boolean;
  data: {
    users: SubscriberUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    stats: {
      byPlan: Record<PlanType, number>;
      totalSubscribers: number;
      estimatedMonthlyRevenue: number;
    };
  };
}

export interface SubscriberUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  currentPlan: PlanType;
  planExpiresAt: string | Date | null;
  isTrialActive: boolean;
  createdAt: string | Date;
  subscription: SubscriptionInfo | null;
}

export interface SubscriptionInfo {
  id: string;
  planType: PlanType;
  billingPeriod: 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'BIANNUAL';
  status: SubscriptionStatus; // 👈 aqui
  startDate: string | Date;
  endDate: string | Date | null;
  trialEndDate: string | Date | null;
  price: number;
  autoRenew: boolean;
  stripeSubscriptionId: string | null;
}

const STATUS_BADGES: Record<
  SubscriptionStatus,
  {
    color: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  ACTIVE: {
    color: 'bg-green-100 text-green-800',
    label: 'Ativo',
    icon: FiCheckCircle,
  },
  TRIAL: {
    color: 'bg-blue-100 text-blue-800',
    label: 'Trial',
    icon: FiClock,
  },
  CANCELLED: {
    color: 'bg-red-100 text-red-800',
    label: 'Cancelado',
    icon: FiAlertCircle,
  },
  EXPIRED: {
    color: 'bg-gray-100 text-gray-800',
    label: 'Expirado',
    icon: FiAlertCircle,
  },
};

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<SubscriberUser[]>([]);
  const [stats, setStats] = useState<
    SubscriberResponse['data']['stats'] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<{
    search: string;
    planType: '' | PlanType;
    status: '' | SubscriptionStatus;
  }>({
    search: '',
    planType: '',
    status: '',
  });

  useEffect(() => {
    loadSubscribers();
  }, [page, filters]);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filters.search && { search: filters.search }),
        ...(filters.planType && { planType: filters.planType }),
        ...(filters.status && { status: filters.status }),
      });

      const res = await fetch(`/api/admin/subscribers?${params}`);
      const data = await res.json();

      if (data.success) {
        setSubscribers(data.data.users);
        setStats(data.data.stats);
        setTotalPages(data.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error loading subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (value: number | undefined) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const getDaysRemaining = (expiresAt: string | Date | null) => {
    if (!expiresAt) return null;
    const ms = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Assinantes Ativos
              </h1>
              <p className="text-gray-600">
                Gerencie todos os usuários com planos pagos
              </p>
            </div>
          </div>
          <button
            onClick={loadSubscribers}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiRefreshCw
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <FiUsers className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalSubscribers}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center gap-3 mb-2">
              <FiDollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">Receita Mensal</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.estimatedMonthlyRevenue)}
            </div>
          </div>

          {Object.entries(stats.byPlan).map(([plan, count]) => {
            const typedPlan = plan as PlanType; // ✅ garante que é 'PLUS' | 'MENTOR' | 'MAESTRO'

            return (
              <div
                key={typedPlan}
                className="bg-white rounded-xl shadow-sm p-6 border"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      PLAN_BADGES[typedPlan]?.color
                    }`}
                  >
                    {PLAN_BADGES[typedPlan]?.label}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{count}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email ou nome..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Plan Filter */}
          <select
            value={filters.planType}
            onChange={(e) =>
              setFilters({
                ...filters,
                planType: (e.target.value || '') as '' | PlanType,
              })
            }
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Planos</option>
            <option value="FREE">Free</option>
            <option value="PLUS">Plus</option>
            <option value="MENTOR">Mentor</option>
            <option value="MAESTRO">Maestro</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: (e.target.value || '') as '' | SubscriptionStatus,
              })
            }
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="TRIAL">Trial</option>
            <option value="CANCELLED">Cancelado</option>
            <option value="EXPIRED">Expirado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Plano
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Expira em
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <FiRefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Nenhum assinante encontrado
                  </td>
                </tr>
              ) : (
                subscribers.map((user) => {
                  const sub = user.subscription;
                  const daysRemaining = getDaysRemaining(user.planExpiresAt);
                  const StatusIcon = sub?.status
                    ? STATUS_BADGES[sub.status]?.icon
                    : null;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.firstName ?? 'User image'}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 font-semibold">
                                {user.firstName?.[0] || 'U'}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${
                            PLAN_BADGES[user.currentPlan]?.color
                          }`}
                        >
                          {PLAN_BADGES[user.currentPlan]?.label}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {sub?.status && (
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                              STATUS_BADGES[sub.status]?.color
                            }`}
                          >
                            {StatusIcon && <StatusIcon className="w-3 h-3" />}
                            {STATUS_BADGES[sub.status]?.label}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">
                          {sub?.billingPeriod === 'MONTHLY' && 'Mensal'}
                          {sub?.billingPeriod === 'QUARTERLY' && 'Trimestral'}
                          {sub?.billingPeriod === 'BIANNUAL' && 'Semestral'}
                          {sub?.billingPeriod === 'YEARLY' && 'Anual'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(sub?.price)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.planExpiresAt)}
                        </div>
                        {daysRemaining !== null && (
                          <div
                            className={`text-xs ${
                              daysRemaining < 7
                                ? 'text-red-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {daysRemaining} dias restantes
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Página {page} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-2 border rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
