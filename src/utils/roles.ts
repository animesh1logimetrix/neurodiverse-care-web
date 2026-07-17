export const ROLES = {
  PARENT_GUARDIAN: "Parent / Guardian",
  THERAPIST: "Therapist",
  SUPER_ADMIN: "Super Admin",
} as const;

const normalizeRole = (role: string) => role.replace(/\s+/g, "").toLowerCase();

export const isParentGuardian = (roleName?: string) => {
  if (!roleName) return false;
  return normalizeRole(roleName) === normalizeRole(ROLES.PARENT_GUARDIAN);
};

export const isTherapist = (roleName?: string) => {
  if (!roleName) return false;
  return normalizeRole(roleName) === normalizeRole(ROLES.THERAPIST);
};

export const isSuperAdmin = (roleName?: string) => {
  if (!roleName) return false;
  return normalizeRole(roleName) === normalizeRole(ROLES.SUPER_ADMIN);
};

