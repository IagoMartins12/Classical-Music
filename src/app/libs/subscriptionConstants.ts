// app/libs/subscriptionConstants.ts
//
// Só os nomes: os planos e os períodos de cobrança.
//
// Esta arquivo guardava uma cópia da matriz de planos (limites, recursos), do
// teste grátis (14 e 30 dias para Mentor e Maestro, quando a regra é 7 para
// todos) e dos preços. Nada a lia, e a cópia já tinha ficado para trás da
// API (`notifications` desligado em três planos; o teste grátis errado).
// A fonte da verdade é a API: matriz e teste grátis em
// `billing/constants/plan-features.constants.ts`, preços em `GET /pricing`. O
// que a página de planos anuncia vem de `conteudo/planos.ts` (`LIMITES`).

export enum PlanType {
  FREE = 'FREE',
  PLUS = 'PLUS',
  MENTOR = 'MENTOR',
  MAESTRO = 'MAESTRO',
}

export enum BillingPeriod {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}
