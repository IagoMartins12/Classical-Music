'use client';

import { PiArrowRight, PiCheck } from 'react-icons/pi';
import Link from '@/app/components/LocalizedLink';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { LOCKED, type RecursoBloqueado } from '@/app/conteudo/site/locked';
import { PLANOS, type ChavePlano } from '@/app/conteudo/planos';
import { useRouteLanguage } from '@/app/hooks/useRouteLanguage';

/**
 * Um recurso que o plano da pessoa não inclui, ao ser tocado: o que ele faz,
 * antes de mandar para os planos. "Conhecer o Plus" leva a `/pricing#plus`,
 * que abre a página já no plano (`QuadroDePlanos`).
 *
 * A folha de sempre, com os botões à direita: nada de emblema nem de
 * cabeçalho próprio, para não parecer outro produto.
 */
export function RecursoDoPlano({
  recurso,
  aberto,
  aoFechar,
  plano = 'PLUS',
  limite = null,
}: {
  recurso: RecursoBloqueado;
  aberto: boolean;
  aoFechar: () => void;
  /** O plano que inclui o recurso. */
  plano?: Exclude<ChavePlano, 'FREE'>;
  /** O teto do plano atual, quando o recurso é um limite (vídeos, envios). */
  limite?: number | null;
}) {
  const { language } = useRouteLanguage();
  const copy = LOCKED[language];
  const texto = copy.recursos[recurso];
  const nome = PLANOS[language].planos[plano].nome;

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo={texto.title}
      descricao={texto.text(limite)}
      largura="p"
      rodape={
        <>
          <Button variante="fantasma" onClick={aoFechar}>
            {copy.notNow}
          </Button>
          <Link
            href={`/pricing#${plano.toLowerCase()}`}
            className={classesDeBotao('primario', 'm')}
          >
            {copy.action(nome)}
            <Icon de={PiArrowRight} tamanho="pp" />
          </Link>
        </>
      }
    >
      <ul className="flex flex-col gap-3">
        {texto.items.map((item) => (
          <li key={item} className="t-corpo flex gap-3">
            <Icon de={PiCheck} className="mt-1 shrink-0 text-ouro-texto" />
            {item}
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
