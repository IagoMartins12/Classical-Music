import { cx } from './cx';

/**
 * Um número cujos dígitos giram como um odômetro quando o valor muda — o preço
 * trocando entre mensal e anual. Cada dígito é uma coluna de 0 a 9 que desliza
 * até o seu valor; o resto (ponto, vírgula) fica parado.
 *
 * O leitor de tela ouve o número inteiro (`sr-only`); as colunas são só
 * desenho. Com movimento reduzido o número troca direto (CSS).
 *
 * Sem estado e sem efeito: funciona no servidor, e a transição vem do CSS
 * quando o `translate` de cada coluna muda.
 */
export function NumeroRolante({
  valor,
  className,
}: {
  valor: string;
  className?: string;
}) {
  const chars = [...valor];
  return (
    <span className={cx('relative inline-flex', className)}>
      <span className="sr-only">{valor}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((ch, i) => {
          // Chave contada da direita: "19" → "16" gira as mesmas colunas.
          const chave = chars.length - i;
          if (!/\d/.test(ch)) {
            return <span key={`s${chave}`}>{ch}</span>;
          }
          const d = Number(ch);
          return (
            <span key={`d${chave}`} className="odometro-coluna">
              <span
                className="odometro-faixa"
                style={{
                  transform: `translateY(${-d}em)`,
                  transitionDelay: `${(chars.length - i) * 45}ms`,
                }}
              >
                {'0123456789'.split('').map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
