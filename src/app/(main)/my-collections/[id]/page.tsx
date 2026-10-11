import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PrivateCollection } from '@/app/components/site/collections/MyCollectionsView';
import { getServerSession } from '@/app/libs/api/server-session';

// A collection only its owner sees: read in the browser, never cached.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PrivateCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user?.id) redirect('/not-authenticated');
  return <PrivateCollection id={(await params).id} />;
}
