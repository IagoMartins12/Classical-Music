// utils/nationalityFlags.ts - Mapeamento de nacionalidades para bandeiras

interface NationalityFlag {
  flag: string; // Emoji da bandeira
  countryCode: string; // Código ISO do país (para APIs de bandeiras)
  countryName: string; // Nome do país em português
  originalName: string; // Nome original em inglês
}

// Mapeamento completo das 19 principais nacionalidades
const NATIONALITY_FLAGS: Record<string, NationalityFlag> = {
  // Alemã/German
  alemã: {
    flag: '🇩🇪',
    countryCode: 'DE',
    countryName: 'Alemanha',
    originalName: 'German',
  },
  german: {
    flag: '🇩🇪',
    countryCode: 'DE',
    countryName: 'Alemanha',
    originalName: 'German',
  },

  // Americana/American
  americana: {
    flag: '🇺🇸',
    countryCode: 'US',
    countryName: 'Estados Unidos',
    originalName: 'American',
  },
  american: {
    flag: '🇺🇸',
    countryCode: 'US',
    countryName: 'Estados Unidos',
    originalName: 'American',
  },

  // Francesa/French
  francesa: {
    flag: '🇫🇷',
    countryCode: 'FR',
    countryName: 'França',
    originalName: 'French',
  },
  french: {
    flag: '🇫🇷',
    countryCode: 'FR',
    countryName: 'França',
    originalName: 'French',
  },

  // Inglesa/English
  inglesa: {
    flag: '🇬🇧',
    countryCode: 'GB',
    countryName: 'Reino Unido',
    originalName: 'English',
  },
  english: {
    flag: '🇬🇧',
    countryCode: 'GB',
    countryName: 'Reino Unido',
    originalName: 'English',
  },
  britânica: {
    flag: '🇬🇧',
    countryCode: 'GB',
    countryName: 'Reino Unido',
    originalName: 'British',
  },
  british: {
    flag: '🇬🇧',
    countryCode: 'GB',
    countryName: 'Reino Unido',
    originalName: 'British',
  },

  // Italiana/Italian
  italiana: {
    flag: '🇮🇹',
    countryCode: 'IT',
    countryName: 'Itália',
    originalName: 'Italian',
  },
  italian: {
    flag: '🇮🇹',
    countryCode: 'IT',
    countryName: 'Itália',
    originalName: 'Italian',
  },

  // Austríaca/Austrian
  austríaca: {
    flag: '🇦🇹',
    countryCode: 'AT',
    countryName: 'Áustria',
    originalName: 'Austrian',
  },
  austriaca: {
    flag: '🇦🇹',
    countryCode: 'AT',
    countryName: 'Áustria',
    originalName: 'Austrian',
  },
  austrian: {
    flag: '🇦🇹',
    countryCode: 'AT',
    countryName: 'Áustria',
    originalName: 'Austrian',
  },

  // Russa/Russian
  russa: {
    flag: '🇷🇺',
    countryCode: 'RU',
    countryName: 'Rússia',
    originalName: 'Russian',
  },
  russian: {
    flag: '🇷🇺',
    countryCode: 'RU',
    countryName: 'Rússia',
    originalName: 'Russian',
  },
  soviética: {
    flag: '🇷🇺',
    countryCode: 'RU',
    countryName: 'União Soviética',
    originalName: 'Soviet',
  },
  soviet: {
    flag: '🇷🇺',
    countryCode: 'RU',
    countryName: 'União Soviética',
    originalName: 'Soviet',
  },

  // Brasileira/Brazilian
  brasileira: {
    flag: '🇧🇷',
    countryCode: 'BR',
    countryName: 'Brasil',
    originalName: 'Brazilian',
  },
  brazilian: {
    flag: '🇧🇷',
    countryCode: 'BR',
    countryName: 'Brasil',
    originalName: 'Brazilian',
  },

  // Polonesa/Polish
  polonesa: {
    flag: '🇵🇱',
    countryCode: 'PL',
    countryName: 'Polônia',
    originalName: 'Polish',
  },
  polish: {
    flag: '🇵🇱',
    countryCode: 'PL',
    countryName: 'Polônia',
    originalName: 'Polish',
  },

  // Espanhola/Spanish
  espanhola: {
    flag: '🇪🇸',
    countryCode: 'ES',
    countryName: 'Espanha',
    originalName: 'Spanish',
  },
  spanish: {
    flag: '🇪🇸',
    countryCode: 'ES',
    countryName: 'Espanha',
    originalName: 'Spanish',
  },

  // Belga/Belgian
  belga: {
    flag: '🇧🇪',
    countryCode: 'BE',
    countryName: 'Bélgica',
    originalName: 'Belgian',
  },
  belgian: {
    flag: '🇧🇪',
    countryCode: 'BE',
    countryName: 'Bélgica',
    originalName: 'Belgian',
  },

  // Dinamarquesa/Danish
  dinamarquesa: {
    flag: '🇩🇰',
    countryCode: 'DK',
    countryName: 'Dinamarca',
    originalName: 'Danish',
  },
  danish: {
    flag: '🇩🇰',
    countryCode: 'DK',
    countryName: 'Dinamarca',
    originalName: 'Danish',
  },

  // Tcheca/Czech
  tcheca: {
    flag: '🇨🇿',
    countryCode: 'CZ',
    countryName: 'República Tcheca',
    originalName: 'Czech',
  },
  czech: {
    flag: '🇨🇿',
    countryCode: 'CZ',
    countryName: 'República Tcheca',
    originalName: 'Czech',
  },
  tchecoslovaca: {
    flag: '🇨🇿',
    countryCode: 'CZ',
    countryName: 'Tchecoslováquia',
    originalName: 'Czechoslovak',
  },
  czechoslovak: {
    flag: '🇨🇿',
    countryCode: 'CZ',
    countryName: 'Tchecoslováquia',
    originalName: 'Czechoslovak',
  },

  // Holandesa/Dutch
  holandesa: {
    flag: '🇳🇱',
    countryCode: 'NL',
    countryName: 'Países Baixos',
    originalName: 'Dutch',
  },
  dutch: {
    flag: '🇳🇱',
    countryCode: 'NL',
    countryName: 'Países Baixos',
    originalName: 'Dutch',
  },

  // Húngara/Hungarian
  húngara: {
    flag: '🇭🇺',
    countryCode: 'HU',
    countryName: 'Hungria',
    originalName: 'Hungarian',
  },
  hungara: {
    flag: '🇭🇺',
    countryCode: 'HU',
    countryName: 'Hungria',
    originalName: 'Hungarian',
  },
  hungarian: {
    flag: '🇭🇺',
    countryCode: 'HU',
    countryName: 'Hungria',
    originalName: 'Hungarian',
  },

  // Sueca/Swedish
  sueca: {
    flag: '🇸🇪',
    countryCode: 'SE',
    countryName: 'Suécia',
    originalName: 'Swedish',
  },
  swedish: {
    flag: '🇸🇪',
    countryCode: 'SE',
    countryName: 'Suécia',
    originalName: 'Swedish',
  },

  // Suíça/Swiss
  suíça: {
    flag: '🇨🇭',
    countryCode: 'CH',
    countryName: 'Suíça',
    originalName: 'Swiss',
  },
  suica: {
    flag: '🇨🇭',
    countryCode: 'CH',
    countryName: 'Suíça',
    originalName: 'Swiss',
  },
  swiss: {
    flag: '🇨🇭',
    countryCode: 'CH',
    countryName: 'Suíça',
    originalName: 'Swiss',
  },

  // Norueguesa/Norwegian
  norueguesa: {
    flag: '🇳🇴',
    countryCode: 'NO',
    countryName: 'Noruega',
    originalName: 'Norwegian',
  },
  norwegian: {
    flag: '🇳🇴',
    countryCode: 'NO',
    countryName: 'Noruega',
    originalName: 'Norwegian',
  },

  // Finlandesa/Finnish
  finlandesa: {
    flag: '🇫🇮',
    countryCode: 'FI',
    countryName: 'Finlândia',
    originalName: 'Finnish',
  },
  finnish: {
    flag: '🇫🇮',
    countryCode: 'FI',
    countryName: 'Finlândia',
    originalName: 'Finnish',
  },
};

