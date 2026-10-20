import type { Metadata } from 'next';
import { ProfileScreen } from '@/app/components/Portal/screens/ProfileScreen';

export const metadata: Metadata = { title: 'Perfil do portal' };

export default function PortalProfilePage() {
  return <ProfileScreen role="student" />;
}
