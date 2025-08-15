// app/components/EmailVerifiedWrapper.tsx
// Componente para proteger funcionalidades que exigem email verificado

import { ReactNode } from 'react';
import EmailVerificationRequired from '../../VerificationsProviders/EmailVerificationRequired';
import { FiMail } from 'react-icons/fi';
import Button from '../../Common/Button';

interface EmailVerifiedWrapperProps {
  children: ReactNode;
  isEmailVerified: boolean;
  userEmail: string;
  userName?: string;
  fallback?: 'full-page' | 'inline-message' | 'disabled';
  className?: string;
}

export default function EmailVerifiedWrapper({
  children,
  isEmailVerified,
  userEmail,
  userName,
  fallback = 'full-page',
  className = '',
}: EmailVerifiedWrapperProps) {
  // Se email está verificado, mostrar conteúdo normalmente
  if (isEmailVerified) {
    return <>{children}</>;
  }

  // Renderizar baseado no tipo de fallback
  switch (fallback) {
    case 'full-page':
      return (
        <EmailVerificationRequired userEmail={userEmail} userName={userName} />
      );

    case 'inline-message':
      return (
        <div className={`classical-card p-8 text-center ${className}`}>
          <div className="w-16 h-16 bg-gradient-to-br from-accent-amber/20 to-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiMail className="w-8 h-8 text-accent-amber" />
          </div>
          <h3 className="text-xl font-bold text-theme-primary mb-2 classical-title">
            Email não verificado
          </h3>
          <p className="text-theme-secondary mb-6">
            Para acessar esta funcionalidade, você precisa confirmar seu email.
          </p>
          <div className="flex justify-center">
            <Button
              onClick={() => (window.location.href = '/uploads')}
              variant="primary"
              leftIcon={<FiMail />}
            >
              Verificar Email
            </Button>
          </div>
        </div>
      );

    case 'disabled':
      return (
        <div className={`relative ${className}`}>
          {/* Overlay que desabilita o conteúdo */}
          <div className="absolute inset-0 bg-theme-overlay backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
            <div className="classical-card p-6 text-center max-w-sm">
              <FiMail className="w-8 h-8 text-accent-amber mx-auto mb-3" />
              <h4 className="font-semibold text-theme-primary mb-2">
                Email não verificado
              </h4>
              <p className="text-sm text-theme-secondary mb-4">
                Confirme seu email para usar esta funcionalidade.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => (window.location.href = '/uploads')}
              >
                Verificar Agora
              </Button>
            </div>
          </div>

          {/* Conteúdo original (desabilitado visualmente) */}
          <div className="opacity-30 pointer-events-none">{children}</div>
        </div>
      );

    default:
      return null;
  }
}

// Hook personalizado para usar com o wrapper
export function useEmailVerifiedWrapper(userData: any) {
  return {
    isEmailVerified: userData?.emailVerified || false,
    userEmail: userData?.email || '',
    userName: userData?.firstName || userData?.username,
  };
}

// Exemplos de uso:

// 1. Proteção de página inteira:
/*
export default function SomeProtectedPage() {
  const userData = await getUserData();
  
  return (
    <EmailVerifiedWrapper
      isEmailVerified={userData.emailVerified}
      userEmail={userData.email}
      userName={userData.firstName}
      fallback="full-page"
    >
      <div>Conteúdo da página...</div>
    </EmailVerifiedWrapper>
  );
}
*/

// 2. Proteção de seção específica:
/*
<EmailVerifiedWrapper
  isEmailVerified={user.emailVerified}
  userEmail={user.email}
  userName={user.firstName}
  fallback="inline-message"
  className="mb-8"
>
  <UploadSection />
</EmailVerifiedWrapper>
*/

// 3. Desabilitar funcionalidade:
/*
<EmailVerifiedWrapper
  isEmailVerified={user.emailVerified}
  userEmail={user.email}
  fallback="disabled"
>
  <Button onClick={handleUpload}>
    Fazer Upload
  </Button>
</EmailVerifiedWrapper>
*/
