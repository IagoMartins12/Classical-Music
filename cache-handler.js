// cache-handler.js — cache de ISR e de `fetch` do Next compartilhado via Redis
//
// **O problema que isto resolve.** Sem `cacheHandler`, o Next guarda o Data
// Cache e as páginas do ISR **no disco de cada instância**. Com N réplicas há
// N caches independentes: a mesma página é renderizada N vezes, e o
// `POST /api/revalidate` que a API dispara chega a uma réplica só — as outras
// continuam servindo o dado velho até o TTL vencer. É correção, não só
// desempenho: o usuário vê o conteúdo mudar e voltar conforme cai numa réplica
// ou noutra.
//
// Com o Redis no meio, o cache é um só para o cluster e a revalidação por tag
// vale para todas as réplicas no mesmo instante.
//
// **Degradação.** Sem `REDIS_URL`, ou com o Redis fora do ar, o handler cai
// para um cache em memória do processo — exatamente o comportamento de antes.
// Falha de cache nunca vira erro de página.
//
// É CommonJS de propósito: o Next carrega este arquivo fora do bundle da
// aplicação, antes de qualquer transpilação. Daí o `require` — não é
// preferência de estilo, é o único formato que funciona aqui.
/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('node:fs/promises');
const path = require('node:path');

const PREFIX = process.env.NEXT_CACHE_PREFIX || 'next:cache';
const ENTRY_PREFIX = `${PREFIX}:entry:`;
const TAGS_KEY = `${PREFIX}:tags`;

/** Teto do cache em memória (fallback), em entradas. */
const MEMORY_MAX_ENTRIES = 1000;

/**
 * Validade máxima de uma entrada no Redis.
 *
 * Não é a revalidação — quem decide se o conteúdo está velho é o Next, pelo
 * `lastModified`, e a API, pelas tags. Isto é só uma faxina: impede que página
 * apagada ou rota que ninguém mais acessa ocupe memória para sempre.
 */
const ENTRY_TTL_SECONDS = Number(
  process.env.NEXT_CACHE_TTL_SECONDS || 60 * 60 * 24 * 7
);

/** Tempo máximo esperando o Redis antes de tratar como miss. */
const REDIS_TIMEOUT_MS = Number(process.env.NEXT_CACHE_TIMEOUT_MS || 500);

let client = null;
let clientReady = false;
/** Resolve quando a conexão fica pronta — ver `withTimeout`. */
let connecting = null;

function connect() {
  if (client !== null || !process.env.REDIS_URL) {
    return client;
  }

  try {
    const { Redis } = require('ioredis');

    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      // Uma requisição não pode ficar presa esperando o Redis: melhor um miss
      // (renderiza de novo) do que uma página que não responde.
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      enableOfflineQueue: false,
    });

    client.on('ready', () => {
      clientReady = true;
    });
    client.on('error', () => {
      clientReady = false;
    });
    client.on('end', () => {
      clientReady = false;
    });

    connecting = client
      .connect()
      .then(() => {
        clientReady = true;
      })
      .catch(() => {
        clientReady = false;
      });
  } catch {
    client = null;
  }

  return client;
}

