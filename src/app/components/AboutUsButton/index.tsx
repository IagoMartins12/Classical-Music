'use client';
import { useAuth } from '@/app/hooks/useAuth';
import { useRegisterModal } from '@/app/stores/authStore';
import { Language } from '@/app/utils/translations/serverTranslations';
import { PiMusicNotes, PiUsers } from 'react-icons/pi';

interface buttonProps {
  language: Language;
  action: 'login' | 'register';
}
const AboutUsButton: React.FC<buttonProps> = ({ action, language }) => {
  const { open: openRegisterModal } = useRegisterModal();

  const { isAuthenticated } = useAuth();

  if (action === 'register') {
    return (
      <button
        className="btn-classical-primary flex items-center justify-center space-x-2 px-8 py-4 text-lg hover:scale-105"
        onClick={() => {
          if (isAuthenticated) return;
          openRegisterModal();
        }}
      >
        <PiMusicNotes className="w-5 h-5" />
        <span>{language === 'pt' ? 'Comece Agora' : 'Start now'}</span>
      </button>
    );
  }

  if (action === 'login') {
    return (
      <button
        className="btn-classical-primary flex items-center justify-center space-x-3 px-10 py-4 text-lg hover:scale-105"
        onClick={() => {
          if (isAuthenticated) return;
          openRegisterModal();
        }}
      >
        <PiUsers className="w-5 h-5" />
        <span>
          {language === 'pt' ? 'Criar Conta Gratuita' : 'Create Free Account'}
        </span>
      </button>
    );
  }
};

export default AboutUsButton;
