// Este é um componente comum, não o `loading.tsx` de rota — e a diferença
// importa.
//
// Um `loading.tsx` cria um limite de `Suspense` no topo do segmento **e de
// tudo o que está abaixo dele**. Aqui embaixo existe uma rota de detalhe
// (`[workId]`, `[id]`), e com o limite no caminho o Next despachava a casca
// com HTTP 200 antes de saber o desfecho: uma obra inexistente respondia
// **200 com a tela de "não encontrada"** — o "soft 404" que os buscadores
// penalizam — e uma falha da API respondia 200 com a página vazia.
//
// Como componente, ele continua sendo o esqueleto do `Suspense` da própria
// listagem, sem impor limite nenhum às rotas filhas.

// app/loading.tsx - Home Page Loading Skeleton
'use client';

import {
  AnimatedItem,
  LoadingSpinner,
} from '@/app/components/animation/AnimatedComponents';

export default function ComumnLoading() {
  return (
    <AnimatedItem
      direction="scale"
      className="absolute inset-0 bg-theme-overlay backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
    >
      <div className="classical-card flex flex-col justify-center items-center gap-6 p-8 text-center">
        <LoadingSpinner size="lg" />
        <p className="text-theme-primary font-medium mt-4">
          Carregando página...
        </p>
      </div>
    </AnimatedItem>
  );
}