/** Corre a operação contra o relógio; no estouro, trata como indisponível. */
async function withTimeout(operation) {
  const redis = connect();

  if (!redis) {
    return undefined;
  }

  let timer;

  try {
    return await Promise.race([
      // Esperar a conexão, e não desistir na hora, importa: a primeira
      // operação do processo acontece antes de o Redis estar pronto, e sem
      // isso ela era gravada só na memória — some no restart e não chega às
      // outras réplicas. A espera é limitada pelo mesmo relógio abaixo.
      (async () => {
        if (!clientReady && connecting) await connecting;
        if (!clientReady) return undefined;
        return operation(redis);
      })(),
      new Promise((resolve) => {
        timer = setTimeout(() => resolve(undefined), REDIS_TIMEOUT_MS);
      }),
    ]);
  } catch {
    return undefined;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * As tags de uma entrada.
 *
 * Elas chegam em lugares diferentes conforme o tipo: uma resposta de `fetch`
 * as traz em `value.tags`; uma página, no cabeçalho `x-next-cache-tags` que o
 * Next embute. Ignorar um dos dois faz `revalidateTag` não alcançar metade do
 * cache.
 */
function tagsOf(value, contextTags) {
  const tags = new Set(contextTags || []);

  if (value && Array.isArray(value.tags)) {
    value.tags.forEach((tag) => tags.add(tag));
  }

  const header = value && value.headers && value.headers['x-next-cache-tags'];
  if (typeof header === 'string') {
    header.split(',').forEach((tag) => {
      const trimmed = tag.trim();
      if (trimmed) tags.add(trimmed);
    });
  }

  return [...tags];
}

/**
 * Serialização que preserva `Buffer`.
 *
 * O `rscData` de uma página é um `Buffer`, e `JSON.stringify` o transforma em
 * `{ type: 'Buffer', data: [...] }` — um objeto comum, que o Next não sabe
 * servir. Sem reconstruí-lo, a navegação pelo roteador do cliente (que pede o
 * RSC, não o HTML) recebe lixo. Guardar em base64 também encolhe a entrada:
 * um array de números ocupa ~4 bytes por byte de dado.
 */
const BUFFER_MARK = '__opusBuffer';

function serialize(entry) {
  return JSON.stringify(entry, (_key, value) => {
    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
      return { [BUFFER_MARK]: Buffer.from(value.data).toString('base64') };
    }
    return value;
  });
}

function deserialize(raw) {
  return JSON.parse(raw, (_key, value) => {
    if (
      value &&
      typeof value === 'object' &&
      typeof value[BUFFER_MARK] === 'string'
    ) {
      return Buffer.from(value[BUFFER_MARK], 'base64');
    }
    return value;
  });
}

/**
 * Cache do processo — **só** para quando o Redis está fora do ar.
 *
 * Não é uma camada na frente dele: se o Redis responde que não tem a chave,
 * esta não é consultada. Ver o comentário em `get`.
 */
const memory = new Map();

function memoryGet(key) {
  const entry = memory.get(key);
  if (!entry) return null;

  memory.delete(key);
  memory.set(key, entry);
  return entry;
}

function memorySet(key, entry) {
  memory.delete(key);
  memory.set(key, entry);

  while (memory.size > MEMORY_MAX_ENTRIES) {
    const oldest = memory.keys().next();
    if (oldest.done) break;
    memory.delete(oldest.value);
  }
}

/** tag → instante da última revalidação, quando não há Redis. */
const memoryTags = new Map();

module.exports = class OpusAtlasCacheHandler {
  constructor(options) {
    this.options = options || {};
  }

  async get(key) {
    // `undefined` = Redis fora do ar; `null` = Redis respondeu que não tem.
    // A distinção importa: no segundo caso o mapa do processo **não** pode ser
    // consultado, senão uma entrada removida do cache compartilhado continuaria
    // sendo servida por quem a tinha em memória — exatamente a divergência
    // entre réplicas que este handler existe para evitar.
    const doRedis = await withTimeout(async (redis) => {
      const raw = await redis.get(ENTRY_PREFIX + key);
      return raw ? deserialize(raw) : null;
    });

    const entry =
      (doRedis === undefined ? memoryGet(key) : doRedis) ??
      (await this.fromBuild(key));

    if (!entry) {
      return null;
    }

    if (await this.isStale(entry)) {
      await this.drop(key);
      return null;
    }

    return { lastModified: entry.lastModified, value: entry.value };
  }

  async set(key, value, context) {
    const entry = {
      value,
      lastModified: Date.now(),
      tags: tagsOf(value, context && context.tags),
    };

    memorySet(key, entry);

    await withTimeout((redis) =>
      redis.set(ENTRY_PREFIX + key, serialize(entry), 'EX', ENTRY_TTL_SECONDS)
    );
  }

  /**
   * Marca as tags como revalidadas agora.
   *
   * Não apaga entrada nenhuma: as chaves do ISR embutem a rota e não são
   * enumeráveis por tag sem varrer o Redis inteiro. Guardar o instante e
   * comparar na leitura tem o mesmo efeito e custa uma escrita.
   */
  async revalidateTag(tags) {
    const list = Array.isArray(tags) ? tags : [tags];

    if (list.length === 0) {
      return;
    }

    const now = Date.now();
    list.forEach((tag) => memoryTags.set(tag, now));

    await withTimeout((redis) =>
      redis.hset(TAGS_KEY, ...list.flatMap((tag) => [tag, String(now)]))
    );
  }

  /** Uma entrada está velha se alguma tag dela foi revalidada depois dela. */
  async isStale(entry) {
    if (!entry.tags || entry.tags.length === 0) {
      return false;
    }

    const stamps =
      (await withTimeout((redis) => redis.hmget(TAGS_KEY, ...entry.tags))) ??
      entry.tags.map((tag) => memoryTags.get(tag) ?? null);

    return stamps.some(
      (stamp) => stamp !== null && Number(stamp) > entry.lastModified
    );
  }

  async drop(key) {
    memory.delete(key);
    await withTimeout((redis) => redis.del(ENTRY_PREFIX + key));
  }

  /**
   * As páginas que o `next build` já gerou.
   *
   * Ao declarar um `cacheHandler`, o Next para de ler o cache de arquivos que
   * ele mesmo escreveu no build — passa a perguntar só a este objeto. Sem esta
   * ponte, todo HTML pré-gerado seria ignorado e cada página renderizaria de
   * novo na primeira visita depois de cada deploy (e uma rota com
   * `dynamicParams: false` chegaria a devolver 404).
   *
   * É só leitura, e qualquer falha vira `null` — nesse caso o Next renderiza
   * sob demanda, que é o comportamento sem esta função. O formato é o mesmo
   * que o `set` recebe: `.html`, `.rsc` e os cabeçalhos do `.meta`.
   */
  async fromBuild(key) {
    if (!key.startsWith('/')) {
      return null;
    }

    const raiz =
      (this.options && this.options.serverDistDir) ||
      path.join(process.cwd(), '.next', 'server');
    const base = path.join(raiz, 'app', key === '/' ? 'index' : key);

    try {
      const [html, meta, stat] = await Promise.all([
        fs.readFile(`${base}.html`, 'utf8'),
        fs.readFile(`${base}.meta`, 'utf8'),
        fs.stat(`${base}.html`),
      ]);
      const rscData = await fs.readFile(`${base}.rsc`).catch(() => undefined);
      const { headers, status } = JSON.parse(meta);

      const value = { kind: 'APP_PAGE', html, rscData, headers, status };

      return {
        value,
        lastModified: stat.mtimeMs,
        tags: tagsOf(value, []),
      };
    } catch {
      return null;
    }
  }

  /**
   * Cache por requisição — o Next o usa para não reler a mesma chave duas
   * vezes no mesmo render. Aqui não existe estado por requisição: toda leitura
   * vai ao Redis (ou ao mapa do processo), então não há o que limpar.
   */
  resetRequestCache() {}
};
