'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { PiX } from 'react-icons/pi';
import { Button } from '@/app/components/ui/Button';
import { cx } from '@/app/components/ui/cx';

/**
 * Escolher um registro por busca: "por compositor", "por peça". O catálogo
 * tem 19 mil compositores e 207 mil obras — nenhuma lista cabe num seletor,
 * então o campo busca enquanto se digita e oferece até oito nomes.
 *
 * Combobox do ARIA: setas percorrem, Enter escolhe, Esc fecha. Escolhido, o
 * campo mostra o nome e um X para tirar.
 */

export interface Opcao {
  id: string;
  rotulo: string;
  detalhe?: string | null;
}

export function Escolher({
  rotulo,
  valor,
  aoMudar,
  buscar,
  placeholder = 'Buscar…',
}: {
  rotulo: string;
  valor: Opcao | null;
  aoMudar: (v: Opcao | null) => void;
  buscar: (termo: string) => Promise<Opcao[]>;
  placeholder?: string;
}) {
  const id = useId();
  const [termo, setTermo] = useState('');
  const [opcoes, setOpcoes] = useState<Opcao[]>([]);
  const [aberto, setAberto] = useState(false);
  const [ativa, setAtiva] = useState(0);
  const [buscando, setBuscando] = useState(false);
  const ultimaBusca = useRef(0);

  useEffect(() => {
    if (!aberto || termo.trim().length < 2) {
      setOpcoes([]);
      return;
    }
    const n = ++ultimaBusca.current;
    setBuscando(true);
    const t = window.setTimeout(async () => {
      try {
        const r = await buscar(termo.trim());
        // Só a busca mais recente escreve: a resposta de "cho" pode chegar
        // depois da de "chopin".
        if (n === ultimaBusca.current) {
          setOpcoes(r.slice(0, 8));
          setAtiva(0);
        }
      } catch {
        if (n === ultimaBusca.current) setOpcoes([]);
      } finally {
        if (n === ultimaBusca.current) setBuscando(false);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [termo, aberto, buscar]);

  const escolher = (o: Opcao) => {
    aoMudar(o);
    setTermo('');
    setAberto(false);
  };

  if (valor) {
    return (
      <div className="flex min-w-0 flex-col gap-1">
        <span className="t-legenda">{rotulo}</span>
        <div className="input-classical flex w-full items-center gap-2 pl-4 pr-1">
          <span className="min-w-0 flex-1 truncate text-texto">
            {valor.rotulo}
          </span>
          <Button
            variante="fantasma"
            tamanho="p"
            icone={PiX}
            rotulo={`Tirar ${rotulo.toLowerCase()}`}
            onClick={() => aoMudar(null)}
            className="h-8 w-8 !min-h-8"
          />
        </div>
      </div>
    );
  }

  const listaId = `${id}-lista`;
  const mostrar = aberto && termo.trim().length >= 2;

  return (
    <div className="relative flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="t-legenda">
        {rotulo}
      </label>
      <input
        id={id}
        role="combobox"
        aria-expanded={mostrar}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={
          mostrar && opcoes[ativa] ? `${id}-${opcoes[ativa].id}` : undefined
        }
        autoComplete="off"
        placeholder={placeholder}
        value={termo}
        onChange={(e) => {
          setTermo(e.target.value);
          setAberto(true);
        }}
        onFocus={() => setAberto(true)}
        onBlur={() => window.setTimeout(() => setAberto(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setAtiva((a) => Math.min(a + 1, opcoes.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setAtiva((a) => Math.max(a - 1, 0));
          } else if (e.key === 'Enter' && opcoes[ativa]) {
            e.preventDefault();
            escolher(opcoes[ativa]);
          } else if (e.key === 'Escape') {
            setAberto(false);
          }
        }}
        className="input-classical w-full pl-4"
      />
      {mostrar && (
        <ul
          id={listaId}
          role="listbox"
          aria-label={rotulo}
          className="sup-alta absolute left-0 right-0 top-full z-menu mt-1 max-h-72 overflow-y-auto rounded-controle !p-1 shadow-[var(--sombra-2)] rolagem-discreta"
        >
          {buscando && opcoes.length === 0 && (
            <li className="t-legenda px-3 py-2">Buscando…</li>
          )}
          {!buscando && opcoes.length === 0 && (
            <li className="t-legenda px-3 py-2">Nada com esse nome.</li>
          )}
          {opcoes.map((o, i) => (
            <li
              key={o.id}
              id={`${id}-${o.id}`}
              role="option"
              aria-selected={i === ativa}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => escolher(o)}
              onMouseEnter={() => setAtiva(i)}
              className={cx(
                'flex cursor-pointer flex-col rounded-controle px-3 py-2',
                i === ativa && 'bg-[var(--interactive-hover)]'
              )}
            >
              <span className="truncate text-sm text-texto">{o.rotulo}</span>
              {o.detalhe && (
                <span className="t-legenda truncate">{o.detalhe}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
