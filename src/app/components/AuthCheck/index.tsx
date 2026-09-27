// components/auth/AuthCheck.tsx - Component to handle client-side auth checks with modal
'use client';

import { useLoginModal } from '@/app/stores/authStore';
import { PiHeart } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';

interface AuthCheckProps {
  title:
    | 'Seus favoritos'
    | 'Seu perfil'
    | 'Suas lições'
    | 'Suas anotações musicais'
    | 'Meus Uploads';
}

export default function AuthCheck({ title }: AuthCheckProps) {
  const { open } = useLoginModal();
  return (
    <div className=" bg-gradient-primary min-h-[70vh] flex items-center justify-center">
      <div className="text-center classical-card p-8 max-w-md">
        <PiHeart className="w-16 h-16 text-brand-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-theme-primary mb-2">
          Acesso Necessário
        </h1>
        <p className="text-theme-secondary mb-6">
          Faça login para acessar {title}
        </p>
        <Button variante="primario" type="submit" onClick={open}>
          Fazer Login
        </Button>
      </div>
    </div>
  );
}
