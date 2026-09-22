import { UserRole } from '../types';

export function isSuperAdmin(role?: UserRole | string): boolean {
  return role === 'SUPER_ADMIN';
}

export function isAdminRole(role?: UserRole | string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'LIBRARY_ADMIN', 'LIBRARIAN'].includes(role ?? '');
}

export function canManageUsers(role?: UserRole | string): boolean {
  return role === 'SUPER_ADMIN';
}

export function canManageContent(role?: UserRole | string): boolean {
  return ['SUPER_ADMIN', 'ADMIN', 'LIBRARY_ADMIN'].includes(role ?? '');
}