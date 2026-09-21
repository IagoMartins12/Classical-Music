// app/types/portal.ts — enums do portal professor/aluno, como o banco os define.
//
// Espelham os enums do Prisma para o front não importar `@prisma/client`
// (Etapa 4): os valores chegam como texto pela API.

export const TeacherStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export type TeacherStatus = (typeof TeacherStatus)[keyof typeof TeacherStatus];

export const StudentInviteStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

export type StudentInviteStatus =
  (typeof StudentInviteStatus)[keyof typeof StudentInviteStatus];
