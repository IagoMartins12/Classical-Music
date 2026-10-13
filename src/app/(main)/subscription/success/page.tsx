// Retorno do checkout do Stripe: a API manda a pessoa para
// `/subscription/success?session_id=…`.
import { SubscriptionSuccess } from './SubscriptionSuccess';
import { confirmCheckoutSession } from '@/app/requests/billing';

/**
 * Nunca cacheada: o conteúdo é de quem está logado.
 */
export const dynamic = 'force-dynamic';

interface SubscriptionReturnProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SubscriptionReturnPage({
  searchParams,
}: SubscriptionReturnProps) {
  const { session_id: sessionId } = await searchParams;

  // Confirma já no retorno, sem esperar o webhook. Se falhar, o webhook
  // confirma depois; a tela de sucesso aparece do mesmo jeito.
  if (sessionId) {
    await confirmCheckoutSession(sessionId).catch(() => undefined);
  }

  return <SubscriptionSuccess />;
}
