import type { Bloco, Idioma } from '../legal/tipos';

/**
 * O formato das três páginas de ajuda — Central de Ajuda (como fazer), FAQ
 * (perguntas) e Suporte (algo não funciona). Grupos de itens que abrem no
 * lugar; o texto usa a mesma marcação dos documentos legais (`**`, links,
 * e-mails). Tudo descreve o que o site faz de fato.
 */
export interface ItemDeAjuda {
  id: string;
  titulo: string;
  blocos: Bloco[];
}

export interface GrupoDeAjuda {
  id: string;
  titulo: string;
  itens: ItemDeAjuda[];
}

export interface Central {
  titulo: string;
  abertura: string;
  grupos: GrupoDeAjuda[];
}

export type CentralBilingue = Record<Idioma, Central>;
