import type { IconType } from 'react-icons';
import {
  PiBookOpenText,
  PiChalkboardTeacher,
  PiGearSix,
  PiHeart,
  PiMedal,
  PiNotePencil,
  PiShieldCheck,
  PiStudent,
  PiUploadSimple,
  PiUserCircle,
} from 'react-icons/pi';
import type { HeaderCopy } from '@/app/conteudo/site/header';

/** Every destination of the header, in one place. */

export const HOME_HREF = '/';
export const PLANS_HREF = '/pricing';
export const SEARCH_HREF = '/search';

export const EXPLORE_PATHS = [
  { key: 'composers', href: '/composers' },
  { key: 'works', href: '/works' },
  { key: 'history', href: '/music-history' },
  { key: 'instruments', href: '/instruments' },
] as const satisfies readonly {
  key: keyof HeaderCopy['explorePaths'];
  href: string;
}[];

export const PRIMARY_LINKS = [
  { key: 'blog', href: '/blog' },
  { key: 'teaching', href: '/teachers' },
  { key: 'about', href: '/about-us' },
] as const satisfies readonly {
  key: 'blog' | 'teaching' | 'about';
  href: string;
}[];

/** Paths whose page already has its own search field. */
const PAGES_WITH_SEARCH = new Set(['/', '/search', '/composers', '/works']);

export const pageHasSearch = (path: string) => PAGES_WITH_SEARCH.has(path);

export const isActivePath = (path: string, href: string) =>
  href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);

export interface HeaderUser {
  role?: number | null;
  isStudent?: boolean | null;
  studentInviteStatus?: string | null;
}

export interface AccountLink {
  key: keyof HeaderCopy['accountLinks'];
  href: string;
  icon: IconType;
}

const ROLE_TEACHER = 1;
const ROLE_ADMIN = 2;

/** The personal pages, plus the portals and tools the user's role opens. */
export function accountLinks(user: HeaderUser): AccountLink[] {
  const role = user.role ?? 0;
  const links: AccountLink[] = [
    { key: 'learning', href: '/learning', icon: PiBookOpenText },
    { key: 'favorites', href: '/favorites', icon: PiHeart },
    { key: 'annotations', href: '/annotations', icon: PiNotePencil },
    { key: 'uploads', href: '/upload', icon: PiUploadSimple },
    { key: 'achievements', href: '/achievements', icon: PiMedal },
    { key: 'profile', href: '/profile', icon: PiUserCircle },
  ];
  if (role === ROLE_TEACHER) {
    links.push({ key: 'teacher', href: '/teacher', icon: PiChalkboardTeacher });
  }
  if (user.isStudent || user.studentInviteStatus) {
    links.push({ key: 'student', href: '/student', icon: PiStudent });
  }
  if (role >= ROLE_ADMIN) {
    links.push(
      { key: 'moderation', href: '/moderation', icon: PiShieldCheck },
      { key: 'admin', href: '/admin', icon: PiGearSix }
    );
  }
  return links;
}
