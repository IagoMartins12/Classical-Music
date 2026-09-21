/**
 * Deixa uma página ser gerada mesmo com a API fora — **só no build, e só quando
 * alguém pediu isso explicitamente**.
 *
 * **O problema.** As quatro páginas estáticas do blog leem a API durante o
 * `next build`. Isso faz do build um passo que depende de um serviço de pé: no
 * CI, onde não há API nem banco, `npm run build` falha e o pipeline não
 * consegue provar nem que a aplicação compila.
 *
 * **Por que não engolir o erro sempre.** Se o build tolerasse a API fora em
 * qualquer circunstância, um soluço da API na hora do deploy publicaria um blog
 * vazio — e a página ficaria assim até o `revalidate` vencer. Falhar alto é o
 * comportamento certo no deploy.
 *
 * Daí o interruptor: `ALLOW_BUILD_WITHOUT_API=true` só existe no CI. No deploy
 * ele não está definido, e a API fora derruba o build, como deve.
 *
 * Em tempo de execução isto nunca age: fora do build, o erro sobe e o Next
 * segue servindo a última versão boa da página.
 */
export async function tolerarApiForaNoBuild<T>(
  carregar: () => Promise<T>,
  vazio: T,
  oQue: string
): Promise<T> {
  try {
    return await carregar();
  } catch (error) {
    const noBuild = process.env.NEXT_PHASE === 'phase-production-build';
    const permitido = process.env.ALLOW_BUILD_WITHOUT_API === 'true';

    if (!noBuild || !permitido) throw error;

    console.warn(
      `[build] ${oQue}: a API não respondeu e ALLOW_BUILD_WITHOUT_API está ` +
        `ligado — a página vai ao ar vazia e se preenche na primeira ` +
        `revalidação. Motivo: ${error instanceof Error ? error.message : String(error)}`
    );

    return vazio;
  }
}
