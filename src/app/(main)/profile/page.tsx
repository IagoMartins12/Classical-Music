// app/profile/page.tsx
import { Metadata } from 'next';
import { Suspense } from 'react';
import ProfileSkeleton from './loading';
import ProfilePageClient from './pageClient';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../libs/auth';
import AuthCheck from '../../components/AuthCheck';

export const metadata: Metadata = {
  title: 'Meu Perfil | Opus Atlas',
  description:
    'Gerencie suas informações pessoais, preferências musicais e configurações da conta',
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return <AuthCheck title="Seu perfil" />;
  }

  return (
    <div className="section-wrap">
      <Suspense fallback={<ProfileSkeleton />}>
        <ProfilePageClient />
      </Suspense>
    </div>
  );
}