// Função principal para obter informações da bandeira
export function getNationalityFlag(
  nationality: string
): NationalityFlag | null {
  if (!nationality) return null;

  const normalizedNationality = nationality.toLowerCase().trim();
  return NATIONALITY_FLAGS[normalizedNationality] || null;
}

// Função para obter apenas o emoji da bandeira
export function getFlagEmoji(nationality: string): string {
  const flagInfo = getNationalityFlag(nationality);
  return flagInfo?.flag || '🏳️'; // Bandeira branca como fallback
}

// Função para obter código do país (útil para APIs de bandeiras)
export function getCountryCode(nationality: string): string | null {
  const flagInfo = getNationalityFlag(nationality);
  return flagInfo?.countryCode || null;
}

// Função para obter nome do país em português
export function getCountryName(nationality: string): string | null {
  const flagInfo = getNationalityFlag(nationality);
  return flagInfo?.countryName || null;
}

// Função para obter todas as nacionalidades disponíveis
export function getAllNationalities(): string[] {
  return Object.keys(NATIONALITY_FLAGS);
}

// Função para obter as 19 principais nacionalidades (em português)
export function getTop19Nationalities(): NationalityFlag[] {
  const mainNationalities = [
    'alemã',
    'americana',
    'francesa',
    'inglesa',
    'italiana',
    'austríaca',
    'russa',
    'brasileira',
    'polonesa',
    'espanhola',
    'belga',
    'dinamarquesa',
    'tcheca',
    'holandesa',
    'húngara',
    'sueca',
    'suíça',
    'norueguesa',
    'finlandesa',
  ];

  return mainNationalities
    .map((nationality) => getNationalityFlag(nationality))
    .filter((flag): flag is NationalityFlag => flag !== null);
}

