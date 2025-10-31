'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  FiCheck,
  FiX,
  FiZap,
  FiAward,
  FiBook,
  FiAlertCircle,
  FiLoader,
  FiUsers,
  FiStar,
  FiHeadphones,
  FiTarget,
} from 'react-icons/fi';
import {
  GiMusicalNotes,
  GiGrandPiano,
  GiMetronome,
  GiScrollQuill,
  GiTeacher,
  GiTrophy,
} from 'react-icons/gi';
import {
  PageContainer,
  AnimatedContainer,
  AnimatedItem,
  AnimatedCard,
  SequentialGrid,
  FloatingElement,
} from '../../components/animation/AnimatedComponents';
import AnimatedMusicalNotes from '../../components/AnimatedMusicalNotes';
import Button from '@/app/components/Common/Button';
import {
  PlanType,
  BillingPeriod,
  PLAN_PRICES,
} from '@/app/libs/subscriptionConstants';
import toast from 'react-hot-toast';
import { useSubscription } from '@/app/hooks/useSubscription';
import Modal from '@/app/components/Modal';
import Input from '@/app/components/Common/Inputs';
import Link from 'next/link';

const comparisonData = [
  {
    feature: 'Acesso ao catálogo completo',
    free: true,
    plus: true,
    mentor: true,
    maestro: true,
  },
  {
    feature: "'Quero Aprender' e 'Já Aprendi'",
    free: true,
    plus: true,
    mentor: true,
    maestro: true,
  },
  {
    feature: 'Upload de performances',
    free: 'Até 3',
    plus: 'Ilimitado',
    mentor: 'Ilimitado',
    maestro: 'Ilimitado',
  },
  {
    feature: 'Recomendações inteligentes',
    free: false,
    plus: true,
    mentor: true,
    maestro: true,
  },
  {
    feature: 'Assistente IA de estudo',
    free: false,
    plus: true,
    mentor: true,
    maestro: true,
  },
  {
    feature: 'Relatórios de progresso',
    free: false,
    plus: 'Básico',
    mentor: 'Básico',
    maestro: 'Avançado',
  },
  {
    feature: 'Gestão de alunos',
    free: false,
    plus: false,
    mentor: 'Até 7',
    maestro: 'Ilimitado',
  },
  {
    feature: 'Criação de tarefas',
    free: false,
    plus: false,
    mentor: 'Básica',
    maestro: 'Avançada',
  },
  {
    feature: 'Vídeos nas tarefas',
    free: false,
    plus: false,
    mentor: false,
    maestro: true,
  },
  {
    feature: 'Perfil público no diretório',
    free: false,
    plus: false,
    mentor: 'Sim',
    maestro: 'Com destaque',
  },
  {
    feature: 'Notificações automáticas',
    free: false,
    plus: false,
    mentor: false,
    maestro: 'SMS + Push + Email',
  },
  {
    feature: 'Selo de verificação',
    free: false,
    plus: false,
    mentor: false,
    maestro: true,
  },
];

