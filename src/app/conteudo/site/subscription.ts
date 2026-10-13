import type { Idioma } from '../legal/tipos';

/** The page the Stripe checkout returns to. */
const pt = {
  title: 'Assinatura ativa',
  text: 'Tudo o que o seu plano inclui já está liberado. O recibo chega no seu e-mail, e a assinatura fica em Perfil, na aba Assinatura e dados.',
  studies: 'Ir para os meus estudos',
  account: 'Ver a assinatura',
};

const en: typeof pt = {
  title: 'Subscription active',
  text: 'Everything your plan includes is unlocked. The receipt goes to your email, and the subscription lives in Profile, under Subscription and data.',
  studies: 'Go to my studies',
  account: 'See the subscription',
};

export const SUBSCRIPTION: Record<Idioma, typeof pt> = { pt, en };
