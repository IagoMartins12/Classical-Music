import { BlogHeader } from '@/app/components/blog/BlogHeader';
import { Metadata } from 'next';
import Footer from '../components/Footer';
import { ToasterProvider } from '../providers/ToasterProvider';

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
    <>
      <div className="classical-theme  flex flex-col">
        <BlogHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      <ToasterProvider />
    </>
  );
}