// Hook React para usar com o componente
export function useNationalityFlag(nationality: string) {
  const flagInfo = getNationalityFlag(nationality);

  return {
    flag: flagInfo?.flag || '🏳️',
    countryCode: flagInfo?.countryCode || null,
    countryName: flagInfo?.countryName || nationality,
    originalName: flagInfo?.originalName || nationality,
    isValid: flagInfo !== null,
  };
}

// Componente React para exibir bandeira
interface FlagComponentProps {
  nationality: string;
  size?: 'sm' | 'md' | 'lg';
  showCountryName?: boolean;
  className?: string;
}

export function FlagComponent({
  nationality,
  size = 'md',
  showCountryName = false,
  className = '',
}: FlagComponentProps) {
  const { flag, countryName, isValid } = useNationalityFlag(nationality);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  if (!isValid) {
    return (
      <span className={`inline-flex items-center space-x-1 ${className}`}>
        <span className={`${sizeClasses[size]} opacity-50`}>🏳️</span>
        {showCountryName && (
          <span className="text-theme-tertiary text-sm">{nationality}</span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center space-x-2 ${className}`}>
      <span
        className={`${sizeClasses[size]} transition-transform hover:scale-110`}
      >
        {flag}
      </span>
      {showCountryName && (
        <span className="text-theme-primary text-sm font-medium">
          {countryName}
        </span>
      )}
    </span>
  );
}

// Função para usar no componente ComposerDetailsClient
export function getComposerNationalityDisplay(nationality: string): {
  flag: string;
  countryName: string;
  formattedDisplay: string;
} {
  const flagInfo = getNationalityFlag(nationality);

  if (!flagInfo) {
    return {
      flag: '🏳️',
      countryName: nationality || 'Desconhecida',
      formattedDisplay: nationality || 'Nacionalidade desconhecida',
    };
  }

  return {
    flag: flagInfo.flag,
    countryName: flagInfo.countryName,
    formattedDisplay: `${flagInfo.flag} ${flagInfo.countryName}`,
  };
}

export default {
  getNationalityFlag,
  getFlagEmoji,
  getCountryCode,
  getCountryName,
  getAllNationalities,
  getTop19Nationalities,
  useNationalityFlag,
  FlagComponent,
  getComposerNationalityDisplay,
};
