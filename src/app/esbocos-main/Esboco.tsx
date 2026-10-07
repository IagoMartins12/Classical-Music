'use client';

import { Toaster } from 'react-hot-toast';
import { EsbocoA } from './EsbocoA';
import { EsbocoB } from './EsbocoB';
import { EsbocoC } from './EsbocoC';
import { BarraDoEsboco } from './barra';
import type { EsbocoId, Tela } from './dados';
import { EsbocoProvider } from './pecas';

const DESENHO = { a: EsbocoA, b: EsbocoB, c: EsbocoC };

export function Esboco({ esboco, tela }: { esboco: EsbocoId; tela: Tela }) {
  const Desenho = DESENHO[esboco];
  return (
    <EsbocoProvider esboco={esboco}>
      <Desenho tela={tela} />
      <BarraDoEsboco esboco={esboco} tela={tela} />
      {/* O toaster no sistema (proposta para o site): superfície alta, ouro
          no sucesso, vermelho só no erro — sai o verde e o índigo legados. */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          className: 'sup-alta',
          style: {
            color: 'var(--texto)',
            borderRadius: 'var(--r-card)',
            fontSize: '0.9375rem',
            padding: '12px 16px',
            maxWidth: '26rem',
            boxShadow: 'var(--sombra-alta)',
          },
          success: {
            iconTheme: {
              primary: 'var(--ouro)',
              secondary: 'var(--sobre-ouro)',
            },
          },
          error: {
            iconTheme: {
              primary: 'var(--erro)',
              secondary: 'var(--sobre-erro)',
            },
          },
        }}
      />
    </EsbocoProvider>
  );
}
