// components/MainShell — o invólucro visual do site público
//
// Era o corpo de `(main)/layout.tsx`. Saiu de lá porque agora há dois grupos
// de rota com a mesma casca: `app/[lang]/(main)/` (as páginas públicas, que o
// Next gera por idioma e guarda) e `app/(main)/` (as que dependem de quem
// está logado e seguem dinâmicas). Um componente só, para as duas não
// divergirem — nada aqui mudou de aparência.
import { Toaster } from 'react-hot-toast';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { FavoritesProvider } from '../../providers/FavoritesProvider';
import AdsProvider from '../Ads/AdsProvider';

export default function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <AdsProvider>
      <FavoritesProvider>
        <div className="min-h-screen">
          <Navbar />
          <main>{children}</main>
          <Footer />

          {/* Toaster para área pública */}
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
                  primary: 'var(--brand-primary)',
                  secondary: 'white',
                },
                style: {
                  border: '1px solid var(--brand-primary)',
                  background:
                    'linear-gradient(135deg, var(--bg-elevated) 0%, rgba(99, 102, 241, 0.05) 100%)',
                },
              },
            }}
          />
        </div>
      </FavoritesProvider>
    </AdsProvider>
  );
}
