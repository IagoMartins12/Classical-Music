import ScraperManager from '@/app/components/blog/ScraperManager';

// Painel em CSR: o dado vem da API pelo navegador. Sem isto o Next tenta
// pré-renderizar a página e para no `useSearchParams` do gerenciador.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Scrapers - Admin',
  description: 'Gerenciar scrapers de eventos',
};

export default function ScrapersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Scrapers de Eventos</h1>
        <p className="text-theme-secondary">
          Busque e importe eventos automaticamente de diversas fontes
        </p>
      </div>

      <ScraperManager />
    </div>
  );
}
