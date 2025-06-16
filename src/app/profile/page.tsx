// app/profile/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import ProfileSkeleton from './loading';
import ProfilePageClient from '../components/profile/ProfilePageClient';

export const metadata: Metadata = {
  title: 'Meu Perfil | Classical Hub',
  description:
    'Gerencie suas informações pessoais, preferências musicais e configurações da conta',
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-theme-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-theme-primary mb-2">
            Meu Perfil
          </h1>
        </div>

        <Suspense fallback={<ProfileSkeleton />}>
          <ProfilePageClient />
        </Suspense>
      </div>
    </div>
  );
}
