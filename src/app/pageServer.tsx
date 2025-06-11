import EssentialComposers from './components/EssentialComposers';
import HeroMainPage from './components/HeroMainPage';
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
      <HeroMainPage />
      <PopularComposers composersData={composersData} />
      <EssentialComposers composersData={recomendadData} />
    </div>
  );
}
