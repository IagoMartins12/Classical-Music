// app/[lang]/(main)/layout.tsx — casca do site público, parte cacheável
//
// Mesma casca de `app/(main)/layout.tsx` (ver `components/MainShell`); o que
// muda é o que fica embaixo: aqui só entram páginas que não dependem de quem
// está pedindo, e que por isso o Next pode gerar uma vez por idioma e servir
// prontas.
import MainShell from '../../components/MainShell';

export default function LocalizedMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainShell>{children}</MainShell>;
}
