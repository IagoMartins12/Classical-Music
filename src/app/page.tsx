import PopularComposers from './components/PopularComposers';

export default function HomePage() {
  return (
    <div className=" mx-auto py-6">
      <h1 className="text-3xl font-bold text-center mb-6">
        🎼 Música Clássica
      </h1>

      <PopularComposers />
    </div>
  );
}
