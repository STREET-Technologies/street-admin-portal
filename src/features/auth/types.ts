export type AdminRole = 'admin' | 'support' | 'viewer';

export interface AuthUser {
  email: string;
  name: string;
  adminRole: AdminRole;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
