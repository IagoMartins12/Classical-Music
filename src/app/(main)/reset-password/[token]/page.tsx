import { ResetPasswordView } from '@/app/components/site/tokens/ResetPasswordView';
import { tokenMetadata } from '@/app/components/site/tokens/tokenMetadata';

/**
 * Never cached: the token works once and the page acts on it. Cached, a
 * second visit would see the first one's answer.
 */
export const dynamic = 'force-dynamic';

export const generateMetadata = () => tokenMetadata('reset');

export default function Page() {
  return <ResetPasswordView />;
}
