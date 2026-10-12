// Upload history: field names and values as the history page shows them.

/**
 * Formata nome do campo para exibição
 */
export function formatFieldName(field: string): string {
  const fieldMap: Record<string, string> = {
    title: 'Título',
    name: 'Nome',
    fullName: 'Nome Completo',
    bio: 'Biografia',
    portraitUrl: 'Foto',
    birthDate: 'Data de Nascimento',
    deathDate: 'Data de Morte',
    nationality: 'Nacionalidade',
    epochId: 'Época',
    instrumentId: 'Instrumento',
    composerId: 'Compositor',
    workId: 'Obra',
    opOrCatalog: 'Op./Catálogo',
    compositionYear: 'Ano de Composição',
    tone: 'Tonalidade',
    workStyle: 'Estilo',
    categoryNames: 'Categorias',
    workGenresArr: 'Gêneros',
    fileSize: 'Tamanho do Arquivo',
    pageCount: 'Número de Páginas',
    downloadUrl: 'URL de Download',
    fileFormat: 'Formato',
    type: 'Tipo',
    notes: 'Notas',
    editor: 'Editor',
    publisher: 'Editora',
    copyright: 'Copyright',
    bulkImport: 'Importação em Lote',
    created: 'Criado',
    deleted: 'Excluído',
  };

  return fieldMap[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Formata valor para exibição
 */
export function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return 'vazio';
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : 'vazio';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 47) + '...';
  }

  return String(value);
}
