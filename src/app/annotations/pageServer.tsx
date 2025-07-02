// app/annotations/pageServer.tsx
import {
  getCurrentUserAnnotations,
  getUserAnnotationStats,
  getUserTopAnnotations,
  getUserMostAnnotatedWorks,
} from '../requests/user-annotations';
import { getServerSession } from 'next-auth';
import { authOptions } from '../libs/auth';
import AnnotationsPageClient from '../components/Annotations/AnnotationsPageClient';

export default async function AnnotationsPageServer() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  return <AnnotationsPageClient />;
}
