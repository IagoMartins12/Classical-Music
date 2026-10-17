import type { Numeros } from '@/app/conteudo/sobre';
import { getComposersCount } from '@/app/requests/composers';
import { getWorks } from '@/app/requests/work-details';

/**
 * Os números do acervo, ao vivo. Sem API (build do CI) ou com erro, a frase
 * fica sem números — nunca com um número inventado.
 */
export async function numerosDoAcervo(): Promise<Numeros> {
  try {
    const [compositores, obras] = await Promise.all([
      getComposersCount({}),
      getWorks(1, 1).then((r) => r.totalCount),
    ]);
    return compositores > 0 && obras > 0 ? { compositores, obras } : null;
  } catch {
    return null;
  }
}

/**
 * O número do acervo sem a precisão de balcão: "10k+", "200k+". Arredonda
 * para baixo (dois algarismos abaixo de 100 mil, um acima), para o "+" ser
 * verdade.
 */
export function compacto(n: number): string {
  if (n < 1000) return String(n);
  const digitos = Math.floor(Math.log10(n)) + 1;
  const passo = 10 ** (digitos - (n >= 100_000 ? 1 : 2));
  return `${Math.floor(n / passo) * (passo / 1000)}k+`;
}
