import { LoadingSpinner } from '@/app/components/animation/AnimatedComponents';

interface LoadingProps {
  loadingName: string;
}
const LoadingAdminState: React.FC<LoadingProps> = ({ loadingName }) => {
  return (
    <div className="fixed inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-50">
      <div className="classical-card flex items-center justify-center flex-col p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-theme-primary font-medium mt-4">
          Carregando {loadingName}...
        </p>
      </div>
    </div>
  );
};

export default LoadingAdminState;
