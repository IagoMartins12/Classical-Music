import type { Idioma } from '../legal/tipos';
import type { StudyHorizon } from '@/app/libs/api/profile';

type UserType = 'MUSIC_STUDENT' | 'PROFESSIONAL' | 'TEACHER' | 'CASUAL_USER';
type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

/** Minutes per week, as the profile stores them. */
export const PRACTICE_MINUTES = [0, 60, 120, 300, 600, 900, 1200] as const;
export const STUDY_HORIZONS: readonly StudyHorizon[] = [
  'MONTHS',
  'YEAR',
  'YEARS',
  'LIFE',
];

/** Copy for the welcome questions shown after sign-up. */
const pt = {
  step: (n: number, total: number) => `${n} de ${total}`,
  back: 'Voltar',
  next: 'Continuar',
  skip: 'Pular',
  finish: 'Concluir',
  later: 'Responder depois',
  loadError: 'Não foi possível carregar as opções.',
  retry: 'Tentar de novo',
  saveError: 'Não foi possível salvar. Tente de novo.',
  greeting: (name: string) =>
    name ? `Boas-vindas ao Opus Atlas, ${name}.` : 'Boas-vindas ao Opus Atlas.',
  close: 'Fechar as boas-vindas',
  steps: ['Você', 'Instrumentos', 'Estudo', 'Gostos', 'Perfil'],
  preview: {
    title: 'Seu Opus Atlas, até agora',
    label: 'Prévia das suas respostas',
    noName: 'Seu nome',
    instruments: 'Instrumentos',
    era: 'Época',
    composer: 'Compositor preferido',
    empty: 'Ainda não',
  },
  you: {
    title: 'Quem é você na música?',
    text: 'Isso muda o que o Opus Atlas sugere primeiro. Dá para trocar depois no perfil.',
    types: {
      MUSIC_STUDENT: [
        'Estudo música',
        'Com professor, sozinho ou começando agora.',
      ],
      PROFESSIONAL: [
        'Vivo de música',
        'Toco, canto, rejo ou componho por ofício.',
      ],
      TEACHER: ['Dou aulas', 'Ensino instrumento, canto ou teoria.'],
      CASUAL_USER: ['Gosto de ouvir', 'Quero conhecer obras e compositores.'],
    } as Record<UserType, [string, string]>,
  },
  instruments: {
    title: 'O que você toca?',
    text: 'Marque quantos quiser. A estrela indica o principal.',
    none: 'Se não toca nenhum, siga em frente.',
    primary: 'Instrumento principal',
    makePrimary: (name: string) => `Tornar ${name} o principal`,
    learning: 'Ainda estou aprendendo',
    remove: (name: string) => `Tirar ${name}`,
  },
  study: {
    title: 'Como você estuda?',
    text: 'Serve para sugerir obras do seu tamanho, nem fáceis demais nem impossíveis.',
    level: 'Seu nível',
    practice: 'Tempo de prática por semana',
    minutes: (m: number) =>
      m === 0
        ? 'Não pratico'
        : m >= 1200
          ? '20 horas ou mais'
          : m === 60
            ? '1 hora'
            : `${m / 60} horas`,
    horizon: 'Por quanto tempo pretende estudar?',
    horizons: {
      MONTHS: 'Alguns meses',
      YEAR: 'Um ano',
      YEARS: 'Alguns anos',
      LIFE: 'A vida toda',
    } as Record<StudyHorizon, string>,
  },
  levels: {
    BEGINNER: 'Iniciante',
    INTERMEDIATE: 'Intermediário',
    ADVANCED: 'Avançado',
  } as Record<Level, string>,
  taste: {
    title: 'O que você gosta de ouvir?',
    text: 'Escolha uma época e, se quiser, um compositor. A página inicial começa por eles.',
    era: 'Época preferida',
    composer: 'Compositor preferido',
    allComposers: 'Ver de todas as épocas',
    search: 'Não está aqui? Busque pelo nome',
    searchPlaceholder: 'Nome do compositor',
    searchEmpty: 'Nenhum compositor com esse nome',
  },
  profile: {
    title: 'Seu perfil',
    text: 'Tudo aqui é opcional. O que você preencher aparece para alunos, professores e outros músicos, conforme a privacidade abaixo.',
    photo: 'Foto',
    photoSaved: 'Foto salva.',
    photoError: 'Não foi possível enviar a foto.',
    firstName: 'Nome',
    lastName: 'Sobrenome',
    bio: 'Sobre você',
    bioHelp: 'Onde estudou, o que está tocando, com quem gostaria de tocar.',
    location: 'Onde você mora',
    phone: 'Telefone',
    phoneHelp: 'Só para os avisos do portal de aulas. Não aparece no perfil.',
    privacy: 'Privacidade',
    public: 'Perfil público',
    publicHelp: 'Outras pessoas veem seu nome, foto e instrumentos.',
    showLocation: 'Mostrar a cidade no perfil',
  },
  prompt: {
    title: 'Faltam as boas-vindas',
    text: 'Algumas perguntas rápidas deixam as sugestões do seu jeito. O que você já respondeu está guardado.',
    start: 'Continuar agora',
    later: 'Depois',
    close: 'Fechar o aviso',
  },
  done: {
    title: (name: string) => (name ? `Tudo pronto, ${name}` : 'Tudo pronto'),
    text: 'Suas respostas já valem para as sugestões. Mudou de ideia? O perfil guarda tudo isso.',
    start: 'Começar',
    profile: 'Abrir o perfil',
  },
};

