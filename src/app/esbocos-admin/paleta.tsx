'use client';

import { useEffect, useMemo, useState } from 'react';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { Sheet } from '@/app/components/ui/Sheet';
import { Icon } from '@/app/components/ui/Icon';
import { cx } from '@/app/components/ui/cx';
import { NAVEGACAO } from './dados';

/**
 * "Ir para…": os 33 lugares do painel a duas teclas. Com esse tanto de
 * destino, a lateral serve para se orientar; para chegar, quem usa todo dia
 * digita. ⌘K / Ctrl+K abre de qualquer tela.
 */

const TODOS = NAVEGACAO.flatMap((g) =>
  g.itens.map((i) => ({ ...i, grupo: g.rotulo, icone: g.icone }))
);

const semAcento = (s: string) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();

export function usePaleta() {
  const [aberta, setAberta] = useState(false);
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setAberta((a) => !a);
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);
  return {
    aberta,
    abrir: () => setAberta(true),
    fechar: () => setAberta(false),
  };
}

export function BotaoIrPara({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'flex min-h-9 w-full items-center gap-2 rounded-controle border border-linha px-3 text-sm text-texto-fraco',
        'transition-colors duration-[var(--t-resposta)] ease-saida hover:border-linha-forte hover:text-texto-suave',
        className
      )}
    >
      <Icon de={PiMagnifyingGlass} tamanho="pp" />
      <span className="flex-1 text-left">Ir para…</span>
      <kbd className="t-dado rounded-[6px] border border-linha px-1.5 text-xs">
        ⌘K
      </kbd>
    </button>
  );
}

export function Paleta({
  aberta,
  aoFechar,
  aoEscolher,
}: {
  aberta: boolean;
  aoFechar: () => void;
  aoEscolher: (id: string) => void;
}) {
  const [busca, setBusca] = useState('');
  const [marcado, setMarcado] = useState(0);

  const achados = useMemo(() => {
    const b = semAcento(busca.trim());
    if (!b) return TODOS;
    return TODOS.filter((i) =>
      semAcento(`${i.rotulo} ${i.grupo} ${i.resumo} ${i.rota}`).includes(b)
    );
  }, [busca]);

  const escolher = (id: string) => {
    aoEscolher(id);
    aoFechar();
    setBusca('');
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
            if (e.key === 'ArrowDown')
              setMarcado((m) => Math.min(m + 1, achados.length - 1));
            if (e.key === 'ArrowUp') setMarcado((m) => Math.max(m - 1, 0));
            if (e.key === 'Enter' && achados[marcado])
              escolher(achados[marcado].id);
          }}
          placeholder="Obras, cupons, backup…"
          aria-label="Buscar página do painel"
          className="input-classical w-full"
        />
        <ul className="flex flex-col" role="listbox" aria-label="Páginas">
          {achados.map((i, n) => (
            <li key={i.id} role="option" aria-selected={n === marcado}>
              <button
                type="button"
                onClick={() => escolher(i.id)}
                onMouseEnter={() => setMarcado(n)}
                className={cx(
                  'flex min-h-[var(--alvo)] w-full items-center gap-3 rounded-controle px-3 text-left',
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
