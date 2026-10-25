import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Studies, favorites and annotations are kept in the browser. Another
 * account must never see them (bug found on 25/10/2026: after switching
 * accounts, the new one saw the previous account's studies).
 */
class Armazenamento {
  private dados = new Map<string, string>();
  get length() {
    return this.dados.size;
  }
  key(i: number) {
    return [...this.dados.keys()][i] ?? null;
  }
  getItem(k: string) {
    return this.dados.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.dados.set(k, String(v));
  }
  removeItem(k: string) {
    this.dados.delete(k);
  }
  clear() {
    this.dados.clear();
  }
}

let mod: typeof import('./dadosDaConta');
let learning: typeof import('@/app/stores/useLearningStore');
let favorites: typeof import('@/app/stores/useFavoritesStore');

beforeAll(async () => {
  const ls = new Armazenamento();
  // `Object.keys(localStorage)` lists the keys, as in the browser.
  const proxy = new Proxy(ls, {
    ownKeys: (t) => [
      ...(t as unknown as { dados: Map<string, string> }).dados.keys(),
    ],
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  });
  (globalThis as unknown as { localStorage: Storage }).localStorage =
    proxy as unknown as Storage;
  (globalThis as unknown as { window: unknown }).window = globalThis;
  mod = await import('./dadosDaConta');
  learning = await import('@/app/stores/useLearningStore');
  favorites = await import('@/app/stores/useFavoritesStore');
});

const estudo = (userId: string) => ({
  id: `w-${userId}`,
  userId,
  workId: 'obra-1',
  priority: 3,
  addedAt: '2026-10-01',
  epochName: 'Romântico',
});

describe('dados guardados no navegador', () => {
  it('a conta seguinte não vê nada da anterior', () => {
    mod.garantirDono('conta-a');
    learning.useLearningStore
      .getState()
      .initializeLearning([estudo('conta-a')] as never, []);
    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(1);
    expect(localStorage.getItem('learning-storage')).toContain('conta-a');

    mod.garantirDono('conta-b');

    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(0);
    expect(learning.useLearningStore.getState().initialized).toBe(false);
    expect(
      favorites.useFavoritesStore.getState().favoriteComposers
    ).toHaveLength(0);
    expect(localStorage.getItem('learning-storage') ?? '').not.toContain(
      'conta-a'
    );
  });

  it('sem conta, nada fica e nada se mostra', () => {
    mod.garantirDono('conta-a');
    learning.useLearningStore
      .getState()
      .initializeLearning([estudo('conta-a')] as never, []);

    mod.garantirDono(null);

    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(0);
    expect(localStorage.getItem('opus-atlas:dono-dos-dados')).toBeNull();
  });

  it('a mesma conta mantém o que é dela', () => {
    mod.garantirDono('conta-a');
    learning.useLearningStore
      .getState()
      .initializeLearning([estudo('conta-a')] as never, []);

    mod.garantirDono('conta-a');

    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(1);
  });

  it('sair apaga tudo', () => {
    mod.garantirDono('conta-a');
    learning.useLearningStore
      .getState()
      .initializeLearning([estudo('conta-a')] as never, []);

    mod.esquecerConta();

    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(0);
    expect(localStorage.getItem('opus-atlas:dono-dos-dados')).toBeNull();
  });
});

describe('outra aba trocou de conta', () => {
  it('a memória desta aba é apagada mesmo com a marca já da conta nova', () => {
    mod.garantirDono('conta-a');
    learning.useLearningStore
      .getState()
      .initializeLearning([estudo('conta-a')] as never, []);
    // A outra aba entrou com a conta B e gravou a marca.
    localStorage.setItem('opus-atlas:dono-dos-dados', 'conta-b');

    mod.garantirDono('conta-b');

    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(0);
  });

  it('o aviso da outra aba esconde e apaga na hora', () => {
    mod.garantirDono('conta-a');
    learning.useLearningStore
      .getState()
      .initializeLearning([estudo('conta-a')] as never, []);
    const ouvintes: ((e: StorageEvent) => void)[] = [];
    (globalThis as unknown as { window: unknown }).window = {
      addEventListener: (_: string, f: (e: StorageEvent) => void) =>
        ouvintes.push(f),
      removeEventListener: () => undefined,
    };
    let perguntou = 0;
    const parar = mod.ouvirOutrasAbas(() => perguntou++);

    ouvintes[0]({
      key: 'opus-atlas:dono-dos-dados',
      newValue: 'conta-b',
    } as StorageEvent);

    expect(learning.useLearningStore.getState().wantToLearn).toHaveLength(0);
    expect(perguntou).toBe(1);
    parar();
    (globalThis as unknown as { window: unknown }).window = globalThis;
  });
});
