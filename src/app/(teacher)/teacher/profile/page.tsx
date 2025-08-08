// app/teacher/profile/page.tsx - Página do Perfil do Professor

import { Metadata } from 'next';
import TeacherProfilePageServer from './pageServer';

export const metadata: Metadata = {
  title: 'Meu Perfil | Professor - Opus Atlas',
  description:
    'Gerencie seu perfil de professor, especialidades, experiência e configurações de ensino',
  keywords:
    'perfil professor, especialidades musicais, experiência, configurações ensino, dados pessoais',
  openGraph: {
    title: 'Perfil do Professor - Opus Atlas',
    description:
      'Configure seu perfil profissional e destaque suas especialidades musicais',
    type: 'website',
  },
};

export default async function TeacherProfilePage() {
  return <TeacherProfilePageServer />;
}
