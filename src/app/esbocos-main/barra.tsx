'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PiSquaresFour, PiUser, PiUserCircleDashed } from 'react-icons/pi';
import { Icon } from '@/app/components/ui/Icon';
import { Sheet } from '@/app/components/ui/Sheet';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';
import { ESBOCOS, TELAS, rota, type EsbocoId, type Tela } from './dados';
import { useEsboco } from './pecas';

/**
 * A barra no pé: troca de esboço sem sair da tela, alterna visitante e
 * logada, e em "Todas as telas" abre o mapa do que foi desenhado e os
 * momentos que não são página (entrar, boas-vindas, conquista ao vivo).
 */
export function BarraDoEsboco({
  esboco,
  tela,
}: {
  esboco: EsbocoId;
  tela: Tela;
}) {
  const [mapa, setMapa] = useState(false);
  const {
    logado,
    setLogado,
    verificado,
    setVerificado,
    abrirEntrar,
    abrirBoasVindas,
    ganharConquista,
  } = useEsboco();

  const grupos = ['Público', 'Seu', 'Sistema'] as const;

  return (
    <>
      <nav
        aria-label="Trocar de esboço"
        className={cx(
          'sup-alta fixed left-1/2 z-aviso flex -translate-x-1/2 items-center gap-1 !rounded-full p-1 text-sm',
          // No C, no telefone, a barra sobe para não cobrir as abas.
          esboco === 'c' ? 'bottom-[5.25rem] lg:bottom-4' : 'bottom-4'
        )}
      >
        <Link
          href="/esbocos-main"
          className="px-3 py-1.5 text-texto-fraco hover:text-texto max-sm:hidden"
        >
          Esboços
        </Link>
        {ESBOCOS.map((e) => (
          <Link
            key={e}
            href={rota(e, tela)}
            aria-current={e === esboco ? 'page' : undefined}
            className={cx(
              'grid h-9 w-9 place-items-center rounded-full font-display text-[1.0625rem] uppercase transition-colors',
              e === esboco
                ? 'fill-ouro text-sobre-ouro'
                : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
            )}
          >
            {e}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => {
            // Visitante → Marina → Marina sem e-mail confirmado → visitante.
            if (!logado) {
              setLogado(true);
              setVerificado(true);
            } else if (verificado) setVerificado(false);
            else {
              setLogado(false);
              setVerificado(true);
            }
          }}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-texto-suave hover:bg-sup-2 hover:text-texto"
        >
          <Icon de={logado ? PiUser : PiUserCircleDashed} tamanho="p" />
          <span className="max-sm:hidden">
            {!logado
              ? 'Visitante'
              : verificado
                ? 'Marina'
                : 'Marina · e-mail não confirmado'}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMapa(true)}
          className="flex h-9 items-center gap-1.5 rounded-full px-3 text-texto-suave hover:bg-sup-2 hover:text-texto"
        >
          <Icon de={PiSquaresFour} tamanho="p" />
          <span className="max-sm:hidden">Todas as telas</span>
        </button>
      </nav>

      <Sheet
        aberto={mapa}
        aoFechar={() => setMapa(false)}
        titulo={`Esboço ${esboco.toUpperCase()} — todas as telas`}
        largura="m"
      >
        <div className="flex flex-col gap-8">
          {grupos.map((g) => (
            <section key={g} className="flex flex-col gap-2">
              <h3 className="t-legenda">
                {g === 'Seu' ? 'Páginas pessoais' : g}
              </h3>
              <ul className="grid grid-cols-2 gap-1">
                {TELAS.filter((t) => t.grupo === g).map((t) => (
                  <li key={t.id}>
                    <Link
                      href={rota(esboco, t.id)}
                      onClick={() => setMapa(false)}
                      aria-current={t.id === tela ? 'page' : undefined}
                      className={cx(
                        'flex min-h-10 items-center rounded-controle px-3 text-[0.9375rem] transition-colors',
                        t.id === tela
                          ? 'tint-ouro text-ouro-na-tinta'
                          : 'text-texto-suave hover:bg-sup-2 hover:text-texto'
                      )}
                    >
                      {t.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section className="flex flex-col gap-2">
            <h3 className="t-legenda">Momentos</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                tamanho="p"
                onClick={() => {
                  setMapa(false);
                  abrirEntrar();
                }}
              >
                Entrar (erro só no toast)
              </Button>
              <Button
                tamanho="p"
                onClick={() => {
                  setMapa(false);
                  setLogado(true);
                  abrirBoasVindas();
                }}
              >
                Boas-vindas
              </Button>
              <Button
                tamanho="p"
                onClick={() => {
                  setMapa(false);
                  setLogado(true);
                  ganharConquista();
                }}
              >
                Conquista ao vivo
              </Button>
            </div>
            <p className="t-legenda">
              Compartilhar: o botão nas páginas de compositor e obra. No celular
              abre a folha do sistema; no computador, a nossa.
            </p>
          </section>
        </div>
      </Sheet>
    </>
  );
}
