// app/favorites/page.tsx - Favoritos pessoais otimizado
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/libs/auth';
import {
  getServerLanguageStatic,
  loadPageTranslationsWithCommon,
} from '@/app/utils/translations/serverTranslations';
import { redirect } from 'next/navigation';
import { TranslationProvider } from '@/app/context/TranslationContext';
import FavoritesClient from './pageClient';
import { AchievementProvider } from '@/app/components/achievement/AchievementToast';

export async function generateMetadata() {
  const language = await getServerLanguageStatic();

  const content = {
    pt: {
      title: 'Meus Favoritos - Opus Atlas | Coleção Musical Pessoal',
      description:
        'Sua coleção pessoal de compositores e obras favoritas de música clássica. Organize e acesse rapidamente suas peças preferidas de Bach, Chopin, Beethoven e outros mestres.',
      ogTitle: 'Minha Coleção Musical - Opus Atlas',
      ogDescription:
        'Explore minha coleção pessoal de obras clássicas favoritas',
      keywords: ['favoritos música', 'coleção pessoal', 'obras favoritas'],
    },
    en: {
      title: 'My Favorites - Opus Atlas | Personal Music Collection',
      description:
        'Your personal collection of favorite classical music composers and works. Organize and quickly access your preferred pieces from Bach, Chopin, Beethoven and other masters.',
      ogTitle: 'My Music Collection - Opus Atlas',
      ogDescription:
        'Explore my personal collection of favorite classical works',
      keywords: ['music favorites', 'personal collection', 'favorite works'],
    },
  };

  const t = content[language];

  return {
    title: t.title,
    description: t.description,
    keywords: t.keywords,
    authors: [{ name: 'Opus Atlas' }],
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
    openGraph: {
      title: t.ogTitle,
      description: t.ogDescription,
      type: 'website',
      locale: language === 'pt' ? 'pt_BR' : 'en_US',
      siteName: 'Opus Atlas',
    },
    twitter: {
      card: 'summary',
      title: t.ogTitle,
      description: t.ogDescription,
    },
  };
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return redirect('/not-authenticated');
  }

  const language = await getServerLanguageStatic();
  const { translations } = await loadPageTranslationsWithCommon(language, [
    'pages/favorites',
  ]);

  return (
    <TranslationProvider language={language} translations={translations}>
      <AchievementProvider>
        <FavoritesClient />
      </AchievementProvider>
    </TranslationProvider>
  );
}
