import type { UserProfile } from '@/src/core/types/index';

// ── Normalized Role System ──────────────────────────────────────────────────
// The canonical role values used throughout the app.
// Legacy roles (lowercase: 'admin', 'confeiteiro', 'atendente', 'cliente')
// are normalized at login via `normalizeRole()`.

export type UserRole = UserProfile['role'];

/** All roles that grant access to the admin dashboard */
export const STAFF_ROLES: readonly UserRole[] = [
  'ADMIN', 'CAIXA', 'COZINHA', 'LIMPEZA', 'ATENDIMENTO',
] as const;

/** Roles with full admin privileges (config, finance, staff management) */
export const ADMIN_ROLES: readonly UserRole[] = ['ADMIN'] as const;

/** Roles that can manage kitchen (inventory, recipes) */
export const KITCHEN_ROLES: readonly UserRole[] = ['ADMIN', 'COZINHA'] as const;

/** Roles that can manage orders & customers */
export const ATENDIMENTO_ROLES: readonly UserRole[] = ['ADMIN', 'CAIXA', 'ATENDIMENTO'] as const;

/** Customer-only role */
export const CUSTOMER_ROLE: UserRole = 'USUARIO_PADRAO';

// ── Role mapping from legacy → canonical ────────────────────────────────────
const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  'admin':       'ADMIN',
  'confeiteiro': 'COZINHA',
  'atendente':   'ATENDIMENTO',
  'cliente':     'USUARIO_PADRAO',
};

/**
 * Normalizes a role from the database (which may use legacy values)
 * to the canonical uppercase system used in the app.
 */
export function normalizeRole(role: string): UserRole {
  return LEGACY_ROLE_MAP[role] || (role as UserRole);
}

/** Checks if a user has any staff/admin role */
export function isStaff(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return STAFF_ROLES.includes(normalizeRole(user.role));
}

/** Checks if a user has full admin privileges */
export function isAdmin(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return ADMIN_ROLES.includes(normalizeRole(user.role));
}

/** Checks if user can access kitchen features */
export function isKitchenStaff(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return KITCHEN_ROLES.includes(normalizeRole(user.role));
}

/** Checks if user can manage orders/customers */
export function isAtendimento(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return ATENDIMENTO_ROLES.includes(normalizeRole(user.role));
}
