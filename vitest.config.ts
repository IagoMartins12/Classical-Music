import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Testes do front.
 *
 * **Por que existem agora.** O front passou a migração inteira sem nenhum
 * teste: o `next build` e o `tsc` eram a única rede. Isso funciona para erro
 * de tipo e para erro de pré-renderização, e não pega nada do que quebra
 * calado — um `href` que perde o idioma, um host de imagem que passa a ser
 * otimizado quando não devia, uma regra de redirecionamento invertida.
 *
 * O alvo aqui não é cobertura: é cobrir as decisões que, se mudarem sem que
 * ninguém perceba, custam tráfego ou vazam dado.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
});
