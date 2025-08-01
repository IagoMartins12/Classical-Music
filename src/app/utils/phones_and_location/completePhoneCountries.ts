// utils/completePhoneCountries.ts - Base completa de países para telefone
import { Country } from 'country-state-city';
import { translateCountryName } from './countryTranslations';

export interface PhoneCountry {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
  maxDigits: number;
  popular?: boolean;
}

// Mapeamento de códigos de país para dial codes e formatações
const COUNTRY_PHONE_DATA: Record<
  string,
  { dialCode: string; format: string; maxDigits: number; popular?: boolean }
> = {
  // Populares (destaque especial)
  BR: {
    dialCode: '+55',
    format: '(XX) XXXXX-XXXX',
    maxDigits: 11,
    popular: true,
  },
  US: {
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    maxDigits: 10,
    popular: true,
  },
  CA: {
    dialCode: '+1',
    format: '(XXX) XXX-XXXX',
    maxDigits: 10,
    popular: true,
  },
  GB: { dialCode: '+44', format: 'XXXX XXX XXX', maxDigits: 10, popular: true },
  FR: { dialCode: '+33', format: 'X XX XX XX XX', maxDigits: 9, popular: true },
  DE: { dialCode: '+49', format: 'XXX XXXXXXXX', maxDigits: 11, popular: true },
  IT: { dialCode: '+39', format: 'XXX XXX XXXX', maxDigits: 10, popular: true },
  ES: { dialCode: '+34', format: 'XXX XX XX XX', maxDigits: 9, popular: true },

  // América do Sul
  AR: { dialCode: '+54', format: 'XX XXXX XXXX', maxDigits: 10 },
  CL: { dialCode: '+56', format: 'X XXXX XXXX', maxDigits: 9 },
  CO: { dialCode: '+57', format: 'XXX XXX XXXX', maxDigits: 10 },
  PE: { dialCode: '+51', format: 'XXX XXX XXX', maxDigits: 9 },
  VE: { dialCode: '+58', format: 'XXX XXX XXXX', maxDigits: 10 },
  UY: { dialCode: '+598', format: 'X XXX XXXX', maxDigits: 8 },
  PY: { dialCode: '+595', format: 'XXX XXX XXX', maxDigits: 9 },
  BO: { dialCode: '+591', format: 'X XXX XXXX', maxDigits: 8 },
  EC: { dialCode: '+593', format: 'XX XXX XXXX', maxDigits: 9 },
  GY: { dialCode: '+592', format: 'XXX XXXX', maxDigits: 7 },
  SR: { dialCode: '+597', format: 'XXX XXXX', maxDigits: 7 },
  GF: { dialCode: '+594', format: 'XXX XX XX XX', maxDigits: 9 },

  // América do Norte e Central
  MX: { dialCode: '+52', format: 'XX XXXX XXXX', maxDigits: 10 },
  GT: { dialCode: '+502', format: 'XXXX XXXX', maxDigits: 8 },
  BZ: { dialCode: '+501', format: 'XXX XXXX', maxDigits: 7 },
  SV: { dialCode: '+503', format: 'XXXX XXXX', maxDigits: 8 },
  HN: { dialCode: '+504', format: 'XXXX XXXX', maxDigits: 8 },
  NI: { dialCode: '+505', format: 'XXXX XXXX', maxDigits: 8 },
  CR: { dialCode: '+506', format: 'XXXX XXXX', maxDigits: 8 },
  PA: { dialCode: '+507', format: 'XXXX XXXX', maxDigits: 8 },

  // Caribe
  CU: { dialCode: '+53', format: 'X XXX XXXX', maxDigits: 8 },
  DO: { dialCode: '+1', format: '(XXX) XXX-XXXX', maxDigits: 10 },
  HT: { dialCode: '+509', format: 'XX XX XXXX', maxDigits: 8 },
  JM: { dialCode: '+1', format: '(XXX) XXX-XXXX', maxDigits: 10 },
  PR: { dialCode: '+1', format: '(XXX) XXX-XXXX', maxDigits: 10 },
  TT: { dialCode: '+1', format: '(XXX) XXX-XXXX', maxDigits: 10 },
  BB: { dialCode: '+1', format: '(XXX) XXX-XXXX', maxDigits: 10 },

  // Europa Ocidental
  PT: { dialCode: '+351', format: 'XXX XXX XXX', maxDigits: 9 },
  NL: { dialCode: '+31', format: 'XX XXX XXXX', maxDigits: 9 },
  BE: { dialCode: '+32', format: 'XXX XX XX XX', maxDigits: 9 },
  CH: { dialCode: '+41', format: 'XX XXX XX XX', maxDigits: 9 },
  AT: { dialCode: '+43', format: 'XXX XXX XXXX', maxDigits: 10 },
  LU: { dialCode: '+352', format: 'XX XX XX XX', maxDigits: 8 },
  IE: { dialCode: '+353', format: 'XX XXX XXXX', maxDigits: 9 },

  // Europa Nórdica
  SE: { dialCode: '+46', format: 'XX XXX XX XX', maxDigits: 9 },
  NO: { dialCode: '+47', format: 'XXX XX XXX', maxDigits: 8 },
  DK: { dialCode: '+45', format: 'XX XX XX XX', maxDigits: 8 },
  FI: { dialCode: '+358', format: 'XX XXX XXXX', maxDigits: 9 },
  IS: { dialCode: '+354', format: 'XXX XXXX', maxDigits: 7 },

  // Europa Oriental
  RU: { dialCode: '+7', format: 'XXX XXX XX XX', maxDigits: 10 },
  PL: { dialCode: '+48', format: 'XXX XXX XXX', maxDigits: 9 },
  CZ: { dialCode: '+420', format: 'XXX XXX XXX', maxDigits: 9 },
  SK: { dialCode: '+421', format: 'XXX XXX XXX', maxDigits: 9 },
  HU: { dialCode: '+36', format: 'XX XXX XXXX', maxDigits: 9 },
  RO: { dialCode: '+40', format: 'XXX XXX XXX', maxDigits: 9 },
  BG: { dialCode: '+359', format: 'XX XXX XXXX', maxDigits: 9 },
  HR: { dialCode: '+385', format: 'XX XXX XXXX', maxDigits: 9 },
  SI: { dialCode: '+386', format: 'XX XXX XXX', maxDigits: 8 },
  BA: { dialCode: '+387', format: 'XX XXX XXX', maxDigits: 8 },
  RS: { dialCode: '+381', format: 'XX XXX XXXX', maxDigits: 9 },
  ME: { dialCode: '+382', format: 'XX XXX XXX', maxDigits: 8 },
  MK: { dialCode: '+389', format: 'XX XXX XXX', maxDigits: 8 },
  AL: { dialCode: '+355', format: 'XX XXX XXXX', maxDigits: 9 },
  UA: { dialCode: '+380', format: 'XX XXX XX XX', maxDigits: 9 },
  BY: { dialCode: '+375', format: 'XX XXX XX XX', maxDigits: 9 },
  LT: { dialCode: '+370', format: 'XXX XXXXX', maxDigits: 8 },
  LV: { dialCode: '+371', format: 'XX XXX XXX', maxDigits: 8 },
  EE: { dialCode: '+372', format: 'XXXX XXXX', maxDigits: 8 },
  MD: { dialCode: '+373', format: 'XX XXX XXX', maxDigits: 8 },

  // Ásia Oriental
  CN: { dialCode: '+86', format: 'XXX XXXX XXXX', maxDigits: 11 },
  JP: { dialCode: '+81', format: 'XX XXXX XXXX', maxDigits: 10 },
  KR: { dialCode: '+82', format: 'XX XXXX XXXX', maxDigits: 10 },
  KP: { dialCode: '+850', format: 'XXX XXX XXXX', maxDigits: 10 },
  MN: { dialCode: '+976', format: 'XX XX XXXX', maxDigits: 8 },
  TW: { dialCode: '+886', format: 'XXX XXX XXX', maxDigits: 9 },
  HK: { dialCode: '+852', format: 'XXXX XXXX', maxDigits: 8 },
  MO: { dialCode: '+853', format: 'XXXX XXXX', maxDigits: 8 },

  // Sudeste Asiático
  TH: { dialCode: '+66', format: 'XX XXX XXXX', maxDigits: 9 },
  VN: { dialCode: '+84', format: 'XXX XXX XXXX', maxDigits: 10 },
  PH: { dialCode: '+63', format: 'XXX XXX XXXX', maxDigits: 10 },
  MY: { dialCode: '+60', format: 'XX XXX XXXX', maxDigits: 9 },
  SG: { dialCode: '+65', format: 'XXXX XXXX', maxDigits: 8 },
  ID: { dialCode: '+62', format: 'XXX XXX XXXX', maxDigits: 10 },
  BN: { dialCode: '+673', format: 'XXX XXXX', maxDigits: 7 },
  LA: { dialCode: '+856', format: 'XX XXX XXX', maxDigits: 8 },
  KH: { dialCode: '+855', format: 'XX XXX XXX', maxDigits: 8 },
  MM: { dialCode: '+95', format: 'X XXX XXXX', maxDigits: 8 },
  TL: { dialCode: '+670', format: 'XXX XXXX', maxDigits: 7 },

  // Ásia Meridional
  IN: { dialCode: '+91', format: 'XXXXX XXXXX', maxDigits: 10 },
  PK: { dialCode: '+92', format: 'XXX XXX XXXX', maxDigits: 10 },
  BD: { dialCode: '+880', format: 'XXX XXX XXXX', maxDigits: 10 },
  LK: { dialCode: '+94', format: 'XX XXX XXXX', maxDigits: 9 },
  NP: { dialCode: '+977', format: 'XXX XXX XXXX', maxDigits: 10 },
  BT: { dialCode: '+975', format: 'XX XXX XXX', maxDigits: 8 },
  MV: { dialCode: '+960', format: 'XXX XXXX', maxDigits: 7 },
  AF: { dialCode: '+93', format: 'XX XXX XXXX', maxDigits: 9 },

  // Ásia Central
  KZ: { dialCode: '+7', format: 'XXX XXX XX XX', maxDigits: 10 },
  UZ: { dialCode: '+998', format: 'XX XXX XX XX', maxDigits: 9 },
  TJ: { dialCode: '+992', format: 'XX XXX XXXX', maxDigits: 9 },
  KG: { dialCode: '+996', format: 'XXX XXX XXX', maxDigits: 9 },
  TM: { dialCode: '+993', format: 'XX XX XXXX', maxDigits: 8 },

  // Oriente Médio
  TR: { dialCode: '+90', format: 'XXX XXX XX XX', maxDigits: 10 },
  IR: { dialCode: '+98', format: 'XXX XXX XXXX', maxDigits: 10 },
  IQ: { dialCode: '+964', format: 'XXX XXX XXXX', maxDigits: 10 },
  SY: { dialCode: '+963', format: 'XXX XXX XXX', maxDigits: 9 },
  LB: { dialCode: '+961', format: 'XX XXX XXX', maxDigits: 8 },
  JO: { dialCode: '+962', format: 'X XXXX XXXX', maxDigits: 9 },
  IL: { dialCode: '+972', format: 'XX XXX XXXX', maxDigits: 9 },
  PS: { dialCode: '+970', format: 'XXX XXX XXX', maxDigits: 9 },
  SA: { dialCode: '+966', format: 'XX XXX XXXX', maxDigits: 9 },
  AE: { dialCode: '+971', format: 'XX XXX XXXX', maxDigits: 9 },
  QA: { dialCode: '+974', format: 'XXXX XXXX', maxDigits: 8 },
  BH: { dialCode: '+973', format: 'XXXX XXXX', maxDigits: 8 },
  KW: { dialCode: '+965', format: 'XXXX XXXX', maxDigits: 8 },
  OM: { dialCode: '+968', format: 'XXXX XXXX', maxDigits: 8 },
  YE: { dialCode: '+967', format: 'XXX XXX XXX', maxDigits: 9 },
  GE: { dialCode: '+995', format: 'XXX XX XX XX', maxDigits: 9 },
  AM: { dialCode: '+374', format: 'XX XXX XXX', maxDigits: 8 },
  AZ: { dialCode: '+994', format: 'XX XXX XX XX', maxDigits: 9 },
  CY: { dialCode: '+357', format: 'XX XXX XXX', maxDigits: 8 },

  // África do Norte
  EG: { dialCode: '+20', format: 'XX XXXX XXXX', maxDigits: 10 },
  LY: { dialCode: '+218', format: 'XX XXX XXXX', maxDigits: 9 },
  TN: { dialCode: '+216', format: 'XX XXX XXX', maxDigits: 8 },
  DZ: { dialCode: '+213', format: 'XXX XX XX XX', maxDigits: 9 },
  MA: { dialCode: '+212', format: 'XXX XXX XXX', maxDigits: 9 },
  SD: { dialCode: '+249', format: 'XX XXX XXXX', maxDigits: 9 },
  SS: { dialCode: '+211', format: 'XXX XXX XXX', maxDigits: 9 },

  // África Ocidental
  NG: { dialCode: '+234', format: 'XXX XXX XXXX', maxDigits: 10 },
  GH: { dialCode: '+233', format: 'XXX XXX XXX', maxDigits: 9 },
  CI: { dialCode: '+225', format: 'XX XX XX XX', maxDigits: 8 },
  SN: { dialCode: '+221', format: 'XX XXX XX XX', maxDigits: 9 },
  ML: { dialCode: '+223', format: 'XX XX XX XX', maxDigits: 8 },
  BF: { dialCode: '+226', format: 'XX XX XX XX', maxDigits: 8 },
  NE: { dialCode: '+227', format: 'XX XX XX XX', maxDigits: 8 },
  TG: { dialCode: '+228', format: 'XX XX XX XX', maxDigits: 8 },
  BJ: { dialCode: '+229', format: 'XX XX XX XX', maxDigits: 8 },
  LR: { dialCode: '+231', format: 'XXX XXX XXX', maxDigits: 9 },
  SL: { dialCode: '+232', format: 'XX XXX XXX', maxDigits: 8 },
  GN: { dialCode: '+224', format: 'XXX XXX XXX', maxDigits: 9 },
  GW: { dialCode: '+245', format: 'XXX XXXX', maxDigits: 7 },
  CV: { dialCode: '+238', format: 'XXX XX XX', maxDigits: 7 },
  GM: { dialCode: '+220', format: 'XXX XXXX', maxDigits: 7 },

  // África Oriental
  KE: { dialCode: '+254', format: 'XXX XXX XXX', maxDigits: 9 },
  TZ: { dialCode: '+255', format: 'XXX XXX XXX', maxDigits: 9 },
  UG: { dialCode: '+256', format: 'XXX XXX XXX', maxDigits: 9 },
  RW: { dialCode: '+250', format: 'XXX XXX XXX', maxDigits: 9 },
  BI: { dialCode: '+257', format: 'XX XX XX XX', maxDigits: 8 },
  ET: { dialCode: '+251', format: 'XX XXX XXXX', maxDigits: 9 },
  SO: { dialCode: '+252', format: 'XX XXX XXX', maxDigits: 8 },
  DJ: { dialCode: '+253', format: 'XX XX XX XX', maxDigits: 8 },
  ER: { dialCode: '+291', format: 'X XXX XXX', maxDigits: 7 },

  // África Austral
  ZA: { dialCode: '+27', format: 'XX XXX XXXX', maxDigits: 9 },
  ZW: { dialCode: '+263', format: 'XX XXX XXXX', maxDigits: 9 },
  BW: { dialCode: '+267', format: 'XX XXX XXX', maxDigits: 8 },
  ZM: { dialCode: '+260', format: 'XX XXX XXXX', maxDigits: 9 },
  MW: { dialCode: '+265', format: 'X XXX XXXX', maxDigits: 8 },
  MZ: { dialCode: '+258', format: 'XX XXX XXXX', maxDigits: 9 },
  NA: { dialCode: '+264', format: 'XX XXX XXXX', maxDigits: 9 },
  SZ: { dialCode: '+268', format: 'XX XX XXXX', maxDigits: 8 },
  LS: { dialCode: '+266', format: 'XX XXX XXX', maxDigits: 8 },

  // África Central
  CD: { dialCode: '+243', format: 'XXX XXX XXX', maxDigits: 9 },
  CG: { dialCode: '+242', format: 'XX XXX XXXX', maxDigits: 9 },
  CM: { dialCode: '+237', format: 'XXX XX XX XX', maxDigits: 9 },
  CF: { dialCode: '+236', format: 'XX XX XX XX', maxDigits: 8 },
  TD: { dialCode: '+235', format: 'XX XX XX XX', maxDigits: 8 },
  GA: { dialCode: '+241', format: 'X XX XX XX', maxDigits: 8 },
  GQ: { dialCode: '+240', format: 'XXX XXX XXX', maxDigits: 9 },
  ST: { dialCode: '+239', format: 'XXX XXXX', maxDigits: 7 },
  AO: { dialCode: '+244', format: 'XXX XXX XXX', maxDigits: 9 },

  // Oceania
  AU: { dialCode: '+61', format: 'XXX XXX XXX', maxDigits: 9 },
  NZ: { dialCode: '+64', format: 'XX XXX XXXX', maxDigits: 9 },
  PG: { dialCode: '+675', format: 'XXX XXXX', maxDigits: 7 },
  FJ: { dialCode: '+679', format: 'XXX XXXX', maxDigits: 7 },
  SB: { dialCode: '+677', format: 'XX XXX', maxDigits: 5 },
  VU: { dialCode: '+678', format: 'XX XXX', maxDigits: 5 },
  NC: { dialCode: '+687', format: 'XX XX XX', maxDigits: 6 },
  PF: { dialCode: '+689', format: 'XX XX XX XX', maxDigits: 8 },
  WS: { dialCode: '+685', format: 'XX XXX', maxDigits: 5 },
  TO: { dialCode: '+676', format: 'XX XXX', maxDigits: 5 },
  TV: { dialCode: '+688', format: 'XX XXX', maxDigits: 5 },
  KI: { dialCode: '+686', format: 'XX XXX', maxDigits: 5 },
  NR: { dialCode: '+674', format: 'XXX XXXX', maxDigits: 7 },
  PW: { dialCode: '+680', format: 'XXX XXXX', maxDigits: 7 },
  FM: { dialCode: '+691', format: 'XXX XXXX', maxDigits: 7 },
  MH: { dialCode: '+692', format: 'XXX XXXX', maxDigits: 7 },

  // Territórios e dependências (formatação padrão)
  GL: { dialCode: '+299', format: 'XX XX XX', maxDigits: 6 },
  FO: { dialCode: '+298', format: 'XXX XXX', maxDigits: 6 },
  GI: { dialCode: '+350', format: 'XXXX XXXX', maxDigits: 8 },
  IM: { dialCode: '+44', format: 'XXXX XXX XXX', maxDigits: 10 },
  JE: { dialCode: '+44', format: 'XXXX XXX XXX', maxDigits: 10 },
  GG: { dialCode: '+44', format: 'XXXX XXX XXX', maxDigits: 10 },
  AD: { dialCode: '+376', format: 'XXX XXX', maxDigits: 6 },
  MC: { dialCode: '+377', format: 'XX XX XX XX', maxDigits: 8 },
  SM: { dialCode: '+378', format: 'XXXX XXXXXX', maxDigits: 10 },
  VA: { dialCode: '+39', format: 'XXX XXX XXXX', maxDigits: 10 },
  LI: { dialCode: '+423', format: 'XXX XX XX', maxDigits: 7 },
  MT: { dialCode: '+356', format: 'XXXX XXXX', maxDigits: 8 },

  // Ilhas e territórios especiais
  MU: { dialCode: '+230', format: 'XXXX XXXX', maxDigits: 8 },
  SC: { dialCode: '+248', format: 'X XXX XXX', maxDigits: 7 },
  MG: { dialCode: '+261', format: 'XX XX XXX XX', maxDigits: 9 },
  KM: { dialCode: '+269', format: 'XXX XX XX', maxDigits: 7 },
  RE: { dialCode: '+262', format: 'XXX XX XX XX', maxDigits: 9 },
  YT: { dialCode: '+262', format: 'XXX XX XX XX', maxDigits: 9 },

  // Fallback para países não mapeados
  DEFAULT: { dialCode: '+1', format: 'XXX XXX XXXX', maxDigits: 10 },
};

