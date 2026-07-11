import { useAuth } from './useAuth';
import type { AdminRole } from '../types';

export function useAdminRole() {
  const { user } = useAuth();
  // Fail closed: default to least privilege when the role is absent.
  const role: AdminRole = user?.adminRole ?? 'viewer';

  return {
    role,
    isAdmin: role === 'admin',
    isSupport: role === 'support',
    isViewer: role === 'viewer',
    canWrite: role === 'admin' || role === 'support',
    canManageAdmins: role === 'admin',
    canManageSettings: role === 'admin',
  };
}