export default function PricingPage() {
  const { status } = useSession();
  const router = useRouter();
  const {
    loading: subscriptionLoading,
    createSubscription,
    changePlan,
    getCurrentPlan,
    canUpgradeTo,
  } = useSubscription();

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  );
  const [processingPlan, setProcessingPlan] = useState<PlanType | null>(null);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    type: PlanType;
    period: BillingPeriod;
  } | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [couponData, setCouponData] = useState<any>(null);

  const currentPlan = getCurrentPlan();

  // Preços dos planos
  const prices = {
    plus: {
      monthly: PLAN_PRICES.PLUS.MONTHLY,
      yearly: PLAN_PRICES.PLUS.YEARLY,
      yearlyTotal: PLAN_PRICES.PLUS.YEARLY_TOTAL,
      yearlySavings: PLAN_PRICES.PLUS.YEARLY_SAVINGS,
    },
    mentor: {
      monthly: PLAN_PRICES.MENTOR.MONTHLY,
      yearly: PLAN_PRICES.MENTOR.YEARLY,
      yearlyTotal: PLAN_PRICES.MENTOR.YEARLY_TOTAL,
      yearlySavings: PLAN_PRICES.MENTOR.YEARLY_SAVINGS,
    },
    maestro: {
      monthly: PLAN_PRICES.MAESTRO.MONTHLY,
      yearly: PLAN_PRICES.MAESTRO.YEARLY,
      yearlyTotal: PLAN_PRICES.MAESTRO.YEARLY_TOTAL,
      yearlySavings: PLAN_PRICES.MAESTRO.YEARLY_SAVINGS,
    },
  };

  // Handler para selecionar plano
  const handleSelectPlan = async (
    planType: PlanType,
    requiresPayment: boolean = true
  ) => {
    // Verificar se está logado
    if (status === 'unauthenticated') {
      toast.error('Faça login para assinar um plano');
      router.push('/login?redirect=/pricing');
      return;
    }

    if (status === 'loading') {
      return;
    }

    // Verificar se já está no plano
    if (currentPlan === planType) {
      toast.error('Você já está neste plano');
      return;
    }

    setProcessingPlan(planType);

    try {
      const period =
        billingPeriod === 'monthly'
          ? BillingPeriod.MONTHLY
          : BillingPeriod.YEARLY;

      // Se for FREE, criar direto
      if (planType === PlanType.FREE) {
        await createSubscription(planType);
        toast.success('Plano Free ativado!');
        router.push('/dashboard');
        return;
      }

      // Se precisa de pagamento, abrir modal de cupom
      if (requiresPayment) {
        setSelectedPlan({ type: planType, period });
        setShowCouponModal(true);
      }
    } catch (error: any) {
      console.error('Error selecting plan:', error);
      toast.error(error.message || 'Erro ao processar plano');
    } finally {
      setProcessingPlan(null);
    }
  };

  // Validar cupom
  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !selectedPlan) return;

    setCouponValidating(true);

    try {
      const response = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          planType: selectedPlan.type,
          billingPeriod: selectedPlan.period,
        }),
      });

      const result = await response.json();

      if (result.valid) {
        setCouponData(result);
        toast.success(result.message);
      } else {
        toast.error(result.error);
        setCouponData(null);
      }
    } catch {
      toast.error('Erro ao validar cupom');
      setCouponData(null);
    } finally {
      setCouponValidating(false);
    }
  };

  // Confirmar assinatura (com ou sem cupom)
  const handleConfirmSubscription = async () => {
    if (!selectedPlan) return;

    setProcessingPlan(selectedPlan.type);

    try {
      // Se já tem assinatura, fazer upgrade/downgrade
      if (currentPlan !== PlanType.FREE) {
        await changePlan(selectedPlan.type, selectedPlan.period);
      } else {
        // Criar nova assinatura
        await createSubscription(
          selectedPlan.type,
          selectedPlan.period,
          couponData?.coupon?.code
        );
      }

      // Modal será fechado automaticamente pelo redirect do MP
    } catch (error: any) {
      console.error('Error confirming subscription:', error);
      toast.error(error.message || 'Erro ao processar assinatura');
      setProcessingPlan(null);
    }
  };

  return (
    <PageContainer showBackground={true} className="classical-theme">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-accent-purple/5 to-accent-blue/5"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <div className="text-center max-w-4xl mx-auto">
              <AnimatedItem direction="scale" springType="bouncy">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-8">
                  <GiTrophy className="w-5 h-5 text-brand-primary mr-2" />
                  <span className="text-brand-primary font-medium">
                    Planos para Todos
                  </span>
                </div>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <h1 className="text-4xl lg:text-6xl font-bold classical-title text-theme-primary mb-6">
                  Escolha seu
                  <span className="text-gradient-brand block lg:inline ml-2 lg:ml-4">
                    Plano Perfeito
                  </span>
                </h1>
              </AnimatedItem>

              <AnimatedItem direction="up" springType="gentle">
                <p className="text-xl lg:text-2xl text-theme-secondary leading-relaxed classical-body">
                  Do usuário casual ao professor profissional, temos o plano
                  ideal para acelerar sua jornada musical.
                </p>
              </AnimatedItem>

              {/* Mostrar plano atual */}
              {!subscriptionLoading && currentPlan && (
                <AnimatedItem direction="up" springType="gentle">
                  <div className="inline-flex items-center bg-theme-elevated rounded-full px-6 py-3 shadow-theme-medium border border-theme-secondary mt-8">
                    <FiCheck className="w-5 h-5 text-accent-green mr-2" />
                    <span className="text-theme-secondary">
                      Plano atual:{' '}
                      <strong className="text-theme-primary">
                        {currentPlan}
                      </strong>
                    </span>
                  </div>
                </AnimatedItem>
              )}

              <AnimatedItem direction="up" springType="gentle">
                <div className="inline-flex items-center bg-theme-elevated rounded-full p-1 shadow-theme-medium border border-theme-secondary mt-12">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-8 py-3 rounded-full font-medium transition-all ${
                      billingPeriod === 'monthly'
                        ? 'bg-theme-secondary text-brand-primary shadow-theme-medium'
                        : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    Mensal
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-8 py-3 rounded-full font-medium transition-all relative ${
                      billingPeriod === 'yearly'
                        ? 'bg-theme-secondary text-brand-primary shadow-theme-medium'
                        : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    Anual
                    <span className="absolute -top-2 -right-2 bg-accent-green text-theme-primary text-xs px-2 py-1 rounded-full">
                      -20%
                    </span>
                  </button>
                </div>
              </AnimatedItem>
            </div>
          </div>

          <AnimatedMusicalNotes />
        </AnimatedContainer>
      </section>

      {/* Seção de Planos para USUÁRIOS */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full mb-6">
                <FiBook className="w-4 h-4 text-accent-blue mr-2" />
                <span className="text-accent-blue font-medium text-sm">
                  Para Usuários
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                Planos para Usuários
              </h2>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto classical-body">
                Acelere sua evolução musical com ferramentas inteligentes
              </p>
            </div>

            <SequentialGrid
              cols={2}
              gap={8}
              delayBetweenItems={0.15}
              className="max-w-5xl mx-auto"
            >
              {/* Plano FREE */}
              <PlanCard
                name="Free"
                price={0}
                period="sempre"
                icon={FiBook}
                features={[
                  { text: 'Acesso completo ao catálogo', enabled: true },
                  { text: "'Quero Aprender' e 'Já Aprendi'", enabled: true },
                  { text: 'Progresso básico', enabled: true },
                  { text: 'Até 3 uploads de performance', enabled: true },
                  { text: 'Gamificação com XP', enabled: true },
                  { text: 'Recomendações inteligentes', enabled: false },
                  { text: 'Metas semanais', enabled: false },
                  { text: 'Relatórios personalizados', enabled: false },
                  { text: 'Assistente IA', enabled: false },
                ]}
                buttonText="Começar Agora"
                onSelect={() => handleSelectPlan(PlanType.FREE, false)}
                isCurrentPlan={currentPlan === PlanType.FREE}
                isProcessing={processingPlan === PlanType.FREE}
              />

              {/* Plano PLUS */}
              <PlanCard
                name="Plus"
                price={
                  billingPeriod === 'monthly'
                    ? prices.plus.monthly
                    : prices.plus.yearly
                }
                period={billingPeriod === 'monthly' ? 'mês' : 'mês'}
                yearlyTotal={
                  billingPeriod === 'yearly'
                    ? prices.plus.yearlyTotal
                    : undefined
                }
                yearlySavings={
                  billingPeriod === 'yearly'
                    ? prices.plus.yearlySavings
                    : undefined
                }
                icon={FiZap}
                iconGradient
                badge="POPULAR"
                highlighted
                trialDays={7}
                features={[
                  {
                    text: 'Uploads ilimitados de performance',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Recomendações inteligentes',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Metas semanais personalizadas',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Histórico visual de progresso',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Relatórios pessoais mensais',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Assistente IA de estudo',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Análises guiadas de obras',
                    enabled: true,
                    accent: true,
                  },
                ]}
                buttonText={
                  currentPlan === PlanType.FREE
                    ? 'Começar Teste Grátis'
                    : 'Fazer Upgrade'
                }
                onSelect={() => handleSelectPlan(PlanType.PLUS)}
                isCurrentPlan={currentPlan === PlanType.PLUS}
                isProcessing={processingPlan === PlanType.PLUS}
                canUpgrade={canUpgradeTo(PlanType.PLUS)}
              />
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* Seção de Planos para PROFESSORES */}
      <section className="py-8 bg-gradient-to-b from-transparent to-theme-secondary/30">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-purple/20 to-accent-blue/20 border border-accent-purple/30 rounded-full mb-6">
                <GiTeacher className="w-4 h-4 text-accent-purple mr-2" />
                <span className="text-accent-purple font-medium text-sm">
                  Para Professores
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                Planos Profissionais
              </h2>
              <p className="text-xl text-theme-secondary max-w-2xl mx-auto classical-body">
                Transforme sua forma de ensinar com tecnologia de ponta
              </p>
            </div>

            <SequentialGrid
              cols={2}
              gap={8}
              delayBetweenItems={0.15}
              className="max-w-5xl mx-auto"
            >
              {/* Plano MENTOR */}
              <PlanCard
                name="Mentor"
                price={
                  billingPeriod === 'monthly'
                    ? prices.mentor.monthly
                    : prices.mentor.yearly
                }
                period={billingPeriod === 'monthly' ? 'mês' : 'mês'}
                yearlyTotal={
                  billingPeriod === 'yearly'
                    ? prices.mentor.yearlyTotal
                    : undefined
                }
                yearlySavings={
                  billingPeriod === 'yearly'
                    ? prices.mentor.yearlySavings
                    : undefined
                }
                icon={GiTeacher}
                iconColor="from-accent-purple to-accent-blue"
                trialDays={14}
                features={[
                  { text: 'Painel completo do professor', enabled: true },
                  { text: 'Até 7 alunos simultâneos', enabled: true },
                  { text: 'Criação de tarefas básicas', enabled: true },
                  { text: 'Feedback textual', enabled: true },
                  { text: 'Perfil público no diretório', enabled: true },
                  { text: 'Agendamento de aulas', enabled: true },
                  { text: 'Biblioteca de materiais', enabled: true },
                  { text: 'Vídeos nas tarefas', enabled: false },
                  { text: 'Relatórios avançados', enabled: false },
                  { text: 'Notificações automáticas', enabled: false },
                ]}
                buttonText="Começar Teste de 14 Dias"
                onSelect={() => handleSelectPlan(PlanType.MENTOR)}
                isCurrentPlan={currentPlan === PlanType.MENTOR}
                isProcessing={processingPlan === PlanType.MENTOR}
                canUpgrade={canUpgradeTo(PlanType.MENTOR)}
              />

              {/* Plano MAESTRO */}
              <PlanCard
                name="Maestro"
                price={
                  billingPeriod === 'monthly'
                    ? prices.maestro.monthly
                    : prices.maestro.yearly
                }
                period={billingPeriod === 'monthly' ? 'mês' : 'mês'}
                yearlyTotal={
                  billingPeriod === 'yearly'
                    ? prices.maestro.yearlyTotal
                    : undefined
                }
                yearlySavings={
                  billingPeriod === 'yearly'
                    ? prices.maestro.yearlySavings
                    : undefined
                }
                icon={FiAward}
                iconGradient
                badge="⭐ PREMIUM"
                highlighted
                trialDays={30}
                features={[
                  { text: 'Alunos ilimitados', enabled: true, accent: true },
                  {
                    text: 'Envio de vídeos nas tarefas',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Análise de performance completa',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Destaque no diretório',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: "Selo 'Professor Maestro'",
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Relatórios pedagógicos avançados',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Estatísticas detalhadas',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Notificações SMS/Push/Email',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Prioridade no marketplace',
                    enabled: true,
                    accent: true,
                  },
                  {
                    text: 'Suporte prioritário 24/7',
                    enabled: true,
                    accent: true,
                  },
                ]}
                buttonText="Começar Teste de 30 Dias"
                onSelect={() => handleSelectPlan(PlanType.MAESTRO)}
                isCurrentPlan={currentPlan === PlanType.MAESTRO}
                isProcessing={processingPlan === PlanType.MAESTRO}
                canUpgrade={canUpgradeTo(PlanType.MAESTRO)}
              />
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* Comparação Detalhada */}
      <section className="py-8 ">
        <AnimatedCard hover="lift" className="classical-card overflow-hidden">
          {/* DESKTOP: Tabela tradicional */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-theme-secondary">
                <tr>
                  <th className="text-left p-6 text-theme-primary font-semibold">
                    Funcionalidade
                  </th>
                  <th className="text-center p-6 text-theme-primary font-semibold">
                    Free
                  </th>
                  <th className="text-center p-6 text-brand-primary font-semibold">
                    Plus
                  </th>
                  <th className="text-center p-6 text-accent-purple font-semibold">
                    Mentor
                  </th>
                  <th className="text-center p-6 text-brand-primary font-semibold">
                    Maestro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-secondary">
                {comparisonData.map((item, index) => (
                  <ComparisonRow
                    key={index}
                    feature={item.feature}
                    free={item.free}
                    plus={item.plus}
                    mentor={item.mentor}
                    maestro={item.maestro}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE: Cards empilháveis */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {comparisonData.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-theme-secondary rounded-xl bg-theme-elevated"
              >
                <p className="font-semibold text-theme-primary mb-4">
                  {item.feature}
                </p>
                <ComparisonMobile label="Free" value={item.free} />
                <ComparisonMobile label="Plus" value={item.plus} highlight />
                <ComparisonMobile label="Mentor" value={item.mentor} />
                <ComparisonMobile
                  label="Maestro"
                  value={item.maestro}
                  highlight
                />
              </div>
            ))}
          </div>
        </AnimatedCard>
      </section>

      {/* Benefícios por Persona */}
      <section className="py-8 bg-gradient-to-b from-transparent to-theme-secondary/30">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 rounded-full mb-6">
                <FiTarget className="w-4 h-4 text-accent-blue mr-2" />
                <span className="text-accent-blue font-medium text-sm">
                  Benefícios
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                O que você ganha com cada plano?
              </h2>
              <p className="text-xl text-theme-secondary classical-body">
                Entenda o impacto real na sua jornada musical
              </p>
            </div>

            <SequentialGrid cols={4} gap={8} delayBetweenItems={0.15}>
              <BenefitCard
                icon={FiBook}
                title="Free"
                subtitle="Curioso / Usuário casual"
                benefits={[
                  'Descoberta',
                  'Exploração livre',
                  'Aprendizado básico',
                ]}
                highlighted
              />
              <BenefitCard
                icon={FiZap}
                title="Plus"
                subtitle="Usuário dedicado"
                benefits={[
                  'Evolução acelerada',
                  'Progresso visível',
                  'Metas claras',
                ]}
                highlighted
              />
              <BenefitCard
                icon={GiTeacher}
                title="Mentor"
                subtitle="Professor iniciante"
                benefits={[
                  'Presença profissional',
                  'Organização total',
                  'Comunicação eficaz',
                ]}
                highlighted
              />
              <BenefitCard
                icon={FiAward}
                title="Maestro"
                subtitle="Professor profissional"
                benefits={[
                  'Autoridade',
                  'Crescimento ilimitado',
                  'Referência no mercado',
                ]}
                highlighted
              />
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* FAQ */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-4">
              <FAQItem
                question="Posso trocar de plano a qualquer momento?"
                answer="Sim! Você pode fazer upgrade, downgrade ou cancelar seu plano a qualquer momento, sem multas ou taxas adicionais."
              />
              <FAQItem
                question="Existe período de teste?"
                answer="Sim! Plus tem 7 dias grátis, Mentor tem 14 dias e Maestro tem 30 dias de teste gratuito. Cancele quando quiser durante o período de teste sem cobranças."
              />
              <FAQItem
                question="Como funciona o pagamento anual?"
                answer="No plano anual, você economiza 20% comparado ao mensal. O pagamento é feito uma vez por ano e você tem acesso completo durante todo o período."
              />
              <FAQItem
                question="O que acontece se eu cancelar?"
                answer="Seu acesso continua até o final do período pago. Após isso, você volta ao plano Free automaticamente, mantendo todo seu histórico e progresso."
              />
              <FAQItem
                question="Posso ter mais de um plano?"
                answer="Sim! Por exemplo, você pode ser usuário Plus e professor Maestro ao mesmo tempo, com um único login."
              />
              <FAQItem
                question="Há desconto para escolas ou conservatórios?"
                answer="Sim! Entre em contato conosco para planos corporativos e descontos especiais para instituições de ensino."
              />
            </div>
          </div>
        </AnimatedContainer>
      </section>

      {/* CTA Final */}
      <section className="py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 via-accent-purple/5 to-accent-blue/10"></div>

        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="relative section-wrap">
            <AnimatedCard
              hover="lift"
              className="classical-card p-12 text-center max-w-4xl mx-auto"
            >
              <div className="w-20 h-20 bg-brand-gradient rounded-3xl flex items-center justify-center mx-auto mb-8">
                <GiMetronome className="w-10 h-10 text-theme-primary" />
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-6">
                Comece sua jornada hoje
              </h2>

              <p className="text-xl text-theme-secondary mb-12 classical-body">
                Junte-se a milhares de músicos que já transformaram sua forma de
                estudar e ensinar música clássica.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button className="btn-classical-primary px-10 py-4 text-lg flex items-center justify-center space-x-2">
                  <FiZap className="w-5 h-5" />
                  <span>Experimentar Grátis</span>
                </button>
                <Link
                  href="/composers"
                  className="btn-classical-secondary px-10 py-4 text-lg flex items-center justify-center space-x-2"
                >
                  <FiHeadphones className="w-5 h-5" />
                  <span>Explorar Sem Cadastro</span>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 mt-12 pt-8 border-t border-theme-secondary">
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiUsers className="w-4 h-4" />
                  <span className="text-sm">10.000+ usuários ativos</span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiStar className="w-4 h-4" />
                  <span className="text-sm">Avaliação 4.9/5</span>
                </div>
                <div className="flex items-center space-x-2 text-theme-tertiary">
                  <FiAward className="w-4 h-4" />
                  <span className="text-sm">Suporte 24/7</span>
                </div>
              </div>
            </AnimatedCard>
          </div>
        </AnimatedContainer>
      </section>

      {/* Modal de Cupom */}
      {showCouponModal && selectedPlan && (
        <Modal
          isOpen={showCouponModal}
          onClose={() => {
            setShowCouponModal(false);
            setSelectedPlan(null);
            setCouponCode('');
            setCouponData(null);
            setProcessingPlan(null);
          }}
          maxWidth="md"
        >
          <div className="rounded-2xl p-4 w-full  relative">
            <h3 className="text-2xl font-bold text-theme-primary mb-4">
              Confirmar Assinatura
            </h3>

            <div className="classical-card !hover:transform-none !hover:border-none rounded-xl p-4 mb-6">
              <p className="text-sm text-theme-tertiary mb-2">
                Plano selecionado:
              </p>
              <p className="text-xl font-bold text-theme-primary">
                {selectedPlan.type} -{' '}
                {selectedPlan.period === BillingPeriod.MONTHLY
                  ? 'Mensal'
                  : 'Anual'}
              </p>
              {couponData?.pricing ? (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-tertiary">Preço original:</span>
                    <span className="text-theme-secondary line-through">
                      R$ {couponData.pricing.originalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-tertiary">Desconto:</span>
                    <span className="text-accent-green">
                      - R$ {couponData.pricing.discount.toFixed(2)} (
                      {couponData.pricing.savingsPercentage}%)
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-theme-tertiary">
                    <span className="text-theme-primary">Total:</span>
                    <span className="text-brand-primary">
                      R$ {couponData.pricing.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-lg text-theme-secondary mt-2">
                  R${' '}
                  {selectedPlan.period === BillingPeriod.MONTHLY
                    ? (prices as any)[
                        selectedPlan.type.toLowerCase()
                      ].monthly.toFixed(2)
                    : (prices as any)[
                        selectedPlan.type.toLowerCase()
                      ].yearlyTotal.toFixed(2)}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-theme-secondary mb-2">
                Cupom de desconto (opcional)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="BEMVINDO20"
                  disabled={couponValidating || processingPlan !== null}
                  widhtFull
                />
                <Button
                  onClick={handleValidateCoupon}
                  disabled={!couponCode.trim() || couponValidating}
                  variant="outline"
                >
                  {couponValidating ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    'Validar'
                  )}
                </Button>
              </div>
              {couponData && (
                <div className="mt-2 flex items-center gap-2 text-sm text-accent-green">
                  <FiCheck className="w-4 h-4" />
                  <span>{couponData.message}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleConfirmSubscription}
              disabled={processingPlan !== null}
              className="w-full"
            >
              {processingPlan ? (
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                'Continuar para Pagamento'
              )}
            </Button>

            <p className="text-xs text-theme-tertiary text-center mt-4">
              Você será redirecionado para o Stripe para completar o pagamento
              de forma segura.
            </p>
          </div>
        </Modal>
      )}

      {/* Floating Elements */}
      <FloatingElement
        className="top-16 left-16 text-6xl text-brand-primary/5"
        delay={0}
      >
        <GiMusicalNotes />
      </FloatingElement>
      <FloatingElement
        className="bottom-16 right-16 text-5xl text-accent-purple/5"
        delay={2}
      >
        <GiGrandPiano />
      </FloatingElement>
      <FloatingElement
        className="top-1/3 right-24 text-4xl text-accent-blue/5"
        delay={1}
      >
        <GiScrollQuill />
      </FloatingElement>
      <FloatingElement
        className="bottom-1/3 left-24 text-4xl text-brand-secondary/5"
        delay={3}
      >
        <GiMetronome />
      </FloatingElement>
    </PageContainer>
  );
}

// Componente de Card de Plano
interface PlanCardProps {
  name: string;
  price: number;
  period: string;
  yearlyTotal?: number;
  yearlySavings?: number;
  icon: React.ComponentType<{ className?: string }>;
  iconGradient?: boolean;
  iconColor?: string;
  badge?: string;
  highlighted?: boolean;
  trialDays?: number;
  features: Array<{
    text: string;
    enabled: boolean;
    accent?: boolean;
  }>;
  buttonText: string;
  onSelect: () => void;
  isCurrentPlan?: boolean;
  isProcessing?: boolean;
  canUpgrade?: boolean;
}

function PlanCard({
  name,
  price,
  period,
  yearlyTotal,
  yearlySavings,
  icon: Icon,
  iconGradient,
  iconColor,
  badge,
  highlighted,
  trialDays,
  features,
  buttonText,
  onSelect,
  isCurrentPlan,
  isProcessing,
  canUpgrade = true,
}: PlanCardProps) {
  return (
    <AnimatedCard
      hover="lift"
      className={`classical-card p-8 relative overflow-hidden ${
        highlighted ? 'border-2 border-brand-primary' : ''
      }`}
    >
      {badge && (
        <div className="absolute top-4 right-4">
          <span className="inline-block bg-accent-amber text-theme-primary text-xs px-3 py-1 rounded-full font-semibold">
            {badge}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold classical-title text-theme-primary">
          {name}
        </h3>
        <div
          className={`w-12 h-12 ${
            iconGradient
              ? 'bg-brand-gradient'
              : iconColor
                ? `bg-gradient-to-br ${iconColor}`
                : 'bg-theme-secondary'
          } rounded-xl flex items-center justify-center`}
        >
          <Icon className="w-6 h-6 text-theme-primary" />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-baseline">
          <span className="text-5xl font-bold text-theme-primary classical-title">
            R$ {price.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-theme-secondary ml-2">/{period}</span>
        </div>
        {yearlyTotal && yearlySavings ? (
          <p className="text-theme-tertiary mt-2">
            R$ {yearlyTotal.toFixed(2).replace('.', ',')}/ano (economize R${' '}
            {yearlySavings.toFixed(2).replace('.', ',')})
          </p>
        ) : price === 0 ? (
          <p className="text-theme-tertiary mt-2">Para sempre gratuito</p>
        ) : (
          <p className="text-theme-tertiary mt-2">Cancele quando quiser</p>
        )}
      </div>

      {isCurrentPlan ? (
        <div className="w-full py-4 mb-8 bg-accent-green/20 text-accent-green font-medium rounded-lg flex items-center justify-center gap-2">
          <FiCheck className="w-5 h-5" />
          <span>Plano Atual</span>
        </div>
      ) : !canUpgrade ? (
        <div className="w-full py-4 mb-8 bg-theme-tertiary/20 text-theme-tertiary font-medium rounded-lg flex items-center justify-center gap-2">
          <FiAlertCircle className="w-5 h-5" />
          <span>Plano Inferior</span>
        </div>
      ) : (
        <Button
          onClick={onSelect}
          disabled={isProcessing}
          className="w-full py-4 mb-8"
          variant={highlighted ? 'primary' : 'secondary'}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>Processando...</span>
            </div>
          ) : trialDays ? (
            <span>
              {buttonText} ({trialDays} dias grátis)
            </span>
          ) : (
            buttonText
          )}
        </Button>
      )}

      <div className="space-y-4">
        <p className="text-sm font-semibold text-theme-primary mb-4">
          {price === 0 ? 'O que está incluído:' : 'Tudo do Free +'}
        </p>
        {features.map((feature, index) => (
          <Feature
            key={index}
            icon={feature.enabled ? FiCheck : FiX}
            text={feature.text}
            disabled={!feature.enabled}
            accent={feature.accent}
          />
        ))}
      </div>
    </AnimatedCard>
  );
}

// Componente de Feature
interface FeatureProps {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  disabled?: boolean;
  accent?: boolean;
}

function Feature({ icon: Icon, text, disabled, accent }: FeatureProps) {
  return (
    <div
      className={`flex items-center space-x-3 ${disabled ? 'opacity-40' : ''}`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          accent
            ? 'text-brand-primary'
            : disabled
              ? 'text-theme-tertiary'
              : 'text-accent-green'
        }`}
      />
      <span
        className={`text-sm ${
          disabled ? 'text-theme-tertiary line-through' : 'text-theme-secondary'
        }`}
      >
        {text}
      </span>
    </div>
  );
}

interface ComparisonRowProps {
  feature: string;
  free: boolean | string;
  plus: boolean | string;
  mentor: boolean | string;
  maestro: boolean | string;
}

function ComparisonRow({
  feature,
  free,
  plus,
  mentor,
  maestro,
}: ComparisonRowProps) {
  const renderCell = (value: boolean | string) => {
    if (value === true) {
      return <FiCheck className="w-6 h-6 text-accent-green mx-auto" />;
    }
    if (value === false) {
      return <FiX className="w-6 h-6 text-theme-tertiary mx-auto" />;
    }
    return (
      <span className="text-sm text-theme-secondary font-medium">{value}</span>
    );
  };

  return (
    <tr className="hover:bg-interactive-hover transition-colors">
      <td className="p-6 text-theme-secondary">{feature}</td>
      <td className="p-6 text-center">{renderCell(free)}</td>
      <td className="p-6 text-center">{renderCell(plus)}</td>
      <td className="p-6 text-center">{renderCell(mentor)}</td>
      <td className="p-6 text-center">{renderCell(maestro)}</td>
    </tr>
  );
}

interface BenefitCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  benefits: string[];
  highlighted?: boolean;
}

function BenefitCard({
  icon: Icon,
  title,
  subtitle,
  benefits,
  highlighted,
}: BenefitCardProps) {
  return (
    <AnimatedCard
      hover="lift"
      className={`classical-card p-6 text-center ${
        highlighted ? 'border-2 border-brand-primary' : ''
      }`}
    >
      <div
        className={`w-14 h-14 ${
          highlighted ? 'bg-brand-gradient' : 'bg-theme-secondary'
        } rounded-xl flex items-center justify-center mx-auto mb-4`}
      >
        <Icon
          className={`w-7 h-7 ${
            highlighted ? 'text-theme-primary' : 'text-theme-primary'
          }`}
        />
      </div>
      <h3 className="text-xl font-bold classical-title text-theme-primary mb-2">
        {title}
      </h3>
      <p className="text-theme-tertiary text-sm mb-4">{subtitle}</p>
      <div className="space-y-2">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="flex items-center justify-center space-x-2"
          >
            <FiCheck
              className={`w-4 h-4 ${
                highlighted ? 'text-brand-primary' : 'text-accent-green'
              }`}
            />
            <span className="text-sm text-theme-secondary">{benefit}</span>
          </div>
        ))}
      </div>
    </AnimatedCard>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <AnimatedCard hover="lift" className="classical-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-interactive-hover transition-colors"
      >
        <span className="font-semibold text-theme-primary classical-title">
          {question}
        </span>
        <div
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <svg
            className="w-5 h-5 text-theme-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-theme-secondary leading-relaxed classical-body">
            {answer}
          </p>
        </div>
      )}
    </AnimatedCard>
  );
}

function ComparisonMobile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: boolean | string;
  highlight?: boolean;
}) {
  const render = () => {
    if (value === true)
      return <FiCheck className="text-accent-green w-5 h-5" />;
    if (value === false) return <FiX className="text-theme-tertiary w-5 h-5" />;
    return <span className="text-theme-secondary font-medium">{value}</span>;
  };

  return (
    <div
      className={`flex items-center justify-between p-2 rounded-lg ${
        highlight ? 'bg-brand-primary/10' : 'bg-theme-secondary/10'
      }`}
    >
      <span className="text-sm font-medium text-theme-primary">{label}</span>
      {render()}
    </div>
  );
}