const en: typeof pt = {
  step: (n, total) => `${n} of ${total}`,
  back: 'Back',
  next: 'Continue',
  skip: 'Skip',
  finish: 'Finish',
  later: 'Answer later',
  loadError: 'Could not load the options.',
  retry: 'Try again',
  saveError: 'Could not save. Try again.',
  greeting: (name: string) =>
    name ? `Welcome to Opus Atlas, ${name}.` : 'Welcome to Opus Atlas.',
  close: 'Close the welcome',
  steps: ['You', 'Instruments', 'Practice', 'Taste', 'Profile'],
  preview: {
    title: 'Your Opus Atlas so far',
    label: 'Preview of your answers',
    noName: 'Your name',
    instruments: 'Instruments',
    era: 'Era',
    composer: 'Favorite composer',
    empty: 'Not yet',
  },
  you: {
    title: 'Who are you in music?',
    text: 'It changes what Opus Atlas suggests first. You can change it later in your profile.',
    types: {
      MUSIC_STUDENT: [
        'I study music',
        'With a teacher, on my own or just starting.',
      ],
      PROFESSIONAL: [
        'Music is my job',
        'I play, sing, conduct or compose for a living.',
      ],
      TEACHER: ['I teach', 'Instrument, voice or theory.'],
      CASUAL_USER: [
        'I love listening',
        'I want to discover works and composers.',
      ],
    },
  },
  instruments: {
    title: 'What do you play?',
    text: 'Pick as many as you like. The star marks your main one.',
    none: 'If you do not play any, just carry on.',
    primary: 'Main instrument',
    makePrimary: (name) => `Make ${name} your main instrument`,
    learning: 'Still learning it',
    remove: (name) => `Remove ${name}`,
  },
  study: {
    title: 'How do you study?',
    text: 'It helps us suggest works your size: not too easy, not out of reach.',
    level: 'Your level',
    practice: 'Practice time per week',
    minutes: (m) =>
      m === 0
        ? 'I do not practice'
        : m >= 1200
          ? '20 hours or more'
          : m === 60
            ? '1 hour'
            : `${m / 60} hours`,
    horizon: 'How long do you plan to study?',
    horizons: {
      MONTHS: 'A few months',
      YEAR: 'A year',
      YEARS: 'A few years',
      LIFE: 'For life',
    },
  },
  levels: {
    BEGINNER: 'Beginner',
    INTERMEDIATE: 'Intermediate',
    ADVANCED: 'Advanced',
  },
  taste: {
    title: 'What do you like to hear?',
    text: 'Pick an era and, if you like, a composer. The home page starts with them.',
    era: 'Favorite era',
    composer: 'Favorite composer',
    allComposers: 'Show every era',
    search: 'Not here? Search by name',
    searchPlaceholder: 'Composer’s name',
    searchEmpty: 'No composer by that name',
  },
  profile: {
    title: 'Your profile',
    text: 'Everything here is optional. What you fill in shows to students, teachers and other musicians, as the privacy settings below allow.',
    photo: 'Photo',
    photoSaved: 'Photo saved.',
    photoError: 'Could not upload the photo.',
    firstName: 'First name',
    lastName: 'Last name',
    bio: 'About you',
    bioHelp:
      'Where you studied, what you are playing, who you would like to play with.',
    location: 'Where you live',
    phone: 'Phone',
    phoneHelp:
      'Only for lesson portal notices. It does not show on your profile.',
    privacy: 'Privacy',
    public: 'Public profile',
    publicHelp: 'Others see your name, photo and instruments.',
    showLocation: 'Show my city on the profile',
  },
  prompt: {
    title: 'Finish the welcome questions',
    text: 'A few quick questions make the suggestions yours. What you already answered is saved.',
    start: 'Continue now',
    later: 'Later',
    close: 'Close the notice',
  },
  done: {
    title: (name) => (name ? `All set, ${name}` : 'All set'),
    text: 'Your answers already shape the suggestions. Changed your mind? Your profile keeps all of this.',
    start: 'Get started',
    profile: 'Open your profile',
  },
};

export const WELCOME: Record<Idioma, typeof pt> = { pt, en };
export type WelcomeCopy = typeof pt;
