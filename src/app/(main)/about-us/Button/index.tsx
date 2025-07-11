'use client';
import { useAuth } from '@/app/hooks/useAuth';
import { useRegisterModal } from '@/app/stores/authStore';
import { FiMusic, FiUsers } from 'react-icons/fi';

interface buttonProps {
  action: 'login' | 'register';
}
const Button: React.FC<buttonProps> = ({ action }) => {
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
        <FiMusic className="w-5 h-5" />
        <span>Comece Agora</span>
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
        <FiUsers className="w-5 h-5" />
        <span>Criar Conta Gratuita</span>
      </button>
    );
  }
};

export default Button;
