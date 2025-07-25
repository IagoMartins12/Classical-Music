import React from 'react';
import { FiBookOpen, FiClock, FiMusic, FiTarget } from 'react-icons/fi';
import { useStudyModeStore } from '@/app/stores/useStudyModeStore';
import { useAuth } from '@/app/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { IMSLPScore } from '@/app/libs/imslp-score-scraper-incremental';

interface StudyModeButtonProps {
  workId: string;
  workTitle: string;
  composerName: string;
  selectedScore?: IMSLPScore;
  variant?: 'default' | 'compact' | 'floating';
  className?: string;
}

const StudyModeButton: React.FC<StudyModeButtonProps> = ({
  workId,
  workTitle,
  composerName,
  selectedScore,
  variant = 'default',
  className = '',
}) => {
  const { isAuthenticated } = useAuth();
  const { startStudySession } = useStudyModeStore();

  const router = useRouter();
  const handleOpenStudyMode = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para usar o modo estudo');
      return;
    }

    console.log('SELECTED SCCORE', selectedScore);
    startStudySession(workId, workTitle, composerName, selectedScore);
    if (selectedScore) {
      router.push(`${workId}/${selectedScore.id}`);
    }
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleOpenStudyMode}
        className={`w-10 h-10 bg-gradient-to-br from-accent-green to-accent-blue rounded-xl hover:scale-110 hover:shadow-theme-glow transition-all duration-300 flex items-center justify-center group ${className}`}
        title="Abrir Modo Estudo"
      >
        <FiBookOpen className="w-5 h-5 text-theme-primary group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleOpenStudyMode}
          className="w-14 h-14 bg-gradient-to-br from-accent-green to-accent-blue rounded-full hover:scale-110 hover:shadow-theme-glow transition-all duration-300 flex items-center justify-center group shadow-theme-large"
          title="Abrir Modo Estudo"
        >
          <FiBookOpen className="w-6 h-6 text-theme-primary group-hover:scale-110 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleOpenStudyMode}
      className={`
        bg-gradient-to-r from-accent-green to-accent-blue 
        text-theme-primary font-semibold px-6 py-3 rounded-xl 
        hover:scale-105 hover:shadow-theme-glow 
        transition-all duration-300 
        flex items-center space-x-3 group
        ${className}
      `}
    >
      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
        <FiBookOpen className="w-4 h-4" />
      </div>

      <div className="text-left">
        <div className="flex items-center space-x-2">
          <span className="font-bold">Modo Estudo</span>
          <div className="flex items-center space-x-1 opacity-75">
            <FiClock className="w-3 h-3" />
            <FiMusic className="w-3 h-3" />
            <FiTarget className="w-3 h-3" />
          </div>
        </div>
        <div className="text-xs opacity-90">Timer • Metrônomo • Anotações</div>
      </div>

      <svg
        className="w-4 h-4 transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

export default StudyModeButton;
