// utils/locationHelpers.ts - Funções auxiliares para localização

import { Country, State, City } from 'country-state-city';
import {
  PHONE_COUNTRIES_UPDATED,
  PhoneCountry,
  translateCountryName,
} from './countryTranslations';

// 🔧 Função para obter país traduzido por código
export const getTranslatedCountryByCode = (countryCode: string) => {
  const country = Country.getCountryByCode(countryCode);
  if (!country) return null;

  return {
    isoCode: country.isoCode,
    name: translateCountryName(country.name),
    originalName: country.name,
    flag: country.flag,
    phonecode: country.phonecode,
    currency: country.currency,
  };
};

// 🔧 Função para obter todos os países traduzidos
export const getAllTranslatedCountries = () => {
  return Country.getAllCountries().map((country) => ({
    isoCode: country.isoCode,
    name: translateCountryName(country.name),
    originalName: country.name,
    flag: country.flag,
    phonecode: country.phonecode,
    currency: country.currency,
  }));
};

// 🔧 Função para buscar países por termo (em português)
export const searchCountries = (searchTerm: string) => {
  const allCountries = getAllTranslatedCountries();
  const lowerSearchTerm = searchTerm.toLowerCase();

  return allCountries.filter(
    (country) =>
      country.name.toLowerCase().includes(lowerSearchTerm) ||
      country.originalName.toLowerCase().includes(lowerSearchTerm) ||
      country.isoCode.toLowerCase().includes(lowerSearchTerm)
  );
};

// 🔧 Função para validar seleção de localização
export const validateLocation = (location: {
  country?: { isoCode: string; name: string };
  state?: { isoCode: string; name: string };
  city?: { name: string };
}): {
  isValid: boolean;
  errors: string[];
  completeness: 'none' | 'country' | 'state' | 'city';
} => {
  const errors: string[] = [];
  let completeness: 'none' | 'country' | 'state' | 'city' = 'none';

  if (!location.country) {
    errors.push('País é obrigatório');
    return { isValid: false, errors, completeness };
  }

  completeness = 'country';

  // Verificar se o país realmente existe
  const countryExists = Country.getCountryByCode(location.country.isoCode);
  if (!countryExists) {
    errors.push('País selecionado é inválido');
    return { isValid: false, errors, completeness };
  }

  if (location.state) {
    completeness = 'state';

    // Verificar se o estado existe no país
    const stateExists = State.getStateByCodeAndCountry(
      location.state.isoCode,
      location.country.isoCode
    );
    if (!stateExists) {
      errors.push('Estado selecionado é inválido para o país escolhido');
      return { isValid: false, errors, completeness };
    }

    if (location.city) {
      completeness = 'city';

      // Verificar se a cidade existe no estado
      const cities = City.getCitiesOfState(
        location.country.isoCode,
        location.state.isoCode
      );
      const cityExists = cities.some(
        (city) => city.name === location.city!.name
      );
      if (!cityExists) {
        errors.push('Cidade selecionada é inválida para o estado escolhido');
        return { isValid: false, errors, completeness };
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    completeness,
  };
};

// utils/formValidation.ts - Validações gerais de formulário

// 🔧 Validação de email
export const validateEmail = (
  email: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email é obrigatório');
    return { isValid: false, errors };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Formato de email inválido');
  }

  const commonDomains = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
  ];
  const domain = email.split('@')[1];
  if (domain && !commonDomains.includes(domain) && !domain.includes('.')) {
    errors.push('Domínio de email suspeito');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 🔧 Validação de nome
export const validateName = (
  name: string
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!name) {
    errors.push('Nome é obrigatório');
    return { isValid: false, errors };
  }

  if (name.trim().length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (name.trim().length > 100) {
    errors.push('Nome não pode ter mais que 100 caracteres');
  }

  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    errors.push('Nome deve conter apenas letras e espaços');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  // Phone helpers

  // Location helpers
  getTranslatedCountryByCode,
  getAllTranslatedCountries,
  searchCountries,
  validateLocation,

  // Form validation
  validateEmail,
  validateName,
};
