// app/utils/uploadValidation.ts
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateComposerData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Campos obrigatórios
  if (!data.name?.trim()) {
    errors.push('Nome é obrigatório');
  }
  if (!data.fullName?.trim()) {
    errors.push('Nome completo é obrigatório');
  }
  if (!data.epochId) {
    errors.push('Época é obrigatória');
  }
  if (!data.primaryRoleId) {
    errors.push('Papel principal é obrigatório');
  }

  // Validações de formato
  if (data.birthDate && !isValidDate(data.birthDate)) {
    warnings.push('Formato de data de nascimento pode estar incorreto');
  }
  if (data.deathDate && !isValidDate(data.deathDate)) {
    warnings.push('Formato de data de morte pode estar incorreto');
  }
  if (data.portraitUrl && !isValidUrl(data.portraitUrl)) {
    warnings.push('URL do retrato pode estar incorreta');
  }
  if (data.wikipediaLink && !isValidUrl(data.wikipediaLink)) {
    warnings.push('Link da Wikipedia pode estar incorreto');
  }

  // Validações de qualidade
  if (!data.bio?.trim()) {
    warnings.push(
      'Biografia não informada - isso reduzirá a qualidade dos dados'
    );
  }
  if (!data.nationality?.trim()) {
    warnings.push('Nacionalidade não informada');
  }
  if (!data.birthDate && !data.deathDate) {
    warnings.push(
      'Nenhuma data informada - considere adicionar pelo menos o ano de nascimento'
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateWorkData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Campos obrigatórios
  if (!data.title?.trim()) {
    errors.push('Título é obrigatório');
  }
  if (!data.composerId) {
    errors.push('Compositor é obrigatório');
  }
  if (!data.instrumentId) {
    errors.push('Instrumento é obrigatório');
  }
  if (!data.epochId) {
    errors.push('Época é obrigatória');
  }

  // Validações de formato
  if (data.compositionYear && !isValidYear(data.compositionYear)) {
    warnings.push('Ano de composição pode estar incorreto');
  }
  if (data.videoUrl && !isValidUrl(data.videoUrl)) {
    warnings.push('URL do vídeo pode estar incorreta');
  }
  if (data.imslpId && !isValidImslpId(data.imslpId)) {
    warnings.push('ID do IMSLP pode estar incorreto');
  }

  // Validações de qualidade
  if (!data.opOrCatalog?.trim()) {
    warnings.push('Número de opus ou catálogo não informado');
  }
  if (!data.compositionYear?.trim()) {
    warnings.push('Ano de composição não informado');
  }
  if (!data.categoryNames?.length) {
    warnings.push('Nenhuma categoria informada');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

export const validateScoreData = (data: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Campos obrigatórios
  if (!data.workId) {
    errors.push('Obra é obrigatória');
  }
  if (!data.title?.trim()) {
    errors.push('Título é obrigatório');
  }
  if (!data.downloadUrl?.trim()) {
    errors.push('URL do arquivo é obrigatória');
  }

  // Validações de formato
  if (data.downloadUrl && !isValidUrl(data.downloadUrl)) {
    errors.push('URL do arquivo inválida');
  }
  if (data.thumbnailUrl && !isValidUrl(data.thumbnailUrl)) {
    warnings.push('URL da miniatura pode estar incorreta');
  }

  // Validações de qualidade
  if (!data.pageCount) {
    warnings.push('Número de páginas não informado');
  }
  if (!data.fileSize) {
    warnings.push('Tamanho do arquivo não informado');
  }
  if (!data.editor?.trim() && !data.publisher?.trim()) {
    warnings.push('Editor ou editora não informados');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

// Funções auxiliares
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return false;

  // Aceitar formatos: YYYY, DD/MM/YYYY, DD de MM de YYYY, etc.
  const dateRegex =
    /^\d{4}$|^\d{1,2}\/\d{1,2}\/\d{4}$|^\d{1,2}\s+de\s+\w+\s+de\s+\d{4}$/i;
  return dateRegex.test(dateString.trim());
};

const isValidUrl = (url: string): boolean => {
  if (!url) return false;

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidYear = (year: string): boolean => {
  if (!year) return false;

  const yearNum = parseInt(year);
  return (
    !isNaN(yearNum) && yearNum >= 1000 && yearNum <= new Date().getFullYear()
  );
};

const isValidImslpId = (id: string): boolean => {
  if (!id) return false;

  // IMSLP IDs geralmente seguem o padrão: Category:Name,_First_Name
  return id.includes(':') && id.includes('_');
};

export const calculateDataQuality = (
  data: any,
  type: 'composer' | 'work' | 'score'
): number => {
  let totalFields = 0;
  let filledFields = 0;
  let qualityScore = 0;

  switch (type) {
    case 'composer':
      const composerFields = [
        'name',
        'fullName',
        'birthDate',
        'deathDate',
        'portraitUrl',
        'bio',
        'nationality',
        'instruments',
        'wikipediaLink',
        'imslpId',
      ];

      totalFields = composerFields.length;
      filledFields = composerFields.filter((field) =>
        data[field]?.trim()
      ).length;

      // Bônus por campos importantes
      if (data.bio?.length > 100) qualityScore += 10;
      if (data.portraitUrl && isValidUrl(data.portraitUrl)) qualityScore += 5;
      if (data.wikipediaLink && isValidUrl(data.wikipediaLink))
        qualityScore += 5;
      if (data.imslpId && isValidImslpId(data.imslpId)) qualityScore += 10;

      break;

    case 'work':
      const workFields = [
        'title',
        'composerId',
        'instrumentId',
        'epochId',
        'opOrCatalog',
        'compositionYear',
        'tone',
        'instrumentation',
        'categoryNames',
        'workGenresArr',
      ];

      totalFields = workFields.length;
      filledFields = workFields.filter((field) => {
        const value = data[field];
        if (Array.isArray(value)) return value.length > 0;
        return value?.toString().trim();
      }).length;

      // Bônus por campos importantes
      if (data.opOrCatalog?.trim()) qualityScore += 10;
      if (data.compositionYear?.trim()) qualityScore += 5;
      if (data.categoryNames?.length > 0) qualityScore += 5;
      if (data.imslpId && isValidImslpId(data.imslpId)) qualityScore += 10;

      break;

    case 'score':
      const scoreFields = [
        'title',
        'workId',
        'downloadUrl',
        'fileSize',
        'pageCount',
        'editor',
        'publisher',
        'copyright',
        'type',
      ];

      totalFields = scoreFields.length;
      filledFields = scoreFields.filter((field) =>
        data[field]?.toString().trim()
      ).length;

      // Bônus por campos importantes
      if (data.pageCount) qualityScore += 5;
      if (data.fileSize) qualityScore += 5;
      if (data.thumbnailUrl && isValidUrl(data.thumbnailUrl)) qualityScore += 5;
      if (data.editor?.trim() && data.publisher?.trim()) qualityScore += 10;

      break;
  }

  const baseScore = (filledFields / totalFields) * 70; // 70% para completude
  const finalScore = Math.min(100, Math.round(baseScore + qualityScore));

  return finalScore;
};
