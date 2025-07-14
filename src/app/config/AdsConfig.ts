// 1. PUBLICIDADE PARA PROFESSOR DE PIANO - WhatsApp
export const professorPianoAd = {
  title: 'Aulas de Piano - Prof. João Silva',
  description:
    'Aulas particulares de piano para todos os níveis. 15 anos de experiência.',
  tagline: 'Aprenda piano com quem realmente entende!',
  imageUrl: '/uploads/ads/professor-joao.jpg',

  // 🔥 FUNCIONALIDADE PRINCIPAL:
  targetUrl:
    'https://wa.me/5511999887766?text=Olá! Vi seu anúncio sobre aulas de piano e gostaria de saber mais informações.',
  ctaText: 'Falar no WhatsApp',
  isExternal: true, // Abre em nova aba

  // TARGETING INTELIGENTE:
  targetType: 'INSTRUMENT',
  instrumentTargets: ['piano'],
  userLevelTargets: ['BEGINNER', 'INTERMEDIATE'],

  // POSICIONAMENTO:
  placement: 'SIDEBAR_RIGHT', // Aparece quando usuário vê peças de piano

  advertiserName: 'Prof. João Silva',
  advertiserWebsite: 'https://www.professorjoaosilva.com.br',
  advertiserPhone: '+55 11 99988-7766',
  advertiserEmail: 'contato@professorjoaosilva.com.br',
};

// 2. ESCOLA DE MÚSICA - Website com Landing Page
export const escolaMusicaAd = {
  title: 'Conservatório Mozart - Matrículas Abertas',
  description:
    'Venha fazer parte da melhor escola de música clássica de São Paulo!',
  tagline: 'Transforme sua paixão em profissão',
  imageUrl: '/uploads/ads/conservatorio-mozart.jpg',
  videoUrl: '/uploads/ads/conservatorio-video.mp4', // Vídeo promocional

  // 🔥 DIRECIONA PARA SITE:
  targetUrl:
    'https://www.conservatoriomozart.com.br/matriculas?utm_source=classical_platform&utm_campaign=sidebar_ads',
  ctaText: 'Inscreva-se Agora',
  isExternal: true,

  targetType: 'GENERAL', // Para todos os usuários
  placement: 'CONTENT_TOP', // Aparece no topo das páginas de obras

  advertiserName: 'Conservatório Mozart',
  advertiserWebsite: 'https://www.conservatoriomozart.com.br',
};

// 3. LOJA DE INSTRUMENTOS - E-commerce
export const lojaInstrumentosAd = {
  title: 'Pianika Store - Pianos Steinway em Promoção',
  description:
    'Os melhores pianos do mundo com condições especiais. Financiamento em até 48x.',
  imageUrl: '/uploads/ads/piano-steinway.jpg',

  // 🔥 DIRECIONA PARA LOJA:
  targetUrl:
    'https://www.pianikastore.com.br/pianos-steinway?ref=classical_ads&discount=CLASSICAL10',
  ctaText: 'Ver Ofertas',
  isExternal: true,

  // TARGETING ESPECÍFICO PARA COMPOSITORES DE PIANO:
  targetType: 'COMPOSER',
  composerTargets: ['chopin', 'liszt', 'rachmaninoff', 'debussy'],
  placement: 'BETWEEN_CONTENT',

  advertiserName: 'Pianika Store',
  customCSS: `
      .ad-item {
        border: 2px solid #f39c12;
        box-shadow: 0 4px 15px rgba(243, 156, 18, 0.3);
      }
    `,
};

// 4. PROFESSOR PARTICULAR - Formulário de Contato
export const professorViolinoAd = {
  title: 'Mestre em Violino - Aulas Individuais',
  description:
    'Formado pela Juilliard School. Prepare-se para concursos e apresentações.',

  // 🔥 DIRECIONA PARA FORMULÁRIO:
  targetUrl: 'https://forms.gle/abc123xyz789?entry.name=classical_platform',
  ctaText: 'Agendar Aula Experimental',
  isExternal: true,

  targetType: 'INSTRUMENT',
  instrumentTargets: ['violin'],
  userLevelTargets: ['INTERMEDIATE', 'ADVANCED'],
  placement: 'SIDEBAR_RIGHT',

  advertiserName: 'Prof. Maria Fernanda',
  geoTargets: [
    { country: 'Brazil', state: 'SP', city: 'São Paulo' },
    { country: 'Brazil', state: 'RJ', city: 'Rio de Janeiro' },
  ],
};

// 5. CURSO ONLINE - Plataforma de Ensino
export const cursoOnlineAd = {
  title: 'Master Class Online: Bach para Iniciantes',
  description:
    'Aprenda as obras mais famosas de Bach com metodologia exclusiva.',
  videoUrl: '/uploads/ads/bach-masterclass-preview.mp4',

  // 🔥 DIRECIONA PARA PLATAFORMA:
  targetUrl:
    'https://www.musicamasterclass.com.br/bach-iniciantes?coupon=CLASSICAL20',
  ctaText: 'Começar Agora - 20% OFF',
  isExternal: true,

  targetType: 'COMPOSER',
  composerTargets: ['bach'],
  userLevelTargets: ['BEGINNER'],
  placement: 'MODAL', // Modal popup

  advertiserName: 'Música Master Class',
};

// 6. LUTHIER - Manutenção de Instrumentos
export const luthierAd = {
  title: 'Luthier Especializado - Restauração de Violinos',
  description: 'Mais de 30 anos restaurando instrumentos históricos.',

  // 🔥 MÚLTIPLAS OPÇÕES DE CONTATO:
  targetUrl: 'https://www.luthiersilva.com.br/orcamento',
  ctaText: 'Solicitar Orçamento',
  isExternal: true,

  // Dados extras para múltiplos contatos:
  advertiserPhone: '+55 11 3456-7890',
  advertiserEmail: 'contato@luthiersilva.com.br',
  advertiserWebsite: 'https://www.luthiersilva.com.br',

  targetType: 'INSTRUMENT',
  instrumentTargets: ['violin', 'viola', 'cello'],
  placement: 'FOOTER',
};
