// app/utils/formUtils.ts - ATUALIZADO
import { RefObject } from 'react';

export interface FormFieldRef {
  current: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
}

export interface FormFieldRefs {
  [key: string]: FormFieldRef;
}

/**
 * Função para fazer scroll suave até o primeiro campo com erro
 * @param errorFields - Array com os nomes dos campos que têm erro
 * @param fieldRefs - Objeto com as referências dos campos
 * @param offset - Offset adicional para o scroll (default: 0)
 */
export const scrollToFirstError = (
  errorFields: string[],
  fieldRefs: FormFieldRefs,
  offset: number = 0
): void => {
  if (errorFields.length === 0) return;

  const firstErrorField = errorFields[0];
  const fieldRef = fieldRefs[firstErrorField];

  if (fieldRef?.current) {
    const element = fieldRef.current;
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - window.innerHeight / 2 + offset;

    // Scroll suave até o elemento
    window.scrollTo({
      top: middle,
      behavior: 'smooth',
    });

    // Focar no campo após um pequeno delay
    setTimeout(() => {
      element.focus();

      // Para inputs de texto, selecionar o texto
      if (element instanceof HTMLInputElement && element.type === 'text') {
        element.select();
      }
    }, 500);
  }
};

/**
 * Função para validar campos obrigatórios
 * @param formData - Dados do formulário
 * @param requiredFields - Array com os nomes dos campos obrigatórios
 * @param customValidations - Objeto com validações customizadas
 * @returns Objeto com os erros encontrados
 */
export const validateRequiredFields = (
  formData: Record<string, any>,
  requiredFields: string[],
  customValidations?: Record<string, (value: any) => string | null>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validar campos obrigatórios
  requiredFields.forEach((field) => {
    const value = formData[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[field] = `${getFieldLabel(field)} é obrigatório`;
    }
  });

  // Validações customizadas
  if (customValidations) {
    Object.entries(customValidations).forEach(([field, validator]) => {
      if (!errors[field]) {
        // Só validar se não há erro de campo obrigatório
        const error = validator(formData[field]);
        if (error) {
          errors[field] = error;
        }
      }
    });
  }

  return errors;
};

/**
 * Função para obter o label amigável de um campo
 * @param fieldName - Nome do campo
 * @returns Label amigável
 */
export const getFieldLabel = (fieldName: string): string => {
  const labels: Record<string, string> = {
    name: 'Nome',
    fullName: 'Nome completo',
    title: 'Título',
    epochId: 'Época',
    primaryRoleId: 'Papel principal',
    composerId: 'Compositor',
    instrumentId: 'Instrumento',
    birthDate: 'Data de nascimento',
    deathDate: 'Data de morte',
    nationality: 'Nacionalidade',
    content: 'Conteúdo',
    description: 'Descrição',
    category: 'Categoria',
    difficulty: 'Dificuldade',
    scope: 'Abrangência',
    workId: 'Obra',
    measureStart: 'Compasso inicial',
    measureEnd: 'Compasso final',
    movement: 'Movimento',
    section: 'Seção',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
  };

  return labels[fieldName] || fieldName;
};

/**
 * Função para limpar nomes (remover caracteres especiais)
 * @param name - Nome a ser limpo
 * @returns Nome limpo
 */
export const cleanName = (name: string): string => {
  return name
    .replace(/[(),]/g, '') // Remove parênteses e vírgulas
    .replace(/_/g, ' ') // Substitui underscores por espaços
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
};

/**
 * Função para validar formato de data HTML5 (YYYY-MM-DD)
 * @param dateString - String da data
 * @returns true se válida, false caso contrário
 */
export const isValidHTMLDate = (dateString: string): boolean => {
  if (!dateString) return true; // Campo opcional

  // Verificar formato YYYY-MM-DD
  const htmlDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!htmlDateRegex.test(dateString)) return false;

  // Verificar se a data é válida
  const date = new Date(dateString);
  const [year, month, day] = dateString.split('-').map(Number);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

