// app/utils/historyFormat.ts
//
// Formatação do histórico de contribuições — funções puras, sem banco. Moram
// à parte do `historyUtils.ts` (que grava no banco pelas rotas do legado) para
// a página `/upload/history`, que roda no navegador, não puxar o Prisma.

/**
 * Calcula as diferenças entre dois objetos
 */
export function calculateChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, any> {
  const changes: Record<string, any> = {};

  // Campos que devemos ignorar no histórico
  const ignoredFields = ['id', 'createdAt', 'updatedAt', 'lastVerified'];

  // Verificar campos modificados
  for (const key in newData) {
    if (ignoredFields.includes(key)) continue;

    const oldValue = oldData[key];
    const newValue = newData[key];

    // Comparar valores (incluindo arrays e objetos)
    if (!deepEqual(oldValue, newValue)) {
      changes[key] = {
        from: oldValue,
        to: newValue,
      };
    }
  }

  // Verificar campos removidos
  for (const key in oldData) {
    if (ignoredFields.includes(key)) continue;

    if (
      !(key in newData) &&
      oldData[key] !== null &&
      oldData[key] !== undefined
    ) {
      changes[key] = {
        from: oldData[key],
        to: null,
      };
    }
  }

  return changes;
}

/**
 * Comparação profunda para arrays e objetos
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (a == null || b == null) return a === b;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => deepEqual(val, b[index]));
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    return keysA.every((key) => deepEqual(a[key], b[key]));
  }

  return false;
}

/**
 * Formata as mudanças para exibição legível
 */
export function formatChangesForDisplay(changes: Record<string, any>): string {
  if (!changes || Object.keys(changes).length === 0) {
    return 'Nenhuma alteração registrada';
  }

  // Tratamento especial para importação em lote
  if (changes.bulkImport) {
    const bulk = changes.bulkImport;
    return `Importou ${bulk.successfulWorks} obra(s) do IMSLP para ${
      bulk.composerName
    }${bulk.failedWorks > 0 ? ` (${bulk.failedWorks} com erro)` : ''}${
      bulk.duplicateWorks > 0
        ? ` (${bulk.duplicateWorks} duplicata${
            bulk.duplicateWorks > 1 ? 's' : ''
          })`
        : ''
    }`;
  }

  const formattedChanges = Object.entries(changes)
    .map(([field, change]) => {
      const fieldName = formatFieldName(field);

      if (
        typeof change === 'object' &&
        change.from !== undefined &&
        change.to !== undefined
      ) {
        const fromValue = formatValue(change.from);
        const toValue = formatValue(change.to);

        if (change.from === null || change.from === undefined) {
          return `${fieldName}: adicionado "${toValue}"`;
        } else if (change.to === null || change.to === undefined) {
          return `${fieldName}: removido "${fromValue}"`;
        } else {
          return `${fieldName}: "${fromValue}" → "${toValue}"`;
        }
      }

      return `${fieldName}: ${formatValue(change)}`;
    })
    .slice(0, 5); // Limitar a 5 mudanças para não sobrecarregar

  const result = formattedChanges.join(', ');
  const totalChanges = Object.keys(changes).length;

  if (totalChanges > 5) {
    return `${result} e mais ${totalChanges - 5} alterações`;
  }

  return result;
}

/**
 * Formata nome do campo para exibição
 */
function formatFieldName(field: string): string {
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
function formatValue(value: any): string {
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
