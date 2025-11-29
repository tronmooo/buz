import { Role } from '@prisma/client';

export const IDENTITY_LEGAL_WRITE_ROLES: Role[] = ['OWNER', 'MANAGER'];

export const canModifyIdentityLegal = (role?: Role) => {
  if (!role) return false;
  return IDENTITY_LEGAL_WRITE_ROLES.includes(role);
};
