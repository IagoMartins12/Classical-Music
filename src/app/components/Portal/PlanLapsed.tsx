'use client';

// components/Portal/PlanLapsed.tsx — o painel do professor trancado
//
// O teste de 7 dias ou o plano pago venceu sem renovação (decisão do dono,
// 02/11): toda tela do professor dá aqui. Diz o que aconteceu, que nada se
// perdeu e o caminho para regularizar. A casca continua — o menu, o sino e a
// troca para o portal do aluno —, só o conteúdo fica fechado.

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { classesDeBotao } from '@/app/components/ui/Button';
import { BrandSeal } from '@/app/components/site/BrandSeal';
import type { TeacherDashboard } from '@/app/requests/portal/api';
import { PLAN_NAME } from './plans';

const step = (i: number) => ({ '--i': i }) as CSSProperties;

const dateOf = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });

export function PlanLapsed({
  lapsed,
}: {
  lapsed: NonNullable<TeacherDashboard['plan']['lapsed']>;
}) {
  const name = PLAN_NAME[lapsed.plan] ?? lapsed.plan;
  const ended = dateOf(lapsed.endedAt);

  return (
    <section
      aria-labelledby="plano-vencido"
      className="mx-auto flex max-w-[44rem] flex-col items-center gap-6 py-10 text-center md:py-16"
    >
      <BrandSeal className="entra w-14" />
      <span
        className="entra t-legenda uppercase tracking-[0.14em] text-ouro-texto"
        style={step(1)}
      >
        {lapsed.trial ? `Teste do ${name}` : `Plano ${name}`} · venceu em{' '}
        {ended}
      </span>
      <h1
        id="plano-vencido"
        className="entra max-w-[18ch] text-balance font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.015em]"
        style={step(1)}
      >
        Seu plano venceu
      </h1>
      <p
        className="entra t-corpo max-w-[52ch] text-texto-suave"
        style={step(2)}
      >
        {lapsed.trial
          ? 'Os 7 dias de teste terminaram. Assine um plano para voltar ao painel do professor.'
          : 'O plano não foi renovado. Regularize a assinatura para voltar ao painel do professor.'}{' '}
        Alunos, aulas, tarefas e anotações continuam guardados, do jeito que
        você deixou.
      </p>
      <div
        className="entra flex w-full flex-wrap justify-center gap-3 max-sm:flex-col"
        style={step(3)}
      >
        <Link
          href="/pricing?para=ensinar"
          className={classesDeBotao('primario', 'm')}
        >
          {lapsed.trial ? 'Escolher um plano' : 'Regularizar o plano'}
        </Link>
        <Link
          href="/profile#profile-subscription"
          className={classesDeBotao('secundario', 'm')}
        >
          Ver minha assinatura
        </Link>
      </div>
    </section>
  );
}
