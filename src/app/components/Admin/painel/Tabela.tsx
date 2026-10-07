'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { Button, classesDeBotao } from '@/app/components/ui/Button';
import { Icon } from '@/app/components/ui/Icon';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { cx } from '@/app/components/ui/cx';

/**
 * A tabela do painel.
 *
 * **Uma superfície, linhas dentro.** O painel antigo desenhava um card por
 * registro — trinta caixas empilhadas onde deveria haver uma tabela. Aqui a
 * separação é a divisória de 1px e o realce sob o cursor.
 *
 * **No telefone, cada linha vira bloco**: a coluna `principal` em cima e as
 * outras embaixo, com o rótulo da coluna ao lado do valor. Rolagem lateral é
 * o pior jeito de ler tabela em tela estreita.
 *
 * Números em coluna usam `t-dado` (mono tabular) para alinhar os dígitos; a
 * coluna com `alinhar: 'fim'` é a de número.
 */

export interface Coluna<T> {
  id: string;
  titulo: string;
  celula: (linha: T) => ReactNode;
  alinhar?: 'inicio' | 'fim';
  /** A coluna que dá nome à linha: primeira no telefone, sem rótulo. */
  principal?: boolean;
  /** Some no telefone (o dado está na linha principal ou não é essencial). */
  soNoComputador?: boolean;
  className?: string;
}

