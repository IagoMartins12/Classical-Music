import type { Bloco } from '@/app/conteudo/legal/tipos';
import { cx } from './cx';
import { TextoRico } from './TextoRico';

/**
 * Os blocos de um texto de leitura (`conteudo/legal`, `conteudo/ajuda`):
 * parágrafo, lista, nota e tabela. A tabela vira blocos no telefone
 * (`tabela-leitura`).
 */
export function Blocos({ blocos }: { blocos: Bloco[] }) {
  return (
    <>
      {blocos.map((b, i) => {
        if (typeof b === 'string')
          return (
            <p key={i}>
              <TextoRico texto={b} />
            </p>
          );
        if ('lista' in b) {
          const Lista = b.numerada ? 'ol' : 'ul';
          return (
            <Lista
              key={i}
              className={cx(
                'flex flex-col gap-2.5 pl-6 marker:text-ouro-texto',
                b.numerada ? 'list-decimal marker:tabular-nums' : 'list-disc'
              )}
            >
              {b.lista.map((item, j) => (
                <li key={j} className="pl-1.5">
                  <TextoRico texto={item} />
                </li>
              ))}
            </Lista>
          );
        }
        if ('nota' in b)
          return (
            <p
              key={i}
              className="rounded-controle bg-sup-2 px-5 py-4 text-[0.9375rem]"
            >
              <TextoRico texto={b.nota} />
            </p>
          );
        return (
          <div
            key={i}
            className="overflow-hidden rounded-card bg-sup-2 px-5 md:px-0"
          >
            <table className="tabela-leitura w-full border-collapse text-left text-[0.9375rem] leading-relaxed">
              <thead>
                <tr>
                  {b.tabela.cabecalho.map((c) => (
                    <th
                      key={c}
                      scope="col"
                      className="px-5 pb-3 pt-4 text-sm font-semibold text-texto"
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="md:[&>tr]:border-t md:[&>tr]:border-linha">
                {b.tabela.linhas.map((linha, j) => (
                  <tr key={j}>
                    {linha.map((cel, k) => (
                      <td
                        key={k}
                        data-rotulo={b.tabela.cabecalho[k]}
                        className={cx(
                          'px-5 py-3 align-top',
                          k === 0 ? 'text-texto md:w-[34%]' : 'text-texto-suave'
                        )}
                      >
                        <TextoRico texto={cel} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
