// types/next-auth.d.ts - VERSÃO ATUALIZADA com verificação teacher/student
import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      role: number;
      onboardingCompleted: boolean;
      bio?: string | null;
      userType?:
        | 'MUSIC_STUDENT'
        | 'CASUAL_USER'
        | 'PROFESSIONAL'
        | 'TEACHER'
        | null;

      // 🆕 CAMPOS DE LOCALIZAÇÃO
      city?: string | null;
      state?: string | null;
      country?: string | null;

      // 🆕 CAMPOS DE TELEFONE
      phone?: string | null; // Telefone completo (+5511999999999)
      phoneCountryCode?: string | null; // Código do país (BR, US, etc.)
      phoneNumber?: string | null; // Apenas o número (11999999999)
      isStudent?: boolean | null;
      isTeacher?: boolean | null;

      // 🆕 CAMPOS DE VERIFICAÇÃO TEACHER/STUDENT
      teacherVerified?: boolean | null; // Se o teacher está verificado (isVerified)
      studentInviteStatus?:
        | 'PENDING'
        | 'ACCEPTED'
        | 'DECLINED'
        | 'EXPIRED'
        | null; // Status do convite do student

      // Campos existentes
      favoriteComposerId?: string | null;
      favoriteEpochId?: string | null;
      experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
      practiceTimePerWeek?: number | null;
      profilePublic: boolean;
      showLocation: boolean;
      emailVerified?: Date | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    firstName?: string | null;
    lastName?: string | null;
    role: number;
    onboardingCompleted: boolean;
    bio?: string | null;
    userType?:
      | 'MUSIC_STUDENT'
      | 'CASUAL_USER'
      | 'PROFESSIONAL'
      | 'TEACHER'
      | null;

    // 🆕 CAMPOS DE LOCALIZAÇÃO
    city?: string | null;
    state?: string | null;
    country?: string | null;

    // 🆕 CAMPOS DE TELEFONE
    phone?: string | null; // Telefone completo (+5511999999999)
    phoneCountryCode?: string | null; // Código do país (BR, US, etc.)
    phoneNumber?: string | null; // Apenas o número (11999999999)
    isStudent?: boolean | null;
    isTeacher?: boolean | null;

    // 🆕 CAMPOS DE VERIFICAÇÃO TEACHER/STUDENT
    teacherVerified?: boolean | null; // Se o teacher está verificado (isVerified)
    studentInviteStatus?:
      | 'PENDING'
      | 'ACCEPTED'
      | 'DECLINED'
      | 'EXPIRED'
      | null; // Status do convite do student

    // Campos existentes
    favoriteComposerId?: string | null;
    favoriteEpochId?: string | null;
    experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
    practiceTimePerWeek?: number | null;
    profilePublic: boolean;
    showLocation: boolean;
    emailVerified?: Date | null;
  }

  interface Profile {
    given_name?: string;
    family_name?: string;
    picture?: string;
    email_verified?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    role: number;
    onboardingCompleted: boolean;
    bio?: string | null;
    userType?:
      | 'MUSIC_STUDENT'
      | 'CASUAL_USER'
      | 'PROFESSIONAL'
      | 'TEACHER'
      | null;

    // 🆕 CAMPOS DE LOCALIZAÇÃO
    city?: string | null;
    state?: string | null;
    country?: string | null;

    // 🆕 CAMPOS DE TELEFONE
    phone?: string | null; // Telefone completo (+5511999999999)
    phoneCountryCode?: string | null; // Código do país (BR, US, etc.)
    phoneNumber?: string | null; // Apenas o número (11999999999)
    isStudent?: boolean | null;
    isTeacher?: boolean | null;

    // 🆕 CAMPOS DE VERIFICAÇÃO TEACHER/STUDENT
    teacherVerified?: boolean | null; // Se o teacher está verificado (isVerified)
    studentInviteStatus?:
      | 'PENDING'
      | 'ACCEPTED'
      | 'DECLINED'
      | 'EXPIRED'
      | null; // Status do convite do student

    // Campos existentes
    favoriteComposerId?: string | null;
    favoriteEpochId?: string | null;
    experienceLevel?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | null;
    practiceTimePerWeek?: number | null;
    profilePublic: boolean;
    showLocation: boolean;
    emailVerified?: Date | null;
  }
}