// Função para gerar todos os países com dados de telefone
export function generateCompletePhoneCountries(): PhoneCountry[] {
  const allCountries = Country.getAllCountries();

  return allCountries
    .map((country) => {
      const phoneData =
        COUNTRY_PHONE_DATA[country.isoCode] || COUNTRY_PHONE_DATA.DEFAULT;

      return {
        code: country.isoCode,
        name: translateCountryName(country.name),
        flag: country.flag,
        dialCode: phoneData.dialCode,
        format: phoneData.format,
        maxDigits: phoneData.maxDigits,
        popular: phoneData.popular || false,
      };
    })
    .sort((a, b) => {
      // Populares primeiro, depois alfabético
      if (a.popular && !b.popular) return -1;
      if (!a.popular && b.popular) return 1;
      return a.name.localeCompare(b.name);
    });
}

// Export da lista completa
export const ALL_PHONE_COUNTRIES = generateCompletePhoneCountries();

// Função para buscar país por código
export function getPhoneCountryByCode(code: string): PhoneCountry | null {
  return ALL_PHONE_COUNTRIES.find((country) => country.code === code) || null;
}

// Função para buscar país por dial code
export function getPhoneCountryByDialCode(
  dialCode: string
): PhoneCountry | null {
  return (
    ALL_PHONE_COUNTRIES.find((country) => country.dialCode === dialCode) || null
  );
}

// Função para filtrar países por busca
export function searchPhoneCountries(searchTerm: string): PhoneCountry[] {
  if (!searchTerm) return ALL_PHONE_COUNTRIES;

  const lowerSearchTerm = searchTerm.toLowerCase();
  return ALL_PHONE_COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(lowerSearchTerm) ||
      country.dialCode.includes(lowerSearchTerm) ||
      country.code.toLowerCase().includes(lowerSearchTerm)
  );
}

console.log(`🌍 Total de países carregados: ${ALL_PHONE_COUNTRIES.length}`);
console.log(
  `🏆 Países populares: ${ALL_PHONE_COUNTRIES.filter((c) => c.popular).length}`
);
