'use client';

import { useMemo } from 'react';
import { PiCheck, PiWarning, PiWarningCircle } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import {
  avaliarSeo,
  LIMITES,
  type ArtigoEmEdicao,
  type NivelDaDica,
} from '@/app/utils/blog/seo';

/**
 * O SEO do artigo enquanto se escreve.
 *
 * Mostra o que o buscador vai ver (a prévia do resultado, com o título e a
 * descrição que o padrão escolheu) e as regras uma a uma, cada uma dizendo o
 * que está bom e como melhorar. Nada aqui impede de salvar: o blog já gera
 * um SEO bom sozinho (ver `utils/blog/seo.ts`); as dicas são para fazer
 * melhor que o padrão.
 */

const ICONE: Record<NivelDaDica, typeof PiCheck> = {
  ok: PiCheck,
  atencao: PiWarning,
  erro: PiWarningCircle,
};

const TOM: Record<NivelDaDica, string> = {
  ok: 'text-texto-fraco',
  atencao: 'text-atencao',
  erro: 'text-erro',
};

const ROTULO: Record<NivelDaDica, string> = {
  ok: 'Certo',
  atencao: 'Pode melhorar',
  erro: 'Corrigir',
};

export function AssistenteDeSeo({ artigo }: { artigo: ArtigoEmEdicao }) {
  const { dicas, nota, titulo, descricao } = useMemo(
    () => avaliarSeo(artigo),
    [artigo]
  );

  const ordenadas = [...dicas].sort(
    (a, b) =>
      ['erro', 'atencao', 'ok'].indexOf(a.nivel) -
      ['erro', 'atencao', 'ok'].indexOf(b.nivel)
  );
  const pendentes = dicas.filter((d) => d.nivel !== 'ok').length;

  return (
    <div className="flex flex-col gap-5">
      <p className="flex items-baseline justify-between gap-3">
        <span className="t-rotulo text-texto-suave">
          {pendentes === 0
            ? 'Tudo certo para a busca.'
            : `${pendentes} ${pendentes === 1 ? 'ponto para melhorar' : 'pontos para melhorar'}`}
        </span>
        <span className="t-dado text-[0.8125rem] text-texto-fraco">
          <span className="text-base text-texto">{nota}</span>/100
        </span>
      </p>

      {/* Como o resultado aparece no Google. Sem o azul do Google: a prévia
          é sobre o texto, não sobre a cor do outro site. */}
      <figure className="flex flex-col gap-1 rounded-controle bg-[var(--campo)] p-4">
        <figcaption className="t-legenda mb-1">Prévia no Google</figcaption>
        <p className="t-dado truncate text-[0.75rem] text-texto-fraco">
          opusatlas.com.br › blog › {artigo.slug || 'endereco-do-artigo'}
        </p>
        <p className="line-clamp-2 text-[1.0625rem] leading-snug text-texto">
          {titulo
            ? cortarComo(titulo, LIMITES.titulo.max + 5)
            : 'Título do artigo'}
          <span className="text-texto-fraco"> | Opus Atlas</span>
        </p>
        <p className="line-clamp-2 text-[0.8125rem] leading-[1.5] text-texto-suave">
          {descricao || 'A descrição aparece aqui.'}
        </p>
      </figure>

      <ul className="flex flex-col">
        {ordenadas.map((d) => (
          <li
            key={d.id}
            className="flex gap-3 border-b border-linha py-3 last:border-b-0"
          >
            <Icon
              de={ICONE[d.nivel]}
              tamanho="p"
              rotulo={ROTULO[d.nivel]}
              className={cx('mt-0.5', TOM[d.nivel])}
            />
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[0.875rem] font-medium text-texto">
                {d.titulo}
              </span>
              {d.nivel !== 'ok' && (
                <span className="t-legenda">{d.detalhe}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** O Google corta o título longo com reticências; a prévia também. */
function cortarComo(texto: string, limite: number) {
  return texto.length > limite
    ? `${texto.slice(0, limite - 1).trim()}…`
    : texto;
}