/**
 * Função para validar formato de data (dd/mm/yyyy básico) - MANTIDA PARA COMPATIBILIDADE
 * @param dateString - String da data
 * @param format - Formato esperado (default: 'dd/mm/yyyy')
 * @returns true se válida, false caso contrário
 */
export const isValidDate = (
  dateString: string,
  format: string = 'dd/mm/yyyy'
): boolean => {
  if (!dateString) return true; // Campo opcional

  switch (format) {
    case 'dd/mm/yyyy':
      const ddmmyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
      return ddmmyyyyRegex.test(dateString);

    case 'yyyy-mm-dd':
      return isValidHTMLDate(dateString);

    case 'flexible':
      // Aceita vários formatos: dd/mm/yyyy, dd de mês de yyyy, yyyy, yyyy-mm-dd
      const flexibleRegex =
        /^(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\s+(de\s+)?\w+\s+(de\s+)?\d{4}|\d{4}|\d{4}-\d{2}-\d{2})$/;
      return flexibleRegex.test(dateString);

    default:
      return false;
  }
};

/**
 * Função para validar formato de data extenso (aceita dd/mm/yyyy e formato extenso)
 * @param dateString - String da data
 * @returns true se válida, false caso contrário
 */
export const isValidExtendedDate = (dateString: string): boolean => {
  if (!dateString) return true; // Campo opcional

  // Formato yyyy-mm-dd (HTML5 date input)
  if (isValidHTMLDate(dateString)) {
    return true;
  }

  // Formato dd/mm/yyyy
  const ddmmyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (ddmmyyyyRegex.test(dateString)) {
    return true;
  }

  // Formato apenas ano
  const yearOnlyRegex = /^\d{4}$/;
  if (yearOnlyRegex.test(dateString)) {
    return true;
  }

  // Lista de meses válidos em inglês e português
  const validMonths = [
    // Inglês
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
    'jan',
    'feb',
    'mar',
    'apr',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
    // Português
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
    'jan',
    'fev',
    'mar',
    'abr',
    'mai',
    'jun',
    'jul',
    'ago',
    'set',
    'out',
    'nov',
    'dez',
  ];

  const monthsPattern = validMonths.join('|');

  // Formato extenso: "27 de janeiro de 1756" ou "27 January 1756" ou "January 27, 1756"
  const extendedFormats = [
    // Português: "27 de janeiro de 1756"
    new RegExp(
      `^\\d{1,2}\\s+(de\\s+)?(${monthsPattern})\\s+(de\\s+)?\\d{4}$`,
      'i'
    ),
    // Inglês: "27 January 1756" ou "January 27, 1756"
    new RegExp(`^\\d{1,2}\\s+(${monthsPattern})\\s+\\d{4}$`, 'i'),
    new RegExp(`^(${monthsPattern})\\s+\\d{1,2},?\\s+\\d{4}$`, 'i'),
    // Apenas mês e ano: "janeiro de 1756" ou "January 1756"
    new RegExp(`^(${monthsPattern})\\s+(de\\s+)?\\d{4}$`, 'i'),
  ];

  return extendedFormats.some((regex) => regex.test(dateString.trim()));
};

/**
 * Função para converter data de dd/mm/yyyy para yyyy-mm-dd (HTML5 date input)
 * @param dateString - Data no formato dd/mm/yyyy
 * @returns Data no formato yyyy-mm-dd ou string vazia se inválida
 */
export const convertToHTMLDate = (dateString: string): string => {
  if (!dateString) return '';

  // Se já está em formato HTML5, retornar como está
  if (isValidHTMLDate(dateString)) {
    return dateString;
  }

  // Converter de dd/mm/yyyy para yyyy-mm-dd
  const ddmmyyyyRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = dateString.match(ddmmyyyyRegex);

  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return '';
};

