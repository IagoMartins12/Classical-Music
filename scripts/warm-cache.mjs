#!/usr/bin/env node
/**
 * Aquece o cache de páginas depois de um deploy.
 *
 * **Por que existe.** As páginas públicas são geradas sob demanda e guardadas
 * no Redis compartilhado: a primeira visita de cada uma paga a renderização,
 * as seguintes vêm prontas. Sem aquecimento, quem paga é o primeiro visitante
 * — que pode ser o robô do buscador, logo depois de um deploy.
 *
 * Passar por aqui é diferente de gerar no `next build`: se a API estiver fora,
 * o aquecimento simplesmente **não guarda nada** (as páginas respondem 500 e o
 * Next não as cacheia) e este script termina com erro, em vez de publicar um
 * site cheio de páginas vazias.
 *
 * Uso:
 *   node scripts/warm-cache.mjs --base https://opusatlas.com.br
 *   node scripts/warm-cache.mjs --base http://localhost:3000 --limit 100
 */

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .filter((arg) => arg.startsWith('--'))
    .map((arg) => {
      const [chave, valor] = arg.replace(/^--/, '').split('=');
      return [chave, valor ?? process.argv[process.argv.indexOf(arg) + 1]];
    })
);

const base = (args.base ?? 'http://localhost:3000').replace(/\/$/, '');
const limite = Number(args.limit ?? 400);
const simultaneas = Number(args.concurrency ?? 4);
const tempoLimite = Number(args.timeout ?? 30_000);

/**
 * As páginas de entrada, sempre aquecidas primeiro. São as que concentram o
 * tráfego e as que o buscador alcança antes de qualquer outra.
 */
const ENTRADAS = [
  '/',
  '/composers',
  '/works',
  '/instruments',
  '/music-history',
  '/genres',
  '/teachers',
  '/pricing',
  '/about-us',
  '/faq',
  '/help',
  '/blog',
  '/blog/articles',
];

/** Os endereços do sitemap, já convertidos para o host que vamos aquecer. */
async function doSitemap() {
  try {
    const resposta = await fetch(`${base}/sitemap.xml`, {
      signal: AbortSignal.timeout(tempoLimite),
    });

    if (!resposta.ok) {
      console.warn(
        `  sitemap respondeu ${resposta.status} — aquecendo só as páginas de entrada`
      );
      return [];
    }

    const xml = await resposta.text();

    return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((casamento) => {
        try {
          return new URL(casamento[1]).pathname;
        } catch {
          return null;
        }
      })
      .filter((caminho) => typeof caminho === 'string');
  } catch (erro) {
    console.warn(`  sitemap indisponível (${erro.message}) — só as entradas`);
    return [];
  }
}

async function aquecer(caminho) {
  const inicio = Date.now();

  try {
    const resposta = await fetch(`${base}${caminho}`, {
      headers: { Accept: 'text/html' },
      signal: AbortSignal.timeout(tempoLimite),
    });
    // Consome o corpo: sem isso a renderização pode ser abortada no meio.
    await resposta.arrayBuffer();

    return {
      caminho,
      status: resposta.status,
      cache: resposta.headers.get('x-nextjs-cache') ?? '-',
      ms: Date.now() - inicio,
    };
  } catch (erro) {
    return { caminho, status: 0, cache: erro.message, ms: Date.now() - inicio };
  }
}

async function main() {
  console.log(`Aquecendo ${base}`);

  const doMapa = await doSitemap();
  const caminhos = [...new Set([...ENTRADAS, ...doMapa])].slice(0, limite);

  console.log(`  ${caminhos.length} endereço(s)\n`);

  const fila = [...caminhos];
  const resultados = [];

  await Promise.all(
    Array.from({ length: simultaneas }, async () => {
      while (fila.length > 0) {
        resultados.push(await aquecer(fila.shift()));
      }
    })
  );

  const falhas = resultados.filter((r) => r.status === 0 || r.status >= 500);
  const lentas = resultados
    .filter((r) => r.status < 400 && r.ms > 1000)
    .sort((a, b) => b.ms - a.ms)
    .slice(0, 5);

  if (lentas.length > 0) {
    console.log('Mais lentas:');
    lentas.forEach((r) => console.log(`  ${String(r.ms).padStart(6)} ms  ${r.caminho}`));
    console.log('');
  }

  if (falhas.length > 0) {
    console.error(`${falhas.length} endereço(s) não aqueceram:`);
    falhas
      .slice(0, 20)
      .forEach((r) => console.error(`  ${r.status || 'erro'}  ${r.caminho}  ${r.cache}`));
    console.error(
      '\nNada foi guardado em cache para estes — o Next não guarda resposta com erro.'
    );
    process.exit(1);
  }

  console.log(`${resultados.length} endereço(s) aquecido(s), nenhum erro.`);
}

main().catch((erro) => {
  console.error(`Falha no aquecimento: ${erro.message}`);
  process.exit(1);
});