export function Tabela<T>({
  colunas,
  linhas,
  chave,
  rotulo,
  carregando = false,
  erro,
  vazio,
  aoClicar,
  selecionadas,
  aoSelecionar,
  rotuloSelecao,
  maisItens,
  carregandoMais = false,
  aoCarregarMais,
  rodape,
  acoes,
  className,
}: {
  colunas: Coluna<T>[];
  linhas: T[];
  chave: (linha: T) => string;
  /** Nome da tabela para leitor de tela. */
  rotulo: string;
  carregando?: boolean;
  erro?: ReactNode;
  vazio?: ReactNode;
  aoClicar?: (linha: T) => void;
  selecionadas?: string[];
  aoSelecionar?: (ids: string[]) => void;
  rotuloSelecao?: (linha: T) => string;
  maisItens?: boolean;
  carregandoMais?: boolean;
  aoCarregarMais?: () => void;
  /** Texto do pé ("1–25 de 1.204"). */
  rodape?: ReactNode;
  /**
   * Os botões da linha (ver, editar, ativar). Ficam na última coluna e não
   * disparam o clique da linha; no telefone, numa faixa própria no pé do
   * bloco, onde o dedo alcança sem acertar o resto.
   */
  acoes?: (linha: T) => ReactNode;
  className?: string;
}) {
  const selecionaveis = !!aoSelecionar;
  const ids = linhas.map(chave);
  const todas =
    selecionaveis &&
    ids.length > 0 &&
    ids.every((id) => selecionadas?.includes(id));

  const alternar = (id: string) => {
    if (!aoSelecionar) return;
    const atual = selecionadas ?? [];
    aoSelecionar(
      atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
    );
  };

  return (
    <div className={cx('sup-1 relative overflow-hidden !p-0', className)}>
      {selecionaveis && linhas.length > 0 && !carregando && (
        // No telefone o cabeçalho some — e com ele a caixa de "todas".
        <label className="flex min-h-11 cursor-pointer items-center gap-3 px-4 md:hidden">
          <input
            type="checkbox"
            checked={todas}
            onChange={() => aoSelecionar?.(todas ? [] : ids)}
            className="h-4 w-4 accent-[var(--ouro)]"
          />
          <span className="t-rotulo text-texto-suave">
            {todas
              ? `Todos os ${ids.length} marcados`
              : `Marcar os ${ids.length} da lista`}
          </span>
        </label>
      )}
      <table
        className="w-full border-collapse text-left max-md:block"
        aria-label={rotulo}
      >
        <thead className="max-md:hidden">
          <tr className="t-legenda">
            {selecionaveis && (
              <th className="w-10 py-3 pl-4 font-normal">
                <input
                  type="checkbox"
                  checked={todas}
                  onChange={() => aoSelecionar?.(todas ? [] : ids)}
                  aria-label={`Marcar as ${ids.length} linhas carregadas`}
                  title={`Marcar as ${ids.length} linhas carregadas`}
                  className="h-4 w-4 accent-[var(--ouro)]"
                />
              </th>
            )}
            {colunas.map((c) => (
              <th
                key={c.id}
                scope="col"
                className={cx(
                  'px-4 py-3 font-normal',
                  c.alinhar === 'fim' && 'text-right',
                  c.className
                )}
              >
                {c.titulo}
              </th>
            ))}
            {acoes && (
              <th className="w-px px-4 py-3 text-right font-normal">
                <span className="sr-only">Ações</span>
              </th>
            )}
          </tr>
        </thead>

        <tbody className="max-md:block">
          {carregando &&
            Array.from({ length: 6 }, (_, i) => (
              <tr
                key={`esq-${i}`}
                className="border-t border-linha max-md:block max-md:px-4 max-md:py-3"
              >
                {selecionaveis && <td className="py-3.5 pl-4 max-md:hidden" />}
                {colunas.map((c, j) => (
                  <td
                    key={c.id}
                    className={cx(
                      'px-4 py-3.5 max-md:block max-md:px-0 max-md:py-1',
                      c.soNoComputador && 'max-md:hidden'
                    )}
                  >
                    <Skeleton className={j === 0 ? 'w-[70%]' : 'w-[50%]'} />
                  </td>
                ))}
                {acoes && <td className="max-md:hidden" />}
              </tr>
            ))}

          {!carregando &&
            linhas.map((linha) => {
              const id = chave(linha);
              const marcada = selecionadas?.includes(id) ?? false;
              return (
                <tr
                  key={id}
                  onClick={aoClicar ? () => aoClicar(linha) : undefined}
                  className={cx(
                    'border-t border-linha transition-colors duration-[var(--t-resposta)] ease-saida motion-reduce:transition-none',
                    'max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-4 max-md:gap-y-1 max-md:px-4 max-md:py-3',
                    aoClicar && 'cursor-pointer',
                    marcada
                      ? 'bg-[var(--interactive-hover)]'
                      : 'hover:bg-[var(--interactive-hover)]'
                  )}
                >
                  {selecionaveis && (
                    <td
                      className="py-3 pl-4 align-middle max-md:order-first max-md:p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={marcada}
                        onChange={() => alternar(id)}
                        aria-label={
                          rotuloSelecao ? rotuloSelecao(linha) : 'Selecionar'
                        }
                        className="h-4 w-4 accent-[var(--ouro)]"
                      />
                    </td>
                  )}
                  {colunas.map((c) => (
                    <td
                      key={c.id}
                      className={cx(
                        'px-4 py-3 align-middle',
                        c.alinhar === 'fim' && 't-dado text-right',
                        'max-md:p-0 max-md:text-left',
                        c.principal
                          ? 'max-md:order-first max-md:w-[calc(100%-2.5rem)] max-md:flex-1'
                          : 'max-md:text-sm',
                        c.soNoComputador && 'max-md:hidden',
                        c.className
                      )}
                    >
                      {!c.principal && (
                        <span className="t-legenda mr-1.5 md:hidden">
                          {c.titulo}:
                        </span>
                      )}
                      {c.celula(linha)}
                    </td>
                  ))}
                  {acoes && (
                    <td
                      className="whitespace-nowrap px-2 py-1 text-right align-middle max-md:order-last max-md:-mr-2 max-md:ml-auto max-md:p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {acoes(linha)}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
        </tbody>
      </table>

      {!carregando && erro && (
        <div className="border-t border-linha p-6">{erro}</div>
      )}
      {!carregando && !erro && linhas.length === 0 && vazio && (
        <div className="border-t border-linha p-6">{vazio}</div>
      )}

      {(rodape || maisItens) && !carregando && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linha px-4 py-3">
          <span className="t-legenda">{rodape}</span>
          {maisItens && (
            <Button
              tamanho="p"
              variante="fantasma"
              carregando={carregandoMais}
              onClick={aoCarregarMais}
            >
              Carregar mais
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Um botão de ícone da coluna de ações. O nome vai no `aria-label` e na dica;
 * a caixa visível é de 36px e a faixa invisível completa os 44px do dedo.
 */
export function AcaoDaLinha({
  rotulo,
  icone,
  onClick,
  href,
  perigo = false,
  carregando = false,
}: {
  rotulo: string;
  icone: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  /** Abre em outra aba (a página pública do registro). */
  href?: string;
  perigo?: boolean;
  carregando?: boolean;
}) {
  const classe = cx(
    'relative h-9 w-9 !min-h-9 after:absolute after:-inset-1 after:content-[""]',
    perigo && 'hover:!text-erro'
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label={rotulo}
        title={rotulo}
        className={cx(classesDeBotao('fantasma', 'p', true), classe)}
      >
        <Icon de={icone} tamanho="p" />
      </a>
    );
  }
  return (
    <Button
      variante="fantasma"
      tamanho="p"
      icone={icone}
      rotulo={rotulo}
      title={rotulo}
      onClick={onClick}
      carregando={carregando}
      className={classe}
    />
  );
}