/**
 * Função para converter data de yyyy-mm-dd para dd/mm/yyyy
 * @param dateString - Data no formato yyyy-mm-dd
 * @returns Data no formato dd/mm/yyyy ou string vazia se inválida
 */
export const convertFromHTMLDate = (dateString: string): string => {
  if (!dateString) return '';

  if (isValidHTMLDate(dateString)) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  return dateString;
};

/**
 * Função para validar e-mail
 * @param email - E-mail a ser validado
 * @returns true se válido, false caso contrário
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Função para validar URL
 * @param url - URL a ser validada
 * @returns true se válida, false caso contrário
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Hook personalizado para gerenciar validação de formulário
 * @param fieldRefs - Referências dos campos
 * @param requiredFields - Campos obrigatórios
 * @param customValidations - Validações customizadas
 */
export const useFormValidation = (
  fieldRefs: FormFieldRefs,
  requiredFields: string[],
  customValidations?: Record<string, (value: any) => string | null>
) => {
  const validateForm = (formData: Record<string, any>) => {
    const errors = validateRequiredFields(
      formData,
      requiredFields,
      customValidations
    );

    const errorFields = Object.keys(errors);
    if (errorFields.length > 0) {
      setTimeout(() => {
        scrollToFirstError(errorFields, fieldRefs);
      }, 100);
    }

    return {
      isValid: errorFields.length === 0,
      errors,
      errorFields,
    };
  };

  return { validateForm };
};

/**
 * Função para debounce (útil para validações em tempo real)
 * @param func - Função a ser executada
 * @param delay - Delay em milissegundos
 * @returns Função com debounce
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Função para calcular completude de dados
 * @param data - Dados do objeto
 * @param fields - Campos a serem considerados
 * @returns Porcentagem de completude
 */
export const calculateDataCompleteness = (
  data: Record<string, any>,
  fields: string[]
): number => {
  const filledFields = fields.filter(
    (field) => data[field] && data[field].toString().trim()
  );

  return Math.round((filledFields.length / fields.length) * 100);
};

/**
 * Função para formatar data para exibição
 * @param dateString - String da data (pode ser yyyy-mm-dd ou dd/mm/yyyy)
 * @param format - Formato de saída
 * @returns Data formatada
 */
export const formatDate = (
  dateString: string,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  if (!dateString) return '';

  let date: Date;

  // Tentar criar a data baseado no formato
  if (isValidHTMLDate(dateString)) {
    date = new Date(dateString);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  } else {
    date = new Date(dateString);
  }

  // Verificar se a data é válida
  if (isNaN(date.getTime())) {
    return dateString; // Retornar string original se não conseguir converter
  }

  switch (format) {
    case 'short':
      return date.toLocaleDateString('pt-BR');

    case 'long':
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

    case 'relative':
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoje';
      if (diffDays === 1) return 'Ontem';
      if (diffDays < 7) return `${diffDays} dias atrás`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
      return `${Math.floor(diffDays / 365)} anos atrás`;

    default:
      return date.toLocaleDateString('pt-BR');
  }
};

/**
 * Função para validar se uma data está no futuro
 * @param dateString - String da data
 * @returns true se a data está no futuro
 */
export const isDateInFuture = (dateString: string): boolean => {
  if (!dateString) return false;

  const date = isValidHTMLDate(dateString)
    ? new Date(dateString)
    : new Date(dateString);

  return date > new Date();
};

/**
 * Função para validar se uma data de morte é posterior à data de nascimento
 * @param birthDate - Data de nascimento
 * @param deathDate - Data de morte
 * @returns true se as datas são válidas
 */
export const isValidDateRange = (
  birthDate: string,
  deathDate: string
): boolean => {
  if (!birthDate || !deathDate) return true; // Se alguma está vazia, não validar

  const birth = isValidHTMLDate(birthDate)
    ? new Date(birthDate)
    : new Date(birthDate);

  const death = isValidHTMLDate(deathDate)
    ? new Date(deathDate)
    : new Date(deathDate);

  return death > birth;
};
