// app/(main)/layout.tsx — casca do site público, parte dinâmica
//
// Aqui ficam as páginas que dependem de quem está logado ou de um token de uso
// único (favoritos, aprendizado, perfil, envios, moderação, confirmações). Elas
// não podem ser cacheadas e por isso não entraram em `app/[lang]/(main)/`.
// A casca é a mesma — ver `components/MainShell`.
import MainShell from '../components/MainShell';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainShell>{children}</MainShell>;
}
