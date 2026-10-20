import Link from 'next/link';
import { classesDeBotao } from '@/app/components/ui/Button';
import { Vazio } from '@/app/components/ui/Estados';

export default function PainelNaoEncontrado() {
  return (
    <Vazio
      titulo="Esta página do painel não existe"
      descricao="O endereço pode ter mudado no redesenho de 29/09/2026. O menu ao lado e o ⌘K levam a todas as páginas."
      acao={
        <Link href="/admin" className={classesDeBotao('secundario', 'p')}>
          Voltar ao painel
        </Link>
      }
    />
  );
}
