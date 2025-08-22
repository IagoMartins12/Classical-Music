// app/annotations/pageServer.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import AnnotationsPageClient from './pageClient';

export default async function AnnotationsPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return <AnnotationsPageClient />;
}
