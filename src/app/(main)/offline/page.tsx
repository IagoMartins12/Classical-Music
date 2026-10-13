import type { Metadata } from 'next';
import { OnDevice } from '@/app/components/site/pwa/OnDevice';

export const metadata: Metadata = {
  title: 'No aparelho · Opus Atlas',
  robots: { index: false, follow: false },
};

/**
 * What is on this device: the app's offline fallback (a page never opened
 * here, without network) and the list of saved scores.
 */
export default function OfflinePage() {
  return <OnDevice />;
}
