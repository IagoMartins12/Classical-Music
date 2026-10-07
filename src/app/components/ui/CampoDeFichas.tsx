'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { PiX } from 'react-icons/pi';
import { cx } from './cx';
import { Icon } from './Icon';

/**
 * Uma lista de palavras digitadas: tags, palavras-chave.
 *
 * **Por que é primitivo.** O formulário de artigo usava o `MultiSelect`
 * legado (que é escolha numa lista, não digitação) com `allowCreate`, e cada
 * tela que precisava de "digite e Enter" inventava o seu. Aqui: Enter ou
 * vírgula acrescenta, Backspace no campo vazio tira a última, cada ficha tem
 * o seu botão de tirar com nome. Repetidas (sem diferenciar maiúscula) não
 * entram.
 *
 * O rótulo é ligado ao campo de texto; as fichas ficam numa lista com nome,
 * para o leitor de tela contar quantas há.
 */
export function CampoDeFichas({
  rotulo,
  valores,
  aoMudar,
  ajuda,
  placeholder,
  maximo = 20,
  className,
}: {
  rotulo: string;
  valores: string[];
  aoMudar: (valores: string[]) => void;
  ajuda?: string;
  placeholder?: string;
  maximo?: number;
  className?: string;
}) {
  const id = useId();
  const [texto, setTexto] = useState('');
  const cheio = valores.length >= maximo;

  function acrescentar(bruto: string) {
    const novos = bruto
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
    if (!novos.length) return;
    const vistos = new Set(valores.map((v) => v.toLowerCase()));
    const saida = [...valores];
    for (const novo of novos) {
      if (saida.length >= maximo) break;
      if (!vistos.has(novo.toLowerCase())) {
        vistos.add(novo.toLowerCase());
        saida.push(novo);
      }
    }
    aoMudar(saida);
    setTexto('');
  }

  function tecla(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      acrescentar(texto);
    } else if (e.key === 'Backspace' && !texto && valores.length) {
      aoMudar(valores.slice(0, -1));
    }
  }

  return (
    <div className={cx('flex flex-col gap-2', className)}>
      <label htmlFor={`${id}-campo`} className="text-sm font-medium text-texto">
        {rotulo}
      </label>
      {valores.length > 0 && (
        <ul aria-label={rotulo} className="flex flex-wrap gap-1.5">
          {valores.map((valor) => (
            <li
              key={valor}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-linha-forte bg-sup-2 pl-3 pr-1 text-sm text-texto"
            >
              {valor}
              <button
                type="button"
                onClick={() => aoMudar(valores.filter((v) => v !== valor))}
                className="grid h-6 w-6 place-items-center rounded-full text-texto-fraco hover:text-texto"
              >
                <Icon de={PiX} tamanho="pp" />
                <span className="sr-only">Tirar {valor}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={`${id}-campo`}
        type="text"
        value={texto}
        disabled={cheio}
        onChange={(e) => {
          const v = e.target.value;
          // Colar "a, b, c" acrescenta as três.
          if (v.includes(',') && v.length > 1) acrescentar(v);
          else setTexto(v);
        }}
        onKeyDown={tecla}
        onBlur={() => texto.trim() && acrescentar(texto)}
        placeholder={cheio ? undefined : placeholder}
        aria-describedby={ajuda ? `${id}-ajuda` : undefined}
        enterKeyHint="enter"
        className="input-classical !pl-4"
      />
      {ajuda && (
        <p id={`${id}-ajuda`} className="t-legenda">
          {ajuda}
        </p>
      )}
    </div>
  );
}
