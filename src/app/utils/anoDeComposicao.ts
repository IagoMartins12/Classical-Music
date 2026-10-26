/**
 * The year of composition of a work, as the sources write it: "1830",
 * "1830-32", "1830-1835", "1845 ca.", "ca.1845", "1835?". The year picker
 * (`SeletorDeAno`) keeps a start, an optional end and "approximate"; the
 * rest ("1830, Paris", "1837 (No.1), 1839 (No.2)") is shown as recorded and
 * only rewritten when the person picks a year.
 */
export interface AnoDeComposicao {
  inicio: number;
  /** The last year of a span ("1830-1835"); null for a single year. */
  fim: number | null;
  aproximado: boolean;
}

const FORMA =
  /^(ca\.?\s*)?(\d{4})(?:\s*[-–/]\s*(\d{1,4}))?\s*(ca\.?|\?|\(\?\))?$/i;

/** The end of "1830-32" or "1829-5": the start's leading digits, completed. */
function completarFim(inicio: number, fim: string): number {
  const n = Number(fim);
  if (fim.length === 4) return n;
  const passo = 10 ** fim.length;
  const fimNaMesmaDezena = Math.floor(inicio / passo) * passo + n;
  // "1829-5" crosses into the next decade: 1835, not 1825.
  return fimNaMesmaDezena > inicio
    ? fimNaMesmaDezena
    : fimNaMesmaDezena + passo;
}

export function lerAno(texto: string | null | undefined): {
  ano: AnoDeComposicao | null;
  /** The text says more than the picker keeps: show it as recorded. */
  inexato: boolean;
} {
  const t = texto?.trim() ?? '';
  if (!t) return { ano: null, inexato: false };
  const m = FORMA.exec(t);
  if (!m) {
    const primeiro = /\d{4}/.exec(t);
    return {
      ano: primeiro
        ? { inicio: Number(primeiro[0]), fim: null, aproximado: false }
        : null,
      inexato: true,
    };
  }
  const inicio = Number(m[2]);
  const fim = m[3] ? completarFim(inicio, m[3]) : null;
  return {
    ano: {
      inicio,
      fim: fim !== null && fim > inicio ? fim : null,
      aproximado: Boolean(m[1] || m[4]),
    },
    inexato: false,
  };
}

/** In the stored shape most of the catalog uses: "1830-1835 ca.". */
export function escreverAno(a: AnoDeComposicao): string {
  const anos =
    a.fim && a.fim > a.inicio ? `${a.inicio}-${a.fim}` : `${a.inicio}`;
  return a.aproximado ? `${anos} ca.` : anos;
}

/** For the field: "c. 1830–1835". */
export function mostrarAno(a: AnoDeComposicao): string {
  const anos =
    a.fim && a.fim > a.inicio ? `${a.inicio}–${a.fim}` : `${a.inicio}`;
  return a.aproximado ? `c. ${anos}` : anos;
}
