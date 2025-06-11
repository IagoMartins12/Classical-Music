import { FiMusic } from 'react-icons/fi';
import { GiMusicalNotes, GiViolin } from 'react-icons/gi';

{
  /* Floating Icons */
}

const FloatingIcons = () => {
  return (
    <div className="flex justify-center items-center mb-8 space-x-6 animate-fade-in-up">
      <div
        className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-2xl flex items-center justify-center shadow-theme-glow animate-bounce"
        style={{ animationDelay: '0s' }}
      >
        <FiMusic className="text-2xl text-theme-primary" />
      </div>
      <div
        className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center shadow-theme-glow animate-bounce"
        style={{ animationDelay: '0.2s' }}
      >
        <GiMusicalNotes className="text-3xl text-theme-primary" />
      </div>
      <div
        className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-red rounded-2xl flex items-center justify-center shadow-theme-glow animate-bounce"
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
    </div>
  );
};

export default FloatingIcons;
