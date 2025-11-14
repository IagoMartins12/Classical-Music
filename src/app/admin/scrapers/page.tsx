import ScraperManager from '@/app/components/blog/ScraperManager';

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
