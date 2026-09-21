// app/requests/portal/profile-actions.ts — edição dos perfis do portal pela API (Etapa 4)
//
// Uma rota só (`PATCH /profile`), com blocos: `account` (dados da conta),
// `teacher` e `student` (perfis do portal). Depois de gravar, relê o perfil
// no formato do legado. Foto, senha e e-mail têm rotas próprias.
import { apiFetch } from '@/app/libs/api/client';
import type { TeacherProfileData } from '../../(teacher)/teacher/profile/pageServer';
import { loadStudentProfile, type StudentProfile } from './student';
import { loadTeacherProfile } from './teacher';

type Fields = Record<string, any>;

const ACCOUNT_FIELDS = [
  'firstName',
  'lastName',
  'phone',
  'city',
  'state',
  'country',
  'experienceLevel',
] as const;

const STUDENT_FIELDS = [
  'level',
  'mainInstrument',
  'musicalGoals',
  'preferredGenres',
  'musicalBackground',
  'allowPublicProgress',
  'allowProgressShare',
  'allowWhatsappMensage',
  'profileVisibility',
  'practiceTime',
  'practiceSchedule',
  'learningPace',
  'specialNeeds',
  'preferredContact',
  'reminderPreferences',
] as const;

const TEACHER_FIELDS = [
  'bio',
  'publicBio',
  'specialties',
  'instruments',
  'ageGroups',
  'skillLevels',
  'highlightedWorks',
  'experience',
  'education',
  'achievements',
  'teachingMethod',
  'isPublicProfile',
  'allowProgressReports',
  'website',
  'socialMedia',
  'defaultLessonDuration',
  'maxStudentsPerWeek',
  'timezone',
  'reportPreferences',
] as const;

/** Campos de valor fechado (enum, URL): texto vazio não é valor, é "não mexer". */
const EMPTY_MEANS_UNSET = new Set([
  'experienceLevel',
  'level',
  'profileVisibility',
  'learningPace',
  'preferredContact',
  'website',
  'timezone',
]);

function pick(data: Fields | undefined, keys: readonly string[]): Fields {
  if (!data) return {};

  return Object.fromEntries(
    keys
      .filter((key) => {
        const value = data[key];
        if (value === undefined || value === null) return false;
        return !(value === '' && EMPTY_MEANS_UNSET.has(key));
      })
      .map((key) => [key, data[key]])
  );
}

async function patchProfile(blocks: Record<string, Fields>) {
  const body = Object.fromEntries(
    Object.entries(blocks).filter(([, block]) => Object.keys(block).length > 0)
  );

  // Corpo vazio a API recusa; nada mudou, nada a gravar.
  if (Object.keys(body).length > 0) {
    await apiFetch('/profile', { method: 'PATCH', body });
  }
}

export async function saveTeacherProfile(data: {
  account?: Fields;
  teacher?: Fields;
}): Promise<TeacherProfileData> {
  await patchProfile({
    account: pick(data.account, ACCOUNT_FIELDS),
    teacher: pick(data.teacher, TEACHER_FIELDS),
  });

  const profile = await loadTeacherProfile();

  if (!profile) {
    throw new Error('Perfil de professor não encontrado');
  }

  return profile;
}

export async function saveStudentProfile(updates: {
  userData?: Fields;
  studentData?: Fields;
}): Promise<StudentProfile> {
  await patchProfile({
    account: pick(updates.userData, ACCOUNT_FIELDS),
    student: pick(updates.studentData, STUDENT_FIELDS),
  });

  const data = await loadStudentProfile();

  if (!data) {
    throw new Error('Perfil de aluno não encontrado');
  }

  return data.profile;
}

/**
 * Um campo do perfil do aluno, como o legado fazia (`set`, ou `add`/`remove`
 * em listas). A lista nova é montada aqui e gravada inteira.
 */
export async function updateStudentField(
  current: StudentProfile | null,
  field: string,
  value: unknown,
  action: 'set' | 'add' | 'remove' = 'set'
): Promise<StudentProfile> {
  const isStudentField = (STUDENT_FIELDS as readonly string[]).includes(field);
  const isAccountField = (ACCOUNT_FIELDS as readonly string[]).includes(field);

  if (!isStudentField && !isAccountField) {
    throw new Error(`O campo "${field}" não pode ser editado aqui`);
  }

  const currentValue = isStudentField
    ? (current as Fields | null)?.[field]
    : (current?.user as Fields | undefined)?.[field];

  let next = value;

  if (action !== 'set') {
    const list: unknown[] = Array.isArray(currentValue) ? currentValue : [];
    const items = Array.isArray(value) ? value : [value];

    next =
      action === 'add'
        ? [...new Set([...list, ...items])]
        : list.filter((item) => !items.includes(item));
  }

  return saveStudentProfile(
    isStudentField
      ? { studentData: { [field]: next } }
      : { userData: { [field]: next } }
  );
}
