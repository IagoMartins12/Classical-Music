// app/admin/orphan-files/page.tsx
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import { redirect } from 'next/navigation';
import BlogMediaGalleryClient from '@/app/components/Admin/BlogMediaGalleryClient';

export const metadata: Metadata = {
  title: 'Media de arquivos | Admin Panel',
  description: 'Encontrar todas as medias do blog',
  robots: 'noindex, nofollow',
};

export default async function BlogMediaPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== 2) {
    redirect('/');
  }

  return <BlogMediaGalleryClient />;
}
