/**
 * O formato dos documentos de leitura do site: Termos de Uso, Política de
 * Privacidade e Direitos Autorais.
 *
 * Texto jurídico longo não cabe em chave de tradução solta: ele tem cláusula,
 * subcláusula, lista e tabela, e precisa ser lido e revisado como documento.
 * Cada documento é um módulo com as duas línguas lado a lado.
 *
 * Marcação dentro das strings (ver `ui/TextoRico`): `**negrito**`,
 * `[texto](/rota)` e e-mails, que viram link sozinhos.
 */
export type Bloco =
  | string
  | { lista: string[]; numerada?: boolean }
  | { nota: string }
  | { tabela: { cabecalho: string[]; linhas: string[][] } };

export interface Subsecao {
  id: string;
  titulo: string;
  blocos: Bloco[];
}

export interface Secao {
  id: string;
  titulo: string;
  blocos: Bloco[];
  subsecoes?: Subsecao[];
}

export interface Documento {
  titulo: string;
  /** Uma ou duas frases: o que é o documento e para quem. */
  abertura: string;
  /** Data de vigência (AAAA-MM-DD). */
  vigencia: string;
  /** "O essencial": o documento em poucas linhas, em linguagem simples. */
  essencial: string[];
  secoes: Secao[];
}

export type Idioma = 'pt' | 'en';
export type DocumentoBilingue = Record<Idioma, Documento>;
