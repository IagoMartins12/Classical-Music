// app/admin/orphan-files/page.tsx
import { Metadata } from 'next';
import BlogMediaGalleryClient from '@/app/components/Admin/BlogMediaGalleryClient';

// Painel em CSR: o dado vem da API pelo navegador.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Media de arquivos | Admin Panel',
  description: 'Encontrar todas as medias do blog',
  robots: 'noindex, nofollow',
};

export default function BlogMediaPage() {
  return <BlogMediaGalleryClient />;
}
