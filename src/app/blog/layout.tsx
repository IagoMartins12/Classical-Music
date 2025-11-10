import { BlogHeader } from '@/app/components/blog/BlogHeader';
import AuthProvider from '@/app/providers/AuthProvider';
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
    <AuthProvider>
      <div className="classical-theme  flex flex-col">
        <BlogHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      <ToasterProvider />
    </AuthProvider>
  );
}
