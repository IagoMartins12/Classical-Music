// app/uploads/loading.tsx
import { LoadingSpinner } from '../components/animation/AnimatedComponents';

export default function UploadsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-theme-primary">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-theme-secondary">Carregando uploads...</p>
      </div>
    </div>
  );
}
