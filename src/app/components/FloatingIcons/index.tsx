import { GiViolin } from 'react-icons/gi';
import { PiMusicNotes } from 'react-icons/pi';
import { Inline } from '@/app/components/ui/Layout';

{
  /* Floating Icons */
}

const FloatingIcons = () => {
  return (
    <Inline gap={6} className="justify-center mb-8 animate-fade-in-up">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-theme-glow animate-bounce"
        style={{ animationDelay: '0s' }}
      >
        <PiMusicNotes className="text-2xl text-theme-primary" />
      </div>
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-theme-glow animate-bounce"
        style={{ animationDelay: '0.2s' }}
      >
        <PiMusicNotes className="text-3xl text-theme-primary" />
      </div>
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-theme-glow animate-bounce"
        style={{ animationDelay: '0.4s' }}
      >
        <GiViolin className="text-2xl text-theme-primary" />
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-10px) rotate(2deg);
          }
          50% {
            transform: translateY(-5px) rotate(-1deg);
          }
          75% {
            transform: translateY(-15px) rotate(1deg);
          }
        }
      `}</style>
    </Inline>
  );
};

export default FloatingIcons;
