'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/app/components/ui/Sheet';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { NAVEGACAO } from './navegacao';

/**
 * "Ir para": todas as páginas do painel a duas teclas (⌘K ou Ctrl+K).
 *
 * A lateral serve para se orientar; para chegar, quem usa todo dia digita.
 * Busca no nome, no assunto, no resumo e no endereço, sem acento — "moder"
 * acha Denúncias e Comentários, "preco" acha Planos e preços.
 */

const TODOS = NAVEGACAO.flatMap((g) =>
  g.itens.map((i) => ({ ...i, grupo: g.rotulo, icone: g.icone }))
);

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function Paleta({
  aberta,
  aoFechar,
}: {
  aberta: boolean;
  aoFechar: () => void;
}) {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [marcado, setMarcado] = useState(0);

  const achados = useMemo(() => {
    const b = semAcento(busca.trim());
    if (!b) return TODOS;
    return TODOS.filter((i) =>
      semAcento(`${i.rotulo} ${i.grupo} ${i.resumo} ${i.href}`).includes(b)
    );
  }, [busca]);

  const ir = (href: string) => {
    aoFechar();
    setBusca('');
    setMarcado(0);
    router.push(href);
  };

  return (
    <Sheet aberto={aberta} aoFechar={aoFechar} titulo="Ir para" largura="m">
      <div className="flex flex-col gap-3">
        <input
          autoFocus
          type="search"
          value={busca}
          onChange={(e) => {
            setBusca(e.target.value);
            setMarcado(0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setMarcado((m) => Math.min(m + 1, achados.length - 1));
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              setMarcado((m) => Math.max(m - 1, 0));
            }
            if (e.key === 'Enter' && achados[marcado])
              ir(achados[marcado].href);
          }}
          placeholder="Denúncias, cupons, backup…"
          aria-label="Buscar página do painel"
          aria-controls="paleta-resultados"
          className="input-classical w-full"
        />
        <ul
          id="paleta-resultados"
          className="flex flex-col"
          role="listbox"
          aria-label="Páginas"
        >
          {achados.map((i, n) => (
            <li key={i.href} role="option" aria-selected={n === marcado}>
              <button
                type="button"
                onClick={() => ir(i.href)}
                onMouseEnter={() => setMarcado(n)}
                className={cx(
                  'flex min-h-[var(--alvo)] w-full items-center gap-3 rounded-controle px-3 py-1.5 text-left',
                  n === marcado && 'bg-[var(--interactive-hover)]'
                )}
              >
                <Icon de={i.icone} className="text-texto-fraco" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[0.9375rem] text-texto">
                    {i.rotulo}
                  </span>
                  <span className="t-legenda truncate">{i.resumo}</span>
                </span>
                <span className="t-legenda max-sm:hidden">{i.grupo}</span>
              </button>
            </li>
          ))}
          {achados.length === 0 && (
            <li className="t-rotulo px-3 py-4 text-texto-suave">
              Nenhuma página com “{busca}”. Tente pelo assunto: moderação,
              e-mail, preço.
            </li>
          )}
        </ul>
      </div>
    </Sheet>
  );
}
