'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiSearch,
  FiCalendar,
  FiPercent,
  FiDollarSign,
  FiLoader,
  FiCopy,
  FiX,
} from 'react-icons/fi';
import Button from '@/app/components/Common/Button';
import toast from 'react-hot-toast';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Select from '@/app/components/Common/Select';
import Checkbox from '@/app/components/Common/Checkbox';
import {
  AnimatedCard,
  AnimatedItem,
} from '@/app/components/animation/AnimatedComponents';
import { FaIdCard } from 'react-icons/fa';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_TRIAL';
  discountValue: number;
  maxDiscount: number | null;
  applicablePlans: string[];
  validFrom: string;
  validUntil: string;
  maxUses: number | null;
  usedCount: number;
  maxUsesPerUser: number;
  isActive: boolean;
  extraTrialDays: number | null;
  description: string | null;
  createdAt: string;
}
const statusOptions = [
  { value: 'PERCENTAGE', label: 'Percentual (%)' },
  { value: 'FIXED', label: 'Valor Fixo (R$)' },
  { value: 'FREE_TRIAL', label: 'Trial Grátis Estendido' },
];

export default function AdminCouponsPageClient() {
  const { status } = useSession();
  const router = useRouter();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED' | 'FREE_TRIAL',
    discountValue: 0,
    maxDiscount: '',
    applicablePlans: [] as string[],
    validFrom: '',
    validUntil: '',
    maxUses: '',
    maxUsesPerUser: 1,
    extraTrialDays: '',
    description: '',
    isActive: true,
  });

  // Verificar se é admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Buscar cupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/coupons');
      const data = await response.json();

      if (response.ok) {
        setCoupons(data.coupons);
      } else {
        toast.error(data.error || 'Erro ao buscar cupons');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Erro ao buscar cupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCoupons();
    }
  }, [status]);

  // Abrir modal para criar/editar
  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        discountValue: coupon.discountValue,
        maxDiscount: coupon.maxDiscount?.toString() || '',
        applicablePlans: coupon.applicablePlans,
        validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
        validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
        maxUses: coupon.maxUses?.toString() || '',
        maxUsesPerUser: coupon.maxUsesPerUser,
        extraTrialDays: coupon.extraTrialDays?.toString() || '',
        description: coupon.description || '',
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        type: 'PERCENTAGE',
        discountValue: 0,
        maxDiscount: '',
        applicablePlans: [],
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        maxUses: '',
        maxUsesPerUser: 1,
        extraTrialDays: '',
        description: '',
        isActive: true,
      });
    }
    setShowModal(true);
  };

  // Salvar cupom
  const handleSaveCoupon = async () => {
    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : '/api/admin/coupons';

      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxDiscount: formData.maxDiscount
            ? parseFloat(formData.maxDiscount)
            : null,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          extraTrialDays: formData.extraTrialDays
            ? parseInt(formData.extraTrialDays)
            : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingCoupon ? 'Cupom atualizado!' : 'Cupom criado!');
        setShowModal(false);
        fetchCoupons();
      } else {
        toast.error(data.error || 'Erro ao salvar cupom');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Erro ao salvar cupom');
    }
  };

  // Alternar status ativo/inativo
  const handleToggleActive = async (couponId: string) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}/toggle`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.isActive ? 'Cupom ativado!' : 'Cupom desativado!');
        fetchCoupons();
      } else {
        toast.error(data.error || 'Erro ao alterar status');
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
      toast.error('Erro ao alterar status');
    }
  };

  // Deletar cupom
  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Tem certeza que deseja deletar este cupom?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cupom deletado!');
        fetchCoupons();
      } else {
        toast.error(data.error || 'Erro ao deletar cupom');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error('Erro ao deletar cupom');
    }
  };

  // Copiar código do cupom
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado!');
  };

  // Filtrar cupons
  const filteredCoupons = coupons.filter((coupon) => {
    const matchesSearch =
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'active' && coupon.isActive) ||
      (filterStatus === 'inactive' && !coupon.isActive);
    return matchesSearch && matchesFilter;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="section-wrap">
        {/* Header */}
        <AnimatedItem direction="up" springType="gentle">
          <div className="text-center mb-8 py-8 md:py-12">
            <div className="flex items-center justify-center mb-4 md:mb-6">
              <div
                className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-accent-blue to-accent-purple 
        rounded-2xl md:rounded-3xl flex items-center justify-center shadow-theme-glow"
              >
                <FiPercent className="w-6 h-6 md:w-8 md:h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-gradient-brand classical-title mb-2 md:mb-4">
              Gerenciamento de Cupons
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-theme-secondary classical-subtitle px-4">
              Crie, edite e acompanhe cupons da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Filtros */}
        <div className=" rounded-xl  p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar cupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-theme-secondary border border-theme-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-blue text-theme-primary placeholder-theme-tertiary"
              />
            </div>

            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-cente gap-2"
              leftIcon={<FiPlus className="w-4 h-4" />}
            >
              <span>Novo Cupom</span>
            </Button>
          </div>
          {/* Filter */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-interactive-hover'
              }`}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-brand-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-interactive-hover'
              }`}
            >
              Ativos
            </Button>
            <Button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'inactive'
                  ? 'bg-brand-primary text-white'
                  : 'bg-theme-secondary text-theme-secondary hover:bg-interactive-hover'
              }`}
            >
              Inativos
            </Button>
          </div>
        </div>

        {/* Lista de Cupons */}
        <div
          className={`grid grid-cols-1 ${filteredCoupons.length === 0 ? '' : 'lg:grid-cols-2 '}  w-full  gap-6`}
        >
          {filteredCoupons.length === 0 ? (
            <AnimatedCard className="classical-card p-8 w-full text-center">
              <FaIdCard className="w-16 h-16 text-theme-tertiary  mx-auto mb-4" />
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                Nenhum cupon encontrado
              </h3>
              <p className="text-theme-secondary mb-4">
                Tente ajustar os filtros ou termo de busca
              </p>
              <Button
                variant="secondary"
                leftIcon={<FiX />}
                onClick={() => setFilterStatus('all')}
              >
                Limpar Filtros
              </Button>
            </AnimatedCard>
          ) : (
            filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={() => handleOpenModal(coupon)}
                onToggle={() => handleToggleActive(coupon.id)}
                onDelete={() => handleDeleteCoupon(coupon.id)}
                onCopyCode={() => handleCopyCode(coupon.code)}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <Modal
          isOpen={showModal}
          maxWidth="2xl"
          onClose={() => setShowModal(false)}
        >
          <div className=" rounded-2xl w-full p-8 ">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-theme-primary">
                {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Código do Cupom *
                </label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="BEMVINDO20"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Tipo de Desconto *
                </label>
                <Select
                  options={statusOptions}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                />
              </div>

              {/* Valor do Desconto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Valor do Desconto *
                  </label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                    placeholder={
                      formData.type === 'PERCENTAGE' ? '20' : '10.00'
                    }
                  />
                  <p className="text-xs text-theme-tertiary mt-1">
                    {formData.type === 'PERCENTAGE'
                      ? 'Percentual (%)'
                      : 'Valor em reais (R$)'}
                  </p>
                </div>

                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Desconto Máximo (R$)
                    </label>
                    <Input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscount: e.target.value,
                        })
                      }
                      placeholder="50.00"
                    />
                    <p className="text-xs text-theme-tertiary mt-1">Opcional</p>
                  </div>
                )}

                {formData.type === 'FREE_TRIAL' && (
                  <div>
                    <label className="block text-sm font-medium text-theme-secondary mb-2">
                      Dias Extras de Trial
                    </label>
                    <Input
                      type="number"
                      value={formData.extraTrialDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          extraTrialDays: e.target.value,
                        })
                      }
                      placeholder="7"
                    />
                  </div>
                )}
              </div>

              {/* Planos Aplicáveis */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Planos Aplicáveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {['PLUS', 'MENTOR', 'MAESTRO'].map((plan) => (
                    <Button
                      key={plan}
                      onClick={() => {
                        const plans = formData.applicablePlans.includes(plan)
                          ? formData.applicablePlans.filter((p) => p !== plan)
                          : [...formData.applicablePlans, plan];
                        setFormData({ ...formData, applicablePlans: plans });
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        formData.applicablePlans.includes(plan)
                          ? 'bg-brand-primary text-white'
                          : 'bg-theme-tertiary text-theme-secondary hover:bg-interactive-hover'
                      }`}
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-theme-tertiary mt-1">
                  Deixe vazio para aplicar a todos os planos
                </p>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Válido De *
                  </label>
                  <Input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Válido Até *
                  </label>
                  <Input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Limites de Uso */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Usos Totais
                  </label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value })
                    }
                    placeholder="Ilimitado"
                  />
                  <p className="text-xs text-theme-tertiary mt-1">
                    Deixe vazio para ilimitado
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Usos por Usuário *
                  </label>
                  <Input
                    type="number"
                    value={formData.maxUsesPerUser}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxUsesPerUser: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Cupom de boas-vindas com 20% de desconto"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-theme-primary text-theme-primary placeholder:text-theme-tertiary resize-none"
                />
              </div>

              {/* Status Ativo */}
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-theme-tertiary text-brand-primary focus:ring-brand-primary focus:ring-offset-0"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-theme-secondary cursor-pointer"
                >
                  Cupom ativo
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                onClick={() => setShowModal(false)}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveCoupon} className="flex-1">
                {editingCoupon ? 'Atualizar' : 'Criar'} Cupom
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Componente de Card de Cupom
interface CouponCardProps {
  coupon: Coupon;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onCopyCode: () => void;
}

function CouponCard({
  coupon,
  onEdit,
  onToggle,
  onDelete,
  onCopyCode,
}: CouponCardProps) {
  const isExpired = new Date(coupon.validUntil) < new Date();
  const isMaxUsed =
    coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses;
  const usagePercent = coupon.maxUses
    ? (coupon.usedCount / coupon.maxUses) * 100
    : 0;

  return (
    <div
      className={`classical-card rounded-xl shadow-theme-medium p-6 border-2 ${
        coupon.isActive && !isExpired && !isMaxUsed
          ? 'border-accent-green'
          : 'border-theme-tertiary'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-theme-primary font-mono">
              {coupon.code}
            </h3>
            <button
              onClick={onCopyCode}
              className="text-theme-tertiary hover:text-brand-primary transition-colors"
              title="Copiar código"
            >
              <FiCopy className="w-4 h-4" />
            </button>
          </div>
          {coupon.description && (
            <p className="text-sm text-theme-secondary">{coupon.description}</p>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            coupon.isActive && !isExpired && !isMaxUsed
              ? 'bg-accent-green/20 text-accent-green'
              : 'bg-theme-tertiary/20 text-theme-tertiary'
          }`}
        >
          {isExpired
            ? 'Expirado'
            : isMaxUsed
              ? 'Esgotado'
              : coupon.isActive
                ? 'Ativo'
                : 'Inativo'}
        </div>
      </div>

      {/* Desconto */}
      <div className="flex items-center gap-2 mb-4">
        {coupon.type === 'PERCENTAGE' ? (
          <>
            <FiPercent className="w-5 h-5 text-brand-primary" />
            <span className="text-2xl font-bold text-brand-primary">
              {coupon.discountValue}%
            </span>
          </>
        ) : coupon.type === 'FIXED' ? (
          <>
            <FiDollarSign className="w-5 h-5 text-brand-primary" />
            <span className="text-2xl font-bold text-brand-primary">
              R$ {coupon.discountValue.toFixed(2)}
            </span>
          </>
        ) : (
          <>
            <FiCalendar className="w-5 h-5 text-brand-primary" />
            <span className="text-2xl font-bold text-brand-primary">
              +{coupon.extraTrialDays} dias
            </span>
          </>
        )}
        <span className="text-sm text-theme-tertiary ml-2">
          {coupon.type === 'PERCENTAGE'
            ? 'de desconto'
            : coupon.type === 'FIXED'
              ? 'de desconto'
              : 'de trial'}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-theme-tertiary">Válido até:</p>
          <p className="text-theme-primary font-medium">
            {new Date(coupon.validUntil).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div>
          <p className="text-theme-tertiary">Usos:</p>
          <p className="text-theme-primary font-medium">
            {coupon.usedCount}
            {coupon.maxUses ? `/${coupon.maxUses}` : ' (ilimitado)'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {coupon.maxUses && (
        <div className="mb-4">
          <div className="w-full bg-theme-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-primary h-full transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Planos Aplicáveis */}
      {coupon.applicablePlans.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-theme-tertiary mb-2">Planos:</p>
          <div className="flex flex-wrap gap-2">
            {coupon.applicablePlans.map((plan) => (
              <span
                key={plan}
                className="px-2 py-1 bg-theme-secondary rounded text-xs font-medium text-theme-secondary"
              >
                {plan}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-theme-secondary">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary text-theme-secondary hover:bg-interactive-hover transition-colors text-sm font-medium"
          title={coupon.isActive ? 'Desativar' : 'Ativar'}
        >
          {coupon.isActive ? (
            <>
              <FiToggleRight className="w-4 h-4 text-accent-green" />
              <span>Ativo</span>
            </>
          ) : (
            <>
              <FiToggleLeft className="w-4 h-4 text-theme-tertiary" />
              <span>Inativo</span>
            </>
          )}
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary text-brand-primary hover:bg-interactive-hover transition-colors text-sm font-medium"
        >
          <FiEdit2 className="w-4 h-4" />
          <span>Editar</span>
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary text-red-500 hover:bg-red-500/10 transition-colors text-sm font-medium ml-auto"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
