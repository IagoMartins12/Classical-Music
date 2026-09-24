import { describe, expect, it } from 'vitest';
import { ROLE, canEditCatalog, canVerifyCatalog, isAdmin } from './permissions';

const admin = { role: 2, isTeacher: false, teacherVerified: null };
const professor = { role: 0, isTeacher: true, teacherVerified: true };
const professorPendente = { role: 0, isTeacher: true, teacherVerified: false };
const comum = { role: 0, isTeacher: false, teacherVerified: null };

/**
 * O que esta conta decide é o que aparece na tela; quem autoriza é a API. Mas
 * errar aqui oferece um botão que devolve 403 — ou esconde de quem podia usar.
 */
describe('permissões', () => {
  it('o nível 1 é professor e não é administrador', () => {
    // Enquanto a API tratava 1 como ADMIN, toda conta que o painel antigo
    // promoveu a professor abria o painel.
    expect(ROLE.TEACHER).toBe(1);
    expect(isAdmin({ role: ROLE.TEACHER })).toBe(false);
  });

  it('administrador edita e verifica', () => {
    expect(canEditCatalog(admin)).toBe(true);
    expect(canVerifyCatalog(admin)).toBe(true);
  });

  it('professor aprovado edita, mas não verifica', () => {
    expect(canEditCatalog(professor)).toBe(true);
    expect(canVerifyCatalog(professor)).toBe(false);
  });

  it('professor na fila de análise não edita', () => {
    expect(canEditCatalog(professorPendente)).toBe(false);
  });

  it('pessoa comum não edita nem verifica', () => {
    expect(canEditCatalog(comum)).toBe(false);
    expect(canVerifyCatalog(comum)).toBe(false);
  });

  it('visitante sem sessão não edita', () => {
    expect(canEditCatalog(null)).toBe(false);
    expect(canEditCatalog(undefined)).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });

  it('dizer-se professor sem aprovação não basta', () => {
    expect(canEditCatalog({ isTeacher: true })).toBe(false);
    expect(canEditCatalog({ teacherVerified: true })).toBe(false);
  });
});
