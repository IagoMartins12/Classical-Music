import EssentialComposers from './components/EssentialComposers';
import PopularComposers from './components/PopularComposers';
import {
  getRecomendadedComposers,
  getTop20FamousComposers,
} from './requests/composers';

export default async function PageServer() {
  const [composersData, recomendadData] = await Promise.all([
    getTop20FamousComposers(),
    getRecomendadedComposers(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-6">
        🎼 Sua enciclopédia de Música clássica
      </h1>
      <PopularComposers composersData={composersData} />
      <EssentialComposers composersData={recomendadData} />
    </div>
  );
}
