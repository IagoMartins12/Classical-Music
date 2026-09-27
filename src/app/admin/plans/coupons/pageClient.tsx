'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/app/libs/session';
import { useRouter } from 'next/navigation';
import {
  PiCalendarBlank,
  PiCopy,
  PiCurrencyDollar,
  PiIdentificationCard,
  PiMagnifyingGlass,
  PiPencilSimple,
  PiPercent,
  PiPlus,
  PiSpinnerGap,
  PiToggleLeft,
  PiToggleRight,
  PiTrash,
  PiX,
} from 'react-icons/pi';
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
import {
  deleteCouponRequest,
  listCouponsRequest,
  saveCouponRequest,
  toggleCouponRequest,
} from '@/app/requests/admin/billing';
import { Text } from '@/app/components/ui/Text';
import { Field } from '@/app/components/ui/Field';
import { NomeAcao } from '@/app/components/ui/NomeAcao';
import { Stack } from '@/app/components/ui/Layout';

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
      const response = await listCouponsRequest();
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
      const response = await saveCouponRequest(editingCoupon?.id, {
        ...formData,
        maxDiscount: formData.maxDiscount
          ? parseFloat(formData.maxDiscount)
          : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        extraTrialDays: formData.extraTrialDays
          ? parseInt(formData.extraTrialDays)
          : null,
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
      const response = await toggleCouponRequest(couponId);

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
      const response = await deleteCouponRequest(couponId);

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
        <PiSpinnerGap className="w-8 h-8 animate-spin text-ouro-texto" />
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
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-theme-glow">
                <PiPercent className="w-6 h-6 md:w-8 md:h-8 text-theme-primary" />
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-gradient-brand classical-title mb-2 md:mb-4">
              Gerenciamento de Cupons
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-theme-secondary classical-subtitle px-4 medida-texto mx-auto">
              Crie, edite e acompanhe cupons da plataforma
            </p>
          </div>
        </AnimatedItem>

        {/* Filtros */}
        <div className=" rounded-xl  p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <PiMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary w-5 h-5" />
              <Input
                type="text"
                placeholder="Buscar cupons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-theme-secondary border border-theme-primary rounded-xl focus:outline-none focus:ring-2 text-theme-primary"
              />
            </div>

            <Button
              onClick={() => handleOpenModal()}
              className="flex items-center justify-cente gap-2"
              leftIcon={<PiPlus className="w-4 h-4" />}
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
                  ? 'text-white'
                  : 'bg-theme-secondary text-theme-secondary'
              }`}
            >
              Todos
            </Button>
            <Button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'text-white'
                  : 'bg-theme-secondary text-theme-secondary'
              }`}
            >
              Ativos
            </Button>
            <Button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'inactive'
                  ? 'text-white'
                  : 'bg-theme-secondary text-theme-secondary'
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
              <PiIdentificationCard className="w-16 h-16 text-theme-tertiary  mx-auto mb-4" />
              <h3 className="text-xl font-bold text-theme-primary mb-2">
                Nenhum cupon encontrado
              </h3>
              <p className="text-theme-secondary mb-4">
                Tente ajustar os filtros ou termo de busca
              </p>
              <Button
                variant="secondary"
                leftIcon={<PiX />}
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

            <Stack>
              {/* Código */}
              <div>
                <Input
                  label="Código do Cupom *"
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
                <Select
                  label="Tipo de Desconto *"
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
                  <Input
                    label="Valor do Desconto *"
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
                  <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                    {formData.type === 'PERCENTAGE'
                      ? 'Percentual (%)'
                      : 'Valor em reais (R$)'}
                  </Text>
                </div>

                {formData.type === 'PERCENTAGE' && (
                  <div>
                    <Input
                      label="Desconto Máximo (R$)"
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
                    <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                      Opcional
                    </Text>
                  </div>
                )}

                {formData.type === 'FREE_TRIAL' && (
                  <div>
                    <Input
                      label="Dias Extras de Trial"
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
                          ? 'text-white'
                          : 'bg-theme-tertiary text-theme-secondary'
                      }`}
                    >
                      {plan}
                    </Button>
                  ))}
                </div>
                <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                  Deixe vazio para aplicar a todos os planos
                </Text>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Válido De *"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Input
                    label="Válido Até *"
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
                  <Input
                    label="Usos Totais"
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) =>
                      setFormData({ ...formData, maxUses: e.target.value })
                    }
                    placeholder="Ilimitado"
                  />
                  <Text papel="legenda" tom="fraco" as="p" className="mt-1">
                    Deixe vazio para ilimitado
                  </Text>
                </div>
                <div>
                  <Input
                    label="Usos por Usuário *"
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
                <Field.Area
                  label="Descrição"
                  classeCampo="resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Cupom de boas-vindas com 20% de desconto"
                  rows={3}
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
                  className="w-5 h-5 rounded text-ouro-texto focus:ring-offset-0"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-theme-secondary cursor-pointer"
                >
                  Cupom ativo
                </label>
              </div>
            </Stack>

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
        coupon.isActive && !isExpired && !isMaxUsed ? '' : ''
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
              className="text-theme-tertiary transition-colors"
              title="Copiar código"
            >
              <PiCopy className="w-4 h-4" />
            </button>
          </div>
          {coupon.description && (
            <Text papel="rotulo" tom="suave" as="p">
              {coupon.description}
            </Text>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            coupon.isActive && !isExpired && !isMaxUsed
              ? ''
              : 'text-theme-tertiary'
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
            <PiPercent className="w-5 h-5 text-ouro-texto" />
            <span className="text-2xl font-bold text-ouro-texto">
              {coupon.discountValue}%
            </span>
          </>
        ) : coupon.type === 'FIXED' ? (
          <>
            <PiCurrencyDollar className="w-5 h-5 text-ouro-texto" />
            <span className="text-2xl font-bold text-ouro-texto">
              R$ {coupon.discountValue.toFixed(2)}
            </span>
          </>
        ) : (
          <>
            <PiCalendarBlank className="w-5 h-5 text-ouro-texto" />
            <span className="text-2xl font-bold text-ouro-texto">
              +{coupon.extraTrialDays} dias
            </span>
          </>
        )}
        <Text papel="rotulo" tom="fraco" className="ml-2">
          {coupon.type === 'PERCENTAGE'
            ? 'de desconto'
            : coupon.type === 'FIXED'
              ? 'de desconto'
              : 'de trial'}
        </Text>
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
              className="h-full transition-all"
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Planos Aplicáveis */}
      {coupon.applicablePlans.length > 0 && (
        <Stack gap={2} className="mb-4">
          <Text papel="legenda" tom="fraco" as="p">
            Planos:
          </Text>
          <div className="flex flex-wrap gap-2">
            {coupon.applicablePlans.map((plan) => (
              <Text
                papel="legenda"
                tom="suave"
                key={plan}
                className="px-2 py-1 bg-theme-secondary rounded font-medium"
              >
                {plan}
              </Text>
            ))}
          </div>
        </Stack>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-theme-secondary">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary text-theme-secondary transition-colors text-sm font-medium"
          title={coupon.isActive ? 'Desativar' : 'Ativar'}
        >
          {coupon.isActive ? (
            <>
              <PiToggleRight className="w-4 h-4" />
              <span>Ativo</span>
            </>
          ) : (
            <>
              <PiToggleLeft className="w-4 h-4 text-theme-tertiary" />
              <span>Inativo</span>
            </>
          )}
        </button>

        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary text-ouro-texto transition-colors text-sm font-medium"
        >
          <PiPencilSimple className="w-4 h-4" />
          <span>Editar</span>
        </button>

        <button
          onClick={onDelete}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-theme-secondary hover:bg-red-500/10 transition-colors text-sm font-medium ml-auto !text-erro"
        >
          <PiTrash className="w-4 h-4" />
          <NomeAcao acao="excluir" />
        </button>
      </div>
    </div>
  );
}
