import { describe, it, expect } from 'vitest';
import { normalizeRole, isAdmin } from './roles';

describe('Roles utility functions', () => {
  it('normalizes legacy admin role correctly', () => {
    expect(normalizeRole('admin')).toBe('ADMIN');
  });

  it('normalizes legacy cliente role correctly', () => {
    expect(normalizeRole('cliente')).toBe('USUARIO_PADRAO');
  });

  it('identifies admin users correctly', () => {
    const adminUser = { role: 'ADMIN' } as any;
    expect(isAdmin(adminUser)).toBe(true);
    
    const legacyAdmin = { role: 'admin' } as any;
    expect(isAdmin(legacyAdmin)).toBe(true);

    const customer = { role: 'cliente' } as any;
    expect(isAdmin(customer)).toBe(false);
  });
});
