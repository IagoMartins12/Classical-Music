import { BlogHeader } from '@/app/components/blog/BlogHeader';
import AuthProvider from '@/app/providers/AuthProvider';
import { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/Footer';

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

      <Toaster
        position="top-center"
        containerClassName="toast-container"
        toastOptions={{
          duration: 4000,
          className: 'toast-item',
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            boxShadow:
              '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            backdropFilter: 'blur(8px)',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-green)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--accent-red)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-red)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(239, 68, 68, 0.05) 100%)',
            },
          },
          loading: {
            iconTheme: {
              primary: 'var(--accent-green)',
              secondary: 'white',
            },
            style: {
              border: '1px solid var(--accent-green)',
              background:
                'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(34, 197, 94, 0.05) 100%)',
            },
          },
        }}
      />
    </AuthProvider>
  );
}
