/**
 * Quem pode o quê, do lado do navegador — **só para decidir o que aparece na
 * tela**. Quem autoriza de verdade é a API, em toda chamada; aqui a conta
 * serve para não oferecer um botão que vai devolver 403.
 */

export interface PessoaDaSessao {
  role?: number | null;
  isTeacher?: boolean | null;
  teacherVerified?: boolean | null;
}

/**
 * Níveis de `role` — os mesmos de `common/auth/roles.ts` na API.
 *
 * **O nível 1 é professor e não abre nada de administrativo.** No legado ele
 * marcava professor, e por um tempo a API o tratou como administrador: toda
 * conta promovida a professor pelo painel antigo abria o painel.
 */
export const ROLE = {
  USER: 0,
  TEACHER: 1,
  ADMIN: 2,
} as const;

/** Tem acesso ao painel administrativo. */
export function isAdmin(user: PessoaDaSessao | null | undefined): boolean {
  return (user?.role ?? ROLE.USER) >= ROLE.ADMIN;
}

/**
 * Pode editar compositores, obras e partituras: administrador **ou professor
 * já aprovado**.
 *
 * Ser professor é `isTeacher`, não o papel — os dois são campos separados, e
 * quem foi promovido pelo painel novo continua com `role: 0`. `teacherVerified`
 * é a aprovação manual: quem ainda está na fila de análise não edita.
 */
export function canEditCatalog(
  user: PessoaDaSessao | null | undefined
): boolean {
  if (isAdmin(user)) return true;

  return Boolean(user?.isTeacher && user?.teacherVerified);
}

/**
 * Pode marcar um registro como verificado — **só administrador**.
 *
 * O selo é o que separa o dado conferido do importado, e a API recusa o campo
 * `isVerified` de quem não é administrador.
 */
export function canVerifyCatalog(
  user: PessoaDaSessao | null | undefined
): boolean {
  return isAdmin(user);
}
