'use client';

import { useEffect, useState } from 'react';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

/**
 * O nome de um botão que só tem ícone, para quem usa leitor de tela.
 *
 * **157 botões do produto eram só ícone e não tinham nome** — o leitor
 * anunciava apenas "botão". 99 deles eram o X de fechar de um modal. O nome
 * acessível de um botão é o texto dentro dele, então este `<span>` invisível
 * na tela resolve sem mexer em quem desenha o botão.
 *
 * Fica dentro do botão: `<button><PiX /><NomeAcao acao="fechar" /></button>`.
 * O primeiro desenho sai em português, igual ao do servidor; depois de montar,
 * vale o idioma da pessoa. Assim a hidratação não diverge.
 */

const NOMES = {
  fechar: { pt: 'Fechar', en: 'Close' },
  excluir: { pt: 'Excluir', en: 'Delete' },
  editar: { pt: 'Editar', en: 'Edit' },
  anterior: { pt: 'Anterior', en: 'Previous' },
  proximo: { pt: 'Próximo', en: 'Next' },
  atualizar: { pt: 'Atualizar', en: 'Refresh' },
  maisOpcoes: { pt: 'Mais opções', en: 'More options' },
  ver: { pt: 'Ver', en: 'View' },
  adicionar: { pt: 'Adicionar', en: 'Add' },
  denunciar: { pt: 'Denunciar', en: 'Report' },
  menu: { pt: 'Menu', en: 'Menu' },
  verEmLista: { pt: 'Ver em lista', en: 'List view' },
  verEmGrade: { pt: 'Ver em grade', en: 'Grid view' },
  expandir: { pt: 'Expandir', en: 'Expand' },
  voltar: { pt: 'Voltar', en: 'Back' },
  compartilhar: { pt: 'Compartilhar', en: 'Share' },
  buscar: { pt: 'Buscar', en: 'Search' },
  limpar: { pt: 'Limpar', en: 'Clear' },
  tirar: { pt: 'Tirar', en: 'Remove' },
  fecharAviso: { pt: 'Fechar aviso', en: 'Dismiss' },
} as const;

export type Acao = keyof typeof NOMES;

export function NomeAcao({ acao }: { acao: Acao }) {
  const idioma = useLanguageStore((s) => s.language);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  return (
    <span className="sr-only">
      {NOMES[acao][montado && idioma === 'en' ? 'en' : 'pt']}
    </span>
  );
}
