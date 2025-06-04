import AllComposerList from './components/AllComposersList';
import EssentialComposers from './components/EssentialComposers';
import PopularComposers from './components/PopularComposers';
import PageServer from './pageServer';

export default function HomePage() {
  return (
    <div className=" mx-auto py-6">
      <PageServer />
    </div>
  );
}
