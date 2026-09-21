import Image from 'next/image';
import type { ComponentProps } from 'react';
import { isOptimizableImageSrc } from '@/app/utils/imageHosts';

type ImageProps = ComponentProps<typeof Image>;

/**
 * `next/image` que decide, por imagem, se ela passa pelo otimizador.
 *
 * **O problema.** Em produção a otimização estava desligada para todo mundo
 * (`images.unoptimized`), e cada visita baixava o arquivo original — retratos
 * do IMSLP de alguns MB entre eles. Ligá-la exige fechar o `remotePatterns`,
 * senão `/_next/image` vira redimensionador público. Mas fechar a lista
 * quebraria a capa de matéria que veio de um site qualquer.
 *
 * **A saída.** Host conhecido é otimizado; host de fora vai cru para o
 * navegador, exatamente como ia antes. Nenhuma imagem quebra e o servidor não
 * trabalha para estranhos.
 *
 * Não é um componente de cliente: serve tanto em página de servidor quanto em
 * componente de cliente, como o `next/image` que ele embrulha.
 */
export default function SmartImage({ src, unoptimized, ...props }: ImageProps) {
  return (
    // O `alt` vem em `props` e é obrigatório no tipo do `next/image` — quem
    // esquecer dele não compila. A regra de acessibilidade não enxerga isso
    // porque o atributo não aparece literalmente aqui.
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      src={src}
      unoptimized={unoptimized ?? !isOptimizableImageSrc(src)}
      {...props}
    />
  );
}
