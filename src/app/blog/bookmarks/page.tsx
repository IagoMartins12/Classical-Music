// app/blog/bookmarks/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { FiBookmark } from 'react-icons/fi';
import { listCategories } from '@/app/requests/blog/taxonomy';
import AnimatedMusicalNotesClient from '@/app/components/AnimatedMusicalNotesClient';
import { BookmarksPageClient } from '@/app/components/blog/BookmarksPageClient';
import { AnimatedItem } from '@/app/components/animation/AnimatedComponents';
import { getServerSession } from '@/app/libs/api/server-session';

export const metadata: Metadata = {
  title: 'Artigos Salvos - Blog Opus Atlas',
  description: 'Sua coleção pessoal para ler mais tarde',
  robots: 'noindex, nofollow',
};

export const revalidate = 0; // Sempre fresh

async function getCategories() {
  const categories = await listCategories();
  return categories.map(({ id, name, slug, color, icon }) => ({
    id,
    name,
    slug,
    color,
    icon,
  }));
}

export default async function BookmarksPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/login?callbackUrl=/blog/bookmarks');
  }

  const categories = await getCategories();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative section-wrap overflow-hidden">
        <AnimatedItem
          direction="up"
          springType="bouncy"
          className="relative text-center py-16"
        >
          <AnimatedMusicalNotesClient />

          <div className="relative z-10">
            <AnimatedItem
              direction="scale"
              className="flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow">
                <FiBookmark className="w-8 h-8 text-theme-primary" />
              </div>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <h1 className="text-4xl md:text-5xl font-bold text-gradient-brand classical-title mb-4">
                Lista de Leitura
              </h1>
            </AnimatedItem>

            <AnimatedItem direction="up">
              <p className="text-xl text-theme-secondary max-w-3xl mx-auto classical-subtitle mb-8">
                Sua coleção pessoal de artigos salvos
              </p>
            </AnimatedItem>
          </div>
        </AnimatedItem>
      </div>

      {/* Client Component */}
      <div className="section-wrap pb-16">
        <BookmarksPageClient categories={categories} />
      </div>
    </div>
  );
}
