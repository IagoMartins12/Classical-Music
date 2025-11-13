import { BlogHeader } from '@/app/components/blog/BlogHeader';
import { Metadata } from 'next';
import Footer from '../components/Footer';
import { ToasterProvider } from '../providers/ToasterProvider';
import { FavoritesProvider } from '../providers/FavoritesProvider';
import AdsProvider from '../components/Ads/AdsProvider';

export const metadata: Metadata = {
  title: 'Blog - Opus Atlas',
  description: 'Explore o mundo da música clássica',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="classical-theme  flex flex-col">
          <BlogHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>

        <ToasterProvider />
      </FavoritesProvider>
    </AdsProvider>
  );
}
