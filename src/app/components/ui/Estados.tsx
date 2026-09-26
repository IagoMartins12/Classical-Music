import type { ComponentType, ReactNode, SVGProps } from 'react';
import { cx } from './cx';
import { Icon } from './Icon';

/**
 * Vazio e erro: os dois estados que quase não existem no produto hoje.
 *
 * **Vazio** diz o que há, por que está vazio e o que fazer. Três frases e uma
 * ação, não uma ilustração. Uma lista vazia sem explicação faz a pessoa achar
 * que o site quebrou.
 *
 * **Erro** nomeia o que falhou e o que sobreviveu ("seus filtros foram
 * mantidos"), e oferece o caminho de volta. Sem "Ops", sem ponto de
 * exclamação: quem está lendo já sabe que deu errado.
 */

export function Vazio({
  icone,
  titulo,
  descricao,
  acao,
  className,
}: {
  icone?: ComponentType<SVGProps<SVGSVGElement>>;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-start gap-3 rounded-card border border-dashed border-linha-forte p-6',
        className
      )}
    >
      <span className="flex items-center gap-2.5">
        {icone && <Icon de={icone} tamanho="m" className="text-ouro-texto" />}
        <span className="t-subtitulo">{titulo}</span>
      </span>
      {descricao && <p className="t-rotulo text-texto-suave">{descricao}</p>}
      {acao && <div className="flex gap-2 pt-1">{acao}</div>}
    </div>
  );
}

export function Erro({
  titulo,
  descricao,
  acao,
  className,
}: {
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cx(
        'flex flex-col items-start gap-2.5 rounded-card border border-erro/30 bg-erro/10 p-6',
        className
      )}
    >
      <span className="text-[0.9375rem] font-medium text-erro">{titulo}</span>
      {descricao && <p className="t-rotulo text-texto">{descricao}</p>}
      {acao && <div className="flex gap-2 pt-1">{acao}</div>}
    </div>
  );
}
