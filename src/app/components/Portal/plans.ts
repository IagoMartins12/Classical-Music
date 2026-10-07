// components/Portal/plans.ts — o nome de cada plano, como a página de planos escreve
import { PLANOS } from '@/app/conteudo/planos';

export const PLAN_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(PLANOS.pt.planos).map(([key, plan]) => [key, plan.nome])
);
