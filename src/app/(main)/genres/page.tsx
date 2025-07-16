// app/genres/page.tsx
import { getAllWorkGenres } from '@/app/requests/work-details';
import { Metadata } from 'next';
import GenresClient from '../../components/GenresClient';

export const metadata: Metadata = {
  title: 'Gêneros Musicais | Enciclopédia de Música Clássica',
  description:
    'Explore todos os gêneros de música clássica disponíveis em nossa coleção. Descubra sonatas, concertos, sinfonias e muito mais.',
};

export default async function GenresPage() {
  try {
    const genres = await getAllWorkGenres();

    return <GenresClient genres={genres} />;
  } catch (error) {
    console.error('Erro ao carregar gêneros:', error);

    return (
      <div className=" bg-gradient-primary flex items-center justify-center p-4">
        <div className="classical-card p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-accent-red/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-accent-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-theme-primary mb-4 classical-title">
            Erro ao Carregar Gêneros
          </h2>

          <p className="text-theme-secondary mb-6">
            Ocorreu um erro inesperado ao carregar os gêneros musicais.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-classical-primary w-full"
            >
              Tentar Novamente
            </button>

            <button
              onClick={() => window.history.back()}
              className="btn-classical-secondary w-full"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
