// utils/phoneValidation.ts - Utilitários de validação de telefone
import { ALL_PHONE_COUNTRIES, PhoneCountry } from './completePhoneCountries';

// Função para parsear número de telefone
export const parsePhoneNumber = (
  phone: string
): {
  countryCode: string;
  number: string;
  country: PhoneCountry;
} | null => {
  console.log('📞 Parseando telefone:', phone);

  if (!phone || !phone.startsWith('+')) {
    return null;
  }

  // Ordenar por dialCode (mais longo primeiro para evitar conflitos)
  const sortedCountries = [...ALL_PHONE_COUNTRIES].sort(
    (a, b) => b.dialCode.length - a.dialCode.length
  );

  for (const country of sortedCountries) {
    if (phone.startsWith(country.dialCode)) {
      const number = phone.slice(country.dialCode.length).replace(/\D/g, '');

      console.log('✅ Telefone parseado:', {
        countryCode: country.code,
        dialCode: country.dialCode,
        number,
        country: country.name,
      });

      return {
        countryCode: country.code,
        number,
        country,
      };
    }
  }

  console.log('❌ Nenhum país encontrado para o telefone:', phone);
  return null;
};

// Função principal de validação de telefone
export interface PhoneValidationResult {
  isValid: boolean;
  isEmpty: boolean;
  error: string | null;
  country: PhoneCountry | null;
  isComplete: boolean;
}

export const validatePhoneNumber = (phone: string): PhoneValidationResult => {
  console.log('🔍 Validando telefone:', phone);

  const result: PhoneValidationResult = {
    isValid: false,
    isEmpty: false,
    error: null,
    country: null,
    isComplete: false,
  };

  // 1. Verificar se está vazio
  if (!phone || phone.trim() === '') {
    console.log('✅ Telefone vazio - considerado válido');
    return {
      ...result,
      isValid: true, // Vazio é válido!
      isEmpty: true,
    };
  }

  // 2. Verificar se começa com +
  if (!phone.startsWith('+')) {
    console.log('❌ Telefone não começa com +');
    return {
      ...result,
      error: 'Telefone deve começar com +',
    };
  }

  // 3. Parsear o número
  const parsed = parsePhoneNumber(phone);
  if (!parsed) {
    console.log('❌ Código de país não reconhecido');
    return {
      ...result,
      error: 'Código de país não reconhecido',
    };
  }

  // 4. Verificar se tem dígitos suficientes
  if (parsed.number.length === 0) {
    console.log('❌ Nenhum número fornecido');
    return {
      ...result,
      country: parsed.country,
      error: 'Digite o número de telefone',
    };
  }

  // 5. Verificar se está completo
  if (parsed.number.length < parsed.country.maxDigits) {
    console.log(
      `❌ Telefone incompleto: ${parsed.number.length}/${parsed.country.maxDigits} dígitos`
    );
    return {
      ...result,
      country: parsed.country,
      error: `Telefone inválido. ${parsed.country.name} requer ${parsed.country.maxDigits} dígitos`,
    };
  }

  // 6. Verificar se não excede o limite
  if (parsed.number.length > parsed.country.maxDigits) {
    console.log(
      `❌ Telefone muito longo: ${parsed.number.length}/${parsed.country.maxDigits} dígitos`
    );
    return {
      ...result,
      country: parsed.country,
      error: `Telefone inválido. ${parsed.country.name} permite no máximo ${parsed.country.maxDigits} dígitos`,
    };
  }

  // 7. Tudo certo!
  console.log('✅ Telefone válido e completo');
  return {
    isValid: true,
    isEmpty: false,
    error: null,
    country: parsed.country,
    isComplete: true,
  };
};

// Função específica para verificar se telefone está completo (para UX)
export const isPhoneComplete = (phone: string): boolean => {
  const validation = validatePhoneNumber(phone);
  return validation.isEmpty || validation.isComplete;
};

// Função para obter mensagem de erro amigável
export const getPhoneValidationMessage = (phone: string): string | null => {
  const validation = validatePhoneNumber(phone);
  return validation.error;
};

// Função para usar em formulários - retorna apenas se é válido para prosseguir
export const canProceedWithPhone = (phone: string): boolean => {
  const validation = validatePhoneNumber(phone);
  return validation.isValid; // Será true tanto para vazio quanto para completo
};

// Hook personalizado para validação em tempo real
import { useMemo } from 'react';

export const usePhoneValidation = (phone: string) => {
  return useMemo(() => {
    const validation = validatePhoneNumber(phone);

    return {
      ...validation,
      canProceed: validation.isValid,
      showError: !validation.isEmpty && !validation.isValid, // Só mostra erro se não estiver vazio E for inválido
      progressMessage:
        validation.country && !validation.isComplete && !validation.isEmpty
          ? `${validation.country.flag} ${validation.country.name}: ${validation.country.format} (${validation.country.maxDigits} dígitos)`
          : null,
    };
  }, [phone]);
};

// Função para debug (desenvolvimento)
export const debugPhoneValidation = (phone: string) => {
  if (process.env.NODE_ENV !== 'development') return;

  const validation = validatePhoneNumber(phone);
  console.log('🐛 Phone Validation Debug:', {
    phone,
    validation,
    parsed: parsePhoneNumber(phone),
  });
};

export default {
  validatePhoneNumber,
  parsePhoneNumber,
  isPhoneComplete,
  getPhoneValidationMessage,
  canProceedWithPhone,
  usePhoneValidation,
  debugPhoneValidation,
};
