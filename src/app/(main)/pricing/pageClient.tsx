'use client';

import React, { useState } from 'react';
import {
  FiCheck,
  FiX,
  FiZap,
  FiAward,
  FiUsers,
  FiBarChart2,
  FiStar,
  FiTarget,
  FiBook,
  FiHeadphones,
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
import Link from 'next/link';
import Button from '@/app/components/Common/Button';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(
    'monthly'
  );

  // Preços dos planos
  const prices = {
    plus: {
      monthly: 19.9,
      yearly: 15.9,
      yearlyTotal: 191.04,
      yearlySavings: 47.76,
    },
    mentor: {
      monthly: 49.9,
      yearly: 39.9,
      yearlyTotal: 479.04,
      yearlySavings: 119.76,
    },
    maestro: {
      monthly: 79.9,
      yearly: 63.9,
      yearlyTotal: 767.04,
      yearlySavings: 191.76,
    },
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
              <AnimatedCard hover="lift" className="classical-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary">
                    Free
                  </h3>
                  <div className="w-12 h-12 bg-theme-secondary rounded-xl flex items-center justify-center">
                    <FiBook className="w-6 h-6 text-theme-primary" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-theme-primary classical-title">
                      R$ 0
                    </span>
                    <span className="text-theme-secondary ml-2">/mês</span>
                  </div>
                  <p className="text-theme-tertiary mt-2">
                    Para sempre gratuito
                  </p>
                </div>

                <Button className="w-full py-4 mb-8" variant="secondary">
                  Começar Agora
                </Button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-theme-primary mb-4">
                    O que está incluído:
                  </p>
                  <Feature icon={FiCheck} text="Acesso completo ao catálogo" />
                  <Feature
                    icon={FiCheck}
                    text="'Quero Aprender' e 'Já Aprendi'"
                  />
                  <Feature icon={FiCheck} text="Progresso básico" />
                  <Feature icon={FiCheck} text="Até 3 uploads de performance" />
                  <Feature icon={FiCheck} text="Gamificação com XP" />
                  <Feature
                    icon={FiX}
                    text="Recomendações inteligentes"
                    disabled
                  />
                  <Feature icon={FiX} text="Metas semanais" disabled />
                  <Feature
                    icon={FiX}
                    text="Relatórios personalizados"
                    disabled
                  />
                  <Feature icon={FiX} text="Assistente IA" disabled />
                </div>
              </AnimatedCard>

              {/* Plano PLUS */}
              <AnimatedCard
                hover="lift"
                className="classical-card p-8 border-2 border-brand-primary relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-block bg-accent-amber text-theme-primary text-xs px-3 py-1 rounded-full font-semibold">
                    POPULAR
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary">
                    Plus
                  </h3>
                  <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center">
                    <FiZap className="w-6 h-6 text-theme-primary" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-brand-primary classical-title">
                      R${' '}
                      {billingPeriod === 'monthly'
                        ? prices.plus.monthly.toFixed(2).replace('.', ',')
                        : prices.plus.yearly.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-theme-secondary ml-2">/mês</span>
                  </div>
                  <p className="text-theme-tertiary mt-2">
                    {billingPeriod === 'yearly' &&
                      `R$ ${prices.plus.yearlyTotal.toFixed(2).replace('.', ',')}/ano (economize R$ ${prices.plus.yearlySavings.toFixed(2).replace('.', ',')})`}
                    {billingPeriod === 'monthly' && 'Cancele quando quiser'}
                  </p>
                </div>

                <Button className="w-full py-4 mb-8">
                  Começar Teste Grátis
                </Button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-theme-primary mb-4">
                    Tudo do Free +
                  </p>
                  <Feature
                    icon={FiCheck}
                    text="Uploads ilimitados de performance"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Recomendações inteligentes"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Metas semanais personalizadas"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Histórico visual de progresso"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Relatórios pessoais mensais"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Assistente IA de estudo"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Análises guiadas de obras"
                    accent
                  />
                </div>
              </AnimatedCard>
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
              <AnimatedCard
                hover="lift"
                className="classical-card p-8 border border-accent-purple/30"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary">
                    Mentor
                  </h3>
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center">
                    <GiTeacher className="w-6 h-6 text-theme-primary" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-theme-primary classical-title">
                      R${' '}
                      {billingPeriod === 'monthly'
                        ? prices.mentor.monthly.toFixed(2).replace('.', ',')
                        : prices.mentor.yearly.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-theme-secondary ml-2">/mês</span>
                  </div>
                  <p className="text-theme-tertiary mt-2">
                    {billingPeriod === 'yearly'
                      ? `R$ ${prices.mentor.yearlyTotal.toFixed(2).replace('.', ',')}/ano (economize R$ ${prices.mentor.yearlySavings.toFixed(2).replace('.', ',')})`
                      : 'Para professores iniciantes'}
                  </p>
                </div>

                <Button className="w-full py-4 mb-8" variant="secondary">
                  Começar Teste de 14 Dias
                </Button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-theme-primary mb-4">
                    Ideal para começar:
                  </p>
                  <Feature icon={FiCheck} text="Painel completo do professor" />
                  <Feature icon={FiCheck} text="Até 7 alunos simultâneos" />
                  <Feature icon={FiCheck} text="Criação de tarefas básicas" />
                  <Feature icon={FiCheck} text="Feedback textual" />
                  <Feature icon={FiCheck} text="Perfil público no diretório" />
                  <Feature icon={FiCheck} text="Agendamento de aulas" />
                  <Feature icon={FiCheck} text="Biblioteca de materiais" />
                  <Feature icon={FiX} text="Vídeos nas tarefas" disabled />
                  <Feature icon={FiX} text="Relatórios avançados" disabled />
                  <Feature
                    icon={FiX}
                    text="Notificações automáticas"
                    disabled
                  />
                </div>
              </AnimatedCard>

              {/* Plano MAESTRO */}
              <AnimatedCard
                hover="lift"
                className="classical-card p-8 border-2 border-brand-primary relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-block bg-accent-amber text-theme-primary text-xs px-3 py-1 rounded-full font-semibold">
                    ⭐ PREMIUM
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold classical-title text-theme-primary">
                    Maestro
                  </h3>
                  <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center">
                    <FiAward className="w-6 h-6 text-theme-primary" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-brand-primary classical-title">
                      R${' '}
                      {billingPeriod === 'monthly'
                        ? prices.maestro.monthly.toFixed(2).replace('.', ',')
                        : prices.maestro.yearly.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-theme-secondary ml-2">/mês</span>
                  </div>
                  <p className="text-theme-tertiary mt-2">
                    {billingPeriod === 'yearly' &&
                      `R$ ${prices.maestro.yearlyTotal.toFixed(2).replace('.', ',')}/ano (economize R$ ${prices.maestro.yearlySavings.toFixed(2).replace('.', ',')})`}
                    {billingPeriod === 'monthly' &&
                      'Para professores profissionais'}
                  </p>
                </div>

                <Button className="w-full py-4 mb-8">
                  Começar Teste de 30 Dias
                </Button>

                <div className="space-y-4">
                  <p className="text-sm font-semibold text-theme-primary mb-4">
                    Tudo do Mentor +
                  </p>
                  <Feature icon={FiCheck} text="Alunos ilimitados" accent />
                  <Feature
                    icon={FiCheck}
                    text="Envio de vídeos nas tarefas"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Análise de performance completa"
                    accent
                  />
                  <Feature icon={FiCheck} text="Destaque no diretório" accent />
                  <Feature
                    icon={FiCheck}
                    text="Selo 'Professor Maestro'"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Relatórios pedagógicos avançados"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Estatísticas detalhadas"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Notificações SMS/Push/Email"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Prioridade no marketplace"
                    accent
                  />
                  <Feature
                    icon={FiCheck}
                    text="Suporte prioritário 24/7"
                    accent
                  />
                </div>
              </AnimatedCard>
            </SequentialGrid>
          </div>
        </AnimatedContainer>
      </section>

      {/* Comparação Detalhada */}
      <section className="py-8">
        <AnimatedContainer delay={0.1} staggerSpeed="normal">
          <div className="section-wrap">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border border-brand-primary/30 rounded-full mb-6">
                <FiBarChart2 className="w-4 h-4 text-brand-primary mr-2" />
                <span className="text-brand-primary font-medium text-sm">
                  Comparação
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold classical-title text-theme-primary mb-4">
                Compare todos os planos
              </h2>
              <p className="text-xl text-theme-secondary classical-body">
                Veja em detalhes o que cada plano oferece
              </p>
            </div>

            <AnimatedCard
              hover="lift"
              className="classical-card overflow-hidden"
            >
              <div className="overflow-x-auto">
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
                    <ComparisonRow
                      feature="Acesso ao catálogo completo"
                      free={true}
                      plus={true}
                      mentor={true}
                      maestro={true}
                    />
                    <ComparisonRow
                      feature="'Quero Aprender' e 'Já Aprendi'"
                      free={true}
                      plus={true}
                      mentor={true}
                      maestro={true}
                    />
                    <ComparisonRow
                      feature="Upload de performances"
                      free="Até 3"
                      plus="Ilimitado"
                      mentor="Ilimitado"
                      maestro="Ilimitado"
                    />
                    <ComparisonRow
                      feature="Recomendações inteligentes"
                      free={false}
                      plus={true}
                      mentor={true}
                      maestro={true}
                    />
                    <ComparisonRow
                      feature="Assistente IA de estudo"
                      free={false}
                      plus={true}
                      mentor={true}
                      maestro={true}
                    />
                    <ComparisonRow
                      feature="Relatórios de progresso"
                      free={false}
                      plus="Básico"
                      mentor="Básico"
                      maestro="Avançado"
                    />
                    <ComparisonRow
                      feature="Gestão de alunos"
                      free={false}
                      plus={false}
                      mentor="Até 7"
                      maestro="Ilimitado"
                    />
                    <ComparisonRow
                      feature="Criação de tarefas"
                      free={false}
                      plus={false}
                      mentor="Básica"
                      maestro="Avançada"
                    />
                    <ComparisonRow
                      feature="Vídeos nas tarefas"
                      free={false}
                      plus={false}
                      mentor={false}
                      maestro={true}
                    />
                    <ComparisonRow
                      feature="Perfil público no diretório"
                      free={false}
                      plus={false}
                      mentor="Sim"
                      maestro="Com destaque"
                    />
                    <ComparisonRow
                      feature="Notificações automáticas"
                      free={false}
                      plus={false}
                      mentor={false}
                      maestro="SMS + Push + Email"
                    />
                    <ComparisonRow
                      feature="Selo de verificação"
                      free={false}
                      plus={false}
                      mentor={false}
                      maestro={true}
                    />
                  </tbody>
                </table>
              </div>
            </AnimatedCard>
          </div>
        </AnimatedContainer>
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

// Componentes auxiliares
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
