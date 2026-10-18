/**
 * Quem opera o Opus Atlas — **a única fonte** dos dados da empresa no front.
 * Termos de Uso, Política de Privacidade e rodapé leem daqui.
 *
 * Enquanto não houver CNPJ, tudo fica `null` e nenhum texto menciona empresa:
 * nada de "CNPJ em breve" nem número inventado. Quando a empresa existir,
 * preencha os campos abaixo e mude a data de vigência dos Termos e da
 * Política (`conteudo/legal/termos.ts` e `privacidade.ts`): a identificação
 * aparece sozinha nos dois documentos e no rodapé (o Decreto 7.962/2013 pede
 * nome e CNPJ em local de destaque em quem vende pela internet).
 *
 * Também a nota fiscal da API (`billing/invoices`) cita o emissor: o mesmo
 * dado precisa ir para lá.
 */
export const EMPRESA = {
  /** Razão social, como no cartão do CNPJ. */
  razaoSocial: null as string | null,
  /** Só os 14 dígitos; a formatação sai de `cnpjFormatado`. */
  cnpj: null as string | null,
  /** Endereço da sede (logradouro, número, cidade, UF, CEP). */
  endereco: null as string | null,
} as const;

/** `00.000.000/0000-00`, ou `null` sem CNPJ. */
export function cnpjFormatado(): string | null {
  const d = EMPRESA.cnpj?.replace(/\D/g, '');
  if (!d || d.length !== 14) return null;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/**
 * A frase que identifica a empresa nos documentos legais — vazia sem CNPJ,
 * para os documentos a espalharem sem condição: `...identificacaoDaEmpresa('pt')`.
 */
export function identificacaoDaEmpresa(idioma: 'pt' | 'en'): string[] {
  const cnpj = cnpjFormatado();
  if (!cnpj || !EMPRESA.razaoSocial) return [];
  const sede = EMPRESA.endereco;
  return [
    idioma === 'pt'
      ? `O Opus Atlas é operado por ${EMPRESA.razaoSocial}, inscrita no CNPJ sob o nº ${cnpj}${sede ? `, com sede em ${sede}` : ''}.`
      : `Opus Atlas is operated by ${EMPRESA.razaoSocial}, registered in Brazil under CNPJ ${cnpj}${sede ? `, headquartered at ${sede}` : ''}.`,
  ];
}
