export interface DisplayableUser {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  image?: string | null;
}

/** "Marina Duarte", or "Marina", or the e-mail's local part. */
export function displayName(user: DisplayableUser | null | undefined) {
  if (!user) return '';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ');
  return full || user.email?.split('@')[0] || '';
}
